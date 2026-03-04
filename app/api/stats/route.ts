import { NextRequest, NextResponse } from 'next/server';
import { db, sessionRuns } from '@/lib/db';
import { sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // For now, we'll return stats for all sessions
    // In the future, this could be filtered by user if user auth is added
    
    const stats = await db
      .select({
        totalSessions: sql<number>`count(*)`,
        totalSeconds: sql<number>`coalesce(sum(${sessionRuns.totalSeconds}), 0)`,
        totalImages: sql<number>`coalesce(sum(${sessionRuns.imagesCount}), 0)`,
        averageSeconds: sql<number>`coalesce(avg(${sessionRuns.totalSeconds}), 0)`,
        lastSessionAt: sql<string>`max(${sessionRuns.completedAt})`,
      })
      .from(sessionRuns);

    const data = stats[0] || {
      totalSessions: 0,
      totalSeconds: 0,
      totalImages: 0,
      averageSeconds: 0,
      lastSessionAt: null,
    };

    // Get breakdown by category
    const byCategory = await db
      .select({
        category: sessionRuns.category,
        count: sql<number>`count(*)`,
        totalSeconds: sql<number>`sum(${sessionRuns.totalSeconds})`,
      })
      .from(sessionRuns)
      .groupBy(sessionRuns.category);

    return NextResponse.json({
      success: true,
      stats: {
        ...data,
        byCategory: byCategory || [],
      },
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
