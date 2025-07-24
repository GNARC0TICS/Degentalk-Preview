import { userService } from '@core/services/user.service';
import { Router } from 'express'
import type { Router as RouterType } from 'express';
import type { EntityId } from '@shared/types/ids';
import { FriendsService } from './friends.service';
import { requireAuth } from '../../../middleware/auth';
import { z } from 'zod';
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
const sendRequestSchema = z.object({
	userId: z.string().uuid(),
	message: z.string().max(500).optional()
});

const respondToRequestSchema = z.object({
	response: z.enum(['accept', 'decline', 'block'])
});

const removeFriendSchema = z.object({
	userId: z.string().uuid()
});

const updatePermissionsSchema = z.object({
	allowWhispers: z.boolean().optional(),
	allowProfileView: z.boolean().optional(),
	allowActivityView: z.boolean().optional()
});

const updatePreferencesSchema = z.object({
	allowAllFriendRequests: z.boolean().optional(),
	onlyMutualsCanRequest: z.boolean().optional(),
	requireMinLevel: z.boolean().optional(),
	minLevelRequired: z.number().min(1).optional(),
	autoAcceptFromFollowers: z.boolean().optional(),
	autoAcceptFromWhales: z.boolean().optional(),
	hideFriendsList: z.boolean().optional(),
	hideFriendCount: z.boolean().optional(),
	showOnlineStatus: z.boolean().optional(),
	notifyOnFriendRequest: z.boolean().optional(),
	notifyOnFriendAccept: z.boolean().optional(),
	emailOnFriendRequest: z.boolean().optional(),
	defaultAllowWhispers: z.boolean().optional(),
	defaultAllowProfileView: z.boolean().optional(),
	defaultAllowActivityView: z.boolean().optional()
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
 * POST /api/social/friends/request
 * Send a friend request
 */
router.post('/request', requireAuth, async (req, res) => {
	try {
		const { userId: addresseeId, message } = sendRequestSchema.parse(req.body);
		const requesterId = userService.getUserFromRequest(req)!.id;

		const request = await FriendsService.sendFriendRequest({
			requesterId,
			addresseeId,
			message
		});

		res.status(201);
		sendSuccessResponse(res, request);
	} catch (error) {
		logger.error('Error sending friend request:', error);
		if (error instanceof Error) {
			sendErrorResponse(res, error.message, 400);
		} else {
			sendErrorResponse(res, 'Failed to send friend request', 500);
		}
	}
});

/**
 * POST /api/social/friends/requests/:requestId/respond
 * Respond to a friend request
 */
router.post('/requests/:requestId/respond', requireAuth, async (req, res) => {
	try {
		const requestId = req.params.requestId as EntityId;
		const { response } = respondToRequestSchema.parse(req.body);

		const result = await FriendsService.respondToFriendRequest(requestId, response);

		sendSuccessResponse(res, result);
	} catch (error) {
		logger.error('Error responding to friend request:', error);
		if (error instanceof Error) {
			sendErrorResponse(res, error.message, 400);
		} else {
			sendErrorResponse(res, 'Failed to respond to friend request', 500);
		}
	}
});

/**
 * DELETE /api/social/friends
 * Remove a friend
 */
router.delete('/', requireAuth, async (req, res) => {
	try {
		const { userId: friendId } = removeFriendSchema.parse(req.body);
		const userId = userService.getUserFromRequest(req)!.id;

		await FriendsService.removeFriend(userId, friendId);

		sendSuccessResponse(res, null);
	} catch (error) {
		logger.error('Error removing friend:', error);
		if (error instanceof Error) {
			sendErrorResponse(res, error.message, 400);
		} else {
			sendErrorResponse(res, 'Failed to remove friend', 500);
		}
	}
});

/**
 * GET /api/social/friends
 * Get user's friends list
 */
router.get('/', requireAuth, async (req, res) => {
	try {
		const { page, limit } = getPaginationSchema.parse(req.query);
		const userId = userService.getUserFromRequest(req)!.id;

		const friends = await FriendsService.getUserFriends(userId, page, limit);

		sendSuccessResponse(res, {
			friends: toPublicList(friends, UserTransformer.toPublicUser),
			pagination: {
				page,
				limit,
				hasMore: friends.length === limit
			}
		});
	} catch (error) {
		logger.error('Error fetching friends list:', error);
		sendErrorResponse(res, 'Failed to fetch friends list', 500);
	}
});

/**
 * GET /api/social/friends/requests/incoming
 * Get incoming friend requests
 */
router.get('/requests/incoming', requireAuth, async (req, res) => {
	try {
		const userId = userService.getUserFromRequest(req)!.id;
		const requests = await FriendsService.getIncomingFriendRequests(userId);

		sendSuccessResponse(res, { requests: toPublicList(requests, UserTransformer.toPublicUser) });
	} catch (error) {
		logger.error('Error fetching incoming friend requests:', error);
		sendErrorResponse(res, 'Failed to fetch incoming requests', 500);
	}
});

/**
 * GET /api/social/friends/requests/outgoing
 * Get outgoing friend requests
 */
router.get('/requests/outgoing', requireAuth, async (req, res) => {
	try {
		const userId = userService.getUserFromRequest(req)!.id;
		const requests = await FriendsService.getOutgoingFriendRequests(userId);

		sendSuccessResponse(res, { requests: toPublicList(requests, UserTransformer.toPublicUser) });
	} catch (error) {
		logger.error('Error fetching outgoing friend requests:', error);
		sendErrorResponse(res, 'Failed to fetch outgoing requests', 500);
	}
});

/**
 * GET /api/social/friends/counts
 * Get friend counts
 */
router.get('/counts', requireAuth, async (req, res) => {
	try {
		const userId = userService.getUserFromRequest(req)!.id;
		const counts = await FriendsService.getFriendCounts(userId);

		sendSuccessResponse(res, counts);
	} catch (error) {
		logger.error('Error fetching friend counts:', error);
		sendErrorResponse(res, 'Failed to fetch friend counts', 500);
	}
});

/**
 * GET /api/social/friends/check/:userId
 * Check friendship status with another user
 */
router.get('/check/:userId', requireAuth, async (req, res) => {
	try {
		const friendId = req.params.userId;
		const userId = userService.getUserFromRequest(req)!.id;

		const areFriends = await FriendsService.areFriends(userId, friendId);

		sendSuccessResponse(res, { areFriends });
	} catch (error) {
		logger.error('Error checking friendship status:', error);
		sendErrorResponse(res, 'Failed to check friendship status', 500);
	}
});

/**
 * GET /api/social/friends/mutual/:userId
 * Get mutual friends with another user
 */
router.get('/mutual/:userId', requireAuth, async (req, res) => {
	try {
		const otherUserId = req.params.userId;
		const userId = userService.getUserFromRequest(req)!.id;

		const mutualFriends = await FriendsService.getMutualFriends(userId, otherUserId);

		sendSuccessResponse(res, {
			mutualFriends: toPublicList(mutualFriends, UserTransformer.toPublicUser)
		});
	} catch (error) {
		logger.error('Error fetching mutual friends:', error);
		sendErrorResponse(res, 'Failed to fetch mutual friends', 500);
	}
});

/**
 * GET /api/social/friends/search
 * Search users for friend requests
 */
router.get('/search', requireAuth, async (req, res) => {
	try {
		const { q, limit } = searchUsersSchema.parse(req.query);
		const currentUserId = userService.getUserFromRequest(req)!.id;

		const users = await FriendsService.searchUsersForFriends(q, currentUserId, limit);

		sendSuccessResponse(res, { users: toPublicList(users, UserTransformer.toPublicUser) });
	} catch (error) {
		logger.error('Error searching users for friends:', error);
		sendErrorResponse(res, 'Failed to search users', 500);
	}
});

/**
 * GET /api/social/friends/preferences
 * Get user's friend preferences
 */
router.get('/preferences', requireAuth, async (req, res) => {
	try {
		const userId = userService.getUserFromRequest(req)!.id;
		const preferences = await FriendsService.getUserFriendPreferences(userId);

		sendSuccessResponse(res, preferences);
	} catch (error) {
		logger.error('Error fetching friend preferences:', error);
		sendErrorResponse(res, 'Failed to fetch preferences', 500);
	}
});

/**
 * PUT /api/social/friends/preferences
 * Update user's friend preferences
 */
router.put('/preferences', requireAuth, async (req, res) => {
	try {
		const preferences = updatePreferencesSchema.parse(req.body);
		const userId = userService.getUserFromRequest(req)!.id;

		const updatedPrefs = await FriendsService.updateUserFriendPreferences(userId, preferences);

		sendSuccessResponse(res, updatedPrefs[0]);
	} catch (error) {
		logger.error('Error updating friend preferences:', error);
		sendErrorResponse(res, 'Failed to update preferences', 500);
	}
});

/**
 * PUT /api/social/friends/:userId/permissions
 * Update permissions for a specific friendship
 */
router.put('/:userId/permissions', requireAuth, async (req, res) => {
	try {
		const friendId = req.params.userId;
		const userId = userService.getUserFromRequest(req)!.id;
		const permissions = updatePermissionsSchema.parse(req.body);

		const result = await FriendsService.updateFriendshipPermissions(userId, friendId, permissions);

		sendSuccessResponse(res, result);
	} catch (error) {
		logger.error('Error updating friendship permissions:', error);
		if (error instanceof Error) {
			sendErrorResponse(res, error.message, 400);
		} else {
			sendErrorResponse(res, 'Failed to update permissions', 500);
		}
	}
});

/**
 * GET /api/social/friends/whisper-permission/:userId
 * Check if user can send whisper to another user
 */
router.get('/whisper-permission/:userId', requireAuth, async (req, res) => {
	try {
		const recipientId = req.params.userId;
		const senderId = userService.getUserFromRequest(req)!.id;

		const canSendWhisper = await FriendsService.canSendWhisper(senderId, recipientId);

		sendSuccessResponse(res, { canSendWhisper });
	} catch (error) {
		logger.error('Error checking whisper permission:', error);
		sendErrorResponse(res, 'Failed to check whisper permission', 500);
	}
});

export { router as friendsRoutes };
