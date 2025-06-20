import { pgTable, serial, jsonb, timestamp } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

/**
 * Stores partial/complete overrides for the canonical economy configuration.
 * Only a single row is expected at any given time – the most-recent override wins.
 */
export const economyConfigOverrides = pgTable('economy_config_overrides', {
	id: serial('id').primaryKey(),
	config: jsonb('config').notNull(), // JSON blob mirroring `economy.config.ts` shape
	createdAt: timestamp('created_at').default(sql`now()`),
	updatedAt: timestamp('updated_at').default(sql`now()`)
});

export type EconomyConfigOverride = typeof economyConfigOverrides.$inferSelect;
export type NewEconomyConfigOverride = typeof economyConfigOverrides.$inferInsert;
