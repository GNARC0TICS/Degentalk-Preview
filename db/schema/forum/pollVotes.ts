import { pgTable, serial, integer, timestamp } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { pollOptions } from './pollOptions';
import { users } from '../user/users';

export const pollVotes = pgTable('poll_votes', {
    id: serial('vote_id').primaryKey(),
    optionId: integer('option_id').notNull().references(() => pollOptions.id, { onDelete: 'cascade' }),
    userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').notNull().default(sql`now()`)
});

export type PollVote = typeof pollVotes.$inferSelect; 