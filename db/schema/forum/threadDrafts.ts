import {
	pgTable,
	serial,
	varchar,
	text,
	jsonb,
	timestamp,
	uuid,
	index
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { users } from '../user/users';
import { forumStructure } from './structure'; // Updated to use forum structure
import { threadPrefixes } from './prefixes'; // Assuming you have threadPrefixes schema

export const threadDrafts = pgTable('thread_drafts', {
	id: uuid('id').primaryKey().defaultRandom(),
	uuid: uuid('uuid').notNull().defaultRandom(), // This is a separate uuid field
	userId: uuid('user_id') // Changed to uuid
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	structureId: uuid('structure_id').references(() => forumStructure.id, {
		onDelete: 'set null'
	}), // Updated to UUID to match forumStructure PK
	prefixId: uuid('prefix_id').references(() => threadPrefixes.id, { onDelete: 'set null' }), // Updated to UUID to match threadPrefixes PK
	title: varchar('title', { length: 255 }),
	content: text('content'),
	editorState: jsonb('editor_state'), // To store Tiptap's JSON state
	tags: jsonb('tags'), // Storing tags as a JSON array of strings
	updatedAt: timestamp('updated_at')
		.notNull()
		.default(sql`now()`),
	createdAt: timestamp('created_at')
		.notNull()
		.default(sql`now()`)
});

export type ThreadDraft = typeof threadDrafts.$inferSelect;
export type InsertThreadDraft = typeof threadDrafts.$inferInsert;

// Zod schemas for validation
export const insertThreadDraftSchema = createInsertSchema(threadDrafts);
export const selectThreadDraftSchema = createSelectSchema(threadDrafts);
