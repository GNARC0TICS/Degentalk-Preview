import { userService } from '@server/src/core/services/user.service';
/**
 * Subscription Controller
 *
 * Handles HTTP requests for VIP Pass and Degen Pass subscription management
 */

import type { Request, Response } from 'express';
import type { EntityId } from '@shared/types/ids';
import { subscriptionService } from './subscription.service';
import { logger } from '../../core/logger';
import { sendSuccessResponse, sendErrorResponse } from "@server/src/core/utils/transformer.helpers";

export class SubscriptionController {
	/**
	 * Purchase a subscription (VIP Pass or Degen Pass)
	 * POST /api/subscriptions/purchase
	 */
	async purchaseSubscription(req: Request, res: Response): Promise<void> {
		try {
			const { type } = req.body;
			const userId = userService.getUserFromRequest(req)?.id;

			if (!userId) {
				return sendErrorResponse(res, 'Authentication required', 401);
			}

			if (!type || !['vip_pass', 'degen_pass'].includes(type)) {
				return sendErrorResponse(res, 'Valid subscription type required (vip_pass or degen_pass)', 400);
			}

			const subscription = await subscriptionService.purchaseSubscription({
				userId,
				type
			});

			sendSuccessResponse(res, {
				subscription,
				message: `${type.replace('_', ' ')} purchased successfully!`
			}, 201);
		} catch (error) {
			logger.error('SUBSCRIPTION_CONTROLLER', 'Error purchasing subscription:', error);
			sendErrorResponse(res, error.message || 'Failed to purchase subscription', 400);
		}
	}

	/**
	 * Get user's current subscription
	 * GET /api/subscriptions/current
	 */
	async getCurrentSubscription(req: Request, res: Response): Promise<void> {
		try {
			const userId = userService.getUserFromRequest(req)?.id;

			if (!userId) {
				return sendErrorResponse(res, 'Authentication required', 401);
			}

			const subscription = await subscriptionService.getUserActiveSubscription(userId);

			sendSuccessResponse(res, {
				success: true,
				data: {
					subscription,
					hasActiveSubscription: subscription !== null
				}
			});
		} catch (error) {
			logger.error('SUBSCRIPTION_CONTROLLER', 'Error getting current subscription:', error);
			sendErrorResponse(res, 'Failed to retrieve subscription information', 500);
		}
	}

	/**
	 * Get user's subscription history
	 * GET /api/subscriptions/history
	 */
	async getSubscriptionHistory(req: Request, res: Response): Promise<void> {
		try {
			const userId = userService.getUserFromRequest(req)?.id;

			if (!userId) {
				return sendErrorResponse(res, 'Authentication required', 401);
			}

			const subscriptions = await subscriptionService.getUserSubscriptions(userId);

			sendSuccessResponse(res, {
				success: true,
				data: {
					subscriptions,
					count: subscriptions.length
				}
			});
		} catch (error) {
			logger.error('SUBSCRIPTION_CONTROLLER', 'Error getting subscription history:', error);
			sendErrorResponse(res, 'Failed to retrieve subscription history', 500);
		}
	}

	/**
	 * Cancel a subscription
	 * POST /api/subscriptions/:id/cancel
	 */
	async cancelSubscription(req: Request, res: Response): Promise<void> {
		try {
			const { id } = req.params;
			const userId = userService.getUserFromRequest(req)?.id;

			if (!userId) {
				return sendErrorResponse(res, 'Authentication required', 401);
			}

			const subscriptionId = id as EntityId;
			if (!subscriptionId) {
				return sendErrorResponse(res, 'Valid subscription ID required', 400);
			}

			const success = await subscriptionService.cancelSubscription(userId, subscriptionId);

			if (success) {
				sendSuccessResponse(res, {
					success: true,
					data: {
						message: 'Subscription cancelled successfully'
					}
				});
			} else {
				return sendErrorResponse(res, 'Failed to cancel subscription', 400);
			}
		} catch (error) {
			logger.error('SUBSCRIPTION_CONTROLLER', 'Error cancelling subscription:', error);
			sendErrorResponse(res, error.message || 'Failed to cancel subscription', 400);
		}
	}

	/**
	 * Get user's cosmetic drop history
	 * GET /api/subscriptions/cosmetics
	 */
	async getCosmeticDrops(req: Request, res: Response): Promise<void> {
		try {
			const userId = userService.getUserFromRequest(req)?.id;

			if (!userId) {
				return sendErrorResponse(res, 'Authentication required', 401);
			}

			const drops = await subscriptionService.getUserCosmeticDrops(userId);

			sendSuccessResponse(res, {
				success: true,
				data: {
					drops,
					count: drops.length,
					totalValue: drops.reduce((sum, drop) => sum + drop.cosmeticValue, 0)
				}
			});
		} catch (error) {
			logger.error('SUBSCRIPTION_CONTROLLER', 'Error getting cosmetic drops:', error);
			sendErrorResponse(res, 'Failed to retrieve cosmetic drop history', 500);
		}
	}

	/**
	 * Check if user has specific subscription benefit
	 * GET /api/subscriptions/benefits/:benefitKey
	 */
	async checkBenefit(req: Request, res: Response): Promise<void> {
		try {
			const { benefitKey } = req.params;
			const userId = userService.getUserFromRequest(req)?.id;

			if (!userId) {
				return sendErrorResponse(res, 'Authentication required', 401);
			}

			if (!benefitKey) {
				return sendErrorResponse(res, 'Benefit key required', 400);
			}

			const hasBenefit = await subscriptionService.hasSubscriptionBenefit(userId, benefitKey);

			sendSuccessResponse(res, {
				success: true,
				data: {
					benefitKey,
					hasBenefit
				}
			});
		} catch (error) {
			logger.error('SUBSCRIPTION_CONTROLLER', 'Error checking benefit:', error);
			sendErrorResponse(res, 'Failed to check subscription benefit', 500);
		}
	}

	/**
	 * Get subscription pricing and information
	 * GET /api/subscriptions/pricing
	 */
	async getSubscriptionPricing(req: Request, res: Response): Promise<void> {
		try {
			const pricing = {
				vip_pass: {
					name: 'VIP Pass',
					description: 'Lifetime VIP access with all current and future VIP benefits',
					price: 500,
					currency: 'DGT',
					type: 'lifetime',
					benefits: [
						'Lifetime VIP Status',
						'Exclusive VIP Badge',
						'Priority Support',
						'Advanced Forum Features',
						'Access to VIP-only content'
					]
				},
				degen_pass: {
					name: 'Degen Pass',
					description: 'Monthly subscription with 120 DGT worth of cosmetic drops',
					price: 100,
					currency: 'DGT',
					type: 'monthly',
					cosmeticValue: 120,
					benefits: [
						'Monthly Cosmetic Drops (120 DGT value)',
						'Exclusive Degen Badge',
						'Access to subscriber-only content',
						'Enhanced Profile Features',
						'Priority in giveaways'
					]
				}
			};

			sendSuccessResponse(res, {
				success: true,
				data: {
					pricing,
					currency: 'DGT'
				}
			});
		} catch (error) {
			logger.error('SUBSCRIPTION_CONTROLLER', 'Error getting pricing:', error);
			sendErrorResponse(res, 'Failed to retrieve subscription pricing', 500);
		}
	}

	/**
	 * Admin: Process monthly cosmetic drops manually
	 * POST /api/admin/subscriptions/process-cosmetics
	 */
	async processMonthlyCosmetics(req: Request, res: Response): Promise<void> {
		try {
			const userId = userService.getUserFromRequest(req)?.id;
			const userRole = userService.getUserFromRequest(req)?.role;

			if (!userId || userRole !== 'admin') {
				return sendErrorResponse(res, 'Admin access required', 403);
			}

			const results = await subscriptionService.processMonthlyCosmetics();

			sendSuccessResponse(res, {
				success: true,
				data: {
					results,
					message: `Cosmetic drops processed: ${results.processed} successful, ${results.failed} failed`
				}
			});
		} catch (error) {
			logger.error('SUBSCRIPTION_CONTROLLER', 'Error processing cosmetics:', error);
			sendErrorResponse(res, 'Failed to process monthly cosmetic drops', 500);
		}
	}
}

export const subscriptionController = new SubscriptionController();
