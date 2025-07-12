import {
	pgTable,
	text,
	boolean,
	integer,
	timestamp,
	jsonb,
	uuid,
	index
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
/**
 * ui_themes
 * ---------------------------------------------------------------------------
 * Stores theme configuration overrides for forum Zones.
 * This replaces the hard-coded `ZONE_THEMES` constant when `is_active = true`.
 * – `themeKey` matches the semantic key used on the frontend (e.g. "pit", "mission").
 * – Colours are expressed as Tailwind utility strings so no runtime parsing is needed.
 *
 * NOTE: This table purposely lives under the **admin** schema slice because only
 *       Admin users can mutate it through the upcoming Admin UI. It is NOT
 *       user-customisable (for now).
 */
export const uiThemes = pgTable('ui_themes', {
	id: uuid('id').primaryKey().defaultRandom(),
	/**
	 * Identifier used by the frontend to locate a theme. Example: "pit", "casino".
	 */
	themeKey: text('theme_key').notNull().unique(),
	/**
	 * Lucide icon component name OR emoji string (🌟).
	 */
	icon: text('icon'),
	color: text('color'), // Tailwind class – e.g. text-red-400
	bgColor: text('bg_color'), // Tailwind class – e.g. bg-red-900/20
	borderColor: text('border_color'), // Tailwind class – e.g. border-red-500/30
	label: text('label'), // Human-readable label – "The Pit"
	/**
	 * Meta fields for experimentation / A/B testing.
	 */
	version: integer('version').notNull().default(1),
	isActive: boolean('is_active').notNull().default(true),
	/**
	 * Arbitrary JSON blob for extensibility (bannerImage, gradients, etc).
	 */
	metadata: jsonb('metadata').default({}),
	/**
	 * Timestamps
	 */
	createdAt: timestamp('created_at')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp('updated_at')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
	/*
	 * NEW visual fields for ZoneCard 2025-06-26 upgrade cycle
	 */
	gradient: text('gradient'), // Tailwind gradient utility e.g. from-red-900/40 via-...
	glow: text('glow'), // Tailwind shadow utility e.g. shadow-red-500/20
	glowIntensity: text('glow_intensity'), // 'low' | 'medium' | 'high'
	rarityOverlay: text('rarity_overlay') // 'common' | 'premium' | 'legendary'
});
export type UiTheme = typeof uiThemes.$inferSelect;
export type NewUiTheme = typeof uiThemes.$inferInsert;
