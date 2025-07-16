import { Router, Request, Response } from 'express';
import { sendSuccessResponse } from '@server/core/utils/transformer.helpers';

const router = Router();

/**
 * Get paginated notifications (stub to prevent 401 spam)
 */
router.get('/getPaginatedNotifications', async (req: Request, res: Response) => {
	// Return empty notifications to stop the spam
	sendSuccessResponse(res, {
		notifications: [],
		pagination: {
			total: 0,
			page: 1,
			limit: 20
		}
	});
});

export default router;