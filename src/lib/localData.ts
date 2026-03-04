import { ReferenceImage, SessionPreset } from '@/types';

// For development, we load from public/data JSON files
// These are fetched client-side via fetch or imported if in a node context
// During rendering, this should use the public data

let cachedImages: ReferenceImage[] | null = null;
let cachedPresets: SessionPreset[] | null = null;

export async function loadLocalImages(): Promise<ReferenceImage[]> {
  if (cachedImages) return cachedImages;

  const res = await fetch('/data/reference_images.json');
  if (!res.ok) throw new Error('Failed to load reference images');
  cachedImages = await res.json();
  return cachedImages || [];
}

export async function loadLocalPresets(): Promise<SessionPreset[]> {
  if (cachedPresets) return cachedPresets;

  const res = await fetch('/data/session_presets.json');
  if (!res.ok) throw new Error('Failed to load session presets');
  cachedPresets = await res.json();
  return cachedPresets || [];
}

// For server-side loading (used in route handlers)
export async function loadLocalImagesServer(): Promise<ReferenceImage[]> {
  try {
    const { readFileSync } = await import('fs');
    const { resolve } = await import('path');

    const filePath = resolve(process.cwd(), 'public/data/reference_images.json');
    const data = readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    // Fallback to empty array if not in node environment
    return [];
  }
}

export async function loadLocalPresetsServer(): Promise<SessionPreset[]> {
  try {
    const { readFileSync } = await import('fs');
    const { resolve } = await import('path');

    const filePath = resolve(process.cwd(), 'public/data/session_presets.json');
    const data = readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    // Fallback to empty array if not in node environment
    return [];
  }
}
