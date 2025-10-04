"use server";

import { PinataSDK } from "pinata";
import envConfig from "@/config/env-config";
import { getIPFSFileURL } from "@/lib/ipfs-utils";

// Server-only Pinata instance - JWT token is protected
const pinataServer = new PinataSDK({
  pinataJwt: envConfig.NEXT_PUBLIC_PINATA_JWT,
  pinataGateway: envConfig.NEXT_PUBLIC_PINATA_GATEWAY,
});

// Helper function to get pinata instance (for internal use)
async function getPinataServer() {
  return pinataServer;
}

// Helper function to create signed upload URLs
export async function createSignedUploadURL(options?: {
  expires?: number; // seconds, default 30
}) {
  try {
    const signedURL = await pinataServer.upload.public.createSignedURL({
      expires: options?.expires || 30,
    });

    return {
      url: signedURL,
      expires: options?.expires || 30,
    };
  } catch (error) {
    throw new Error("Failed to create signed upload URL");
  }
}

// Helper function to upload files directly on server
export async function uploadFileToIPFS(
  file: File,
  metadata?: {
    name?: string;
    keyvalues?: Record<string, string>;
  }
) {
  try {
    // Use chaining API for metadata
    let uploadQuery = pinataServer.upload.public.file(file);

    if (metadata?.name) {
      uploadQuery = uploadQuery.name(metadata.name);
    } else {
      uploadQuery = uploadQuery.name(file.name);
    }

    if (metadata?.keyvalues) {
      // Ensure all keyvalues are strings
      const stringKeyvalues: Record<string, string> = {};
      for (const [key, value] of Object.entries(metadata.keyvalues)) {
        stringKeyvalues[key] = String(value);
      }

      uploadQuery = uploadQuery.keyvalues({
        type: "file",
        uploadedAt: new Date().toISOString(),
        ...stringKeyvalues,
      });
    }

    const uploadResult = await uploadQuery;

    return {
      cid: uploadResult.cid,
      size: uploadResult.size,
      createdAt: uploadResult.created_at,
      url: getIPFSFileURL(uploadResult.cid),
    };
  } catch (error) {
    throw new Error("Failed to upload file to IPFS");
  }
}

// Helper function to upload JSON data directly on server
export async function uploadJSONToIPFS(
  data: any,
  metadata?: {
    name?: string;
    keyvalues?: Record<string, string>;
  }
) {
  try {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const file = new File([blob], metadata?.name || "data.json", {
      type: "application/json",
    });

    // Use chaining API for metadata
    let uploadQuery = pinataServer.upload.public.file(file);

    if (metadata?.name) {
      uploadQuery = uploadQuery.name(metadata.name);
    }

    if (metadata?.keyvalues) {
      // Ensure all keyvalues are strings
      const stringKeyvalues: Record<string, string> = {};
      for (const [key, value] of Object.entries(metadata.keyvalues)) {
        stringKeyvalues[key] = String(value);
      }

      uploadQuery = uploadQuery.keyvalues({
        type: "json",
        uploadedAt: new Date().toISOString(),
        ...stringKeyvalues,
      });
    }

    if (envConfig.NEXT_PUBLIC_PINATA_GROUP_ID) {
      uploadQuery = uploadQuery.group(envConfig.NEXT_PUBLIC_PINATA_GROUP_ID);
    }

    const uploadResult = await uploadQuery;

    return {
      id: uploadResult.id,
      cid: uploadResult.cid,
      name: uploadResult.name,
      size: uploadResult.size,
      mimeType: uploadResult.mime_type,
      createdAt: uploadResult.created_at,
      url: getIPFSFileURL(uploadResult.cid),
      data: data, // Include original data for reference
    };
  } catch (error) {
    throw new Error("Failed to upload JSON to IPFS");
  }
}

// Helper function to update existing file on Pinata with enhanced retry logic
export async function updateIPFSFile(
  fileId: string,
  newData: any,
  metadata?: {
    keyvalues?: Record<string, string>;
  }
) {
  const maxRetries = 5; // Increased retries
  let attempt = 0;
  const baseDelay = 1000; // 1 second base delay

  while (attempt < maxRetries) {
    try {
      // Exponential backoff with jitter
      if (attempt > 0) {
        const exponentialDelay = Math.pow(2, attempt - 1) * baseDelay;
        const jitter = Math.random() * 0.3 * exponentialDelay; // 30% jitter
        const totalDelay = exponentialDelay + jitter;
        await new Promise((resolve) => setTimeout(resolve, totalDelay));
      }

      // Clean keyvalues - remove any undefined or null values and ensure all values are strings
      const cleanKeyvalues: Record<string, string> = {};
      if (metadata?.keyvalues) {
        Object.entries(metadata.keyvalues).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            cleanKeyvalues[key] = String(value);
          }
        });
      }

      // Always add updatedAt with microsecond precision
      cleanKeyvalues.updatedAt = new Date().toISOString();
      cleanKeyvalues.updateAttempt = String(attempt + 1);
      cleanKeyvalues.lastAttemptAt = new Date().toISOString();

      // Update keyvalues to mark as updated
      const keyvalueUpdate = await pinataServer.files.public.update({
        id: fileId,
        keyvalues: cleanKeyvalues,
      });

      return {
        id: fileId,
        cid: keyvalueUpdate.cid,
        success: true,
        url: getIPFSFileURL(keyvalueUpdate.cid),
        attempts: attempt + 1,
      };
    } catch (error: any) {
      attempt++;

      // Don't retry on certain errors
      if (error.message?.includes("not found") || error.status === 404) {
        throw new Error(`File not found: ${error.message}`);
      }

      if (error.message?.includes("unauthorized") || error.status === 401) {
        throw new Error(`Unauthorized: ${error.message}`);
      }

      if (attempt >= maxRetries) {
        throw new Error(
          `Failed to update IPFS file after ${maxRetries} attempts. Last error: ${error.message}`
        );
      }
    }
  }
}

// Helper function to list files from Pinata
export async function listIPFSFiles(options?: {
  limit?: number;
  keyvalues?: Record<string, string>;
}) {
  try {
    // Use Pinata SDK to list files with proper chaining API
    let query = pinataServer.files.public.list();

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.keyvalues) {
      query = query.keyvalues(options.keyvalues);
    }

    const response = await query;

    return response.files.map((file: any) => ({
      id: file.id,
      cid: file.cid,
      name: file.name,
      size: file.size,
      mimeType: file.mime_type,
      createdAt: file.created_at,
      url: getIPFSFileURL(file.cid),
      metadata: file.metadata,
      keyvalues: file.keyvalues, // Add keyvalues mapping
    }));
  } catch (error) {
    throw new Error("Failed to list IPFS files");
  }
}
