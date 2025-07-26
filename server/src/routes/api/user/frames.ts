import { Router } from 'express';
import type { FrameId } from '@shared/types/ids';
import { isAuthenticated } from '@api/domains/auth/middleware/auth.middleware';
import { frameEquipService } from '@api/domains/cosmetics/frameEquip.service';
import { userService } from '@core/services/user.service';
import { sendSuccessResponse, sendErrorResponse } from '@core/utils/transformer.helpers';
import { validateAndConvertId } from '@core/helpers/validate-controller-ids';
import { db } from '@db';
import { userOwnedFrames, avatarFrames } from '@schema';
import { eq } from 'drizzle-orm';
import { defaultFrames } from '@shared/config/default-frames.config';

const router: Router = Router();

// GET /api/users/me/frames - Get user's owned frames
router.get('/', isAuthenticated, async (req, res) => {
	const authUser = userService.getUserFromRequest(req);
	if (!authUser) return sendErrorResponse(res, 'Not authenticated', 401);
	const userId = String(authUser.id);

	try {
		// Get user's owned frames from database
		const ownedFrames = await db
			.select({
				id: avatarFrames.id,
				name: avatarFrames.name,
				imageUrl: avatarFrames.imageUrl,
				rarity: avatarFrames.rarity,
				animated: avatarFrames.animated,
				source: userOwnedFrames.source,
				createdAt: userOwnedFrames.createdAt
			})
			.from(userOwnedFrames)
			.innerJoin(avatarFrames, eq(userOwnedFrames.frameId, avatarFrames.id))
			.where(eq(userOwnedFrames.userId, userId));

		// Default frames are always available to all users
		const allOwnedFrames = [
			...ownedFrames,
			...defaultFrames.map(frame => ({
				id: frame.id,
				name: frame.name,
				imageUrl: frame.imageUrl,
				rarity: frame.rarity,
				animated: frame.animated,
				source: 'default' as const,
				createdAt: new Date('2024-01-01') // Default frames available since launch
			}))
		];

		return sendSuccessResponse(res, allOwnedFrames);
	} catch (error: any) {
		return sendErrorResponse(res, 'Failed to fetch owned frames', 500);
	}
});

// POST /api/users/me/frames/:id/equip
router.post('/:id/equip', isAuthenticated, async (req, res) => {
	const authUser = userService.getUserFromRequest(req);
	if (!authUser) return sendErrorResponse(res, 'Not authenticated', 401);
	const userId = String(authUser.id);
	
	// Validate frame ID
	const frameId = validateAndConvertId(req.params.id, 'Frame');
	if (!frameId) {
		return sendErrorResponse(res, 'Invalid frame ID format', 400);
	}

	try {
		await frameEquipService.equipFrame(userId, frameId);
		return sendSuccessResponse(res, { success: true });
	} catch (error: any) {
		return sendErrorResponse(res, error.message || 'Failed to equip frame', 400);
	}
});

export default router;
