import {
	pgTable, varchar, text, boolean, timestamp, uuid,
	index
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from '../user/users';
export const siteSettings = pgTable('site_settings', {
	id: uuid('id').primaryKey().defaultRandom(), // schema.ts had this, useful for direct edits if needed
	key: varchar('key', { length: 100 }).notNull().unique(),
	value: text('value'),
	valueType: varchar('value_type', { length: 20 }).notNull().default('string'), // string, number, boolean, json
	group: varchar('group', { length: 100 }).notNull().default('general'),
	description: text('description'),
	isPublic: boolean('is_public').notNull().default(false), // If the setting can be exposed to frontend config
	createdAt: timestamp('created_at')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp('updated_at')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
	updatedBy: uuid('updated_by').references(() => users.id, { onDelete: 'set null' }) // TODO: @syncSchema added column
});
export type SiteSetting = typeof siteSettings.$inferSelect;
export type InsertSiteSetting = typeof siteSettings.$inferInsert; // Assuming full insert is okay for settings
