import { pgTable, 
// integer, // No longer using integer for userId/deletedBy
doublePrecision, timestamp, boolean, index, uuid } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from '../user/users';
import { walletStatusEnum } from '../core/enums';
// This table represents the user's internal DGT balance, as distinct from external crypto wallets.
export const wallets = pgTable('wallets', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id') // Changed to uuid
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    balance: doublePrecision('balance').notNull().default(0), // This is the DGT balance
    status: walletStatusEnum('status').notNull().default('active'), // Wallet status for admin controls
    lastTransaction: timestamp('last_transaction'), // Renamed in refactor plan to lastTransactionAt for clarity
    isDeleted: boolean('is_deleted').notNull().default(false),
    deletedAt: timestamp('deleted_at'),
    deletedBy: uuid('deleted_by').references(() => users.id, { onDelete: 'set null' }), // Changed to uuid
    createdAt: timestamp('created_at')
        .notNull()
        .default(sql `now()`),
    updatedAt: timestamp('updated_at')
        .notNull()
        .default(sql `now()`)
}, (table) => ({
    userIdx: index('idx_wallets_user_id').on(table.userId)
    // The refactor plan had a unique constraint for primary wallet, but this table seems to be the DGT balance table.
    // If multiple wallet types are introduced later, that might be relevant.
}));
// export type InsertWallet = typeof wallets.$inferInsert; // If needed
//# sourceMappingURL=wallets.js.map