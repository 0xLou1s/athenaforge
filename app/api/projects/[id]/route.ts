import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;

    // First try to find project from hackathons API
    const hackathonsResponse = await fetch(
      `${request.nextUrl.origin}/api/hackathons`
    );

    if (!hackathonsResponse.ok) {
      throw new Error("Failed to fetch hackathons");
    }

    const hackathons = await hackathonsResponse.json();
    let foundProject = null;

    // Search through all hackathons for the project
    for (const hackathon of hackathons) {
      if (hackathon.projects && Array.isArray(hackathon.projects)) {
        foundProject = hackathon.projects.find((project: any) => project.id === projectId);
        if (foundProject) break;
      }
    }

    if (foundProject) {
      return NextResponse.json(foundProject);
    }

    // If not found in hackathons, try IPFS as fallback
    const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT!;
    const PINATA_GATEWAY = process.env.NEXT_PUBLIC_PINATA_GATEWAY!;

    // List all project files from IPFS
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
    const projectFiles = data.rows.filter((file: any) =>
      file.metadata?.keyvalues?.type === "project-final"
    );

    // Fetch and check each project file
    for (const file of projectFiles) {
      try {
        const projectResponse = await fetch(
          `https://${PINATA_GATEWAY}/ipfs/${file.ipfs_pin_hash}`
        );

        if (projectResponse.ok) {
          const projectData = await projectResponse.json();

          // Check if this is the project we're looking for
          if (projectData.id === projectId) {
            foundProject = projectData;
            break;
          }
        }
      } catch (error) {
        // Ignore fetch errors
      }
    }

    if (!foundProject) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(foundProject);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch project" },
      { status: 500 }
    );
  }
}
