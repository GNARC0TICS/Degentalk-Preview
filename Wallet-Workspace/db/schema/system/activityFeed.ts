import { pgTable, serial, integer, varchar, jsonb, boolean, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "../user/users"; // Adjusted path

export const activityFeed = pgTable('activity_feed', {
  id: serial('activity_id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  activityType: varchar('activity_type', { length: 50 }).notNull(), // e.g., 'created_thread', 'replied_post', 'earned_badge'
  activityData: jsonb('activity_data').notNull().default('{}'), // Contextual data like threadId, badgeName, etc.
  isPublic: boolean('is_public').notNull().default(true), // Controls visibility on public feeds
  createdAt: timestamp('created_at').notNull().default(sql`now()`), // Changed defaultNow() to sql`now()`
});

export type ActivityFeedItem = typeof activityFeed.$inferSelect;
// Add InsertActivityFeedItem if Zod schema is needed 