import {
	pgTable,
	integer,
	varchar,
	decimal,
	boolean,
	timestamp,
	index,
	uuid
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
/**
 * Supported Tokens - Store supported cryptocurrency tokens from CCPayment
 */
export const supportedTokens = pgTable(
	'supported_tokens',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		coinId: integer('coin_id').notNull().unique(), // CCPayment's coin ID
		coinSymbol: varchar('coin_symbol', { length: 20 }).notNull(),
		coinName: varchar('coin_name', { length: 100 }).notNull(),
		chain: varchar('chain', { length: 50 }).notNull(),
		contract: varchar('contract', { length: 255 }), // Contract address for tokens
		// Token properties
		decimals: integer('decimals').notNull().default(18),
		minDepositAmount: decimal('min_deposit_amount', { precision: 36, scale: 18 }),
		minWithdrawAmount: decimal('min_withdraw_amount', { precision: 36, scale: 18 }),
		withdrawFee: decimal('withdraw_fee', { precision: 36, scale: 18 }),
		// Status and configuration
		isActive: boolean('is_active').default(true),
		supportsDeposit: boolean('supports_deposit').default(true),
		supportsWithdraw: boolean('supports_withdraw').default(true),
		supportsSwap: boolean('supports_swap').default(true),
		// Metadata
		iconUrl: varchar('icon_url', { length: 500 }),
		explorerUrl: varchar('explorer_url', { length: 500 }),
		// Sync tracking
		lastSyncedAt: timestamp('last_synced_at'),
		createdAt: timestamp('created_at')
			.notNull()
			.default(sql`now()`)
	},
	(table) => ({
		coinIdIdx: index('idx_supported_tokens_coin_id').on(table.coinId),
		coinSymbolIdx: index('idx_supported_tokens_coin_symbol').on(table.coinSymbol),
		chainIdx: index('idx_supported_tokens_chain').on(table.chain),
		isActiveIdx: index('idx_supported_tokens_is_active').on(table.isActive),
		supportsDepositIdx: index('idx_supported_tokens_supports_deposit').on(table.supportsDeposit),
		supportsWithdrawIdx: index('idx_supported_tokens_supports_withdraw').on(table.supportsWithdraw),
		supportsSwapIdx: index('idx_supported_tokens_supports_swap').on(table.supportsSwap)
	})
);
export type SupportedToken = typeof supportedTokens.$inferSelect;
export type InsertSupportedToken = typeof supportedTokens.$inferInsert;
