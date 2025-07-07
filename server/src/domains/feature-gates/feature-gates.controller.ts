import { userService } from '@server/src/core/services/user.service';
import type { Request, Response, NextFunction } from 'express';
import { logger, LogLevel } from '../../core/logger';
import { featureGatesService } from './feature-gates.service';
import { isValidId } from '@shared/utils/id';
import type { UserId } from '@shared/types/ids';

/**
 * Get all feature gates
 */
export const getAllFeatureGates = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const gates = await featureGatesService.getAllFeatureGates();
		res.status(200).json(gates);
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
			return res.status(400).json({ message: 'Feature ID is required' });
		}

		const gate = await featureGatesService.getFeatureGate(featureId);

		if (!gate) {
			return res.status(404).json({ message: 'Feature gate not found' });
		}

		res.status(200).json(gate);
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
		// @ts-expect-error - req.user is added by auth middleware
		const userId = userService.getUserFromRequest(req)?.id;

		if (!userId) {
			return res.status(401).json({
				message: 'Authentication required',
				featureId,
				hasAccess: false,
				reason: 'login_required'
			});
		}

		if (!featureId) {
			return res.status(400).json({ message: 'Feature ID is required' });
		}

		const access = await featureGatesService.checkFeatureAccess(userId, featureId);
		res.status(200).json(access);
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
		// @ts-expect-error - req.user is added by auth middleware
		const userId = userService.getUserFromRequest(req)?.id;

		if (!userId) {
			return res.status(401).json({ message: 'Authentication required' });
		}

		const access = await featureGatesService.checkAllFeatureAccess(userId);
		res.status(200).json(access);
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
			return res.status(400).json({
				message: 'User ID and Feature ID are required and must be valid'
			});
		}

		const access = await featureGatesService.checkFeatureAccess(userId as UserId, featureId);
		res.status(200).json(access);
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
			return res.status(400).json({ message: 'User ID is required and must be valid' });
		}

		const access = await featureGatesService.checkAllFeatureAccess(userId as UserId);
		res.status(200).json(access);
	} catch (error) {
		logger.error('Error getting all feature access for user:', error);
		next(error);
	}
};
