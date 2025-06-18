import { sql } from 'drizzle-orm';
import { MigrationBuilder } from 'drizzle-orm/node-postgres/migrator';

/**
 * Adds rollout_percentage column to feature_flags table.
 *
 * TODO: @syncSchema Ensure downstream services update to use rolloutPercentage field.
 */
export async function up({ db }: MigrationBuilder) {
	await db.execute(sql`ALTER TABLE feature_flags ADD COLUMN IF NOT EXISTS rollout_percentage NUMERIC(5,2) NOT NULL DEFAULT 100;`);
}

export async function down({ db }: MigrationBuilder) {
	await db.execute(sql`ALTER TABLE feature_flags DROP COLUMN IF EXISTS rollout_percentage;`);
} 