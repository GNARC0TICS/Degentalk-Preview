import {
	pgTable,
	serial,
	integer,
	doublePrecision,
	timestamp,
	boolean,
	index
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from '../user/users';

// This table represents the user's internal DGT balance, as distinct from external crypto wallets.
export const wallets = pgTable(
	'wallets',
	{
		id: serial('wallet_id').primaryKey(),
		userId: integer('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		balance: doublePrecision('balance').notNull().default(0), // This is the DGT balance
		lastTransaction: timestamp('last_transaction'), // Renamed in refactor plan to lastTransactionAt for clarity
		isDeleted: boolean('is_deleted').notNull().default(false),
		deletedAt: timestamp('deleted_at'),
		deletedBy: integer('deleted_by').references(() => users.id, { onDelete: 'set null' }),
		createdAt: timestamp('created_at')
			.notNull()
			.default(sql`now()`),
		updatedAt: timestamp('updated_at')
			.notNull()
			.default(sql`now()`)
	},
	(table) => ({
		userIdx: index('idx_wallets_user_id').on(table.userId)
		// The refactor plan had a unique constraint for primary wallet, but this table seems to be the DGT balance table.
		// If multiple wallet types are introduced later, that might be relevant.
	})
);

export type Wallet = typeof wallets.$inferSelect;
// export type InsertWallet = typeof wallets.$inferInsert; // If needed
