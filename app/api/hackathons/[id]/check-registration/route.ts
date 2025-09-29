import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: hackathonId } = await params;
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Get hackathon data from IPFS
    const hackathonsResponse = await fetch(
      `${request.nextUrl.origin}/api/hackathons`
    );

    if (!hackathonsResponse.ok) {
      throw new Error("Failed to fetch hackathons");
    }

    const hackathons = await hackathonsResponse.json();

    const hackathon = hackathons.find((h: any) => h.id === hackathonId);

    if (!hackathon) {
      return NextResponse.json(
        { error: "Hackathon not found" },
        { status: 404 }
      );
    }

    // Check if user is in participants list
    const participants = hackathon.participants || [];
    const isRegistered = Array.isArray(participants) 
      ? participants.some((p: any) => (p.userId === userId || p.id === userId))
      : false;

    return NextResponse.json({
      isRegistered,
      hackathonId,
      userId,
      participantCount: Array.isArray(participants) ? participants.length : 0
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to check registration" },
      { status: 500 }
    );
  }
}
