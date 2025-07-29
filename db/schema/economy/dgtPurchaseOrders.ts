import {
	pgTable,
	bigint,
	decimal,
	varchar,
	jsonb,
	timestamp,
	index,
	uuid
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from '../user/users';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
export const dgtPurchaseOrders = pgTable(
	'dgt_purchase_orders',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		dgtAmountRequested: bigint('dgt_amount_requested', { mode: 'number' }).notNull(),
		cryptoAmountExpected: decimal('crypto_amount_expected', { precision: 18, scale: 8 }).notNull(),
		cryptoCurrencyExpected: varchar('crypto_currency_expected', { length: 10 }).notNull(),
		ccpaymentReference: varchar('ccpayment_reference', { length: 255 }).notNull(),
		status: varchar('status', { length: 20 }).notNull().default('pending'),
		metadata: jsonb('metadata').default('{}'),
		createdAt: timestamp('created_at')
			.notNull()
			.default(sql`now()`),
		updatedAt: timestamp('updated_at')
			.notNull()
			.default(sql`now()`)
	},
	(table) => ({
		userIdx: index('idx_dgt_purchase_orders_user_id').on(table.userId),
		statusIdx: index('idx_dgt_purchase_orders_status').on(table.status),
		ccpaymentRefIdx: index('idx_dgt_purchase_orders_ccpayment_ref').on(table.ccpaymentReference),
		createdAtIdx: index('idx_dgt_purchase_orders_created_at').on(table.createdAt)
	})
);
// Create insert schema with custom validations
const baseInsertDgtPurchaseOrderSchema = createInsertSchema(dgtPurchaseOrders, {
	dgtAmountRequested: z.number().min(1),
	cryptoAmountExpected: z.number().min(0.00000001),
	cryptoCurrencyExpected: z.string().min(1).max(10),
	ccpaymentReference: z.string().min(1).max(255)
});

// Use pick instead of omit to avoid type issues
export const insertDgtPurchaseOrderSchema = baseInsertDgtPurchaseOrderSchema.pick({
	dgtAmountRequested: true,
	cryptoAmountExpected: true,
	cryptoCurrencyExpected: true,
	ccpaymentReference: true
});
export type DgtPurchaseOrder = typeof dgtPurchaseOrders.$inferSelect;
export type InsertDgtPurchaseOrder = z.infer<typeof insertDgtPurchaseOrderSchema>;
