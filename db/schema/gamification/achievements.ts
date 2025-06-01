import { pgTable, serial, varchar, text, integer, jsonb, boolean, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const achievements = pgTable('achievements', {
  id: serial('achievement_id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  description: text('description'),
  iconUrl: varchar('icon_url', { length: 255 }),
  rewardXp: integer('reward_xp').notNull().default(0),
  rewardPoints: integer('reward_points').notNull().default(0), // Assuming DGT points or a similar currency
  requirement: jsonb('requirement').notNull().default('{}'), // JSON schema for achievement criteria (e.g., { action: 'post_created', count: 10 })
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().default(sql`now()`), // Changed defaultNow() to sql`now()`
});

export type Achievement = typeof achievements.$inferSelect;
// Add InsertAchievement if Zod schema is needed 