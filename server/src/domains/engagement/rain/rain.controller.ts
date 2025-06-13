/**
 * Rain Controller
 *
 * Handles HTTP requests related to rain functionality
 *
 * // [REFAC-RAIN]
 */

import type { Request, Response } from 'express';
import { RainService } from './rain.service';
import { asyncHandler } from '../../../core/errors';
import { z } from 'zod';
import { logger } from '../../../core/logger';

/**
 * Controller for rain functionality
 */
export class RainController {
	private rainService: RainService;

	constructor() {
		this.rainService = new RainService();
	}

	/**
	 * Process a rain distribution
	 */
	processRain = asyncHandler(async (req: Request, res: Response) => {
		const fromUserId = req.user.id;
		const { amount, eligibleUserCount, channel, message } = req.body;

		// Validate input using zod
		const rainSchema = z.object({
			amount: z.number().positive(),
			eligibleUserCount: z.number().positive().default(10),
			channel: z.string().default('general'),
			message: z.string().optional()
		});

		const validatedData = rainSchema.parse({
			amount,
			eligibleUserCount,
			channel,
			message
		});

		const result = await this.rainService.processRain(
			fromUserId,
			validatedData.amount,
			validatedData.eligibleUserCount,
			validatedData.channel,
			validatedData.message
		);

		return res.json({
			success: true,
			data: result
		});
	});

	/**
	 * Get recent rain events
	 */
	getRecentRainEvents = asyncHandler(async (req: Request, res: Response) => {
		const limit = parseInt(req.query.limit as string) || 10;
		const offset = parseInt(req.query.offset as string) || 0;

		const events = await this.rainService.getRecentRainEvents(limit, offset);

		return res.json({
			success: true,
			data: events
		});
	});

	/**
	 * Get rain settings
	 */
	getRainSettings = asyncHandler(async (req: Request, res: Response) => {
		const settings = await this.rainService.getRainSettings();

		return res.json({
			success: true,
			data: settings
		});
	});

	/**
	 * Update rain settings (admin only)
	 */
	updateRainSettings = asyncHandler(async (req: Request, res: Response) => {
		const userId = req.user.id;
		const {
			minAmount,
			maxAmount,
			minEligibleUsers,
			maxEligibleUsers,
			activityWindowMinutes,
			cooldownMinutes
		} = req.body;

		// Validate input using zod
		const settingsSchema = z.object({
			minAmount: z.number().min(1).optional(),
			maxAmount: z.number().positive().optional(),
			minEligibleUsers: z.number().min(1).optional(),
			maxEligibleUsers: z.number().min(1).optional(),
			activityWindowMinutes: z.number().min(1).optional(),
			cooldownMinutes: z.number().min(0).optional()
		});

		const validatedData = settingsSchema.parse({
			minAmount,
			maxAmount,
			minEligibleUsers,
			maxEligibleUsers,
			activityWindowMinutes,
			cooldownMinutes
		});

		const updatedSettings = await this.rainService.updateRainSettings(userId, validatedData);

		return res.json({
			success: true,
			data: updatedSettings
		});
	});
}

// Export a singleton instance
export const rainController = new RainController();
