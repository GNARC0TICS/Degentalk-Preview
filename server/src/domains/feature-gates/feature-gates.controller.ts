import { userService } from '@core/services/user.service';
import type { Request, Response, NextFunction } from 'express';
import { logger, LogLevel } from '@core/logger';
import { featureGatesService } from './feature-gates.service';
import { isValidId, toId } from '@shared/types';
import type { UserId } from '@shared/types/ids';
import { sendSuccessResponse, sendErrorResponse } from '@core/utils/transformer.helpers';

/**
 * Get all feature gates
 */
export const getAllFeatureGates = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const gates = await featureGatesService.getAllFeatureGates();
		sendSuccessResponse(res, gates);
	} catch (error) {
		logger.error('Error getting feature gates:', error);
		next(error);
	}
};

/**
 * Get a specific feature gate
 */
export const getFeatureGate = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { featureId } = req.params;

		if (!featureId) {
			return sendErrorResponse(res, 'Feature ID is required', 400);
		}

		const gate = await featureGatesService.getFeatureGate(featureId);

		if (!gate) {
			return sendErrorResponse(res, 'Feature gate not found', 404);
		}

		sendSuccessResponse(res, gate);
	} catch (error) {
		logger.error('Error getting feature gate:', error);
		next(error);
	}
};

/**
 * Check access to a feature for the current user
 */
export const checkFeatureAccess = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { featureId } = req.params;
		const userId = userService.getUserFromRequest(req)?.id;

		if (!userId) {
			return sendErrorResponse(res, 'Authentication required', 401);
		}

		if (!featureId) {
			return sendErrorResponse(res, 'Feature ID is required', 400);
		}

		const access = await featureGatesService.checkFeatureAccess(userId, featureId);
		sendSuccessResponse(res, access);
	} catch (error) {
		logger.error('Error checking feature access:', error);
		next(error);
	}
};

/**
 * Check access to all features for the current user
 */
export const checkAllFeatureAccess = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const userId = userService.getUserFromRequest(req)?.id;

		if (!userId) {
			return sendErrorResponse(res, 'Authentication required', 401);
		}

		const access = await featureGatesService.checkAllFeatureAccess(userId);
		sendSuccessResponse(res, access);
	} catch (error) {
		logger.error('Error checking all feature access:', error);
		next(error);
	}
};

/**
 * Check access to a feature for a specific user (admin only)
 */
export const checkFeatureAccessForUser = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { userId, featureId } = req.params;

		if (!userId || !featureId || !isValidId(userId)) {
			return sendErrorResponse(res, 'User ID and Feature ID are required and must be valid', 400);
		}

		const validUserId = toId<'User'>(userId);
		const access = await featureGatesService.checkFeatureAccess(validUserId, featureId);
		sendSuccessResponse(res, access);
	} catch (error) {
		logger.error('Error checking feature access for user:', error);
		next(error);
	}
};

/**
 * Get all feature access for a specific user (admin only)
 */
export const getAllFeatureAccessForUser = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { userId } = req.params;

		if (!userId || !isValidId(userId)) {
			return sendErrorResponse(res, 'User ID is required and must be valid', 400);
		}

		const validUserId = toId<'User'>(userId);
		const access = await featureGatesService.checkAllFeatureAccess(validUserId);
		sendSuccessResponse(res, access);
	} catch (error) {
		logger.error('Error getting all feature access for user:', error);
		next(error);
	}
};
