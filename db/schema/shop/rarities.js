import { pgTable, varchar, integer, boolean, jsonb, timestamp, index, uuid } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
/**
 * rarities
 *
 * Defines rarity tiers (e.g. Common, Epic) for cosmetic shop items.
 */
export const rarities = pgTable('rarities', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 100 }).notNull(),
    slug: varchar('slug', { length: 100 }).notNull().unique(),
    hexColor: varchar('hex_color', { length: 10 }).notNull(),
    rarityScore: integer('rarity_score').notNull(), // 1–100 scale
    isGlow: boolean('is_glow').notNull().default(false),
    isAnimated: boolean('is_animated').notNull().default(false),
    flags: jsonb('flags').default('{}'), // Future visual FX flags
    pluginData: jsonb('plugin_data').default('{}'),
    createdAt: timestamp('created_at')
        .notNull()
        .default(sql `CURRENT_TIMESTAMP`),
    updatedAt: timestamp('updated_at')
        .notNull()
        .default(sql `CURRENT_TIMESTAMP`)
}, (table) => ({
    scoreIdx: index('idx_rarities_rarity_score').on(table.rarityScore)
}));
//# sourceMappingURL=rarities.js.map