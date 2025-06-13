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
import { db } from '@db';
import { users, userSettings as userPreferencesSchema } from '@schema';
import { eq, and } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import { z } from 'zod';
import { WebSocket } from 'ws';
import { isAuthenticated, isAuthenticatedOptional } from '../auth/middleware/auth.middleware';
import { logger, LogLevel, LogAction } from '../../../src/core/logger';
import { displayPreferencesSchema } from './preferences.validators';

// Helper function to get user ID from req.user, handling both id and user_id formats
function getUserId(req: Request): number {
	// In development, if a mock user is set, prioritize its ID
	if (process.env.NODE_ENV === 'development' && (req.user as any)?.devId) {
		return (req.user as any).devId;
	}
	return (req.user as any)?.id || (req.user as any)?.user_id || 0;
}

// Define validation schema for the shoutbox position
const updateShoutboxPositionSchema = z.object({
	position: z
		.string()
		.refine((val) => ['sidebar-top', 'sidebar-bottom', 'floating', 'hidden'].includes(val), {
			message: 'Position must be one of: sidebar-top, sidebar-bottom, floating, hidden'
		})
});

const router = express.Router();

/**
 * GET /api/users/me/preferences-all
 * Get all preferences for the authenticated user
 */
router.get('/me/preferences-all', authenticate, async (req, res) => {
	try {
		const userId = req.user.id;
		const preferences = await getAllPreferences(userId);
		res.json(preferences);
	} catch (error) {
		logger.error('PREFERENCES', 'Error getting user preferences', error);
		res.status(500).json({
			error: 'Failed to retrieve user preferences',
			message: error.message
		});
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
			const userId = req.user.id;
			const ipAddress = req.ip;
			const result = await updateProfilePreferences(userId, req.body, ipAddress);
			res.json(result);
		} catch (error) {
			logger.error('PREFERENCES', 'Error updating profile preferences', error);
			res.status(500).json({
				error: 'Failed to update profile preferences',
				message: error.message
			});
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
			const userId = req.user.id;
			const ipAddress = req.ip;
			const result = await updateAccountPreferences(userId, req.body, ipAddress);
			res.json(result);
		} catch (error) {
			logger.error('PREFERENCES', 'Error updating account preferences', error);
			res.status(500).json({
				error: 'Failed to update account preferences',
				message: error.message
			});
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
			const userId = req.user.id;
			const ipAddress = req.ip;
			const result = await updateNotificationPreferences(userId, req.body, ipAddress);
			res.json(result);
		} catch (error) {
			logger.error('PREFERENCES', 'Error updating notification preferences', error);
			res.status(500).json({
				error: 'Failed to update notification preferences',
				message: error.message
			});
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
			const userId = req.user.id;
			const ipAddress = req.ip;
			const result = await updateDisplayPreferences(userId, req.body, ipAddress);
			res.json(result);
		} catch (error) {
			logger.error('PREFERENCES', 'Error updating display preferences', error);
			res.status(500).json({
				error: 'Failed to update display preferences',
				message: error.message
			});
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
			const userId = req.user.id;
			const ipAddress = req.ip;
			const result = await changePassword(userId, req.body, ipAddress);
			res.json(result);
		} catch (error) {
			logger.error('PREFERENCES', 'Error changing password', error);
			res.status(400).json({
				error: 'Failed to change password',
				message: error.message
			});
		}
	}
);

// Get user preferences
router.get('/', isAuthenticated, async (req: Request, res: Response) => {
	try {
		const userId = getUserId(req);

		// Ensure userId is valid, especially in dev mode for mock users
		if (!userId || userId === 0) {
			logger.error('PREFERENCES', 'Invalid or missing user ID in authenticated request', {
				user: req.user,
				derivedUserId: userId
			});
			// In development, default to a known mock user ID for consistency
			if (process.env.NODE_ENV === 'development') {
				logger.info(
					'PREFERENCES',
					`🔧 Defaulting to mock user ID 1 for preferences fetch (dev mode only)`
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
				return res.status(200).json(mockPreferences);
			}
			return res.status(500).json({ message: 'Failed to identify user' });
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
				return res.status(200).json(defaultPreferences);
			} catch (insertError) {
				logger.error('PREFERENCES', 'Error creating default user preferences', insertError);

				// Even in development, if insert fails, it's better to return the default preferences directly
				if (process.env.NODE_ENV === 'development') {
					logger.info(
						'PREFERENCES',
						`🔧 Returning default mock preferences for user ${userId} after insert failure (dev mode only)`
					);
					return res.status(200).json(defaultPreferences);
				}

				return res.status(500).json({ message: 'Failed to create user preferences' });
			}
		}

		return res.status(200).json(userSettingsData[0]);
	} catch (error) {
		logger.error('PREFERENCES', 'Error fetching user preferences', error);

		// For development mode, return mock preferences consistently if any error occurs
		if (process.env.NODE_ENV === 'development') {
			const userId = getUserId(req); // Re-derive userId for logging consistency
			logger.info(
				'PREFERENCES',
				`🔧 Returning mock preferences for user ${userId} on error (dev mode only)`
			);
			const mockPreferences = {
				userId,
				theme: 'auto',
				shoutboxPosition: 'sidebar-top',
				sidebarState: {},
				notificationPrefs: {},
				profileVisibility: 'public',
				language: 'en'
			};
			return res.status(200).json(mockPreferences);
		}

		return res.status(500).json({ message: 'Internal server error' });
	}
});

// Update shoutbox position
router.put(
	'/preferences/shoutbox-position',
	isAuthenticated,
	async (req: Request, res: Response) => {
		try {
			const userId = getUserId(req);
			const validation = updateShoutboxPositionSchema.safeParse(req.body);

			if (!validation.success) {
				return res.status(400).json({
					message: 'Invalid position format',
					errors: validation.error.errors
				});
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
					const username = (req.user as any).username;

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

			return res.status(200).json({
				message: 'Shoutbox position updated successfully',
				position
			});
		} catch (error) {
			logger.error('PREFERENCES', 'Error updating shoutbox position', error);
			return res.status(500).json({ message: 'Internal server error' });
		}
	}
);

export default router;
