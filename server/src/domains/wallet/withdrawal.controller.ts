import { userService } from '@server/src/core/services/user.service';
import { EconomyTransformer } from '../economy/transformers/economy.transformer';
import { 
	toPublicList,
	sendSuccessResponse,
	sendErrorResponse,
	sendTransformedResponse
} from '@server/src/core/utils/transformer.helpers';
import type { UserId, EntityId } from '@shared/types/ids';
/**
 * Withdrawal Controller
 *
 * Handles withdrawal requests for users converting DGT to crypto
 */

import type { Request, Response, NextFunction } from 'express';
import { logger } from '../../core/logger';
import { walletService } from './wallet.service';
import { dgtService } from './dgt.service';
import { ccpaymentService } from './ccpayment.service';
import { db } from '@db';
import { withdrawalRequests, users, transactions, withdrawalStatusEnum } from '@schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { WalletError, ErrorCodes } from '../../core/errors';
import { walletConfig } from '@shared/wallet.config';
import { z } from 'zod';

// Validation schemas
const createWithdrawalSchema = z.object({
	amount: z.number().positive().min(walletConfig.LIMITS.MIN_WITHDRAWAL_USD),
	currency: z.enum(['USDT', 'BTC', 'ETH']),
	network: z.string().optional(),
	address: z.string().min(10).max(255),
	notes: z.string().max(500).optional()
});

const processWithdrawalSchema = z.object({
	action: z.enum(['approve', 'reject']),
	adminNotes: z.string().max(500).optional()
});

export class WithdrawalController {
	/**
	 * Create a withdrawal request
	 */
	async createWithdrawalRequest(req: Request, res: Response, next: NextFunction) {
		try {
			if (!userService.getUserFromRequest(req)) {
				return sendErrorResponse(res, 'User not authenticated', 401);
			}

			const userId = (userService.getUserFromRequest(req) as { id: UserId }).id;

			// Check if withdrawals are enabled
			if (!walletConfig.WITHDRAWALS_ENABLED) {
				return sendErrorResponse(res, 'Withdrawals are temporarily disabled', 503);
			}

			// Validate request body
			const { amount, currency, network, address, notes } = createWithdrawalSchema.parse(req.body);

			// Check user level requirement
			const [user] = await db
				.select({ level: users.level })
				.from(users)
				.where(eq(users.id, userId));

			if (!user || user.level < walletConfig.REQUIREMENTS.MIN_LEVEL_TO_WITHDRAW) {
				return sendErrorResponse(res, `Level ${walletConfig.REQUIREMENTS.MIN_LEVEL_TO_WITHDRAW} required to withdraw`, 403);
			}

			// Check withdrawal limits
			if (
				amount < walletConfig.LIMITS.MIN_WITHDRAWAL_USD ||
				amount > walletConfig.LIMITS.MAX_WITHDRAWAL_USD
			) {
				return sendErrorResponse(res, `Withdrawal amount must be between $${walletConfig.LIMITS.MIN_WITHDRAWAL_USD} and $${walletConfig.LIMITS.MAX_WITHDRAWAL_USD}`, 400);
			}

			// Check daily limit
			const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
			const [dailyTotal] = await db
				.select({
					total: sql<number>`COALESCE(SUM(${withdrawalRequests.amount}), 0)`
				})
				.from(withdrawalRequests)
				.where(
					and(
						eq(withdrawalRequests.userId, userId),
						sql`${withdrawalRequests.createdAt} > ${twentyFourHoursAgo}`,
						eq(withdrawalRequests.status, 'approved')
					)
				);

			if (dailyTotal && dailyTotal.total + amount > walletConfig.LIMITS.DAILY_WITHDRAWAL_LIMIT) {
				return sendErrorResponse(res, `Daily withdrawal limit of $${walletConfig.LIMITS.DAILY_WITHDRAWAL_LIMIT} exceeded`, 429);
			}

			// Calculate DGT amount needed (including fees)
			const withdrawalFeePercent = walletConfig.FEES.WITHDRAWAL_FEE_PERCENT / 100;
			const flatFee = walletConfig.FEES.WITHDRAWAL_FLAT_FEE_USD;
			const totalFeeUSD = amount * withdrawalFeePercent + flatFee;
			const totalAmountUSD = amount + totalFeeUSD;
			const dgtAmountNeeded = BigInt(
				Math.ceil((totalAmountUSD / walletConfig.DGT.PRICE_USD) * 100000000)
			);

			// Check DGT balance
			const dgtBalance = await dgtService.getUserBalance(userId);
			if (dgtBalance < dgtAmountNeeded) {
				return sendErrorResponse(res, 'Insufficient DGT balance', 400);
			}

			// Create withdrawal request
			const [withdrawalRequest] = await db
				.insert(withdrawalRequests)
				.values({
					userId,
					amount: Math.floor(amount * 100), // Store in cents
					walletAddress: address,
					processingFee: Math.floor(totalFeeUSD * 100), // Store in cents
					requestNotes: notes,
					status: 'pending'
				})
				.returning();

			// Deduct DGT from user's balance (hold in escrow)
			await dgtService.deductDGT(
				userId,
				dgtAmountNeeded,
				'WITHDRAWAL',
				`Withdrawal request #${withdrawalRequest.id}`,
				{ withdrawalRequestId: withdrawalRequest.id }
			);

			logger.info('WithdrawalController', 'Withdrawal request created', {
				userId,
				requestId: withdrawalRequest.id,
				amount,
				currency,
				dgtDeducted: Number(dgtAmountNeeded) / 100000000
			});

			const withdrawalResponse = {
				id: withdrawalRequest.id,
				amount,
				currency,
				network: network || 'default',
				address,
				fee: totalFeeUSD,
				status: 'pending',
				createdAt: withdrawalRequest.createdAt
			};

			sendSuccessResponse(res, {
				withdrawalRequest: EconomyTransformer.toAuthenticatedWithdrawalRequest(withdrawalResponse, userService.getUserFromRequest(req))
			});
		} catch (error) {
			if (error instanceof z.ZodError) {
				return sendErrorResponse(res, 'Invalid request', 400);
			}
			logger.error('WithdrawalController', 'Error creating withdrawal request', {
				error: error instanceof Error ? error.message : String(error),
				userId: userService.getUserFromRequest(req)?.id
			});
			next(error);
		}
	}

	/**
	 * Get user's withdrawal history
	 */
	async getWithdrawalHistory(req: Request, res: Response, next: NextFunction) {
		try {
			if (!userService.getUserFromRequest(req)) {
				return sendErrorResponse(res, 'User not authenticated', 401);
			}

			const userId = (userService.getUserFromRequest(req) as { id: UserId }).id;
			const page = parseInt(req.query.page as string) || 1;
			const limit = parseInt(req.query.limit as string) || 10;
			const offset = (page - 1) * limit;

			const withdrawals = await db
				.select({
					id: withdrawalRequests.id,
					amount: withdrawalRequests.amount,
					status: withdrawalRequests.status,
					walletAddress: withdrawalRequests.walletAddress,
					processingFee: withdrawalRequests.processingFee,
					requestNotes: withdrawalRequests.requestNotes,
					adminNotes: withdrawalRequests.adminNotes,
					createdAt: withdrawalRequests.createdAt,
					fulfilledAt: withdrawalRequests.fulfilledAt
				})
				.from(withdrawalRequests)
				.where(eq(withdrawalRequests.userId, userId))
				.orderBy(desc(withdrawalRequests.createdAt))
				.limit(limit)
				.offset(offset);

			// Get total count
			const [countResult] = await db
				.select({ count: sql<number>`COUNT(*)` })
				.from(withdrawalRequests)
				.where(eq(withdrawalRequests.userId, userId));

			const transformedWithdrawals = withdrawals.map((w) => ({
				...w,
				amount: w.amount / 100, // Convert from cents
				processingFee: w.processingFee / 100
			}));

			sendSuccessResponse(res, {
				withdrawals: toPublicList(transformedWithdrawals, EconomyTransformer.toAuthenticatedWithdrawalHistory),
				pagination: {
					page,
					limit,
					total: countResult?.count || 0,
					pages: Math.ceil((countResult?.count || 0) / limit)
				}
			});
		} catch (error) {
			logger.error('WithdrawalController', 'Error getting withdrawal history', {
				error: error instanceof Error ? error.message : String(error),
				userId: userService.getUserFromRequest(req)?.id
			});
			next(error);
		}
	}

	/**
	 * Admin: Get all withdrawal requests
	 */
	async getAllWithdrawalRequests(req: Request, res: Response, next: NextFunction) {
		try {
			const status = req.query.status as (typeof withdrawalStatusEnum.enumValues)[number];
			const page = parseInt(req.query.page as string) || 1;
			const limit = parseInt(req.query.limit as string) || 20;
			const offset = (page - 1) * limit;

			const conditions = [];
			if (status && withdrawalStatusEnum.enumValues.includes(status)) {
				conditions.push(eq(withdrawalRequests.status, status));
			}

			const withdrawals = await db
				.select({
					id: withdrawalRequests.id,
					userId: withdrawalRequests.userId,
					username: users.username,
					email: users.email,
					amount: withdrawalRequests.amount,
					status: withdrawalRequests.status,
					walletAddress: withdrawalRequests.walletAddress,
					processingFee: withdrawalRequests.processingFee,
					requestNotes: withdrawalRequests.requestNotes,
					adminNotes: withdrawalRequests.adminNotes,
					createdAt: withdrawalRequests.createdAt,
					fulfilledAt: withdrawalRequests.fulfilledAt
				})
				.from(withdrawalRequests)
				.leftJoin(users, eq(withdrawalRequests.userId, users.id))
				.where(conditions.length > 0 ? and(...conditions) : undefined)
				.orderBy(desc(withdrawalRequests.createdAt))
				.limit(limit)
				.offset(offset);

			// Get total count
			const [countResult] = await db
				.select({ count: sql<number>`COUNT(*)` })
				.from(withdrawalRequests)
				.where(conditions.length > 0 ? and(...conditions) : undefined);

			const transformedWithdrawals = withdrawals.map((w) => ({
				...w,
				amount: w.amount / 100, // Convert from cents
				processingFee: w.processingFee / 100
			}));

			sendSuccessResponse(res, {
				withdrawals: toPublicList(transformedWithdrawals, EconomyTransformer.toAdminWithdrawalRequest),
				pagination: {
					page,
					limit,
					total: countResult?.count || 0,
					pages: Math.ceil((countResult?.count || 0) / limit)
				}
			});
		} catch (error) {
			logger.error('WithdrawalController', 'Error getting all withdrawal requests', {
				error: error instanceof Error ? error.message : String(error)
			});
			next(error);
		}
	}

	/**
	 * Admin: Process withdrawal request (approve/reject)
	 */
	async processWithdrawalRequest(req: Request, res: Response, next: NextFunction) {
		try {
			const adminId = (userService.getUserFromRequest(req) as { id: UserId }).id;
			const requestId = req.params.requestId as EntityId;
			const { action, adminNotes } = processWithdrawalSchema.parse(req.body);

			// Get withdrawal request
			const [withdrawalRequest] = await db
				.select()
				.from(withdrawalRequests)
				.where(eq(withdrawalRequests.id, requestId));

			if (!withdrawalRequest) {
				return sendErrorResponse(res, 'Withdrawal request not found', 404);
			}

			if (withdrawalRequest.status !== 'pending') {
				return sendErrorResponse(res, 'Only pending requests can be processed', 400);
			}

			if (action === 'approve') {
				// TODO: Implement actual withdrawal via CCPayment
				// For now, we'll just update the status

				await db
					.update(withdrawalRequests)
					.set({
						status: 'approved',
						adminNotes,
						processedBy: adminId,
						fulfilledAt: new Date(),
						processed: true
					})
					.where(eq(withdrawalRequests.id, requestId));

				logger.info('WithdrawalController', 'Withdrawal request approved', {
					requestId,
					adminId,
					amount: withdrawalRequest.amount / 100
				});

				const approvalResponse = {
					success: true,
					message: 'Withdrawal request approved',
					requestId
				};

				sendTransformedResponse(res, approvalResponse, EconomyTransformer.toAdminWithdrawalApproval);
			} else {
				// Reject and refund DGT
				await db
					.update(withdrawalRequests)
					.set({
						status: 'rejected',
						adminNotes,
						processedBy: adminId,
						processed: true
					})
					.where(eq(withdrawalRequests.id, requestId));

				// Calculate DGT to refund
				const totalAmountUSD = (withdrawalRequest.amount + withdrawalRequest.processingFee) / 100;
				const dgtToRefund = BigInt(
					Math.ceil((totalAmountUSD / walletConfig.DGT.PRICE_USD) * 100000000)
				);

				// Refund DGT to user
				await dgtService.addDGT(
					withdrawalRequest.userId,
					dgtToRefund,
					'WITHDRAWAL_REFUND',
					`Refund for rejected withdrawal #${requestId}`,
					{ withdrawalRequestId: requestId }
				);

				logger.info('WithdrawalController', 'Withdrawal request rejected', {
					requestId,
					adminId,
					dgtRefunded: Number(dgtToRefund) / 100000000
				});

				const rejectionResponse = {
					success: true,
					message: 'Withdrawal request rejected and DGT refunded',
					requestId
				};

				sendTransformedResponse(res, rejectionResponse, EconomyTransformer.toAdminWithdrawalRejection);
			}
		} catch (error) {
			if (error instanceof z.ZodError) {
				return sendErrorResponse(res, 'Invalid request', 400);
			}
			logger.error('WithdrawalController', 'Error processing withdrawal request', {
				error: error instanceof Error ? error.message : String(error),
				requestId: req.params.requestId
			});
			next(error);
		}
	}
}

export const withdrawalController = new WithdrawalController();
