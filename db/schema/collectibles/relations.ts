/**
 * Collectibles Domain Relations
 *
 * Auto-generated Drizzle relations for type-safe joins
 */
import { relations } from 'drizzle-orm';
import {
	stickerPacks,
	stickers,
	userStickerInventory,
	userStickerPacks,
	stickerUsage
} from './stickers';
import { users } from '../user/users';

export const stickerPacksRelations = relations(stickerPacks, ({ one, many }) => ({
	createdBy: one(users, {
		fields: [stickerPacks.createdBy],
		references: [users.id]
	}),
	stickers: many(stickers)
}));

export const stickersRelations = relations(stickers, ({ one, many }) => ({
	pack: one(stickerPacks, {
		fields: [stickers.packId],
		references: [stickerPacks.id]
	}),
	createdBy: one(users, {
		fields: [stickers.createdBy],
		references: [users.id]
	}),
	inventory: many(userStickerInventory),
	usage: many(stickerUsage)
}));

export const userStickerInventoryRelations = relations(userStickerInventory, ({ one, many }) => ({
	user: one(users, {
		fields: [userStickerInventory.userId],
		references: [users.id]
	}),
	sticker: one(stickers, {
		fields: [userStickerInventory.stickerId],
		references: [stickers.id]
	})
}));

export const userStickerPacksRelations = relations(userStickerPacks, ({ one, many }) => ({
	user: one(users, {
		fields: [userStickerPacks.userId],
		references: [users.id]
	}),
	pack: one(stickerPacks, {
		fields: [userStickerPacks.packId],
		references: [stickerPacks.id]
	})
}));

export const stickerUsageRelations = relations(stickerUsage, ({ one, many }) => ({
	user: one(users, {
		fields: [stickerUsage.userId],
		references: [users.id]
	}),
	sticker: one(stickers, {
		fields: [stickerUsage.stickerId],
		references: [stickers.id]
	})
}));