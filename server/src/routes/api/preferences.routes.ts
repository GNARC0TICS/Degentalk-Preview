import { Router } from 'express';
import type { Router as RouterType } from 'express';
import { luciaAuth } from '@middleware/lucia-auth.middleware';
import { sendSuccessResponse, sendErrorResponse } from '@core/utils/transformer.helpers';
import { logger } from '@core/logger';

const router: RouterType = Router();

/**
 * GET /api/preferences
 * Returns user preferences for the authenticated user
 * This is a stub endpoint to prevent 401 errors in the client
 */
router.get('/', luciaAuth.require, async (req, res) => {
	try {
		// TODO: Implement actual preferences service
		// For now, return default preferences
		const defaultPreferences = {
			shoutbox: {
				enabled: true,
				notifications: true,
				soundEnabled: false
			},
			theme: {
				mode: 'dark',
				accent: 'emerald'
			},
			notifications: {
				threads: true,
				mentions: true,
				reactions: true
			}
		};

		sendSuccessResponse(res, defaultPreferences);
	} catch (err) {
		logger.error('Failed to fetch user preferences', err);
		sendErrorResponse(res, 'Failed to fetch preferences', 500);
	}
});

/**
 * PUT /api/preferences
 * Updates user preferences
 */
router.put('/', luciaAuth.require, async (req, res) => {
	try {
		// TODO: Implement actual preferences update
		// For now, just return success
		sendSuccessResponse(res, { message: 'Preferences updated' });
	} catch (err) {
		logger.error('Failed to update user preferences', err);
		sendErrorResponse(res, 'Failed to update preferences', 500);
	}
});

export default router;