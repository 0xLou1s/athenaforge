import { NextRequest, NextResponse } from 'next/server';
import { PinataSDK } from 'pinata';
import envConfig from '@/config/env-config';

const pinata = new PinataSDK({
  pinataJwt: envConfig.NEXT_PUBLIC_PINATA_JWT,
  pinataGateway: envConfig.NEXT_PUBLIC_PINATA_GATEWAY,
});

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

    const uploadResult = await pinata.upload.public.file(file, {
      metadata: {
        name: file.name,
        keyvalues: {
          type: 'file',
          ...parsedMetadata,
        },
      },
    });

    const result = {
      id: uploadResult.id,
      cid: uploadResult.cid,
      name: uploadResult.name,
      size: uploadResult.size,
      mimeType: uploadResult.mime_type,
      createdAt: uploadResult.created_at,
      url: `${envConfig.NEXT_PUBLIC_PINATA_GATEWAY}/ipfs/${uploadResult.cid}`,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}
