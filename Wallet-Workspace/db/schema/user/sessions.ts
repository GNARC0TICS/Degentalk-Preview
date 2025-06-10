import { pgTable, text, jsonb, timestamp } from "drizzle-orm/pg-core";

export const userSessions = pgTable('user_sessions', {
  sid: text('sid').primaryKey(),
  sess: jsonb('sess').notNull(),
  expire: timestamp('expire', { mode: 'date', withTimezone: true }).notNull(),
});

// Add zod schema or relations as needed
// export type UserSession = typeof userSessions.$inferSelect;
// export type InsertUserSession = typeof userSessions.$inferInsert; 