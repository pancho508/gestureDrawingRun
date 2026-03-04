import { NextRequest, NextResponse } from 'next/server';
import { db, sessionRuns, sessionRunImages } from '@/lib/db';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      sessionRunId,
      totalSeconds,
      images = [],
    } = body;

    if (!sessionRunId) {
      return NextResponse.json(
        { error: 'Missing required field: sessionRunId' },
        { status: 400 }
      );
    }

    // Update the session run with final stats
    await db
      .update(sessionRuns)
      .set({
        totalSeconds: totalSeconds || 0,
        imagesCount: images.length,
        completedAt: new Date(),
      })
      .where(eq(sessionRuns.id, sessionRunId));

    // Insert session run images if provided
    if (images.length > 0) {
      const imageRecords = images.map(
        (image: any, index: number) => ({
          sessionRunId,
          referenceImageId: image.referenceImageId,
          intervalSeconds: image.intervalSeconds || 0,
          position: index,
        })
      );

      await db.insert(sessionRunImages).values(imageRecords);
    }

    return NextResponse.json({
      success: true,
      message: 'Session finished',
    });
  } catch (error) {
    console.error('Error finishing session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
