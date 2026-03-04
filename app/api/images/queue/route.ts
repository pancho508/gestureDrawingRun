import { NextRequest, NextResponse } from 'next/server';
import { db, referenceImages } from '@/lib/db';
import { eq, and, not, inArray } from 'drizzle-orm';
import { buildQueue } from '@/lib/imageQueue';
import { normalizeTags } from '@/lib/normalize';
import { Category } from '@/types';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Parse request parameters
    const category = searchParams.get('category') as Category | null;
    const includeNsfwStr = searchParams.get('includeNsfw');
    const tagsStr = searchParams.get('tags');
    const intervalsStr = searchParams.get('intervals');
    const countStr = searchParams.get('count');

    // Validate required parameters
    if (!category) {
      return NextResponse.json(
        { error: 'Missing required parameter: category' },
        { status: 400 }
      );
    }

    // Parse boolean and array parameters
    const includeNsfw = includeNsfwStr === 'true';
    const tags = tagsStr
      ? normalizeTags(tagsStr.split(',').map((t) => t.trim()))
      : [];
    const intervals = intervalsStr
      ? intervalsStr.split(',').map((s) => parseInt(s))
      : [];
    const count = Math.min(parseInt(countStr || '10'), 200); // Cap at 200

    // If no intervals provided, generate count intervals of 30s each
    const finalIntervals = intervals.length > 0 ? intervals : Array(count).fill(30);

    // Build query to fetch candidates
    const conditions = [eq(referenceImages.category, category)];
    if (!includeNsfw) {
      conditions.push(not(referenceImages.isNsfw));
    }

    const queryResult = await db
      .select()
      .from(referenceImages)
      .where(and(...conditions));

    // Tag filtering will be done in client-side logic
    // since PostgreSQL array operations in Drizzle ORM are complex

    // Fetch candidates and cast category to Category type, convert null to undefined
    let candidates = queryResult.map((img) => ({
      id: img.id,
      url: img.url,
      category: img.category as Category,
      tags: img.tags,
      isNsfw: img.isNsfw,
      width: img.width ?? undefined,
      height: img.height ?? undefined,
      source: img.source ?? undefined,
    }));

    // Filter by tags (OR matching - any tag matches)
    if (tags.length > 0) {
      candidates = candidates.filter((img) => {
        return tags.some((tag) =>
          img.tags.some((imgTag: string) =>
            imgTag.toLowerCase().includes(tag.toLowerCase())
          )
        );
      });
    }

    // Build queue using existing logic
    if (candidates.length === 0) {
      return NextResponse.json(
        {
          error: 'No images match filters',
          suggestion: 'Try removing tags or enabling NSFW images',
        },
        { status: 400 }
      );
    }

    const queue = buildQueue({
      images: candidates,
      category,
      includeNsfw,
      tags,
      intervalsSeconds: finalIntervals,
    });

    return NextResponse.json(queue, {
      headers: {
        'Cache-Control': 'private, no-cache', // Don't cache randomized results
      },
    });
  } catch (error) {
    console.error('Failed to build queue:', error);
    return NextResponse.json(
      { error: 'Failed to build image queue' },
      { status: 500 }
    );
  }
}
