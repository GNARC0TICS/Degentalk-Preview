import {
	pgTable, text, boolean, timestamp, uuid, integer, 
	index
} from 'drizzle-orm/pg-core';
import { threads } from './threads'; // Import threads to reference its ID
export const threadFeaturePermissions = pgTable('thread_feature_permissions', {
	id: uuid('id').primaryKey().defaultRandom(),
	threadId: uuid('thread_id')
		.notNull()
		.references(() => threads.id, { onDelete: 'cascade' }),
	feature: text('feature').notNull(), // e.g. 'pin', 'lock', 'highlight', 'allowTips'
	allowed: boolean('allowed').notNull().default(true),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow() // Added updatedAt
});
// Optional: Define relations if needed later
// import { relations } from 'drizzle-orm';
// export const threadFeaturePermissionsRelations = relations(threadFeaturePermissions, ({ one }) => ({
//   thread: one(threads, {
//     fields: [threadFeaturePermissions.threadId],
//     references: [threads.id],
//   }),
// }));
export type ThreadFeaturePermission = typeof threadFeaturePermissions.$inferSelect;
export type InsertThreadFeaturePermission = typeof threadFeaturePermissions.$inferInsert;
