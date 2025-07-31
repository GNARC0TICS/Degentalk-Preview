/**
 * Signature Routes
 *
 * API endpoints for user signatures and signature shop items.
 */

import { Router } from 'express'
import type { Router as RouterType } from 'express';
import type { UserId } from '@shared/types/ids';
import type { Request, Response } from 'express';
import { SignatureService } from './signature.service';
import { z } from 'zod';
import { validateRequest } from '@middleware/validate-request';
import { getUserIdFromRequest } from '@core/utils/auth.helpers';
import { isValidId } from '@shared/utils/id';
import { logger } from '@core/logger';
import { sendSuccessResponse, sendErrorResponse } from '@core/utils/transformer.helpers';

const router: RouterType = Router();

// Define request validation schemas
const updateSignatureSchema = z.object({
	signature: z.string().max(1000) // Max length for validation - actual limit enforced in service
});

const purchaseItemSchema = z.object({
	itemId: z.string().uuid()
});

const activateItemSchema = z.object({
	itemId: z.string().uuid()
});

/**
 * Get current user's signature
 */
router.get('/me', async (req: Request, res: Response) => {
	try {
		const userId = getUserIdFromRequest(req);

		if (userId === undefined) {
			return sendErrorResponse(res, 'Unauthorized', 401);
		}

		const signatureData = await SignatureService.getUserSignature(userId);

		if (!signatureData) {
			return sendErrorResponse(res, 'User not found', 404);
		}

		return sendSuccessResponse(res, signatureData);
	} catch (error) {
		logger.error('Error fetching signature:', error);
		return sendErrorResponse(res, 'Error fetching signature data', 500);
	}
});

/**
 * Get a specific user's signature by ID
 */
router.get('/:userId', async (req: Request, res: Response) => {
	try {
		const userId = req.params.userId as UserId;

		if (!userId || !isValidId(userId)) {
			return sendErrorResponse(res, 'Invalid user ID', 400);
		}

		const signatureData = await SignatureService.getUserSignature(userId);

		if (!signatureData) {
			return sendErrorResponse(res, 'User not found', 404);
		}

		return sendSuccessResponse(res, signatureData);
	} catch (error) {
		logger.error('Error fetching signature:', error);
		return sendErrorResponse(res, 'Error fetching signature data', 500);
	}
});

/**
 * Update current user's signature
 */
router.put('/', validateRequest(updateSignatureSchema), async (req: Request, res: Response) => {
	try {
		const userId = getUserIdFromRequest(req);

		if (userId === undefined) {
			return sendErrorResponse(res, 'Unauthorized', 401);
		}

		const { signature } = req.body;

		const result = await SignatureService.updateSignature({
			userId,
			signatureText: signature
		});

		return sendSuccessResponse(res, result);
	} catch (error: any) {
		logger.error('Error updating signature:', error);
		return sendErrorResponse(res, error.message || 'Error updating signature', 400);
	}
});

/**
 * Get signature shop items
 */
router.get('/shop/items', async (req: Request, res: Response) => {
	try {
		const userId = getUserIdFromRequest(req);
		let userLevel = 1; // Default level

		if (userId !== undefined) {
			const userData = await SignatureService.getUserSignature(userId);
			if (userData) {
				userLevel = userData.userLevel;
			}
		}

		const items = await SignatureService.getSignatureShopItems(userLevel);
		return sendSuccessResponse(res, items);
	} catch (error) {
		logger.error('Error fetching signature shop items:', error);
		return sendErrorResponse(res, 'Error fetching signature shop items', 500);
	}
});

/**
 * Get user's signature items
 */
router.get('/shop/my-items', async (req: Request, res: Response) => {
	try {
		const userId = getUserIdFromRequest(req);

		if (userId === undefined) {
			return sendErrorResponse(res, 'Unauthorized', 401);
		}

		const items = await SignatureService.getUserSignatureItems(userId);
		return sendSuccessResponse(res, items);
	} catch (error) {
		logger.error('Error fetching user signature items:', error);
		return sendErrorResponse(res, 'Error fetching user signature items', 500);
	}
});

/**
 * Purchase a signature shop item
 */
router.post(
	'/shop/purchase',
	validateRequest(purchaseItemSchema),
	async (req: Request, res: Response) => {
		try {
			const userId = getUserIdFromRequest(req);

			if (userId === undefined) {
				return sendErrorResponse(res, 'Unauthorized', 401);
			}

			const { itemId } = req.body;

			const result = await SignatureService.purchaseSignatureItem(userId, itemId);
			return sendSuccessResponse(res, result);
		} catch (error: any) {
			logger.error('Error purchasing signature item:', error);
			return sendErrorResponse(res, error.message || 'Error purchasing signature item', 400);
		}
	}
);

/**
 * Activate a signature shop item
 */
router.post(
	'/shop/activate',
	validateRequest(activateItemSchema),
	async (req: Request, res: Response) => {
		try {
			const userId = getUserIdFromRequest(req);

			if (userId === undefined) {
				return sendErrorResponse(res, 'Unauthorized', 401);
			}

			const { itemId } = req.body;

			const result = await SignatureService.activateSignatureItem(userId, itemId);
			return sendSuccessResponse(res, result);
		} catch (error: any) {
			logger.error('Error activating signature item:', error);
			return sendErrorResponse(res, error.message || 'Error activating signature item', 400);
		}
	}
);

export default router;
