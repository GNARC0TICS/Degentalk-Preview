import { pgTable, varchar, integer, boolean, timestamp, uuid, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
// Note: `MissionType` was defined in schema.ts, it should be moved to a types file or enums if it's a pgEnum
export const missions = pgTable('missions', {
	id: uuid('id').primaryKey().defaultRandom(),
	title: varchar('title', { length: 100 }).notNull(),
	description: varchar('description', { length: 255 }).notNull(),
	type: varchar('type', { length: 50 }).notNull(), // Corresponds to MissionType, consider pgEnum if values are fixed
	requiredAction: varchar('required_action', { length: 100 }).notNull(), // e.g., 'post_create', 'login'
	requiredCount: integer('required_count').notNull().default(1),
	xpReward: integer('xp_reward').notNull(),
	dgtReward: integer('dgt_reward'), // Nullable as not all missions might give DGT
	badgeReward: varchar('badge_reward', { length: 100 }), // Could reference badges.id if badges table is defined
	icon: varchar('icon', { length: 100 }),
	isDaily: boolean('is_daily').notNull().default(true),
	isWeekly: boolean('is_weekly').notNull().default(false),
	createdAt: timestamp('created_at').default(sql`now()`), // Changed defaultNow() to sql`now()`
	expiresAt: timestamp('expires_at'),
	isActive: boolean('is_active').notNull().default(true),
	minLevel: integer('min_level').notNull().default(1),
	sortOrder: integer('sort_order').notNull().default(0)
});
export type Mission = typeof missions.$inferSelect;
export type InsertMission = typeof missions.$inferInsert; // Assuming full insert is okay
