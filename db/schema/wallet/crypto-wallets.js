import { pgTable, uuid, integer, varchar, text, timestamp, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from '../user/users';
/**
 * Crypto Wallets - Store crypto wallet addresses per user/coin/chain
 */
export const cryptoWallets = pgTable('crypto_wallets', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    ccpaymentUserId: varchar('ccpayment_user_id', { length: 64 }).notNull(),
    coinId: integer('coin_id').notNull(),
    coinSymbol: varchar('coin_symbol', { length: 20 }).notNull(),
    chain: varchar('chain', { length: 50 }).notNull(),
    address: varchar('address', { length: 255 }).notNull(),
    memo: varchar('memo', { length: 255 }),
    qrCodeUrl: text('qr_code_url'),
    createdAt: timestamp('created_at')
        .notNull()
        .default(sql `now()`)
}, (table) => ({
    userIdx: index('idx_crypto_wallets_user_id').on(table.userId),
    ccpaymentUserIdx: index('idx_crypto_wallets_ccpayment_user_id').on(table.ccpaymentUserId),
    coinChainIdx: index('idx_crypto_wallets_coin_chain').on(table.coinId, table.chain),
    addressIdx: index('idx_crypto_wallets_address').on(table.address)
}));
//# sourceMappingURL=crypto-wallets.js.map