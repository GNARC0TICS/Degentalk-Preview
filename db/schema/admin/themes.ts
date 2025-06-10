import {
	pgTable,
	serial,
	varchar,
	text,
	jsonb,
	boolean,
	integer,
	timestamp
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from '../user/users'; // Adjusted path

export const adminThemes = pgTable('admin_themes', {
	id: serial('theme_id').primaryKey(),
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
	createdBy: integer('created_by').references(() => users.id, { onDelete: 'set null' })
});

export type AdminTheme = typeof adminThemes.$inferSelect;
// Add InsertAdminTheme if Zod schema is needed
