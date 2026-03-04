import { NextRequest, NextResponse } from 'next/server';
import { db, referenceImages } from '@/lib/db';
import { eq, and, like, inArray } from 'drizzle-orm';
import { Category } from '@/types';
import { normalizeTags } from '@/lib/normalize';

export const runtime = 'nodejs';

// GET - List all images with optional filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const tag = searchParams.get('tag');
    const isNsfw = searchParams.get('isNsfw');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200);
    const offset = parseInt(searchParams.get('offset') || '0');

    const conditions = [];

    if (category && category !== 'all') {
      conditions.push(eq(referenceImages.category, category));
    }

    if (isNsfw === 'true') {
      conditions.push(eq(referenceImages.isNsfw, true));
    } else if (isNsfw === 'false') {
      conditions.push(eq(referenceImages.isNsfw, false));
    }

    // Build query
    const query = db.select().from(referenceImages);
    const baseQuery = conditions.length > 0 
      ? query.where(and(...conditions)) 
      : query;

    const images = await baseQuery.limit(limit).offset(offset);

    // Tag filtering (client-side for now since arrays are complex in SQL)
    let filtered = images;
    if (tag) {
      const normalizedTag = tag.toLowerCase();
      filtered = images.filter((img) =>
        img.tags.some((t) => t.toLowerCase().includes(normalizedTag))
      );
    }

    return NextResponse.json(filtered);
  } catch (error) {
    console.error('Failed to fetch images:', error);
    return NextResponse.json(
      { error: 'Failed to fetch images' },
      { status: 500 }
    );
  }
}

// POST - Create new image
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, category, tags, isNsfw, width, height, source } = body;

    // Validate required fields
    if (!url || !category) {
      return NextResponse.json(
        { error: 'URL and category are required' },
        { status: 400 }
      );
    }

    if (!['figure', 'hands', 'faces', 'animals'].includes(category)) {
      return NextResponse.json(
        { error: 'Invalid category' },
        { status: 400 }
      );
    }

    // Normalize tags
    const normalizedTags = tags ? normalizeTags(tags) : [];

    // Insert image
    const result = await db
      .insert(referenceImages)
      .values({
        url,
        category: category as Category,
        tags: normalizedTags,
        isNsfw: isNsfw ?? false,
        width: width ?? null,
        height: height ?? null,
        source: source ?? null,
      })
      .returning();

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Failed to create image:', error);
    return NextResponse.json(
      { error: 'Failed to create image' },
      { status: 500 }
    );
  }
}
