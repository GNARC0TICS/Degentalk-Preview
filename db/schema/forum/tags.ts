import { pgTable, serial, varchar, text, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const tags = pgTable('tags', {
  id: serial('tag_id').primaryKey(),
  name: varchar('name', { length: 50 }).notNull().unique(),
  slug: varchar('slug', { length: 50 }).notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Add zod schema or relations as needed
// import { createInsertSchema } from "drizzle-zod";
// export const insertTagSchema = createInsertSchema(tags);
// export type Tag = typeof tags.$inferSelect;
// export type InsertTag = typeof tags.$inferInsert; 