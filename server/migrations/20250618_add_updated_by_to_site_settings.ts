import { sql } from 'drizzle-orm';
import { MigrationBuilder } from 'drizzle-orm/node-postgres/migrator';

/**
 * Adds updated_by column to site_settings table.
 * TODO: @syncSchema
 */
export async function up({ db }: MigrationBuilder) {
	await db.execute(sql`ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS updated_by UUID;`);
}

export async function down({ db }: MigrationBuilder) {
	await db.execute(sql`ALTER TABLE site_settings DROP COLUMN IF EXISTS updated_by;`);
} 