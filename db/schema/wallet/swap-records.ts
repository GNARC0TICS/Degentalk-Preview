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
 * Swap Records - Track cryptocurrency swap/exchange transactions
 */
export const swapRecords = pgTable(
	'swap_records',
	{
		id: serial('id').primaryKey(),
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		recordId: varchar('record_id', { length: 255 }).notNull().unique(),

		// From coin details
		fromCoinId: integer('from_coin_id').notNull(),
		fromCoinSymbol: varchar('from_coin_symbol', { length: 20 }).notNull(),
		fromAmount: decimal('from_amount', { precision: 36, scale: 18 }).notNull(),
		fromCoinUSDPrice: decimal('from_coin_usd_price', { precision: 18, scale: 8 }),

		// To coin details
		toCoinId: integer('to_coin_id').notNull(),
		toCoinSymbol: varchar('to_coin_symbol', { length: 20 }).notNull(),
		toAmount: decimal('to_amount', { precision: 36, scale: 18 }).notNull(),
		toCoinUSDPrice: decimal('to_coin_usd_price', { precision: 18, scale: 8 }),

		// Transaction details
		exchangeRate: decimal('exchange_rate', { precision: 36, scale: 18 }),
		serviceFee: decimal('service_fee', { precision: 36, scale: 18 }),
		status: varchar('status', { length: 20 }).notNull(), // Processing, Success, Failed, Cancelled
		failureReason: varchar('failure_reason', { length: 500 }),
		processedAt: timestamp('processed_at'),
		createdAt: timestamp('created_at')
			.notNull()
			.default(sql`now()`)
	},
	(table) => ({
		userIdx: index('idx_swap_records_user_id').on(table.userId),
		recordIdIdx: index('idx_swap_records_record_id').on(table.recordId),
		fromCoinIdx: index('idx_swap_records_from_coin_id').on(table.fromCoinId),
		toCoinIdx: index('idx_swap_records_to_coin_id').on(table.toCoinId),
		statusIdx: index('idx_swap_records_status').on(table.status),
		createdAtIdx: index('idx_swap_records_created_at').on(table.createdAt)
	})
);

export type SwapRecord = typeof swapRecords.$inferSelect;
export type InsertSwapRecord = typeof swapRecords.$inferInsert;
