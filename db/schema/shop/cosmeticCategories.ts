import { pgTable, serial, varchar, text, boolean, timestamp, jsonb, integer, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

/**
 * cosmetic_categories
 *
 * Stores high-level grouping for cosmetic shop items (e.g. Username Colors, Avatar Frames).
 * Visual fields enable category-level theming in the admin UI.
 */
export const cosmeticCategories = pgTable(
	'cosmetic_categories',
	{
		id: serial('category_id').primaryKey(),

		name: varchar('name', { length: 100 }).notNull(),
		slug: varchar('slug', { length: 100 }).notNull().unique(),

		description: text('description'),

		// Visual styling helpers – stored as HEX strings (e.g. #FF00AA)
		bgColor: varchar('bg_color', { length: 10 }),
		textColor: varchar('text_color', { length: 10 }),
		iconUrl: varchar('icon_url', { length: 255 }),

		// Array of allowed rarity IDs; jsonb for portability between PG & SQLite
		allowedRarities: jsonb('allowed_rarities').default('[]'),

		position: integer('position').notNull().default(0),
		isActive: boolean('is_active').notNull().default(true),

		pluginData: jsonb('plugin_data').default('{}'),

		createdAt: timestamp('created_at')
			.notNull()
			.default(sql`CURRENT_TIMESTAMP`),
		updatedAt: timestamp('updated_at')
			.notNull()
			.default(sql`CURRENT_TIMESTAMP`)
	},
	(table) => ({
		slugIdx: index('idx_cosmetic_categories_slug').on(table.slug)
	})
);

export type CosmeticCategory = typeof cosmeticCategories.$inferSelect;
export type InsertCosmeticCategory = typeof cosmeticCategories.$inferInsert; 