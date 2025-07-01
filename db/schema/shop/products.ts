import {
	pgTable,
	serial,
	uuid,
	varchar,
	text,
	doublePrecision,
	integer,
	jsonb,
	boolean,
	timestamp,
	index
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { productCategories } from './productCategories'; // Placeholder
import { mediaLibrary } from '../admin/mediaLibrary'; // Placeholder, path might change based on final admin structure
import { avatarFrames } from '../user/avatarFrames';

export const products = pgTable(
	'products',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		uuid: uuid('uuid').notNull().defaultRandom(),
		name: varchar('name', { length: 255 }).notNull(),
		slug: varchar('slug', { length: 255 }).notNull().unique(),
		description: text('description'),
		richDescription: text('rich_description'),
		price: doublePrecision('price').notNull().default(0),
		discountPrice: doublePrecision('discount_price'),
		costPrice: doublePrecision('cost_price'),
		sku: varchar('sku', { length: 100 }),
		barcode: varchar('barcode', { length: 100 }),
		stock: integer('stock').notNull().default(0),
		weight: doublePrecision('weight'),
		dimensions: jsonb('dimensions').default('{}'),
		categoryId: integer('category_id').references(() => productCategories.id, {
			onDelete: 'set null'
		}),
		featuredImageId: integer('featured_image_id').references(() => mediaLibrary.id, {
			onDelete: 'set null'
		}),
		status: varchar('status', { length: 50 }).notNull().default('draft'), // e.g., draft, published, archived
		pluginReward: jsonb('plugin_reward').default('{}'),
		isDigital: boolean('is_digital').notNull().default(false),
		digitalFileId: integer('digital_file_id').references(() => mediaLibrary.id, {
			onDelete: 'set null'
		}),
		pointsPrice: integer('points_price'),
		publishedAt: timestamp('published_at'),
		availableFrom: timestamp('available_from'),
		availableUntil: timestamp('available_until'),
		stockLimit: integer('stock_limit'), // Max per user or overall?
		featuredUntil: timestamp('featured_until'),
		promotionLabel: varchar('promotion_label', { length: 100 }),
		isDeleted: boolean('is_deleted').notNull().default(false),
		deletedAt: timestamp('deleted_at'),
		createdAt: timestamp('created_at')
			.notNull()
			.default(sql`now()`),
		updatedAt: timestamp('updated_at')
			.notNull()
			.default(sql`now()`),
		metadata: jsonb('metadata').default('{}'),
		/**
		 * When this product represents an avatar frame, we store a foreign key to the frame
		 * so price, rarity and preview can be resolved quickly in joins.
		 */
		frameId: integer('frame_id').references(() => avatarFrames.id, { onDelete: 'set null' })
	},
	(table) => ({
		categoryIdx: index('idx_products_category_id').on(table.categoryId),
		statusIdx: index('idx_products_status').on(table.status),
		createdAtIdx: index('idx_products_created_at').on(table.createdAt),
		availableFromIdx: index('idx_products_available_from').on(table.availableFrom),
		availableUntilIdx: index('idx_products_available_until').on(table.availableUntil),
		featuredUntilIdx: index('idx_products_featured_until').on(table.featuredUntil)
	})
);

export type Product = typeof products.$inferSelect;
// export type InsertProduct = typeof products.$inferInsert; // If needed
