import { Router } from 'express';
import { avatarFrameStoreService } from '../../domains/cosmetics/avatarFrameStore.service';
import { isAuthenticated } from '../../domains/auth/middleware/auth.middleware';
import { frameEquipService } from '../../domains/cosmetics/frameEquip.service';
import { dgtService } from '../../domains/wallet/dgt.service';
import { userService } from '../../core/services/user.service';
import { db } from '@db';
import { products, avatarFrames } from '@schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import type { FrameId } from '@shared/types';
import { CosmeticsTransformer } from '../../../domains/shop/transformers/cosmetics.transformer';

const router = Router();

// GET /api/store/avatar-frames
router.get('/', async (_req, res) => {
	try {
		const frames = await avatarFrameStoreService.listAvailableFrames();

		// Transform raw DB rows → public DTOs (security-first)
		const transformed = frames.map((frame: any) =>
			CosmeticsTransformer.toPublicCosmetic(frame)
		);

		return res.json(transformed);
	} catch (error) {
		console.error('Failed to fetch store avatar frames', error);
		return res.status(500).json({ error: 'Failed to fetch avatar frames' });
	}
});

// POST /api/store/avatar-frames/:id/purchase
router.post('/:id/purchase', isAuthenticated, async (req, res) => {
	const authUser = userService.getUserFromRequest(req);
	if (!authUser) return res.status(401).json({ error: 'Not authenticated' });
	const userId = String(authUser.id);
	const frameId = req.params.id as FrameId;

	try {
		// Fetch frame product with price
		const [row] = await db
			.select({ price: products.price, productId: products.id })
			.from(products)
			.innerJoin(avatarFrames, eq(products.frameId, avatarFrames.id))
			.where(eq(avatarFrames.id, frameId))
			.limit(1);

		if (!row) {
			return res.status(404).json({ error: 'Frame not found' });
		}

		const price = row.price ?? 0;

		if (price > 0) {
			await dgtService.deductDGT(userId, price, 'shop_purchase', undefined, {
				shopItemId: row.productId.toString()
			} as any);
		}

		await frameEquipService.grantOwnership(userId, frameId, 'shop');
		return res.status(200).json({ success: true, price });
	} catch (error) {
		console.error('Purchase avatar frame failed', error);
		return res.status(500).json({ error: 'Purchase failed' });
	}
});

// POST /api/users/me/frames/:id/equip route is defined in separate router below

export default router;
