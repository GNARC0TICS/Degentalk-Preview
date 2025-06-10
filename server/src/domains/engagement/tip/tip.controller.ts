/**
 * Tip Controller
 *
 * Handles HTTP requests related to tipping functionality
 *
 * // [REFAC-TIP]
 */

import { Request, Response } from 'express';
import { TipService } from './tip.service';
import { asyncHandler } from '../../../core/errors';
import { z } from 'zod';
import { logger } from '../../../core/logger';

/**
 * Controller for tipping functionality
 */
export class TipController {
	private tipService: TipService;

	constructor() {
		this.tipService = new TipService();
	}

	/**
	 * Send a tip to another user
	 */
	sendTip = asyncHandler(async (req: Request, res: Response) => {
		const fromUserId = req.user.id;
		const { toUserId, amount, reason } = req.body;

		// Validate input using zod
		const tipSchema = z.object({
			toUserId: z.number().int().positive(),
			amount: z.number().positive(),
			reason: z.string().optional()
		});

		const validatedData = tipSchema.parse({ toUserId, amount, reason });

		const result = await this.tipService.sendTip(
			fromUserId,
			validatedData.toUserId,
			validatedData.amount,
			validatedData.reason || 'Tip'
		);

		return res.json({
			success: true,
			data: result
		});
	});

	/**
	 * Get tip history for the authenticated user
	 */
	getTipHistory = asyncHandler(async (req: Request, res: Response) => {
		const userId = req.user.id;
		const limit = parseInt(req.query.limit as string) || 20;
		const offset = parseInt(req.query.offset as string) || 0;
		const type = (req.query.type as string) || 'all'; // 'sent', 'received', 'all'

		const tipHistory = await this.tipService.getTipHistory(userId, limit, offset, type);

		return res.json({
			success: true,
			data: tipHistory
		});
	});

	/**
	 * Get tip leaderboard
	 * Shows users who've sent the most tips or received the most tips
	 */
	getTipLeaderboard = asyncHandler(async (req: Request, res: Response) => {
		const period = (req.query.period as string) || 'all'; // 'day', 'week', 'month', 'all'
		const type = (req.query.type as string) || 'received'; // 'sent', 'received'
		const limit = parseInt(req.query.limit as string) || 10;

		const leaderboard = await this.tipService.getTipLeaderboard(period, type, limit);

		return res.json({
			success: true,
			data: leaderboard
		});
	});

	/**
	 * Get tip settings (min/max amounts, etc.)
	 */
	getTipSettings = asyncHandler(async (req: Request, res: Response) => {
		const settings = await this.tipService.getTipSettings();

		return res.json({
			success: true,
			data: settings
		});
	});

	/**
	 * Update tip settings (admin only)
	 */
	updateTipSettings = asyncHandler(async (req: Request, res: Response) => {
		const userId = req.user.id;
		const { minAmount, maxAmount, cooldownMinutes, burnPercentage } = req.body;

		// Validate input using zod
		const settingsSchema = z.object({
			minAmount: z.number().min(1).optional(),
			maxAmount: z.number().positive().optional(),
			cooldownMinutes: z.number().min(0).optional(),
			burnPercentage: z.number().min(0).max(100).optional()
		});

		const validatedData = settingsSchema.parse({
			minAmount,
			maxAmount,
			cooldownMinutes,
			burnPercentage
		});

		const updatedSettings = await this.tipService.updateTipSettings(userId, validatedData);

		return res.json({
			success: true,
			data: updatedSettings
		});
	});
}

// Export a singleton instance
export const tipController = new TipController();
