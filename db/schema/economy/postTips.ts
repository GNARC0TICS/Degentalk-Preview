import { pgTable, integer, bigint, timestamp, uuid, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { posts } from '../forum/posts';
import { users } from '../user/users';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
export const postTips = pgTable('post_tips', {
	id: uuid('id').primaryKey().defaultRandom(),
	postId: uuid('post_id')
		.notNull()
		.references(() => posts.id, { onDelete: 'cascade' }),
	userId: uuid('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	amount: bigint('amount', { mode: 'number' }).notNull().default(0),
	createdAt: timestamp('created_at')
		.notNull()
		.default(sql`now()`)
});
// Create insert schema with fields needed for creation
export const insertPostTipSchema = z.object({
	fromUserId: z.string().uuid(),
	toUserId: z.string().uuid(),
	postId: z.string().uuid(),
	amount: z.number().positive()
});
export type PostTip = typeof postTips.$inferSelect;
// export type InsertPostTip = typeof postTips.$inferInsert; // Already created by Zod
