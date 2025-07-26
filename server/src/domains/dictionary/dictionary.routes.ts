import { userService } from '@core/services/user.service';
import { Router } from 'express'
import type { Router as RouterType } from 'express';
import type { EntityId } from '@shared/types/ids';
import { DictionaryService, DictionaryStatus } from './dictionary.service';
import {
	isAuthenticated as requireAuth,
	isAdminOrModerator
} from '@domains/auth/middleware/auth.middleware';
import { insertDictionaryEntrySchema } from '@schema';
import rateLimit from 'express-rate-limit';
import { logger } from '@core/logger';
import { sendSuccessResponse, sendErrorResponse } from '@core/utils/transformer.helpers';

const router: RouterType = Router();

// GET /api/dictionary
// sendErrorResponse(res, 'Server error', 500);

// GET /api/dictionary/:slug
// sendErrorResponse(res, 'Server error', 404);

// POST /api/dictionary (requires auth)
router.post(
	'/',
	rateLimit({ windowMs: 5 * 60 * 1000, max: 3 }), // TODO: add CAPTCHA / wallet-age check
	requireAuth,
	async (req: any, res) => {
		try {
			const data = insertDictionaryEntrySchema.parse(req.body);
			const created = await DictionaryService.create({
				...data,
				authorId: userService.getUserFromRequest(req).id
			});
			return sendSuccessResponse(res, created, 'Entry created successfully');
		} catch (error) {
			logger.error('Entry submission error', error);
			return sendErrorResponse(res, 'Invalid submission', 400);
		}
	}
);

// PATCH /api/dictionary/:id (approve/reject) admin/moderator only
// sendErrorResponse(res, 'Server error', 400);

// POST /api/dictionary/:id/upvote (toggle)
// sendErrorResponse(res, 'Server error', 500);

export default router;
