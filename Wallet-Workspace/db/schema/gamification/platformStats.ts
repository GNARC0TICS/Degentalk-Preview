import { pgTable, serial, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const platformStatistics = pgTable('platform_statistics', {
  id: serial('stat_id').primaryKey(), // Added for easier management if ever needed
  key: varchar('stat_key', { length: 100 }).notNull().unique(), // e.g., 'total_users', 'total_posts', 'active_shoutbox_users'
  value: integer('stat_value').notNull().default(0),
  lastUpdated: timestamp('last_updated').notNull().default(sql`now()`), // Changed defaultNow() to sql`now()`
});

export type PlatformStatistic = typeof platformStatistics.$inferSelect;
// Add InsertPlatformStatistic if Zod schema is needed 