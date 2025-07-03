import { userService } from '@server/src/core/services/user.service';
import type { UserId } from '@db/types';
/**
 * Treasury Controller
 *
 * Admin interface for managing the platform's treasury and user balances
 */

import type { Request, Response, NextFunction } from 'express';
import { logger } from '../../core/logger';
import { dgtService } from './dgt.service';
import { walletService } from './wallet.service';
import { ccpaymentService } from './ccpayment.service';
import { db } from '@db';
import {
	users,
	transactions,
	dgtPurchaseOrders,
	withdrawalRequests,
	transactionTypeEnum
} from '@schema';
import { eq, desc, sql, and, gte, lt, count } from 'drizzle-orm';
import { z } from 'zod';

// Validation schemas
const adjustBalanceSchema = z.object({
	userId: z.string().uuid().positive(),
	amount: z.number(),
	reason: z.string().min(1).max(500),
	type: z.enum(['credit', 'debit'])
});

const bulkAirdropSchema = z.object({
	amount: z.number().positive(),
	reason: z.string().min(1).max(500),
	targetUsers: z.enum(['all', 'active', 'specific']),
	userIds: z.array(z.number()).optional(),
	minLevel: z.number().min(0).optional()
});

export class TreasuryController {
	/**
	 * Get treasury overview
	 */
	async getTreasuryOverview(req: Request, res: Response, next: NextFunction) {
		try {
			// Get total DGT in circulation
			const [circulationResult] = await db
				.select({
					totalDGT: sql<number>`COALESCE(SUM(${transactions.amount}), 0)`
				})
				.from(transactions)
				.where(eq(transactions.type, 'MINT'));

			const totalMinted = circulationResult?.totalDGT || 0;

			// Get total user balances
			const userBalancePromises = await db
				.select({
					userId: users.id,
					username: users.username
				})
				.from(users)
				.where(eq(users.isDeleted, false))
				.limit(1000); // Limit for performance

			let totalUserBalances = 0;
			const topHolders = [];

			for (const user of userBalancePromises) {
				const balance = await dgtService.getUserBalance(user.userId);
				const balanceNumber = Number(balance) / 100000000;
				totalUserBalances += balanceNumber;

				if (balanceNumber > 0) {
					topHolders.push({
						userId: user.userId,
						username: user.username,
						balance: balanceNumber
					});
				}
			}

			// Sort top holders
			topHolders.sort((a, b) => b.balance - a.balance);
			const top10Holders = topHolders.slice(0, 10);

			// Get recent transactions summary
			const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
			const [dailyStats] = await db
				.select({
					totalTransactions: count(),
					totalVolume: sql<number>`COALESCE(SUM(${transactions.amount}), 0)`
				})
				.from(transactions)
				.where(gte(transactions.createdAt, twentyFourHoursAgo));

			// Get pending withdrawals
			const [pendingWithdrawals] = await db
				.select({
					count: count(),
					totalAmount: sql<number>`COALESCE(SUM(${withdrawalRequests.amount}), 0)`
				})
				.from(withdrawalRequests)
				.where(eq(withdrawalRequests.status, 'pending'));

			// Get purchase orders stats
			const [purchaseStats] = await db
				.select({
					pendingCount: count(),
					pendingValue: sql<number>`COALESCE(SUM(CAST(${dgtPurchaseOrders.cryptoAmount} AS DECIMAL)), 0)`
				})
				.from(dgtPurchaseOrders)
				.where(eq(dgtPurchaseOrders.status, 'pending'));

			res.json({
				treasury: {
					totalMinted: totalMinted / 100000000,
					totalUserBalances,
					circulatingSupply: totalUserBalances,
					reserveBalance: Math.max(0, totalMinted / 100000000 - totalUserBalances)
				},
				topHolders: top10Holders,
				dailyStats: {
					transactions: dailyStats?.totalTransactions || 0,
					volume: (dailyStats?.totalVolume || 0) / 100000000
				},
				pendingOperations: {
					withdrawals: {
						count: pendingWithdrawals?.count || 0,
						totalAmount: (pendingWithdrawals?.totalAmount || 0) / 100
					},
					purchases: {
						count: purchaseStats?.pendingCount || 0,
						totalValue: purchaseStats?.pendingValue || 0
					}
				}
			});
		} catch (error) {
			logger.error('TreasuryController', 'Error getting treasury overview', {
				error: error instanceof Error ? error.message : String(error)
			});
			next(error);
		}
	}

	/**
	 * Get user balance details
	 */
	async getUserBalanceDetails(req: Request, res: Response, next: NextFunction) {
		try {
			const userId = req.params.userId as UserId;

			// Get user info
			const [user] = await db
				.select({
					id: users.id,
					username: users.username,
					email: users.email,
					level: users.level,
					ccpaymentAccountId: users.ccpaymentAccountId
				})
				.from(users)
				.where(eq(users.id, userId));

			if (!user) {
				return res.status(404).json({ error: 'User not found' });
			}

			// Get wallet details
			const wallet = await walletService.getUserWallet(userId);
			const transactionHistory = await walletService.getTransactionHistory(userId, 50);

			// Get transaction summary by type
			const transactionSummary = await db
				.select({
					type: transactions.type,
					count: count(),
					totalAmount: sql<number>`COALESCE(SUM(${transactions.amount}), 0)`
				})
				.from(transactions)
				.where(eq(transactions.userId, userId))
				.groupBy(transactions.type);

			res.json({
				user: {
					id: user.id,
					username: user.username,
					email: user.email,
					level: user.level,
					hasCCPaymentAccount: !!user.ccpaymentAccountId
				},
				wallet: {
					dgtBalance: Number(wallet.dgt) / 100000000,
					cryptoBalances: wallet.cryptoBalances
				},
				transactionSummary: transactionSummary.map((summary) => ({
					type: summary.type,
					count: summary.count,
					totalAmount: summary.totalAmount / 100000000
				})),
				recentTransactions: transactionHistory.slice(0, 20)
			});
		} catch (error) {
			logger.error('TreasuryController', 'Error getting user balance details', {
				error: error instanceof Error ? error.message : String(error),
				userId: req.params.userId
			});
			next(error);
		}
	}

	/**
	 * Adjust user balance (admin only)
	 */
	async adjustUserBalance(req: Request, res: Response, next: NextFunction) {
		try {
			const adminId = (userService.getUserFromRequest(req) as { id: UserId }).id;
			const { userId, amount, reason, type } = adjustBalanceSchema.parse(req.body);

			// Verify user exists
			const [user] = await db
				.select({ username: users.username })
				.from(users)
				.where(eq(users.id, userId));

			if (!user) {
				return res.status(404).json({ error: 'User not found' });
			}

			const dgtAmount = BigInt(Math.floor(Math.abs(amount) * 100000000));
			const adjustmentReason = `Admin adjustment: ${reason}`;

			if (type === 'credit') {
				await dgtService.addDGT(userId, dgtAmount, 'ADMIN_CREDIT', adjustmentReason, {
					adminId,
					originalAmount: amount
				});
			} else {
				await dgtService.deductDGT(userId, dgtAmount, 'ADMIN_DEBIT', adjustmentReason, {
					adminId,
					originalAmount: amount
				});
			}

			logger.info('TreasuryController', 'Balance adjusted by admin', {
				adminId,
				userId,
				username: user.username,
				type,
				amount,
				reason
			});

			// Get new balance
			const newBalance = await dgtService.getUserBalance(userId);

			res.json({
				success: true,
				message: `Successfully ${type === 'credit' ? 'credited' : 'debited'} ${amount} DGT ${type === 'credit' ? 'to' : 'from'} ${user.username}`,
				newBalance: Number(newBalance) / 100000000
			});
		} catch (error) {
			if (error instanceof z.ZodError) {
				return res.status(400).json({ error: 'Invalid request', details: error.errors });
			}
			logger.error('TreasuryController', 'Error adjusting user balance', {
				error: error instanceof Error ? error.message : String(error)
			});
			next(error);
		}
	}

	/**
	 * Execute bulk airdrop (admin only)
	 */
	async executeBulkAirdrop(req: Request, res: Response, next: NextFunction) {
		try {
			const adminId = (userService.getUserFromRequest(req) as { id: UserId }).id;
			const { amount, reason, targetUsers, userIds, minLevel } = bulkAirdropSchema.parse(req.body);

			let targetUserList: { id: UserId; username: string }[] = [];

			// Determine target users
			if (targetUsers === 'specific' && userIds) {
				const specificUsers = await db
					.select({ id: users.id, username: users.username })
					.from(users)
					.where(and(eq(users.isDeleted, false), sql`${users.id} = ANY(${userIds})`));
				targetUserList = specificUsers;
			} else if (targetUsers === 'active') {
				// Users who have been active in the last 30 days
				const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
				const activeUsers = await db
					.select({ id: users.id, username: users.username })
					.from(users)
					.where(
						and(
							eq(users.isDeleted, false),
							gte(users.lastActiveAt, thirtyDaysAgo),
							minLevel ? gte(users.level, minLevel) : sql`true`
						)
					);
				targetUserList = activeUsers;
			} else {
				// All users
				const allUsers = await db
					.select({ id: users.id, username: users.username })
					.from(users)
					.where(
						and(eq(users.isDeleted, false), minLevel ? gte(users.level, minLevel) : sql`true`)
					);
				targetUserList = allUsers;
			}

			if (targetUserList.length === 0) {
				return res.status(400).json({ error: 'No users match the criteria' });
			}

			// Execute airdrop
			const dgtAmount = BigInt(Math.floor(amount * 100000000));
			const airdropReason = `Airdrop: ${reason}`;
			const results = [];

			for (const user of targetUserList) {
				try {
					await dgtService.addDGT(user.id, dgtAmount, 'AIRDROP', airdropReason, {
						adminId,
						airdropReason: reason
					});
					results.push({ userId: user.id, username: user.username, success: true });
				} catch (error) {
					logger.error('TreasuryController', 'Failed to airdrop to user', {
						userId: user.id,
						username: user.username,
						error: error instanceof Error ? error.message : String(error)
					});
					results.push({
						userId: user.id,
						username: user.username,
						success: false,
						error: error instanceof Error ? error.message : String(error)
					});
				}
			}

			const successCount = results.filter((r) => r.success).length;
			const totalAmount = successCount * amount;

			logger.info('TreasuryController', 'Bulk airdrop executed', {
				adminId,
				targetUsers,
				totalUsers: targetUserList.length,
				successCount,
				amount,
				totalAmount,
				reason
			});

			res.json({
				success: true,
				message: `Airdrop completed: ${successCount}/${targetUserList.length} users received ${amount} DGT`,
				summary: {
					totalUsers: targetUserList.length,
					successCount,
					failureCount: targetUserList.length - successCount,
					amountPerUser: amount,
					totalDistributed: totalAmount
				},
				results: results.slice(0, 50) // Limit results for response size
			});
		} catch (error) {
			if (error instanceof z.ZodError) {
				return res.status(400).json({ error: 'Invalid request', details: error.errors });
			}
			logger.error('TreasuryController', 'Error executing bulk airdrop', {
				error: error instanceof Error ? error.message : String(error)
			});
			next(error);
		}
	}

	/**
	 * Get transaction analytics
	 */
	async getTransactionAnalytics(req: Request, res: Response, next: NextFunction) {
		try {
			const days = parseInt(req.query.days as string) || 7;
			const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

			// Transaction volume by day
			const dailyVolume = await db
				.select({
					date: sql<string>`DATE(${transactions.createdAt})`,
					count: count(),
					volume: sql<number>`COALESCE(SUM(${transactions.amount}), 0)`
				})
				.from(transactions)
				.where(gte(transactions.createdAt, startDate))
				.groupBy(sql`DATE(${transactions.createdAt})`)
				.orderBy(sql`DATE(${transactions.createdAt})`);

			// Transaction volume by type
			const volumeByType = await db
				.select({
					type: transactions.type,
					count: count(),
					volume: sql<number>`COALESCE(SUM(${transactions.amount}), 0)`
				})
				.from(transactions)
				.where(gte(transactions.createdAt, startDate))
				.groupBy(transactions.type);

			// Top spenders
			const topSpenders = await db
				.select({
					userId: transactions.userId,
					username: users.username,
					totalSpent: sql<number>`COALESCE(SUM(CASE WHEN ${transactions.amount} < 0 THEN ABS(${transactions.amount}) ELSE 0 END), 0)`,
					transactionCount: count()
				})
				.from(transactions)
				.leftJoin(users, eq(transactions.userId, users.id))
				.where(
					and(
						gte(transactions.createdAt, startDate),
						lt(transactions.amount, 0) // Only debit transactions
					)
				)
				.groupBy(transactions.userId, users.username)
				.orderBy(desc(sql`totalSpent`))
				.limit(10);

			res.json({
				period: {
					days,
					startDate: startDate.toISOString(),
					endDate: new Date().toISOString()
				},
				dailyVolume: dailyVolume.map((day) => ({
					date: day.date,
					count: day.count,
					volume: day.volume / 100000000
				})),
				volumeByType: volumeByType.map((type) => ({
					type: type.type,
					count: type.count,
					volume: type.volume / 100000000
				})),
				topSpenders: topSpenders.map((spender) => ({
					userId: spender.userId,
					username: spender.username,
					totalSpent: spender.totalSpent / 100000000,
					transactionCount: spender.transactionCount
				}))
			});
		} catch (error) {
			logger.error('TreasuryController', 'Error getting transaction analytics', {
				error: error instanceof Error ? error.message : String(error)
			});
			next(error);
		}
	}
}

export const treasuryController = new TreasuryController();
