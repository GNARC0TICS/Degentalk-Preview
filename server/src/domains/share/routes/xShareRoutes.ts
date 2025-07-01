import { userService } from '@server/src/core/services/user.service';
import { Router } from 'express';
import { shareToX } from '../services/xShareService';
import { isAuthenticated } from '../../auth/auth.routes';
import type { ContentId } from '@/db/types';

const router = Router();

router.post('/post', isAuthenticated, async (req, res, next) => {
	try {
		const { text, contentType, contentId } = req.body as {
			text: string;
			contentType: 'post' | 'thread' | 'referral';
			contentId?: ContentId;
		};

		if (!text || !contentType) {
			return res.status(400).json({ message: 'Missing parameters' });
		}

		const result = await shareToX({
			userId: (userService.getUserFromRequest(req) as any).id,
			text,
			contentType,
			contentId
		});

		return res.json(result);
	} catch (err) {
		return next(err);
	}
});

router.post('/referral', isAuthenticated, async (req, res, next) => {
	try {
		const { text } = req.body as { text: string };
		if (!text) return res.status(400).json({ message: 'Missing text' });
		const result = await shareToX({
			userId: (userService.getUserFromRequest(req) as any).id,
			text,
			contentType: 'referral'
		});
		return res.json(result);
	} catch (err) {
		return next(err);
	}
});

export default router;
