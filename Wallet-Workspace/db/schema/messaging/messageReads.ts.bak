import { pgTable, integer, timestamp, primaryKey, index } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "../user/users"; // Adjusted path
import { messages } from "./messages"; // Adjusted path

export const messageReads = pgTable('message_reads', {
  messageId: integer('message_id').notNull().references(() => messages.id, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  readAt: timestamp('read_at').notNull().default(sql`now()`), // Changed defaultNow() to sql`now()`
}, (table) => ({
  pk: primaryKey({ columns: [table.messageId, table.userId] }),
  messageIdx: index('idx_message_reads_message_id').on(table.messageId)
}));

export type MessageRead = typeof messageReads.$inferSelect;
// Add InsertMessageRead if Zod schema is needed 