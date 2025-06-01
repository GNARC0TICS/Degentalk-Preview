import { pgTable, serial, integer, text, timestamp, boolean, index } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "../user/users"; // Adjusted path
import { chatRooms } from "./chatRooms"; // Adjusted path
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const shoutboxMessages = pgTable('shoutbox_messages', {
  id: serial('message_id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  roomId: integer('room_id').references(() => chatRooms.id, { onDelete: 'cascade' }), // Nullable in schema.ts, but seems like it should be required if it's a shoutbox message for a room
  content: text('content').notNull(),
  createdAt: timestamp('created_at').notNull().default(sql`now()`), // Changed defaultNow() to sql`now()`
  editedAt: timestamp('edited_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
  isPinned: boolean('is_pinned').notNull().default(false),
  tipAmount: integer('tip_amount'),
}, (table) => ({
  userIdx: index('idx_shoutbox_messages_user_id').on(table.userId),
  roomIdx: index('idx_shoutbox_messages_room_id').on(table.roomId),
  createdAtIdx: index('idx_shoutbox_messages_created_at').on(table.createdAt)
}));

export const insertShoutboxMessageSchema = createInsertSchema(shoutboxMessages, {
  content: z.string().min(2).max(250),
  roomId: z.number().optional(), // Kept optional to align with schema.ts, though consider if it should be required
}).omit({
  id: true,
  createdAt: true,
  editedAt: true,
  isDeleted: true,
  isPinned: true,
  tipAmount: true
});

export type ShoutboxMessage = typeof shoutboxMessages.$inferSelect;
export type InsertShoutboxMessage = z.infer<typeof insertShoutboxMessageSchema>; 