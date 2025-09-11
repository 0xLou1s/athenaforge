import { NextRequest, NextResponse } from 'next/server';
import { PinataSDK } from 'pinata';
import envConfig from '@/config/env-config';

const pinata = new PinataSDK({
  pinataJwt: envConfig.NEXT_PUBLIC_PINATA_JWT,
  pinataGateway: envConfig.NEXT_PUBLIC_PINATA_GATEWAY,
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const limit = searchParams.get('limit');
    const order = searchParams.get('order') as 'ASC' | 'DESC' | undefined;

    // Build the query
    let query = pinata.files.public.list().group(envConfig.NEXT_PUBLIC_PINATA_GROUP_ID);

    // Add filters
    if (type) {
      query = query.keyvalues({ type });
    }

    if (limit) {
      query = query.limit(parseInt(limit));
    }

    if (order) {
      query = query.order(order);
    }

    const result = await query;

    return NextResponse.json(result);
  } catch (error) {
    console.error('List files error:', error);
    return NextResponse.json(
      { error: 'Failed to list files' },
      { status: 500 }
    );
  }
}
