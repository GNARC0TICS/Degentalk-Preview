import {
	pgTable, varchar, integer, timestamp, uuid,
	index
} from 'drizzle-orm/pg-core';
import { users } from '../user/users'; // Assuming path to users
export const airdropRecords = pgTable('airdrop_records', {
	id: uuid('id').primaryKey().defaultRandom(),
	userId: uuid('user_id').references(() => users.id),
	tokenType: varchar('token_type', { length: 50 }),
	amount: integer('amount'),
	createdAt: timestamp('created_at').defaultNow()
});
export type AirdropRecord = typeof airdropRecords.$inferSelect;
export type InsertAirdropRecord = typeof airdropRecords.$inferInsert;
