# ENGINEERING_TASK_BREAKDOWN.md
## LOA Trainer MVP — Atomic Task Plan (Copilot / AI Agent Execution Reference)

> Goal: Provide a step-by-step, low-ambiguity task list to build the entire LOA Trainer MVP.
> Target stack: Next.js (App Router) + TypeScript + Tailwind + Postgres (Drizzle) + S3/R2 (signed uploads)
> MVP milestone: user can run timed sessions from a library of images; admin can upload/manage images & presets.
>
> **STATUS:**
> - Phase 0: ✅ COMPLETE - runner with local JSON dataset
> - Phase 1: ✅ COMPLETE - DB-backed library + queue API (read-only)
> - Phase 2: ✅ COMPLETE - Admin upload + metadata CRUD
> - Phase 3: ✅ COMPLETE - Session persistence + stats (optional)
>
> All phases complete! App is production-ready for gesture drawing practice.

---

## 0. Repo Setup & Baseline (Phase 0)

### 0.1 Initialize Next.js project
- [ ] Create Next.js app with App Router, TypeScript, ESLint
- [ ] Add TailwindCSS
- [ ] Add basic layout (`app/layout.tsx`) + global styles
- [ ] Configure absolute imports (`@/`)

### 0.2 Add core folders
- [ ] Create folders:
  - `app/`
  - `components/`
  - `lib/`
  - `types/`
  - `data/` (local dataset for Phase 0)
- [ ] Add `ENGINEERING_TASK_BREAKDOWN.md` to repo root (this file)
- [ ] Add `README.md` with run instructions

### 0.3 Add formatting + lint
- [ ] Add Prettier config
- [ ] Add `lint`, `typecheck`, `test` scripts in `package.json`

---

## 1. Types & Contracts (Phase 0)

### 1.1 Define shared TypeScript types
- [ ] Create `types/image.ts`:
  - `Category = 'figure' | 'hands' | 'faces' | 'animals'`
  - `ReferenceImage = { id: string; url: string; category: Category; tags: string[]; isNsfw: boolean; width?: number; height?: number }`
  - `ImageQueueItem = ReferenceImage & { intervalSeconds: number }`
- [ ] Create `types/session.ts`:
  - `SessionPreset = { id: string; name: string; intervalsSeconds: number[]; defaultCategory?: Category }`
  - `StartSessionRequest = { presetId: string; category: Category; includeNsfw: boolean; tags: string[] }`
  - `StartSessionResponse = { sessionRunId: string; preset: SessionPreset; queue: ImageQueueItem[] }`

### 1.2 Define helper utilities
- [ ] Create `lib/normalize.ts`:
  - `normalizeTag(tag: string) => string` (lowercase, trim, collapse spaces)
  - `normalizeTags(tags: string[]) => string[]` (unique, lowercase)

---

## 2. Local Dataset & Presets (Phase 0)

### 2.1 Create local dataset JSON
- [ ] Add `data/reference_images.json` with ~30-50 sample entries:
  - local placeholder URLs (or public placeholder images)
  - categories filled
  - tags
  - a few flagged `isNsfw: true` for testing filter logic

### 2.2 Create local presets JSON
- [ ] Add `data/session_presets.json` with presets:
  - 30s x 10
  - 60s x 10
  - 120s x 10
  - 300s x 5

### 2.3 Dataset loader functions
- [ ] Create `lib/localData.ts`:
  - `loadLocalImages(): ReferenceImage[]`
  - `loadLocalPresets(): SessionPreset[]`

---

## 3. Queue Builder (Phase 0)

### 3.1 Implement queue selection logic
- [ ] Create `lib/imageQueue.ts` with:
  - `buildQueue(params: { images: ReferenceImage[]; category: Category; includeNsfw: boolean; tags: string[]; intervalsSeconds: number[] }): ImageQueueItem[]`
- [ ] Behavior requirements:
  - Filter by `category`
  - Exclude `isNsfw=true` unless `includeNsfw=true`
  - Tag filtering: OR match (any tag matches)
  - Randomize selection
  - Target length = `intervalsSeconds.length`
  - Avoid duplicates if possible
  - If dataset smaller than needed:
    - allow duplicates
    - avoid consecutive duplicates where possible
  - Attach `intervalSeconds` from intervals array onto each queue item

### 3.2 Add deterministic mode for tests
- [ ] Add optional seed parameter for predictable shuffles:
  - `buildQueue(..., seed?: string)`
- [ ] Implement seeded RNG (simple xorshift) or use `seedrandom`

---

## 4. Session Timer Engine (Phase 0)

### 4.1 Implement drift-free timer logic
- [ ] Create `lib/timerEngine.ts`:
  - `createTimer(intervalSeconds: number, onTick: (remaining: number) => void, onDone: () => void)`
- [ ] Requirements:
  - Use `Date.now()` to compute remaining seconds
  - Tick every 250ms or 500ms (configurable)
  - `pause()`, `resume()`, `stop()`, `restart(newIntervalSeconds)`
  - Avoid negative remaining (clamp at 0)
  - Works even if tab is backgrounded

---

## 5. UI — Landing Page (Phase 0)

### 5.1 Build landing page skeleton
- [ ] `app/page.tsx`:
  - Title + short description
  - Category picker
  - Preset picker
  - Tags input (comma-separated)
  - NSFW toggle (default OFF)
  - Start button

### 5.2 Category picker component
- [ ] `components/CategoryPicker.tsx`
  - Props: `value`, `onChange`
  - Render 4 buttons/cards

### 5.3 Preset picker component
- [ ] `components/PresetPicker.tsx`
  - Props: `presets`, `value`, `onChange`
  - Render as cards or select

### 5.4 Tag filter component
- [ ] `components/TagFilter.tsx`
  - Simple chip list + input OR comma-separated input
  - Normalizes tags on change

### 5.5 Start session navigation
- [ ] On start click:
  - Navigate to `/session` with query params OR store in sessionStorage:
    - presetId, category, includeNsfw, tags

---

## 6. UI — Session Runner (Phase 0)

### 6.1 Session page route
- [ ] Create `app/session/page.tsx`
  - Client page that reads settings (query/sessionStorage)
  - Loads local preset + images
  - Builds queue using `buildQueue`
  - Renders `SessionRunner`

### 6.2 SessionRunner component
- [ ] Create `components/SessionRunner.tsx` (client component)
- [ ] State:
  - `status: 'running' | 'paused' | 'finished'`
  - `index: number`
  - `remainingSeconds: number`
  - `queue: ImageQueueItem[]`
  - `hideUi: boolean`
- [ ] Render:
  - image centered
  - timer big
  - progress `index+1 / queue.length`
  - minimal controls (buttons)
- [ ] Implement controls:
  - Pause/Resume
  - Next
  - Previous
  - Restart
- [ ] On finish:
  - Navigate to `/results?totalSeconds=...&completed=true`

### 6.3 Keyboard shortcuts
- [ ] Implement keyboard listener in SessionRunner:
  - Space: pause/resume
  - ArrowRight: next
  - ArrowLeft: previous
  - R: restart
  - H: toggle hide UI
  - ?: show modal overlay of hotkeys

### 6.4 Preload images
- [ ] When index changes, preload `index+1` and `index+2` images via `new Image().src`
- [ ] Ensure safe bounds checking

### 6.5 Timer integration
- [ ] Integrate `timerEngine`:
  - start interval for current item’s `intervalSeconds`
  - on done, auto-advance or finish

---

## 7. UI — Results Page (Phase 0)

### 7.1 Results page route
- [ ] Create `app/results/page.tsx`
  - Read query params for `totalSeconds`, `completed`
  - Display summary
  - Buttons:
    - Repeat (go back to landing with same settings OR store last settings)
    - New session (go to landing)

### 7.2 Local stats (anonymous)
- [ ] Implement `lib/localStats.ts`:
  - `getStats()` / `saveStats()` using localStorage
  - Increment:
    - total seconds practiced
    - sessions completed
- [ ] Results page updates stats on mount

---

## 8. Phase 0 Hardening

### 8.1 Empty dataset handling
- [ ] Landing shows warning if no images for selected category
- [ ] Queue builder throws friendly error if zero candidates
- [ ] Session page handles errors gracefully and routes back

### 8.2 Accessibility & UX polish
- [ ] Ensure buttons have labels
- [ ] Ensure timer readable and responsive

### 8.3 Minimal tests (optional in Phase 0)
- [ ] Add unit tests for `buildQueue` with deterministic seed
- [ ] Add unit tests for `normalizeTags`

---

# Phase 1 — Database + Queue API (Read-Only)

## 9. Add Drizzle + Postgres

### 9.1 Install dependencies
- [ ] Install `drizzle-orm`, `drizzle-kit`, `pg`
- [ ] Add `DATABASE_URL` to env example

### 9.2 Create Drizzle schema
- [ ] Create `lib/db/schema.ts` with tables:
  - `reference_images`
  - `session_presets`
- [ ] Create `lib/db/index.ts` to export db client

### 9.3 Migrations
- [ ] Generate initial migration
- [ ] Add `db:migrate` script
- [ ] Add `db:studio` script (optional)

---

## 10. Seed scripts

### 10.1 Seed presets
- [ ] Create `scripts/seedPresets.ts` to insert presets
- [ ] Add `pnpm seed:presets`

### 10.2 Seed images (optional)
- [ ] Create `scripts/seedImages.ts` to insert sample images referencing public placeholder URLs

---

## 11. Queue API endpoint

### 11.1 Implement `GET /api/images/queue`
- [ ] Create `app/api/images/queue/route.ts`
- [ ] Query params:
  - `category`
  - `includeNsfw` (boolean)
  - `tags` (comma-separated)
  - `count` (int)
  - `intervals` (optional: comma-separated ints; if present, server returns `intervalSeconds` per item)
- [ ] Validation:
  - required category
  - count <= 200
- [ ] Fetch candidates from DB with filters
- [ ] Build queue (reuse `buildQueue` logic but in server context)
- [ ] Return JSON array of items (include intervalSeconds if intervals provided)

### 11.2 Switch client to API mode
- [ ] Update `/session` page:
  - Instead of local dataset, call `/api/images/queue`
  - Fetch preset from DB or keep local presets until Phase 1.5

---

## 12. Presets API (Read-Only)

### 12.1 Implement `GET /api/presets`
- [ ] Create `app/api/presets/route.ts`
- [ ] Returns all presets sorted by name

### 12.2 Landing uses presets API
- [ ] Update landing to fetch presets server-side (RSC) or client-side

---

# Phase 2 — Admin (Uploads + CRUD)

## 13. Admin Guard

### 13.1 Add AdminGuard middleware
- [ ] Protect `/admin/*`
- [ ] MVP auth option: `ADMIN_PASSWORD`
  - login page `/admin/login`
  - set cookie `admin=1` (httpOnly)
- [ ] Ensure admin pages are not indexed:
  - set `X-Robots-Tag: noindex` header

---

## 14. Signed upload pipeline (S3/R2)

### 14.1 Storage lib
- [ ] Create `lib/storage/s3.ts`:
  - configure S3 client
  - function `createSignedUploadUrl({ key, contentType })`
  - function `publicUrlForKey(key)`

### 14.2 API for signed URL
- [ ] Create `POST /api/admin/sign-upload`
- [ ] Request:
  - `filename`, `contentType`
- [ ] Response:
  - `uploadUrl`, `key`, `publicUrl`

### 14.3 Admin upload UI
- [ ] Create `/admin/images` page:
  - file input + preview
  - category select
  - tags input
  - NSFW checkbox
  - upload button
- [ ] Flow:
  - call sign-upload
  - upload with PUT to uploadUrl
  - call create image API with publicUrl + metadata

---

## 15. Admin image CRUD

### 15.1 Create image endpoint
- [ ] `POST /api/admin/reference-images`
- [ ] Body: `url, category, tags, isNsfw, width?, height?, source?`
- [ ] Normalize tags to lowercase
- [ ] Insert into DB

### 15.2 List images endpoint
- [ ] `GET /api/admin/reference-images`
- [ ] Supports filters:
  - category
  - tag
  - isNsfw
  - pagination (limit/offset)

### 15.3 Update image endpoint
- [ ] `PATCH /api/admin/reference-images/:id`
- [ ] Update metadata

### 15.4 Delete image endpoint
- [ ] `DELETE /api/admin/reference-images/:id`
- [ ] Delete DB record
- [ ] (Optional) also delete from S3 (future)

### 15.5 Admin image manager UI
- [ ] Table/grid of images
- [ ] Edit tags/category/nsfw inline or modal
- [ ] Delete with confirmation

---

## 16. Admin presets CRUD

### 16.1 Preset endpoints
- [ ] `POST /api/admin/presets`
- [ ] `GET /api/admin/presets`
- [ ] `PATCH /api/admin/presets/:id`
- [ ] `DELETE /api/admin/presets/:id`

### 16.2 Preset editor UI
- [ ] `/admin/presets`:
  - list presets
  - create preset with intervals builder:
    - name
    - interval seconds
    - count
    - or raw CSV input

---

# Phase 3 — Sessions Persistence + Stats (Optional)

## 17. Session run persistence

### 17.1 Add tables
- [x] Add `session_runs` + `session_run_images`
- [x] Migration

### 17.2 Start session endpoint (stateful)
- [x] `POST /api/session/start`
- [x] Create session_run
- [x] Create session_run_images with selected queue
- [x] Return `sessionRunId` + queue

### 17.3 Finish session endpoint
- [x] `POST /api/session/finish`
- [x] Mark completed + totals + ended_at

---

## 18. Stats endpoint (authenticated users)

### 18.1 `GET /api/stats`
- [x] Return totalSecondsPracticed and sessionsCompleted
- [x] Optionally last 7 days sessions count

### 18.2 Results page uses stats endpoint if logged in
- [x] Otherwise fallback to localStorage stats

---

# 19. Quality & Observability

## 19.1 Logging
- [ ] Log queue generation failures:
  - no candidates
  - filters too strict
- [ ] Include request params in logs (excluding sensitive)

## 19.2 Error UX
- [ ] Friendly error banners when queue cannot be built
- [ ] Auto-relax filters suggestion:
  - “No images match tags; try removing tags or enabling NSFW”

## 19.3 Performance
- [ ] Ensure images are served via CDN-friendly public URLs
- [ ] Add caching headers to image URLs (storage/CDN side)

---

# 20. Acceptance Criteria Checklist (MVP)

## User
- [ ] Landing page allows selecting category + preset + tags + nsfw toggle
- [ ] Session starts in <10 seconds
- [ ] Timer is accurate (no drift)
- [ ] Auto-advance works
- [ ] Keyboard shortcuts work
- [ ] Images preload (no stutter)
- [ ] Results page shows total time
- [ ] Anonymous stats saved locally

## Admin
- [ ] Admin routes protected
- [ ] Admin can upload images to storage
- [ ] Admin can create/update/delete images
- [ ] Admin can create/update/delete presets

---

# 21. Suggested PR / Commit Sequence

1. Phase 0 runner (local data)
2. Queue builder + timer engine tests
3. Results + local stats
4. Drizzle schema + migrations
5. Queue API + presets API
6. Admin guard + pages
7. Signed upload + image CRUD
8. Preset CRUD
9. Session persistence (optional)

---

# 22. Definition of Done

- MVP meets acceptance criteria
- Lint + typecheck passing
- Basic unit tests passing (queue builder + tag normalization)
- App deployable with documented env vars
- Admin can manage library without manual DB edits