import { NextRequest, NextResponse } from "next/server";
import { updateIPFSFile } from "@/lib/pinata-server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fileId, keyvalues } = body;

    if (!fileId) {
      return NextResponse.json(
        { error: "File ID is required" },
        { status: 400 }
      );
    }

    const result = await updateIPFSFile(fileId, null, { keyvalues });

    if (!result) {
      throw new Error("Failed to update file - no result returned");
    }

    return NextResponse.json({
      success: true,
      fileId: result.id,
      cid: result.cid,
      url: result.url,
    });
  } catch (error) {
    console.error("Update file error:", error);
    return NextResponse.json(
      { error: "Failed to update file" },
      { status: 500 }
    );
  }
}
