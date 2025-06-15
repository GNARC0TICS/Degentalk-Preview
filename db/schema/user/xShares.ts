import type { AnyPgColumn } from 'drizzle-orm/pg-core';
import {
	pgTable,
	serial,
	integer,
	varchar,
	timestamp,
} from 'drizzle-orm/pg-core';
import { users } from './users';

export const xShares = pgTable(
	'x_shares',
	{
		id: serial('id').primaryKey(),
		userId: integer('user_id')
			.notNull()
			.references((): AnyPgColumn => users.id as AnyPgColumn, { onDelete: 'cascade' }),
		contentType: varchar('content_type', { length: 50 }).notNull(),
		contentId: integer('content_id'),
		xPostId: varchar('x_post_id', { length: 255 }),
		sharedAt: timestamp('shared_at').defaultNow().notNull(),
	}
);

export type XShare = typeof xShares.$inferSelect; 