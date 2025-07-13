import { pgTable, uuid, integer, varchar, decimal, timestamp, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from '../user/users';
/**
 * Internal Transfers - Track user-to-user transfers within the platform
 */
export const internalTransfers = pgTable('internal_transfers', {
    id: uuid('id').primaryKey().defaultRandom(),
    fromUserId: uuid('from_user_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    toUserId: uuid('to_user_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    recordId: varchar('record_id', { length: 255 }).notNull().unique(),
    coinId: integer('coin_id').notNull(),
    coinSymbol: varchar('coin_symbol', { length: 20 }).notNull(),
    amount: decimal('amount', { precision: 36, scale: 18 }).notNull(),
    serviceFee: decimal('service_fee', { precision: 36, scale: 18 }),
    coinUSDPrice: decimal('coin_usd_price', { precision: 18, scale: 8 }),
    status: varchar('status', { length: 20 }).notNull(), // Processing, Success, Failed, Cancelled
    failureReason: varchar('failure_reason', { length: 500 }),
    note: varchar('note', { length: 1000 }), // Optional transfer note
    processedAt: timestamp('processed_at'),
    createdAt: timestamp('created_at')
        .notNull()
        .default(sql `now()`)
}, (table) => ({
    fromUserIdx: index('idx_internal_transfers_from_user_id').on(table.fromUserId),
    toUserIdx: index('idx_internal_transfers_to_user_id').on(table.toUserId),
    recordIdIdx: index('idx_internal_transfers_record_id').on(table.recordId),
    coinIdx: index('idx_internal_transfers_coin_id').on(table.coinId),
    statusIdx: index('idx_internal_transfers_status').on(table.status),
    createdAtIdx: index('idx_internal_transfers_created_at').on(table.createdAt)
}));
//# sourceMappingURL=internal-transfers.js.map