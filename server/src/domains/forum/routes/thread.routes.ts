/**
 * Thread Routes
 * Handles all thread-specific API endpoints.
 */

import { Router } from 'express'
import type { Router as RouterType } from 'express';
import { isAuthenticated, isAdminOrModerator } from '@domains/auth/middleware/auth.middleware';
import {
	requireThreadSolvePermission,
	requireThreadTagPermission
} from '../services/permissions.service';
import { threadController } from '../controllers/thread.controller';
import { threadValidation } from '../validation/thread.validation';
import { validateRequest } from '@middleware/validate-request';
import { asyncHandler } from '@core/errors';

const router: RouterType = Router();

// --- Public Routes ---
router.get('/search', asyncHandler(threadController.searchThreads.bind(threadController)));

router.get('/', asyncHandler(threadController.searchThreads.bind(threadController)));

router.get(
	'/:id',
	validateRequest(threadValidation.threadParams),
	asyncHandler(threadController.getThreadById.bind(threadController))
);

router.get('/slug/:slug', asyncHandler(threadController.getThreadBySlug.bind(threadController)));

router.get('/:threadId/posts', asyncHandler(threadController.getThreadPosts.bind(threadController)));

// --- Authenticated User Routes ---
router.post(
	'/',
	isAuthenticated,
	validateRequest(threadValidation.createThread),
	asyncHandler(threadController.createThread.bind(threadController))
);

router.put(
	'/:threadId/solve',
	isAuthenticated,
	requireThreadSolvePermission,
	validateRequest(threadValidation.updateThreadSolved),
	asyncHandler(threadController.updateThreadSolvedStatus.bind(threadController))
);

router.post(
	'/:threadId/tags',
	isAuthenticated,
	requireThreadTagPermission,
	validateRequest(threadValidation.addTags),
	asyncHandler(threadController.addTagsToThread.bind(threadController))
);

router.delete(
	'/:threadId/tags/:tagId',
	isAuthenticated,
	requireThreadTagPermission,
	validateRequest(threadValidation.tagParams),
	asyncHandler(threadController.removeTagFromThread.bind(threadController))
);

// --- Admin & Moderator Routes ---
router.post(
	'/:threadId/feature',
	isAuthenticated,
	isAdminOrModerator,
	validateRequest(threadValidation.threadParams),
	asyncHandler(threadController.toggleThreadFeature.bind(threadController))
);

router.delete(
	'/:threadId/feature',
	isAuthenticated,
	isAdminOrModerator,
	validateRequest(threadValidation.threadParams),
	asyncHandler(threadController.toggleThreadFeature.bind(threadController))
);

router.post(
	'/:threadId/lock',
	isAuthenticated,
	isAdminOrModerator,
	validateRequest(threadValidation.threadParams),
	asyncHandler(threadController.toggleThreadLock.bind(threadController))
);

router.delete(
	'/:threadId/lock',
	isAuthenticated,
	isAdminOrModerator,
	validateRequest(threadValidation.threadParams),
	asyncHandler(threadController.toggleThreadLock.bind(threadController))
);

router.post(
	'/:threadId/pin',
	isAuthenticated,
	isAdminOrModerator,
	validateRequest(threadValidation.threadParams),
	asyncHandler(threadController.toggleThreadPin.bind(threadController))
);

router.delete(
	'/:threadId/pin',
	isAuthenticated,
	isAdminOrModerator,
	validateRequest(threadValidation.threadParams),
	asyncHandler(threadController.toggleThreadPin.bind(threadController))
);

export default router;
