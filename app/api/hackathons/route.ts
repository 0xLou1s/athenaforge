import { NextRequest, NextResponse } from 'next/server';
import { PinataSDK } from 'pinata';
import envConfig from '@/config/env-config';

const pinata = new PinataSDK({
  pinataJwt: envConfig.NEXT_PUBLIC_PINATA_JWT,
  pinataGateway: envConfig.NEXT_PUBLIC_PINATA_GATEWAY,
});

export async function GET(request: NextRequest) {
  try {
    // List all files in the group
    const allFilesResponse = await pinata.files.public
      .list()
      .group(envConfig.NEXT_PUBLIC_PINATA_GROUP_ID)
      .order('DESC');

    // Filter hackathon files by name pattern
    const hackathonFiles = allFilesResponse.files.filter(file => 
      file.name && file.name.startsWith('hackathon-')
    );

    // Fetch each hackathon file content using Pinata SDK
    const hackathons: any[] = [];
    
    for (const file of hackathonFiles) {
      if (file.cid !== 'pending') {
        try {
          // Use Pinata SDK to get file content
          const hackathonData = await pinata.gateways.public.get(file.cid);
          const dataObj = typeof hackathonData.data === 'object' && hackathonData.data !== null
            ? hackathonData.data
            : {};
          hackathons.push({
            ...(dataObj as Record<string, any>), // Flatten the data object safely
            id: file.id,
            ipfsHash: file.cid,
            createdAt: file.created_at,
          });
        } catch (error) {
          console.error(`Error fetching hackathon ${file.cid}:`, error);
        }
      }
    }

    return NextResponse.json(hackathons);
  } catch (error) {
    console.error('Fetch hackathons error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hackathons' },
      { status: 500 }
    );
  }
}
