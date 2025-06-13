/**
 * Vault Controller
 *
 * Handles HTTP requests related to token vaulting functionality
 *
 * // [REFAC-VAULT]
 */

import type { Request, Response } from 'express';
import { vaultService, VaultLockOptions } from './vault.service';
import { WalletError, ErrorCodes } from '../../../core/errors'; // Changed WalletErrorCodes to ErrorCodes
import { asyncHandler } from '@server/src/core/errors';
import { logger } from '../../../core/logger';
import { VaultService } from './vault.service';
// import { VaultError, VaultErrorCodes } from './vault.errors'; // Removed as file not found and errors not used

/**
 * Controller for vault functionality
 */
export class VaultController {
	/**
	 * Lock tokens in the vault
	 */
	lockTokens = asyncHandler(async (req: Request, res: Response) => {
		const userId = (req.user as any)?.id;

		if (!userId) {
			return res.status(401).json({
				error: 'Authentication required',
				code: ErrorCodes.UNAUTHORIZED // Changed
			});
		}

		const { amount, currency, lockDurationDays, reason } = req.body;

		// Validate required fields
		if (!amount || !currency || !lockDurationDays) {
			return res.status(400).json({
				error: 'Missing required fields',
				code: ErrorCodes.INVALID_REQUEST, // Changed
				details: 'amount, currency, and lockDurationDays are required'
			});
		}

		// Create lock options
		const lockOptions: VaultLockOptions = {
			userId,
			amount: parseFloat(amount),
			currency,
			lockDurationDays: parseInt(lockDurationDays),
			reason
		};

		try {
			// Process the lock
			const result = await vaultService.lockTokens(lockOptions);

			return res.status(200).json({
				success: true,
				data: result
			});
		} catch (error) {
			if (error instanceof WalletError) {
				return res.status(error.httpStatus).json({
					// Changed statusCode to httpStatus
					error: error.message,
					code: error.code,
					details: error.details
				});
			}

			logger.error(
				'VaultController',
				`Error locking tokens: ${error instanceof Error ? error.message : String(error)}`
			); // Handle unknown error
			return res.status(500).json({
				error: 'Failed to lock tokens',
				code: ErrorCodes.OPERATION_FAILED // Changed
			});
		}
	});

	/**
	 * Unlock tokens from the vault
	 */
	unlockTokens = asyncHandler(async (req: Request, res: Response) => {
		const userId = (req.user as any)?.id;

		if (!userId) {
			return res.status(401).json({
				error: 'Authentication required',
				code: ErrorCodes.UNAUTHORIZED // Changed
			});
		}

		const vaultLockId = parseInt(req.params.id);

		if (!vaultLockId) {
			return res.status(400).json({
				error: 'Invalid vault lock ID',
				code: ErrorCodes.INVALID_REQUEST // Changed
			});
		}

		try {
			// Process the unlock
			const result = await vaultService.unlockTokens(vaultLockId);

			// Check if the vault lock belongs to the user
			if (result.userId !== userId) {
				return res.status(403).json({
					error: 'Permission denied',
					code: ErrorCodes.FORBIDDEN, // Changed
					details: 'You can only unlock your own vault locks'
				});
			}

			return res.status(200).json({
				success: true,
				data: result
			});
		} catch (error) {
			if (error instanceof WalletError) {
				return res.status(error.httpStatus).json({
					// Changed statusCode to httpStatus
					error: error.message,
					code: error.code,
					details: error.details
				});
			}

			logger.error(
				'VaultController',
				`Error unlocking tokens: ${error instanceof Error ? error.message : String(error)}`
			); // Handle unknown error
			return res.status(500).json({
				error: 'Failed to unlock tokens',
				code: ErrorCodes.OPERATION_FAILED // Changed
			});
		}
	});

	/**
	 * Get user's vault locks
	 */
	getUserVaultLocks = asyncHandler(async (req: Request, res: Response) => {
		const userId = (req.user as any)?.id;

		if (!userId) {
			return res.status(401).json({
				error: 'Authentication required',
				code: ErrorCodes.UNAUTHORIZED // Changed
			});
		}

		try {
			const vaultLocks = await vaultService.getUserVaultLocks(userId);

			return res.status(200).json({
				success: true,
				data: vaultLocks
			});
		} catch (error) {
			logger.error(
				'VaultController',
				`Error getting user vault locks: ${error instanceof Error ? error.message : String(error)}`
			); // Handle unknown error
			return res.status(500).json({
				error: 'Failed to get vault locks',
				code: ErrorCodes.OPERATION_FAILED // Changed
			});
		}
	});

	/**
	 * Process automatic unlocks (admin/cron only)
	 */
	processAutomaticUnlocks = asyncHandler(async (req: Request, res: Response) => {
		const userId = (req.user as any)?.id;
		const isAdmin = (req.user as any)?.role === 'admin';

		if (!userId) {
			return res.status(401).json({
				error: 'Authentication required',
				code: ErrorCodes.UNAUTHORIZED // Changed
			});
		}

		if (!isAdmin) {
			return res.status(403).json({
				error: 'Permission denied',
				code: ErrorCodes.FORBIDDEN, // Changed
				details: 'Only administrators can process automatic unlocks'
			});
		}

		try {
			const results = await vaultService.processAutomaticUnlocks();

			return res.status(200).json({
				success: true,
				data: {
					processedCount: results.length,
					processedLocks: results
				}
			});
		} catch (error) {
			logger.error(
				'VaultController',
				`Error processing automatic unlocks: ${error instanceof Error ? error.message : String(error)}`
			); // Handle unknown error
			return res.status(500).json({
				error: 'Failed to process automatic unlocks',
				code: ErrorCodes.OPERATION_FAILED // Changed
			});
		}
	});
}

// Export a singleton instance
export const vaultController = new VaultController();
