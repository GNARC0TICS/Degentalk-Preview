/**
 * Dictionary Entries Schema @syncSchema
 * New table definitions for Degen Dictionary feature.
 */
import { pgTable, text, uuid, integer, timestamp, boolean } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from '../user/users';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
export const dictionaryEntries = pgTable('dictionary_entries', {
    id: uuid('id').primaryKey().defaultRandom(),
    slug: text('slug').notNull().unique(),
    word: text('word').notNull(),
    definition: text('definition').notNull(),
    usageExample: text('usage_example'),
    tags: text('tags').array().default([]),
    authorId: uuid('author_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    status: text('status').notNull().default('pending'), // pending | approved | rejected
    approverId: uuid('approver_id').references(() => users.id, { onDelete: 'set null' }),
    upvoteCount: integer('upvote_count').notNull().default(0),
    viewCount: integer('view_count').notNull().default(0),
    featured: boolean('featured').notNull().default(false),
    metaDescription: text('meta_description'),
    createdAt: timestamp('created_at')
        .notNull()
        .default(sql `CURRENT_TIMESTAMP`),
    updatedAt: timestamp('updated_at')
        .notNull()
        .default(sql `CURRENT_TIMESTAMP`)
});
export const insertDictionaryEntrySchema = createInsertSchema(dictionaryEntries, {
    word: z.string().min(2).max(50),
    definition: z.string().min(20).max(5000),
    usageExample: z.string().optional(),
    tags: z.array(z.string()).max(5).optional()
}).omit({
    id: true,
    status: true,
    approverId: true,
    upvoteCount: true,
    viewCount: true,
    featured: true,
    metaDescription: true,
    createdAt: true,
    updatedAt: true
});
//# sourceMappingURL=entries.js.map