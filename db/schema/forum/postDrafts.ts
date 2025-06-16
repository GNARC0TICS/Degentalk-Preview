import { pgTable, serial, /*integer,*/ text, jsonb, timestamp, uuid, integer } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { threads } from './threads'; // Adjusted import
import { users } from '../user/users'; // Adjusted import

export const postDrafts = pgTable('post_drafts', {
	id: serial('draft_id').primaryKey(),
	uuid: uuid('uuid').notNull().defaultRandom(),
	threadId: integer('thread_id').references(() => threads.id, { onDelete: 'cascade' }),
	userId: uuid('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	content: text('content'),
	editorState: jsonb('editor_state'),
	updatedAt: timestamp('updated_at')
		.notNull()
		.default(sql`now()`),
	createdAt: timestamp('created_at')
		.notNull()
		.default(sql`now()`)
});

// Add zod schema or relations as needed
// export type PostDraft = typeof postDrafts.$inferSelect;
// export type InsertPostDraft = typeof postDrafts.$inferInsert;
