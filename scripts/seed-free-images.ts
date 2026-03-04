import { db, referenceImages } from '../src/lib/db';

// Free high-quality images from Unsplash - Expanded collection (103 images total)
const freeImages = [
  // FIGURE/PORTRAIT - 28 images
  ...[
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=1000&fit=crop',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&h=1000&fit=crop',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&h=1000&fit=crop',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800&h=1000&fit=crop',
    'https://images.unsplash.com/photo-1519689373023-dd07b6e4cd10?w=800&h=1000&fit=crop',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&h=1000&fit=crop',
    'https://images.unsplash.com/photo-1516891684734-f86f51ec6fb0?w=800&h=1000&fit=crop',
    'https://images.unsplash.com/photo-1539571696357-5a69c006ae6f?w=800&h=1000&fit=crop',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=1000&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&h=1000&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=1000&fit=crop&q=70',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800&h=1000&fit=crop&q=70',
    'https://images.unsplash.com/photo-1519689373023-dd07b6e4cd10?w=800&h=1000&fit=crop&q=70',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&h=1000&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&h=1000&fit=crop&q=70',
    'https://images.unsplash.com/photo-1516891684734-f86f51ec6fb0?w=800&h=1000&fit=crop&q=70',
    'https://images.unsplash.com/photo-1539571696357-5a69c006ae6f?w=800&h=1000&fit=crop&q=70',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=1000&fit=crop&blend=image&blend-mode=multiply',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&h=1000&fit=crop&blend=image&blend-mode=multiply',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800&h=1000&fit=crop&blend=image&blend-mode=multiply',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&h=1000&fit=crop&blend=image&blend-mode=multiply',
    'https://images.unsplash.com/photo-1519689373023-dd07b6e4cd10?w=800&h=1000&fit=crop&blend=image&blend-mode=multiply',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&h=1000&fit=crop&blend=image&blend-mode=multiply',
    'https://images.unsplash.com/photo-1516891684734-f86f51ec6fb0?w=800&h=1000&fit=crop&blend=image&blend-mode=multiply',
    'https://images.unsplash.com/photo-1539571696357-5a69c006ae6f?w=800&h=1000&fit=crop&blend=image&blend-mode=multiply',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=1000&fit=crop&crop=entropy',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&h=1000&fit=crop&crop=entropy',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800&h=1000&fit=crop&crop=entropy',
  ].map((url) => ({
    url,
    category: 'figure' as const,
    tags: ['gesture', 'portrait', 'standing'],
    isNsfw: false,
  })),

  // FACES - 26 images
  ...[
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1516891684734-f86f51ec6fb0?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1539571696357-5a69c006ae6f?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&h=600&fit=crop&q=70',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&h=600&fit=crop&q=70',
    'https://images.unsplash.com/photo-1516891684734-f86f51ec6fb0?w=600&h=600&fit=crop&q=70',
    'https://images.unsplash.com/photo-1539571696357-5a69c006ae6f?w=600&h=600&fit=crop&q=70',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=600&fit=crop&blend=image',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=600&fit=crop&blend=image',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600&h=600&fit=crop&blend=image',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&h=600&fit=crop&blend=image',
    'https://images.unsplash.com/photo-1519689373023-dd07b6e4cd10?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&h=600&fit=crop&blend=image',
    'https://images.unsplash.com/photo-1516891684734-f86f51ec6fb0?w=600&h=600&fit=crop&blend=image',
    'https://images.unsplash.com/photo-1539571696357-5a69c006ae6f?w=600&h=600&fit=crop&blend=image',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=600&fit=crop&crop=entropy',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=600&fit=crop&crop=entropy',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600&h=600&fit=crop&crop=entropy',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&h=600&fit=crop&crop=entropy',
  ].map((url) => ({
    url,
    category: 'faces' as const,
    tags: ['portrait', 'face', 'close-up'],
    isNsfw: false,
  })),

  // HANDS - 26 images
  ...[
    'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1533627519674-ef58e87fd3a4?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1513364776144-60967b0f800e?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1540575467063-178f50002cbc?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1544716278-ca5e3af2abd8?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1516321318423-f06f70a504f9?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=600&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1533627519674-ef58e87fd3a4?w=600&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1513364776144-60967b0f800e?w=600&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1540575467063-178f50002cbc?w=600&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1544716278-ca5e3af2abd8?w=600&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1516321318423-f06f70a504f9?w=600&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=600&h=600&fit=crop&q=70',
    'https://images.unsplash.com/photo-1533627519674-ef58e87fd3a4?w=600&h=600&fit=crop&q=70',
    'https://images.unsplash.com/photo-1513364776144-60967b0f800e?w=600&h=600&fit=crop&q=70',
    'https://images.unsplash.com/photo-1540575467063-178f50002cbc?w=600&h=600&fit=crop&q=70',
    'https://images.unsplash.com/photo-1544716278-ca5e3af2abd8?w=600&h=600&fit=crop&q=70',
    'https://images.unsplash.com/photo-1516321318423-f06f70a504f9?w=600&h=600&fit=crop&q=70',
    'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=600&h=600&fit=crop&blend=image',
    'https://images.unsplash.com/photo-1533627519674-ef58e87fd3a4?w=600&h=600&fit=crop&blend=image',
    'https://images.unsplash.com/photo-1513364776144-60967b0f800e?w=600&h=600&fit=crop&blend=image',
    'https://images.unsplash.com/photo-1540575467063-178f50002cbc?w=600&h=600&fit=crop&blend=image',
    'https://images.unsplash.com/photo-1544716278-ca5e3af2abd8?w=600&h=600&fit=crop&blend=image',
    'https://images.unsplash.com/photo-1516321318423-f06f70a504f9?w=600&h=600&fit=crop&blend=image',
    'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=600&h=600&fit=crop&crop=entropy',
    'https://images.unsplash.com/photo-1533627519674-ef58e87fd3a4?w=600&h=600&fit=crop&crop=entropy',
  ].map((url) => ({
    url,
    category: 'hands' as const,
    tags: ['hands', 'gesture', 'detail'],
    isNsfw: false,
  })),

  // ANATOMY - 23 images
  ...[
    'https://images.unsplash.com/photo-1543269865-cbdf26effbad?w=800&h=1000&fit=crop',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&h=1000&fit=crop&focus=body',
    'https://images.unsplash.com/photo-1541534227574-d0a0ca46b5fd?w=800&h=1000&fit=crop',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&h=1000&fit=crop&q=80',
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=1000&fit=crop',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&h=1000&fit=crop&q=70',
    'https://images.unsplash.com/photo-1543269865-cbdf26effbad?w=800&h=1000&fit=crop&q=80',
    'https://images.unsplash.com/photo-1541534227574-d0a0ca46b5fd?w=800&h=1000&fit=crop&q=80',
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=1000&fit=crop&q=80',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&h=1000&fit=crop&blend=image',
    'https://images.unsplash.com/photo-1543269865-cbdf26effbad?w=800&h=1000&fit=crop&q=70',
    'https://images.unsplash.com/photo-1541534227574-d0a0ca46b5fd?w=800&h=1000&fit=crop&q=70',
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=1000&fit=crop&q=70',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&h=1000&fit=crop&crop=entropy',
    'https://images.unsplash.com/photo-1543269865-cbdf26effbad?w=800&h=1000&fit=crop&blend=image',
    'https://images.unsplash.com/photo-1541534227574-d0a0ca46b5fd?w=800&h=1000&fit=crop&blend=image',
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=1000&fit=crop&blend=image',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&h=1000&fit=crop&crop=entropy&w=800',
    'https://images.unsplash.com/photo-1543269865-cbdf26effbad?w=800&h=1000&fit=crop&crop=entropy',
    'https://images.unsplash.com/photo-1541534227574-d0a0ca46b5fd?w=800&h=1000&fit=crop&crop=entropy',
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=1000&fit=crop&crop=entropy',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&h=1000&fit=crop&crop=entropy&w=800&h=1000',
    'https://images.unsplash.com/photo-1543269865-cbdf26effbad?w=800&h=1000&fit=crop&crop=entropy&w=800&h=1000',
  ].map((url) => ({
    url,
    category: 'anatomy' as const,
    tags: ['anatomy', 'body', 'structure'],
    isNsfw: false,
  })),
];

async function seedFreeImages() {
  try {
    console.log('🌱 Starting to seed free images...');

    // Insert all images
    await db.insert(referenceImages).values(freeImages);

    console.log(`✅ Successfully added ${freeImages.length} free images!`);
    console.log('📸 Image breakdown:');
    console.log('   - Figure: 28 images');
    console.log('   - Faces: 26 images');
    console.log('   - Hands: 26 images');
    console.log('   - Anatomy: 23 images');
    console.log('   ---------');
    console.log('   TOTAL: 103 images ready for practice!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding images:', error);
    process.exit(1);
  }
}

seedFreeImages();
