import { pgTable, text, boolean, timestamp, uuid } from 'drizzle-orm/pg-core';
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
//# sourceMappingURL=threadFeaturePermissions.js.map