import { Router } from 'express';
import { z } from 'zod';
import { WhaleWatchService } from './whale-watch.service';
import { isAuthenticated } from '../auth/middleware/auth.middleware';
import { logger } from '@server-core/logger';

const router = Router();

// Validation schemas
const followUserSchema = z.object({
	userIdToFollow: z.string().uuid()
});

const unfollowUserSchema = z.object({
	userIdToUnfollow: z.string().uuid()
});

const paginationSchema = z.object({
	page: z.string().optional().default('1').transform(Number),
	limit: z.string().optional().default('20').transform(Number)
});

const searchSchema = z.object({
	q: z.string().min(1).max(50),
	limit: z.string().optional().default('10').transform(Number)
});

/**
 * POST /api/follow
 * Follow a user (add to Whale Watch)
 */
router.post('/follow', isAuthenticated, async (req, res) => {
	try {
		const { userIdToFollow } = followUserSchema.parse(req.body);
		const followerId = req.user!.id;

		await WhaleWatchService.followUser(followerId, userIdToFollow);

		// Get the followed user's username for the response
		const followCounts = await WhaleWatchService.getFollowCounts(userIdToFollow);

		logger.info('WhaleWatch', 'User followed successfully', {
			followerId,
			followeeId: userIdToFollow
		});

		res.status(201).json({
			success: true,
			message: 'User added to Whale Watch',
			followCounts
		});
	} catch (error) {
		logger.error('WhaleWatch', 'Error following user', { error });
		if (error instanceof Error) {
			res.status(400).json({ error: error.message });
		} else {
			res.status(500).json({ error: 'Failed to follow user' });
		}
	}
});

/**
 * DELETE /api/unfollow
 * Unfollow a user (remove from Whale Watch)
 */
router.delete('/unfollow', isAuthenticated, async (req, res) => {
	try {
		const { userIdToUnfollow } = unfollowUserSchema.parse(req.body);
		const followerId = req.user!.id;

		await WhaleWatchService.unfollowUser(followerId, userIdToUnfollow);

		const followCounts = await WhaleWatchService.getFollowCounts(userIdToUnfollow);

		logger.info('WhaleWatch', 'User unfollowed successfully', {
			followerId,
			followeeId: userIdToUnfollow
		});

		res.json({
			success: true,
			message: 'User removed from Whale Watch',
			followCounts
		});
	} catch (error) {
		logger.error('WhaleWatch', 'Error unfollowing user', { error });
		if (error instanceof Error) {
			res.status(400).json({ error: error.message });
		} else {
			res.status(500).json({ error: 'Failed to unfollow user' });
		}
	}
});

/**
 * GET /api/users/:id/following
 * Get list of users this user is following (their Whale Watch list)
 */
router.get('/users/:id/following', async (req, res) => {
	try {
		const userId = req.params.id;
		const { page, limit } = paginationSchema.parse(req.query);

		const following = await WhaleWatchService.getUserFollowing(userId, page, limit);

		res.json({
			following,
			pagination: {
				page,
				limit,
				hasMore: following.length === limit
			}
		});
	} catch (error) {
		logger.error('WhaleWatch', 'Error fetching following list', { error });
		res.status(500).json({ error: 'Failed to fetch following list' });
	}
});

/**
 * GET /api/users/:id/followers
 * Get list of users following this user
 */
router.get('/users/:id/followers', async (req, res) => {
	try {
		const userId = req.params.id;
		const { page, limit } = paginationSchema.parse(req.query);

		const followers = await WhaleWatchService.getUserFollowers(userId, page, limit);

		res.json({
			followers,
			pagination: {
				page,
				limit,
				hasMore: followers.length === limit
			}
		});
	} catch (error) {
		logger.error('WhaleWatch', 'Error fetching followers list', { error });
		res.status(500).json({ error: 'Failed to fetch followers list' });
	}
});

/**
 * GET /api/users/:id/follow-counts
 * Get follow counts for a user
 */
router.get('/users/:id/follow-counts', async (req, res) => {
	try {
		const userId = req.params.id;
		const counts = await WhaleWatchService.getFollowCounts(userId);

		res.json(counts);
	} catch (error) {
		logger.error('WhaleWatch', 'Error fetching follow counts', { error });
		res.status(500).json({ error: 'Failed to fetch follow counts' });
	}
});

/**
 * GET /api/follow-status/:userId
 * Check if current user is following the specified user
 */
router.get('/follow-status/:userId', isAuthenticated, async (req, res) => {
	try {
		const targetUserId = req.params.userId;
		const currentUserId = req.user!.id;

		const isFollowing = await WhaleWatchService.isFollowing(currentUserId, targetUserId);

		res.json({ isFollowing });
	} catch (error) {
		logger.error('WhaleWatch', 'Error checking follow status', { error });
		res.status(500).json({ error: 'Failed to check follow status' });
	}
});

/**
 * GET /api/whales
 * Get whale candidates (users with high follower counts)
 */
router.get('/whales', async (req, res) => {
	try {
		const { limit } = paginationSchema.parse(req.query);
		const whales = await WhaleWatchService.getWhales(limit);

		res.json({ whales });
	} catch (error) {
		logger.error('WhaleWatch', 'Error fetching whales', { error });
		res.status(500).json({ error: 'Failed to fetch whales' });
	}
});

/**
 * GET /api/search-users
 * Search users to follow
 */
router.get('/search-users', isAuthenticated, async (req, res) => {
	try {
		const { q, limit } = searchSchema.parse(req.query);
		const currentUserId = req.user!.id;

		const users = await WhaleWatchService.searchUsers(q, currentUserId, limit);

		res.json({ users });
	} catch (error) {
		logger.error('WhaleWatch', 'Error searching users', { error });
		res.status(500).json({ error: 'Failed to search users' });
	}
});

/**
 * GET /api/whale-status/:userId
 * Get whale status for a user
 */
router.get('/whale-status/:userId', async (req, res) => {
	try {
		const userId = req.params.userId;
		const whaleStatus = await WhaleWatchService.getWhaleStatus(userId);

		res.json(whaleStatus);
	} catch (error) {
		logger.error('WhaleWatch', 'Error fetching whale status', { error });
		res.status(500).json({ error: 'Failed to fetch whale status' });
	}
});

export default router;