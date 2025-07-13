import { Router } from 'express';
import type { FrameId } from '@shared/types/ids';
import { isAuthenticated } from '@server/domains/auth/middleware/auth.middleware';
import { frameEquipService } from '../../../domains/cosmetics/frameEquip.service';
import { userService } from '@core/services/user.service';
import { sendSuccessResponse, sendErrorResponse } from '@core/utils/transformer.helpers';
import { validateAndConvertId } from '@core/helpers/validate-controller-ids';

const router = Router();

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
