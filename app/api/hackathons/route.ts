import { NextRequest, NextResponse } from 'next/server';
import { listIPFSFiles } from '@/lib/pinata-server';
import envConfig from '@/config/env-config';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Fetch hackathons from Pinata using metadata filter
    
    const hackathonFiles = await listIPFSFiles({
      limit,
      keyvalues: {
        type: 'hackathon',
        ...(status && { status }),
      },
    });

    // Get hackathon files only (no need for hackathon-final anymore)
    const allFiles = hackathonFiles;

    // Parse hackathon data from files and group by hackathonId
    const hackathonMap = new Map();

    await Promise.all(
      allFiles.map(async (file) => {
        try {
          // Fetch the actual hackathon data from IPFS
          const response = await fetch(file.url);
          const hackathonData = await response.json();

          // Use hackathonId from keyvalues instead of metadata
          const hackathonId = file.keyvalues?.hackathonId || file.metadata?.hackathonId || file.cid;

          // Parse participants from keyvalues if available
          let participants = hackathonData.participants || [];
          if (file.keyvalues?.participants) {
            try {
              participants = JSON.parse(file.keyvalues.participants);
            } catch (e) {
              // Ignore parsing errors
            }
          }

          const hackathon = {
            id: hackathonId, // Use consistent ID from keyvalues
            ...hackathonData,
            participants: participants, // Use participants from keyvalues
            ipfsHash: file.cid,
            createdAt: file.createdAt,
            metadata: file.metadata,
            keyvalues: file.keyvalues,
            uploadedAt: file.keyvalues?.uploadedAt || file.metadata?.uploadedAt,
          };

          // Only keep the most recent file for each hackathonId
          const existing = hackathonMap.get(hackathonId);
          if (!existing || new Date(file.createdAt) > new Date(existing.createdAt)) {
            hackathonMap.set(hackathonId, hackathon);
          }
        } catch (error) {
          // Ignore parsing errors
        }
      })
    );

    // Convert map to array
    const validHackathons = Array.from(hackathonMap.values());
    
    return NextResponse.json(validHackathons);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch hackathons' },
      { status: 500 }
    );
  }
}
