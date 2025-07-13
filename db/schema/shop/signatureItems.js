import { pgTable, text, integer, timestamp, uuid, index } from 'drizzle-orm/pg-core';
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
        .default(sql `CURRENT_TIMESTAMP`),
    updatedAt: timestamp('updated_at')
        .notNull()
        .default(sql `CURRENT_TIMESTAMP`)
}, (table) => ({
    idx_signatureShopItems_createdAt: index('idx_signatureShopItems_createdAt').on(table.createdAt),
    idx_signatureShopItems_updatedAt: index('idx_signatureShopItems_updatedAt').on(table.updatedAt)
}));
//# sourceMappingURL=signatureItems.js.map