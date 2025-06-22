import { pgTable, serial, uuid, timestamp, index, unique } from 'drizzle-orm/pg-core';
import { users } from '../user/users';

/**
 * User Follows Table (Whale Watch System)
 *
 * Tracks who follows whom in the DegenTalk Whale Watch system.
 * This is a uni-directional follow system (like Twitter/X).
 */
export const userFollows = pgTable(
	'user_follows',
	{
		id: serial('id').primaryKey(),
		followerId: uuid('follower_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		followeeId: uuid('followee_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		createdAt: timestamp('created_at').defaultNow().notNull()
	},
	(table) => ({
		// Unique constraint to prevent duplicate follows
		uniqueFollow: unique().on(table.followerId, table.followeeId),
		// Indexes for efficient lookups
		followerIdx: index('follower_idx').on(table.followerId),
		followeeIdx: index('followee_idx').on(table.followeeId),
		createdAtIdx: index('follows_created_at_idx').on(table.createdAt)
	})
);
