import { pgTable, jsonb, timestamp, uuid, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
/**
 * Stores partial/complete overrides for the canonical economy configuration.
 * Only a single row is expected at any given time – the most-recent override wins.
 */
export const economyConfigOverrides = pgTable('economy_config_overrides', {
    id: uuid('id').primaryKey().defaultRandom(),
    config: jsonb('config').notNull(), // JSON blob mirroring `economy.config.ts` shape
    createdAt: timestamp('created_at').default(sql `now()`),
    updatedAt: timestamp('updated_at').default(sql `now()`)
}, (table) => ({
    idx_economyConfigOverrides_createdAt: index('idx_economyConfigOverrides_createdAt').on(table.createdAt),
    idx_economyConfigOverrides_updatedAt: index('idx_economyConfigOverrides_updatedAt').on(table.updatedAt)
}));
//# sourceMappingURL=economyConfigOverrides.js.map