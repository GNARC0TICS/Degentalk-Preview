/**
 * Admin Wallet Service (v2)
 *
 * This service provides comprehensive methods for administrators to manage the entire
 * dual-ledger wallet system, including both the internal DGT ledger and the external
 * CCPayment cryptocurrency ledger.
 */

import { db } from '@degentalk/db';
import { wallets, transactions, users, ccpaymentUsers } from '@schema';
import { eq, sql } from 'drizzle-orm';
import type { UserId } from '@shared/types/ids';
import { logger } from '@core/logger';
import { WalletError, ErrorCodes } from '@core/errors';
import { ccpaymentService } from '@domains/wallet/providers/ccpayment/ccpayment.service';
import type { CryptoBalance } from '@domains/wallet/providers/ccpayment/ccpayment.service';

export class AdminWalletService {

	// --- DGT Ledger Management --- //

	/**
	 * Credit DGT to a user's wallet. For admin use only.
	 */
	async creditDgt(
		userId: UserId,
		amount: number,
		reason: string,
		metadata: { adminUserId: UserId }
	): Promise<void> {
		if (amount <= 0) {
			throw new WalletError('Amount must be positive.', ErrorCodes.VALIDATION_ERROR);
		}

		await db.transaction(async (tx) => {
			const wallet = await tx.query.wallets.findFirst({ where: eq(wallets.userId, userId) });
			if (!wallet) throw new WalletError('User wallet not found.', ErrorCodes.NOT_FOUND);

			await tx.update(wallets).set({ dgtBalance: sql`${wallets.dgtBalance} + ${amount}` }).where(eq(wallets.id, wallet.id));
			await tx.insert(transactions).values({
				userId,
				walletId: wallet.id,
				amount,
				type: 'admin_credit_dgt',
				status: 'completed',
				description: reason,
				metadata: { ...metadata, admin_action: 'creditDgt' }
			});
			logger.info('AdminWalletService', 'Successfully credited DGT', { userId, amount, reason });
		});
	}

	/**
	 * Debit DGT from a user's wallet. For admin use only.
	 */
	async debitDgt(
		userId: UserId,
		amount: number,
		reason: string,
		metadata: { adminUserId: UserId }
	): Promise<void> {
		if (amount <= 0) {
			throw new WalletError('Amount must be positive.', ErrorCodes.VALIDATION_ERROR);
		}

		await db.transaction(async (tx) => {
			const wallet = await tx.query.wallets.findFirst({ where: eq(wallets.userId, userId) });
			if (!wallet) throw new WalletError('User wallet not found.', ErrorCodes.NOT_FOUND);
			if (wallet.dgtBalance < amount) throw new WalletError('Insufficient DGT balance.', ErrorCodes.INSUFFICIENT_FUNDS);

			await tx.update(wallets).set({ dgtBalance: sql`${wallets.dgtBalance} - ${amount}` }).where(eq(wallets.id, wallet.id));
			await tx.insert(transactions).values({
				userId,
				walletId: wallet.id,
				amount: -amount,
				type: 'admin_debit_dgt',
				status: 'completed',
				description: reason,
				metadata: { ...metadata, admin_action: 'debitDgt' }
			});
			logger.info('AdminWalletService', 'Successfully debited DGT', { userId, amount, reason });
		});
	}

	// --- CCPayment Crypto Ledger Management --- //

	/**
	 * Get a user's real cryptocurrency balances from CCPayment.
	 */
	async getUserCryptoBalances(userId: UserId): Promise<CryptoBalance[]> {
		const ccpaymentUserId = await this.getCcpaymentUserId(userId);
		return ccpaymentService.getUserCryptoBalances(ccpaymentUserId);
	}

	/**
	 * Credit a user with real cryptocurrency from the merchant's account.
	 */
	async creditUserCrypto(params: { adminUserId: UserId, userId: UserId, coinId: number, amount: string, reason: string }): Promise<void> {
		const { adminUserId, userId, coinId, amount, reason } = params;
		const fromUserId = process.env.CCPAYMENT_APP_ID as string; // Merchant's account
		const toUserId = await this.getCcpaymentUserId(userId);
		const orderId = `admin_credit_${userId}_${Date.now()}`;

		await ccpaymentService.userTransfer({ fromUserId, toUserId, coinId, amount, orderId });
		logger.info('AdminWalletService', 'Successfully credited crypto', { ...params });
		// You might want to create an internal transaction record here as well for audit purposes.
	}

	/**
	 * Debit a user's real cryptocurrency to the merchant's account.
	 */
	async debitUserCrypto(params: { adminUserId: UserId, userId: UserId, coinId: number, amount: string, reason: string }): Promise<void> {
		const { adminUserId, userId, coinId, amount, reason } = params;
		const fromUserId = await this.getCcpaymentUserId(userId);
		const toUserId = process.env.CCPAYMENT_APP_ID as string; // Merchant's account
		const orderId = `admin_debit_${userId}_${Date.now()}`;

		await ccpaymentService.userTransfer({ fromUserId, toUserId, coinId, amount, orderId });
		logger.info('AdminWalletService', 'Successfully debited crypto', { ...params });
		// You might want to create an internal transaction record here as well for audit purposes.
	}

	// --- Analytics and Helpers --- //

	/**
	 * Get DGT analytics for the admin dashboard.
	 */
	async getDGTAnalytics(): Promise<any> {
		const [totalSupplyResult] = await db.select({ total: sql<number>`sum(${wallets.dgtBalance})` }).from(wallets);
		const [totalUsersResult] = await db.select({ count: sql<number>`count(*)` }).from(wallets).where(sql`${wallets.dgtBalance} > 0`);
		const [totalTransactionsResult] = await db.select({ count: sql<number>`count(*)` }).from(transactions);

		return {
			totalSupply: totalSupplyResult?.total || 0,
			totalUsersWithDgt: totalUsersResult?.count || 0,
			totalTransactions: totalTransactionsResult?.count || 0,
		};
	}

	/**
	 * Helper to get the CCPayment User ID for a Degentalk User ID.
	 */
	private async getCcpaymentUserId(userId: UserId): Promise<string> {
		const mapping = await db.query.ccpaymentUsers.findFirst({ where: eq(ccpaymentUsers.userId, userId) });
		if (!mapping || !mapping.ccpaymentUserId) {
			// This will implicitly create the user mapping if it doesn't exist.
			return ccpaymentService.getOrCreateCCPaymentUser(userId);
		}
		return mapping.ccpaymentUserId;
	}
}

export const adminWalletService = new AdminWalletService();