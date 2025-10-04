import { create } from 'zustand';
import envConfig from '@/config/env-config';
import { PinataSDK } from 'pinata';
import type { 
  IPFSUploadResult, 
  IPFSFileItem, 
  IPFSFileListResponse, 
  IPFSMetadata 
} from '@/types/ipfs';

// Client-side Pinata instance (for signed URL uploads only)
const pinataClient = new PinataSDK({
  pinataJwt: "dummy", // Not used for signed URL uploads
  pinataGateway: envConfig.NEXT_PUBLIC_PINATA_GATEWAY,
});

interface IPFSState {
  uploads: IPFSUploadResult[];
  files: IPFSFileItem[];
  isLoading: boolean;
  error: string | null;
  uploadProgress: number;
  
  // Actions
  uploadFile: (file: File, metadata?: IPFSMetadata, useSignedURL?: boolean) => Promise<IPFSUploadResult>;
  uploadFileWithSignedURL: (file: File, metadata?: IPFSMetadata) => Promise<IPFSUploadResult>;
  uploadJSON: (data: any, metadata?: IPFSMetadata) => Promise<IPFSUploadResult>;
  listFiles: (options?: { type?: string; limit?: number; order?: 'ASC' | 'DESC' }) => Promise<IPFSFileListResponse>;
  getFileURL: (cid: string) => string;
  addUpload: (upload: IPFSUploadResult) => void;
  setFiles: (files: IPFSFileItem[]) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setUploadProgress: (progress: number) => void;
  clearError: () => void;
}

export const useIPFSStore = create<IPFSState>()((set, get) => ({
  uploads: [],
  files: [],
  isLoading: false,
  error: null,
  uploadProgress: 0,

  uploadFile: async (file: File, metadata?: IPFSMetadata, useSignedURL?: boolean) => {
    // Determine upload method based on file size and preference
    const largeFileThreshold = 50 * 1024 * 1024; // 50MB
    const shouldUseSignedURL = useSignedURL || file.size > largeFileThreshold;

    if (shouldUseSignedURL) {
      return get().uploadFileWithSignedURL(file, metadata);
    }

    // Use server-side upload for smaller files
    set({ isLoading: true, error: null });

    try {
      const formData = new FormData();
      formData.append('file', file);
      if (metadata) {
        formData.append('metadata', JSON.stringify(metadata));
      }

      const response = await fetch('/api/ipfs/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result: IPFSUploadResult = await response.json();

      set((state) => ({
        uploads: [...state.uploads, result],
        isLoading: false,
      }));

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  uploadFileWithSignedURL: async (file: File, metadata?: IPFSMetadata) => {
    set({ isLoading: true, error: null, uploadProgress: 0 });

    try {
      // Get signed URL from server
      const signedUrlResponse = await fetch('/api/ipfs/signed-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          expires: 300, // 5 minutes
        }),
      });

      if (!signedUrlResponse.ok) {
        const errorData = await signedUrlResponse.json();
        throw new Error(errorData.error || 'Failed to get signed URL');
      }

      const { signedUrl } = await signedUrlResponse.json();

      // Upload file using signed URL
      const uploadResult = await pinataClient.upload.public
        .file(file)
        .url(signedUrl);

      // Convert CID to full URL
      const fileUrl = `${envConfig.NEXT_PUBLIC_PINATA_GATEWAY}/ipfs/${uploadResult.cid}`;

      const result: IPFSUploadResult = {
        id: uploadResult.id,
        cid: uploadResult.cid,
        name: uploadResult.name || file.name,
        size: uploadResult.size || file.size,
        mimeType: uploadResult.mime_type || file.type,
        createdAt: uploadResult.created_at || new Date().toISOString(),
        url: fileUrl,
      };

      set((state) => ({
        uploads: [...state.uploads, result],
        isLoading: false,
        uploadProgress: 100,
      }));

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      set({ error: errorMessage, isLoading: false, uploadProgress: 0 });
      throw error;
    }
  },

  uploadJSON: async (data: any, metadata?: IPFSMetadata) => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch('/api/ipfs/upload-json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data, metadata }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'JSON upload failed');
      }

      const result: IPFSUploadResult = await response.json();

      set((state) => ({
        uploads: [...state.uploads, result],
        isLoading: false,
      }));

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  listFiles: async (options?: { type?: string; limit?: number; order?: 'ASC' | 'DESC' }) => {
    set({ isLoading: true, error: null });

    try {
      const params = new URLSearchParams();
      if (options?.type) params.append('type', options.type);
      if (options?.limit) params.append('limit', options.limit.toString());
      if (options?.order) params.append('order', options.order);

      const response = await fetch(`/api/ipfs/list?${params.toString()}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to list files');
      }

      const result: IPFSFileListResponse = await response.json();

      set((state) => ({
        files: result.files,
        isLoading: false,
      }));

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to list files';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  getFileURL: (cid: string) => {
    return `${envConfig.NEXT_PUBLIC_PINATA_GATEWAY}/ipfs/${cid}`;
  },

  addUpload: (upload: IPFSUploadResult) => {
    set((state) => ({
      uploads: [...state.uploads, upload],
    }));
  },

  setFiles: (files: IPFSFileItem[]) => set({ files }),

  setLoading: (isLoading: boolean) => set({ isLoading }),
  setError: (error: string | null) => set({ error }),
  setUploadProgress: (progress: number) => set({ uploadProgress: progress }),
  clearError: () => set({ error: null }),
}));
