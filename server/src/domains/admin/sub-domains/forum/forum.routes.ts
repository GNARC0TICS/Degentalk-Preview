/**
 * Admin Forum Routes
 *
 * Defines API routes for forum management.
 */

import { Router } from 'express';
import { adminForumController } from './forum.controller';
import { asyncHandler } from '../../admin.middleware';

const router = Router();

// Category management routes
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

// Thread moderation routes
router.put(
	'/threads/:id/moderate',
	asyncHandler(adminForumController.moderateThread.bind(adminForumController))
);

export default router;
