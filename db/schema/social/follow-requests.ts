import { pgTable, uuid, text, boolean, timestamp, index } from 'drizzle-orm/pg-core';
import { users } from '../user/users';

/**
 * Follow Requests Table
 * 
 * Tracks follow requests when users require approval for followers
 */
export const followRequests = pgTable(
	'follow_requests',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		requesterId: uuid('requester_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		targetId: uuid('target_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		message: text('message').default('').notNull(),
		isPending: boolean('is_pending').default(true).notNull(),
		isApproved: boolean('is_approved').default(false).notNull(),
		isRejected: boolean('is_rejected').default(false).notNull(),
		createdAt: timestamp('created_at').defaultNow().notNull(),
		respondedAt: timestamp('responded_at')
	},
	(table) => ({
		requesterIdx: index('follow_requests_requester_idx').on(table.requesterId),
		targetIdx: index('follow_requests_target_idx').on(table.targetId),
		pendingIdx: index('follow_requests_pending_idx').on(table.isPending),
		createdAtIdx: index('follow_requests_created_at_idx').on(table.createdAt)
	})
);