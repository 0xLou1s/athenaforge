import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: hackathonId } = await params;
    const { userId, userEmail, userName } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Get hackathon data
    const hackathonsResponse = await fetch(
      `${request.nextUrl.origin}/api/hackathons`
    );
    const hackathonsData = await hackathonsResponse.json();
    const hackathon = hackathonsData.find((h: any) => h.id === hackathonId);

    if (!hackathon) {
      return NextResponse.json(
        { error: "Hackathon not found" },
        { status: 404 }
      );
    }

    // Check if user is already registered
    const participants = hackathon.participants || [];
    const isAlreadyRegistered = Array.isArray(participants)
      ? participants.some((p: any) => p.userId === userId || p.id === userId)
      : false;

    if (isAlreadyRegistered) {
      return NextResponse.json(
        { error: "User is already registered for this hackathon" },
        { status: 400 }
      );
    }

    // Check if hackathon has ended
    if (hackathon.endDate) {
      const now = new Date();
      const endDate = new Date(hackathon.endDate);

      if (now > endDate) {
        return NextResponse.json(
          { error: "Hackathon has ended. Registration is closed." },
          { status: 400 }
        );
      }
    }

    // Check registration deadline
    if (hackathon.registrationDeadline) {
      const now = new Date();
      const deadline = new Date(hackathon.registrationDeadline);

      if (now > deadline) {
        return NextResponse.json(
          { error: "Registration deadline has passed." },
          { status: 400 }
        );
      }
    }

    // Check if hackathon has reached max participants
    const currentParticipantCount = Array.isArray(participants)
      ? participants.length
      : 0;

    if (
      hackathon.maxParticipants &&
      currentParticipantCount >= hackathon.maxParticipants
    ) {
      return NextResponse.json(
        { error: "Hackathon is full. Maximum participants reached." },
        { status: 400 }
      );
    }

    // Create new participant object
    const newParticipant = {
      userId,
      userEmail: userEmail || null,
      userName: userName || userId,
      registeredAt: new Date().toISOString(),
    };

    // Update participants list
    const updatedParticipants = Array.isArray(participants)
      ? [...participants, newParticipant]
      : [newParticipant];

    // Create updated hackathon object
    const updatedHackathon = {
      ...hackathon,
      participants: updatedParticipants,
      updatedAt: new Date().toISOString(),
    };

    // Upload updated hackathon to IPFS with simple retry logic
    const updateResult = await updateHackathonWithRetry(
      hackathonId,
      updatedParticipants,
      request
    );

    if (!updateResult.success) {
      return NextResponse.json(
        { error: "Failed to save registration to IPFS" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Successfully registered for hackathon",
      hackathon: updatedHackathon,
      fileId: updateResult.fileId,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to register for hackathon" },
      { status: 500 }
    );
  }
}

// Simple retry function for hackathon updates
async function updateHackathonWithRetry(
  hackathonId: string,
  participants: any[],
  request: NextRequest,
  maxRetries = 3
) {
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      // Get fresh file data
      const hackathonsResponse = await fetch(
        `${request.nextUrl.origin}/api/ipfs/list?type=hackathon`
      );
      const filesData = await hackathonsResponse.json();
      const hackathonFile = filesData.files.find(
        (file: any) =>
          file.keyvalues?.hackathonId === hackathonId &&
          file.keyvalues?.type === "hackathon"
      );

      if (!hackathonFile) {
        throw new Error("Hackathon file not found for update");
      }

      // Simple keyvalues update
      const keyvaluesToUpdate = {
        type: "hackathon",
        hackathonId: hackathonId,
        participantCount: String(participants.length),
        participants: JSON.stringify(participants),
        updatedAt: new Date().toISOString(),
      };

      const updateResponse = await fetch(
        `${request.nextUrl.origin}/api/ipfs/update-file`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fileId: hackathonFile.id,
            keyvalues: keyvaluesToUpdate,
          }),
        }
      );

      if (updateResponse.ok) {
        const updateResult = await updateResponse.json();
        return {
          success: true,
          fileId: hackathonFile.id,
          ...updateResult,
        };
      }

      const errorText = await updateResponse.text();
      throw new Error(`Update failed: ${updateResponse.status} - ${errorText}`);
    } catch (error) {
      attempt++;

      if (attempt >= maxRetries) {
        return {
          success: false,
          error: error instanceof Error ? error.message : String(error),
        };
      }

      // Wait before retry
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
    }
  }

  return { success: false, error: "Max retries exceeded" };
}
