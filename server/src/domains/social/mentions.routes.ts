import { Router } from 'express';
import { MentionsService } from './mentions.service';
import { requireAuth } from '@/middleware/auth';
import { z } from 'zod';

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
		const userId = req.user!.id;

		const mentions = await MentionsService.getUserMentions(userId, page, limit);
		const unreadCount = await MentionsService.getUnreadMentionCount(userId);

		res.json({
			mentions,
			unreadCount,
			pagination: {
				page,
				limit,
				hasMore: mentions.length === limit
			}
		});
	} catch (error) {
		console.error('Error fetching mentions:', error);
		res.status(500).json({ error: 'Failed to fetch mentions' });
	}
});

/**
 * GET /api/social/mentions/unread-count
 * Get count of unread mentions
 */
router.get('/unread-count', requireAuth, async (req, res) => {
	try {
		const userId = req.user!.id;
		const count = await MentionsService.getUnreadMentionCount(userId);

		res.json({ unreadCount: count });
	} catch (error) {
		console.error('Error fetching unread mention count:', error);
		res.status(500).json({ error: 'Failed to fetch unread count' });
	}
});

/**
 * POST /api/social/mentions/mark-read
 * Mark mentions as read
 */
router.post('/mark-read', requireAuth, async (req, res) => {
	try {
		const { mentionIds } = markAsReadSchema.parse(req.body);
		const userId = req.user!.id;

		await MentionsService.markMentionsAsRead(userId, mentionIds);

		res.json({ success: true });
	} catch (error) {
		console.error('Error marking mentions as read:', error);
		res.status(500).json({ error: 'Failed to mark mentions as read' });
	}
});

/**
 * GET /api/social/mentions/preferences
 * Get user's mention preferences
 */
router.get('/preferences', requireAuth, async (req, res) => {
	try {
		const userId = req.user!.id;
		const preferences = await MentionsService.getUserMentionPreferences(userId);

		res.json(preferences);
	} catch (error) {
		console.error('Error fetching mention preferences:', error);
		res.status(500).json({ error: 'Failed to fetch preferences' });
	}
});

/**
 * PUT /api/social/mentions/preferences
 * Update user's mention preferences
 */
router.put('/preferences', requireAuth, async (req, res) => {
	try {
		const preferences = updatePreferencesSchema.parse(req.body);
		const userId = req.user!.id;

		const updatedPrefs = await MentionsService.updateUserMentionPreferences(userId, preferences);

		res.json(updatedPrefs[0]);
	} catch (error) {
		console.error('Error updating mention preferences:', error);
		res.status(500).json({ error: 'Failed to update preferences' });
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

		res.json({ users });
	} catch (error) {
		console.error('Error searching users for mentions:', error);
		res.status(500).json({ error: 'Failed to search users' });
	}
});

export { router as mentionsRoutes };
