import { NextRequest, NextResponse } from 'next/server';
import { db, referenceImages } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { Category } from '@/types';
import { normalizeTags } from '@/lib/normalize';

export const runtime = 'nodejs';

// PATCH - Update image
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { category, tags, isNsfw, width, height, source, url } = body;
    const imageId = params.id;

    // Build update object
    const updateData: any = {};
    if (url) updateData.url = url;
    if (category) updateData.category = category as Category;
    if (tags) updateData.tags = normalizeTags(tags);
    if (typeof isNsfw === 'boolean') updateData.isNsfw = isNsfw;
    if (width !== undefined) updateData.width = width;
    if (height !== undefined) updateData.height = height;
    if (source !== undefined) updateData.source = source;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    const result = await db
      .update(referenceImages)
      .set(updateData)
      .where(eq(referenceImages.id, imageId))
      .returning();

    if (!result.length) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Failed to update image:', error);
    return NextResponse.json(
      { error: 'Failed to update image' },
      { status: 500 }
    );
  }
}

// DELETE - Delete image
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const imageId = params.id;

    const result = await db
      .delete(referenceImages)
      .where(eq(referenceImages.id, imageId))
      .returning();

    if (!result.length) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete image:', error);
    return NextResponse.json(
      { error: 'Failed to delete image' },
      { status: 500 }
    );
  }
}
