import { NextRequest, NextResponse } from "next/server";
import { uploadJSONToIPFS } from "@/lib/pinata-server";
import type { Score } from "@/types/hackathon";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      projectId,
      judgeId,
      scores,
      feedback,
      privateNotes,
      totalScore,
      criteriaScores,
      isDraft = false,
    } = body;

    // Validate required fields
    if (!projectId || !judgeId || !scores || !feedback) {
      return NextResponse.json(
        { error: "Missing required fields: projectId, judgeId, scores, feedback" },
        { status: 400 }
      );
    }

    // Validate scores
    if (typeof scores !== 'object' || Object.keys(scores).length === 0) {
      return NextResponse.json(
        { error: "Scores must be a non-empty object" },
        { status: 400 }
      );
    }

    // Validate score values (0-10)
    for (const [criterion, score] of Object.entries(scores)) {
      if (typeof score !== 'number' || score < 0 || score > 10) {
        return NextResponse.json(
          { error: `Invalid score for ${criterion}. Must be between 0 and 10` },
          { status: 400 }
        );
      }
    }

    // Generate score ID
    const scoreId = `score-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create score data structure
    const scoreData = {
      id: scoreId,
      projectId,
      judgeId,
      scores,
      feedback,
      privateNotes: privateNotes || "",
      totalScore: totalScore || 0,
      criteriaScores: criteriaScores || [],
      isDraft,
      submittedAt: new Date().toISOString(),
      ipfsHash: "", // Will be set after upload
      
      // Additional metadata
      version: "1.0",
      platform: "AthenaForge",
      judgeSignature: "", // In production, this would be a cryptographic signature
    };

    // Upload to IPFS
    const uploadResult = await uploadJSONToIPFS(scoreData, {
      name: `score-${scoreId}${isDraft ? '-draft' : ''}`,
      keyvalues: {
        type: isDraft ? "score-draft" : "score-final",
        scoreId: scoreId,
        projectId: projectId,
        judgeId: judgeId,
        totalScore: totalScore?.toString() || "0",
        isDraft: isDraft.toString(),
        submittedAt: scoreData.submittedAt,
      },
    });

    // Update score with IPFS hash
    scoreData.ipfsHash = uploadResult.cid;

    // Upload updated version with IPFS hash (for final scores only)
    let finalUploadResult = uploadResult;
    if (!isDraft) {
      finalUploadResult = await uploadJSONToIPFS(scoreData, {
        name: `score-${scoreId}-final`,
        keyvalues: {
          type: "score-final-with-hash",
          scoreId: scoreId,
          projectId: projectId,
          judgeId: judgeId,
          totalScore: totalScore?.toString() || "0",
          ipfsHash: uploadResult.cid,
          submittedAt: scoreData.submittedAt,
        },
      });
    }

    // Create response score object matching Score interface
    const responseScore: Score = {
      judgeId,
      criteria: Object.keys(scores).join(", "), // Simple string representation
      score: totalScore || 0,
      feedback,
      submittedAt: scoreData.submittedAt,
    };

    // Return success response
    return NextResponse.json({
      success: true,
      score: responseScore,
      metadata: {
        id: scoreId,
        projectId,
        scores,
        privateNotes,
        isDraft,
        criteriaScores,
      },
      ipfs: {
        cid: finalUploadResult.cid,
        url: finalUploadResult.url,
        size: finalUploadResult.size,
      },
    });
  } catch (error) {
    console.error("Score creation error:", error);
    
    if (error instanceof Error) {
      if (error.message.includes("IPFS")) {
        return NextResponse.json(
          { error: "Failed to store score data on IPFS" },
          { status: 503 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to create score" },
      { status: 500 }
    );
  }
}
