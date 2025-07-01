import { pgTable, serial, text, integer, timestamp, uuid } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const signatureShopItems = pgTable('signature_shop_items', {
	id: uuid('id').primaryKey().defaultRandom(),
	name: text('name').notNull(),
	effectKey: text('effect_key').notNull(), // Key used by frontend to apply the effect
	price: integer('price').notNull(), // Assuming DGT points or similar internal currency
	requiredLevel: integer('required_level').default(1),
	rarity: text('rarity'), // e.g., common, rare, epic
	createdAt: timestamp('created_at')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp('updated_at')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`)
});

export type SignatureShopItem = typeof signatureShopItems.$inferSelect;
export type InsertSignatureShopItem = typeof signatureShopItems.$inferInsert;
