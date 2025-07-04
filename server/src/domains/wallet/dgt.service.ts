/**
 * DGT Service
 *
 * Handles all DGT (Degentalk Token) operations including crediting, debiting,
 * transfers, and balance management. Integrates with existing economy system.
 */

import { db } from '@db';
import { wallets, transactions, users } from '@schema';
import { eq, and, sql, desc } from 'drizzle-orm';
import { walletConfigService } from './wallet-config.service';
import type { ItemId, ActionId, WalletId, TransactionId, DgtAmount, UserId } from '@shared/types';

export interface DGTTransactionMetadata {
	source:
		| 'crypto_deposit'
		| 'shop_purchase'
		| 'tip_send'
		| 'tip_receive'
		| 'rain_send'
		| 'rain_receive'
		| 'admin_credit'
		| 'admin_debit'
		| 'internal_transfer_send'
		| 'internal_transfer_receive'
		| 'xp_boost'
		| 'manual_credit';
	originalToken?: string;
	usdtAmount?: string;
	depositRecordId?: string;
	tipId?: string;
	rainId?: string;
	shopItemId?: string;
	transferId?: string;
	adminUserId?: string;
	reason?: string;
	metadata?: Record<string, any>;
}

export interface DGTBalance {
	userId: UserId;
	balance: DgtAmount;
	lastTransactionAt: Date | null;
	walletId: WalletId;
}

export interface DGTTransaction {
	id: TransactionId;
	userId: UserId;
	amount: DgtAmount;
	type: string;
	balanceAfter: number;
	metadata: DGTTransactionMetadata;
	createdAt: Date;
}

export interface DGTTransferResult {
	transactionId: ActionId;
	fromBalance: number;
	toBalance: number;
	transferId: string;
}

/**
 * DGT Service Class
 */
export class DGTService {
	/**
	 * Get user's DGT balance
	 */
	async getDGTBalance(userId: string): Promise<DGTBalance> {
		try {
			// Get user's DGT wallet
			const wallet = await db.select().from(wallets).where(eq(wallets.userId, userId)).limit(1);

			if (wallet.length === 0) {
				// Create wallet if it doesn't exist
				await this.createDGTWallet(userId);
				return {
					userId,
					balance: 0,
					lastTransactionAt: null,
					walletId: 0
				};
			}

			const userWallet = wallet[0];
			return {
				userId,
				balance: userWallet.balance,
				lastTransactionAt: userWallet.lastTransaction,
				walletId: userWallet.id
			};
		} catch (error) {
			console.error('Error getting DGT balance:', error);
			throw new Error('Failed to retrieve DGT balance');
		}
	}

	/**
	 * Credit DGT to user's account
	 */
	async creditDGT(
		userId: string,
		amount: number,
		metadata: DGTTransactionMetadata
	): Promise<DGTTransaction> {
		if (amount <= 0) {
			throw new Error('Credit amount must be positive');
		}

		try {
			const config = await walletConfigService.getConfig();

			// Get or create user wallet
			await this.ensureDGTWallet(userId);
			const walletData = await this.getDGTBalance(userId);

			// Check max balance limit
			const newBalance = walletData.balance + amount;
			if (newBalance > config.dgt.maxDGTBalance) {
				throw new Error(
					`Transaction would exceed maximum DGT balance limit of ${config.dgt.maxDGTBalance}`
				);
			}

			// Start transaction
			const result = await db.transaction(async (tx) => {
				// Update wallet balance
				await tx
					.update(wallets)
					.set({
						balance: newBalance,
						lastTransaction: new Date()
					})
					.where(eq(wallets.userId, userId));

				// Create transaction record
				const [transaction] = await tx
					.insert(transactions)
					.values({
						userId: userId,
						walletId: walletData.walletId,
						amount: Math.round(amount * 100), // Store in cents for precision
						type: this.getTransactionType(metadata.source),
						status: 'confirmed',
						description: this.getTransactionDescription(metadata),
						metadata: metadata as any,
						createdAt: new Date(),
						updatedAt: new Date()
					})
					.returning();

				return transaction;
			});

			console.log(`DGT credited: ${amount} DGT to user ${userId} (${metadata.source})`);

			return {
				id: result.id,
				userId,
				amount,
				type: result.type,
				balanceAfter: newBalance,
				metadata,
				createdAt: result.createdAt
			};
		} catch (error) {
			console.error('Error crediting DGT:', error);
			const err = error as Error;
			throw new Error(`Failed to credit DGT: ${err.message}`);
		}
	}

	/**
	 * Debit DGT from user's account
	 */
	async debitDGT(
		userId: string,
		amount: number,
		metadata: DGTTransactionMetadata
	): Promise<DGTTransaction> {
		if (amount <= 0) {
			throw new Error('Debit amount must be positive');
		}

		try {
			// Get user balance
			const walletData = await this.getDGTBalance(userId);

			// Check sufficient balance
			if (walletData.balance < amount) {
				throw new Error(
					`Insufficient DGT balance. Available: ${walletData.balance}, Required: ${amount}`
				);
			}

			const newBalance = walletData.balance - amount;

			// Start transaction
			const result = await db.transaction(async (tx) => {
				// Update wallet balance
				await tx
					.update(wallets)
					.set({
						balance: newBalance,
						lastTransaction: new Date()
					})
					.where(eq(wallets.userId, userId));

				// Create transaction record
				const [transaction] = await tx
					.insert(transactions)
					.values({
						userId: userId,
						walletId: walletData.walletId,
						amount: -Math.round(amount * 100), // Negative for debit, store in cents
						type: this.getTransactionType(metadata.source),
						status: 'confirmed',
						description: this.getTransactionDescription(metadata),
						metadata: metadata as any,
						createdAt: new Date(),
						updatedAt: new Date()
					})
					.returning();

				return transaction;
			});

			console.log(`DGT debited: ${amount} DGT from user ${userId} (${metadata.source})`);

			return {
				id: result.id,
				userId,
				amount: -amount, // Return negative for debit
				type: result.type,
				balanceAfter: newBalance,
				metadata,
				createdAt: result.createdAt
			};
		} catch (error) {
			console.error('Error debiting DGT:', error);
			const err = error as Error;
			throw new Error(`Failed to debit DGT: ${err.message}`);
		}
	}

	/** @deprecated – use debitDGT */
	async deductDGT(...args: Parameters<this['debitDGT']>): Promise<ReturnType<this['debitDGT']>> {
		// eslint-disable-next-line prefer-spread
		return this.debitDGT.apply(this, args as any);
	}

	/**
	 * Transfer DGT between users
	 */
	async transferDGT(
		fromUserId: string,
		toUserId: string,
		amount: number,
		note?: string
	): Promise<DGTTransferResult> {
		if (amount <= 0) {
			throw new Error('Transfer amount must be positive');
		}

		if (fromUserId === toUserId) {
			throw new Error('Cannot transfer DGT to yourself');
		}

		try {
			const config = await walletConfigService.getConfig();

			// Check if transfers are allowed
			if (!config.features.allowInternalTransfers) {
				throw new Error('DGT transfers are currently disabled');
			}

			// Check transfer limits
			if (amount > config.limits.maxDGTTransfer) {
				throw new Error(
					`Transfer amount exceeds maximum limit of ${config.limits.maxDGTTransfer} DGT`
				);
			}

			// Verify users exist
			const usersData = await db
				.select()
				.from(users)
				.where(sql`${users.id} IN (${fromUserId}, ${toUserId})`);

			if (usersData.length !== 2) {
				throw new Error('Invalid user(s) for transfer');
			}

			// Generate transfer ID
			const transferId = `dgt_transfer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

			// Start transaction
			const result = await db.transaction(async (tx) => {
				// Debit from sender
				const debitTransaction = await this.debitDGT(fromUserId, amount, {
					source: 'internal_transfer_send',
					transferId,
					reason: note,
					metadata: { toUserId, transferId }
				});

				// Credit to receiver
				const creditTransaction = await this.creditDGT(toUserId, amount, {
					source: 'internal_transfer_receive',
					transferId,
					reason: note,
					metadata: { fromUserId, transferId }
				});

				return {
					debit: debitTransaction,
					credit: creditTransaction
				};
			});

			console.log(`DGT transfer: ${amount} DGT from ${fromUserId} to ${toUserId} (${transferId})`);

			return {
				transactionId: result.debit.id,
				fromBalance: result.debit.balanceAfter,
				toBalance: result.credit.balanceAfter,
				transferId
			};
		} catch (error) {
			console.error('Error transferring DGT:', error);
			const err = error as Error;
			throw new Error(`Failed to transfer DGT: ${err.message}`);
		}
	}

	/**
	 * Get user's DGT transaction history
	 */
	async getDGTHistory(
		userId: string,
		options?: {
			limit?: number;
			offset?: number;
			type?: string;
		}
	): Promise<DGTTransaction[]> {
		try {
			const limit = options?.limit || 50;
			const offset = options?.offset || 0;

			const userWallet = await this.getDGTBalance(userId);

			let query = db
				.select()
				.from(transactions)
				.where(eq(transactions.walletId, userWallet.walletId))
				.orderBy(desc(transactions.createdAt))
				.limit(limit)
				.offset(offset);

			if (options?.type) {
				query = query.where(
					and(eq(transactions.walletId, userWallet.walletId), eq(transactions.type, options.type))
				);
			}

			const results = await query;

			return results.map((tx) => ({
				id: tx.id,
				userId,
				amount: tx.amount / 100, // Convert back from cents
				type: tx.type,
				balanceAfter: 0, // Would need to calculate or store separately
				metadata: tx.metadata as DGTTransactionMetadata,
				createdAt: tx.createdAt
			}));
		} catch (error) {
			console.error('Error getting DGT history:', error);
			throw new Error('Failed to retrieve DGT transaction history');
		}
	}

	/**
	 * Get DGT analytics for admin
	 */
	async getDGTAnalytics(): Promise<{
		totalSupply: number;
		totalUsers: number;
		totalTransactions: number;
		dailyVolume: number;
		averageBalance: number;
	}> {
		try {
			const [totalSupplyResult, totalUsersResult, totalTransactionsResult] = await Promise.all([
				// Total DGT in circulation
				db
					.select({
						total: sql<number>`SUM(${wallets.balance})`
					})
					.from(wallets),

				// Total users with DGT
				db
					.select({
						count: sql<number>`COUNT(*)`
					})
					.from(wallets)
					.where(sql`${wallets.balance} > 0`),

				// Total transactions
				db
					.select({
						count: sql<number>`COUNT(*)`
					})
					.from(transactions)
			]);

			// Daily volume (last 24 hours)
			const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
			const [dailyVolumeResult] = await db
				.select({
					volume: sql<number>`SUM(ABS(${transactions.amount}))`
				})
				.from(transactions)
				.where(sql`${transactions.createdAt} >= ${oneDayAgo}`);

			const totalSupply = totalSupplyResult[0]?.total || 0;
			const totalUsers = totalUsersResult[0]?.count || 0;
			const totalTransactions = totalTransactionsResult[0]?.count || 0;
			const dailyVolume = (dailyVolumeResult?.volume || 0) / 100; // Convert from cents
			const averageBalance = totalUsers > 0 ? totalSupply / totalUsers : 0;

			return {
				totalSupply,
				totalUsers,
				totalTransactions,
				dailyVolume,
				averageBalance
			};
		} catch (error) {
			console.error('Error getting DGT analytics:', error);
			throw new Error('Failed to retrieve DGT analytics');
		}
	}

	/**
	 * Ensure user has a DGT wallet
	 */
	private async ensureDGTWallet(userId: string): Promise<void> {
		const existing = await db.select().from(wallets).where(eq(wallets.userId, userId)).limit(1);

		if (existing.length === 0) {
			await this.createDGTWallet(userId);
		}
	}

	/**
	 * Create DGT wallet for user
	 */
	private async createDGTWallet(userId: string): Promise<void> {
		try {
			await db.insert(wallets).values({
				userId: userId,
				balance: 0,
				isDeleted: false,
				createdAt: new Date(),
				updatedAt: new Date()
			});

			console.log(`DGT wallet created for user: ${userId}`);
		} catch (error) {
			console.error('Error creating DGT wallet:', error);
			throw new Error('Failed to create DGT wallet');
		}
	}

	/**
	 * Get transaction type from source
	 */
	private getTransactionType(source: DGTTransactionMetadata['source']): string {
		const typeMap: Record<DGTTransactionMetadata['source'], string> = {
			crypto_deposit: 'DEPOSIT_CREDIT',
			shop_purchase: 'SHOP_SPEND',
			tip_send: 'TIP_SEND',
			tip_receive: 'TIP_RECEIVE',
			rain_send: 'RAIN_SEND',
			rain_receive: 'RAIN_RECEIVE',
			admin_credit: 'ADMIN_CREDIT',
			admin_debit: 'ADMIN_DEBIT',
			internal_transfer_send: 'INTERNAL_TRANSFER_SEND',
			internal_transfer_receive: 'INTERNAL_TRANSFER_RECEIVE',
			xp_boost: 'XP_BOOST',
			manual_credit: 'MANUAL_CREDIT'
		};

		return typeMap[source] || 'OTHER';
	}

	/**
	 * Get transaction description from metadata
	 */
	private getTransactionDescription(metadata: DGTTransactionMetadata): string {
		switch (metadata.source) {
			case 'crypto_deposit':
				return `DGT credit from ${metadata.originalToken} deposit (${metadata.usdtAmount} USDT)`;
			case 'shop_purchase':
				return `Shop purchase: ${metadata.shopItemId}`;
			case 'tip_send':
				return `Tip sent: ${metadata.reason || 'No message'}`;
			case 'tip_receive':
				return `Tip received: ${metadata.reason || 'No message'}`;
			case 'rain_send':
				return `Rain event participation`;
			case 'rain_receive':
				return `Rain reward received`;
			case 'admin_credit':
				return `Admin credit: ${metadata.reason || 'Manual adjustment'}`;
			case 'admin_debit':
				return `Admin debit: ${metadata.reason || 'Manual adjustment'}`;
			case 'internal_transfer_send':
				return `Transfer sent: ${metadata.reason || 'No note'}`;
			case 'internal_transfer_receive':
				return `Transfer received: ${metadata.reason || 'No note'}`;
			case 'xp_boost':
				return `XP boost purchase`;
			case 'manual_credit':
				return `Manual credit: ${metadata.reason || 'Administrator action'}`;
			default:
				return 'DGT transaction';
		}
	}
}

// Export singleton instance
export const dgtService = new DGTService();
