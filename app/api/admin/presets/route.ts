import { NextRequest, NextResponse } from 'next/server';
import { db, sessionPresets } from '@/lib/db';

export const runtime = 'nodejs';

// GET - List all presets
export async function GET(request: NextRequest) {
  try {
    const presets = await db.select().from(sessionPresets).orderBy(sessionPresets.name);
    return NextResponse.json(presets);
  } catch (error) {
    console.error('Failed to fetch presets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch presets' },
      { status: 500 }
    );
  }
}

// POST - Create new preset
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, intervalsSeconds, defaultCategory } = body;

    // Validate required fields
    if (!name || !intervalsSeconds || !Array.isArray(intervalsSeconds)) {
      return NextResponse.json(
        { error: 'Name and intervalsSeconds (array) are required' },
        { status: 400 }
      );
    }

    if (intervalsSeconds.length === 0) {
      return NextResponse.json(
        { error: 'intervalsSeconds must have at least one interval' },
        { status: 400 }
      );
    }

    // Validate all intervals are positive numbers
    if (!intervalsSeconds.every((i: any) => typeof i === 'number' && i > 0)) {
      return NextResponse.json(
        { error: 'All intervals must be positive numbers' },
        { status: 400 }
      );
    }

    // Insert preset
    const result = await db
      .insert(sessionPresets)
      .values({
        name,
        intervalsSeconds,
        defaultCategory: defaultCategory || null,
      })
      .returning();

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Failed to create preset:', error);
    
    // Check for unique constraint violation
    if ((error as any).code === '23505') {
      return NextResponse.json(
        { error: 'Preset name already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create preset' },
      { status: 500 }
    );
  }
}
