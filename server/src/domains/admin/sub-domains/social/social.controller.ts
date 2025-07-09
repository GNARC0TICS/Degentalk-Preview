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
			sendErrorResponse(res, 'Failed to fetch social configuration', 500);
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
			sendErrorResponse(res, 'Failed to update social configuration', 500);
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
			sendErrorResponse(res, 'Failed to fetch social statistics', 500);
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
			sendErrorResponse(res, 'Failed to reset social configuration', 500);
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
			sendErrorResponse(res, 'Failed to fetch feature status', 500);
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
			sendErrorResponse(res, 'Failed to emergency disable social features', 500);
		}
	}
}

export const socialController = SocialController;
