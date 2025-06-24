import { Router } from 'express';
import { isAuthenticated } from '../../../domains/auth/middleware/auth.middleware';
import { frameEquipService } from '../../../domains/cosmetics/frameEquip.service';

const router = Router();

// POST /api/users/me/frames/:id/equip
router.post('/:id/equip', isAuthenticated, async (req, res) => {
	if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
	const userId = (req.user as any).id as string;
	const frameId = parseInt(req.params.id, 10);
	if (isNaN(frameId)) return res.status(400).json({ error: 'Invalid frame id' });

	try {
		await frameEquipService.equipFrame(userId, frameId);
		return res.status(200).json({ success: true });
	} catch (error: any) {
		return res.status(400).json({ error: error.message || 'Failed to equip frame' });
	}
});

export default router;
