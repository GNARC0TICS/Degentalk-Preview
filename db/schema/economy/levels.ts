import { pgTable, integer, bigint, varchar } from 'drizzle-orm/pg-core';
import { titles } from './titles'; // Placeholder
import { badges } from './badges'; // Placeholder

export const levels = pgTable('levels', {
	level: integer('level').primaryKey().notNull(),
	minXp: bigint('min_xp', { mode: 'number' }).notNull().default(0),
	name: varchar('name', { length: 100 }),
	rewardDgt: integer('reward_dgt').default(0),
	rewardTitleId: integer('reward_title_id').references(() => titles.id, { onDelete: 'set null' }),
	rewardBadgeId: integer('reward_badge_id').references(() => badges.id, { onDelete: 'set null' })
});

import { createInsertSchema } from 'drizzle-zod';
export const insertLevelSchema = createInsertSchema(levels);
export type Level = typeof levels.$inferSelect;
export type InsertLevel = typeof levels.$inferInsert;
