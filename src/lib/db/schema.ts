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

export type ReferenceImageRecord = typeof referenceImages.$inferSelect;
export type ReferenceImageInsert = typeof referenceImages.$inferInsert;
export type SessionPresetRecord = typeof sessionPresets.$inferSelect;
export type SessionPresetInsert = typeof sessionPresets.$inferInsert;
