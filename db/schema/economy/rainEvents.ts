import {
	pgTable,
	bigint,
	varchar,
	timestamp,
	jsonb,
	uuid,
	integer,
	index
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from '../user/users';
import { transactions } from './transactions';
export const rainEvents = pgTable('rain_events', {
	id: uuid('id').primaryKey().defaultRandom(),
	userId: uuid('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	amount: bigint('amount', { mode: 'number' }).notNull(),
	currency: varchar('currency', { length: 10 }).notNull().default('DGT'),
	recipientCount: integer('recipient_count').notNull(),
	transactionId: integer('transaction_id').references(() => transactions.id, {
		onDelete: 'set null'
	}),
	source: varchar('source', { length: 50 }).default('shoutbox'),
	createdAt: timestamp('created_at')
		.notNull()
		.default(sql`now()`),
	metadata: jsonb('metadata').default({})
});
// Add zod schema or relations as needed
// export type RainEvent = typeof rainEvents.$inferSelect;
// export type InsertRainEvent = typeof rainEvents.$inferInsert;
