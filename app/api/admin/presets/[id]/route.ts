import { NextRequest, NextResponse } from 'next/server';
import { db, sessionPresets } from '@/lib/db';
import { eq } from 'drizzle-orm';

export const runtime = 'nodejs';

// PATCH - Update preset
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, intervalsSeconds, defaultCategory } = body;
    const presetId = params.id;

    // Build update object
    const updateData: any = {};
    if (name) updateData.name = name;
    if (intervalsSeconds) {
      if (!Array.isArray(intervalsSeconds) || intervalsSeconds.length === 0) {
        return NextResponse.json(
          { error: 'intervalsSeconds must be a non-empty array' },
          { status: 400 }
        );
      }
      updateData.intervalsSeconds = intervalsSeconds;
    }
    if (defaultCategory !== undefined) {
      updateData.defaultCategory = defaultCategory;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    const result = await db
      .update(sessionPresets)
      .set(updateData)
      .where(eq(sessionPresets.id, presetId))
      .returning();

    if (!result.length) {
      return NextResponse.json(
        { error: 'Preset not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Failed to update preset:', error);
    
    // Check for unique constraint violation
    if ((error as any).code === '23505') {
      return NextResponse.json(
        { error: 'Preset name already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update preset' },
      { status: 500 }
    );
  }
}

// DELETE - Delete preset
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const presetId = params.id;

    const result = await db
      .delete(sessionPresets)
      .where(eq(sessionPresets.id, presetId))
      .returning();

    if (!result.length) {
      return NextResponse.json(
        { error: 'Preset not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete preset:', error);
    return NextResponse.json(
      { error: 'Failed to delete preset' },
      { status: 500 }
    );
  }
}
