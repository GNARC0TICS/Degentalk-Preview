import type { AnyPgColumn } from 'drizzle-orm/pg-core';
import {
	pgTable,
	serial,
	varchar,
	text,
	integer,
	boolean,
	timestamp,
	index,
	uuid
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { mediaLibrary } from '../admin/mediaLibrary'; // Placeholder

export const productCategories = pgTable(
	'product_categories',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		name: varchar('name', { length: 100 }).notNull(),
		slug: varchar('slug', { length: 100 }).notNull().unique(),
		description: text('description'),
		imageId: integer('image_id').references(() => mediaLibrary.id, { onDelete: 'set null' }),
		parentId: integer('parent_id').references((): AnyPgColumn => productCategories.id, {
			onDelete: 'set null'
		}),
		position: integer('position').notNull().default(0),
		isActive: boolean('is_active').notNull().default(true),
		isDeleted: boolean('is_deleted').notNull().default(false),
		deletedAt: timestamp('deleted_at'),
		createdAt: timestamp('created_at')
			.notNull()
			.default(sql`CURRENT_TIMESTAMP`),
		updatedAt: timestamp('updated_at')
			.notNull()
			.default(sql`CURRENT_TIMESTAMP`)
	},
	(table) => ({
		parentIdx: index('idx_product_categories_parent_id').on(table.parentId)
	})
);

export type ProductCategory = typeof productCategories.$inferSelect;
// export type InsertProductCategory = typeof productCategories.$inferInsert; // If needed
