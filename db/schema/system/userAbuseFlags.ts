import { pgTable, serial, integer, timestamp, text, uuid } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from '../user/users';

export const userAbuseFlags = pgTable('user_abuse_flags', {
	id: serial('id').primaryKey(),
	userId: uuid('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	strikeCount: integer('strike_count').notNull().default(0),
	lastStrikeAt: timestamp('last_strike_at'),
	reason: text('reason'),
	createdAt: timestamp('created_at')
		.notNull()
		.default(sql`now()`),
	updatedAt: timestamp('updated_at')
		.notNull()
		.default(sql`now()`)
});

export type UserAbuseFlag = typeof userAbuseFlags.$inferSelect;
