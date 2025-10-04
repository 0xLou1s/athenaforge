import { NextRequest, NextResponse } from "next/server";
import { uploadJSONToIPFS } from "@/lib/pinata-server";
import type { Project } from "@/types/hackathon";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      hackathonId,
      trackId,
      teamId,
      repositoryUrl,
      demoUrl,
      videoUrl,
      technologies,
      challenges,
      achievements,
      futureWork,
      files,
      submittedBy,
      team,
    } = body;

    // Validate required fields
    if (!title || !description || !hackathonId || !trackId || !submittedBy) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: title, description, hackathonId, trackId, submittedBy",
        },
        { status: 400 }
      );
    }

    // Generate project ID
    const projectId = `project-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // Create project data structure
    const projectData: any = {
      id: projectId,
      title,
      description,
      team: team?.members || [],
      hackathonId,
      trackId,
      repositoryUrl: repositoryUrl || undefined,
      demoUrl: demoUrl || undefined,
      videoUrl: videoUrl || undefined,
      ipfsHash: "", // Will be set after upload
      submittedAt: new Date().toISOString(),
      // Additional fields
      technologies: technologies || [],
      challenges: challenges || "",
      achievements: achievements || "",
      futureWork: futureWork || "",
      files: files || [],
      submittedBy,
      teamInfo: team
        ? {
            id: team.id,
            name: team.name,
            members: team.members,
          }
        : null,
    };

    // Upload to IPFS
    const uploadResult = await uploadJSONToIPFS(projectData, {
      name: `project-${projectId}`,
      keyvalues: {
        type: "project",
        projectId: projectId,
        hackathonId: hackathonId,
        trackId: trackId,
        teamId: teamId || "",
        submittedBy: submittedBy,
        createdAt: projectData.submittedAt,
      },
    });

    // Update project with IPFS hash
    projectData.ipfsHash = uploadResult.cid;

    // Upload updated version with IPFS hash
    const finalUploadResult = await uploadJSONToIPFS(projectData, {
      name: `project-${projectId}-final`,
      keyvalues: {
        type: "project-final",
        projectId: projectId,
        hackathonId: hackathonId,
        trackId: trackId,
        teamId: teamId || "",
        submittedBy: submittedBy,
        createdAt: projectData.submittedAt,
      },
    });

    // Create final project object matching the Project interface
    const finalProject: Project = {
      id: projectData.id,
      title: projectData.title,
      description: projectData.description,
      team: projectData.team,
      hackathonId: projectData.hackathonId,
      trackId: projectData.trackId,
      repositoryUrl: projectData.repositoryUrl,
      demoUrl: projectData.demoUrl,
      videoUrl: projectData.videoUrl,
      ipfsHash: finalUploadResult.cid,
      submittedAt: projectData.submittedAt,
      submittedBy: submittedBy,
    };

    // Return success response
    return NextResponse.json({
      success: true,
      project: finalProject,
      metadata: {
        technologies: projectData.technologies,
        challenges: projectData.challenges,
        achievements: projectData.achievements,
        futureWork: projectData.futureWork,
        files: projectData.files,
        teamInfo: projectData.teamInfo,
      },
      ipfs: {
        cid: finalUploadResult.cid,
        url: finalUploadResult.url,
        size: finalUploadResult.size,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("IPFS")) {
        return NextResponse.json(
          { error: "Failed to store project data on IPFS" },
          { status: 503 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}
