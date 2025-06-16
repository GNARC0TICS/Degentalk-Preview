import {
	pgTable,
	timestamp,
	primaryKey,
	index,
	uuid,
	integer
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from '../user/users';
import { threads } from './threads';

export const userThreadBookmarks = pgTable(
	'user_thread_bookmarks',
	{
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		threadId: integer('thread_id')
			.notNull()
			.references(() => threads.id, { onDelete: 'cascade' }),
		createdAt: timestamp('created_at')
			.notNull()
			.default(sql`now()`)
	},
	(table) => ({
		pk: primaryKey({ columns: [table.userId, table.threadId] }),
		userIdx: index('idx_user_thread_bookmarks_user_id').on(table.userId)
	})
);

// Add zod schema or relations as needed
// export type UserThreadBookmark = typeof userThreadBookmarks.$inferSelect;
// export type InsertUserThreadBookmark = typeof userThreadBookmarks.$inferInsert;
