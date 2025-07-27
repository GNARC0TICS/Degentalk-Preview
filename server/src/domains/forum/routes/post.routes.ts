/**
 * Post Routes
 * Handles all post-specific API endpoints.
 */

import { Router } from 'express'
import type { Router as RouterType } from 'express';
import { isAuthenticated } from '@domains/auth/middleware/auth.middleware';
import {
	requirePostEditPermission,
	requirePostDeletePermission
} from '../services/permissions.service';
import { postController } from '../controllers/post.controller';
import { postValidation } from '../validation/post.validation';
import { validateRequest } from '@middleware/validate-request';
import { asyncHandler } from '@core/errors';

const router: RouterType = Router();

// --- Public Routes ---
router.get(
	'/:postId/replies',
	validateRequest(postValidation.postParams),
	asyncHandler(postController.getPostReplies.bind(postController))
);

// --- Authenticated User Routes ---
router.post(
	'/',
	isAuthenticated,
	validateRequest(postValidation.createPost),
	asyncHandler(postController.createPost.bind(postController))
);

router.put(
	'/:id',
	isAuthenticated,
	requirePostEditPermission,
	validateRequest(postValidation.updatePost),
	asyncHandler(postController.updatePost.bind(postController))
);

router.delete(
	'/:id',
	isAuthenticated,
	requirePostDeletePermission,
	validateRequest(postValidation.postParams),
	asyncHandler(postController.deletePost.bind(postController))
);

router.post(
	'/:postId/react',
	isAuthenticated,
	validateRequest(postValidation.postReaction),
	asyncHandler(postController.handleReaction.bind(postController))
);

router.post(
	'/:postId/tip',
	isAuthenticated,
	validateRequest(postValidation.tipPost),
	asyncHandler(postController.tipPost.bind(postController))
);

export default router;
