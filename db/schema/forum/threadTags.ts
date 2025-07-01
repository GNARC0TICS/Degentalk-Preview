import { pgTable, integer, primaryKey, uuid } from 'drizzle-orm/pg-core';
import { threads } from './threads'; // Adjusted import
import { tags } from './tags'; // Adjusted import

export const threadTags = pgTable(
	'thread_tags',
	{
		threadId: uuid('thread_id')
			.notNull()
			.references(() => threads.id, { onDelete: 'cascade' }),
		tagId: integer('tag_id')
			.notNull()
			.references(() => tags.id, { onDelete: 'cascade' })
	},
	(table) => ({
		pk: primaryKey({ columns: [table.threadId, table.tagId] })
	})
);

export type ThreadTag = typeof threadTags.$inferSelect;
export type InsertThreadTag = typeof threadTags.$inferInsert;
