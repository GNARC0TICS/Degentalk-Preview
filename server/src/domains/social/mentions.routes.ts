import { userService } from '@server/src/core/services/user.service';
import { Router } from 'express';
import { MentionsService } from './mentions.service';
import { requireAuth } from '../../../middleware/auth';
import { z } from 'zod';
import { logger } from "../../core/logger";
import { UserTransformer } from '@server/src/domains/users/transformers/user.transformer';
import { 
	toPublicList,
	sendSuccessResponse,
	sendErrorResponse,
	sendTransformedResponse,
	sendTransformedListResponse
} from '@server/src/core/utils/transformer.helpers';

const router = Router();

// Validation schemas
const getUserMentionsSchema = z.object({
	page: z.string().optional().default('1').transform(Number),
	limit: z.string().optional().default('20').transform(Number)
});

const markAsReadSchema = z.object({
	mentionIds: z.array(z.number()).optional()
});

const updatePreferencesSchema = z.object({
	emailNotifications: z.boolean().optional(),
	pushNotifications: z.boolean().optional(),
	allowThreadMentions: z.boolean().optional(),
	allowPostMentions: z.boolean().optional(),
	allowShoutboxMentions: z.boolean().optional(),
	allowWhisperMentions: z.boolean().optional(),
	onlyFriendsMention: z.boolean().optional(),
	onlyFollowersMention: z.boolean().optional()
});

const searchUsersSchema = z.object({
	q: z.string().min(1).max(50),
	limit: z.string().optional().default('10').transform(Number)
});

/**
 * GET /api/social/mentions
 * Get user's mentions with pagination
 */
router.get('/', requireAuth, async (req, res) => {
	try {
		const { page, limit } = getUserMentionsSchema.parse(req.query);
		const userId = userService.getUserFromRequest(req)!.id;

		const mentions = await MentionsService.getUserMentions(userId, page, limit);
		const unreadCount = await MentionsService.getUnreadMentionCount(userId);

		sendSuccessResponse(res, {
			mentions,
			unreadCount,
			pagination: {
				page,
				limit,
				hasMore: mentions.length === limit
			}
		});
	} catch (error) {
		logger.error('Error fetching mentions:', error);
		sendErrorResponse(res, 'Failed to fetch mentions', 500);
	}
});

/**
 * GET /api/social/mentions/unread-count
 * Get count of unread mentions
 */
router.get('/unread-count', requireAuth, async (req, res) => {
	try {
		const userId = userService.getUserFromRequest(req)!.id;
		const count = await MentionsService.getUnreadMentionCount(userId);

		sendSuccessResponse(res, { unreadCount: count });
	} catch (error) {
		logger.error('Error fetching unread mention count:', error);
		sendErrorResponse(res, 'Failed to fetch unread count', 500);
	}
});

/**
 * POST /api/social/mentions/mark-read
 * Mark mentions as read
 */
router.post('/mark-read', requireAuth, async (req, res) => {
	try {
		const { mentionIds } = markAsReadSchema.parse(req.body);
		const userId = userService.getUserFromRequest(req)!.id;

		await MentionsService.markMentionsAsRead(userId, mentionIds);

		sendSuccessResponse(res, null);
	} catch (error) {
		logger.error('Error marking mentions as read:', error);
		sendErrorResponse(res, 'Failed to mark mentions as read', 500);
	}
});

/**
 * GET /api/social/mentions/preferences
 * Get user's mention preferences
 */
router.get('/preferences', requireAuth, async (req, res) => {
	try {
		const userId = userService.getUserFromRequest(req)!.id;
		const preferences = await MentionsService.getUserMentionPreferences(userId);

		sendSuccessResponse(res, preferences);
	} catch (error) {
		logger.error('Error fetching mention preferences:', error);
		sendErrorResponse(res, 'Failed to fetch preferences', 500);
	}
});

/**
 * PUT /api/social/mentions/preferences
 * Update user's mention preferences
 */
router.put('/preferences', requireAuth, async (req, res) => {
	try {
		const preferences = updatePreferencesSchema.parse(req.body);
		const userId = userService.getUserFromRequest(req)!.id;

		const updatedPrefs = await MentionsService.updateUserMentionPreferences(userId, preferences);

		sendSuccessResponse(res, updatedPrefs[0]);
	} catch (error) {
		logger.error('Error updating mention preferences:', error);
		sendErrorResponse(res, 'Failed to update preferences', 500);
	}
});

/**
 * GET /api/social/mentions/search-users
 * Search users for mention autocomplete
 */
router.get('/search-users', requireAuth, async (req, res) => {
	try {
		const { q, limit } = searchUsersSchema.parse(req.query);

		const users = await MentionsService.searchUsersForMention(q, limit);

		sendSuccessResponse(res, { users: toPublicList(users, UserTransformer.toPublicUser) });
	} catch (error) {
		logger.error('Error searching users for mentions:', error);
		sendErrorResponse(res, 'Failed to search users', 500);
	}
});

export { router as mentionsRoutes };
