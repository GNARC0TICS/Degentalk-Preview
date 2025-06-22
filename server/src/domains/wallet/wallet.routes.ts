import { Router } from 'express';
import { WalletService } from './wallet.service';
import { UserManagementService } from './user-management.service';

const router = Router();
const walletService = new WalletService();
const userManagementService = new UserManagementService();

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
		const userId = req.body.userId || req.user?.id;

		if (!userId) {
			return res.status(401).json({ error: 'User not authenticated' });
		}

		const result = await userManagementService.initializeUserWallet(userId);

		res.json({
			success: true,
			data: result
		});
	} catch (error) {
		console.error('Error initializing wallet:', error);
		res.status(500).json({
			error: 'Failed to initialize wallet',
			message: error instanceof Error ? error.message : 'Unknown error'
		});
	}
});

/**
 * Get user wallet balances
 * GET /api/wallet/balances
 */
router.get('/balances', async (req, res) => {
	try {
		const userId = (req.query.userId as string) || req.user?.id;

		if (!userId) {
			return res.status(401).json({ error: 'User not authenticated' });
		}

		const balances = await walletService.getUserBalances(userId);

		res.json({
			success: true,
			data: balances
		});
	} catch (error) {
		console.error('Error getting balances:', error);
		res.status(500).json({
			error: 'Failed to retrieve balances',
			message: error instanceof Error ? error.message : 'Unknown error'
		});
	}
});

/**
 * Get user deposit addresses
 * GET /api/wallet/deposit-addresses
 */
router.get('/deposit-addresses', async (req, res) => {
	try {
		const userId = (req.query.userId as string) || req.user?.id;

		if (!userId) {
			return res.status(401).json({ error: 'User not authenticated' });
		}

		const addresses = await walletService.getUserDepositAddresses(userId);

		res.json({
			success: true,
			data: addresses
		});
	} catch (error) {
		console.error('Error getting deposit addresses:', error);
		res.status(500).json({
			error: 'Failed to retrieve deposit addresses',
			message: error instanceof Error ? error.message : 'Unknown error'
		});
	}
});

/**
 * Withdraw to blockchain
 * POST /api/wallet/withdraw
 */
router.post('/withdraw', async (req, res) => {
	try {
		const userId = req.body.userId || req.user?.id;
		const { coinId, amount, toAddress, memo } = req.body;

		if (!userId) {
			return res.status(401).json({ error: 'User not authenticated' });
		}

		if (!coinId || !amount || !toAddress) {
			return res.status(400).json({
				error: 'Missing required fields: coinId, amount, toAddress'
			});
		}

		const recordId = await walletService.withdrawToBlockchain(userId, {
			coinId: parseInt(coinId),
			amount,
			toAddress,
			memo
		});

		res.json({
			success: true,
			data: { recordId }
		});
	} catch (error) {
		console.error('Error processing withdrawal:', error);
		res.status(500).json({
			error: 'Failed to process withdrawal',
			message: error instanceof Error ? error.message : 'Unknown error'
		});
	}
});

/**
 * Transfer to another user
 * POST /api/wallet/transfer
 */
router.post('/transfer', async (req, res) => {
	try {
		const fromUserId = req.body.fromUserId || req.user?.id;
		const { toUserId, coinId, amount, note } = req.body;

		if (!fromUserId) {
			return res.status(401).json({ error: 'User not authenticated' });
		}

		if (!toUserId || !coinId || !amount) {
			return res.status(400).json({
				error: 'Missing required fields: toUserId, coinId, amount'
			});
		}

		const recordId = await walletService.transferToUser(fromUserId, {
			toUserId,
			coinId: parseInt(coinId),
			amount,
			note
		});

		res.json({
			success: true,
			data: { recordId }
		});
	} catch (error) {
		console.error('Error processing transfer:', error);
		res.status(500).json({
			error: 'Failed to process transfer',
			message: error instanceof Error ? error.message : 'Unknown error'
		});
	}
});

/**
 * Swap cryptocurrencies
 * POST /api/wallet/swap
 */
router.post('/swap', async (req, res) => {
	try {
		const userId = req.body.userId || req.user?.id;
		const { fromCoinId, toCoinId, fromAmount } = req.body;

		if (!userId) {
			return res.status(401).json({ error: 'User not authenticated' });
		}

		if (!fromCoinId || !toCoinId || !fromAmount) {
			return res.status(400).json({
				error: 'Missing required fields: fromCoinId, toCoinId, fromAmount'
			});
		}

		const recordId = await walletService.swapCrypto(userId, {
			fromCoinId: parseInt(fromCoinId),
			toCoinId: parseInt(toCoinId),
			fromAmount
		});

		res.json({
			success: true,
			data: { recordId }
		});
	} catch (error) {
		console.error('Error processing swap:', error);
		res.status(500).json({
			error: 'Failed to process swap',
			message: error instanceof Error ? error.message : 'Unknown error'
		});
	}
});

/**
 * Get transaction history
 * GET /api/wallet/history
 */
router.get('/history', async (req, res) => {
	try {
		const userId = (req.query.userId as string) || req.user?.id;
		const type = req.query.type as 'deposit' | 'withdrawal' | 'transfer' | 'swap' | undefined;
		const limit = parseInt(req.query.limit as string) || 50;
		const offset = parseInt(req.query.offset as string) || 0;

		if (!userId) {
			return res.status(401).json({ error: 'User not authenticated' });
		}

		const history = await walletService.getUserTransactionHistory(userId, {
			type,
			limit,
			offset
		});

		res.json({
			success: true,
			data: history
		});
	} catch (error) {
		console.error('Error getting transaction history:', error);
		res.status(500).json({
			error: 'Failed to retrieve transaction history',
			message: error instanceof Error ? error.message : 'Unknown error'
		});
	}
});

/**
 * Get supported cryptocurrencies
 * GET /api/wallet/supported-coins
 */
router.get('/supported-coins', async (req, res) => {
	try {
		const coins = await walletService.getSupportedCryptocurrencies();

		res.json({
			success: true,
			data: coins
		});
	} catch (error) {
		console.error('Error getting supported coins:', error);
		res.status(500).json({
			error: 'Failed to retrieve supported coins',
			message: error instanceof Error ? error.message : 'Unknown error'
		});
	}
});

/**
 * Check if user has wallet
 * GET /api/wallet/status
 */
router.get('/status', async (req, res) => {
	try {
		const userId = (req.query.userId as string) || req.user?.id;

		if (!userId) {
			return res.status(401).json({ error: 'User not authenticated' });
		}

		const hasWallet = await userManagementService.hasCCPaymentAccount(userId);
		const ccpaymentUserId = await userManagementService.getCCPaymentUserId(userId);

		res.json({
			success: true,
			data: {
				hasWallet,
				ccpaymentUserId,
				isInitialized: !!ccpaymentUserId
			}
		});
	} catch (error) {
		console.error('Error checking wallet status:', error);
		res.status(500).json({
			error: 'Failed to check wallet status',
			message: error instanceof Error ? error.message : 'Unknown error'
		});
	}
});

export default router;
