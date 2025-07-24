import { Router } from 'express'
import type { Router as RouterType } from 'express';
import { uiThemesService } from '@api/domains/admin/sub-domains/ui-config/uiThemes.service';
import { logger } from '@core/logger';
import { sendSuccessResponse, sendErrorResponse } from '@core/utils/transformer.helpers';

const router: RouterType = Router();

/**
 * GET /api/ui/themes
 * Returns the zone theme configuration used by the frontend for navigation styling.
 */
router.get('/themes', async (_req, res) => {
	try {
		const themes = await uiThemesService.getAll();
		sendSuccessResponse(res, themes);
	} catch (err) {
		logger.error('Failed to fetch ui themes', err);
		sendErrorResponse(res, 'Failed to fetch themes', 500);
	}
});

export default router;
