import { userService } from '@server/src/core/services/user.service';
import type { UserId } from '@shared/types';
import { EconomyTransformer } from '../economy/transformers/economy.transformer';
/**
 * Wallet Controller
 *
 * [REFAC-WALLET]
 *
 * This controller handles wallet-related API requests, orchestrating
 * between DGT services and CCPayment services as needed.
 */

import type { Request, Response } from 'express';
import { BaseController, ValidationError, NotFoundError } from '../../core/base-controller';
import type { TypedRequest, ApiResponse } from '@shared/types/api.types';
import { logger } from '../../core/logger';
import { dgtService } from './dgt.service';
import { ccpaymentService, type CryptoBalance } from './ccpayment.service'; // Import instance and CryptoBalance type
// import { TransactionService } from '../transactions/transaction.service'; // Ensure this is commented or removed
import { db } from '@db';
import { users, dgtPurchaseOrders, transactions, transactionTypeEnum, dgtPackages } from '@schema';
import { eq, desc, and, sql, SQL, asc } from 'drizzle-orm';
import { WalletError, ErrorCodes as WalletErrorCodes } from '../../core/errors';
import crypto from 'crypto';
import { z } from 'zod';
import type { UserId, OrderId } from '@shared/types';
import { UnauthorizedError } from '../../core/errors';
// import { validateRequest } from '../../middleware/validate'; // Ensure this is commented or removed
import { DGT_CURRENCY, DEFAULT_DGT_REWARD_CREATE_THREAD } from './wallet.constants';
import { walletService } from './wallet.service';
import { walletConfig } from '@shared/wallet.config';

/**
 * Wallet controller for handling wallet-related requests
 */
export class WalletController extends BaseController {
	/**
	 * Get user's combined wallet balance (DGT and crypto)
	 */
	async getBalance(req: Request, res: Response): Promise<void> {
		try {
			// Get authenticated user ID with type safety
			const authUser = userService.getUserFromRequest(req);
			if (!authUser || !authUser.id) {
				throw new UnauthorizedError('User not authenticated');
			}
			const userId = authUser.id;

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

			const cryptoBalances: CryptoBalance[] = []; // Return empty crypto balances for now, explicitly typed

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

			return this.success(
				res,
				{
					dgt: Number(dgtBalance),
					crypto: cryptoBalances
				},
				'Balance retrieved successfully'
			);
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
			const authUserId = (userService.getUserFromRequest(req) as any)?.id;
			const userId = authUserId || 2 as UserId; // Default to user ID 2 if no authenticated user

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

			// Transform transactions using EconomyTransformer for enhanced history view
			const requestingUser = userService.getUserFromRequest(req);
			
			// Prepare filters for enhanced transaction history
			const historyFilters: any = {};
			
			if (currencyFilter === 'DGT') {
				historyFilters.categories = ['social', 'shopping', 'earning', 'system'];
			}
			
			if (typeFilter) {
				// Map frontend type filter to backend categories
				const typeMap: Record<string, string[]> = {
					'tips': ['social'],
					'purchases': ['shopping'],
					'deposits': ['wallet'],
					'rewards': ['earning'],
					'admin': ['system']
				};
				
				if (typeMap[typeFilter]) {
					historyFilters.categories = typeMap[typeFilter];
				}
			}

			// Use enhanced transaction history transformer
			const { transactions: transformedTransactions, summary } = EconomyTransformer.toTransactionHistory(
				txHistory,
				requestingUser,
				historyFilters
			);

			res.json({
				transactions: transformedTransactions,
				summary,
				total: countResult?.count || 0,
				page,
				limit,
				filters: {
					currency: currencyFilter,
					type: typeFilter,
					enhanced: true // Flag to indicate enhanced history format
				}
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
			if (!userService.getUserFromRequest(req)) {
				logger.warn(
					'WALLET_CONTROLLER',
					`Attempt to access createDepositAddress without authentication. Request details: path ${req.path}, ip ${req.ip}`
				);
				return res
					.status(401)
					.json({ error: 'User not authenticated', code: WalletErrorCodes.UNAUTHORIZED });
			}
			const userId = (userService.getUserFromRequest(req) as { id: UserId }).id; // Explicit cast after check
			const { currency } = req.body;

			if (!currency) {
				res.status(400).json({
					error: 'Currency is required',
					code: WalletErrorCodes.INVALID_REQUEST
				});
				return;
			}
			// Check if deposits are enabled
			if (!walletConfig.DEPOSITS_ENABLED) {
				res.status(501).json({
					message: 'Crypto deposits are temporarily disabled.',
					code: 'SERVICE_UNAVAILABLE'
				});
				return;
			}

			// Ensure user has CCPayment wallet
			const ccpaymentAccountId = await walletService.ensureCcPaymentWallet(userId);

			// Create deposit address
			const depositAddress = await ccpaymentService.createDepositAddress(
				ccpaymentAccountId,
				currency
			);

			logger.info('WALLET_CONTROLLER', 'Created deposit address', {
				userId,
				currency,
				address: depositAddress.address
			});

			res.json(depositAddress);
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
			if (!userService.getUserFromRequest(req)) {
				logger.warn(
					'WALLET_CONTROLLER',
					`Attempt to access createDgtPurchase without authentication. Request details: path ${req.path}, ip ${req.ip}`
				);
				return res
					.status(401)
					.json({ error: 'User not authenticated', code: WalletErrorCodes.UNAUTHORIZED });
			}
			const userId = (userService.getUserFromRequest(req) as { id: UserId }).id; // Explicit cast after check
			const { dgtAmount, cryptoCurrency } = req.body;

			if (!dgtAmount || !cryptoCurrency) {
				res.status(400).json({
					error: 'DGT amount and crypto currency are required',
					code: WalletErrorCodes.INVALID_REQUEST
				});
				return;
			}

			// Calculate crypto amount based on configured DGT price in USD
			const cryptoAmount = parseFloat(dgtAmount) * walletConfig.DGT.PRICE_USD;

			// Generate order reference
			const orderId = `dgt_${userId}_${Date.now()}`;

			// Create purchase order in database
			const [purchaseOrder] = await db
				.insert(dgtPurchaseOrders)
				.values({
					userId,
					dgtAmount: BigInt(Math.floor(parseFloat(dgtAmount) * 100000000)), // Convert to smallest unit
					cryptoAmount: cryptoAmount.toString(),
					cryptoCurrency,
					ccpaymentReference: orderId,
					status: 'pending',
					createdAt: new Date(),
					updatedAt: new Date()
				})
				.returning();

			// Create deposit link via CCPayment
			const depositUrl = await ccpaymentService.createDepositLink({
				amount: cryptoAmount,
				currency: cryptoCurrency,
				orderId: orderId,
				productName: `${dgtAmount} DGT Tokens`,
				redirectUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/wallet/purchase-success?orderId=${purchaseOrder.id}`,
				notifyUrl: `${process.env.API_URL || 'http://localhost:5001'}/api/webhook/ccpayment`
			});

			logger.info('WALLET_CONTROLLER', 'Created DGT purchase order', {
				userId,
				orderId: purchaseOrder.id,
				dgtAmount,
				cryptoAmount
			});

			res.json({
				orderId: purchaseOrder.id,
				depositUrl,
				dgtAmount,
				cryptoAmount,
				cryptoCurrency,
				status: 'pending'
			});
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
			if (!userService.getUserFromRequest(req)) {
				logger.warn(
					'Attempt to access getPurchaseOrderStatus without authentication. Request details: path %s, ip %s',
					req.path,
					req.ip
				);
				return res
					.status(401)
					.json({ error: 'User not authenticated', code: WalletErrorCodes.UNAUTHORIZED });
			}
			const userId = (userService.getUserFromRequest(req) as { id: UserId }).id; // Explicit cast after check
			const orderId = req.params.orderId as OrderId;

			if (!orderId) {
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
			if (!userService.getUserFromRequest(req)) {
				logger.warn(
					'Attempt to access transferDgt without authentication. Request details: path %s, ip %s',
					req.path,
					req.ip
				);
				return res
					.status(401)
					.json({ error: 'User not authenticated', code: WalletErrorCodes.UNAUTHORIZED });
			}
			const userId = (userService.getUserFromRequest(req) as { id: UserId }).id; // Explicit cast after check
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
				userId as UserId,
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

	async listPackages(_req: Request, res: Response): Promise<void> {
		try {
			const packages = await db
				.select()
				.from(dgtPackages)
				.where(eq(dgtPackages.isActive, true))
				.orderBy(asc(dgtPackages.sortOrder), asc(dgtPackages.id));
			res.json(packages);
		} catch (error) {
			logger.error('WALLET_CONTROLLER', 'Error listing DGT packages', error);
			res.status(500).json({ error: 'Failed to list packages' });
		}
	}

	async createPurchaseOrder(req: Request, res: Response): Promise<void> {
		try {
			if (!userService.getUserFromRequest(req))
				return res.status(401).json({ error: 'Unauthenticated' });
			const userId = (userService.getUserFromRequest(req) as { id: UserId }).id;
			const { packageId, cryptoCurrency = 'USDT' } = req.body;

			if (!packageId) return res.status(400).json({ error: 'packageId is required' });

			const [pkg] = await db
				.select()
				.from(dgtPackages)
				.where(eq(dgtPackages.id, packageId));
			if (!pkg || !pkg.isActive) return res.status(404).json({ error: 'Package not found' });

			// Generate merchant order id
			const merchantOrderId = `pkg_${pkg.id}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

			// Create CCPayment deposit link
			const depositUrl = await ccpaymentService.createDepositLink({
				amount: Number(pkg.usdPrice),
				currency: cryptoCurrency,
				orderId: merchantOrderId,
				productName: pkg.name,
				redirectUrl: process.env.CCPAYMENT_REDIRECT_URL || 'https://degentalk.com/wallet',
				notifyUrl: process.env.CCPAYMENT_NOTIFY_URL || 'https://degentalk.com/api/ccpayment/webhook'
			});

			// Insert purchase order
			const [order] = await db
				.insert(dgtPurchaseOrders)
				.values({
					userId,
					dgtAmountRequested: pkg.dgtAmount,
					cryptoAmountExpected: pkg.usdPrice,
					cryptoCurrencyExpected: cryptoCurrency,
					ccpaymentReference: merchantOrderId,
					status: 'pending'
				})
				.returning();

			res.status(201).json({ order, depositUrl });
		} catch (error) {
			logger.error('WALLET_CONTROLLER', 'Error creating purchase order', error);
			res.status(500).json({ error: 'Failed to create purchase order' });
		}
	}
}

// Export a singleton instance
export const walletController = new WalletController();
