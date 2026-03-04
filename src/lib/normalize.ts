/**
 * Normalize a single tag: lowercase, trim, collapse spaces
 */
export function normalizeTag(tag: string): string {
  return tag
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

/**
 * Normalize array of tags: unique, lowercase
 */
export function normalizeTags(tags: string[]): string[] {
  const normalized = tags.map(normalizeTag).filter((t) => t.length > 0);
  return Array.from(new Set(normalized));
}
