import { pgTable, integer, boolean, timestamp, text, uuid, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { threads } from './threads';
export const polls = pgTable('polls', {
	id: uuid('id').primaryKey().defaultRandom(),
	uuid: uuid('uuid').notNull().defaultRandom(),
	threadId: uuid('thread_id')
		.notNull()
		.references(() => threads.id, { onDelete: 'cascade' }),
	question: text('question').notNull(),
	allowsMultipleChoices: boolean('allows_multiple_choices').notNull().default(false),
	expiresAt: timestamp('expires_at'),
	createdAt: timestamp('created_at')
		.notNull()
		.default(sql`now()`)
});
export type Poll = typeof polls.$inferSelect;
