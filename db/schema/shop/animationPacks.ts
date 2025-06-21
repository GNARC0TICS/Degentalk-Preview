import {
	pgTable,
	serial,
	uuid,
	varchar,
	text,
	boolean,
	doublePrecision,
	timestamp
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const animationPacks = pgTable('animation_packs', {
	id: serial('id').primaryKey(),
	uuid: uuid('uuid').notNull().defaultRandom(),
	name: varchar('name', { length: 255 }).notNull(),
	slug: varchar('slug', { length: 255 }).notNull().unique(),
	description: text('description'),
	rarity: varchar('rarity', { length: 20 }).notNull().default('cope'), // cope, mid, exit, mythic
	priceDgt: doublePrecision('price_dgt'),
	isPublished: boolean('is_published').notNull().default(false),
	createdAt: timestamp('created_at')
		.notNull()
		.default(sql`now()`),
	updatedAt: timestamp('updated_at')
		.notNull()
		.default(sql`now()`)
});

export type AnimationPack = typeof animationPacks.$inferSelect;
