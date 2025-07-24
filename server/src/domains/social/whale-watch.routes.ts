import { userService } from '@core/services/user.service';
import { Router } from 'express'
import type { Router as RouterType } from 'express';
import { z } from 'zod';
import { WhaleWatchService } from './whale-watch.service';
import { isAuthenticated } from '@api/domains/auth/middleware/auth.middleware';
import { logger } from '@core/logger';
import { UserTransformer } from '@api/domains/users/transformers/user.transformer';
import {
	toPublicList,
	sendSuccessResponse,
	sendErrorResponse,
	sendTransformedResponse,
	sendTransformedListResponse
} from '@core/utils/transformer.helpers';

const router: RouterType = Router();

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
		const followerId = userService.getUserFromRequest(req)!.id;

		await WhaleWatchService.followUser(followerId, userIdToFollow);

		// Get the followed user's username for the response
		const followCounts = await WhaleWatchService.getFollowCounts(userIdToFollow);

		logger.info('WhaleWatch', 'User followed successfully', {
			followerId,
			followeeId: userIdToFollow
		});

		res.status(201);
		sendSuccessResponse(res, { followCounts }, 'User added to Whale Watch');
	} catch (error) {
		logger.error('WhaleWatch', 'Error following user', { error });
		if (error instanceof Error) {
			sendErrorResponse(res, error.message, 400);
		} else {
			sendErrorResponse(res, 'Failed to follow user', 500);
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
		const followerId = userService.getUserFromRequest(req)!.id;

		await WhaleWatchService.unfollowUser(followerId, userIdToUnfollow);

		const followCounts = await WhaleWatchService.getFollowCounts(userIdToUnfollow);

		logger.info('WhaleWatch', 'User unfollowed successfully', {
			followerId,
			followeeId: userIdToUnfollow
		});

		sendSuccessResponse(res, { followCounts }, 'User removed from Whale Watch');
	} catch (error) {
		logger.error('WhaleWatch', 'Error unfollowing user', { error });
		if (error instanceof Error) {
			sendErrorResponse(res, error.message, 400);
		} else {
			sendErrorResponse(res, 'Failed to unfollow user', 500);
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

		sendSuccessResponse(res, {
			following: toPublicList(following, UserTransformer.toPublicUser),
			pagination: {
				page,
				limit,
				hasMore: following.length === limit
			}
		});
	} catch (error) {
		logger.error('WhaleWatch', 'Error fetching following list', { error });
		sendErrorResponse(res, 'Failed to fetch following list', 500);
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

		sendSuccessResponse(res, {
			followers: toPublicList(followers, UserTransformer.toPublicUser),
			pagination: {
				page,
				limit,
				hasMore: followers.length === limit
			}
		});
	} catch (error) {
		logger.error('WhaleWatch', 'Error fetching followers list', { error });
		sendErrorResponse(res, 'Failed to fetch followers list', 500);
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

		sendSuccessResponse(res, counts);
	} catch (error) {
		logger.error('WhaleWatch', 'Error fetching follow counts', { error });
		sendErrorResponse(res, 'Failed to fetch follow counts', 500);
	}
});

/**
 * GET /api/follow-status/:userId
 * Check if current user is following the specified user
 */
router.get('/follow-status/:userId', isAuthenticated, async (req, res) => {
	try {
		const targetUserId = req.params.userId;
		const currentUserId = userService.getUserFromRequest(req)!.id;

		const isFollowing = await WhaleWatchService.isFollowing(currentUserId, targetUserId);

		sendSuccessResponse(res, { isFollowing });
	} catch (error) {
		logger.error('WhaleWatch', 'Error checking follow status', { error });
		sendErrorResponse(res, 'Failed to check follow status', 500);
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

		sendSuccessResponse(res, { whales: toPublicList(whales, UserTransformer.toPublicUser) });
	} catch (error) {
		logger.error('WhaleWatch', 'Error fetching whales', { error });
		sendErrorResponse(res, 'Failed to fetch whales', 500);
	}
});

/**
 * GET /api/search-users
 * Search users to follow
 */
router.get('/search-users', isAuthenticated, async (req, res) => {
	try {
		const { q, limit } = searchSchema.parse(req.query);
		const currentUserId = userService.getUserFromRequest(req)!.id;

		const users = await WhaleWatchService.searchUsers(q, currentUserId, limit);

		sendSuccessResponse(res, { users: toPublicList(users, UserTransformer.toPublicUser) });
	} catch (error) {
		logger.error('WhaleWatch', 'Error searching users', { error });
		sendErrorResponse(res, 'Failed to search users', 500);
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

		sendSuccessResponse(res, whaleStatus);
	} catch (error) {
		logger.error('WhaleWatch', 'Error fetching whale status', { error });
		sendErrorResponse(res, 'Failed to fetch whale status', 500);
	}
});

export default router;
