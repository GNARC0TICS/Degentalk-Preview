import { Router } from 'express';
import type { FrameId } from '@shared/types';
import { isAuthenticated } from '../../../domains/auth/middleware/auth.middleware';
import { frameEquipService } from '../../../domains/cosmetics/frameEquip.service';
import { userService } from '../../../core/services/user.service';

const router = Router();

// POST /api/users/me/frames/:id/equip
router.post('/:id/equip', isAuthenticated, async (req, res) => {
	const authUser = userService.getUserFromRequest(req);
	if (!authUser) return res.status(401).json({ error: 'Not authenticated' });
	const userId = String(authUser.id);
	const frameId = req.params.id as FrameId;

	try {
		await frameEquipService.equipFrame(userId, frameId);
		return res.status(200).json({ success: true });
	} catch (error: any) {
		return res.status(400).json({ error: error.message || 'Failed to equip frame' });
	}
});

export default router;
