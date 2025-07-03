/**
 * Collectibles Domain Relations
 * 
 * Auto-generated Drizzle relations for type-safe joins
 */

import { relations } from 'drizzle-orm';
import { stickerPacks } from './stickerPacks';
import { stickers } from './stickers';
import { userStickerInventory } from './userStickerInventory';
import { userStickerPacks } from './userStickerPacks';
import { stickerUsage } from './stickerUsage';
import { users } from '../user';

export const stickerPacksRelations = relations(stickerPacks, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [stickerPacks.createdBy],
    references: [users.id]
  }),
  pack: one(stickerPacks, {
    fields: [stickerPacks.packId],
    references: [stickerPacks.id]
  }),
  createdBy: one(users, {
    fields: [stickerPacks.createdBy],
    references: [users.id]
  }),
}));

export const stickerPacksRelations = relations(stickerPacks, ({ one, many }) => ({
  stickerPacks: many(stickerPacks),
}));

