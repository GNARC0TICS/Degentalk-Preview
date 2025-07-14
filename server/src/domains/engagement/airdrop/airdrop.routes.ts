/**
 * Airdrop Routes
 *
 * Defines API endpoints for airdrop functionality
 *
 * // [REFAC-AIRDROP]
 */

import { Router } from 'express'
import type { Router as RouterType } from 'express';
import { AirdropController } from './airdrop.controller';
import { isAuthenticated as authenticate } from '../../auth/middleware/auth.middleware.js';
import { validateAmountMiddleware } from '../../wallet/wallet.validators';
import { globalErrorHandler } from '@core/errors.js';

// [REFAC-AIRDROP]
export function registerAirdropRoutes(app: Router) {
	const router: RouterType = Router();
	const airdropController = new AirdropController();

	// Apply error handling middleware
	router.use(globalErrorHandler);

	/**
	 * @route   POST /api/engagement/airdrop
	 * @desc    Process an airdrop (admin only)
	 * @access  Private (Admin)
	 */
	router.post(
		'/',
		authenticate,
		// @todo Add admin role check middleware
		validateAmountMiddleware(10), // Minimum airdrop amount
		airdropController.processAirdrop
	);

	/**
	 * @route   GET /api/engagement/airdrop/history
	 * @desc    Get airdrop history (admin only)
	 * @access  Private (Admin)
	 */
	router.get(
		'/history',
		authenticate,
		// @todo Add admin role check middleware
		airdropController.getAirdropHistory
	);

	/**
	 * @route   GET /api/engagement/airdrop/:id
	 * @desc    Get details for a specific airdrop (admin only)
	 * @access  Private (Admin)
	 */
	router.get(
		'/:airdropId',
		authenticate,
		// @todo Add admin role check middleware
		airdropController.getAirdropDetails
	);

	// @todo Add route for user-facing airdrop history - [NEEDS-CONFIRMATION] should users be able to see airdrops they've received?

	// @todo Add route for checking airdrop eligibility - [NEEDS-CONFIRMATION] do we need an endpoint to check if a user is eligible?

	// Register routes under /engagement/airdrop
	app.use('/engagement/airdrop', router);

	return router;
}
