# Phase 1: Database Integration Setup Guide

This guide walks you through setting up PostgreSQL and connecting the gesture drawing app to a real database.

## Overview

Phase 1 transitions the app from local JSON data (Phase 0) to a PostgreSQL database with API endpoints. All UI components remain unchanged—only the data layer has been updated.

### What's New in Phase 1

1. **PostgreSQL Database** - Stores reference images and session presets
2. **Drizzle ORM** - Type-safe database queries with auto-generated migration files
3. **API Endpoints** - Two new REST endpoints for fetching presets and building image queues
4. **Type Safety** - Full TypeScript support throughout the data layer

### Reused from Phase 0

- All UI components (`SessionRunner`, `CategoryPicker`, `PresetPicker`, etc.)
- All filtering logic (`buildQueue()`, tag normalization, etc.)
- All styling and user experience

## Prerequisites

Before starting, ensure you have:

1. **PostgreSQL 13+** installed and running
   - OR access to a managed PostgreSQL service (Neon, Supabase, AWS RDS, etc.)
2. **Node.js 18+** and npm (already installed for Phase 0)
3. **DATABASE_URL** environment variable pointing to your PostgreSQL instance

## Step 1: Create PostgreSQL Database

### Option A: Local PostgreSQL

```bash
# Create a new database
createdb gesture_drawing

# Verify connection
psql -d gesture_drawing -c "SELECT version();"
```

Your DATABASE_URL will be:
```
postgresql://postgres:password@localhost:5432/gesture_drawing
```

### Option B: Managed PostgreSQL (Recommended)

Use a managed service for zero setup:

**Neon** (Free tier, serverless):
1. Go to [neon.tech](https://neon.tech)
2. Sign up and create a new project
3. Copy the connection string (starts with `postgresql://`)

**Supabase** (Free tier, includes auth & more):
1. Go to [supabase.com](https://supabase.com)
2. Sign up and create a new project
3. In Project Settings → Database, copy the "Session pooler" URL

**AWS RDS** (Free tier available):
1. Create RDS instance via AWS Console
2. Copy the endpoint and build URL:
   ```
   postgresql://admin:password@myinstance.xxxxx.us-east-1.rds.amazonaws.com:5432/gesture_drawing
   ```

## Step 2: Configure Environment Variables

1. Copy the example file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` and set your DATABASE_URL:
   ```env
   DATABASE_URL=postgresql://user:password@host:port/database
   ```

   Replace with your actual database URL from Step 1.

3. Verify the file is NOT committed (it's in `.gitignore`):
   ```bash
   git check-ignore .env.local  # Should output: .env.local
   ```

## Step 3: Generate and Run Migrations

Drizzle Kit generates SQL migration files from the TypeScript schema.

```bash
# Generate migration files (creates drizzle/ folder with .sql files)
npm run db:generate

# Run migrations to create tables in your database
npm run db:migrate
```

After running these commands:
- ✅ `referenceImages` table created with indexes
- ✅ `sessionPresets` table created with unique name constraint
- ✅ Schema ready to accept data

## Step 4: Seed Initial Data

The seed script populates your database with 25 sample images and 7 presets (same data from Phase 0 JSON).

```bash
npm run db:seed
```

You should see:
```
✅ Seeded database with 25 reference images
✅ Seeded database with 7 session presets
```

If you run this command multiple times, it will skip duplicates (using `onConflictDoNothing()`).

## Step 5: Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Testing the Database Integration

1. **Landing Page** - Should load 7 presets from the database (not local JSON)
2. **SessionRunner** - Should have category images fetched from the database
3. **Error Handling** - Try invalid categories to see error messages

If you see errors, check:
- DATABASE_URL is set correctly in `.env.local`
- PostgreSQL is running and accessible
- Migrations have been applied (`npm run db:migrate`)
- Database has been seeded (`npm run db:seed`)

## Troubleshooting

### "ECONNREFUSED" error

**Cause:** PostgreSQL is not running or DATABASE_URL is incorrect

**Solution:**
```bash
# Check PostgreSQL status
psql -d gesture_drawing -c "SELECT 1"

# If connection fails, verify DATABASE_URL
cat .env.local | grep DATABASE_URL
```

### "relation 'referenceImages' does not exist"

**Cause:** Migrations haven't been run

**Solution:**
```bash
npm run db:migrate
npm run db:seed
```

### "Failed to fetch presets" on landing page

**Cause:** Database error or schema not created properly

**Solution:**
1. Check browser console for detailed error
2. Verify migrations: `npm run db:migrate`
3. Verify data: Connect directly to DB
   ```bash
   psql -d gesture_drawing -c "SELECT COUNT(*) FROM session_presets;"
   ```

### Changes to Schema

If you need to modify the schema (`src/lib/db/schema.ts`):

```bash
# 1. Edit the schema
# 2. Generate new migration
npm run db:generate

# 3. Review the generated SQL in drizzle/
# 4. Apply the migration
npm run db:migrate

# 5. Re-seed if needed (may lose data)
npm run db:seed
```

## API Endpoints Reference

### GET /api/presets

Returns all session presets from the database.

```bash
curl http://localhost:3000/api/presets
```

Response:
```json
[
  {
    "id": "preset-1",
    "name": "Quick Sketches",
    "intervalsSeconds": [30, 30, 30],
    "defaultCategory": "figure",
    "createdAt": "2024-01-01T00:00:00Z"
  },
  ...
]
```

### GET /api/images/queue

Returns a randomized queue of reference images with timing intervals.

Query Parameters:
- `category` (required): `figure` | `hands` | `faces` | `animals`
- `includeNsfw` (optional): `true` | `false` (default: `false`)
- `tags` (optional): comma-separated tag names (e.g., `gesture,anatomy`)
- `intervals` (optional): comma-separated intervals in seconds (overrides count)
- `count` (optional): number of images (default: `10`, max: `200`)

```bash
# Example: 10 figure images, no NSFW
curl "http://localhost:3000/api/images/queue?category=figure&includeNsfw=false"

# Example: hands with anatomy tag
curl "http://localhost:3000/api/images/queue?category=hands&tags=anatomy"

# Example: custom timing
curl "http://localhost:3000/api/images/queue?category=faces&intervals=60,60,120"
```

Response:
```json
[
  {
    "id": "img-1",
    "url": "https://...",
    "category": "figure",
    "tags": ["gesture", "anatomy"],
    "isNsfw": false,
    "intervalSeconds": 30
  },
  ...
]
```

## Database Schema

### referenceImages table

| Column      | Type        | Notes                       |
|-------------|-------------|-----------------------------|
| id          | uuid        | Primary key                 |
| url         | text        | Image URL                   |
| category    | text        | figure/hands/faces/animals  |
| tags        | text[]      | Array of tag strings        |
| isNsfw      | boolean     | Content flag                |
| width       | integer?    | Optional image width        |
| height      | integer?    | Optional image height       |
| source      | text?       | Optional attribution        |
| createdAt   | timestamp   | Auto-set on insert          |

**Indexes:** (category, isNsfw) composite index for query performance

### sessionPresets table

| Column              | Type        | Notes              |
|---------------------|-------------|--------------------|
| id                  | uuid        | Primary key        |
| name                | text        | Unique preset name |
| intervalsSeconds    | integer[]   | Array of intervals |
| defaultCategory     | text        | Default category   |
| createdAt           | timestamp   | Auto-set on insert |

**Indexes:** Unique index on name

## Next Steps

### Phase 1 Enhancements (Future Iterations)

- [ ] Admin panel for uploading custom reference images
- [ ] Tag management UI
- [ ] Preset editor (create/modify/delete)
- [ ] Session results persistence (store in database)
- [ ] User accounts and session history
- [ ] Analytics (most used categories, avg session length)

### For Phase 2 (Admin Uploads)

The infrastructure is ready. You'll need to:
1. Add authentication (NextAuth.js or Clerk)
2. Create admin upload form UI
3. Build `POST /api/images` endpoint with image validation
4. Integrate with image storage (local filesystem, S3, Cloudinary, etc.)

## Useful Commands Reference

```bash
# Database operations
npm run db:generate   # Generate migrations from schema
npm run db:migrate    # Apply migrations to database
npm run db:seed       # Populate with sample data
npm run db:push       # Drizzle Kit push (alternative to migrate)

# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run test         # Run Jest tests

# Code quality
npm run lint         # Run ESLint
npm run format       # Run Prettier
```

## Architecture Overview

```
┌─────────────────┐
│   React Client  │
├─────────────────┤
│  app/page.tsx   │ ← Fetches /api/presets
│  app/session/   │ ← Fetches /api/images/queue
│  Components     │
└────────┬────────┘
         │ HTTP
         ▼
┌─────────────────────┐
│   Next.js Routes    │
├─────────────────────┤
│ /api/presets        │
│ /api/images/queue   │
└────────┬────────────┘
         │ Drizzle ORM
         ▼
┌─────────────────────┐
│   PostgreSQL DB     │
├─────────────────────┤
│ referenceImages     │
│ sessionPresets      │
└─────────────────────┘
```

## Support

For issues or questions:
1. Check this guide's Troubleshooting section
2. Review API endpoint documentation
3. Check database connectivity: `psql -d gesture_drawing -c "SELECT 1"`
4. Check Next.js logs in terminal
5. Check browser DevTools Network and Console tabs

Happy practicing! 🎨
