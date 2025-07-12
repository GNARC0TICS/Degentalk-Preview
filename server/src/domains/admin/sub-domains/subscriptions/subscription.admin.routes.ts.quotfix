/**
 * Admin Subscription Routes
 *
 * Admin API routes for subscription management
 */

import { Router } from 'express';
import { adminSubscriptionController } from './subscription.admin.controller';

const router = Router();

/**
 * @route GET /api/admin/subscriptions/analytics
 * @desc Get subscription analytics and statistics
 * @access Admin
 */
router.get('/analytics', adminSubscriptionController.getSubscriptionAnalytics);

/**
 * @route GET /api/admin/subscriptions
 * @desc Get all subscriptions with pagination and filtering
 * @access Admin
 * @query { page?, limit?, status?, type? }
 */
router.get('/', adminSubscriptionController.getAllSubscriptions);

/**
 * @route POST /api/admin/subscriptions/process-cosmetics
 * @desc Manually process monthly cosmetic drops
 * @access Admin
 */
router.post('/process-cosmetics', adminSubscriptionController.processMonthlyCosmetics);

/**
 * @route GET /api/admin/subscriptions/cosmetic-drops
 * @desc Get cosmetic drop history with pagination
 * @access Admin
 * @query { page?, limit?, month?, year? }
 */
router.get('/cosmetic-drops', adminSubscriptionController.getCosmeticDropHistory);

/**
 * @route POST /api/admin/subscriptions/:id/cancel
 * @desc Cancel a subscription (admin override)
 * @access Admin
 * @body { reason?: string }
 */
router.post('/:id/cancel', adminSubscriptionController.cancelSubscription);

/**
 * @route POST /api/admin/subscriptions/grant
 * @desc Grant subscription to user (admin action)
 * @access Admin
 * @body { userId: string, type: 'vip_pass' | 'degen_pass', reason?: string }
 */
router.post('/grant', adminSubscriptionController.grantSubscription);

export default router;
