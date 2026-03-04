import { pgTable, uuid, text, varchar, timestamp, integer, boolean, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const referenceImages = pgTable(
  'reference_images',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    url: text('url').notNull(),
    category: varchar('category', { length: 50 }).notNull(),
    tags: text('tags').array().notNull().default(sql`ARRAY[]::text[]`),
    isNsfw: boolean('is_nsfw').notNull().default(false),
    width: integer('width'),
    height: integer('height'),
    source: text('source'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    categoryNsfw: index('idx_reference_images_category_is_nsfw').on(table.category, table.isNsfw),
    tagsIndex: index('idx_reference_images_tags').on(table.tags),
  })
);

export const sessionPresets = pgTable(
  'session_presets',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 100 }).notNull(),
    intervalsSeconds: integer('intervals_seconds').array().notNull(),
    defaultCategory: varchar('default_category', { length: 50 }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    nameUnique: uniqueIndex('idx_session_presets_name_unique').on(table.name),
  })
);

export const sessionRuns = pgTable(
  'session_runs',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    presetId: uuid('preset_id').notNull(),
    category: varchar('category', { length: 50 }).notNull(),
    tags: text('tags').array().notNull().default(sql`ARRAY[]::text[]`),
    includeNsfw: boolean('include_nsfw').notNull().default(false),
    totalSeconds: integer('total_seconds').notNull(),
    imagesCount: integer('images_count').notNull(),
    completedAt: timestamp('completed_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    presetIdx: index('idx_session_runs_preset_id').on(table.presetId),
    completedIdx: index('idx_session_runs_completed_at').on(table.completedAt),
  })
);

export const sessionRunImages = pgTable(
  'session_run_images',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    sessionRunId: uuid('session_run_id').notNull(),
    referenceImageId: uuid('reference_image_id').notNull(),
    intervalSeconds: integer('interval_seconds').notNull(),
    position: integer('position').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    sessionIdx: index('idx_session_run_images_session_run_id').on(table.sessionRunId),
    imageIdx: index('idx_session_run_images_reference_image_id').on(table.referenceImageId),
  })
);

export type ReferenceImageRecord = typeof referenceImages.$inferSelect;
export type ReferenceImageInsert = typeof referenceImages.$inferInsert;
export type SessionPresetRecord = typeof sessionPresets.$inferSelect;
export type SessionPresetInsert = typeof sessionPresets.$inferInsert;
export type SessionRunRecord = typeof sessionRuns.$inferSelect;
export type SessionRunInsert = typeof sessionRuns.$inferInsert;
export type SessionRunImageRecord = typeof sessionRunImages.$inferSelect;
export type SessionRunImageInsert = typeof sessionRunImages.$inferInsert;
