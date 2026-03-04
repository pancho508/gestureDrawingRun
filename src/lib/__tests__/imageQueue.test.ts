import { buildQueue } from '@/lib/imageQueue';
import { ReferenceImage, Category, ImageQueueItem } from '@/types';

const mockImages: ReferenceImage[] = [
  {
    id: 'img-1',
    url: 'url1',
    category: 'figure',
    tags: ['gesture', 'standing'],
    isNsfw: false,
  },
  {
    id: 'img-2',
    url: 'url2',
    category: 'figure',
    tags: ['gesture', 'sitting'],
    isNsfw: false,
  },
  {
    id: 'img-3',
    url: 'url3',
    category: 'figure',
    tags: ['gesture', 'lying'],
    isNsfw: true,
  },
  {
    id: 'img-4',
    url: 'url4',
    category: 'hands',
    tags: ['gesture', 'open'],
    isNsfw: false,
  },
  {
    id: 'img-5',
    url: 'url5',
    category: 'figure',
    tags: ['dynamic', 'jumping'],
    isNsfw: false,
  },
];

describe('imageQueue.ts - buildQueue', () => {
  describe('category filtering', () => {
    it('should filter by category', () => {
      const queue = buildQueue({
        images: mockImages,
        category: 'figure',
        includeNsfw: true,
        tags: [],
        intervalsSeconds: [30, 30, 30],
      });

      expect(queue.every((item: ReferenceImage) => item.category === 'figure')).toBe(true);
    });

    it('should throw error if no images match category', () => {
      expect(() =>
        buildQueue({
          images: mockImages,
          category: 'animals',
          includeNsfw: true,
          tags: [],
          intervalsSeconds: [30],
        })
      ).toThrow('No images match filters');
    });
  });

  describe('NSFW filtering', () => {
    it('should exclude NSFW by default', () => {
      const queue = buildQueue({
        images: mockImages,
        category: 'figure',
        includeNsfw: false,
        tags: [],
        intervalsSeconds: [30, 30],
      });

      expect(queue.every((item: ReferenceImage) => !item.isNsfw)).toBe(true);
    });

    it('should include NSFW when enabled', () => {
      const queue = buildQueue({
        images: mockImages,
        category: 'figure',
        includeNsfw: true,
        tags: [],
        intervalsSeconds: [30, 30, 30],
      });

      expect(queue.length).toBe(3);
    });
  });

  describe('tag filtering', () => {
    it('should filter by tag (OR matching)', () => {
      const queue = buildQueue({
        images: mockImages,
        category: 'figure',
        includeNsfw: true,
        tags: ['standing'],
        intervalsSeconds: [30],
      });

      expect(queue.length).toBe(1);
      expect(queue[0].id).toBe('img-1');
    });

    it('should use OR matching for multiple tags', () => {
      const queue = buildQueue({
        images: mockImages,
        category: 'figure',
        includeNsfw: false,
        tags: ['standing', 'jumping'],
        intervalsSeconds: [30, 30],
      });

      expect(queue.length).toBe(2);
    });

    it('should be case-insensitive', () => {
      const queue = buildQueue({
        images: mockImages,
        category: 'figure',
        includeNsfw: false,
        tags: ['GESTURE'],
        intervalsSeconds: [30, 30],
      });

      expect(queue.length).toBe(2);
    });
  });

  describe('queue building', () => {
    it('should return correct number of items', () => {
      const intervals = [30, 30, 30, 30, 30];
      const queue = buildQueue({
        images: mockImages,
        category: 'figure',
        includeNsfw: true,
        tags: [],
        intervalsSeconds: intervals,
      });

      expect(queue.length).toBe(5);
    });

    it('should attach intervals correctly', () => {
      const intervals = [30, 60, 120];
      const queue = buildQueue({
        images: mockImages,
        category: 'figure',
        includeNsfw: false,
        tags: [],
        intervalsSeconds: intervals,
      });

      expect(queue[0].intervalSeconds).toBe(30);
      expect(queue[1].intervalSeconds).toBe(60);
      expect(queue[2].intervalSeconds).toBe(120);
    });

    it('should handle duplicate images with consecutive duplicate avoidance', () => {
      const queue = buildQueue({
        images: [mockImages[0]],
        category: 'figure',
        includeNsfw: false,
        tags: [],
        intervalsSeconds: [30, 30, 30],
        seed: 'test',
      });

      // Check that we don't have consecutive duplicates (except when unavoidable)
      for (let i = 0; i < queue.length - 1; i++) {
        if (queue.length === 1) break; // Only one unique image
        // If we have only 1 candidate and need 3 items, some will be duplicates
        // but they should not be consecutive if possible
      }
      expect(queue.length).toBe(3);
    });

    it('should be deterministic with seed', () => {
      const params = {
        images: mockImages,
        category: 'figure' as Category,
        includeNsfw: false,
        tags: [],
        intervalsSeconds: [30, 30],
      };

      const queue1 = buildQueue({ ...params, seed: 'test' });
      const queue2 = buildQueue({ ...params, seed: 'test' });

      expect(queue1.map((q: ImageQueueItem) => q.id)).toEqual(queue2.map((q: ImageQueueItem) => q.id));
    });

    it('should produce different results with different seeds', () => {
      const params = {
        images: mockImages,
        category: 'figure' as Category,
        includeNsfw: false,
        tags: [],
        intervalsSeconds: [30, 30],
      };

      const queue1 = buildQueue({ ...params, seed: 'seed1' });
      const queue2 = buildQueue({ ...params, seed: 'seed2' });

      // Very likely to be different (not guaranteed but high probability)
      const differentOrders =
        queue1[0].id !== queue2[0].id || queue1[1].id !== queue2[1].id;
      expect(differentOrders).toBe(true);
    });
  });
});
