import { pgTable, serial, integer, boolean, timestamp, unique, index, uuid } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { products } from './products';
import { mediaLibrary } from '../admin/mediaLibrary'; // Adjust path as needed

export const productMedia = pgTable(
	'product_media',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		productId: integer('product_id')
			.notNull()
			.references(() => products.id, { onDelete: 'cascade' }),
		mediaId: integer('media_id')
			.notNull()
			.references(() => mediaLibrary.id, { onDelete: 'cascade' }),
		position: integer('position').notNull().default(0),
		isPrimary: boolean('is_primary').notNull().default(false),
		createdAt: timestamp('created_at')
			.notNull()
			.default(sql`now()`)
	},
	(table) => ({
		productMediaIdx: unique('product_media_unique').on(table.productId, table.mediaId),
		productIdx: index('idx_product_media_product_id').on(table.productId)
	})
);

export type ProductMedia = typeof productMedia.$inferSelect;
// export type InsertProductMedia = typeof productMedia.$inferInsert; // If needed
