import { pgTable, serial, integer, varchar, text, jsonb, boolean, timestamp, index } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "../user/users"; // Adjusted path
import { notificationTypeEnum } from "../core/enums"; // Adjusted path

export const notifications = pgTable('notifications', {
  id: serial('notification_id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: notificationTypeEnum('type').notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  body: text('body'),
  data: jsonb('data'), // For storing context like threadId, postId, achievementId, etc.
  isRead: boolean('is_read').notNull().default(false),
  readAt: timestamp('read_at'),
  createdAt: timestamp('created_at').notNull().default(sql`now()`), // Changed defaultNow() to sql`now()`
}, (table) => ({
  userIdx: index('idx_notifications_user_id').on(table.userId)
}));

export type Notification = typeof notifications.$inferSelect;
// Add InsertNotification if Zod schema is needed 