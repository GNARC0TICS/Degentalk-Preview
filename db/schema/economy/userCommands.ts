import { pgTable, serial, integer, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "../user/users";

export const userCommands = pgTable('user_commands', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  commandType: text('command_type').notNull(), // 'tip', 'rain', etc.
  executedAt: timestamp('executed_at').notNull().default(sql`now()`),
  metadata: jsonb('metadata').default({})
});

// Add zod schema or relations as needed
// export type UserCommand = typeof userCommands.$inferSelect;
// export type InsertUserCommand = typeof userCommands.$inferInsert; 