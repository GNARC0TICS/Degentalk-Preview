import { pgTable, serial, varchar, text, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";

export const titles = pgTable('titles', {
  id: serial('title_id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  iconUrl: varchar('icon_url', { length: 255 }),
  rarity: varchar('rarity', { length: 50 }).default('common'),
  createdAt: timestamp('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const insertTitleSchema = createInsertSchema(titles);
export type Title = typeof titles.$inferSelect;
export type InsertTitle = typeof titles.$inferInsert; 