/**
 * Subscription Routes
 *
 * API routes for VIP Pass and Degen Pass subscription management
 */

import { Router } from 'express'
import type { Router as RouterType } from 'express';
import { subscriptionController } from './subscription.controller';
import { luciaAuth } from '@middleware/lucia-auth.middleware';
const isAuthenticated = luciaAuth.require;

const router: RouterType = Router();

// Authentication middleware for all subscription routes
router.use(isAuthenticated);

/**
 * @route POST /api/subscriptions/purchase
 * @desc Purchase a subscription (VIP Pass or Degen Pass)
 * @access Private
 * @body { type: 'vip_pass' | 'degen_pass' }
 */
router.post('/purchase', subscriptionController.purchaseSubscription);

/**
 * @route GET /api/subscriptions/current
 * @desc Get user's current active subscription
 * @access Private
 */
router.get('/current', subscriptionController.getCurrentSubscription);

/**
 * @route GET /api/subscriptions/history
 * @desc Get user's subscription history
 * @access Private
 */
router.get('/history', subscriptionController.getSubscriptionHistory);

/**
 * @route POST /api/subscriptions/:id/cancel
 * @desc Cancel a subscription
 * @access Private
 */
router.post('/:id/cancel', subscriptionController.cancelSubscription);

/**
 * @route GET /api/subscriptions/cosmetics
 * @desc Get user's cosmetic drop history
 * @access Private
 */
router.get('/cosmetics', subscriptionController.getCosmeticDrops);

/**
 * @route GET /api/subscriptions/benefits/:benefitKey
 * @desc Check if user has specific subscription benefit
 * @access Private
 */
router.get('/benefits/:benefitKey', subscriptionController.checkBenefit);

/**
 * @route GET /api/subscriptions/pricing
 * @desc Get subscription pricing and information
 * @access Public (no auth required)
 */
router.get('/pricing', subscriptionController.getSubscriptionPricing);

export default router;
