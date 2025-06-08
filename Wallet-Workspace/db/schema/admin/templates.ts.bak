import { pgTable, serial, varchar, text, boolean, integer, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "../user/users"; // Adjusted path

export const siteTemplates = pgTable('site_templates', {
  id: serial('template_id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  type: varchar('type', { length: 50 }).notNull(), // e.g., page, email_layout, component_wrapper
  content: text('content').notNull(), // HTML, Handlebars, Liquid, etc.
  description: text('description'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().default(sql`now()`), // Changed defaultNow() to sql`now()`
  updatedAt: timestamp('updated_at').notNull().default(sql`now()`), // Changed defaultNow() to sql`now()`
  createdBy: integer('created_by').references(() => users.id, { onDelete: 'set null' }),
});

export type SiteTemplate = typeof siteTemplates.$inferSelect;
// Add InsertSiteTemplate if Zod schema is needed 