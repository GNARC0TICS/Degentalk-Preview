import { pgTable, pgEnum, uuid, varchar, jsonb, timestamp, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from '../user/users';
// Define event type enum
export const eventTypeEnum = pgEnum('event_type', [
	'rain_claimed',
	'thread_created',
	'post_created',
	'cosmetic_unlocked',
	'level_up',
	'badge_earned',
	'tip_sent',
	'tip_received',
	'xp_earned',
	'referral_completed',
	'product_purchased',
	'airdrop_claimed'
]);
export const eventLogs = pgTable(
	'event_logs',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		eventType: eventTypeEnum('event_type').notNull(),
		relatedId: uuid('related_id'), // FK to related object (thread, cosmetic, etc.)
		meta: jsonb('meta').notNull().default({}), // Flexible payload (e.g., amount tipped, XP earned)
		createdAt: timestamp('created_at')
			.notNull()
			.default(sql`now()`)
	},
	(table) => ({
		// Index on user_id and created_at for efficient user activity feeds
		userActivityIdx: index('idx_event_logs_user_created').on(table.userId, table.createdAt),
		// Index on event_type and created_at for filtering events by type
		eventTypeIdx: index('idx_event_logs_type_created').on(table.eventType, table.createdAt)
	})
);
export type EventLog = typeof eventLogs.$inferSelect;
export type InsertEventLog = typeof eventLogs.$inferInsert;
