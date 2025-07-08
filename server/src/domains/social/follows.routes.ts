import { userService } from '@server/src/core/services/user.service';
import { Router } from 'express';
import type { EntityId } from '@shared/types/ids';
import { FollowsService } from './follows.service';
import { requireAuth } from '../../../middleware/auth';
import { z } from 'zod';
import { logger } from "../../core/logger";
import { UserTransformer } from '@server/src/domains/users/transformers/user.transformer';
import { toPublicList } from '@server/src/core/utils/transformer.helpers';

const router = Router();

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

		res.status(201).json(result);
	} catch (error) {
		logger.error('Error following user:', error);
		if (error instanceof Error) {
			res.status(400).json({ error: error.message });
		} else {
			res.status(500).json({ error: 'Failed to follow user' });
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

		res.json({ success: true });
	} catch (error) {
		logger.error('Error unfollowing user:', error);
		if (error instanceof Error) {
			res.status(400).json({ error: error.message });
		} else {
			res.status(500).json({ error: 'Failed to unfollow user' });
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

		res.json({
			following: toPublicList(following, UserTransformer.toPublicUser),
			pagination: {
				page,
				limit,
				hasMore: following.length === limit
			}
		});
	} catch (error) {
		logger.error('Error fetching following list:', error);
		res.status(500).json({ error: 'Failed to fetch following list' });
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

		res.json({
			followers: toPublicList(followers, UserTransformer.toPublicUser),
			pagination: {
				page,
				limit,
				hasMore: followers.length === limit
			}
		});
	} catch (error) {
		logger.error('Error fetching followers list:', error);
		res.status(500).json({ error: 'Failed to fetch followers list' });
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

		res.json(counts); // counts is already a safe object
	} catch (error) {
		logger.error('Error fetching follow counts:', error);
		res.status(500).json({ error: 'Failed to fetch follow counts' });
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

		res.json({ isFollowing });
	} catch (error) {
		logger.error('Error checking follow status:', error);
		res.status(500).json({ error: 'Failed to check follow status' });
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

		res.json({ requests: toPublicList(requests, UserTransformer.toPublicUser) });
	} catch (error) {
		logger.error('Error fetching follow requests:', error);
		res.status(500).json({ error: 'Failed to fetch follow requests' });
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
			return res.status(400).json({ error: 'Invalid request ID' });
		}

		const result = await FollowsService.respondToFollowRequest(requestId, approve);

		res.json(result); // result is already a safe object
	} catch (error) {
		logger.error('Error responding to follow request:', error);
		if (error instanceof Error) {
			res.status(400).json({ error: error.message });
		} else {
			res.status(500).json({ error: 'Failed to respond to follow request' });
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

		res.json({ whales: toPublicList(whales, UserTransformer.toPublicUser) });
	} catch (error) {
		logger.error('Error fetching whale candidates:', error);
		res.status(500).json({ error: 'Failed to fetch whale candidates' });
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

		res.json(activity); // activity is already a safe object
	} catch (error) {
		logger.error('Error fetching following activity:', error);
		res.status(500).json({ error: 'Failed to fetch following activity' });
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

		res.json({ users: toPublicList(users, UserTransformer.toPublicUser) });
	} catch (error) {
		logger.error('Error searching users to follow:', error);
		res.status(500).json({ error: 'Failed to search users' });
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

		res.json(preferences); // preferences is already a safe object
	} catch (error) {
		logger.error('Error fetching follow preferences:', error);
		res.status(500).json({ error: 'Failed to fetch preferences' });
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

		res.json(updatedPrefs[0]); // updatedPrefs is already a safe object
	} catch (error) {
		logger.error('Error updating follow preferences:', error);
		res.status(500).json({ error: 'Failed to update preferences' });
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

		res.json(result); // result is already a safe object
	} catch (error) {
		logger.error('Error updating follow notification settings:', error);
		if (error instanceof Error) {
			res.status(400).json({ error: error.message });
		} else {
			res.status(500).json({ error: 'Failed to update notification settings' });
		}
	}
});

export { router as followsRoutes };
