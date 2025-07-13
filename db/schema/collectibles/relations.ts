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
	pack: one(stickerPacks, {
		fields: [stickerPacks.packId],
		references: [stickerPacks.id]
	})
}));
