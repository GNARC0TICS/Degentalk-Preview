import { pgTable, uuid, timestamp, boolean, integer, index, unique } from 'drizzle-orm/pg-core';
import { users } from '../user/users';
/**
 * User Follows Table (Whale Watch System)
 *
 * Tracks who follows whom in the Degentalk Whale Watch system.
 * This is a uni-directional follow system (like Twitter/X).
 */
export const userFollows = pgTable(
	'user_follows',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		followerId: uuid('follower_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		followedId: uuid('followed_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		// Notification preferences
		notifyOnPosts: boolean('notify_on_posts').default(true).notNull(),
		notifyOnThreads: boolean('notify_on_threads').default(true).notNull(),
		notifyOnTrades: boolean('notify_on_trades').default(false).notNull(),
		notifyOnLargeStakes: boolean('notify_on_large_stakes').default(true).notNull(),
		minStakeNotification: integer('min_stake_notification').default(1000).notNull(),
		// Timestamps
		createdAt: timestamp('created_at').defaultNow().notNull(),
		updatedAt: timestamp('updated_at').defaultNow().notNull()
	},
	(table) => ({
		// Unique constraint to prevent duplicate follows
		uniqueFollow: unique().on(table.followerId, table.followedId),
		// Indexes for efficient lookups
		followerIdx: index('follower_idx').on(table.followerId),
		followedIdx: index('followed_idx').on(table.followedId),
		createdAtIdx: index('follows_created_at_idx').on(table.createdAt)
	})
);
