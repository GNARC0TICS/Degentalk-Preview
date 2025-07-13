import { userService } from '@core/services/user.service';
/**
 * Airdrop Controller
 *
 * Handles HTTP requests related to airdrop functionality
 *
 * // [REFAC-AIRDROP]
 */

import type { Request, Response } from 'express';
import { airdropService, AirdropOptions } from './airdrop.service';
import { WalletError, ErrorCodes as WalletErrorCodes } from '@core/errors';
import { asyncHandler } from '@core/errors';
import { logger } from '@core/logger';
import type { EntityId } from '@shared/types/ids';
import { sendSuccessResponse, sendErrorResponse } from '@core/utils/transformer.helpers';

/**
 * Controller for airdrop functionality
 */
export class AirdropController {
	/**
	 * Process an airdrop (admin only)
	 */
	processAirdrop = asyncHandler(async (req: Request, res: Response) => {
		const adminUserId = userService.getUserFromRequest(req)?.id;
		const isAdmin = userService.getUserFromRequest(req)?.role === 'admin';

		if (!adminUserId) {
			return sendErrorResponse(res, 'Authentication required', 401);
		}

		if (!isAdmin) {
			return sendErrorResponse(
				res,
				'Permission denied: Only administrators can initiate airdrops',
				403
			);
		}

		const { amount, currency, title, description, target, activityDays, threshold } = req.body;

		// Validate required fields
		if (!amount || !currency) {
			return sendErrorResponse(
				res,
				'Missing required fields: amount and currency are required',
				400
			);
		}

		// Create airdrop options
		const airdropOptions: AirdropOptions = {
			adminUserId,
			amount: parseFloat(amount),
			currency,
			title,
			description,
			target,
			activityDays: activityDays ? parseInt(activityDays) : undefined,
			threshold: threshold ? parseInt(threshold) : undefined
		};

		try {
			// Process the airdrop
			const result = await airdropService.processAirdrop(airdropOptions);

			return sendSuccessResponse(res, result);
		} catch (error) {
			if (error instanceof WalletError) {
				return sendErrorResponse(res, error.message, error.statusCode);
			}

			logger.error('AirdropController', `Error processing airdrop: ${error.message}`);
			return sendErrorResponse(res, 'Failed to process airdrop', 500);
		}
	});

	/**
	 * Get airdrop history (admin only)
	 */
	getAirdropHistory = asyncHandler(async (req: Request, res: Response) => {
		const userId = userService.getUserFromRequest(req)?.id;
		const isAdmin = userService.getUserFromRequest(req)?.role === 'admin';

		if (!userId) {
			return sendErrorResponse(res, 'Authentication required', 401);
		}

		if (!isAdmin) {
			return sendErrorResponse(
				res,
				'Permission denied: Only administrators can view airdrop history',
				403
			);
		}

		const limit = parseInt(req.query.limit as string) || 20;
		const offset = parseInt(req.query.offset as string) || 0;

		try {
			const history = await airdropService.getAirdropHistory(limit, offset);

			return sendSuccessResponse(res, {
				airdrops: history.airdrops,
				meta: {
					total: history.total,
					limit,
					offset
				}
			});
		} catch (error) {
			logger.error('AirdropController', `Error getting airdrop history: ${error.message}`);
			return sendErrorResponse(res, 'Failed to get airdrop history', 500);
		}
	});

	/**
	 * Get airdrop details (admin only)
	 */
	getAirdropDetails = asyncHandler(async (req: Request, res: Response) => {
		const userId = userService.getUserFromRequest(req)?.id;
		const isAdmin = userService.getUserFromRequest(req)?.role === 'admin';

		if (!userId) {
			return sendErrorResponse(res, 'Authentication required', 401);
		}

		if (!isAdmin) {
			return sendErrorResponse(
				res,
				'Permission denied: Only administrators can view airdrop details',
				403
			);
		}

		const airdropId = req.params.id as EntityId;

		if (!airdropId) {
			return sendErrorResponse(res, 'Invalid airdrop ID', 400);
		}

		try {
			const airdropDetails = await airdropService.getAirdropDetails(airdropId);

			return sendSuccessResponse(res, airdropDetails);
		} catch (error) {
			if (error instanceof WalletError) {
				return sendErrorResponse(res, error.message, error.statusCode);
			}

			logger.error('AirdropController', `Error getting airdrop details: ${error.message}`);
			return sendErrorResponse(res, 'Failed to get airdrop details', 500);
		}
	});
}

// Export a singleton instance
export const airdropController = new AirdropController();
