import { NextResponse } from 'next/server';
import { db, sessionPresets } from '@/lib/db';
import { asc } from 'drizzle-orm';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const presets = await db.select().from(sessionPresets).orderBy(asc(sessionPresets.name));

    return NextResponse.json(presets, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Failed to fetch presets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch presets' },
      { status: 500 }
    );
  }
}
