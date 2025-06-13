/**
 * XP Path Routes
 * Handles API endpoints for the XP path specialization system
 */
import { Router } from 'express';
import type { Request, Response } from 'express';
import { PathService } from '../../../services/path-service';
// import { XpProcessor } from '@server/utils/xpProcessor';  // File doesn't exist - commenting out
import { db } from '@db';
import { sql } from 'drizzle-orm';

import { isAuthenticated, isAdminOrModerator, isAdmin } from '../auth/middleware/auth.middleware';
import { getUserId } from '../auth/services/auth.service';

// Using shared isAuthenticated middleware from middleware/auth.ts

export function registerPathRoutes(router: Router) {
	/**
	 * Get all XP paths
	 * @route GET /api/paths
	 * @access Public
	 */
	router.get('/paths', async (req: Request, res: Response) => {
		try {
			const paths = await PathService.getPaths();
			res.json(paths);
		} catch (error) {
			console.error('Error fetching paths:', error);
			res.status(500).json({ message: 'Server error' });
		}
	});

	/**
	 * Get specific XP path
	 * @route GET /api/paths/:pathId
	 * @access Public
	 */
	router.get('/paths/:pathId', async (req: Request, res: Response) => {
		try {
			const pathId = req.params.pathId;
			const path = await PathService.getPathById(pathId);

			if (!path) {
				return res.status(404).json({ message: 'Path not found' });
			}

			res.json(path);
		} catch (error) {
			console.error('Error fetching path:', error);
			res.status(500).json({ message: 'Server error' });
		}
	});

	/**
	 * Get my paths
	 * @route GET /api/paths/user/me
	 * @access Private
	 */
	router.get('/paths/user/me', isAuthenticated, async (req: Request, res: Response) => {
		try {
			const userId = getUserId(req);
			const userPaths = await PathService.getUserPaths(userId);
			res.json(userPaths);
		} catch (error) {
			console.error('Error fetching user paths:', error);
			res.status(500).json({ message: 'Server error' });
		}
	});

	/**
	 * Get my primary path
	 * @route GET /api/paths/user/me/primary
	 * @access Private
	 */
	router.get('/paths/user/me/primary', isAuthenticated, async (req: Request, res: Response) => {
		try {
			const userId = getUserId(req);
			const primaryPath = await PathService.getUserPrimaryPath(userId);

			if (!primaryPath) {
				return res.status(404).json({ message: 'No primary path set' });
			}

			res.json(primaryPath);
		} catch (error) {
			console.error('Error fetching primary path:', error);
			res.status(500).json({ message: 'Server error' });
		}
	});

	/**
	 * Set my primary path
	 * @route POST /api/paths/user/me/primary/:pathId
	 * @access Private
	 */
	router.post(
		'/paths/user/me/primary/:pathId',
		isAuthenticated,
		async (req: Request, res: Response) => {
			try {
				const userId = getUserId(req);
				const pathId = req.params.pathId;

				// Check if path exists
				const pathExists = await PathService.getPathById(pathId);

				if (!pathExists) {
					return res.status(404).json({ message: 'Path not found' });
				}

				// Set primary path
				await PathService.setUserPrimaryPath(userId, pathId);

				res.json({ success: true, message: 'Primary path updated successfully' });
			} catch (error) {
				console.error('Error setting primary path:', error);
				res.status(500).json({ message: 'Server error' });
			}
		}
	);

	/**
	 * Get path leaderboard
	 * @route GET /api/paths/:pathId/leaderboard
	 * @access Public
	 */
	router.get('/paths/:pathId/leaderboard', async (req: Request, res: Response) => {
		try {
			const pathId = req.params.pathId;
			const limit = parseInt(req.query.limit as string) || 10;
			const offset = parseInt(req.query.offset as string) || 0;

			// Check if path exists
			const pathExists = await PathService.getPathById(pathId);

			if (!pathExists) {
				return res.status(404).json({ message: 'Path not found' });
			}

			const leaderboard = await PathService.getPathLeaderboard(pathId, limit, offset);
			res.json(leaderboard);
		} catch (error) {
			console.error('Error fetching path leaderboard:', error);
			res.status(500).json({ message: 'Server error' });
		}
	});

	/**
	 * Get user's path progression
	 * @route GET /api/paths/user/:userId/:pathId
	 * @access Public
	 */
	router.get('/paths/user/:userId/:pathId', async (req: Request, res: Response) => {
		try {
			const userId = parseInt(req.params.userId);
			const pathId = req.params.pathId;

			if (isNaN(userId)) {
				return res.status(400).json({ message: 'Invalid user ID' });
			}

			// Check if user exists
			const userExists = await db.execute(sql`
        SELECT COUNT(*) FROM users WHERE user_id = ${userId}
      `);

			if (parseInt(userExists.rows[0].count) === 0) {
				return res.status(404).json({ message: 'User not found' });
			}

			// Check if path exists
			const pathExists = await PathService.getPathById(pathId);

			if (!pathExists) {
				return res.status(404).json({ message: 'Path not found' });
			}

			const userPath = await PathService.getUserPath(userId, pathId);

			if (!userPath) {
				return res.status(404).json({ message: 'User has not started this path' });
			}

			res.json(userPath);
		} catch (error) {
			console.error('Error fetching user path:', error);
			res.status(500).json({ message: 'Server error' });
		}
	});

	/**
	 * Get user's path summary
	 * @route GET /api/paths/user/:userId/summary
	 * @access Public
	 */
	router.get('/paths/user/:userId/summary', async (req: Request, res: Response) => {
		try {
			const userId = parseInt(req.params.userId);

			if (isNaN(userId)) {
				return res.status(400).json({ message: 'Invalid user ID' });
			}

			// Check if user exists
			const userExists = await db.execute(sql`
        SELECT COUNT(*) FROM users WHERE user_id = ${userId}
      `);

			if (parseInt(userExists.rows[0].count) === 0) {
				return res.status(404).json({ message: 'User not found' });
			}

			const summary = await PathService.getUserPathSummary(userId);
			res.json(summary);
		} catch (error) {
			console.error('Error fetching user path summary:', error);
			res.status(500).json({ message: 'Server error' });
		}
	});
}
