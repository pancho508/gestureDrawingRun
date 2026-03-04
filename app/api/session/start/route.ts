import { NextRequest, NextResponse } from 'next/server';
import { db, sessionRuns } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      presetId,
      category,
      tags = [],
      includeNsfw = false,
    } = body;

    if (!presetId || !category) {
      return NextResponse.json(
        { error: 'Missing required fields: presetId, category' },
        { status: 400 }
      );
    }

    // Create a new session run record
    const result = await db
      .insert(sessionRuns)
      .values({
        presetId,
        category,
        tags,
        includeNsfw,
        totalSeconds: 0, // Will be set when session finishes
        imagesCount: 0, // Will be set when session finishes
        completedAt: new Date(), // Will be updated when session finishes
      })
      .returning({ id: sessionRuns.id });

    const sessionRunId = result[0]?.id;

    if (!sessionRunId) {
      return NextResponse.json(
        { error: 'Failed to create session run' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      sessionRunId,
      message: 'Session started',
    });
  } catch (error) {
    console.error('Error starting session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
