import {
	pgTable,
	integer,
	varchar,
	doublePrecision,
	jsonb,
	timestamp,
	index,
	uuid
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from '../user/users';
import { products } from './products';
export const inventoryTransactions = pgTable(
	'inventory_transactions',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		productId: integer('product_id')
			.notNull()
			.references(() => products.id, { onDelete: 'cascade' }),
		transactionType: varchar('transaction_type', { length: 50 }).notNull(), // e.g., 'purchase', 'admin_grant', 'usage'
		amount: integer('amount').notNull().default(1), // Quantity of items affected
		currency: varchar('currency', { length: 10 }).notNull(), // Currency used if it was a purchase
		currencyAmount: doublePrecision('currency_amount').notNull(), // Amount in currency
		status: varchar('status', { length: 20 }).notNull().default('completed'),
		metadata: jsonb('metadata').default('{}'),
		createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }), // If admin granted
		createdAt: timestamp('created_at')
			.notNull()
			.default(sql`now()`)
	},
	(table) => ({
		userIdx: index('idx_inventory_transactions_user_id').on(table.userId),
		productIdx: index('idx_inventory_transactions_product_id').on(table.productId),
		typeIdx: index('idx_inventory_transactions_transaction_type').on(table.transactionType),
		createdAtIdx: index('idx_inventory_transactions_created_at').on(table.createdAt)
	})
);
export type InventoryTransaction = typeof inventoryTransactions.$inferSelect;
// export type InsertInventoryTransaction = typeof inventoryTransactions.$inferInsert; // If needed
