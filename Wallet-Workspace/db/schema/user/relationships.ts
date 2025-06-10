import { pgTable, serial, integer, varchar, timestamp, boolean, unique } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./users";

export const userRelationships = pgTable('user_relationships', {
  id: serial('relationship_id').primaryKey(),
  followerId: integer('follower_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  followingId: integer('following_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  relationshipType: varchar('relationship_type', { length: 50 }).notNull(), // e.g., 'follow', 'friend_request', 'friend'
  createdAt: timestamp('created_at').notNull().default(sql`now()`),
  isAccepted: boolean('is_accepted'), // Nullable for follow, true/false for friend requests
  acceptedAt: timestamp('accepted_at'),
}, (table) => ({
  followerFollowingUnique: unique('user_relationships_follower_following_type_unique').on(table.followerId, table.followingId, table.relationshipType)
}));

export type UserRelationship = typeof userRelationships.$inferSelect;
// export type InsertUserRelationship = typeof userRelationships.$inferInsert; // If needed 