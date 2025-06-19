import {
	pgTable,
	serial,
	integer,
	varchar,
	text,
	boolean,
	jsonb,
	doublePrecision,
	timestamp,
	unique
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

/**
 * Role table – promoted from legacy `user_groups`.
 * Supports UI flair, permissions, and XP modifiers.
 */

export const roles = pgTable(
	'roles',
	{
		// Primary key – use UUIDs for easier merges between environments
		id: serial('role_id').primaryKey(),

		// Human-readable name and URL-safe slug
		name: varchar('name', { length: 100 }).notNull(),
		slug: varchar('slug', { length: 50 }).notNull(),

		// Ordering & visibility helpers
		rank: integer('rank').notNull().default(0),

		// Descriptive copy
		description: text('description'),

		// Visual flair
		badgeImage: varchar('badge_image', { length: 255 }),
		textColor: varchar('text_color', { length: 25 }),
		backgroundColor: varchar('background_color', { length: 25 }),

		// Behavioural flags (previously isStaff / isAdmin etc.)
		isStaff: boolean('is_staff').notNull().default(false),
		isModerator: boolean('is_moderator').notNull().default(false),
		isAdmin: boolean('is_admin').notNull().default(false),

		// Permissions blob – array/obj of feature flags resolved by canUser()
		permissions: jsonb('permissions').notNull().default('{}'),

		// XP multiplier
		xpMultiplier: doublePrecision('xp_multiplier').notNull().default(1.0),

		// Meta
		createdAt: timestamp('created_at')
			.notNull()
			.default(sql`CURRENT_TIMESTAMP`),
		updatedAt: timestamp('updated_at')
			.notNull()
			.default(sql`CURRENT_TIMESTAMP`),

		// Plugin extensibility
		pluginData: jsonb('plugin_data').default('{}')
	},
	(table) => ({
		nameUnique: unique('roles_name_unique').on(table.name),
		slugUnique: unique('roles_slug_unique').on(table.slug)
	})
);

// Add zod schema or relations as needed
// export type Role = typeof roles.$inferSelect;
// export type InsertRole = typeof roles.$inferInsert;
