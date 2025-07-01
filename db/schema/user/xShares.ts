import { pgTable, serial, integer, varchar, timestamp, uuid } from 'drizzle-orm/pg-core';
import { users } from './users';
import { type AnyPgColumn } from 'drizzle-orm/pg-core';

export const xShares = pgTable('x_shares', {
	id: uuid('id').primaryKey().defaultRandom(),
	userId: uuid('user_id')
		.notNull()
		.references((): AnyPgColumn => users.id as AnyPgColumn, { onDelete: 'cascade' }),
	contentType: varchar('content_type', { length: 50 }).notNull(),
	contentId: integer('content_id'),
	xPostId: varchar('x_post_id', { length: 255 }),
	sharedAt: timestamp('shared_at').defaultNow().notNull()
});

export type XShare = typeof xShares.$inferSelect;
