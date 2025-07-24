import { Router } from 'express'
import type { Router as RouterType } from 'express';
import { referralsController } from './referrals.controller';
import { validateRequest } from '@api/middleware/validate-request';
import { createReferralSourceSchema } from './referrals.validators';
import { adminMiddleware } from '../../admin.middleware';

const router: RouterType = Router();

/**
 * @route   POST /api/admin/referrals/sources
 * @desc    Create a new referral source
 * @access  Admin
 */
router.post(
	'/sources',
	adminMiddleware,
	validateRequest({ body: createReferralSourceSchema }),
	referralsController.createReferralSource.bind(referralsController)
);

/**
 * @route   GET /api/admin/referrals/sources
 * @desc    Get all referral sources
 * @access  Admin
 */
router.get(
	'/sources',
	adminMiddleware,
	referralsController.getAllReferralSources.bind(referralsController)
);

/**
 * @route   GET /api/admin/referrals/stats/sources
 * @desc    Get referral source statistics
 * @access  Admin
 */
router.get(
	'/stats/sources',
	adminMiddleware,
	referralsController.getReferralSourceStats.bind(referralsController)
);

/**
 * @route   GET /api/admin/referrals/stats/users
 * @desc    Get user-to-user referral statistics
 * @access  Admin
 */
router.get(
	'/stats/users',
	adminMiddleware,
	referralsController.getUserReferralStats.bind(referralsController)
);

/**
 * @route   GET /api/admin/referrals/stats/top-referrers
 * @desc    Get top referrers
 * @access  Admin
 */
router.get(
	'/stats/top-referrers',
	adminMiddleware,
	referralsController.getReferralCountByUser.bind(referralsController)
);

export default router;
