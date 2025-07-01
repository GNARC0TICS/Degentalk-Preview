import {
	pgTable,
	serial,
	uuid,
	integer,
	varchar,
	decimal,
	boolean,
	timestamp,
	index
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from '../user/users';

/**
 * Withdrawal Records - Track all withdrawal requests and their status
 */
export const withdrawalRecords = pgTable(
	'withdrawal_records',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		recordId: varchar('record_id', { length: 255 }).notNull().unique(),
		coinId: integer('coin_id').notNull(),
		coinSymbol: varchar('coin_symbol', { length: 20 }).notNull(),
		chain: varchar('chain', { length: 50 }).notNull(),
		contract: varchar('contract', { length: 255 }),
		amount: decimal('amount', { precision: 36, scale: 18 }).notNull(),
		serviceFee: decimal('service_fee', { precision: 36, scale: 18 }),
		coinUSDPrice: decimal('coin_usd_price', { precision: 18, scale: 8 }),
		fromAddress: varchar('from_address', { length: 255 }),
		toAddress: varchar('to_address', { length: 255 }).notNull(),
		toMemo: varchar('to_memo', { length: 255 }),
		txId: varchar('tx_id', { length: 255 }),
		withdrawType: varchar('withdraw_type', { length: 20 }).notNull(), // blockchain, cwallet
		status: varchar('status', { length: 20 }).notNull(), // Processing, Success, Failed, Cancelled
		failureReason: varchar('failure_reason', { length: 500 }),
		isFlaggedRisky: boolean('is_flagged_risky').default(false),
		processedAt: timestamp('processed_at'),
		createdAt: timestamp('created_at')
			.notNull()
			.default(sql`now()`)
	},
	(table) => ({
		userIdx: index('idx_withdrawal_records_user_id').on(table.userId),
		recordIdIdx: index('idx_withdrawal_records_record_id').on(table.recordId),
		coinIdx: index('idx_withdrawal_records_coin_id').on(table.coinId),
		chainIdx: index('idx_withdrawal_records_chain').on(table.chain),
		statusIdx: index('idx_withdrawal_records_status').on(table.status),
		withdrawTypeIdx: index('idx_withdrawal_records_withdraw_type').on(table.withdrawType),
		txIdIdx: index('idx_withdrawal_records_tx_id').on(table.txId),
		createdAtIdx: index('idx_withdrawal_records_created_at').on(table.createdAt)
	})
);

export type WithdrawalRecord = typeof withdrawalRecords.$inferSelect;
export type InsertWithdrawalRecord = typeof withdrawalRecords.$inferInsert;
