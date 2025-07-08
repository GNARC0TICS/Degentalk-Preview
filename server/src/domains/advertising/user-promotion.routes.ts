import { userService } from '@server/src/core/services/user.service';
import { Router } from 'express';
import { z } from 'zod';
import { userPromotionService } from './user-promotion.service';
import { isAuthenticated, isAdmin } from '../auth/middleware/auth.middleware';
import { logger } from "../../core/logger";
import { sendSuccessResponse, sendErrorResponse } from "@server/src/core/utils/transformer.helpers";

const router = Router();

// Validation schemas
const createUserPromotionSchema = z.object({
	type: z.enum([
		'thread_boost',
		'announcement_bar',
		'pinned_shoutbox',
		'profile_spotlight',
		'achievement_highlight'
	]),
	contentId: z.string().uuid().optional(),
	title: z.string().min(1).max(255),
	description: z.string().max(1000).optional(),
	imageUrl: z.string().url().optional(),
	linkUrl: z.string().url().optional(),
	targetPlacement: z.string().max(100).optional(),
	duration: z.enum(['1h', '6h', '12h', '1d', '3d', '1w']),
	startTime: z.string().datetime().optional(),
	autoRenew: z.boolean().optional(),
	maxDailySpend: z.number().positive().optional(),
	targetAudience: z.object({}).passthrough().optional()
});

const extendPromotionSchema = z.object({
	additionalHours: z.number().positive().max(168) // Max 1 week extension
});

const moderationActionSchema = z.object({
	action: z.enum(['approve', 'reject']),
	notes: z.string().max(500).optional(),
	rejectionReason: z.string().max(500).optional()
});

// ============================================================================
// USER PROMOTION MANAGEMENT ROUTES
// ============================================================================

/**
 * Create new user promotion
 * POST /api/ads/user-promotions
 */
router.post('/user-promotions', isAuthenticated, async (req, res) => {
	try {
		const userId = userService.getUserFromRequest(req)?.id;
		if (!userId) {
			return res.status(401).json({ error: 'User not authenticated' });
		}

		const promotionData = createUserPromotionSchema.parse(req.body);

		const result = await userPromotionService.createPromotion(userId, {
			...promotionData,
			startTime: promotionData.startTime ? new Date(promotionData.startTime) : undefined
		});

		res.status(201).json(result);
	} catch (error) {
		logger.error('Create user promotion error:', error);
		res.status(400).json({
			error: 'Failed to create promotion',
			message: error instanceof Error ? error.message : 'Unknown error'
		});
	}
});

/**
 * Get user's promotions
 * GET /api/ads/user-promotions
 */
router.get('/user-promotions', isAuthenticated, async (req, res) => {
	try {
		const userId = userService.getUserFromRequest(req)?.id;
		if (!userId) {
			return res.status(401).json({ error: 'User not authenticated' });
		}

		const filters = {
			status: req.query.status as string,
			type: req.query.type as string,
			limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
			offset: req.query.offset ? parseInt(req.query.offset as string) : 0
		};

		const result = await userPromotionService.getUserPromotions(userId, filters);
		sendSuccessResponse(res, result);
	} catch (error) {
		logger.error('Get user promotions error:', error);
		res.status(500).json({
			error: 'Failed to get promotions',
			message: error instanceof Error ? error.message : 'Unknown error'
		});
	}
});

/**
 * Get promotion cost calculation
 * POST /api/ads/user-promotions/calculate-cost
 */
router.post('/user-promotions/calculate-cost', isAuthenticated, async (req, res) => {
	try {
		const { type, duration, startTime } = req.body;

		if (!type || !duration) {
			return res.status(400).json({ error: 'Type and duration are required' });
		}

		const targetTime = startTime ? new Date(startTime) : new Date();
		const costCalculation = await userPromotionService.calculatePromotionCost(
			type,
			duration,
			targetTime
		);

		sendSuccessResponse(res, costCalculation);
	} catch (error) {
		logger.error('Calculate cost error:', error);
		res.status(400).json({
			error: 'Failed to calculate cost',
			message: error instanceof Error ? error.message : 'Unknown error'
		});
	}
});

/**
 * Extend promotion duration
 * POST /api/ads/user-promotions/:id/extend
 */
router.post('/user-promotions/:id/extend', isAuthenticated, async (req, res) => {
	try {
		const { id } = req.params;
		const userId = userService.getUserFromRequest(req)?.id;
		const { additionalHours } = extendPromotionSchema.parse(req.body);

		// TODO: Implement promotion extension logic
		// This would involve:
		// 1. Verify user owns the promotion
		// 2. Calculate additional cost
		// 3. Check user balance
		// 4. Extend the promotion end time
		// 5. Charge additional DGT

		sendSuccessResponse(res, {
        			success: true,
        			message: 'Promotion extension feature coming soon',
        			promotionId: id,
        			additionalHours
        		});
	} catch (error) {
		logger.error('Extend promotion error:', error);
		res.status(400).json({
			error: 'Failed to extend promotion',
			message: error instanceof Error ? error.message : 'Unknown error'
		});
	}
});

/**
 * Cancel promotion
 * DELETE /api/ads/user-promotions/:id
 */
router.delete('/user-promotions/:id', isAuthenticated, async (req, res) => {
	try {
		const { id } = req.params;
		const userId = userService.getUserFromRequest(req)?.id;

		// TODO: Implement promotion cancellation logic
		// This would involve:
		// 1. Verify user owns the promotion
		// 2. Check if promotion can be cancelled (not already active/completed)
		// 3. Calculate refund amount based on unused time
		// 4. Process refund to user's DGT balance
		// 5. Update promotion status to 'cancelled'

		sendSuccessResponse(res, {
        			success: true,
        			message: 'Promotion cancellation feature coming soon',
        			promotionId: id
        		});
	} catch (error) {
		logger.error('Cancel promotion error:', error);
		res.status(400).json({
			error: 'Failed to cancel promotion',
			message: error instanceof Error ? error.message : 'Unknown error'
		});
	}
});

/**
 * Get promotion analytics
 * GET /api/ads/user-promotions/:id/analytics
 */
router.get('/user-promotions/:id/analytics', isAuthenticated, async (req, res) => {
	try {
		const { id } = req.params;
		const { from, to } = req.query;

		const timeRange =
			from && to
				? {
						from: new Date(from as string),
						to: new Date(to as string)
					}
				: undefined;

		const analytics = await userPromotionService.getPromotionAnalytics(id, timeRange);
		sendSuccessResponse(res, analytics);
	} catch (error) {
		logger.error('Get promotion analytics error:', error);
		res.status(500).json({
			error: 'Failed to get analytics',
			message: error instanceof Error ? error.message : 'Unknown error'
		});
	}
});

// ============================================================================
// ANNOUNCEMENT SLOT ROUTES
// ============================================================================

/**
 * Get available announcement slots
 * GET /api/ads/announcement-slots/available
 */
router.get('/announcement-slots/available', async (req, res) => {
	try {
		const { date, duration } = req.query;

		if (!date || !duration) {
			return res.status(400).json({ error: 'Date and duration are required' });
		}

		const startTime = new Date(date as string);
		const durationHours = parseInt(duration as string);

		const availableSlots = await userPromotionService.getAvailableAnnouncementSlots(
			startTime,
			durationHours
		);
		sendSuccessResponse(res, availableSlots);
	} catch (error) {
		logger.error('Get available slots error:', error);
		res.status(500).json({
			error: 'Failed to get available slots',
			message: error instanceof Error ? error.message : 'Unknown error'
		});
	}
});

/**
 * Reserve announcement slot
 * POST /api/ads/announcement-slots/reserve
 */
router.post('/announcement-slots/reserve', isAuthenticated, async (req, res) => {
	try {
		const { slotId, promotionId } = req.body;
		const userId = userService.getUserFromRequest(req)?.id;

		if (!slotId || !promotionId || !userId) {
			return res
				.status(400)
				.json({ error: 'Slot ID, promotion ID, and user authentication are required' });
		}

		await userPromotionService.reserveAnnouncementSlot(slotId, promotionId, userId);
		sendSuccessResponse(res, { success: true, message: 'Slot reserved successfully' });
	} catch (error) {
		logger.error('Reserve slot error:', error);
		res.status(400).json({
			error: 'Failed to reserve slot',
			message: error instanceof Error ? error.message : 'Unknown error'
		});
	}
});

/**
 * Get active announcement slots (public)
 * GET /api/ads/announcement-slots/active
 */
router.get('/announcement-slots/active', async (req, res) => {
	try {
		// TODO: Implement getting active announcement slots for display
		// This would return currently active user promotions for the announcement bar

		sendSuccessResponse(res, {
        			announcements: [],
        			message: 'Active announcement slots feature coming soon'
        		});
	} catch (error) {
		logger.error('Get active slots error:', error);
		res.status(500).json({
			error: 'Failed to get active slots',
			message: error instanceof Error ? error.message : 'Unknown error'
		});
	}
});

// ============================================================================
// SHOUTBOX PIN ROUTES
// ============================================================================

/**
 * Get active pinned shoutbox messages
 * GET /api/ads/shoutbox/pins/active
 */
router.get('/shoutbox/pins/active', async (req, res) => {
	try {
		const activePins = await userPromotionService.getActivePinnedMessages();
		sendSuccessResponse(res, activePins);
	} catch (error) {
		logger.error('Get active pins error:', error);
		res.status(500).json({
			error: 'Failed to get active pins',
			message: error instanceof Error ? error.message : 'Unknown error'
		});
	}
});

// ============================================================================
// PROMOTION TRACKING ROUTES
// ============================================================================

/**
 * Track promotion events (impression, click, conversion)
 * POST /api/ads/user-promotions/:id/track/:eventType
 */
router.post('/user-promotions/:id/track/:eventType', async (req, res) => {
	try {
		const { id, eventType } = req.params;
		const metadata = req.body;

		if (!['impression', 'click', 'conversion'].includes(eventType)) {
			return res.status(400).json({ error: 'Invalid event type' });
		}

		await userPromotionService.trackPromotionEvent(
			id,
			eventType as 'impression' | 'click' | 'conversion',
			metadata
		);

		sendSuccessResponse(res, { success: true });
	} catch (error) {
		logger.error('Track promotion event error:', error);
		res.status(400).json({
			error: 'Failed to track event',
			message: error instanceof Error ? error.message : 'Unknown error'
		});
	}
});

// ============================================================================
// ADMIN MODERATION ROUTES
// ============================================================================

/**
 * Get pending promotions for moderation
 * GET /api/ads/admin/user-promotions/pending
 */
router.get('/admin/user-promotions/pending', isAdmin, async (req, res) => {
	try {
		const filters = {
			type: req.query.type as string,
			limit: req.query.limit ? parseInt(req.query.limit as string) : 50,
			offset: req.query.offset ? parseInt(req.query.offset as string) : 0
		};

		const pendingPromotions = await userPromotionService.getPendingPromotions(filters);
		sendSuccessResponse(res, pendingPromotions);
	} catch (error) {
		logger.error('Get pending promotions error:', error);
		res.status(500).json({
			error: 'Failed to get pending promotions',
			message: error instanceof Error ? error.message : 'Unknown error'
		});
	}
});

/**
 * Moderate user promotion (approve/reject)
 * POST /api/ads/admin/user-promotions/:id/moderate
 */
router.post('/admin/user-promotions/:id/moderate', isAdmin, async (req, res) => {
	try {
		const { id } = req.params;
		const moderatorId = userService.getUserFromRequest(req)?.id;
		const { action, notes, rejectionReason } = moderationActionSchema.parse(req.body);

		if (!moderatorId) {
			return res.status(401).json({ error: 'Moderator not authenticated' });
		}

		if (action === 'approve') {
			await userPromotionService.approvePromotion(id, moderatorId, notes);
			sendSuccessResponse(res, { success: true, message: 'Promotion approved successfully' });
		} else {
			if (!rejectionReason) {
				return res.status(400).json({ error: 'Rejection reason is required' });
			}
			await userPromotionService.rejectPromotion(id, moderatorId, rejectionReason);
			sendSuccessResponse(res, { success: true, message: 'Promotion rejected successfully' });
		}
	} catch (error) {
		logger.error('Moderate promotion error:', error);
		res.status(400).json({
			error: 'Failed to moderate promotion',
			message: error instanceof Error ? error.message : 'Unknown error'
		});
	}
});

/**
 * Get user promotion analytics (admin)
 * GET /api/ads/admin/user-promotions/analytics
 */
router.get('/admin/user-promotions/analytics', isAdmin, async (req, res) => {
	try {
		// TODO: Implement admin-level analytics for all user promotions
		// This would include:
		// - Total DGT spent on promotions
		// - Most popular promotion types
		// - Revenue by time period
		// - User engagement metrics
		// - Moderation queue statistics

		sendSuccessResponse(res, {
        			totalPromotions: 0,
        			totalDgtSpent: 0,
        			activePromotions: 0,
        			pendingApproval: 0,
        			message: 'Admin analytics feature coming soon'
        		});
	} catch (error) {
		logger.error('Get admin analytics error:', error);
		res.status(500).json({
			error: 'Failed to get admin analytics',
			message: error instanceof Error ? error.message : 'Unknown error'
		});
	}
});

export { router as userPromotionRoutes };
