import { sql } from 'drizzle-orm';
import { MigrationBuilder } from 'drizzle-orm/node-postgres/migrator';

/**
 * Creates xp_reputation_settings table for XP ↔ DGT + reputation configuration.
 * TODO: @syncSchema
 */
export async function up({ db }: MigrationBuilder) {
	await db.execute(sql`
		CREATE TABLE IF NOT EXISTS xp_reputation_settings (
			id SERIAL PRIMARY KEY,
			xp_to_dgt_rate NUMERIC(10,4) NOT NULL DEFAULT 0.10,
			reputation_multiplier NUMERIC(10,4) NOT NULL DEFAULT 1.00,
			decay_rate NUMERIC(10,4) NOT NULL DEFAULT 0.05,
			updated_at TIMESTAMP NOT NULL DEFAULT NOW()
		);
	`);

	// Seed a default row
	await db.execute(sql`INSERT INTO xp_reputation_settings (xp_to_dgt_rate, reputation_multiplier, decay_rate) VALUES (0.10, 1.00, 0.05) ON CONFLICT DO NOTHING;`);
}

export async function down({ db }: MigrationBuilder) {
	await db.execute(sql`DROP TABLE IF EXISTS xp_reputation_settings;`);
} 