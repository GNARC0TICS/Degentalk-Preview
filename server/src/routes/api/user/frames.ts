import { Router } from 'express';
import type { FrameId } from '@shared/types/ids';
import { isAuthenticated } from '../../../domains/auth/middleware/auth.middleware';
import { frameEquipService } from '../../../domains/cosmetics/frameEquip.service';
import { userService } from '../../../core/services/user.service';
import { sendSuccessResponse, sendErrorResponse } from '@core/utils/transformer.helpers';

const router = Router();

// POST /api/users/me/frames/:id/equip
router.post('/:id/equip', isAuthenticated, async (req, res) => {
	const authUser = userService.getUserFromRequest(req);
	if (!authUser) return sendErrorResponse(res, 'Not authenticated', 401);
	const userId = String(authUser.id);
	const frameId = req.params.id as FrameId;

	try {
		await frameEquipService.equipFrame(userId, frameId);
		return sendSuccessResponse(res, { success: true });
	} catch (error: any) {
		return sendErrorResponse(res, error.message || 'Failed to equip frame', 400);
	}
});

export default router;
