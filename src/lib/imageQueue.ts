import seedrandom from 'seedrandom';
import { Category, ImageQueueItem, ReferenceImage } from '@/types';

export interface BuildQueueParams {
  images: ReferenceImage[];
  category: Category;
  includeNsfw: boolean;
  tags: string[];
  intervalsSeconds: number[];
  seed?: string;
}

/**
 * Build a randomized queue of images for a session
 * - Filter by category
 * - Exclude NSFW unless includeNsfw=true
 * - Apply tag filters (OR matching - any tag matches)
 * - Randomize selection
 * - Attach interval seconds
 * - Avoid consecutive duplicates if possible
 */
export function buildQueue(params: BuildQueueParams): ImageQueueItem[] {
  const { images, category, includeNsfw, tags, intervalsSeconds, seed } = params;

  // Step 1: Filter by category
  let candidates = images.filter((img) => img.category === category);

  // Step 2: Filter NSFW
  if (!includeNsfw) {
    candidates = candidates.filter((img) => !img.isNsfw);
  }

  // Step 3: Filter by tags (OR matching)
  if (tags.length > 0) {
    candidates = candidates.filter((img) => {
      return tags.some((tag) =>
        img.tags.some((imgTag: string) =>
          imgTag.toLowerCase().includes(tag.toLowerCase())
        )
      );
    });
  }

  if (candidates.length === 0) {
    throw new Error(
      `No images match filters: category=${category}, includeNsfw=${includeNsfw}, tags=${tags.join(',')}`
    );
  }

  const targetLength = intervalsSeconds.length;
  const rng = seed ? seedrandom(seed) : Math.random;
  const randomFunc =
    typeof rng === 'function'
      ? (rng as () => number)
      : () => Math.random();

  // Step 4: Select queue
  let selected: ReferenceImage[] = [];

  if (candidates.length >= targetLength) {
    // Enough candidates: shuffle and pick unique
    const shuffled = candidates.sort(() => randomFunc() - 0.5);

    // Try to avoid duplicates
    selected = shuffled.slice(0, targetLength);
  } else {
    // Not enough candidates: allow duplicates, avoid consecutive
    selected = [];
    const candidatesLength = candidates.length;

    for (let i = 0; i < targetLength; i++) {
      let candidate = candidates[Math.floor(randomFunc() * candidatesLength)];

      // Avoid consecutive duplicates
      while (i > 0 && selected[i - 1].id === candidate.id) {
        candidate = candidates[Math.floor(randomFunc() * candidatesLength)];
      }

      selected.push(candidate);
    }
  }

  // Step 5: Build queue items with intervals
  const queue: ImageQueueItem[] = selected.map((img, index) => ({
    ...img,
    intervalSeconds: intervalsSeconds[index],
  }));

  return queue;
}
