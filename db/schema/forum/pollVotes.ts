import { pgTable, serial, timestamp, uuid, integer } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { pollOptions } from './pollOptions';
import { users } from '../user/users';

export const pollVotes = pgTable('poll_votes', {
	id: uuid('id').primaryKey().defaultRandom(),
	optionId: integer('option_id')
		.notNull()
		.references(() => pollOptions.id, { onDelete: 'cascade' }),
	userId: uuid('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	createdAt: timestamp('created_at')
		.notNull()
		.default(sql`now()`)
});

export type PollVote = typeof pollVotes.$inferSelect;
