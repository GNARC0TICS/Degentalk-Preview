import { pgTable, timestamp, unique, uuid, integer, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { posts } from './posts';
import { users } from '../user/users';
export const postLikes = pgTable(
	'post_likes',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		postId: uuid('post_id')
			.notNull()
			.references(() => posts.id, { onDelete: 'cascade' }),
		likedByUserId: uuid('liked_by_user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		createdAt: timestamp('created_at')
			.notNull()
			.default(sql`now()`)
	},
	(table) => ({
		uniqueLike: unique('unique_post_like').on(table.postId, table.likedByUserId)
	})
);
// Add zod schema or relations as needed
// export type PostLike = typeof postLikes.$inferSelect;
// export type InsertPostLike = typeof postLikes.$inferInsert;
