/**
 * Signature Routes
 *
 * API endpoints for user signatures and signature shop items.
 */

import { Router } from 'express';
import type { Request, Response } from 'express';
import { SignatureService } from './signature.service';
import { z } from 'zod';
import { validateRequest } from '../../middleware/validate-request';
import { getUserIdFromRequest } from '@server/src/utils/auth';

const router = Router();

// Define request validation schemas
const updateSignatureSchema = z.object({
	signature: z.string().max(1000) // Max length for validation - actual limit enforced in service
});

const purchaseItemSchema = z.object({
	itemId: z.number().int().positive()
});

const activateItemSchema = z.object({
	itemId: z.number().int().positive()
});

/**
 * Get current user's signature
 */
router.get('/me', async (req: Request, res: Response) => {
	try {
		const userId = getUserIdFromRequest(req);

		if (userId === undefined) {
			return res.status(401).json({ message: 'Unauthorized' });
		}

		const signatureData = await SignatureService.getUserSignature(userId);

		if (!signatureData) {
			return res.status(404).json({ message: 'User not found' });
		}

		return res.status(200).json(signatureData);
	} catch (error) {
		console.error('Error fetching signature:', error);
		return res.status(500).json({ message: 'Error fetching signature data' });
	}
});

/**
 * Get a specific user's signature by ID
 */
router.get('/:userId', async (req: Request, res: Response) => {
	try {
		const userId = parseInt(req.params.userId);

		if (isNaN(userId)) {
			return res.status(400).json({ message: 'Invalid user ID' });
		}

		const signatureData = await SignatureService.getUserSignature(userId);

		if (!signatureData) {
			return res.status(404).json({ message: 'User not found' });
		}

		return res.status(200).json(signatureData);
	} catch (error) {
		console.error('Error fetching signature:', error);
		return res.status(500).json({ message: 'Error fetching signature data' });
	}
});

/**
 * Update current user's signature
 */
router.put('/', validateRequest(updateSignatureSchema), async (req: Request, res: Response) => {
	try {
		const userId = getUserIdFromRequest(req);

		if (userId === undefined) {
			return res.status(401).json({ message: 'Unauthorized' });
		}

		const { signature } = req.body;

		const result = await SignatureService.updateSignature({
			userId,
			signatureText: signature
		});

		return res.status(200).json(result);
	} catch (error: any) {
		console.error('Error updating signature:', error);
		return res.status(400).json({ message: error.message || 'Error updating signature' });
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
		return res.status(200).json(items);
	} catch (error) {
		console.error('Error fetching signature shop items:', error);
		return res.status(500).json({ message: 'Error fetching signature shop items' });
	}
});

/**
 * Get user's signature items
 */
router.get('/shop/my-items', async (req: Request, res: Response) => {
	try {
		const userId = getUserIdFromRequest(req);

		if (userId === undefined) {
			return res.status(401).json({ message: 'Unauthorized' });
		}

		const items = await SignatureService.getUserSignatureItems(userId);
		return res.status(200).json(items);
	} catch (error) {
		console.error('Error fetching user signature items:', error);
		return res.status(500).json({ message: 'Error fetching user signature items' });
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
				return res.status(401).json({ message: 'Unauthorized' });
			}

			const { itemId } = req.body;

			const result = await SignatureService.purchaseSignatureItem(userId, itemId);
			return res.status(200).json(result);
		} catch (error: any) {
			console.error('Error purchasing signature item:', error);
			return res.status(400).json({ message: error.message || 'Error purchasing signature item' });
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
				return res.status(401).json({ message: 'Unauthorized' });
			}

			const { itemId } = req.body;

			const result = await SignatureService.activateSignatureItem(userId, itemId);
			return res.status(200).json(result);
		} catch (error: any) {
			console.error('Error activating signature item:', error);
			return res.status(400).json({ message: error.message || 'Error activating signature item' });
		}
	}
);

export default router;
