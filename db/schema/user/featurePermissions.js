import { pgTable, varchar, integer, boolean, uuid } from 'drizzle-orm/pg-core';
import { roles } from './roles'; // Use roles instead of deprecated userGroups
export const featurePermissions = pgTable('feature_permissions', {
    id: uuid('id').primaryKey().defaultRandom(),
    feature: varchar('feature', { length: 100 }).notNull(), // e.g. 'edit_post', 'mark_solved', increased length
    groupId: integer('group_id').references(() => roles.id), // References roles table (was userGroups)
    allow: boolean('allow').notNull().default(true)
    // consider adding: createdAt, updatedAt timestamps
});
//# sourceMappingURL=featurePermissions.js.map