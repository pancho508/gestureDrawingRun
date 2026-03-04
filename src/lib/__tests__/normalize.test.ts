import { normalizeTag, normalizeTags } from '@/lib/normalize';

describe('normalize.ts', () => {
  describe('normalizeTag', () => {
    it('should lowercase tags', () => {
      expect(normalizeTag('GESTURE')).toBe('gesture');
      expect(normalizeTag('Gesture')).toBe('gesture');
    });

    it('should trim whitespace', () => {
      expect(normalizeTag('  gesture  ')).toBe('gesture');
      expect(normalizeTag('\tgesture\n')).toBe('gesture');
    });

    it('should collapse multiple spaces', () => {
      expect(normalizeTag('line   of   action')).toBe('line of action');
      expect(normalizeTag('  multiple  spaces  ')).toBe('multiple spaces');
    });

    it('should combine all operations', () => {
      expect(normalizeTag('  GESTURE  DRAWING  ')).toBe('gesture drawing');
    });
  });

  describe('normalizeTags', () => {
    it('should remove duplicates', () => {
      expect(normalizeTags(['gesture', 'gesture'])).toEqual(['gesture']);
      expect(normalizeTags(['Gesture', 'gesture'])).toEqual(['gesture']);
    });

    it('should filter empty strings', () => {
      expect(normalizeTags(['', 'gesture', ''])).toEqual(['gesture']);
    });

    it('should normalize each tag', () => {
      const result = normalizeTags(['  GESTURE  ', 'DRAWING']);
      expect(result).toContain('gesture');
      expect(result).toContain('drawing');
      expect(result.length).toBe(2);
    });

    it('should maintain order after deduplication', () => {
      const result = normalizeTags(['gesture', 'drawing', 'gesture']);
      expect(result).toEqual(['gesture', 'drawing']);
    });

    it('should return empty array for no valid tags', () => {
      expect(normalizeTags(['', '  ', ''])).toEqual([]);
    });
  });
});
