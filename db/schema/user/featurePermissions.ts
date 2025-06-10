import { pgTable, serial, varchar, integer, boolean } from 'drizzle-orm/pg-core';
import { userGroups } from './userGroups'; // Assuming path to userGroups

export const featurePermissions = pgTable('feature_permissions', {
	id: serial('id').primaryKey(),
	feature: varchar('feature', { length: 100 }).notNull(), // e.g. 'edit_post', 'mark_solved', increased length
	groupId: integer('group_id').references(() => userGroups.id), // Corrected to target_group_id to match userGroups schema if needed, or ensure userGroups uses group_id
	allow: boolean('allow').notNull().default(true)
	// consider adding: createdAt, updatedAt timestamps
});

export type FeaturePermission = typeof featurePermissions.$inferSelect;
export type InsertFeaturePermission = typeof featurePermissions.$inferInsert;
