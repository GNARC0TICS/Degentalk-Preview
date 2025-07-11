/**
 * Tip Service
 *
 * This service handles tipping between users, supporting both DGT and crypto.
 *
 * // [REFAC-TIP]
 */

import { db } from '@db';
import type { UserId, TipId, TransactionId } from '@shared/types/ids';
import { users, transactions } from '@schema';
import { eq, and, sql } from 'drizzle-orm';
import { logger } from '../../../core/logger';
import { walletService, WalletService } from '../../wallet/services/wallet.service';
import { WalletError, ErrorCodes as WalletErrorCodes } from '../../../core/errors';
import { v4 as uuidv4 } from 'uuid';
import { XP_ACTION } from '../../xp/xp-actions';
import { xpService } from '../../xp/xp.service';

// Create local table definitions until we update the schema
import {
	pgTable,
	uuid,
	text,
	timestamp,
	jsonb,
	varchar,
	decimal,
	serial,
	integer
} from 'drizzle-orm/pg-core';
import { ErrorCodes } from '../../../core/errors';

// Temporary tip records table definition until it's added to the schema
const tipRecords = pgTable('tip_records', {
	id: uuid('id').primaryKey(),
	fromUserId: text('from_user_id').notNull(),
	toUserId: text('to_user_id').notNull(),
	amount: decimal('amount', { precision: 18, scale: 6 }).notNull(),
	currency: varchar('currency', { length: 10 }).notNull().default('DGT'),
	source: varchar('source', { length: 100 }),
	contextId: varchar('context_id', { length: 100 }),
	message: text('message'),
	status: varchar('status', { length: 20 }).notNull().default('completed'),
	metadata: jsonb('metadata'),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow()
});

// Temporary tip settings table definition until it's added to the schema
const tipSettings = pgTable('tip_settings', {
	id: serial('id').primaryKey(),
	minTipAmountDGT: decimal('min_tip_amount_dgt', { precision: 18, scale: 6 }),
	maxTipAmountDGT: decimal('max_tip_amount_dgt', { precision: 18, scale: 6 }),
	dailyTipLimitDGT: decimal('daily_tip_limit_dgt', { precision: 18, scale: 6 }),
	tipCooldownSeconds: integer('tip_cooldown_seconds').default(0),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow()
});

/**
 * Tip request structure
 */
export interface TipRequest {
	fromUserId: UserId;
	toUserId: UserId;
	amount: number;
	currency: string; // DGT or crypto currency code
	source: string; // forum, shoutbox, etc.
	contextId?: string; // post ID, thread ID, etc.
	message?: string;
}

/**
 * Tip response structure
 */
export interface TipResponse {
	id: string;
	fromUserId: UserId;
	toUserId: UserId;
	amount: number;
	currency: string;
	source: string;
	status: string;
	createdAt: Date;
	transactionIds?: TransactionId[];
}

/**
 * Service for handling tips between users
 */
export class TipService {
	private walletService: WalletService;

	constructor() {
		this.walletService = new WalletService();
	}

	/**
	 * Send a tip from one user to another
	 * @param request Tip request details
	 * @returns Tip response
	 */
	async sendTip(request: TipRequest): Promise<TipResponse> {
		const { fromUserId, toUserId, amount, currency, source, contextId, message } = request;

		try {
			// Validate request
			if (fromUserId === toUserId) {
				throw new WalletError('Cannot tip yourself', ErrorCodes.BAD_REQUEST);
			}

			if (amount <= 0) {
				throw new WalletError('Tip amount must be positive', ErrorCodes.BAD_REQUEST);
			}

			// Check tip settings (min/max amounts, cooldowns, etc.)
			await this.validateTipSettings(fromUserId, toUserId, amount, currency, source);

			// Process tip based on currency type
			let transactionIds: TransactionId[] = [];

			if (currency === 'DGT') {
				// Handle DGT tip using internal transfer
				const result = await walletService.transferDgt({
					fromUserId: fromUserId,
					toUserId: toUserId,
					amount: amount,
					reason: message || `Tip from user`,
					metadata: {
						source,
						contextId
					}
				});

				transactionIds = [result.id];
			} else {
				// For crypto: Not directly supported - we'd need to simulate it
				// since CCPayment likely doesn't support direct wallet-to-wallet transfers
				// without going through their system

				// TODO: Implement crypto tipping if CCPayment supports it
				throw new WalletError(
					'Cryptocurrency tipping not supported yet',
					ErrorCodes.OPERATION_NOT_ALLOWED
				);
			}

			// Record the tip in the tipRecords table
			const [tipRecord] = await db
				.insert(tipRecords)
				.values({
					fromUserId,
					toUserId,
					amount,
					currency,
					source,
					contextId,
					message,
					status: 'completed',
					metadata: {
						transactionIds,
						timestamp: new Date().toISOString()
					},
					createdAt: new Date(),
					updatedAt: new Date()
				})
				.returning();

			// Update user tip statistics (if needed)
			// This could track tips given/received for achievements, etc.

			return {
				id: tipRecord.id as string,
				fromUserId,
				toUserId,
				amount,
				currency,
				source,
				status: 'completed',
				createdAt: tipRecord.createdAt,
				transactionIds
			};
		} catch (error: unknown) {
			if (error instanceof WalletError) {
				throw error;
			}
			const errorMessage = error instanceof Error ? error.message : String(error);
			logger.error('TipService', `Error sending tip: ${errorMessage}`);
			throw new WalletError(
				`Failed to send tip: ${errorMessage}`,
				ErrorCodes.WALLET_TRANSACTION_FAILED
			);
		}
	}

	/**
	 * Validate tip settings, including limits and cooldowns
	 */
	private async validateTipSettings(
		fromUserId: UserId,
		toUserId: UserId,
		amount: number,
		currency: string,
		source: string
	): Promise<void> {
		// Get global tip settings
		const [settings] = await db.select().from(tipSettings).limit(1);

		if (!settings) {
			return; // No restrictions if settings don't exist
		}

		// Check minimum tip amount
		if (currency === 'DGT' && settings.minTipAmountDGT && amount < Number(settings.minTipAmountDGT)) {
			throw new WalletError(
				`Minimum DGT tip amount is ${settings.minTipAmountDGT}`,
				ErrorCodes.BAD_REQUEST
			);
		}

		// Check maximum tip amount
		if (currency === 'DGT' && settings.maxTipAmountDGT && amount > Number(settings.maxTipAmountDGT)) {
			throw new WalletError(
				`Maximum DGT tip amount is ${settings.maxTipAmountDGT}`,
				ErrorCodes.BAD_REQUEST
			);
		}

		// Check daily limit
		if (settings.dailyTipLimitDGT && currency === 'DGT') {
			const todayStart = new Date();
			todayStart.setHours(0, 0, 0, 0);

			// Get sum of tips sent today
			const [dailyTotal] = await db
				.select({
					total: sql`SUM(amount)`
				})
				.from(tipRecords).where(sql`
        from_user_id = ${fromUserId} 
        AND currency = 'DGT'
        AND created_at >= ${todayStart.toISOString()}
      `);

			const totalSentToday = Number(dailyTotal.total) || 0;

			if (totalSentToday + amount > Number(settings.dailyTipLimitDGT)) {
				throw new WalletError(
					`Daily DGT tip limit of ${settings.dailyTipLimitDGT} would be exceeded`,
					ErrorCodes.RATE_LIMITED
				);
			}
		}

		// Check cooldown period
		if (settings.tipCooldownSeconds > 0) {
			const cooldownTime = new Date();
			cooldownTime.setSeconds(cooldownTime.getSeconds() - settings.tipCooldownSeconds);

			// Check if user has sent a tip recently
			const [recentTip] = await db
				.select()
				.from(tipRecords)
				.where(
					and(
						eq(tipRecords.fromUserId, fromUserId),
						eq(tipRecords.toUserId, toUserId),
						sql`${tipRecords.createdAt} >= ${cooldownTime.toISOString()}`
					)
				)
				.limit(1);

			if (recentTip) {
				const nextAllowedTime = new Date(recentTip.createdAt);
				nextAllowedTime.setSeconds(nextAllowedTime.getSeconds() + settings.tipCooldownSeconds);

				throw new WalletError(
					`Tip cooldown in effect. You can tip this user again at ${nextAllowedTime.toISOString()}`,
					ErrorCodes.RATE_LIMITED,
					{ nextAllowedTime }
				);
			}
		}
	}

	/**
	 * Get tip history for a user (sent or received)
	 */
	async getTipHistory(
		userId: UserId,
		type: 'sent' | 'received' | 'both' = 'both',
		limit: number = 20,
		offset: number = 0
	): Promise<{
		tips: any[];
		total: number;
	}> {
		try {
			let whereClause;

			if (type === 'sent') {
				whereClause = eq(tipRecords.fromUserId, userId);
			} else if (type === 'received') {
				whereClause = eq(tipRecords.toUserId, userId);
			} else {
				// 'both' - either sent or received
				whereClause = sql`
          ${tipRecords.fromUserId} = ${userId} OR ${tipRecords.toUserId} = ${userId}
        `;
			}

			const tips = await db
				.select()
				.from(tipRecords)
				.where(whereClause)
				.orderBy(sql`${tipRecords.createdAt} DESC`)
				.limit(limit)
				.offset(offset);

			const [{ count }] = await db
				.select({
					count: sql`COUNT(*)`
				})
				.from(tipRecords)
				.where(whereClause);

			return {
				tips,
				total: Number(count)
			};
		} catch (error: unknown) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			logger.error('TipService', `Error getting tip history: ${errorMessage}`);
			throw new WalletError(
				`Failed to get tip history: ${errorMessage}`,
				ErrorCodes.SERVER_ERROR
			);
		}
	}
}

// Export a singleton instance
export const tipService = new TipService();
