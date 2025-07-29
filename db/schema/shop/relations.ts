/**
 * Shop Domain Relations
 *
 * Auto-generated Drizzle relations for type-safe joins
 */
import { relations } from 'drizzle-orm';
import { animationPackItems } from './animationPackItems';
import { animationPacks } from './animationPacks';
import { cosmeticCategories } from './cosmeticCategories';
import { inventoryTransactions } from './inventoryTransactions';
import { orderItems } from './orderItems';
import { orders } from './orders';
import { productCategories } from './productCategories';
import { productMedia } from './productMedia';
import { products } from './products';
import { rarities } from './rarities';
import { signatureShopItems } from './signatureItems';
import { userInventory } from './userInventory';
import { userSignatureItems } from './userSignatureItems';
import { users } from '../user/users';
import { avatarFrames } from '../user/avatarFrames';
import { mediaLibrary } from '../admin/mediaLibrary';
import { transactions } from '../economy/transactions';
export const animationPackItemsRelations = relations(animationPackItems, ({ one, many }) => ({
	pack: one(animationPacks, {
		fields: [animationPackItems.packId],
		references: [animationPacks.id]
	}),
	media: one(mediaLibrary, {
		fields: [animationPackItems.mediaId],
		references: [mediaLibrary.id]
	})
}));
export const inventoryTransactionsRelations = relations(inventoryTransactions, ({ one, many }) => ({
	createdBy: one(users, {
		fields: [inventoryTransactions.createdBy],
		references: [users.id]
	})
}));
export const ordersRelations = relations(orders, ({ one, many }) => ({
	user: one(users, {
		fields: [orders.userId],
		references: [users.id]
	})
}));
export const productCategoriesRelations = relations(productCategories, ({ one, many }) => ({
	products: many(products)
}));
export const productsRelations = relations(products, ({ one, many }) => ({
	category: one(productCategories, {
		fields: [products.categoryId],
		references: [productCategories.id]
	}),
	featuredImage: one(mediaLibrary, {
		fields: [products.featuredImageId],
		references: [mediaLibrary.id]
	}),
	digitalFile: one(mediaLibrary, {
		fields: [products.digitalFileId],
		references: [mediaLibrary.id]
	}),
	frame: one(avatarFrames, {
		fields: [products.frameId],
		references: [avatarFrames.id]
	})
}));
export const userInventoryRelations = relations(userInventory, ({ one, many }) => ({
	transaction: one(transactions, {
		fields: [userInventory.transactionId],
		references: [transactions.id]
	}),
	dgtTransaction: one(transactions, {
		fields: [userInventory.dgtTransactionId],
		references: [transactions.id]
	})
}));
export const animationPacksRelations = relations(animationPacks, ({ one, many }) => ({
	animationPackItems: many(animationPackItems)
}));
