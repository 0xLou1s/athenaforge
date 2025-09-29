import { NextRequest, NextResponse } from "next/server";

const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT!;
const PINATA_GATEWAY = process.env.NEXT_PUBLIC_PINATA_GATEWAY!;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: hackathonId } = await params;

    // List all project files from IPFS with hackathon filter
    const response = await fetch("https://api.pinata.cloud/data/pinList", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${PINATA_JWT}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Pinata API error: ${response.statusText}`);
    }

    const data = await response.json();
    const files = data.rows.filter((file: any) => 
      file.metadata?.keyvalues?.type === "project-final" &&
      file.metadata?.keyvalues?.hackathonId === hackathonId
    );

    const projects = [];

    // Fetch and parse each project file
    for (const file of files) {
      try {
        const response = await fetch(
          `https://${PINATA_GATEWAY}/ipfs/${file.ipfs_pin_hash}`
        );

        if (response.ok) {
          const projectData = await response.json();
          projects.push(projectData);
        }
      } catch (error) {
        // Ignore fetch errors
      }
    }

    return NextResponse.json(projects);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch hackathon projects" },
      { status: 500 }
    );
  }
}
