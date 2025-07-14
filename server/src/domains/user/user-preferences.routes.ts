import { userService } from '@core/services/user.service';
import { Router } from 'express'
import type { Router as RouterType } from 'express';
import { z } from 'zod';
import { UserPreferencesService } from './user-preferences.service';
import { requireAuth } from '@server/domains/auth/middleware/auth.middleware';
import { logger } from '@core/logger';
import { sendSuccessResponse, sendErrorResponse } from '@core/utils/transformer.helpers';

const router: RouterType = Router();

// Social privacy preferences schema
const socialPreferencesSchema = z.object({
	// Mentions preferences
	allowMentions: z.boolean().optional(),
	mentionPermissions: z.enum(['everyone', 'friends', 'followers', 'none']).optional(),
	mentionNotifications: z.boolean().optional(),
	mentionEmailNotifications: z.boolean().optional(),

	// Following preferences
	allowFollowers: z.boolean().optional(),
	followerApprovalRequired: z.boolean().optional(),
	hideFollowerCount: z.boolean().optional(),
	hideFollowingCount: z.boolean().optional(),
	allowWhaleDesignation: z.boolean().optional(),

	// Friends preferences
	allowFriendRequests: z.boolean().optional(),
	friendRequestPermissions: z.enum(['everyone', 'mutuals', 'followers', 'none']).optional(),
	autoAcceptMutualFollows: z.boolean().optional(),
	hideOnlineStatus: z.boolean().optional(),
	hideFriendsList: z.boolean().optional(),

	// General privacy
	showSocialActivity: z.boolean().optional(),
	allowDirectMessages: z.enum(['friends', 'followers', 'everyone', 'none']).optional(),
	showProfileToPublic: z.boolean().optional(),
	allowSocialDiscovery: z.boolean().optional()
});

/**
 * GET /api/user/social-preferences
 * Get user's social privacy preferences
 */
router.get('/social-preferences', requireAuth, async (req, res) => {
	try {
		const userId = userService.getUserFromRequest(req)!.id;
		const preferences = await UserPreferencesService.getSocialPreferences(userId);
		sendSuccessResponse(res, preferences);
	} catch (error) {
		logger.error('Error fetching social preferences:', error);
		sendErrorResponse(res, 'Failed to fetch social preferences', 500);
	}
});

/**
 * PUT /api/user/social-preferences
 * Update user's social privacy preferences
 */
router.put('/social-preferences', requireAuth, async (req, res) => {
	try {
		const userId = userService.getUserFromRequest(req)!.id;
		const validatedData = socialPreferencesSchema.parse(req.body);

		const updatedPreferences = await UserPreferencesService.updateSocialPreferences(
			userId,
			validatedData
		);

		sendSuccessResponse(res, updatedPreferences);
	} catch (error) {
		logger.error('Error updating social preferences:', error);
		if (error instanceof z.ZodError) {
			sendErrorResponse(res, 'Invalid preferences data', 400);
		} else {
			sendErrorResponse(res, 'Failed to update social preferences', 500);
		}
	}
});

/**
 * GET /api/user/privacy-summary
 * Get a summary of user's privacy settings for quick overview
 */
router.get('/privacy-summary', requireAuth, async (req, res) => {
	try {
		const userId = userService.getUserFromRequest(req)!.id;
		const summary = await UserPreferencesService.getPrivacySummary(userId);
		sendSuccessResponse(res, summary);
	} catch (error) {
		logger.error('Error fetching privacy summary:', error);
		sendErrorResponse(res, 'Failed to fetch privacy summary', 500);
	}
});

/**
 * POST /api/user/reset-social-preferences
 * Reset social preferences to defaults
 */
router.post('/reset-social-preferences', requireAuth, async (req, res) => {
	try {
		const userId = userService.getUserFromRequest(req)!.id;
		const defaultPreferences = await UserPreferencesService.resetSocialPreferences(userId);
		sendSuccessResponse(res, defaultPreferences);
	} catch (error) {
		logger.error('Error resetting social preferences:', error);
		sendErrorResponse(res, 'Failed to reset social preferences', 500);
	}
});

export default router;
