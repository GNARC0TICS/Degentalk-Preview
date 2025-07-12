import { userService } from '@core/services/user.service';
/**
 * Notifications Routes
 *
 * Defines API routes for user notifications.
 */

import express from 'express';
import { authenticate } from '../../middleware/authenticate';
import { Router } from 'express';
import type { Request, Response } from 'express';
import { logger, LogLevel, LogAction } from '../../../src/core/logger';
import {
	getNotifications,
	markNotificationAsRead,
	markAllNotificationsAsRead,
	getUnreadNotificationCount
} from './notification.service';
import { isAuthenticated } from '../auth';
import { sendSuccessResponse, sendErrorResponse } from '@core/utils/transformer.helpers';

const router = express.Router();

// Apply auth middleware to all notifications routes
router.use(isAuthenticated);

/**
 * GET /api/notifications
 * Get paginated notifications for the authenticated user
 */
router.get('/getPaginatedNotifications', async (req, res) => {
	try {
		const userId = userService.getUserFromRequest(req)?.id;
		if (!userId) {
			return sendErrorResponse(res, 'Unauthorized', 401);
		}

		const page = parseInt(req.query.page as string) || 0;
		const pageSize = parseInt(req.query.pageSize as string) || 10;
		const offset = page * pageSize;

		const notifications = await getNotifications(userId, pageSize, offset);

		sendSuccessResponse(res, { page, pageSize, notifications });
	} catch (error) {
		logger.error('NOTIFICATIONS', 'Error getting notifications', error);
		sendErrorResponse(res, 'Failed to retrieve user notifications', 500);
	}
});

/**
 * GET /api/notifications/unread/count
 * Get count of unread notifications for the authenticated user
 */
router.get('/unread/count', async (req, res) => {
	try {
		const userId = userService.getUserFromRequest(req)?.id;
		if (!userId) {
			return sendErrorResponse(res, 'Unauthorized', 401);
		}

		const count = await getUnreadNotificationCount(userId);

		sendSuccessResponse(res, { count });
	} catch (error) {
		logger.error('NOTIFICATIONS', 'Error getting unread notification count', error);
		sendErrorResponse(res, 'Failed to retrieve unread notification count', 500);
	}
});

/**
 * PUT /api/notifications/:id/read
 * Mark a notification as read
 */
router.put('/:id/read', async (req, res) => {
	try {
		const userId = userService.getUserFromRequest(req)?.id;
		if (!userId) {
			return sendErrorResponse(res, 'Unauthorized', 401);
		}

		const notificationId = req.params.id;
		const success = await markNotificationAsRead(notificationId, userId);

		if (success) {
			sendSuccessResponse(res, { success: true });
		} else {
			sendErrorResponse(res, 'Notification not found or not owned by user', 404);
		}
	} catch (error) {
		logger.error('NOTIFICATIONS', 'Error marking notification as read', error);
		sendErrorResponse(res, 'Failed to mark notification as read', 500);
	}
});

/**
 * PUT /api/notifications/read-all
 * Mark all notifications as read for the authenticated user
 */
router.put('/read-all', async (req, res) => {
	try {
		const userId = userService.getUserFromRequest(req)?.id;
		if (!userId) {
			return sendErrorResponse(res, 'Unauthorized', 401);
		}

		const count = await markAllNotificationsAsRead(userId);

		sendSuccessResponse(res, { success: true, count });
	} catch (error) {
		logger.error('NOTIFICATIONS', 'Error marking all notifications as read', error);
		sendErrorResponse(res, 'Failed to mark all notifications as read', 500);
	}
});

export default router;
