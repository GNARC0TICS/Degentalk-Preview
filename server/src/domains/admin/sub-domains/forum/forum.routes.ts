/**
 * Admin Forum Routes
 *
 * Defines API routes for forum management.
 */

import { Router } from 'express';
import { adminForumController } from './forum.controller';
import { asyncHandler } from '../../admin.middleware';
import { forumPrefixService } from '../forumPrefix/forumPrefix.service';
import type { PrefixId } from '@shared/types/ids';

const router = Router();

// Forum entity management routes (zones, categories, forums)
router.get(
	'/entities',
	asyncHandler(adminForumController.getAllEntities.bind(adminForumController))
);
router.get(
	'/entities/:id',
	asyncHandler(adminForumController.getEntityById.bind(adminForumController))
);
router.post(
	'/entities',
	asyncHandler(adminForumController.createEntity.bind(adminForumController))
);
router.put(
	'/entities/:id',
	asyncHandler(adminForumController.updateEntity.bind(adminForumController))
);
router.delete(
	'/entities/:id',
	asyncHandler(adminForumController.deleteEntity.bind(adminForumController))
);

// Category management routes (legacy - kept for compatibility)
router.get(
	'/categories',
	asyncHandler(adminForumController.getAllCategories.bind(adminForumController))
);
router.get(
	'/categories/:id',
	asyncHandler(adminForumController.getCategoryById.bind(adminForumController))
);
router.post(
	'/categories',
	asyncHandler(adminForumController.createCategory.bind(adminForumController))
);
router.put(
	'/categories/:id',
	asyncHandler(adminForumController.updateCategory.bind(adminForumController))
);
router.delete(
	'/categories/:id',
	asyncHandler(adminForumController.deleteCategory.bind(adminForumController))
);

// Thread prefix management routes
router.get(
	'/prefixes',
	asyncHandler(adminForumController.getAllPrefixes.bind(adminForumController))
);
router.post(
	'/prefixes',
	asyncHandler(adminForumController.createPrefix.bind(adminForumController))
);

router.put(
	'/prefixes/:id',
	asyncHandler(async (req, res) => {
		const id = req.params.id as PrefixId;
		const updated = await forumPrefixService.updatePrefix(id, req.body);
		res.json(updated);
	})
);

router.delete(
	'/prefixes/:id',
	asyncHandler(async (req, res) => {
		const id = req.params.id as PrefixId;
		const result = await forumPrefixService.deletePrefix(id);
		res.json(result);
	})
);

// Reorder prefixes – expects array of IDs in body
router.post(
	'/prefixes/reorder',
	asyncHandler(async (req, res) => {
		const { order } = req.body as { order: number[] };
		if (!Array.isArray(order)) return res.status(400).json({ message: 'order must be array' });
		const result = await forumPrefixService.reorderPrefixes(order);
		res.json(result);
	})
);

// Tag management routes
router.get('/tags', asyncHandler(adminForumController.getAllTags.bind(adminForumController)));
router.post('/tags', asyncHandler(adminForumController.createTag.bind(adminForumController)));
router.put('/tags/:id', asyncHandler(adminForumController.updateTag.bind(adminForumController)));
router.delete('/tags/:id', asyncHandler(adminForumController.deleteTag.bind(adminForumController)));

// Thread moderation routes
router.put(
	'/threads/:id/moderate',
	asyncHandler(adminForumController.moderateThread.bind(adminForumController))
);

export default router;
