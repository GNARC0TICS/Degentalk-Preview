import { pgTable, uuid, text, jsonb, timestamp } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const adminSettings = pgTable('admin_settings', {
	id: uuid('id').primaryKey().defaultRandom(),
	domain: text('domain').notNull(), // e.g., 'users', 'economy', etc.
	settings: jsonb('settings').notNull().default('{}'),
	createdAt: timestamp('created_at')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp('updated_at')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`)
});

export type AdminSetting = typeof adminSettings.$inferSelect;
export type InsertAdminSetting = typeof adminSettings.$inferInsert;
