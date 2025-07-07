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
				res.status(401).json({
					success: false,
					error: 'Authentication required'
				});
				return;
			}

			if (!type || !['vip_pass', 'degen_pass'].includes(type)) {
				res.status(400).json({
					success: false,
					error: 'Valid subscription type required (vip_pass or degen_pass)'
				});
				return;
			}

			const subscription = await subscriptionService.purchaseSubscription({
				userId,
				type
			});

			res.status(201).json({
				success: true,
				data: {
					subscription,
					message: `${type.replace('_', ' ')} purchased successfully!`
				}
			});
		} catch (error) {
			logger.error('SUBSCRIPTION_CONTROLLER', 'Error purchasing subscription:', error);
			res.status(400).json({
				success: false,
				error: error.message || 'Failed to purchase subscription'
			});
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
				res.status(401).json({
					success: false,
					error: 'Authentication required'
				});
				return;
			}

			const subscription = await subscriptionService.getUserActiveSubscription(userId);

			res.json({
				success: true,
				data: {
					subscription,
					hasActiveSubscription: subscription !== null
				}
			});
		} catch (error) {
			logger.error('SUBSCRIPTION_CONTROLLER', 'Error getting current subscription:', error);
			res.status(500).json({
				success: false,
				error: 'Failed to retrieve subscription information'
			});
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
				res.status(401).json({
					success: false,
					error: 'Authentication required'
				});
				return;
			}

			const subscriptions = await subscriptionService.getUserSubscriptions(userId);

			res.json({
				success: true,
				data: {
					subscriptions,
					count: subscriptions.length
				}
			});
		} catch (error) {
			logger.error('SUBSCRIPTION_CONTROLLER', 'Error getting subscription history:', error);
			res.status(500).json({
				success: false,
				error: 'Failed to retrieve subscription history'
			});
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
				res.status(401).json({
					success: false,
					error: 'Authentication required'
				});
				return;
			}

			const subscriptionId = id as EntityId;
			if (!subscriptionId) {
				res.status(400).json({
					success: false,
					error: 'Valid subscription ID required'
				});
				return;
			}

			const success = await subscriptionService.cancelSubscription(userId, subscriptionId);

			if (success) {
				res.json({
					success: true,
					data: {
						message: 'Subscription cancelled successfully'
					}
				});
			} else {
				res.status(400).json({
					success: false,
					error: 'Failed to cancel subscription'
				});
			}
		} catch (error) {
			logger.error('SUBSCRIPTION_CONTROLLER', 'Error cancelling subscription:', error);
			res.status(400).json({
				success: false,
				error: error.message || 'Failed to cancel subscription'
			});
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
				res.status(401).json({
					success: false,
					error: 'Authentication required'
				});
				return;
			}

			const drops = await subscriptionService.getUserCosmeticDrops(userId);

			res.json({
				success: true,
				data: {
					drops,
					count: drops.length,
					totalValue: drops.reduce((sum, drop) => sum + drop.cosmeticValue, 0)
				}
			});
		} catch (error) {
			logger.error('SUBSCRIPTION_CONTROLLER', 'Error getting cosmetic drops:', error);
			res.status(500).json({
				success: false,
				error: 'Failed to retrieve cosmetic drop history'
			});
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
				res.status(401).json({
					success: false,
					error: 'Authentication required'
				});
				return;
			}

			if (!benefitKey) {
				res.status(400).json({
					success: false,
					error: 'Benefit key required'
				});
				return;
			}

			const hasBenefit = await subscriptionService.hasSubscriptionBenefit(userId, benefitKey);

			res.json({
				success: true,
				data: {
					benefitKey,
					hasBenefit
				}
			});
		} catch (error) {
			logger.error('SUBSCRIPTION_CONTROLLER', 'Error checking benefit:', error);
			res.status(500).json({
				success: false,
				error: 'Failed to check subscription benefit'
			});
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

			res.json({
				success: true,
				data: {
					pricing,
					currency: 'DGT'
				}
			});
		} catch (error) {
			logger.error('SUBSCRIPTION_CONTROLLER', 'Error getting pricing:', error);
			res.status(500).json({
				success: false,
				error: 'Failed to retrieve subscription pricing'
			});
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
				res.status(403).json({
					success: false,
					error: 'Admin access required'
				});
				return;
			}

			const results = await subscriptionService.processMonthlyCosmetics();

			res.json({
				success: true,
				data: {
					results,
					message: `Cosmetic drops processed: ${results.processed} successful, ${results.failed} failed`
				}
			});
		} catch (error) {
			logger.error('SUBSCRIPTION_CONTROLLER', 'Error processing cosmetics:', error);
			res.status(500).json({
				success: false,
				error: 'Failed to process monthly cosmetic drops'
			});
		}
	}
}

export const subscriptionController = new SubscriptionController();
