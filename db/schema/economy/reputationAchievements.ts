import {
	pgTable,
	varchar,
	text,
	integer,
	boolean,
	timestamp,
	uuid,
	index
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
/**
 * Table: reputation_achievements
 * -----------------------------------------
 * Stores milestone definitions that grant users Reputation when achieved.
 * These milestones are criterion-based (e.g., likes received, popular threads, shop purchases).
 */
export const reputationAchievements = pgTable('reputation_achievements', {
	id: uuid('id').primaryKey().defaultRandom(),
	achievementKey: varchar('achievement_key', { length: 100 }).notNull().unique(),
	name: varchar('name', { length: 255 }).notNull(),
	description: text('description'),
	reputationReward: integer('reputation_reward').notNull().default(0),
	criteriaType: varchar('criteria_type', { length: 50 }),
	criteriaValue: integer('criteria_value'),
	enabled: boolean('enabled').notNull().default(true),
	iconUrl: varchar('icon_url', { length: 500 }),
	createdAt: timestamp('created_at')
		.notNull()
		.default(sql`now()`)
});
export type ReputationAchievement = typeof reputationAchievements.$inferSelect;
export type InsertReputationAchievement = typeof reputationAchievements.$inferInsert;
