import {
	pgTable,
	varchar,
	text,
	jsonb,
	boolean,
	timestamp,
	uuid,
	index
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from '../user/users'; // Adjusted path
export const adminThemes = pgTable('admin_themes', {
	id: uuid('id').primaryKey().defaultRandom(),
	name: varchar('name', { length: 100 }).notNull().unique(),
	description: text('description'),
	cssVars: jsonb('css_vars').notNull().default('{}'),
	customCss: text('custom_css'),
	isActive: boolean('is_active').notNull().default(false),
	createdAt: timestamp('created_at')
		.notNull()
		.default(sql`now()`), // Changed defaultNow() to sql`now()`
	updatedAt: timestamp('updated_at')
		.notNull()
		.default(sql`now()`), // Changed defaultNow() to sql`now()`
	createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' })
});
export type AdminTheme = typeof adminThemes.$inferSelect;
// Add InsertAdminTheme if Zod schema is needed
