import { db, referenceImages, sessionPresets } from '../src/lib/db';
import { pool } from '../src/lib/db/index';

// Sample images from public/data/reference_images.json
const sampleImages = [
  {
    id: 'img-001',
    url: 'https://via.placeholder.com/512x768?text=Figure+1',
    category: 'figure',
    tags: ['gesture', 'standing'],
    isNsfw: false,
  },
  {
    id: 'img-002',
    url: 'https://via.placeholder.com/512x768?text=Figure+2',
    category: 'figure',
    tags: ['gesture', 'sitting'],
    isNsfw: false,
  },
  {
    id: 'img-003',
    url: 'https://via.placeholder.com/512x768?text=Figure+3',
    category: 'figure',
    tags: ['gesture', 'jumping'],
    isNsfw: false,
  },
  {
    id: 'img-004',
    url: 'https://via.placeholder.com/512x768?text=Figure+4',
    category: 'figure',
    tags: ['gesture', 'laying'],
    isNsfw: false,
  },
  {
    id: 'img-005',
    url: 'https://via.placeholder.com/512x768?text=Figure+5',
    category: 'figure',
    tags: ['gesture', 'standing'],
    isNsfw: false,
  },
  {
    id: 'img-006',
    url: 'https://via.placeholder.com/400x300?text=Hands+1',
    category: 'hands',
    tags: ['gesture', 'open'],
    isNsfw: false,
  },
  {
    id: 'img-007',
    url: 'https://via.placeholder.com/400x300?text=Hands+2',
    category: 'hands',
    tags: ['gesture', 'closed'],
    isNsfw: false,
  },
  {
    id: 'img-008',
    url: 'https://via.placeholder.com/400x300?text=Hands+3',
    category: 'hands',
    tags: ['gesture', 'relaxed'],
    isNsfw: false,
  },
  {
    id: 'img-009',
    url: 'https://via.placeholder.com/400x300?text=Hands+4',
    category: 'hands',
    tags: ['gesture', 'gripping'],
    isNsfw: false,
  },
  {
    id: 'img-010',
    url: 'https://via.placeholder.com/400x300?text=Hands+5',
    category: 'hands',
    tags: ['gesture', 'pointing'],
    isNsfw: false,
  },
  {
    id: 'img-011',
    url: 'https://via.placeholder.com/400x400?text=Face+1',
    category: 'faces',
    tags: ['portrait', 'neutral'],
    isNsfw: false,
  },
  {
    id: 'img-012',
    url: 'https://via.placeholder.com/400x400?text=Face+2',
    category: 'faces',
    tags: ['portrait', 'smiling'],
    isNsfw: false,
  },
  {
    id: 'img-013',
    url: 'https://via.placeholder.com/400x400?text=Face+3',
    category: 'faces',
    tags: ['portrait', 'angry'],
    isNsfw: false,
  },
  {
    id: 'img-014',
    url: 'https://via.placeholder.com/400x400?text=Face+4',
    category: 'faces',
    tags: ['portrait', 'surprised'],
    isNsfw: false,
  },
  {
    id: 'img-015',
    url: 'https://via.placeholder.com/400x400?text=Face+5',
    category: 'faces',
    tags: ['portrait', 'sad'],
    isNsfw: false,
  },
  {
    id: 'img-016',
    url: 'https://via.placeholder.com/512x512?text=Animal+1',
    category: 'animals',
    tags: ['mammal', 'standing'],
    isNsfw: false,
  },
  {
    id: 'img-017',
    url: 'https://via.placeholder.com/512x512?text=Animal+2',
    category: 'animals',
    tags: ['mammal', 'running'],
    isNsfw: false,
  },
  {
    id: 'img-018',
    url: 'https://via.placeholder.com/512x512?text=Animal+3',
    category: 'animals',
    tags: ['mammal', 'sleeping'],
    isNsfw: false,
  },
  {
    id: 'img-019',
    url: 'https://via.placeholder.com/512x512?text=Animal+4',
    category: 'animals',
    tags: ['bird', 'flying'],
    isNsfw: false,
  },
  {
    id: 'img-020',
    url: 'https://via.placeholder.com/512x512?text=Animal+5',
    category: 'animals',
    tags: ['bird', 'perched'],
    isNsfw: false,
  },
  {
    id: 'img-021',
    url: 'https://via.placeholder.com/512x768?text=Figure+NSFW+1',
    category: 'figure',
    tags: ['gesture', 'standing'],
    isNsfw: true,
  },
  {
    id: 'img-022',
    url: 'https://via.placeholder.com/512x768?text=Figure+NSFW+2',
    category: 'figure',
    tags: ['gesture', 'sitting'],
    isNsfw: true,
  },
  {
    id: 'img-023',
    url: 'https://via.placeholder.com/512x768?text=Figure+NSFW+3',
    category: 'figure',
    tags: ['gesture', 'dynamic'],
    isNsfw: true,
  },
  {
    id: 'img-024',
    url: 'https://via.placeholder.com/400x300?text=Hands+Complex+1',
    category: 'hands',
    tags: ['gesture', 'complex'],
    isNsfw: false,
  },
  {
    id: 'img-025',
    url: 'https://via.placeholder.com/400x300?text=Hands+Complex+2',
    category: 'hands',
    tags: ['gesture', 'complex'],
    isNsfw: false,
  },
];

// Sample presets
const samplePresets = [
  {
    id: 'preset-001',
    name: 'Quick Warmup',
    intervalsSeconds: [30, 30, 30, 30, 30],
    defaultCategory: 'figure',
  },
  {
    id: 'preset-002',
    name: '30s x 10',
    intervalsSeconds: [30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
    defaultCategory: 'figure',
  },
  {
    id: 'preset-003',
    name: '60s x 10',
    intervalsSeconds: [60, 60, 60, 60, 60, 60, 60, 60, 60, 60],
    defaultCategory: 'figure',
  },
  {
    id: 'preset-004',
    name: '120s x 10',
    intervalsSeconds: [
      120, 120, 120, 120, 120, 120, 120, 120, 120, 120,
    ],
    defaultCategory: 'figure',
  },
  {
    id: 'preset-005',
    name: '300s x 5',
    intervalsSeconds: [300, 300, 300, 300, 300],
    defaultCategory: 'figure',
  },
  {
    id: 'preset-006',
    name: 'Hands Mix',
    intervalsSeconds: [15, 15, 15, 20, 20, 20, 25, 25, 25, 30],
    defaultCategory: 'hands',
  },
  {
    id: 'preset-007',
    name: 'Face Study',
    intervalsSeconds: [45, 45, 45, 45, 45, 60, 60, 60],
    defaultCategory: 'faces',
  },
];

async function seed() {
  console.log('🌱 Starting database seed...');

  try {
    console.log('📸 Seeding reference images...');
    await db.insert(referenceImages).values(sampleImages as any).onConflictDoNothing();
    console.log(`✅ Inserted ${sampleImages.length} reference images`);

    console.log('📋 Seeding session presets...');
    await db.insert(sessionPresets).values(samplePresets as any).onConflictDoNothing();
    console.log(`✅ Inserted ${samplePresets.length} session presets`);

    console.log('✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seed();
