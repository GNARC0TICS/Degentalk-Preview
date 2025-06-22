import { Router } from 'express';
import { FriendsService } from './friends.service';
import { requireAuth } from '@/middleware/auth';
import { z } from 'zod';

const router = Router();

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
		const requesterId = req.user!.id;

		const request = await FriendsService.sendFriendRequest({
			requesterId,
			addresseeId,
			message
		});

		res.status(201).json(request);
	} catch (error) {
		console.error('Error sending friend request:', error);
		if (error instanceof Error) {
			res.status(400).json({ error: error.message });
		} else {
			res.status(500).json({ error: 'Failed to send friend request' });
		}
	}
});

/**
 * POST /api/social/friends/requests/:requestId/respond
 * Respond to a friend request
 */
router.post('/requests/:requestId/respond', requireAuth, async (req, res) => {
	try {
		const requestId = parseInt(req.params.requestId);
		const { response } = respondToRequestSchema.parse(req.body);

		if (isNaN(requestId)) {
			return res.status(400).json({ error: 'Invalid request ID' });
		}

		const result = await FriendsService.respondToFriendRequest(requestId, response);

		res.json(result);
	} catch (error) {
		console.error('Error responding to friend request:', error);
		if (error instanceof Error) {
			res.status(400).json({ error: error.message });
		} else {
			res.status(500).json({ error: 'Failed to respond to friend request' });
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
		const userId = req.user!.id;

		await FriendsService.removeFriend(userId, friendId);

		res.json({ success: true });
	} catch (error) {
		console.error('Error removing friend:', error);
		if (error instanceof Error) {
			res.status(400).json({ error: error.message });
		} else {
			res.status(500).json({ error: 'Failed to remove friend' });
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
		const userId = req.user!.id;

		const friends = await FriendsService.getUserFriends(userId, page, limit);

		res.json({
			friends,
			pagination: {
				page,
				limit,
				hasMore: friends.length === limit
			}
		});
	} catch (error) {
		console.error('Error fetching friends list:', error);
		res.status(500).json({ error: 'Failed to fetch friends list' });
	}
});

/**
 * GET /api/social/friends/requests/incoming
 * Get incoming friend requests
 */
router.get('/requests/incoming', requireAuth, async (req, res) => {
	try {
		const userId = req.user!.id;
		const requests = await FriendsService.getIncomingFriendRequests(userId);

		res.json({ requests });
	} catch (error) {
		console.error('Error fetching incoming friend requests:', error);
		res.status(500).json({ error: 'Failed to fetch incoming requests' });
	}
});

/**
 * GET /api/social/friends/requests/outgoing
 * Get outgoing friend requests
 */
router.get('/requests/outgoing', requireAuth, async (req, res) => {
	try {
		const userId = req.user!.id;
		const requests = await FriendsService.getOutgoingFriendRequests(userId);

		res.json({ requests });
	} catch (error) {
		console.error('Error fetching outgoing friend requests:', error);
		res.status(500).json({ error: 'Failed to fetch outgoing requests' });
	}
});

/**
 * GET /api/social/friends/counts
 * Get friend counts
 */
router.get('/counts', requireAuth, async (req, res) => {
	try {
		const userId = req.user!.id;
		const counts = await FriendsService.getFriendCounts(userId);

		res.json(counts);
	} catch (error) {
		console.error('Error fetching friend counts:', error);
		res.status(500).json({ error: 'Failed to fetch friend counts' });
	}
});

/**
 * GET /api/social/friends/check/:userId
 * Check friendship status with another user
 */
router.get('/check/:userId', requireAuth, async (req, res) => {
	try {
		const friendId = req.params.userId;
		const userId = req.user!.id;

		const areFriends = await FriendsService.areFriends(userId, friendId);

		res.json({ areFriends });
	} catch (error) {
		console.error('Error checking friendship status:', error);
		res.status(500).json({ error: 'Failed to check friendship status' });
	}
});

/**
 * GET /api/social/friends/mutual/:userId
 * Get mutual friends with another user
 */
router.get('/mutual/:userId', requireAuth, async (req, res) => {
	try {
		const otherUserId = req.params.userId;
		const userId = req.user!.id;

		const mutualFriends = await FriendsService.getMutualFriends(userId, otherUserId);

		res.json({ mutualFriends });
	} catch (error) {
		console.error('Error fetching mutual friends:', error);
		res.status(500).json({ error: 'Failed to fetch mutual friends' });
	}
});

/**
 * GET /api/social/friends/search
 * Search users for friend requests
 */
router.get('/search', requireAuth, async (req, res) => {
	try {
		const { q, limit } = searchUsersSchema.parse(req.query);
		const currentUserId = req.user!.id;

		const users = await FriendsService.searchUsersForFriends(q, currentUserId, limit);

		res.json({ users });
	} catch (error) {
		console.error('Error searching users for friends:', error);
		res.status(500).json({ error: 'Failed to search users' });
	}
});

/**
 * GET /api/social/friends/preferences
 * Get user's friend preferences
 */
router.get('/preferences', requireAuth, async (req, res) => {
	try {
		const userId = req.user!.id;
		const preferences = await FriendsService.getUserFriendPreferences(userId);

		res.json(preferences);
	} catch (error) {
		console.error('Error fetching friend preferences:', error);
		res.status(500).json({ error: 'Failed to fetch preferences' });
	}
});

/**
 * PUT /api/social/friends/preferences
 * Update user's friend preferences
 */
router.put('/preferences', requireAuth, async (req, res) => {
	try {
		const preferences = updatePreferencesSchema.parse(req.body);
		const userId = req.user!.id;

		const updatedPrefs = await FriendsService.updateUserFriendPreferences(userId, preferences);

		res.json(updatedPrefs[0]);
	} catch (error) {
		console.error('Error updating friend preferences:', error);
		res.status(500).json({ error: 'Failed to update preferences' });
	}
});

/**
 * PUT /api/social/friends/:userId/permissions
 * Update permissions for a specific friendship
 */
router.put('/:userId/permissions', requireAuth, async (req, res) => {
	try {
		const friendId = req.params.userId;
		const userId = req.user!.id;
		const permissions = updatePermissionsSchema.parse(req.body);

		const result = await FriendsService.updateFriendshipPermissions(userId, friendId, permissions);

		res.json(result);
	} catch (error) {
		console.error('Error updating friendship permissions:', error);
		if (error instanceof Error) {
			res.status(400).json({ error: error.message });
		} else {
			res.status(500).json({ error: 'Failed to update permissions' });
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
		const senderId = req.user!.id;

		const canSendWhisper = await FriendsService.canSendWhisper(senderId, recipientId);

		res.json({ canSendWhisper });
	} catch (error) {
		console.error('Error checking whisper permission:', error);
		res.status(500).json({ error: 'Failed to check whisper permission' });
	}
});

export { router as friendsRoutes };
