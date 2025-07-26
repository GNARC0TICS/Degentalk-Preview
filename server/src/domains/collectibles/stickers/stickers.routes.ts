/**
 * Sticker Routes
 *
 * Admin routes for sticker system management
 */

import { Router } from 'express'
import type { Router as RouterType } from 'express';
import { stickerController } from './stickers.controller';
import { isAdmin } from '@domains/admin/admin.middleware';

export const stickerRoutes: RouterType = Router();

// Apply admin authentication to all routes
stickerRoutes.use(isAdmin);

// ============ STICKER MANAGEMENT ============

// Main sticker endpoints
stickerRoutes.get('/stickers', stickerController.getStickers.bind(stickerController));
stickerRoutes.post('/stickers', stickerController.createSticker.bind(stickerController));
stickerRoutes.get(
	'/stickers/categories',
	stickerController.getStickerCategories.bind(stickerController)
);

// Individual sticker operations
stickerRoutes.get('/stickers/:id', stickerController.getSticker.bind(stickerController));
stickerRoutes.put('/stickers/:id', stickerController.updateSticker.bind(stickerController));
stickerRoutes.delete('/stickers/:id', stickerController.deleteSticker.bind(stickerController));

// Bulk operations
stickerRoutes.post(
	'/stickers/bulk-delete',
	stickerController.bulkDeleteStickers.bind(stickerController)
);

// File operations (Supabase Storage ready)
stickerRoutes.post('/stickers/upload', stickerController.uploadStickerFile.bind(stickerController));
stickerRoutes.post(
	'/stickers/confirm-upload',
	stickerController.confirmStickerUpload.bind(stickerController)
);
stickerRoutes.delete(
	'/stickers/delete-file',
	stickerController.deleteStickerFile.bind(stickerController)
);
stickerRoutes.get(
	'/stickers/preview/:id',
	stickerController.previewSticker.bind(stickerController)
);

// Usage tracking
stickerRoutes.post(
	'/stickers/track-usage',
	stickerController.trackStickerUsage.bind(stickerController)
);

// ============ STICKER PACK MANAGEMENT ============

// Main pack endpoints
stickerRoutes.get('/sticker-packs', stickerController.getStickerPacks.bind(stickerController));
stickerRoutes.post('/sticker-packs', stickerController.createStickerPack.bind(stickerController));

// Individual pack operations
stickerRoutes.get('/sticker-packs/:id', stickerController.getStickerPack.bind(stickerController));
stickerRoutes.put(
	'/sticker-packs/:id',
	stickerController.updateStickerPack.bind(stickerController)
);
stickerRoutes.delete(
	'/sticker-packs/:id',
	stickerController.deleteStickerPack.bind(stickerController)
);
