import { pgTable, /*integer,*/ timestamp, primaryKey, uuid, integer } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from '../user/users';
import { titles } from './titles';

export const userTitles = pgTable(
	'user_titles',
	{
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		titleId: integer('title_id')
			.notNull()
			.references(() => titles.id, { onDelete: 'cascade' }),
		awardedAt: timestamp('awarded_at')
			.notNull()
			.default(sql`now()`)
	},
	(table) => ({
		pk: primaryKey({ columns: [table.userId, table.titleId] })
	})
);

// Add zod schema or relations as needed
// export type UserTitle = typeof userTitles.$inferSelect;
// export type InsertUserTitle = typeof userTitles.$inferInsert;
