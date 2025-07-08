import { userService } from '@server/src/core/services/user.service';
import { Router } from 'express';
import { WalletService } from './wallet.service';
import { UserManagementService } from './user-management.service';
import { isDevMode } from '@server/src/utils/environment';
import walletTestRoutes from './wallet.test.routes';
import { EconomyTransformer } from '../economy/transformers/economy.transformer';
import { 
	toPublicList,
	sendSuccessResponse,
	sendErrorResponse,
	sendTransformedResponse,
	sendTransformedListResponse
} from '@server/src/core/utils/transformer.helpers';
import { logger } from "../../core/logger";

const router = Router();
const walletService = new WalletService();
const userManagementService = new UserManagementService();

// Mount test routes in development mode
if (isDevMode()) {
	router.use('/test', walletTestRoutes);
}

/**
 * Wallet API Routes
 *
 * Provides endpoints for cryptocurrency wallet operations via CCPayment integration.
 */

/**
 * Initialize user wallet
 * POST /api/wallet/initialize
 */
router.post('/initialize', async (req, res) => {
	try {
		// In production, get userId from authenticated session
		// For development, accept it from request body
		const userId = req.body.userId || userService.getUserFromRequest(req)?.id;

		if (!userId) {
			return sendErrorResponse(res, 'User not authenticated', 401);
		}

		const result = await userManagementService.initializeUserWallet(userId);

		sendTransformedResponse(res, result, (data) => 
			EconomyTransformer.toAuthenticatedWalletInit(data, userService.getUserFromRequest(req))
		);
	} catch (error) {
		logger.error('Error initializing wallet:', error);
		sendErrorResponse(res, 'Failed to initialize wallet', 500);
	}
});

/**
 * Get user wallet balances
 * GET /api/wallet/balances
 */
router.get('/balances', async (req, res) => {
	try {
		const userId = (req.query.userId as string) || userService.getUserFromRequest(req)?.id;

		if (!userId) {
			return sendErrorResponse(res, 'User not authenticated', 401);
		}

		const balances = await walletService.getUserBalances(userId);

		// Get requesting user for proper transformation
		const requestingUser = userService.getUserFromRequest(req);
		
		// Transform balances using EconomyTransformer
		// If requesting their own wallet, use authenticated view
		const transformedBalances = balances.map(wallet => {
			if (requestingUser && wallet.userId === requestingUser.id) {
				return EconomyTransformer.toAuthenticatedWallet(wallet, requestingUser);
			} else {
				return EconomyTransformer.toPublicWallet(wallet);
			}
		});

		sendSuccessResponse(res, transformedBalances);
	} catch (error) {
		logger.error('Error getting balances:', error);
		sendErrorResponse(res, 'Failed to retrieve balances', 500);
	}
});

/**
 * Get user deposit addresses
 * GET /api/wallet/deposit-addresses
 */
router.get('/deposit-addresses', async (req, res) => {
	try {
		const userId = (req.query.userId as string) || userService.getUserFromRequest(req)?.id;

		if (!userId) {
			return sendErrorResponse(res, 'User not authenticated', 401);
		}

		const addresses = await walletService.getUserDepositAddresses(userId);

		// Get requesting user for proper transformation  
		const requestingUser = userService.getUserFromRequest(req);
		
		// Transform crypto wallets using EconomyTransformer
		// Only show addresses to the wallet owner for security
		const transformedAddresses = addresses.map(cryptoWallet => {
			if (requestingUser && cryptoWallet.userId === requestingUser.id) {
				return EconomyTransformer.toAuthenticatedCryptoWallet(cryptoWallet, requestingUser);
			} else {
				// For security, only show public info (no addresses)
				return EconomyTransformer.toPublicCryptoWallet(cryptoWallet);
			}
		});

		sendSuccessResponse(res, transformedAddresses);
	} catch (error) {
		logger.error('Error getting deposit addresses:', error);
		sendErrorResponse(res, 'Failed to retrieve deposit addresses', 500);
	}
});

/**
 * Withdraw to blockchain
 * POST /api/wallet/withdraw
 */
router.post('/withdraw', async (req, res) => {
	try {
		const userId = req.body.userId || userService.getUserFromRequest(req)?.id;
		const { coinId, amount, toAddress, memo } = req.body;

		if (!userId) {
			return sendErrorResponse(res, 'User not authenticated', 401);
		}

		if (!coinId || !amount || !toAddress) {
			return sendErrorResponse(res, 'Missing required fields: coinId, amount, toAddress', 400);
		}

		const recordId = await walletService.withdrawToBlockchain(userId, {
			coinId,
			amount,
			toAddress,
			memo
		});

		sendSuccessResponse(res, { recordId });
	} catch (error) {
		logger.error('Error processing withdrawal:', error);
		sendErrorResponse(res, 'Failed to process withdrawal', 500);
	}
});

/**
 * Transfer to another user
 * POST /api/wallet/transfer
 */
router.post('/transfer', async (req, res) => {
	try {
		const fromUserId = req.body.fromUserId || userService.getUserFromRequest(req)?.id;
		const { toUserId, coinId, amount, note } = req.body;

		if (!fromUserId) {
			return sendErrorResponse(res, 'User not authenticated', 401);
		}

		if (!toUserId || !coinId || !amount) {
			return sendErrorResponse(res, 'Missing required fields: toUserId, coinId, amount', 400);
		}

		const recordId = await walletService.transferToUser(fromUserId, {
			toUserId,
			coinId,
			amount,
			note
		});

		sendSuccessResponse(res, { recordId });
	} catch (error) {
		logger.error('Error processing transfer:', error);
		sendErrorResponse(res, 'Failed to process transfer', 500);
	}
});

/**
 * Swap cryptocurrencies
 * POST /api/wallet/swap
 */
router.post('/swap', async (req, res) => {
	try {
		const userId = req.body.userId || userService.getUserFromRequest(req)?.id;
		const { fromCoinId, toCoinId, fromAmount } = req.body;

		if (!userId) {
			return sendErrorResponse(res, 'User not authenticated', 401);
		}

		if (!fromCoinId || !toCoinId || !fromAmount) {
			return sendErrorResponse(res, 'Missing required fields: fromCoinId, toCoinId, fromAmount', 400);
		}

		const recordId = await walletService.swapCrypto(userId, {
			fromCoinId,
			toCoinId,
			fromAmount
		});

		sendSuccessResponse(res, { recordId });
	} catch (error) {
		logger.error('Error processing swap:', error);
		sendErrorResponse(res, 'Failed to process swap', 500);
	}
});

/**
 * Get transaction history
 * GET /api/wallet/history
 */
router.get('/history', async (req, res) => {
	try {
		const userId = (req.query.userId as string) || userService.getUserFromRequest(req)?.id;
		const type = req.query.type as 'deposit' | 'withdrawal' | 'transfer' | 'swap' | undefined;
		const limit = parseInt(req.query.limit as string) || 50;
		const offset = parseInt(req.query.offset as string) || 0;

		if (!userId) {
			return sendErrorResponse(res, 'User not authenticated', 401);
		}

		const history = await walletService.getUserTransactionHistory(userId, {
			type,
			limit,
			offset
		});

		sendTransformedResponse(res, history, (data) => 
			EconomyTransformer.toAuthenticatedTransactionHistory(data, userService.getUserFromRequest(req))
		);
	} catch (error) {
		logger.error('Error getting transaction history:', error);
		sendErrorResponse(res, 'Failed to retrieve transaction history', 500);
	}
});

/**
 * Get supported cryptocurrencies
 * GET /api/wallet/supported-coins
 */
router.get('/supported-coins', async (req, res) => {
	try {
		const coins = await walletService.getSupportedCryptocurrencies();

		sendTransformedResponse(res, coins, EconomyTransformer.toPublicSupportedCoins);
	} catch (error) {
		logger.error('Error getting supported coins:', error);
		sendErrorResponse(res, 'Failed to retrieve supported coins', 500);
	}
});

/**
 * Check if user has wallet
 * GET /api/wallet/status
 */
router.get('/status', async (req, res) => {
	try {
		const userId = (req.query.userId as string) || userService.getUserFromRequest(req)?.id;

		if (!userId) {
			return sendErrorResponse(res, 'User not authenticated', 401);
		}

		const hasWallet = await userManagementService.hasCCPaymentAccount(userId);
		const ccpaymentUserId = await userManagementService.getCCPaymentUserId(userId);

		sendSuccessResponse(res, {
			hasWallet,
			ccpaymentUserId,
			isInitialized: !!ccpaymentUserId
		});
	} catch (error) {
		logger.error('Error checking wallet status:', error);
		sendErrorResponse(res, 'Failed to check wallet status', 500);
	}
});

export default router;
