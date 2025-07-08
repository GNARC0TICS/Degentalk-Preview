import type { Request, Response } from 'express';
import { userService } from '@server/src/core/services/user.service';
import { SocialService } from './social.service';
import { logger } from '@server/src/core/logger';
import { sendSuccessResponse, sendErrorResponse } from "@server/src/core/utils/transformer.helpers";

export class SocialController {
	/**
	 * Get current social configuration
	 */
	static async getSocialConfig(req: Request, res: Response) {
		try {
			const config = await SocialService.getSocialConfig();
			sendSuccessResponse(res, config);
		} catch (error) {
			logger.error('SocialController', 'Error fetching social config', { error });
			res.status(500).json({
				error: 'Failed to fetch social configuration',
				details: error instanceof Error ? error.message : 'Unknown error'
			});
		}
	}

	/**
	 * Update social configuration
	 */
	static async updateSocialConfig(req: Request, res: Response, validatedData: any) {
		try {
			const adminUserId = userService.getUserFromRequest(req)!.id;
			const updatedConfig = await SocialService.updateSocialConfig(validatedData, adminUserId);

			logger.info('SocialController', 'Social configuration updated', {
				adminUserId,
				changes: Object.keys(validatedData)
			});

			sendSuccessResponse(res, updatedConfig);
		} catch (error) {
			logger.error('SocialController', 'Error updating social config', { error });
			res.status(500).json({
				error: 'Failed to update social configuration',
				details: error instanceof Error ? error.message : 'Unknown error'
			});
		}
	}

	/**
	 * Get social feature usage statistics
	 */
	static async getSocialStats(req: Request, res: Response) {
		try {
			const stats = await SocialService.getSocialStats();
			sendSuccessResponse(res, stats);
		} catch (error) {
			logger.error('SocialController', 'Error fetching social stats', { error });
			res.status(500).json({
				error: 'Failed to fetch social statistics',
				details: error instanceof Error ? error.message : 'Unknown error'
			});
		}
	}

	/**
	 * Reset social configuration to defaults
	 */
	static async resetSocialConfig(req: Request, res: Response) {
		try {
			const adminUserId = userService.getUserFromRequest(req)!.id;
			const defaultConfig = await SocialService.resetToDefaults(adminUserId);

			logger.warn('SocialController', 'Social configuration reset to defaults', {
				adminUserId
			});

			sendSuccessResponse(res, defaultConfig);
		} catch (error) {
			logger.error('SocialController', 'Error resetting social config', { error });
			res.status(500).json({
				error: 'Failed to reset social configuration',
				details: error instanceof Error ? error.message : 'Unknown error'
			});
		}
	}

	/**
	 * Get current status of all social features
	 */
	static async getFeatureStatus(req: Request, res: Response) {
		try {
			const status = await SocialService.getFeatureStatus();
			sendSuccessResponse(res, status);
		} catch (error) {
			logger.error('SocialController', 'Error fetching feature status', { error });
			res.status(500).json({
				error: 'Failed to fetch feature status',
				details: error instanceof Error ? error.message : 'Unknown error'
			});
		}
	}

	/**
	 * Emergency disable all social features
	 */
	static async emergencyDisableSocial(req: Request, res: Response) {
		try {
			const adminUserId = userService.getUserFromRequest(req)!.id;
			const result = await SocialService.emergencyDisable(adminUserId);

			logger.warn('SocialController', 'Emergency social disable triggered', {
				adminUserId
			});

			sendSuccessResponse(res, result);
		} catch (error) {
			logger.error('SocialController', 'Error during emergency disable', { error });
			res.status(500).json({
				error: 'Failed to emergency disable social features',
				details: error instanceof Error ? error.message : 'Unknown error'
			});
		}
	}
}

export const socialController = SocialController;
