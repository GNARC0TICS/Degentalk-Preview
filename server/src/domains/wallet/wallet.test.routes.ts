import { userService } from '@server/src/core/services/user.service';
import { Router } from 'express';
import { walletTestController } from './wallet.test.controller';
import { isAuthenticated, isAuthenticatedOptional } from '../auth/middleware/auth.middleware';
import { isDevMode } from '@server/src/utils/environment';

const router = Router();

/**
 * Test Routes for CCPayment Wallet Creation
 *
 * These routes are only available in development mode for testing
 * wallet creation flows and webhook simulations.
 */

// Middleware to ensure dev mode for most test routes
const ensureDevMode = (req: any, res: any, next: any) => {
	if (!isDevMode() && userService.getUserFromRequest(req)?.role !== 'admin') {
		return res.status(403).json({
			error: 'Test endpoints only available in development mode or for admins'
		});
	}
	next();
};

/**
 * Test wallet creation for authenticated user or specified user
 * POST /api/wallet/test/create-wallet
 *
 * Body: { userId?: string, testMode?: boolean }
 */
router.post(
	'/create-wallet',
	isAuthenticated,
	ensureDevMode,
	walletTestController.testCreateWallet.bind(walletTestController)
);

/**
 * Simulate complete signup flow with wallet creation
 * POST /api/wallet/test/simulate-signup
 *
 * Body: { username?: string, email?: string, skipWalletCreation?: boolean }
 */
router.post(
	'/simulate-signup',
	ensureDevMode,
	walletTestController.simulateSignupFlow.bind(walletTestController)
);

/**
 * Simulate webhook events for testing
 * POST /api/wallet/test/simulate-webhook
 *
 * Body: { eventType: string, userId?: string, amount?: string, currency?: string }
 */
router.post(
	'/simulate-webhook',
	isAuthenticatedOptional,
	ensureDevMode,
	walletTestController.simulateWebhookEvent.bind(walletTestController)
);

/**
 * Get detailed debug information for wallet testing
 * GET /api/wallet/test/debug/:userId?
 */
router.get(
	'/debug/:userId?',
	isAuthenticatedOptional,
	walletTestController.getWalletDebugInfo.bind(walletTestController)
);

/**
 * Quick health check for test system
 * GET /api/wallet/test/health
 */
router.get('/health', (req, res) => {
	res.json({
		status: 'ok',
		timestamp: new Date().toISOString(),
		environment: {
			isDevMode: isDevMode(),
			nodeEnv: process.env.NODE_ENV,
			walletEnabled: process.env.NEXT_PUBLIC_FEATURE_WALLET === 'true',
			mockCcpayment: process.env.MOCK_CCPAYMENT === 'true'
		},
		testEndpoints: {
			createWallet: '/api/wallet/test/create-wallet',
			simulateSignup: '/api/wallet/test/simulate-signup',
			simulateWebhook: '/api/wallet/test/simulate-webhook',
			debug: '/api/wallet/test/debug/:userId?'
		}
	});
});

export default router;
