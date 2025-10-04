import { NextRequest, NextResponse } from "next/server";
import { uploadJSONToIPFS } from "@/lib/pinata-server";
import type { Hackathon } from "@/types/hackathon";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      title,
      description,
      image,
      startDate,
      endDate,
      registrationDeadline,
      maxParticipants,
      prizes,
      judges,
      tracks,
      requirements,
      rules,
      organizerId,
      _isUpdate,
      _updateType,
      _originalId,
    } = body;

    const isUpdate = !!_isUpdate;

    // Validate required fields
    if (
      !title ||
      !description ||
      !startDate ||
      !endDate ||
      !registrationDeadline ||
      !organizerId
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    const regDeadline = new Date(registrationDeadline);

    if (start >= end) {
      return NextResponse.json(
        { error: "End date must be after start date" },
        { status: 400 }
      );
    }

    if (regDeadline >= start) {
      return NextResponse.json(
        { error: "Registration deadline must be before start date" },
        { status: 400 }
      );
    }

    // Validate prizes
    if (!prizes || !Array.isArray(prizes) || prizes.length === 0) {
      return NextResponse.json(
        { error: "At least one prize is required" },
        { status: 400 }
      );
    }

    // Create or use existing hackathon ID
    const hackathonId =
      isUpdate && _originalId
        ? _originalId
        : `hackathon-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Determine status based on dates
    const now = new Date();
    let status: "upcoming" | "active" | "ended" = "upcoming";
    if (now >= start && now <= end) {
      status = "active";
    } else if (now > end) {
      status = "ended";
    }

    // Create hackathon data structure
    const hackathonData: any = {
      // Use any to allow flexible participants field
      id: hackathonId,
      title,
      description,
      image: image || "",
      startDate,
      endDate,
      registrationDeadline,
      status,
      participants: isUpdate ? body.participants || [] : 0, // If update, use actual participants array
      maxParticipants: maxParticipants || undefined,
      prizes: prizes.map((prize: any, index: number) => ({
        id: prize.id || `prize-${index}`,
        title: prize.title,
        description: prize.description,
        amount: prize.amount,
        currency: prize.currency,
        position: prize.position,
      })),
      judges: (judges || []).map((judge: any, index: number) => ({
        id: judge.id || `judge-${index}`,
        name: judge.name,
        title: judge.title,
        company: judge.company,
        avatar: judge.avatar || "",
        bio: judge.bio,
        socialLinks: {
          twitter: judge.socialLinks?.twitter || "",
          linkedin: judge.socialLinks?.linkedin || "",
          github: judge.socialLinks?.github || "",
        },
      })),
      tracks: (tracks || []).map((track: any, index: number) => ({
        id: track.id || `track-${index}`,
        name: track.name,
        description: track.description,
        criteria: track.criteria || [],
      })),
      requirements: requirements || [],
      rules: rules || [],
      ipfsHash: "", // Will be set after upload
      organizerId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Create metadata for IPFS upload
    const metadata = {
      name: `hackathon-${hackathonId}`,
      keyvalues: {
        hackathonId: hackathonId,
        title: title,
        organizerId: organizerId,
        type: "hackathon",
        isUpdate: isUpdate.toString(),
        ...(_updateType && { updateType: _updateType }),
        ...(_originalId && { originalId: _originalId }),
      },
    };

    // Upload to IPFS
    const uploadResult = await uploadJSONToIPFS(hackathonData, metadata);

    // Return success response
    return NextResponse.json({
      success: true,
      hackathon: {
        ...hackathonData,
        ipfsHash: uploadResult.cid,
      },
      ipfs: {
        cid: uploadResult.cid,
        url: uploadResult.url,
        size: uploadResult.size,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("IPFS")) {
        return NextResponse.json(
          { error: "Failed to store hackathon data on IPFS" },
          { status: 503 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to create hackathon" },
      { status: 500 }
    );
  }
}
