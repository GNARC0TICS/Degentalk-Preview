import { relations } from "drizzle-orm";
import { pgTable, serial, text, integer, timestamp, uniqueIndex, primaryKey } from "drizzle-orm/pg-core";
import { users } from "../user/users";
import { products } from "./products";
import { transactions } from "../economy/transactions";

export const inventory = pgTable("inventory", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  productId: integer("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull().default(1),
  data: text("data"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  transactionId: integer("transaction_id").references(() => transactions.id, { onDelete: "set null" }),
}, (table) => ({
  userProductUnique: uniqueIndex("user_product_idx").on(table.userId, table.productId),
}));

export const inventoryRelations = relations(inventory, ({ one }) => ({
  user: one(users, {
    fields: [inventory.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [inventory.productId],
    references: [products.id],
  }),
  transaction: one(transactions, {
    fields: [inventory.transactionId],
    references: [transactions.id],
  }),
}));

export const inventoryTransactions = pgTable("inventory_transactions", {
  id: serial("id").primaryKey(),
  inventoryId: integer("inventory_id").notNull().references(() => inventory.id, { onDelete: "cascade" }),
  transactionType: text("transaction_type").notNull(),
  quantityChange: integer("quantity_change").notNull(),
  relatedTransactionId: integer("related_transaction_id"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  dgtTransactionId: integer("dgt_transaction_id").references(() => transactions.id, { onDelete: "set null" }),
});

export const inventoryTransactionsRelations = relations(inventoryTransactions, ({ one }) => ({
  inventoryItem: one(inventory, {
    fields: [inventoryTransactions.inventoryId],
    references: [inventory.id],
  }),
  dgtTransaction: one(transactions, {
    fields: [inventoryTransactions.dgtTransactionId],
    references: [transactions.id],
  }),
})); 