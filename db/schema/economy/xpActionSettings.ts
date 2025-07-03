import {
	pgTable, text, integer, boolean, timestamp,
	index
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const xpActionSettings = pgTable('xp_action_settings', {
	action: text('action').primaryKey(),
	baseValue: integer('base_value').notNull(),
	description: text('description').notNull(),
	maxPerDay: integer('max_per_day'),
	cooldownSec: integer('cooldown_sec'),
	enabled: boolean('enabled').default(true).notNull(),
	createdAt: timestamp('created_at').default(sql`now()`),
	updatedAt: timestamp('updated_at')
		.default(sql`now()`)
		.notNull()
},
	(table) => ({
		idx_xpActionSettings_createdAt: index('idx_xpActionSettings_createdAt').on(table.createdAt),
		idx_xpActionSettings_updatedAt: index('idx_xpActionSettings_updatedAt').on(table.updatedAt),
		idx_xpActionSettings_description_search: index('idx_xpActionSettings_description_search').on(table.description),
	}));

export type XpActionSetting = typeof xpActionSettings.$inferSelect;
export type InsertXpActionSetting = typeof xpActionSettings.$inferInsert;
