import { pgTable, integer, bigint, varchar, jsonb, uuid } from 'drizzle-orm/pg-core';
import { titles } from './titles'; // Placeholder
import { badges } from './badges'; // Placeholder

export const levels = pgTable('levels', {
	id: uuid('id').primaryKey().defaultRandom(),
	level: integer('level').notNull().unique(),
	/**
	 * XP required to reach (keeps legacy column name `min_xp` for backward-compat).
	 * A view / trigger can map to `xp_required` once all codepaths are updated.
	 */
	minXp: bigint('min_xp', { mode: 'number' }).notNull().default(0),

	/** Display name / default title shown for the level */
	name: varchar('name', { length: 100 }),

	/** ──────────── New Visual Customisation Fields ──────────── */
	iconUrl: varchar('icon_url', { length: 255 }),
	rarity: varchar('rarity', { length: 10 }).default('common'), // common | rare | epic | legendary | mythic
	frameUrl: varchar('frame_url', { length: 255 }),
	colorTheme: varchar('color_theme', { length: 25 }),
	animationEffect: varchar('animation_effect', { length: 30 }),

	/**
	 * Unlock payload – arbitrary cosmetics or perks granted at the level.
	 * Example: { "titles": [12], "badges": [3], "discounts": { "shop": 10 } }
	 */
	unlocks: jsonb('unlocks'),

	/** ──────────── Existing Reward Columns ──────────── */
	rewardDgt: integer('reward_dgt').default(0),
	rewardTitleId: integer('reward_title_id').references(() => titles.id, { onDelete: 'set null' }),
	rewardBadgeId: integer('reward_badge_id').references(() => badges.id, { onDelete: 'set null' })
});

import { createInsertSchema } from 'drizzle-zod';
export const insertLevelSchema = createInsertSchema(levels);
export type Level = typeof levels.$inferSelect;
export type InsertLevel = typeof levels.$inferInsert;
