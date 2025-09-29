import { NextRequest, NextResponse } from "next/server";
import { createSignedUploadURL } from "@/lib/pinata-server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { expires = 30 } = body;

    // Validate expires time (max 300 seconds = 5 minutes)
    if (expires > 300) {
      return NextResponse.json(
        { error: "Expires time cannot exceed 300 seconds" },
        { status: 400 }
      );
    }

    const result = await createSignedUploadURL({
      expires,
    });

    return NextResponse.json({
      signedUrl: result.url,
      expires: result.expires,
      expiresAt: new Date(Date.now() + result.expires * 1000).toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create signed URL" },
      { status: 500 }
    );
  }
}

// GET method for simple signed URL creation
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const expires = parseInt(searchParams.get("expires") || "30");

    // Validate parameters
    if (expires > 300) {
      return NextResponse.json(
        { error: "Expires time cannot exceed 300 seconds" },
        { status: 400 }
      );
    }

    const result = await createSignedUploadURL({
      expires,
    });

    return NextResponse.json({
      signedUrl: result.url,
      expires: result.expires,
      expiresAt: new Date(Date.now() + result.expires * 1000).toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create signed URL" },
      { status: 500 }
    );
  }
}
