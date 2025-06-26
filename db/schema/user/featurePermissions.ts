import { pgTable, serial, varchar, integer, boolean } from 'drizzle-orm/pg-core';
import { roles } from './roles'; // Use roles instead of deprecated userGroups

export const featurePermissions = pgTable('feature_permissions', {
	id: serial('id').primaryKey(),
	feature: varchar('feature', { length: 100 }).notNull(), // e.g. 'edit_post', 'mark_solved', increased length
	groupId: integer('group_id').references(() => roles.id), // References roles table (was userGroups)
	allow: boolean('allow').notNull().default(true)
	// consider adding: createdAt, updatedAt timestamps
});

export type FeaturePermission = typeof featurePermissions.$inferSelect;
export type InsertFeaturePermission = typeof featurePermissions.$inferInsert;
