import { NextRequest, NextResponse } from 'next/server';
import envConfig from '@/config/env-config';
import pinata from '@/lib/pinata';



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

    console.log(`Found ${hackathonFiles.length} hackathon files`);

    // Fetch each hackathon file content using Pinata SDK
    const hackathons: any[] = [];
    
    for (const file of hackathonFiles) {
      if (file.cid !== 'pending') {
        try {
          console.log(`Fetching hackathon file: ${file.name} (${file.cid})`);
          
          // Use Pinata SDK to get file content
          const hackathonData = await pinata.gateways.public.get(file.cid);
          console.log(`Raw data for ${file.cid}:`, hackathonData);
          
          // Parse the data properly - it might be a string that needs JSON parsing
          let dataObj: any = {};
          
          if (typeof hackathonData.data === 'string') {
            try {
              dataObj = JSON.parse(hackathonData.data);
            } catch (parseError) {
              console.error(`Failed to parse JSON for ${file.cid}:`, parseError);
              continue;
            }
          } else if (typeof hackathonData.data === 'object' && hackathonData.data !== null) {
            dataObj = hackathonData.data;
          }
          
          console.log(`Parsed data for ${file.cid}:`, dataObj);
          
          if (dataObj && typeof dataObj === 'object' && dataObj.title) {
            const hackathon = {
              ...dataObj,
              id: file.id,
              ipfsHash: file.cid,
              createdAt: file.created_at,
            };
            
            console.log(`Processed hackathon:`, hackathon);
            hackathons.push(hackathon);
          } else {
            console.warn(`Skipping file ${file.cid} - missing required fields:`, dataObj);
          }
        } catch (error) {
          console.error(`Error fetching hackathon ${file.cid}:`, error);
        }
      } else {
        console.log(`Skipping pending file: ${file.name}`);
      }
    }

    console.log(`Returning ${hackathons.length} valid hackathons`);
    return NextResponse.json(hackathons);
  } catch (error) {
    console.error('Fetch hackathons error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hackathons' },
      { status: 500 }
    );
  }
}
