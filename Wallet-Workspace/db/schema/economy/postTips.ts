import { pgTable, serial, integer, bigint, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
// import { posts } from "../forum/posts"; // Commented out as posts table is out of Wallet-Workspace scope
import { users } from "../user/users";
import { createInsertSchema } from "drizzle-zod";

export const postTips = pgTable('post_tips', {
  id: serial('id').primaryKey(),
  postId: integer('post_id').notNull(), // FK to posts table (forum domain) - Removed .references() for Wallet-Workspace scope
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  amount: bigint('amount', { mode: 'number' }).notNull().default(0),
  createdAt: timestamp('created_at').notNull().default(sql`now()`),
});

export const insertPostTipSchema = createInsertSchema(postTips).omit({
  id: true,
  createdAt: true
});
export type PostTip = typeof postTips.$inferSelect;
// export type InsertPostTip = typeof postTips.$inferInsert; // Already created by Zod
