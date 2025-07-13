import { relations } from 'drizzle-orm';
import { pgTable, text, integer, timestamp, uniqueIndex, boolean, jsonb, uuid } from 'drizzle-orm/pg-core';
import { users } from '../user/users';
import { products } from './products';
import { transactions } from '../economy/transactions';
export const userInventory = pgTable('user_inventory', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    productId: uuid('product_id')
        .notNull()
        .references(() => products.id, { onDelete: 'cascade' }),
    quantity: integer('quantity').notNull().default(1),
    equipped: boolean('equipped').notNull().default(false),
    acquiredAt: timestamp('acquired_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    transactionId: uuid('transaction_id').references(() => transactions.id, {
        onDelete: 'set null'
    }),
    metadata: jsonb('metadata').default('{}')
}, (table) => ({
    userProductUnique: uniqueIndex('user_product_idx').on(table.userId, table.productId)
}));
export const userInventoryRelations = relations(userInventory, ({ one }) => ({
    user: one(users, {
        fields: [userInventory.userId],
        references: [users.id]
    }),
    product: one(products, {
        fields: [userInventory.productId],
        references: [products.id]
    }),
    transaction: one(transactions, {
        fields: [userInventory.transactionId],
        references: [transactions.id]
    })
}));
export const inventoryTransactionLinks = pgTable('inventory_transaction_links', {
    id: uuid('id').primaryKey().defaultRandom(),
    inventoryId: uuid('inventory_id')
        .notNull()
        .references(() => userInventory.id, { onDelete: 'cascade' }),
    transactionType: text('transaction_type').notNull(),
    quantityChange: integer('quantity_change').notNull(),
    relatedTransactionId: integer('related_transaction_id'),
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    dgtTransactionId: uuid('dgt_transaction_id').references(() => transactions.id, {
        onDelete: 'set null'
    })
});
export const inventoryTransactionLinksRelations = relations(inventoryTransactionLinks, ({ one }) => ({
    inventoryItem: one(userInventory, {
        fields: [inventoryTransactionLinks.inventoryId],
        references: [userInventory.id]
    }),
    dgtTransaction: one(transactions, {
        fields: [inventoryTransactionLinks.dgtTransactionId],
        references: [transactions.id]
    })
}));
//# sourceMappingURL=userInventory.js.map