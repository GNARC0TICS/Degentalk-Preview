import { Router } from 'express'
import type { Router as RouterType } from 'express';
import {
	getAllEmojis,
	getEmojiById,
	createEmoji,
	updateEmoji,
	deleteEmoji,
	bulkDeleteEmojis,
	getEmojiCategories
} from './emojis.controller';
import { asyncHandler } from '../../admin.middleware';

const router: RouterType = Router();

// Apply asyncHandler to all routes for consistent error handling

// GET /api/admin/emojis/categories - Get all emoji categories
router.get('/categories', asyncHandler(getEmojiCategories));

// GET /api/admin/emojis - Get all emojis with filtering and pagination
router.get('/', asyncHandler(getAllEmojis));

// GET /api/admin/emojis/:id - Get a single emoji by ID
router.get('/:id', asyncHandler(getEmojiById));

// POST /api/admin/emojis - Create a new emoji
router.post('/', asyncHandler(createEmoji));

// POST /api/admin/emojis/bulk-delete - Bulk delete emojis
router.post('/bulk-delete', asyncHandler(bulkDeleteEmojis));

// PUT /api/admin/emojis/:id - Update an existing emoji
router.put('/:id', asyncHandler(updateEmoji));

// DELETE /api/admin/emojis/:id - Soft delete an emoji
router.delete('/:id', asyncHandler(deleteEmoji));

export default router;
