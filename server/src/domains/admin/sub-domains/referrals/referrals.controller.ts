import type { Request, Response } from 'express';
import { userService } from '@core/services/user.service';
import { referralsService } from './referrals.service';
import { sendSuccessResponse, sendErrorResponse } from "@core/utils/transformer.helpers";

/**
 * Controller for managing referral sources and user referrals in the admin panel
 */
export class ReferralsController {
	/**
	 * Create a new referral source
	 */
	async createReferralSource(req: Request, res: Response) {
		try {
			const { name, slug, metadata } = req.body;
			const createdBy = userService.getUserFromRequest(req)?.id;

			const source = await referralsService.createReferralSource(
				name,
				slug,
				metadata || {},
				createdBy
			);

			return sendSuccessResponse(res, source);
		} catch (error) {
			return sendErrorResponse(res, error.message || 'Failed to create referral source', 400);
		}
	}

	/**
	 * Get all referral sources
	 */
	async getAllReferralSources(req: Request, res: Response) {
		try {
			const sources = await referralsService.getAllReferralSources();

			sendSuccessResponse(res, {
            				success: true,
            				data: sources
            			});
		} catch (error) {
			return sendErrorResponse(res, 'Failed to fetch referral sources', 500);
		}
	}

	/**
	 * Get referral source statistics
	 */
	async getReferralSourceStats(req: Request, res: Response) {
		try {
			const stats = await referralsService.getReferralSourceStats();

			sendSuccessResponse(res, {
            				success: true,
            				data: stats
            			});
		} catch (error) {
			return sendErrorResponse(res, 'Failed to fetch referral source statistics', 500);
		}
	}

	/**
	 * Get user-to-user referral statistics
	 */
	async getUserReferralStats(req: Request, res: Response) {
		try {
			const stats = await referralsService.getUserReferralStats();

			sendSuccessResponse(res, {
            				success: true,
            				data: stats
            			});
		} catch (error) {
			return sendErrorResponse(res, 'Failed to fetch user referral statistics', 500);
		}
	}

	/**
	 * Get referral count by user
	 */
	async getReferralCountByUser(req: Request, res: Response) {
		try {
			const stats = await referralsService.getReferralCountByUser();

			sendSuccessResponse(res, {
            				success: true,
            				data: stats
            			});
		} catch (error) {
			return sendErrorResponse(res, 'Failed to fetch referral count by user', 500);
		}
	}
}

export const referralsController = new ReferralsController();
