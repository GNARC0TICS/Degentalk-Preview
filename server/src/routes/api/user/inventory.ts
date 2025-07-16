import { Router, Request, Response } from 'express';
import { logger } from '@server/core/logger';
import { sendSuccessResponse, sendErrorResponse } from '@server/core/utils/transformer.helpers';

const router = Router();

/**
 * Get user inventory (stub endpoint to prevent 404 spam)
 */
router.get('/:userId/inventory', async (req: Request, res: Response) => {
	try {
		const { userId } = req.params;
		
		// Return empty inventory for now to stop the 404 spam
		sendSuccessResponse(res, {
			items: [],
			totalCount: 0
		});
	} catch (error) {
		logger.error('Inventory', 'Error fetching inventory', { error });
		sendErrorResponse(res, 'Failed to fetch inventory', 500);
	}
});

export default router;