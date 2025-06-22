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
 * Deposit Records - Track all deposit transactions from CCPayment
 */
export const depositRecords = pgTable(
	'deposit_records',
	{
		id: serial('id').primaryKey(),
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

		// DGT Conversion Fields (CCPayment auto-swaps to USDT)
		usdtAmount: decimal('usdt_amount', { precision: 36, scale: 18 }),
		dgtAmount: decimal('dgt_amount', { precision: 36, scale: 18 }),
		conversionRate: decimal('conversion_rate', { precision: 10, scale: 4 }),
		originalToken: varchar('original_token', { length: 20 }),

		fromAddress: varchar('from_address', { length: 255 }),
		toAddress: varchar('to_address', { length: 255 }).notNull(),
		toMemo: varchar('to_memo', { length: 255 }),
		txId: varchar('tx_id', { length: 255 }),
		status: varchar('status', { length: 20 }).notNull(), // Processing, Success, Failed
		isFlaggedRisky: boolean('is_flagged_risky').default(false),
		arrivedAt: timestamp('arrived_at'),
		createdAt: timestamp('created_at')
			.notNull()
			.default(sql`now()`)
	},
	(table) => ({
		userIdx: index('idx_deposit_records_user_id').on(table.userId),
		recordIdIdx: index('idx_deposit_records_record_id').on(table.recordId),
		coinIdx: index('idx_deposit_records_coin_id').on(table.coinId),
		chainIdx: index('idx_deposit_records_chain').on(table.chain),
		statusIdx: index('idx_deposit_records_status').on(table.status),
		txIdIdx: index('idx_deposit_records_tx_id').on(table.txId),
		createdAtIdx: index('idx_deposit_records_created_at').on(table.createdAt)
	})
);

export type DepositRecord = typeof depositRecords.$inferSelect;
export type InsertDepositRecord = typeof depositRecords.$inferInsert;
