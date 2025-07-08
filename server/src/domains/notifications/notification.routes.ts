import { userService } from '@server/src/core/services/user.service';
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
import { sendSuccessResponse, sendErrorResponse } from "@server/src/core/utils/transformer.helpers";

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
			return res.status(401).json({ error: 'Unauthorized' });
		}

		const page = parseInt(req.query.page as string) || 0;
		const pageSize = parseInt(req.query.pageSize as string) || 10;
		const offset = page * pageSize;

		const notifications = await getNotifications(userId, pageSize, offset);

		sendSuccessResponse(res, { page, pageSize, notifications });
	} catch (error) {
		logger.error('NOTIFICATIONS', 'Error getting notifications', error);
		res.status(500).json({
			error: 'Failed to retrieve user notifications'
		});
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
			return res.status(401).json({ error: 'Unauthorized' });
		}

		const count = await getUnreadNotificationCount(userId);

		sendSuccessResponse(res, { count });
	} catch (error) {
		logger.error('NOTIFICATIONS', 'Error getting unread notification count', error);
		res.status(500).json({
			error: 'Failed to retrieve unread notification count'
		});
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
			return res.status(401).json({ error: 'Unauthorized' });
		}

		const notificationId = req.params.id;
		const success = await markNotificationAsRead(notificationId, userId);

		if (success) {
			sendSuccessResponse(res, { success: true });
		} else {
			res.status(404).json({ error: 'Notification not found or not owned by user' });
		}
	} catch (error) {
		logger.error('NOTIFICATIONS', 'Error marking notification as read', error);
		res.status(500).json({
			error: 'Failed to mark notification as read'
		});
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
			return res.status(401).json({ error: 'Unauthorized' });
		}

		const count = await markAllNotificationsAsRead(userId);

		sendSuccessResponse(res, { success: true, count });
	} catch (error) {
		logger.error('NOTIFICATIONS', 'Error marking all notifications as read', error);
		res.status(500).json({
			error: 'Failed to mark all notifications as read'
		});
	}
});

export default router;
