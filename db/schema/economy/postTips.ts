import { pgTable, integer, bigint, timestamp, uuid, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { posts } from '../forum/posts';
import { users } from '../user/users';
import { createInsertSchema } from 'drizzle-zod';
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
// @ts-ignore - drizzle-zod type inference issue with cross-workspace builds
export const insertPostTipSchema = createInsertSchema(postTips).omit({
	id: true,
	createdAt: true
});
export type PostTip = typeof postTips.$inferSelect;
// export type InsertPostTip = typeof postTips.$inferInsert; // Already created by Zod
