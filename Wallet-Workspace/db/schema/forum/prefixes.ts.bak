import { pgTable, serial, varchar, boolean, integer, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { forumCategories } from "./categories"; // Adjusted import

export const threadPrefixes = pgTable('thread_prefixes', {
  id: serial('prefix_id').primaryKey(),
  name: varchar('name', { length: 30 }).notNull().unique(),
  color: varchar('color', { length: 20 }),
  isActive: boolean('is_active').notNull().default(true),
  position: integer('position').notNull().default(0),
  categoryId: integer('category_id').references(() => forumCategories.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Add zod schema if needed, or define relations
// import { createInsertSchema } from "drizzle-zod";
// export const insertThreadPrefixSchema = createInsertSchema(threadPrefixes);
// export type ThreadPrefix = typeof threadPrefixes.$inferSelect;
// export type InsertThreadPrefix = typeof threadPrefixes.$inferInsert; 