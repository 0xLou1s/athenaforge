import { NextRequest, NextResponse } from "next/server";
import { uploadJSONToIPFS } from "@/lib/pinata-server";
import type { Team } from "@/types/hackathon";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      hackathonId,
      leaderId,
      maxMembers,
      isPublic,
      skills,
      lookingFor,
    } = body;

    // Validate required fields
    if (!name || !hackathonId || !leaderId) {
      return NextResponse.json(
        { error: "Missing required fields: name, hackathonId, leaderId" },
        { status: 400 }
      );
    }

    // Generate team ID and invite code
    const teamId = `team-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const inviteCode = Math.random().toString(36).substr(2, 8).toUpperCase();

    // Create team leader as first member
    const leaderMember = {
      id: `member-${Date.now()}`,
      userId: leaderId,
      name: "Team Leader", // This should be fetched from user data
      role: "Leader",
      joinedAt: new Date().toISOString(),
      skills: skills || [],
    };

    // Create team data structure
    const teamData: Team = {
      id: teamId,
      name,
      description: description || "",
      hackathonId,
      leaderId,
      members: [leaderMember],
      inviteCode,
      maxMembers: maxMembers || 4,
      isPublic: isPublic !== false, // Default to true
      skills: skills || [],
      lookingFor: lookingFor || [],
      ipfsHash: "", // Will be set after upload
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Upload to IPFS
    const uploadResult = await uploadJSONToIPFS(teamData, {
      name: `team-${teamId}`,
      keyvalues: {
        type: "team",
        teamId: teamId,
        hackathonId: hackathonId,
        leaderId: leaderId,
        createdAt: teamData.createdAt,
      },
    });

    // Update team with IPFS hash
    teamData.ipfsHash = uploadResult.cid;

    // Upload updated version with IPFS hash
    const finalUploadResult = await uploadJSONToIPFS(teamData, {
      name: `team-${teamId}-final`,
      keyvalues: {
        type: "team-final",
        teamId: teamId,
        hackathonId: hackathonId,
        leaderId: leaderId,
        createdAt: teamData.createdAt,
      },
    });

    // Return success response
    return NextResponse.json({
      success: true,
      team: {
        ...teamData,
        ipfsHash: finalUploadResult.cid,
      },
      ipfs: {
        cid: finalUploadResult.cid,
        url: finalUploadResult.url,
        size: finalUploadResult.size,
      },
    });
  } catch (error) {
    console.error("Team creation error:", error);
    
    if (error instanceof Error) {
      if (error.message.includes("IPFS")) {
        return NextResponse.json(
          { error: "Failed to store team data on IPFS" },
          { status: 503 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to create team" },
      { status: 500 }
    );
  }
}
