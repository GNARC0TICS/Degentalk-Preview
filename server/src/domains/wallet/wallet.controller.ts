/**
 * Wallet Controller
 *
 * [REFAC-WALLET]
 *
 * This controller handles wallet-related API requests, orchestrating
 * between DGT services and CCPayment services as needed.
 */

import { Request, Response } from 'express';
import { logger } from '../../core/logger';
import { dgtService } from './dgt.service';
import { ccpaymentService, type CryptoBalance } from './ccpayment.service'; // Import instance and CryptoBalance type
// import { TransactionService } from '../transactions/transaction.service'; // Ensure this is commented or removed
import { db } from '@db';
import { users, dgtPurchaseOrders, transactions, transactionTypeEnum } from '@schema';
import { eq, desc, and, sql, SQL } from 'drizzle-orm';
import { WalletError, ErrorCodes as WalletErrorCodes } from '../../core/errors';
import crypto from 'crypto';
import { z } from 'zod';
// import { validateRequest } from '../../middleware/validate'; // Ensure this is commented or removed
import { DGT_CURRENCY, DEFAULT_DGT_REWARD_CREATE_THREAD } from './wallet.constants';

/**
 * Wallet controller for handling wallet-related requests
 */
export class WalletController {
	/**
	 * Get user's combined wallet balance (DGT and crypto)
	 */
	async getBalance(req: Request, res: Response): Promise<void> {
		try {
			// Use authenticated user ID if available, otherwise default to dev user ID 2 (based on seed logs)
			const authUserId = (req.user as any)?.id;
			const userId = authUserId || 2; // Default to user ID 2 if no authenticated user

			logger.info('WALLET_CONTROLLER', `Getting DGT balance for user ID: ${userId}`);

			const dgtBalance = await dgtService.getUserBalance(userId); // Used instance dgtService

			logger.info(
				'WALLET_CONTROLLER',
				`Successfully retrieved DGT balance: ${dgtBalance} for user ID: ${userId}`
			);

			// WALLET FINALIZATION ON HOLD: CCPayment integration temporarily disabled.
			// const [user] = await db
			//   .select({ ccpaymentAccountId: users.ccpaymentAccountId })
			//   .from(users)
			//   .where(eq(users.id, userId))
			//   .execute(); // Ensure .execute() is called

			let cryptoBalances: CryptoBalance[] = []; // Return empty crypto balances for now, explicitly typed

			// if (user?.ccpaymentAccountId) {
			//   cryptoBalances = await ccpaymentService.getUserCryptoBalances(user.ccpaymentAccountId);
			// } else {
			//   const ccpaymentAccountId = await ccpaymentService.createCcPaymentWalletForUser(userId);
			//   await db
			//     .update(users)
			//     .set({ ccpaymentAccountId })
			//     .where(eq(users.id, userId))
			//     .execute(); // Ensure .execute() is called
			//   cryptoBalances = await ccpaymentService.getUserCryptoBalances(ccpaymentAccountId);
			// }

			res.json({
				dgt: Number(dgtBalance),
				crypto: cryptoBalances
			});
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			logger.error(
				'WALLET_CONTROLLER',
				`Error getting wallet balance: ${errorMessage}. Details: ${error instanceof Error ? error.stack : String(error)}`,
				{ stack: error instanceof Error ? error.stack : undefined, errorObj: error }
			);

			if (error instanceof WalletError) {
				res.status(error.httpStatus).json({
					error: error.message,
					code: error.code
				});
				return;
			}

			res.status(500).json({
				error: 'Failed to get wallet balance',
				code: WalletErrorCodes.UNKNOWN_ERROR
			});
			return;
		}
	}

	/**
	 * Get transaction history
	 */
	async getTransactionHistory(req: Request, res: Response): Promise<void> {
		try {
			// Use authenticated user ID if available, otherwise default to dev user ID 2
			const authUserId = (req.user as any)?.id;
			const userId = authUserId || 2; // Default to user ID 2 if no authenticated user

			const page = parseInt(req.query.page as string) || 1;
			const limit = parseInt(req.query.limit as string) || 10;
			const offset = (page - 1) * limit;
			const currencyFilter = req.query.currency as string;
			const typeFilter = req.query.type as string;

			// Build query
			const conditions: SQL[] = [eq(transactions.userId, userId)];

			if (currencyFilter) {
				// TODO: transactions table does not have a 'currency' column.
				// This filter needs to be re-evaluated or removed.
				logger.warn(
					'WALLET_CONTROLLER',
					`Currency filter ignored: transactions table has no currency column. Filter was: ${currencyFilter}`
				);
			}

			if (typeFilter) {
				const validTransactionTypes = transactionTypeEnum.enumValues;
				if (
					validTransactionTypes.includes(
						typeFilter as (typeof transactionTypeEnum.enumValues)[number]
					)
				) {
					conditions.push(
						eq(transactions.type, typeFilter as (typeof transactionTypeEnum.enumValues)[number])
					);
				} else {
					logger.warn(
						'WALLET_CONTROLLER',
						'Invalid transaction type filter provided: %s. Ignoring filter.',
						typeFilter
					);
				}
			}

			const txHistory = await db
				.select()
				.from(transactions)
				.where(and(...conditions))
				.orderBy(desc(transactions.createdAt))
				.limit(limit)
				.offset(offset);

			// Get total count for pagination
			const [countResult] = await db
				.select({ count: sql<number>`count(*)` })
				.from(transactions)
				.where(and(...conditions));

			res.json({
				transactions: txHistory,
				total: countResult?.count || 0,
				page,
				limit
			});
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			logger.error(
				'WALLET_CONTROLLER',
				`Error getting transaction history: ${errorMessage}. Details: ${error instanceof Error ? error.stack : String(error)}`,
				{ stack: error instanceof Error ? error.stack : undefined, errorObj: error }
			);

			if (error instanceof WalletError) {
				res.status(error.httpStatus).json({
					error: error.message,
					code: error.code
				});
				return;
			}

			res.status(500).json({
				error: 'Failed to get transaction history',
				code: WalletErrorCodes.UNKNOWN_ERROR
			});
			return;
		}
	}

	/**
	 * Create a deposit address for crypto
	 */
	async createDepositAddress(req: Request, res: Response): Promise<void> {
		try {
			if (!req.user) {
				logger.warn(
					'WALLET_CONTROLLER',
					`Attempt to access createDepositAddress without authentication. Request details: path ${req.path}, ip ${req.ip}`
				);
				return res
					.status(401)
					.json({ error: 'User not authenticated', code: WalletErrorCodes.UNAUTHORIZED });
			}
			const userId = (req.user as { id: number }).id; // Explicit cast after check
			const { currency } = req.body;

			if (!currency) {
				res.status(400).json({
					error: 'Currency is required',
					code: WalletErrorCodes.INVALID_REQUEST
				});
				return;
			}
			// WALLET FINALIZATION ON HOLD: CCPayment integration temporarily disabled.
			// const [user] = await db
			//   .select({ ccpaymentAccountId: users.ccpaymentAccountId })
			//   .from(users)
			//   .where(eq(users.id, userId))
			//   .execute();

			// let ccpaymentAccountId = user?.ccpaymentAccountId;

			// if (!ccpaymentAccountId) {
			//   ccpaymentAccountId = await ccpaymentService.createCcPaymentWalletForUser(userId);
			//   await db
			//     .update(users)
			//     .set({ ccpaymentAccountId })
			//     .where(eq(users.id, userId))
			//     .execute();
			// }

			// const depositAddress = await ccpaymentService.createDepositAddress(ccpaymentAccountId, currency);
			// res.json(depositAddress);
			res.status(501).json({
				message: 'Crypto deposits are temporarily disabled.',
				code: 'SERVICE_UNAVAILABLE'
			});
			return;
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			logger.error(
				'WALLET_CONTROLLER',
				`Error creating deposit address: ${errorMessage}. Details: ${error instanceof Error ? error.stack : String(error)}`,
				{ stack: error instanceof Error ? error.stack : undefined, errorObj: error }
			);

			if (error instanceof WalletError) {
				res.status(error.httpStatus).json({
					error: error.message,
					code: error.code
				});
				return;
			}

			res.status(500).json({
				error: 'Failed to create deposit address',
				code: WalletErrorCodes.UNKNOWN_ERROR
			});
			return;
		}
	}

	/**
	 * Create a DGT purchase order
	 */
	async createDgtPurchase(req: Request, res: Response): Promise<void> {
		try {
			if (!req.user) {
				logger.warn(
					'WALLET_CONTROLLER',
					`Attempt to access createDgtPurchase without authentication. Request details: path ${req.path}, ip ${req.ip}`
				);
				return res
					.status(401)
					.json({ error: 'User not authenticated', code: WalletErrorCodes.UNAUTHORIZED });
			}
			const userId = (req.user as { id: number }).id; // Explicit cast after check
			const { dgtAmount, cryptoCurrency } = req.body;

			if (!dgtAmount || !cryptoCurrency) {
				res.status(400).json({
					error: 'DGT amount and crypto currency are required',
					code: WalletErrorCodes.INVALID_REQUEST
				});
				return;
			}

			// Calculate crypto amount (in production, would call a price API or CCPayment API)
			const dgtRate = 0.01; // Example: 1 DGT = 0.01 USDT
			const cryptoAmount = parseFloat(dgtAmount) * dgtRate;

			// WALLET FINALIZATION ON HOLD: CCPayment integration temporarily disabled.
			// Code related to ccpaymentReference, creating CCPayment deposit request, etc., should be commented out or stubbed.
			res.status(501).json({
				message: 'DGT purchases via crypto are temporarily disabled.',
				code: 'SERVICE_UNAVAILABLE'
			});
			return;
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			logger.error('WALLET_CONTROLLER', `Error creating DGT purchase order: ${errorMessage}`, {
				details: { stack: error instanceof Error ? error.stack : undefined, errorObj: error }
			});

			if (error instanceof WalletError) {
				res.status(error.httpStatus).json({
					error: error.message,
					code: error.code
				});
				return;
			}

			res.status(500).json({
				error: 'Failed to create DGT purchase order',
				code: WalletErrorCodes.UNKNOWN_ERROR
			});
			return;
		}
	}

	/**
	 * Get DGT purchase order status
	 */
	async getPurchaseOrderStatus(req: Request, res: Response): Promise<void> {
		try {
			if (!req.user) {
				logger.warn(
					'Attempt to access getPurchaseOrderStatus without authentication. Request details: path %s, ip %s',
					req.path,
					req.ip
				);
				return res
					.status(401)
					.json({ error: 'User not authenticated', code: WalletErrorCodes.UNAUTHORIZED });
			}
			const userId = (req.user as { id: number }).id; // Explicit cast after check
			const orderId = parseInt(req.params.orderId);

			if (isNaN(orderId)) {
				res.status(400).json({
					error: 'Invalid order ID',
					code: WalletErrorCodes.INVALID_REQUEST
				});
				return;
			}

			// Get purchase order
			const [purchaseOrder] = await db
				.select()
				.from(dgtPurchaseOrders)
				.where(and(eq(dgtPurchaseOrders.id, orderId), eq(dgtPurchaseOrders.userId, userId)))
				.limit(1);

			if (!purchaseOrder) {
				res.status(404).json({
					error: 'Purchase order not found',
					code: WalletErrorCodes.NOT_FOUND
				});
				return;
			}

			res.json(purchaseOrder);
			return;
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			logger.error('Error getting purchase order status: %s. Details: %o', errorMessage, {
				stack: error instanceof Error ? error.stack : undefined,
				errorObj: error
			});

			if (error instanceof WalletError) {
				res.status(error.httpStatus).json({
					error: error.message,
					code: error.code
				});
				return;
			}

			res.status(500).json({
				error: 'Failed to get purchase order status',
				code: WalletErrorCodes.UNKNOWN_ERROR
			});
			return;
		}
	}

	/**
	 * Transfer DGT to another user
	 */
	async transferDgt(req: Request, res: Response): Promise<void> {
		try {
			if (!req.user) {
				logger.warn(
					'Attempt to access transferDgt without authentication. Request details: path %s, ip %s',
					req.path,
					req.ip
				);
				return res
					.status(401)
					.json({ error: 'User not authenticated', code: WalletErrorCodes.UNAUTHORIZED });
			}
			const userId = (req.user as { id: number }).id; // Explicit cast after check
			const { toUserId, amount, reason } = req.body;

			if (!toUserId || !amount) {
				res.status(400).json({
					error: 'Recipient ID and amount are required',
					code: WalletErrorCodes.INVALID_REQUEST
				});
				return;
			}

			// Transfer DGT
			const result = await dgtService.transferDgt(
				// Used instance dgtService
				userId,
				toUserId,
				BigInt(amount),
				'TIP',
				{ reason }
			);

			res.json({
				success: true,
				senderNewBalance: Number(result.senderBalance),
				recipientNewBalance: Number(result.recipientBalance)
			});
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			logger.error('Error transferring DGT: %s. Details: %o', errorMessage, {
				stack: error instanceof Error ? error.stack : undefined,
				errorObj: error
			});

			if (error instanceof WalletError) {
				res.status(error.httpStatus).json({
					error: error.message,
					code: error.code
				});
				return;
			}

			res.status(500).json({
				error: 'Failed to transfer DGT',
				code: WalletErrorCodes.UNKNOWN_ERROR
			});
			return;
		}
	}

	/**
	 * Get supported cryptocurrencies
	 */
	async getSupportedCurrencies(req: Request, res: Response): Promise<void> {
		try {
			// In production, this would fetch from CCPayment API or config
			// For now, return a static list
			res.json([
				{
					code: 'BTC',
					name: 'Bitcoin',
					networks: ['BTC'],
					isEnabled: true
				},
				{
					code: 'ETH',
					name: 'Ethereum',
					networks: ['ETH'],
					isEnabled: true
				},
				{
					code: 'USDT',
					name: 'Tether',
					networks: ['TRC20', 'ERC20'],
					isEnabled: true
				},
				{
					code: 'USDC',
					name: 'USD Coin',
					networks: ['ERC20'],
					isEnabled: true
				}
			]);
			return;
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			logger.error('WALLET_CONTROLLER', `Error getting supported currencies: ${errorMessage}`, {
				details: { stack: error instanceof Error ? error.stack : undefined, errorObj: error }
			});

			res.status(500).json({
				error: 'Failed to get supported currencies',
				code: WalletErrorCodes.UNKNOWN_ERROR
			});
			return;
		}
	}

	async createDgtRewardTransaction(req: Request, res: Response) {
		try {
			const {
				userId,
				amount, // Amount will come from config or a default value
				reason = 'Thread creation reward',
				relatedEntityId,
				context = 'create_thread'
			} = req.body;
			const authenticatedUserId = (req as any).user?.id;

			if (!userId) {
				return res.status(400).json({ error: 'User ID is required.' });
			}
			// entityId might be optional depending on context

			// Optional: Validate that authenticatedUserId matches userId or is an admin
			// if (userId !== authenticatedUserId && !(req as any).user?.isAdmin) {
			//   return res.status(403).json({ error: 'Forbidden: Cannot create reward transaction for another user.'});
			// }

			// Use a configured amount or a default. Client sends placeholder, backend decides true amount.
			const dgtAmountToAward =
				Number(process.env.DGT_REWARD_CREATE_THREAD) || DEFAULT_DGT_REWARD_CREATE_THREAD;

			if (dgtAmountToAward <= 0) {
				logger.info(
					'DGT_CONTROLLER',
					`DGT reward for '${context}' is zero or negative. No transaction created for user ${userId}.`
				);
				return res.status(200).json({ dgtAwarded: 0, message: 'DGT reward for action is zero.' });
			}

			// Use dgtService to handle the DGT addition and transaction logging
			// The dgtService.addDgt method should internally handle:
			// 1. Updating users.dgtWalletBalance
			// 2. Inserting into the transactionsSchema table
			const newBalance = await dgtService.addDgt(
				Number(userId),
				BigInt(dgtAmountToAward),
				'REWARD', // DgtTransactionType
				{
					reason,
					relatedEntityId,
					context,
					source: 'system_reward'
				}
			);

			res.status(200).json({
				dgtAwarded: dgtAmountToAward,
				newBalance: newBalance.toString() // dgtService returns bigint
			});
		} catch (err: any) {
			logger.error(
				'DGT_CONTROLLER',
				`Error in createDgtRewardTransaction for context '${req.body.context}':`,
				err
			);
			res.status(500).json({ error: err.message || 'Server error creating DGT transaction.' });
		}
	}
}

// Export a singleton instance
export const walletController = new WalletController();
