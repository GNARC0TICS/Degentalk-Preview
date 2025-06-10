import {
	pgTable,
	serial,
	varchar,
	text,
	boolean,
	integer,
	jsonb,
	timestamp,
	unique
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const userGroups = pgTable(
	'user_groups',
	{
		id: serial('group_id').primaryKey(),
		name: varchar('name', { length: 100 }).notNull(),
		description: text('description'),
		color: varchar('color', { length: 25 }).default('#3366ff'),
		icon: varchar('icon', { length: 100 }),
		badge: varchar('badge', { length: 100 }),
		isStaff: boolean('is_staff').notNull().default(false),
		staffPriority: integer('staff_priority').default(0),
		isDefault: boolean('is_default').notNull().default(false),
		isModerator: boolean('is_moderator').notNull().default(false),
		isAdmin: boolean('is_admin').notNull().default(false),
		canManageUsers: boolean('can_manage_users').notNull().default(false),
		canManageContent: boolean('can_manage_content').notNull().default(false),
		canManageSettings: boolean('can_manage_settings').notNull().default(false),
		permissions: jsonb('permissions').default('{}'),
		createdAt: timestamp('created_at')
			.notNull()
			.default(sql`CURRENT_TIMESTAMP`),
		updatedAt: timestamp('updated_at')
			.notNull()
			.default(sql`CURRENT_TIMESTAMP`),
		pluginData: jsonb('plugin_data').default('{}')
	},
	(table) => ({
		nameUnique: unique('user_groups_name_unique').on(table.name)
	})
);

// Add zod schema or relations as needed
// export type UserGroup = typeof userGroups.$inferSelect;
// export type InsertUserGroup = typeof userGroups.$inferInsert;
