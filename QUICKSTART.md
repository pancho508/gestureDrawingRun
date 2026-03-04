# LOA Trainer - Gesture Drawing Practice App

A fast, focus-friendly web application for gesture drawing practice. Present yourself with timed reference images from a curated library, using a minimal UI designed to maximize drawing time.

## MVP Features Completed ✅

### Phase 0: Core App (Complete)

**User Experience:**
- ⏱️ Landing page with category/preset/tag selection
- 📸 Full-screen session runner with large timer
- ⌨️ Keyboard shortcuts for control (Space, Arrow Keys, R, H, ?)
- 🖼️ Image preloading for smooth transitions
- 📊 Results page with session stats
- 💾 Local stats tracking (localStorage)

**Core Engine:**
- ✨ Drift-free timer using `Date.now()` (no setInterval drift) 
- 🎲 Queue builder with filtering (category, tags, NSFW)
- 🔄 Consecutive duplicate avoidance with shuffling
- 🎯 Deterministic randomization with seed support

**Data:**
- 📂 25+ sample reference images (4 categories)
- 📋 7 session presets (from 5×30s to 5×300s)
- 🔒 Built-in NSFW image filtering

### Code Quality
- ✅ Full TypeScript with strict mode
- ✅ Zero type errors
- ✅ Unit tests for core logic (queue builder, normalization)
- ✅ TailwindCSS for responsive design
- ✅ Prettier + ESLint configured

---

## Quick Start

### Installation

```bash
cd /Users/luzbel/repos/gestureDrawingRun
npm install --legacy-peer-deps
```

### Run Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

---

## Project Structure

```
gestureDrawingRun/
├── app/                           # Next.js App Router
│   ├── page.tsx                  # Landing page
│   ├── session/page.tsx          # Session runner
│   ├── results/page.tsx          # Results & stats
│   └── layout.tsx                # Root layout
│
├── src/
│   ├── components/               # React components
│   │   ├── CategoryPicker.tsx   # Category selector
│   │   ├── PresetPicker.tsx     # Preset selector
│   │   ├── TagFilter.tsx        # Tag input component
│   │   └── SessionRunner.tsx    # Main session UI
│   │
│   ├── lib/                      # Utilities
│   │   ├── imageQueue.ts        # Queue builder
│   │   ├── timerEngine.ts       # Drift-free timer
│   │   ├── normalize.ts         # Tag normalization
│   │   ├── localData.ts         # Data loaders
│   │   ├── localStats.ts        # Stats tracking
│   │   └── __tests__/           # Unit tests
│   │
│   └── types/                    # TypeScript types
│       ├── image.ts             # Image & queue types
│       ├── session.ts           # Session & preset types
│       └── index.ts             # Type exports
│
├── public/
│   └── data/                     # JSON data (Phase 0)
│       ├── reference_images.json
│       └── session_presets.json
│
└── jest.config.ts, tsconfig.json, etc.
```

---

## Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server (port 3000) |
| `npm run build` | Production build |
| `npm start` | Run production server |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix lint issues |
| `npm run typecheck` | TypeScript check |
| `npm test` | Run Jest tests |
| `npm run format` | Format with Prettier |

---

## Keyboard Shortcuts

During a session:

| Key | Action |
|-----|--------|
| **Space** | Pause/Resume |
| **→** | Next image |
| **←** | Previous image |
| **R** | Restart session |
| **H** | Toggle UI (hide/show) |
| **?** | Show help modal |

---

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: TailwindCSS 4
- **Testing**: Jest, React Testing Library
- **Data**: Local JSON (Phase 0) / PostgreSQL (Phase 1+)
- **Build**: Turbopack (Next.js compiler)

---

## Next Steps (Future Phases)

### Phase 1: Database + API
- [ ] Add PostgreSQL + Drizzle ORM
- [ ] Create `/api/images/queue` endpoint
- [ ] Create `/api/presets` endpoint
- [ ] Migrate from local JSON to DB queries

### Phase 2: Admin Panel
- [ ] Admin authentication (password or NextAuth)
- [ ] Image upload to S3/R2 with signed URLs
- [ ] Image CRUD endpoints
- [ ] Preset CRUD endpoints
- [ ] Admin UI for library management

### Phase 3: Session Persistence
- [ ] User authentication (optional)
- [ ] Session run table
- [ ] User stats aggregation
- [ ] Session history

---

## Data Format

### Reference Image
```typescript
{
  id: string;
  url: string;
  category: 'figure' | 'hands' | 'faces' | 'animals';
  tags: string[];
  isNsfw: boolean;
  width?: number;
  height?: number;
  source?: string;
}
```

### Session Preset
```typescript
{
  id: string;
  name: string;
  intervalsSeconds: number[];
  defaultCategory?: Category;
}
```

---

## Design Principles

1. **Speed**: <10 seconds from landing to drawing
2. **Focus**: Minimal UI during sessions
3. **Determinism**: Reproducible session behavior
4. **Low Complexity**: MVP doesn't require heavy infrastructure

---

## Contributing

- Follow TypeScript strict mode
- Add unit tests for new utilities
- Run `npm run lint:fix` before committing
- Use Prettier formatting

---

## License

MIT
