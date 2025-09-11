import { NextRequest, NextResponse } from 'next/server';
import { PinataSDK } from 'pinata';
import envConfig from '@/config/env-config';

const pinata = new PinataSDK({
  pinataJwt: envConfig.NEXT_PUBLIC_PINATA_JWT,
  pinataGateway: envConfig.NEXT_PUBLIC_PINATA_GATEWAY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data, metadata } = body;

    if (!data) {
      return NextResponse.json(
        { error: 'No data provided' },
        { status: 400 }
      );
    }

    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const file = new File([blob], metadata?.name || 'data.json', {
      type: 'application/json',
    });

    const uploadResult = await pinata.upload.public.file(file, {
      metadata: {
        name: metadata?.name || 'data.json',
        keyvalues: {
          type: 'json',
          ...metadata?.keyvalues,
        },
      },
      groupId: envConfig.NEXT_PUBLIC_PINATA_GROUP_ID,
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
    console.error('JSON upload error:', error);
    return NextResponse.json(
      { error: 'JSON upload failed' },
      { status: 500 }
    );
  }
}
