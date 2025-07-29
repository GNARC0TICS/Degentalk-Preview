import { Router } from 'express';
import { avatarFrameStoreService } from '@domains/cosmetics/avatarFrameStore.service';
import { requireAuth } from '@middleware/auth.unified';
import { frameEquipService } from '@domains/cosmetics/frameEquip.service';
import { dgtService } from '@domains/wallet/services/dgtService';
import { userService } from '@core/services/user.service';
import { db } from '@db';
import { products, avatarFrames } from '@schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import type { FrameId } from '@shared/types/ids';
import { CosmeticsTransformer } from '@domains/shop/transformers/cosmetics.transformer';
import { logger } from '@core/logger';
import { sendSuccessResponse, sendErrorResponse } from '@core/utils/transformer.helpers';
import { validateAndConvertId } from '@core/helpers/validate-controller-ids';
import { toFrameId } from '@shared/utils/id';

const router: Router = Router();

// GET /api/store/avatar-frames
router.get('/', async (_req, res) => {
	try {
		// Add cache headers for better performance (5 minute cache)
		res.setHeader('Cache-Control', 'public, max-age=300');
		
		const frames = await avatarFrameStoreService.listAvailableFrames();

		// Transform raw DB rows → public DTOs (security-first)
		const transformed = frames.map((frame: any) => CosmeticsTransformer.toPublicCosmetic(frame));

		return sendSuccessResponse(res, transformed);
	} catch (error) {
		logger.error('Failed to fetch store avatar frames', error);
		return sendErrorResponse(res, 'Failed to fetch avatar frames', 500);
	}
});

// POST /api/store/avatar-frames/:id/purchase
router.post('/:id/purchase', requireAuth, async (req, res) => {
	const authUser = userService.getUserFromRequest(req);
	if (!authUser) return sendErrorResponse(res, 'Not authenticated', 401);
	const userId = String(authUser.id);
	
	// Validate frame ID
	const frameIdString = req.params.id;
	if (!frameIdString || !validateAndConvertId(frameIdString, 'Frame')) {
		return sendErrorResponse(res, 'Invalid frame ID format', 400);
	}
	const frameId = toFrameId(frameIdString);

	try {
		// Fetch frame product with price
		const [row] = await db
			.select({ price: products.price, productId: products.id })
			.from(products)
			.innerJoin(avatarFrames, eq(products.frameId, avatarFrames.id))
			.where(eq(avatarFrames.id, frameId))
			.limit(1);

		if (!row) {
			return sendErrorResponse(res, 'Frame not found', 404);
		}

		const price = row.price ?? 0;

		if (price > 0) {
			await dgtService.deductDGT(userId, price, 'shop_purchase', undefined, {
				shopItemId: row.productId.toString()
			} as any);
		}

		await frameEquipService.grantOwnership(userId, frameId, 'shop');
		return sendSuccessResponse(res, { price });
	} catch (error) {
		logger.error('Purchase avatar frame failed', error);
		return sendErrorResponse(res, 'Purchase failed', 500);
	}
});

// POST /api/users/me/frames/:id/equip route is defined in separate router below

export default router;
