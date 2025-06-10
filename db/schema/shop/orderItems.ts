import {
	pgTable,
	serial,
	integer,
	varchar,
	doublePrecision,
	jsonb,
	timestamp,
	index,
	boolean
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { orders } from './orders';
import { products } from './products';

export const orderItems = pgTable(
	'order_items',
	{
		id: serial('item_id').primaryKey(),
		orderId: integer('order_id')
			.notNull()
			.references(() => orders.id, { onDelete: 'cascade' }),
		productId: integer('product_id').references(() => products.id, { onDelete: 'set null' }),
		productName: varchar('product_name', { length: 255 }).notNull(), // Denormalized for history if product is deleted/changed
		quantity: integer('quantity').notNull().default(1),
		price: doublePrecision('price').notNull(), // Price at time of order
		total: doublePrecision('total').notNull(), // quantity * price
		isPointsUsed: boolean('is_points_used').notNull().default(false),
		pointsUsed: integer('points_used').default(0),
		metadata: jsonb('metadata').default('{}'),
		createdAt: timestamp('created_at')
			.notNull()
			.default(sql`now()`) // Changed defaultNow() to sql`now()`
	},
	(table) => ({
		orderIdx: index('idx_order_items_order_id').on(table.orderId),
		productIdx: index('idx_order_items_product_id').on(table.productId)
	})
);

export type OrderItem = typeof orderItems.$inferSelect;
// Add InsertOrderItem if Zod schema is needed
