/**
 * Engagement Service
 *
 * [REFAC-ENGAGEMENT]
 *
 * This service orchestrates interactions between different engagement subdomains:
 * - tip: User-to-user tipping functionality
 * - rain: Distribution of DGT to multiple users
 * - airdrop: Admin-distributed DGT rewards
 * - vault: Time-locked DGT storage
 */

import { logger } from '../../../core/logger';
import type { UserId } from '@db/types';
import { db } from '@db';
import { dgtService } from '../wallet/dgt.service';
import { tipService } from './tip/tip.service';
import { rainService } from './rain/rain.service';
import { airdropService } from './airdrop/airdrop.service';
import { WalletError, WalletErrorCodes } from '../../../core/errors';
import { vaultService } from './vault/vault.service';
import type { AdminUserId } from '@/db/types';

/**
 * Engagement service for orchestrating social engagement features
 */
export class EngagementService {
	/**
	 * Process a user tip
	 *
	 * @param fromUserId The user sending the tip
	 * @param toUserId The user receiving the tip
	 * @param amount Amount of DGT to tip
	 * @param reason Optional reason for the tip
	 * @param contentReference Optional content reference (post/thread ID)
	 */
	async processTip(
		fromUserId: UserId,
		toUserId: UserId,
		amount: bigint,
		reason?: string,
		contentReference?: {
			type: 'post' | 'thread' | 'reply';
			id: number;
		}
	) {
		try {
			return await tipService.processTip(fromUserId, toUserId, amount, reason, contentReference);
		} catch (error) {
			logger.error('Error processing tip:', error);

			if (error instanceof WalletError) {
				throw error;
			}

			throw new WalletError('Failed to process tip', 500, WalletErrorCodes.UNKNOWN_ERROR, {
				originalError: error.message
			});
		}
	}

	/**
	 * Process a rain distribution
	 *
	 * @param fromUserId The user initiating the rain
	 * @param amount Total amount of DGT to distribute
	 * @param recipientCount Number of users to receive the rain
	 * @param channelId Optional channel ID for targeting
	 */
	async processRain(
		fromUserId: UserId,
		amount: bigint,
		recipientCount: number,
		channelId?: number
	) {
		try {
			return await rainService.processRain(fromUserId, amount, recipientCount, channelId);
		} catch (error) {
			logger.error('Error processing rain:', error);

			if (error instanceof WalletError) {
				throw error;
			}

			throw new WalletError('Failed to process rain', 500, WalletErrorCodes.UNKNOWN_ERROR, {
				originalError: error.message
			});
		}
	}

	/**
	 * Process an airdrop
	 *
	 * @param adminUserId The admin initiating the airdrop
	 * @param targetUserIds Array of user IDs to receive the airdrop
	 * @param amount Amount of DGT per user
	 * @param reason Reason for the airdrop
	 */
	async processAirdrop(
		adminUserId: AdminUserId,
		targetUserIds: UserId[],
		amount: bigint,
		reason: string
	) {
		try {
			return await airdropService.processAirdrop(adminUserId, targetUserIds, amount, reason);
		} catch (error) {
			logger.error('Error processing airdrop:', error);

			if (error instanceof WalletError) {
				throw error;
			}

			throw new WalletError('Failed to process airdrop', 500, WalletErrorCodes.UNKNOWN_ERROR, {
				originalError: error.message
			});
		}
	}

	/**
	 * Get user's engagement statistics
	 *
	 * @param userId User ID
	 */
	async getUserEngagementStats(userId: UserId) {
		try {
			// Get tip stats
			const tipStats = await tipService.getUserTipStats(userId);

			// Get rain stats
			const rainStats = await rainService.getUserRainStats(userId);

			// Get airdrop stats
			const airdropStats = await airdropService.getUserAirdropStats(userId);

			// Combine stats
			return {
				tip: tipStats,
				rain: rainStats,
				airdrop: airdropStats,
				// Summary data
				totalSent: tipStats.totalSent + rainStats.totalSent + airdropStats.totalSent,
				totalReceived:
					tipStats.totalReceived + rainStats.totalReceived + airdropStats.totalReceived,
				transactionCount:
					tipStats.transactionCount + rainStats.transactionCount + airdropStats.transactionCount
			};
		} catch (error) {
			logger.error('Error getting user engagement stats:', error);

			if (error instanceof WalletError) {
				throw error;
			}

			throw new WalletError(
				'Failed to get user engagement stats',
				500,
				WalletErrorCodes.UNKNOWN_ERROR,
				{ originalError: error.message }
			);
		}
	}
}

// Export a singleton instance
export const engagementService = new EngagementService();
