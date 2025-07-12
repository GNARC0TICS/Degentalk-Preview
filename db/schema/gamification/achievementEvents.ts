import { pgTable, uuid, varchar, jsonb, timestamp } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from '../user/users';
export const achievementEvents = pgTable('achievement_events', {
	id: uuid('id').primaryKey().defaultRandom(),
	userId: uuid('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	eventType: varchar('event_type', { length: 100 }).notNull(),
	eventData: jsonb('event_data').notNull().default('{}'),
	triggeredAt: timestamp('triggered_at')
		.notNull()
		.default(sql`now()`),
	processedAt: timestamp('processed_at'),
	processingStatus: varchar('processing_status', { length: 20 }).notNull().default('pending')
});
export type AchievementEvent = typeof achievementEvents.$inferSelect;
export type InsertAchievementEvent = typeof achievementEvents.$inferInsert;
// Event types that can trigger achievements
export type AchievementEventType =
	| 'post_created'
	| 'thread_created'
	| 'user_login'
	| 'tip_sent'
	| 'tip_received'
	| 'shoutbox_message'
	| 'wallet_loss'
	| 'thread_necromancy'
	| 'like_given'
	| 'like_received'
	| 'thread_locked'
	| 'user_mentioned'
	| 'daily_streak'
	| 'crash_sentiment'
	| 'diamond_hands'
	| 'paper_hands'
	| 'market_prediction'
	| 'custom_event';
// Processing status types
export type ProcessingStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'skipped';
