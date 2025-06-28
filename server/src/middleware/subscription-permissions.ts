/**
 * Subscription Permissions Middleware
 *
 * Injects subscription permissions into request object for easy access
 */

import type { Request, Response, NextFunction } from 'express';
import {
	subscriptionPermissionsService,
	SubscriptionPermissions
} from '../domains/subscriptions/subscription-permissions.service';
import { logger } from '../core/logger';

// Extend Request interface to include subscription permissions
declare global {
	namespace Express {
		interface Request {
			subscriptionPermissions?: SubscriptionPermissions;
		}
	}
}

/**
 * Middleware to inject subscription permissions into request
 */
export async function injectSubscriptionPermissions(
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> {
	try {
		const userId = req.user?.id;

		if (userId) {
			// Get user's subscription permissions
			req.subscriptionPermissions =
				await subscriptionPermissionsService.getUserSubscriptionPermissions(userId);
		} else {
			// Default permissions for unauthenticated users
			req.subscriptionPermissions = {
				hasVipAccess: false,
				hasVipBadge: false,
				hasPrioritySupport: false,
				hasAdvancedForumFeatures: false,
				hasVipOnlyContent: false,
				hasDegenAccess: false,
				hasDegenBadge: false,
				hasMonthlyCosmeticDrops: false,
				hasExclusiveContent: false,
				hasEnhancedProfile: false,
				hasAnySubscription: false,
				hasPremiumFeatures: false
			};
		}

		next();
	} catch (error) {
		logger.error('SUBSCRIPTION_MIDDLEWARE', 'Error injecting subscription permissions:', error);

		// Continue with default permissions on error
		req.subscriptionPermissions = {
			hasVipAccess: false,
			hasVipBadge: false,
			hasPrioritySupport: false,
			hasAdvancedForumFeatures: false,
			hasVipOnlyContent: false,
			hasDegenAccess: false,
			hasDegenBadge: false,
			hasMonthlyCosmeticDrops: false,
			hasExclusiveContent: false,
			hasEnhancedProfile: false,
			hasAnySubscription: false,
			hasPremiumFeatures: false
		};

		next();
	}
}

/**
 * Middleware to require VIP access
 */
export function requireVipAccess(req: Request, res: Response, next: NextFunction): void {
	if (!req.subscriptionPermissions?.hasVipAccess) {
		res.status(403).json({
			success: false,
			error: 'VIP Pass subscription required to access this feature',
			requiresSubscription: 'vip_pass'
		});
		return;
	}
	next();
}

/**
 * Middleware to require Degen Pass access
 */
export function requireDegenAccess(req: Request, res: Response, next: NextFunction): void {
	if (!req.subscriptionPermissions?.hasDegenAccess) {
		res.status(403).json({
			success: false,
			error: 'Degen Pass subscription required to access this feature',
			requiresSubscription: 'degen_pass'
		});
		return;
	}
	next();
}

/**
 * Middleware to require any premium subscription
 */
export function requirePremiumAccess(req: Request, res: Response, next: NextFunction): void {
	if (!req.subscriptionPermissions?.hasPremiumFeatures) {
		res.status(403).json({
			success: false,
			error: 'Premium subscription required to access this feature',
			requiresSubscription: 'any'
		});
		return;
	}
	next();
}

/**
 * Middleware to check specific subscription benefit
 */
export function requireSubscriptionBenefit(benefitKey: string) {
	return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
			const userId = req.user?.id;

			if (!userId) {
				res.status(401).json({
					success: false,
					error: 'Authentication required'
				});
				return;
			}

			const canUseBenefit = await subscriptionPermissionsService.canUseBenefit(userId, benefitKey);

			if (!canUseBenefit) {
				res.status(403).json({
					success: false,
					error: `Subscription benefit '${benefitKey}' required to access this feature`,
					requiredBenefit: benefitKey
				});
				return;
			}

			next();
		} catch (error) {
			logger.error('SUBSCRIPTION_MIDDLEWARE', `Error checking benefit ${benefitKey}:`, error);
			res.status(500).json({
				success: false,
				error: 'Failed to verify subscription permissions'
			});
		}
	};
}
