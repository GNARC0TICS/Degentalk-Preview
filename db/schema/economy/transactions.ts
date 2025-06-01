import { pgTable, serial, integer, bigint, text, varchar, boolean, jsonb, timestamp, index } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "../user/users";
import { wallets } from "./wallets";
import { transactionTypeEnum, transactionStatusEnum } from "../core/enums";

export const transactions = pgTable('transactions', {
  id: serial('transaction_id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
  walletId: integer('wallet_id').references(() => wallets.id, { onDelete: 'cascade' }), // DGT wallet
  fromUserId: integer('from_user_id').references(() => users.id, { onDelete: 'set null' }),
  toUserId: integer('to_user_id').references(() => users.id, { onDelete: 'set null' }),
  amount: bigint('amount', { mode: 'number' }).notNull(),
  type: transactionTypeEnum('type').notNull(),
  status: transactionStatusEnum('status').notNull().default('pending'),
  description: text('description'),
  metadata: jsonb('metadata').default('{}'),
  blockchainTxId: varchar('blockchain_tx_id', { length: 255 }), // For external transactions if linked
  fromWalletAddress: varchar('from_wallet_address', { length: 255 }), // For external
  toWalletAddress: varchar('to_wallet_address', { length: 255 }),   // For external
  isTreasuryTransaction: boolean('is_treasury_transaction').default(false),
  createdAt: timestamp('created_at').notNull().default(sql`now()`),
  updatedAt: timestamp('updated_at').notNull().default(sql`now()`),
}, (table) => ({
  userIdx: index('idx_transactions_user_id').on(table.userId),
  walletIdx: index('idx_transactions_wallet_id').on(table.walletId),
  fromUserIdx: index('idx_transactions_from_user_id').on(table.fromUserId),
  toUserIdx: index('idx_transactions_to_user_id').on(table.toUserId),
  typeIdx: index('idx_transactions_type').on(table.type),
  statusIdx: index('idx_transactions_status').on(table.status),
  createdAtIdx: index('idx_transactions_created_at').on(table.createdAt),
  typeStatusIdx: index('idx_transactions_type_status').on(table.type, table.status)
}));

export type Transaction = typeof transactions.$inferSelect;
// export type InsertTransaction = typeof transactions.$inferInsert; // If needed 