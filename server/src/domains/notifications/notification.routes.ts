// REFACTORED: Updated auth middleware imports to use canonical path
/**
 * Notifications Routes
 *
 * Defines API routes for user notifications.
 */

import express from 'express';
import { authenticate } from '../../middleware/authenticate';
import { Request, Response, Router } from 'express';
import { logger, LogLevel, LogAction } from '../../../src/core/logger';
import { getNotifications } from './notification.service';
import { isAuthenticated } from '../auth';

// Helper function to get user ID from req.user, handling both id and user_id formats
function getUserId(req: Request): number {
	// In development, if a mock user is set, prioritize its ID
	if (process.env.NODE_ENV === 'development' && (req.user as any)?.devId) {
		return (req.user as any).devId;
	}
	return (req.user as any)?.id || (req.user as any)?.user_id || 0;
}

const router = express.Router();

// Apply auth middleware to all notifications routes
router.use(isAuthenticated);

/**
 * GET /api/users/notifications
 * Get all notifications for the authenticated user
 */
router.get('/getPaginatedNotifications', async (req, res) => {
	try {
		const userId = (req.user as Express.User).id;

		// Read `page` param, default to 0
		const page = parseInt(req.query.page as string) || 0;
		const pageSize = 25;
		const offset = page * pageSize;

		// Assuming you have some function like getUserNotifications(userId, limit, offset)
		const notifications = await getNotifications(userId, pageSize, offset);

		res.json({ page, pageSize, notifications });
	} catch (error) {
		logger.error('NOTIFICATIONS', 'Error getting user preferences', error);
		res.status(500).json({
			error: 'Failed to retrieve user notifications',
			message: (error as Error).message
		});
	}
});

export default router;
