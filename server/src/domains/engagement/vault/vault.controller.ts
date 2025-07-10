import { userService } from '@core/services/user.service';
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
import { asyncHandler } from '@core/errors';
import { logger } from '../../../core/logger';
import { VaultService } from './vault.service';
import type { EntityId } from '@shared/types/ids';
import { 
	sendSuccessResponse,
	sendErrorResponse
} from '@core/utils/transformer.helpers';
// import { VaultError, VaultErrorCodes } from './vault.errors'; // Removed as file not found and errors not used

/**
 * Controller for vault functionality
 */
export class VaultController {
	/**
	 * Lock tokens in the vault
	 */
	lockTokens = asyncHandler(async (req: Request, res: Response) => {
		const userId = (userService.getUserFromRequest(req) as any)?.id;

		if (!userId) {
			return sendErrorResponse(res, 'Authentication required', 401);
		}

		const { amount, currency, lockDurationDays, reason } = req.body;

		// Validate required fields
		if (!amount || !currency || !lockDurationDays) {
			return sendErrorResponse(res, 'Missing required fields: amount, currency, and lockDurationDays are required', 400);
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

			return sendSuccessResponse(res, result);
		} catch (error) {
			if (error instanceof WalletError) {
				return sendErrorResponse(res, error.message, error.httpStatus);
			}

			logger.error(
				'VaultController',
				`Error locking tokens: ${error instanceof Error ? error.message : String(error)}`
			); // Handle unknown error
			return sendErrorResponse(res, 'Failed to lock tokens', 500);
		}
	});

	/**
	 * Unlock tokens from the vault
	 */
	unlockTokens = asyncHandler(async (req: Request, res: Response) => {
		const userId = (userService.getUserFromRequest(req) as any)?.id;

		if (!userId) {
			return sendErrorResponse(res, 'Authentication required', 401);
		}

		const vaultLockId = req.params.id as EntityId;

		if (!vaultLockId) {
			return sendErrorResponse(res, 'Invalid vault lock ID', 400);
		}

		try {
			// Process the unlock
			const result = await vaultService.unlockTokens(vaultLockId);

			// Check if the vault lock belongs to the user
			if (result.userId !== userId) {
				return sendErrorResponse(res, 'Permission denied: You can only unlock your own vault locks', 403);
			}

			return sendSuccessResponse(res, result);
		} catch (error) {
			if (error instanceof WalletError) {
				return sendErrorResponse(res, error.message, error.httpStatus);
			}

			logger.error(
				'VaultController',
				`Error unlocking tokens: ${error instanceof Error ? error.message : String(error)}`
			); // Handle unknown error
			return sendErrorResponse(res, 'Failed to unlock tokens', 500);
		}
	});

	/**
	 * Get user's vault locks
	 */
	getUserVaultLocks = asyncHandler(async (req: Request, res: Response) => {
		const userId = (userService.getUserFromRequest(req) as any)?.id;

		if (!userId) {
			return sendErrorResponse(res, 'Authentication required', 401);
		}

		try {
			const vaultLocks = await vaultService.getUserVaultLocks(userId);

			return sendSuccessResponse(res, vaultLocks);
		} catch (error) {
			logger.error(
				'VaultController',
				`Error getting user vault locks: ${error instanceof Error ? error.message : String(error)}`
			); // Handle unknown error
			return sendErrorResponse(res, 'Failed to get vault locks', 500);
		}
	});

	/**
	 * Process automatic unlocks (admin/cron only)
	 */
	processAutomaticUnlocks = asyncHandler(async (req: Request, res: Response) => {
		const userId = (userService.getUserFromRequest(req) as any)?.id;
		const isAdmin = (userService.getUserFromRequest(req) as any)?.role === 'admin';

		if (!userId) {
			return sendErrorResponse(res, 'Authentication required', 401);
		}

		if (!isAdmin) {
			return sendErrorResponse(res, 'Permission denied: Only administrators can process automatic unlocks', 403);
		}

		try {
			const results = await vaultService.processAutomaticUnlocks();

			return sendSuccessResponse(res, {
				processedCount: results.length,
				processedLocks: results
			});
		} catch (error) {
			logger.error(
				'VaultController',
				`Error processing automatic unlocks: ${error instanceof Error ? error.message : String(error)}`
			); // Handle unknown error
			return sendErrorResponse(res, 'Failed to process automatic unlocks', 500);
		}
	});
}

// Export a singleton instance
export const vaultController = new VaultController();
