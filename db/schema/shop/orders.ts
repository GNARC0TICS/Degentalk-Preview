import {
	pgTable,
	serial,
	uuid,
	integer,
	varchar,
	doublePrecision,
	jsonb,
	text,
	boolean,
	timestamp,
	index
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from '../user/users';

export const orders = pgTable(
	'orders',
	{
		id: serial('order_id').primaryKey(),
		uuid: uuid('uuid').notNull().defaultRandom(),
		userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
		status: varchar('status', { length: 50 }).notNull().default('pending'),
		total: doublePrecision('total').notNull().default(0),
		subtotal: doublePrecision('subtotal').notNull().default(0),
		tax: doublePrecision('tax').default(0),
		shipping: doublePrecision('shipping').default(0),
		discount: doublePrecision('discount').default(0),
		paymentMethod: varchar('payment_method', { length: 100 }),
		paymentId: varchar('payment_id', { length: 255 }),
		billingAddress: jsonb('billing_address').default('{}'),
		shippingAddress: jsonb('shipping_address').default('{}'),
		customerNotes: text('customer_notes'),
		adminNotes: text('admin_notes'),
		isPointsUsed: boolean('is_points_used').notNull().default(false),
		pointsUsed: integer('points_used').default(0),
		isDeleted: boolean('is_deleted').notNull().default(false),
		deletedAt: timestamp('deleted_at'),
		createdAt: timestamp('created_at')
			.notNull()
			.default(sql`now()`),
		updatedAt: timestamp('updated_at')
			.notNull()
			.default(sql`now()`),
		completedAt: timestamp('completed_at')
	},
	(table) => ({
		userIdx: index('idx_orders_user_id').on(table.userId),
		statusIdx: index('idx_orders_status').on(table.status),
		createdAtIdx: index('idx_orders_created_at').on(table.createdAt)
	})
);

export type Order = typeof orders.$inferSelect;
// export type InsertOrder = typeof orders.$inferInsert; // If needed
