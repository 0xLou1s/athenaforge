import { NextRequest, NextResponse } from "next/server";
import { getIPFSFileURL } from "@/lib/ipfs-utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Hackathon ID is required" },
        { status: 400 }
      );
    }

    // TODO: Implement direct hackathon retrieval by ID from IPFS

    return NextResponse.json({ error: "Hackathon not found" }, { status: 404 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch hackathon" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Hackathon ID is required" },
        { status: 400 }
      );
    }

    // TODO: Implement hackathon update functionality

    return NextResponse.json(
      { error: "Update functionality not implemented yet" },
      { status: 501 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update hackathon" },
      { status: 500 }
    );
  }
}
