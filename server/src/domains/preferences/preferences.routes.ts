import { userService } from '@core/services/user.service';
// REFACTORED: Updated auth middleware imports to use canonical path
/**
 * Preferences Routes
 *
 * Defines API routes for user preferences management.
 */

import express from 'express';
import { authenticate } from '../../middleware/authenticate';
import { validateBody } from '../../middleware/validate';
import {
	profileSettingsSchema,
	accountSettingsSchema,
	notificationSettingsSchema,
	passwordChangeSchema
} from './preferences.validators';
import {
	getAllPreferences,
	updateProfilePreferences,
	updateAccountPreferences,
	updateNotificationPreferences,
	changePassword,
	updateDisplayPreferences
} from './preferences.service';
import { Router } from 'express';
import type { Request, Response } from 'express';
import { db } from '../../core/db';
import { users, userSettings as userPreferencesSchema } from '@schema';
import { eq, and } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import { z } from 'zod';
import { WebSocket } from 'ws';
import { isAuthenticated, isAuthenticatedOptional } from '../auth/middleware/auth.middleware';
import { logger, LogLevel, LogAction } from '../../../src/core/logger';
import { displayPreferencesSchema } from './preferences.validators';
import { getUserIdFromRequest } from '@server-utils/auth';
import { UserPreferencesService } from '../user/user-preferences.service';
import { sendSuccessResponse, sendErrorResponse } from "@core/utils/transformer.helpers";

// Define validation schema for the shoutbox position
const updateShoutboxPositionSchema = z.object({
	position: z
		.string()
		.refine((val) => ['sidebar-top', 'sidebar-bottom', 'floating', 'hidden'].includes(val), {
			message: 'Position must be one of: sidebar-top, sidebar-bottom, floating, hidden'
		})
});

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

const router = express.Router();

/**
 * GET /api/users/me/preferences-all
 * Get all preferences for the authenticated user
 */
router.get('/me/preferences-all', authenticate, async (req, res) => {
	try {
		const userId = userService.getUserFromRequest(req).id;
		const preferences = await getAllPreferences(userId);
		sendSuccessResponse(res, { preferences });
	} catch (error) {
		logger.error('PREFERENCES', 'Error getting user preferences', error);
		sendErrorResponse(res, 'Failed to retrieve user preferences', 500);
	}
});

/**
 * PUT /api/users/me/preferences/profile
 * Update profile preferences for the authenticated user
 */
router.put(
	'/me/preferences/profile',
	authenticate,
	validateBody(profileSettingsSchema),
	async (req, res) => {
		try {
			const userId = userService.getUserFromRequest(req).id;
			const ipAddress = req.ip;
			const result = await updateProfilePreferences(userId, req.body, ipAddress);
			sendSuccessResponse(res, { success: true, data: result });
		} catch (error) {
			logger.error('PREFERENCES', 'Error updating profile preferences', error);
			sendErrorResponse(res, 'Failed to update profile preferences', 500);
		}
	}
);

/**
 * PUT /api/users/me/preferences/account
 * Update account preferences for the authenticated user
 */
router.put(
	'/me/preferences/account',
	authenticate,
	validateBody(accountSettingsSchema),
	async (req, res) => {
		try {
			const userId = userService.getUserFromRequest(req).id;
			const ipAddress = req.ip;
			const result = await updateAccountPreferences(userId, req.body, ipAddress);
			sendSuccessResponse(res, { success: true, data: result });
		} catch (error) {
			logger.error('PREFERENCES', 'Error updating account preferences', error);
			sendErrorResponse(res, 'Failed to update account preferences', 500);
		}
	}
);

/**
 * PUT /api/users/me/preferences/notifications
 * Update notification preferences for the authenticated user
 */
router.put(
	'/me/preferences/notifications',
	authenticate,
	validateBody(notificationSettingsSchema),
	async (req, res) => {
		try {
			const userId = userService.getUserFromRequest(req).id;
			const ipAddress = req.ip;
			const result = await updateNotificationPreferences(userId, req.body, ipAddress);
			sendSuccessResponse(res, { success: true, data: result });
		} catch (error) {
			logger.error('PREFERENCES', 'Error updating notification preferences', error);
			sendErrorResponse(res, 'Failed to update notification preferences', 500);
		}
	}
);

/**
 * PUT /api/users/me/preferences/display
 * Update display preferences for the authenticated user
 */
router.put(
	'/me/preferences/display',
	authenticate,
	validateBody(displayPreferencesSchema),
	async (req, res) => {
		try {
			const userId = userService.getUserFromRequest(req).id;
			const ipAddress = req.ip;
			const result = await updateDisplayPreferences(userId, req.body, ipAddress);
			sendSuccessResponse(res, { success: true, data: result });
		} catch (error) {
			logger.error('PREFERENCES', 'Error updating display preferences', error);
			sendErrorResponse(res, 'Failed to update display preferences', 500);
		}
	}
);

/**
 * POST /api/users/me/security/change-password
 * Change password for the authenticated user
 */
router.post(
	'/me/security/change-password',
	authenticate,
	validateBody(passwordChangeSchema),
	async (req, res) => {
		try {
			const userId = userService.getUserFromRequest(req).id;
			const ipAddress = req.ip;
			const result = await changePassword(userId, req.body, ipAddress);
			sendSuccessResponse(res, { success: true, data: result });
		} catch (error) {
			logger.error('PREFERENCES', 'Error changing password', error);
			sendErrorResponse(res, 'Failed to change password', 400);
		}
	}
);

// Get user preferences
router.get('/', isAuthenticated, async (req: Request, res: Response) => {
	try {
		const userId = getUserIdFromRequest(req);

		// Ensure userId is valid
		if (userId === undefined) {
			logger.error('PREFERENCES', 'Invalid or missing user ID in authenticated request', {
				user: userService.getUserFromRequest(req),
				derivedUserId: userId
			});
			// In development, default to a known mock user ID for consistency
			if (process.env.NODE_ENV === 'development') {
				logger.info(
					'PREFERENCES',
					`🔧 Defaulting to mock user ID 1 for preferences fetch (dev mode only) due to undefined userId`
				);
				const mockPreferences = {
					userId: 1, // Default to mock user ID 1
					theme: 'auto',
					shoutboxPosition: 'sidebar-top',
					sidebarState: {},
					notificationPrefs: {},
					profileVisibility: 'public',
					language: 'en'
				};
				return sendSuccessResponse(res, mockPreferences);
			}
			return sendErrorResponse(res, 'Failed to identify user', 500);
		}

		// Check if user preferences exist
		const userSettingsData = await db
			.select()
			.from(userPreferencesSchema)
			.where(eq(userPreferencesSchema.userId, userId))
			.limit(1);

		if (!userSettingsData || userSettingsData.length === 0) {
			const defaultPreferences = {
				userId,
				theme: 'auto',
				shoutboxPosition: 'sidebar-top',
				sidebarState: {},
				notificationPrefs: {},
				profileVisibility: 'public',
				language: 'en'
			};

			try {
				await db.insert(userPreferencesSchema).values(defaultPreferences);
				return sendSuccessResponse(res, defaultPreferences);
			} catch (insertError) {
				logger.error('PREFERENCES', 'Error creating default user preferences', insertError);

				// Even in development, if insert fails, it's better to return the default preferences directly
				if (process.env.NODE_ENV === 'development') {
					logger.info(
						'PREFERENCES',
						`🔧 Returning default mock preferences for user ${userId} after insert failure (dev mode only)`
					);
					return sendSuccessResponse(res, defaultPreferences);
				}

				return sendErrorResponse(res, 'Failed to create user preferences', 500);
			}
		}

		return sendSuccessResponse(res, userSettingsData[0]);
	} catch (error) {
		logger.error('PREFERENCES', 'Error fetching user preferences', error);

		// For development mode, return mock preferences consistently if any error occurs
		if (process.env.NODE_ENV === 'development') {
			const userId = getUserIdFromRequest(req); // Re-derive userId for logging consistency
			logger.info(
				'PREFERENCES',
				`🔧 Returning mock preferences for user ${userId ?? 'UNKNOWN (error fallback)'} on error (dev mode only)`
			);
			const mockPreferences = {
				userId: userId ?? 1, // Default to 1 if still undefined in dev error
				theme: 'auto',
				shoutboxPosition: 'sidebar-top',
				sidebarState: {},
				notificationPrefs: {},
				profileVisibility: 'public',
				language: 'en'
			};
			return sendSuccessResponse(res, mockPreferences);
		}

		return sendErrorResponse(res, 'Internal server error', 500);
	}
});

// Update shoutbox position
router.put(
	'/preferences/shoutbox-position',
	isAuthenticated,
	async (req: Request, res: Response) => {
		try {
			const userId = getUserIdFromRequest(req);
			if (userId === undefined) {
				return sendErrorResponse(res, 'Unauthorized - User ID not found', 401);
			}
			const validation = updateShoutboxPositionSchema.safeParse(req.body);

			if (!validation.success) {
				return sendErrorResponse(res, 'Invalid position format', 400);
			}

			const { position } = validation.data;

			// Check if user preferences exist
			const userSettingsData = await db
				.select()
				.from(userPreferencesSchema)
				.where(eq(userPreferencesSchema.userId, userId))
				.limit(1);

			if (!userSettingsData || userSettingsData.length === 0) {
				// Create preferences record if it doesn't exist
				await db.insert(userPreferencesSchema).values({
					userId,
					shoutboxPosition: position
				});
			} else {
				// Update existing preferences
				await db
					.update(userPreferencesSchema)
					.set({ shoutboxPosition: position })
					.where(eq(userPreferencesSchema.userId, userId));
			}

			// Log the change in user_settings_history table
			await db.execute(sql`
      INSERT INTO user_settings_history 
      (user_id, changed_field, old_value, new_value, ip_address, user_agent)
      VALUES 
      (${userId}, 'shoutbox_position', ${userSettingsData?.[0]?.shoutboxPosition || 'sidebar-top'}, ${position}, ${req.ip || 'unknown'}, ${req.headers['user-agent'] || 'unknown'})
    `);

			// Broadcast the position change via WebSocket if the WebSocket server is available
			try {
				const wss = (req.app as any).wss;
				if (wss && wss.clients) {
					const username = (userService.getUserFromRequest(req) as any).username;

					// Create broadcast message with position update
					const broadcastMessage = JSON.stringify({
						type: 'shoutbox_position_update',
						userId,
						username,
						position,
						timestamp: new Date().toISOString()
					});

					// Broadcast to all connected clients
					wss.clients.forEach((client: any) => {
						if (client.readyState === WebSocket.OPEN) {
							client.send(broadcastMessage);
						}
					});
					logger.info('PREFERENCES', `Broadcast shoutbox position update for user ${username}`);
				}
			} catch (broadcastError) {
				logger.error('PREFERENCES', 'Error broadcasting position change', broadcastError);
				// Continue with the response even if broadcast fails
			}

			return sendSuccessResponse(res, {
				message: 'Shoutbox position updated successfully',
				position
			});
		} catch (error) {
			logger.error('PREFERENCES', 'Error updating shoutbox position', error);
			return sendErrorResponse(res, 'Internal server error', 500);
		}
	}
);

/**
 * GET /api/users/social-preferences
 * Get user's social privacy preferences
 */
router.get('/social-preferences', isAuthenticated, async (req, res) => {
	try {
		const userId = getUserIdFromRequest(req);
		if (userId === undefined) {
			return sendErrorResponse(res, 'Unauthorized - User ID not found', 401);
		}

		const preferences = await UserPreferencesService.getSocialPreferences(userId);
		sendSuccessResponse(res, { preferences });
	} catch (error) {
		logger.error('PREFERENCES', 'Error fetching social preferences', error);
		sendErrorResponse(res, 'Failed to fetch social preferences', 500);
	}
});

/**
 * PUT /api/users/social-preferences
 * Update user's social privacy preferences
 */
router.put('/social-preferences', isAuthenticated, async (req, res) => {
	try {
		const userId = getUserIdFromRequest(req);
		if (userId === undefined) {
			return sendErrorResponse(res, 'Unauthorized - User ID not found', 401);
		}

		const validation = socialPreferencesSchema.safeParse(req.body);
		if (!validation.success) {
			return sendErrorResponse(res, 'Invalid preferences data', 400);
		}

		const updatedPreferences = await UserPreferencesService.updateSocialPreferences(
			userId,
			validation.data
		);

		sendSuccessResponse(res, { preferences: updatedPreferences });
	} catch (error) {
		logger.error('PREFERENCES', 'Error updating social preferences', error);
		sendErrorResponse(res, 'Failed to update social preferences', 500);
	}
});

/**
 * GET /api/users/privacy-summary
 * Get a summary of user's privacy settings for quick overview
 */
router.get('/privacy-summary', isAuthenticated, async (req, res) => {
	try {
		const userId = getUserIdFromRequest(req);
		if (userId === undefined) {
			return sendErrorResponse(res, 'Unauthorized - User ID not found', 401);
		}

		const summary = await UserPreferencesService.getPrivacySummary(userId);
		sendSuccessResponse(res, { summary });
	} catch (error) {
		logger.error('PREFERENCES', 'Error fetching privacy summary', error);
		sendErrorResponse(res, 'Failed to fetch privacy summary', 500);
	}
});

/**
 * POST /api/users/reset-social-preferences
 * Reset social preferences to defaults
 */
router.post('/reset-social-preferences', isAuthenticated, async (req, res) => {
	try {
		const userId = getUserIdFromRequest(req);
		if (userId === undefined) {
			return sendErrorResponse(res, 'Unauthorized - User ID not found', 401);
		}

		const defaultPreferences = await UserPreferencesService.resetSocialPreferences(userId);
		sendSuccessResponse(res, { preferences: defaultPreferences });
	} catch (error) {
		logger.error('PREFERENCES', 'Error resetting social preferences', error);
		sendErrorResponse(res, 'Failed to reset social preferences', 500);
	}
});

export default router;
