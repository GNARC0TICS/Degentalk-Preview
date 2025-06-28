import { sql } from 'drizzle-orm';
import { MigrationBuilder } from 'drizzle-orm/node-postgres/migrator';

/**
 * Extends ui_themes table with new visual properties used by ZoneCard (upgrade cycle 2025-06-26).
 * – gradient: Tailwind gradient utility string
 * – glow: Tailwind shadow utility string
 * – glow_intensity: ENUM-ish text field ('low' | 'medium' | 'high')
 * – rarity_overlay: text field ('common' | 'premium' | 'legendary')
 */
export async function up({ db }: MigrationBuilder) {
	await db.execute(sql`
		ALTER TABLE ui_themes
			ADD COLUMN IF NOT EXISTS gradient TEXT,
			ADD COLUMN IF NOT EXISTS glow TEXT,
			ADD COLUMN IF NOT EXISTS glow_intensity TEXT,
			ADD COLUMN IF NOT EXISTS rarity_overlay TEXT;
	`);
}

export async function down({ db }: MigrationBuilder) {
	await db.execute(sql`
		ALTER TABLE ui_themes
			DROP COLUMN IF EXISTS gradient,
			DROP COLUMN IF EXISTS glow,
			DROP COLUMN IF EXISTS glow_intensity,
			DROP COLUMN IF EXISTS rarity_overlay;
	`);
} 