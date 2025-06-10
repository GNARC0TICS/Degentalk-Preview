import { pgTable, serial, integer, varchar, text, jsonb, timestamp, uuid } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { users } from "../user/users";
import { forumCategories } from "./categories"; // Assuming you have forumCategories schema
import { threadPrefixes } from "./prefixes"; // Assuming you have threadPrefixes schema

export const threadDrafts = pgTable('thread_drafts', {
  id: serial('draft_id').primaryKey(),
  uuid: uuid('uuid').notNull().defaultRandom(), // For potential public access before login? Or just unique ID.
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  categoryId: integer('category_id').references(() => forumCategories.id, { onDelete: 'set null' }),
  prefixId: integer('prefix_id').references(() => threadPrefixes.id, { onDelete: 'set null' }),
  title: varchar('title', { length: 255 }),
  content: text('content'),
  editorState: jsonb('editor_state'), // To store Tiptap's JSON state
  tags: jsonb('tags'), // Storing tags as a JSON array of strings
  updatedAt: timestamp('updated_at').notNull().default(sql`now()`),
  createdAt: timestamp('created_at').notNull().default(sql`now()`),
});

export type ThreadDraft = typeof threadDrafts.$inferSelect;
export type InsertThreadDraft = typeof threadDrafts.$inferInsert;

// Zod schemas for validation
export const insertThreadDraftSchema = createInsertSchema(threadDrafts);
export const selectThreadDraftSchema = createSelectSchema(threadDrafts);
