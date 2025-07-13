import { pgTable, varchar, timestamp, boolean, unique, uuid, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from './users';
// Enhanced user relationships table for profile system
export const userRelationships = pgTable('user_relationships', {
    id: uuid('id').primaryKey().defaultRandom(),
    // Changed naming for clarity in enhanced system
    userId: uuid('user_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    targetUserId: uuid('target_user_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    type: varchar('type', { length: 20 }).notNull(), // 'follow', 'friend', 'block'
    status: varchar('status', { length: 20 }).notNull().default('pending'), // 'pending', 'accepted', 'declined'
    createdAt: timestamp('created_at')
        .notNull()
        .default(sql `CURRENT_TIMESTAMP`),
    updatedAt: timestamp('updated_at')
        .notNull()
        .default(sql `CURRENT_TIMESTAMP`),
    // Legacy fields for compatibility
    followerId: uuid('follower_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    followingId: uuid('following_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    relationshipType: varchar('relationship_type', { length: 50 }).notNull(),
    isAccepted: boolean('is_accepted'),
    acceptedAt: timestamp('accepted_at')
}, (table) => ({
    userTargetTypeUnique: unique('user_relationships_user_target_type_unique').on(table.userId, table.targetUserId, table.type),
    // Legacy unique constraint
    followerFollowingUnique: unique('user_relationships_follower_following_type_unique').on(table.followerId, table.followingId, table.relationshipType),
    // Performance indexes
    userTypeIdx: index('idx_user_relationships_user_type').on(table.userId, table.type),
    targetTypeIdx: index('idx_user_relationships_target_type').on(table.targetUserId, table.type),
    statusIdx: index('idx_user_relationships_status').on(table.status),
    createdIdx: index('idx_user_relationships_created').on(table.createdAt)
}));
// export type InsertUserRelationship = typeof userRelationships.$inferInsert; // If needed
//# sourceMappingURL=relationships.js.map