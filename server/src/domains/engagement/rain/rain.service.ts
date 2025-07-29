/**
 * Rain Service
 *
 * This service handles the "making it rain" functionality in the shoutbox,
 * which distributes tokens to random active users in the platform.
 *
 * // [MOVED-FROM: server/services/rain-service.ts]
 * // [REFAC-RAIN]
 */

import { db } from '@db';
import type { UserId } from '@shared/types/ids';
import {
	transactions,
	users,
	rainSettings,
	onlineUsers,
	cooldownSettings,
	rainEvents
} from '@schema';
import { eq, and, gt, sql, desc, inArray } from 'drizzle-orm';
import { logger } from '@core/logger';
import { WalletError, ErrorCodes as WalletErrorCodes } from '@core/errors';
import { walletService } from '../../wallet/services/wallet.service';
import { vanitySinkAnalyzer } from '../../shop/services/vanity-sink.analyzer';
import type { ActionId } from '@shared/types/ids';

// Constants
const MIN_RAIN_AMOUNT_DGT = 10; // Minimum rain amount for DGT
const MIN_RAIN_AMOUNT_CRYPTO = 1; // Minimum rain amount for crypto
const MAX_RECIPIENTS = 15; // Maximum number of recipients

/**
 * Service for handling "rain" functionality (distributing tokens to random active users)
 */
export class RainService {
	/**
	 * Process a rain distribution to random active users
	 * @param senderUserId - ID of the user sending the rain
	 * @param amount - Amount to distribute
	 * @param currency - Currency to distribute (DGT or crypto)
	 * @param userCount - Number of users to receive the rain
	 * @param source - Source of the rain (e.g., shoutbox, admin)
	 * @returns Rain transaction details
	 */
	async processRain(
		senderUserId: UserId,
		amount: number,
		currency: string,
		userCount: number,
		source: string = 'shoutbox'
	): Promise<{
		transactionId: ActionId;
		amount: number;
		currency: string;
		perUserAmount: number;
		recipients: Array<{ id: UserId; username: string }>;
	}> {
		try {
			logger.info('RainService', `Processing rain from user ${senderUserId}`, {
				amount,
				currency,
				userCount,
				source
			});

			// Validate rain settings
			const settings = await this.getRainSettings();

			// Check if rain is enabled
			if (!settings.enabled) {
				throw new WalletError(
					'Rain feature is currently disabled',
					400,
					WalletErrorCodes.SERVICE_UNAVAILABLE
				);
			}

			// Validate user count
			if (userCount < 1 || userCount > MAX_RECIPIENTS) {
				throw new WalletError(
					`User count must be between 1 and ${MAX_RECIPIENTS}`,
					400,
					WalletErrorCodes.INVALID_PARAMETERS,
					{ min: 1, max: MAX_RECIPIENTS, provided: userCount }
				);
			}

			// Get sender user info
			const [sender] = await db
				.select({
					id: users.id,
					username: users.username,
					dgtWalletBalance: users.dgtWalletBalance,
					groupId: users.groupId
				})
				.from(users)
				.where(eq(users.id, senderUserId))
				.limit(1);

			if (!sender) {
				throw new WalletError('Sender not found', 404, WalletErrorCodes.USER_NOT_FOUND);
			}

			// Check cooldowns
			await this.checkCooldowns(senderUserId, 'rain');

			// Validate amount based on currency
			const minAmount = currency === 'DGT' ? settings.minAmountDGT : settings.minAmountCrypto;
			if (amount < minAmount) {
				throw new WalletError(
					`Minimum rain amount for ${currency} is ${minAmount}`,
					400,
					WalletErrorCodes.INVALID_AMOUNT,
					{ minAmount, providedAmount: amount }
				);
			}

			// Check user's balance
			if (currency === 'DGT') {
				if (sender.dgtWalletBalance < amount) {
					throw new WalletError(
						'Insufficient DGT balance',
						400,
						WalletErrorCodes.INSUFFICIENT_FUNDS,
						{ required: amount, available: sender.dgtWalletBalance }
					);
				}
			} else {
				// For crypto currencies, we need to check CCPayment balance
				const balance = await walletService.getBalance(senderUserId);
				const cryptoBalance = balance.crypto.find((b) => b.currency === currency);

				if (!cryptoBalance || cryptoBalance.available < amount) {
					throw new WalletError(
						`Insufficient ${currency} balance`,
						400,
						WalletErrorCodes.INSUFFICIENT_FUNDS,
						{
							required: amount,
							available: cryptoBalance ? cryptoBalance.available : 0
						}
					);
				}
			}

			// Get random active users
			const recipients = await this.getRandomActiveUsers(senderUserId, userCount);
			if (recipients.length === 0) {
				throw new WalletError(
					'No active users found to receive rain',
					400,
					WalletErrorCodes.INVALID_PARAMETERS
				);
			}

			// Calculate per-user amount
			const recipientCount = recipients.length;
			const perUserAmount = amount / recipientCount;

			// Record the transaction
			const [rainTransaction] = await db
				.insert(transactions)
				.values({
					userId: senderUserId,
					fromUserId: senderUserId,
					amount,
					type: 'RAIN',
					status: 'confirmed',
					description: `Rain to ${recipientCount} users`,
					currency: currency,
					metadata: {
						recipientCount,
						perUserAmount,
						currency,
						source,
						timestamp: new Date().toISOString()
					},
					createdAt: new Date(),
					updatedAt: new Date()
				})
				.returning();

			// Record the rain event
			await db.insert(rainEvents).values({
				userId: senderUserId,
				amount,
				currency,
				recipientCount,
				transactionId: rainTransaction.id,
				source,
				createdAt: new Date(),
				metadata: {
					perUserAmount,
					timestamp: new Date().toISOString()
				}
			});

			// Process the rain distribution
			if (currency === 'DGT') {
				await this.processDGTRain(
					senderUserId,
					amount,
					perUserAmount,
					recipients,
					rainTransaction.id
				);

				// Track DGT burn for vanity sink analysis
				await vanitySinkAnalyzer.trackBurn({
					userId: senderUserId,
					orderId: rainTransaction.id,
					dgtBurned: amount,
					burnType: 'event',
					source: 'rain',
					userLevel: 1, // TODO: Get actual user level
					userLifetimeSpent: 0, // TODO: Get actual lifetime spending
					metadata: {
						recipientCount,
						perUserAmount,
						source,
						burnReason: 'rain_distribution'
					}
				});
			} else {
				// For crypto, we don't currently support direct transfers
				// Instead, we could convert to DGT or implement when CCPayment supports it
				throw new WalletError(
					`Cryptocurrency rain is not supported yet`,
					400,
					WalletErrorCodes.INVALID_PARAMETERS
				);
			}

			// Update user's last rain timestamp for cooldown
			await this.updateLastCommandTime(senderUserId, 'rain');

			logger.info(
				'RainService',
				`Rain completed: User ${senderUserId} -> ${recipientCount} users`,
				{
					amount,
					currency,
					transactionId: rainTransaction.id
				}
			);

			// Return the recipient list with usernames
			const recipientDetails = await db
				.select({
					id: users.id,
					username: users.username
				})
				.from(users)
				.where(inArray(users.id, recipients));

			return {
				transactionId: rainTransaction.id,
				amount,
				currency,
				perUserAmount,
				recipients: recipientDetails
			};
		} catch (error) {
			if (error instanceof WalletError) {
				throw error;
			}

			logger.error('RainService', `Error processing rain: ${error.message}`);

			throw new WalletError(
				`Failed to process rain: ${error.message}`,
				500,
				WalletErrorCodes.TRANSACTION_FAILED,
				{ originalError: error.message }
			);
		}
	}

	/**
	 * Process DGT rain by using dgtService for transfers
	 */
	private async processDGTRain(
		senderUserId: UserId,
		totalAmount: number,
		perUserAmount: number,
		recipientIds: UserId[],
		transactionId: ActionId
	): Promise<void> {
		// Process rain for each recipient individually
		for (const recipientId of recipientIds) {
			// Use walletService to handle the transfer
			await walletService.transferDgt({
				from: senderUserId,
				to: recipientId,
				amount: perUserAmount,
				reason: `Rain distribution`,
				metadata: {
					parentTransactionId: transactionId,
					isRain: true
				}
			});
		}
	}

	/**
	 * Get random active users to receive the rain
	 */
	private async getRandomActiveUsers(excludeUserId: UserId, count: number): Promise<UserId[]> {
		// First try to get users who are online in the last 5 minutes
		const fiveMinutesAgo = new Date();
		fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);

		const onlineUserResults = await db
			.select({
				userId: onlineUsers.userId
			})
			.from(onlineUsers)
			.where(
				and(
					gt(onlineUsers.lastActive, fiveMinutesAgo),
					sql`${onlineUsers.userId} != ${excludeUserId}`
				)
			)
			.limit(count * 2); // Get more than needed to randomize

		let userIds = onlineUserResults.map((u) => u.userId);

		// If not enough online users, get most recently active users
		if (userIds.length < count) {
			const additionalUsers = await db
				.select({
					id: users.id
				})
				.from(users)
				.where(
					and(
						sql`${users.id} != ${excludeUserId}`,
						sql`${users.id} NOT IN (${userIds.length > 0 ? userIds.join(',') : '0'})`
					)
				)
				.orderBy(desc(users.lastActive))
				.limit(count - userIds.length);

			userIds = [...userIds, ...additionalUsers.map((u) => u.id)];
		}

		// Shuffle and take only what's needed
		return this.shuffleArray(userIds).slice(0, count);
	}

	/**
	 * Get rain settings from database or use defaults
	 */
	private async getRainSettings() {
		const settingsResult = await db.select().from(rainSettings).limit(1);

		if (settingsResult.length > 0) {
			return settingsResult[0];
		}

		// Return default settings if none in database
		return {
			enabled: true,
			minAmountDGT: MIN_RAIN_AMOUNT_DGT,
			minAmountCrypto: MIN_RAIN_AMOUNT_CRYPTO,
			maxRecipients: MAX_RECIPIENTS,
			cooldownSeconds: 60
		};
	}

	/**
	 * Shuffle an array using Fisher-Yates algorithm
	 */
	private shuffleArray<T>(array: T[]): T[] {
		const result = [...array];
		for (let i = result.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[result[i], result[j]] = [result[j], result[i]];
		}
		return result;
	}

	/**
	 * Check if the user is on cooldown for a command
	 * @param userId - User ID
	 * @param commandType - 'tip' or 'rain'
	 */
	private async checkCooldowns(userId: UserId, commandType: 'tip' | 'rain'): Promise<void> {
		try {
			// Get user to check group (admin/mod for bypass)
			const [user] = await db
				.select({
					id: users.id,
					groupId: users.groupId
				})
				.from(users)
				.where(eq(users.id, userId))
				.limit(1);

			if (!user) {
				throw new WalletError('User not found', 404, WalletErrorCodes.USER_NOT_FOUND);
			}

			// Get cooldown settings
			const [cooldownSetting] = await db.select().from(cooldownSettings).limit(1);

			if (!cooldownSetting) {
				// No cooldown settings, allow the command
				return;
			}

			// Check if user can bypass cooldowns
			const { canUser } = await import('@lib/auth/canUser');
			const isAdmin = await canUser(user as any, 'canViewAdminPanel');
			const isModerator = await canUser(user as any, 'canModerateChat');

			if (
				(isAdmin && cooldownSetting.adminBypassCooldown) ||
				(isModerator && cooldownSetting.moderatorBypassCooldown)
			) {
				// User can bypass cooldowns
				return;
			}

			// Get user's last command time
			const [lastCommand] = await db.execute(sql`
        SELECT command_type, executed_at 
        FROM user_commands 
        WHERE user_id = ${userId} AND command_type = ${commandType}
        ORDER BY executed_at DESC 
        LIMIT 1
      `);

			if (!lastCommand) {
				// No previous command, allow this one
				return;
			}

			// Calculate cooldown time
			const cooldownSeconds =
				commandType === 'tip'
					? cooldownSetting.tipCooldownSeconds
					: cooldownSetting.rainCooldownSeconds;

			if (cooldownSeconds <= 0) {
				// Cooldowns disabled for this command
				return;
			}

			const lastCommandTime = new Date(lastCommand.executed_at).getTime();
			const currentTime = Date.now();
			const elapsedSeconds = (currentTime - lastCommandTime) / 1000;

			if (elapsedSeconds < cooldownSeconds) {
				const remainingSeconds = Math.ceil(cooldownSeconds - elapsedSeconds);
				throw new WalletError(
					`Please wait ${remainingSeconds} seconds before using the ${commandType} command again`,
					429,
					WalletErrorCodes.RATE_LIMITED,
					{
						cooldownSeconds,
						remainingSeconds,
						commandType
					}
				);
			}
		} catch (error) {
			// Only rethrow WalletError
			if (error instanceof WalletError) {
				throw error;
			}

			// Log other errors but don't block the command
			logger.error('Error checking cooldowns:', error);
		}
	}

	/**
	 * Update user's last command time
	 * @param userId - User ID
	 * @param commandType - 'tip' or 'rain'
	 */
	private async updateLastCommandTime(userId: UserId, commandType: 'tip' | 'rain'): Promise<void> {
		try {
			await db.execute(sql`
        INSERT INTO user_commands (user_id, command_type, executed_at)
        VALUES (${userId}, ${commandType}, NOW())
      `);
		} catch (error) {
			// Log error but don't block the command
			logger.error('Error updating last command time:', error);
		}
	}

	/**
	 * Get recent rain events
	 * @param limit Maximum number of events to return
	 * @param offset Offset for pagination
	 * @returns List of recent rain events
	 */
	async getRecentRainEvents(limit = 10, offset = 0) {
		try {
			// Query rain events with user information
			const events = await db
				.select({
					id: rainEvents.id,
					amount: rainEvents.amount,
					currency: rainEvents.currency,
					recipientCount: rainEvents.recipientCount,
					transactionId: rainEvents.transactionId,
					createdAt: rainEvents.createdAt,
					source: rainEvents.source,
					userId: rainEvents.userId,
					username: users.username,
					avatarUrl: users.avatarUrl
				})
				.from(rainEvents)
				.leftJoin(users, eq(rainEvents.userId, users.id))
				.orderBy(desc(rainEvents.createdAt))
				.limit(limit)
				.offset(offset);

			return events;
		} catch (error) {
			logger.error('RainService', `Error fetching rain events: ${error.message}`);
			throw new Error(`Failed to fetch rain events: ${error.message}`);
		}
	}

	/**
	 * Update rain settings
	 * @param userId ID of the admin user making the update
	 * @param settings Settings to update
	 * @returns Updated settings
	 */
	async updateRainSettings(userId: UserId, settings: any) {
		try {
			// First check if settings exist
			const existingSettings = await db.select().from(rainSettings).limit(1);

			if (existingSettings.length > 0) {
				// Update existing settings
				const [updated] = await db
					.update(rainSettings)
					.set({
						...settings,
						updatedAt: new Date()
					})
					.where(eq(rainSettings.id, existingSettings[0].id))
					.returning();

				return updated;
			} else {
				// Create new settings record
				const [created] = await db
					.insert(rainSettings)
					.values({
						enabled: settings.minAmount !== undefined ? true : true,
						minAmountDGT: settings.minAmount || MIN_RAIN_AMOUNT_DGT,
						minAmountCrypto: settings.minAmount || MIN_RAIN_AMOUNT_CRYPTO,
						maxRecipients: settings.maxEligibleUsers || MAX_RECIPIENTS,
						cooldownSeconds: settings.cooldownMinutes ? settings.cooldownMinutes * 60 : 60,
						createdAt: new Date(),
						updatedAt: new Date()
					})
					.returning();

				return created;
			}
		} catch (error) {
			logger.error('RainService', `Error updating rain settings: ${error.message}`);
			throw new Error(`Failed to update rain settings: ${error.message}`);
		}
	}
}

// Export a singleton instance
export const rainService = new RainService();
