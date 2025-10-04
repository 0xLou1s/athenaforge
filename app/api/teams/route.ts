import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const hackathonId = searchParams.get('hackathonId');
    const limit = parseInt(searchParams.get('limit') || '50');

    // For now, return empty array since we need to implement proper team indexing
    // TODO: Implement proper team storage and retrieval system
    const teams: any[] = [];
    return NextResponse.json(teams);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch teams' },
      { status: 500 }
    );
  }
}
