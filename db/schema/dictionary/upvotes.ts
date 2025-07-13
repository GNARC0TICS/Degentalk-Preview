import { pgTable, timestamp, unique, uuid } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { dictionaryEntries } from './entries';
import { users } from '../user/users';
export const dictionaryUpvotes = pgTable(
	'dictionary_upvotes',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		entryId: uuid('entry_id')
			.notNull()
			.references(() => dictionaryEntries.id, { onDelete: 'cascade' }),
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		createdAt: timestamp('created_at')
			.notNull()
			.default(sql`now()`)
	},
	(table) => ({
		uniqueUpvote: unique('unique_dictionary_upvote').on(table.entryId, table.userId)
	})
);
export type DictionaryUpvote = typeof dictionaryUpvotes.$inferSelect;
export type NewDictionaryUpvote = typeof dictionaryUpvotes.$inferInsert;
