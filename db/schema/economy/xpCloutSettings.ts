import { pgTable, serial, numeric, timestamp, uuid } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const xpCloutSettings = pgTable('xp_clout_settings', {
	id: uuid('id').primaryKey().defaultRandom(),
	xpToDgtRate: numeric('xp_to_dgt_rate', { precision: 10, scale: 4 }).notNull().default('0.10'),
	cloutMultiplier: numeric('clout_multiplier', { precision: 10, scale: 4 })
		.notNull()
		.default('1.00'),
	decayRate: numeric('decay_rate', { precision: 10, scale: 4 }).notNull().default('0.05'),
	updatedAt: timestamp('updated_at')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`)
});

export type XpCloutSettings = typeof xpCloutSettings.$inferSelect;
export type InsertXpCloutSettings = typeof xpCloutSettings.$inferInsert;
