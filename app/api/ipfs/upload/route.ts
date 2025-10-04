import { NextRequest, NextResponse } from 'next/server';
import { uploadFileToIPFS } from '@/lib/pinata-server';

// Increase body size limit for large files
export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const metadata = formData.get('metadata') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // File size validation (100MB limit)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { 
          error: 'File too large. Maximum size is 100MB. Use signed URL for larger files.',
          maxSize: maxSize,
          fileSize: file.size
        },
        { status: 413 }
      );
    }

    // Parse metadata
    let parsedMetadata = {};
    if (metadata) {
      try {
        parsedMetadata = JSON.parse(metadata);
      } catch (error) {
        return NextResponse.json(
          { error: 'Invalid metadata format' },
          { status: 400 }
        );
      }
    }

    // File type validation
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
      'application/pdf', 'text/plain', 'application/json',
      'application/zip', 'application/x-zip-compressed',
      'video/mp4', 'video/webm', 'video/quicktime',
      'audio/mpeg', 'audio/wav', 'audio/ogg'
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { 
          error: 'File type not allowed',
          allowedTypes: allowedTypes,
          receivedType: file.type
        },
        { status: 400 }
      );
    }

    // Upload file using server-side function
    const result = await uploadFileToIPFS(file, {
      name: file.name,
      keyvalues: {
        uploadMethod: 'server-side',
        originalName: file.name,
        fileType: file.type,
        uploadedAt: new Date().toISOString(),
        ...parsedMetadata,
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Upload error:', error);
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('File too large')) {
        return NextResponse.json(
          { error: 'File too large for server upload. Use signed URL method.' },
          { status: 413 }
        );
      }
      
      if (error.message.includes('network')) {
        return NextResponse.json(
          { error: 'Network error during upload. Please try again.' },
          { status: 503 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Upload failed. Please try again or use signed URL for large files.' },
      { status: 500 }
    );
  }
}
