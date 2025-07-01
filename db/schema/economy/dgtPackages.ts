import {
	pgTable,
	serial,
	varchar,
	text,
	bigint,
	decimal,
	integer,
	boolean,
	timestamp,
	index, uuid } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

export const dgtPackages = pgTable(
	'dgt_packages',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		name: varchar('name', { length: 100 }).notNull(),
		description: text('description'),
		dgtAmount: bigint('dgt_amount', { mode: 'number' }).notNull(),
		usdPrice: decimal('usd_price', { precision: 10, scale: 2 }).notNull(),
		discountPercentage: integer('discount_percentage'),
		isFeatured: boolean('is_featured').notNull().default(false),
		imageUrl: varchar('image_url', { length: 255 }),
		isActive: boolean('is_active').notNull().default(true),
		sortOrder: integer('sort_order').notNull().default(0),
		createdAt: timestamp('created_at')
			.notNull()
			.default(sql`now()`),
		updatedAt: timestamp('updated_at')
			.notNull()
			.default(sql`now()`)
	},
	(table) => ({
		nameIdx: index('idx_dgt_packages_name').on(table.name),
		activeIdx: index('idx_dgt_packages_active').on(table.isActive),
		featuredIdx: index('idx_dgt_packages_featured').on(table.isFeatured)
	})
);

export const insertDgtPackageSchema = createInsertSchema(dgtPackages, {
	name: z.string().min(1).max(100),
	description: z.string().optional(),
	dgtAmount: z.number().min(1),
	usdPrice: z.number().min(0.01),
	discountPercentage: z.number().min(0).max(100).optional(),
	isFeatured: z.boolean().default(false),
	imageUrl: z.string().optional(),
	isActive: z.boolean().default(true),
	sortOrder: z.number().default(0)
}).omit({
	id: true,
	createdAt: true,
	updatedAt: true
});

export type DgtPackage = typeof dgtPackages.$inferSelect;
export type InsertDgtPackage = z.infer<typeof insertDgtPackageSchema>;
