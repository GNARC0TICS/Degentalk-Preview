import { pgTable, integer, varchar, jsonb, index, boolean, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users"; // Adjusted import
import { sql } from "drizzle-orm";

export const userSettings = pgTable('user_settings', {
  userId: integer('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  theme: varchar('theme', { length: 40 }).default('auto'),
  sidebarState: jsonb('sidebar_state').default('{}'),
  notificationPrefs: jsonb('notification_prefs').default('{}'), // Will be merged with notificationSettings logic
  profileVisibility: varchar('profile_visibility', { length: 20 }).default('public'),
  timezone: varchar('timezone', { length: 50 }),
  language: varchar('language', { length: 20 }).default('en'),
  shoutboxPosition: varchar('shoutbox_position', { length: 20 }).default('sidebar-top'), // Consider moving to core/enums if shoutboxPositionEnum is used
}, (table) => ({
  userIdx: index('idx_user_settings_user_id').on(table.userId)
}));

export const notificationSettings = pgTable('notification_settings', {
  userId: integer('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  receiveMentionNotifications: boolean('receive_mention_notifications').notNull().default(true),
  receiveReplyNotifications: boolean('receive_reply_notifications').notNull().default(true),
  receivePmNotifications: boolean('receive_pm_notifications').notNull().default(true),
  receiveFriendNotifications: boolean('receive_friend_notifications').notNull().default(true),
  receiveFollowNotifications: boolean('receive_follow_notifications').notNull().default(true),
  receiveShopNotifications: boolean('receive_shop_notifications').notNull().default(true),
  receiveSystemNotifications: boolean('receive_system_notifications').notNull().default(true),
  receiveEmailNotifications: boolean('receive_email_notifications').notNull().default(false),
  createdAt: timestamp('created_at').notNull().default(sql`now()`),
  updatedAt: timestamp('updated_at').notNull().default(sql`now()`),
});

// Placeholder for notificationSettings table that will be merged here or related

// Add zod schema or relations as needed
// export type UserSetting = typeof userSettings.$inferSelect;
// export type InsertUserSetting = typeof userSettings.$inferInsert;

// export type NotificationSetting = typeof notificationSettings.$inferSelect;
// export type InsertNotificationSetting = typeof notificationSettings.$inferInsert; 