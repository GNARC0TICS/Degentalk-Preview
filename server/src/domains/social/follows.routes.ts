import { userService } from '@core/services/user.service';
import { Router } from 'express'
import type { Router as RouterType } from 'express';
import type { EntityId } from '@shared/types/ids';
import { FollowsService } from './follows.service';
import { requireAuth } from '../../../middleware/auth';
import { z } from 'zod';
import { logger } from '@core/logger';
import { UserTransformer } from '@server/domains/users/transformers/user.transformer';
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
	userId: z.string().uuid(),
	notificationSettings: z
		.object({
			notifyOnPosts: z.boolean().optional(),
			notifyOnThreads: z.boolean().optional(),
			notifyOnTrades: z.boolean().optional(),
			notifyOnLargeStakes: z.boolean().optional(),
			minStakeNotification: z.number().optional()
		})
		.optional()
});

const unfollowUserSchema = z.object({
	userId: z.string().uuid()
});

const respondToRequestSchema = z.object({
	approve: z.boolean()
});

const updateNotificationSettingsSchema = z.object({
	notifyOnPosts: z.boolean().optional(),
	notifyOnThreads: z.boolean().optional(),
	notifyOnTrades: z.boolean().optional(),
	notifyOnLargeStakes: z.boolean().optional(),
	minStakeNotification: z.number().min(0).optional()
});

const updatePreferencesSchema = z.object({
	allowAllFollows: z.boolean().optional(),
	onlyFriendsCanFollow: z.boolean().optional(),
	requireFollowApproval: z.boolean().optional(),
	hideFollowerCount: z.boolean().optional(),
	hideFollowingCount: z.boolean().optional(),
	hideFollowersList: z.boolean().optional(),
	hideFollowingList: z.boolean().optional(),
	notifyOnNewFollower: z.boolean().optional(),
	emailOnNewFollower: z.boolean().optional()
});

const getPaginationSchema = z.object({
	page: z.string().optional().default('1').transform(Number),
	limit: z.string().optional().default('20').transform(Number)
});

const searchUsersSchema = z.object({
	q: z.string().min(1).max(50),
	limit: z.string().optional().default('10').transform(Number)
});

/**
 * POST /api/social/follows
 * Follow a user
 */
router.post('/', requireAuth, async (req, res) => {
	try {
		const { userId: followedId, notificationSettings } = followUserSchema.parse(req.body);
		const followerId = userService.getUserFromRequest(req)!.id;

		const result = await FollowsService.followUser({
			followerId,
			followedId,
			notificationSettings
		});

		res.status(201);
		sendSuccessResponse(res, result);
	} catch (error) {
		logger.error('Error following user:', error);
		if (error instanceof Error) {
			sendErrorResponse(res, error.message, 400);
		} else {
			sendErrorResponse(res, 'Failed to follow user', 500);
		}
	}
});

/**
 * DELETE /api/social/follows
 * Unfollow a user
 */
router.delete('/', requireAuth, async (req, res) => {
	try {
		const { userId: followedId } = unfollowUserSchema.parse(req.body);
		const followerId = userService.getUserFromRequest(req)!.id;

		await FollowsService.unfollowUser(followerId, followedId);

		sendSuccessResponse(res, null);
	} catch (error) {
		logger.error('Error unfollowing user:', error);
		if (error instanceof Error) {
			sendErrorResponse(res, error.message, 400);
		} else {
			sendErrorResponse(res, 'Failed to unfollow user', 500);
		}
	}
});

/**
 * GET /api/social/follows/following
 * Get user's following list
 */
router.get('/following', requireAuth, async (req, res) => {
	try {
		const { page, limit } = getPaginationSchema.parse(req.query);
		const userId = userService.getUserFromRequest(req)!.id;

		const following = await FollowsService.getUserFollowing(userId, page, limit);

		sendSuccessResponse(res, {
			following: toPublicList(following, UserTransformer.toPublicUser),
			pagination: {
				page,
				limit,
				hasMore: following.length === limit
			}
		});
	} catch (error) {
		logger.error('Error fetching following list:', error);
		sendErrorResponse(res, 'Failed to fetch following list', 500);
	}
});

/**
 * GET /api/social/follows/followers
 * Get user's followers list
 */
router.get('/followers', requireAuth, async (req, res) => {
	try {
		const { page, limit } = getPaginationSchema.parse(req.query);
		const userId = userService.getUserFromRequest(req)!.id;

		const followers = await FollowsService.getUserFollowers(userId, page, limit);

		sendSuccessResponse(res, {
			followers: toPublicList(followers, UserTransformer.toPublicUser),
			pagination: {
				page,
				limit,
				hasMore: followers.length === limit
			}
		});
	} catch (error) {
		logger.error('Error fetching followers list:', error);
		sendErrorResponse(res, 'Failed to fetch followers list', 500);
	}
});

/**
 * GET /api/social/follows/counts
 * Get user's follow counts
 */
router.get('/counts', requireAuth, async (req, res) => {
	try {
		const userId = userService.getUserFromRequest(req)!.id;
		const counts = await FollowsService.getUserFollowCounts(userId);

		sendSuccessResponse(res, counts);
	} catch (error) {
		logger.error('Error fetching follow counts:', error);
		sendErrorResponse(res, 'Failed to fetch follow counts', 500);
	}
});

/**
 * GET /api/social/follows/check/:userId
 * Check if current user is following another user
 */
router.get('/check/:userId', requireAuth, async (req, res) => {
	try {
		const followedId = req.params.userId;
		const followerId = userService.getUserFromRequest(req)!.id;

		const isFollowing = await FollowsService.isFollowing(followerId, followedId);

		sendSuccessResponse(res, { isFollowing });
	} catch (error) {
		logger.error('Error checking follow status:', error);
		sendErrorResponse(res, 'Failed to check follow status', 500);
	}
});

/**
 * GET /api/social/follows/requests
 * Get follow requests for current user
 */
router.get('/requests', requireAuth, async (req, res) => {
	try {
		const userId = userService.getUserFromRequest(req)!.id;
		const requests = await FollowsService.getFollowRequests(userId);

		sendSuccessResponse(res, { requests: toPublicList(requests, UserTransformer.toPublicUser) });
	} catch (error) {
		logger.error('Error fetching follow requests:', error);
		sendErrorResponse(res, 'Failed to fetch follow requests', 500);
	}
});

/**
 * POST /api/social/follows/requests/:requestId/respond
 * Respond to a follow request
 */
router.post('/requests/:requestId/respond', requireAuth, async (req, res) => {
	try {
		const requestId = req.params.requestId as EntityId;
		const { approve } = respondToRequestSchema.parse(req.body);

		if (!requestId) {
			return sendErrorResponse(res, 'Invalid request ID', 400);
		}

		const result = await FollowsService.respondToFollowRequest(requestId, approve);

		sendSuccessResponse(res, result);
	} catch (error) {
		logger.error('Error responding to follow request:', error);
		if (error instanceof Error) {
			sendErrorResponse(res, error.message, 400);
		} else {
			sendErrorResponse(res, 'Failed to respond to follow request', 500);
		}
	}
});

/**
 * GET /api/social/follows/whales
 * Get whale candidates for following
 */
router.get('/whales', requireAuth, async (req, res) => {
	try {
		const { limit } = z
			.object({
				limit: z.string().optional().default('20').transform(Number)
			})
			.parse(req.query);

		const whales = await FollowsService.getWhaleCandidates(limit);

		sendSuccessResponse(res, { whales: toPublicList(whales, UserTransformer.toPublicUser) });
	} catch (error) {
		logger.error('Error fetching whale candidates:', error);
		sendErrorResponse(res, 'Failed to fetch whale candidates', 500);
	}
});

/**
 * GET /api/social/follows/activity
 * Get activity feed from followed users
 */
router.get('/activity', requireAuth, async (req, res) => {
	try {
		const { page, limit } = getPaginationSchema.parse(req.query);
		const userId = userService.getUserFromRequest(req)!.id;

		const activity = await FollowsService.getFollowingActivity(userId, page, limit);

		sendSuccessResponse(res, activity);
	} catch (error) {
		logger.error('Error fetching following activity:', error);
		sendErrorResponse(res, 'Failed to fetch following activity', 500);
	}
});

/**
 * GET /api/social/follows/search
 * Search users to follow
 */
router.get('/search', requireAuth, async (req, res) => {
	try {
		const { q, limit } = searchUsersSchema.parse(req.query);
		const currentUserId = userService.getUserFromRequest(req)!.id;

		const users = await FollowsService.searchUsersToFollow(q, currentUserId, limit);

		sendSuccessResponse(res, { users: toPublicList(users, UserTransformer.toPublicUser) });
	} catch (error) {
		logger.error('Error searching users to follow:', error);
		sendErrorResponse(res, 'Failed to search users', 500);
	}
});

/**
 * GET /api/social/follows/preferences
 * Get user's follow preferences
 */
router.get('/preferences', requireAuth, async (req, res) => {
	try {
		const userId = userService.getUserFromRequest(req)!.id;
		const preferences = await FollowsService.getUserFollowPreferences(userId);

		sendSuccessResponse(res, preferences);
	} catch (error) {
		logger.error('Error fetching follow preferences:', error);
		sendErrorResponse(res, 'Failed to fetch preferences', 500);
	}
});

/**
 * PUT /api/social/follows/preferences
 * Update user's follow preferences
 */
router.put('/preferences', requireAuth, async (req, res) => {
	try {
		const preferences = updatePreferencesSchema.parse(req.body);
		const userId = userService.getUserFromRequest(req)!.id;

		const updatedPrefs = await FollowsService.updateUserFollowPreferences(userId, preferences);

		sendSuccessResponse(res, updatedPrefs[0]);
	} catch (error) {
		logger.error('Error updating follow preferences:', error);
		sendErrorResponse(res, 'Failed to update preferences', 500);
	}
});

/**
 * PUT /api/social/follows/:userId/notifications
 * Update notification settings for a specific follow
 */
router.put('/:userId/notifications', requireAuth, async (req, res) => {
	try {
		const followedId = req.params.userId;
		const followerId = userService.getUserFromRequest(req)!.id;
		const settings = updateNotificationSettingsSchema.parse(req.body);

		const result = await FollowsService.updateFollowNotificationSettings(
			followerId,
			followedId,
			settings
		);

		sendSuccessResponse(res, result);
	} catch (error) {
		logger.error('Error updating follow notification settings:', error);
		if (error instanceof Error) {
			sendErrorResponse(res, error.message, 400);
		} else {
			sendErrorResponse(res, 'Failed to update notification settings', 500);
		}
	}
});

export { router as followsRoutes };
