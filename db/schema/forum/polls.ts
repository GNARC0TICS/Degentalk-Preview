import { pgTable, serial, integer, boolean, timestamp, text, uuid } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { threads } from './threads';

export const polls = pgTable('polls', {
    id: serial('poll_id').primaryKey(),
    uuid: uuid('uuid').notNull().defaultRandom(),
    threadId: integer('thread_id').notNull().references(() => threads.id, { onDelete: 'cascade' }),
    question: text('question').notNull(),
    allowsMultipleChoices: boolean('allows_multiple_choices').notNull().default(false),
    expiresAt: timestamp('expires_at'),
    createdAt: timestamp('created_at').notNull().default(sql`now()`)
});

export type Poll = typeof polls.$inferSelect; 