import { userService } from '@server/src/core/services/user.service';
import type { Request, Response } from 'express';
import { logger } from '@server/src/core/logger';
import { walletService } from './wallet.service';
import { dgtService } from './dgt.service';
import { isDevMode } from '@server/src/utils/environment';
import { sendErrorResponse, sendSuccessResponse } from '@server/src/core/utils/transformer.helpers';

/**
 * Test Controller for CCPayment Wallet Creation
 *
 * Provides endpoints for testing wallet creation flow in development
 * and sandbox environments. Includes simulation capabilities.
 */
export class WalletTestController {
	/**
	 * Test wallet creation for a specific user
	 * POST /api/wallet/test/create-wallet
	 */
	async testCreateWallet(req: Request, res: Response) {
		try {
			// Security: Only allow in dev mode or for admins
			if (
				!isDevMode() &&
				(!userService.getUserFromRequest(req) ||
					(userService.getUserFromRequest(req) as any).role !== 'admin')
			) {
				sendErrorResponse(res, 'Wallet testing only available in development mode or for admins', 403);
				return;
			}

			const { userId, testMode = true } = req.body;
			const targetUserId = userId || (userService.getUserFromRequest(req) as any)?.id;

			if (!targetUserId) {
				sendErrorResponse(res, 'User ID required', 400);
				return;
			}

			logger.info('WalletTestController', 'Testing wallet creation', {
				targetUserId,
				testMode,
				requestingUser: (userService.getUserFromRequest(req) as any)?.id
			});

			// 1. Initialize DGT wallet
			const dgtResult = await dgtService.initializeUserWallet(targetUserId);
			logger.info('WalletTestController', 'DGT wallet initialized', {
				userId: targetUserId,
				dgtBalance: dgtResult.balance
			});

			// 2. Initialize CCPayment wallet
			const ccpaymentId = await walletService.ensureCcPaymentWallet(targetUserId);
			logger.info('WalletTestController', 'CCPayment wallet initialized', {
				userId: targetUserId,
				ccpaymentId
			});

			// 3. Get wallet balances to verify
			const balances = await walletService.getUserBalances(targetUserId);

			// 4. Get deposit addresses
			const depositAddresses = await walletService.getUserDepositAddresses(targetUserId);

			// 5. Add test DGT if in test mode
			let testDgtAdded = null;
			if (testMode && isDevMode()) {
				const testAmount = 100; // 100 DGT welcome bonus
				testDgtAdded = await dgtService.awardDGT(targetUserId, testAmount, {
					reason: 'WELCOME_BONUS',
					metadata: { testWalletCreation: true }
				});
				logger.info('WalletTestController', 'Test DGT added', {
					userId: targetUserId,
					amount: testAmount,
					newBalance: testDgtAdded.newBalance
				});
			}

			sendSuccessResponse(res, {
				message: 'Wallet creation test completed successfully',
				data: {
					userId: targetUserId,
					ccpaymentId,
					dgtWallet: {
						initialized: true,
						balance: testDgtAdded?.newBalance || balances.dgt.balance,
						testDgtAdded: testDgtAdded?.amount || 0
					},
					cryptoWallets: {
						initialized: true,
						count: depositAddresses.length,
						addresses: depositAddresses
					},
					balances,
					testMode
				}
			});
		} catch (error) {
			logger.error('WalletTestController', 'Wallet creation test failed', {
				error: error.message,
				stack: error.stack,
				userId: req.body?.userId
			});

			sendErrorResponse(res, 'Wallet creation test failed', 500);
		}
	}

	/**
	 * Simulate signup with wallet creation
	 * POST /api/wallet/test/simulate-signup
	 */
	async simulateSignupFlow(req: Request, res: Response) {
		try {
			// Security: Only allow in dev mode
			if (!isDevMode()) {
				sendErrorResponse(res, 'Signup simulation only available in development mode', 403);
				return;
			}

			const {
				username = `testuser_${Date.now()}`,
				email = `test_${Date.now()}@degentalk.com`,
				skipWalletCreation = false
			} = req.body;

			logger.info('WalletTestController', 'Simulating signup flow', {
				username,
				email,
				skipWalletCreation
			});

			// Mock user creation (would normally happen in auth.controller.ts)
			const mockUserId = `test_${Date.now()}`;

			let walletResult = null;
			if (!skipWalletCreation) {
				// Simulate the wallet creation that happens during signup
				walletResult = await this.performWalletCreation(mockUserId);
			}

			sendSuccessResponse(res, {
				message: 'Signup simulation completed',
				data: {
					user: {
						id: mockUserId,
						username,
						email,
						signupTime: new Date().toISOString()
					},
					wallet: walletResult,
					simulation: true,
					devMode: true
				}
			});
		} catch (error) {
			logger.error('WalletTestController', 'Signup simulation failed', {
				error: error.message,
				stack: error.stack
			});

			sendErrorResponse(res, 'Signup simulation failed', 500);
		}
	}

	/**
	 * Test webhook event simulation
	 * POST /api/wallet/test/simulate-webhook
	 */
	async simulateWebhookEvent(req: Request, res: Response) {
		try {
			// Security: Only allow in dev mode
			if (!isDevMode()) {
				sendErrorResponse(res, 'Webhook simulation only available in development mode', 403);
				return;
			}

			const {
				eventType = 'wallet_created',
				userId,
				amount = '10.00',
				currency = 'USDT'
			} = req.body;

			const targetUserId = userId || (userService.getUserFromRequest(req) as any)?.id;

			if (!targetUserId) {
				sendErrorResponse(res, 'User ID required for webhook simulation', 400);
				return;
			}

			logger.info('WalletTestController', 'Simulating webhook event', {
				eventType,
				targetUserId,
				amount,
				currency
			});

			// Simulate different webhook events
			let result;
			switch (eventType) {
				case 'wallet_created':
					result = await this.simulateWalletCreatedWebhook(targetUserId);
					break;
				case 'deposit_completed':
					result = await this.simulateDepositWebhook(targetUserId, amount, currency);
					break;
				case 'wallet_failed':
					result = await this.simulateWalletFailedWebhook(targetUserId);
					break;
				default:
					throw new Error(`Unknown webhook event type: ${eventType}`);
			}

			sendSuccessResponse(res, {
				message: `Webhook event '${eventType}' simulated successfully`,
				data: result
			});
		} catch (error) {
			logger.error('WalletTestController', 'Webhook simulation failed', {
				error: error.message,
				eventType: req.body?.eventType
			});

			sendErrorResponse(res, 'Webhook simulation failed', 500);
		}
	}

	/**
	 * Get detailed wallet test info for debugging
	 * GET /api/wallet/test/debug/:userId?
	 */
	async getWalletDebugInfo(req: Request, res: Response) {
		try {
			// Security: Only allow in dev mode or for the user themselves/admins
			if (
				!isDevMode() &&
				(!userService.getUserFromRequest(req) ||
					((userService.getUserFromRequest(req) as any).role !== 'admin' &&
						(userService.getUserFromRequest(req) as any).id !== req.params.userId))
			) {
				sendErrorResponse(res, 'Debug info access denied', 403);
				return;
			}

			const targetUserId = req.params.userId || (userService.getUserFromRequest(req) as any)?.id;

			if (!targetUserId) {
				sendErrorResponse(res, 'User ID required', 400);
				return;
			}

			// Get comprehensive wallet status
			const [balances, depositAddresses, dgtHistory, config] = await Promise.all([
				walletService.getUserBalances(targetUserId).catch((e) => ({ error: e.message })),
				walletService.getUserDepositAddresses(targetUserId).catch((e) => ({ error: e.message })),
				walletService
					.getDGTHistory(targetUserId, { limit: 10 })
					.catch((e) => ({ error: e.message })),
				walletService.getWalletConfig().catch((e) => ({ error: e.message }))
			]);

			sendSuccessResponse(res, {
				debug: {
					userId: targetUserId,
					timestamp: new Date().toISOString(),
					environment: {
						isDevMode: isDevMode(),
						nodeEnv: process.env.NODE_ENV,
						walletEnabled: process.env.NEXT_PUBLIC_FEATURE_WALLET,
						mockCcpayment: process.env.MOCK_CCPAYMENT
					},
					balances,
					depositAddresses,
					recentDgtHistory: dgtHistory,
					config
				}
			});
		} catch (error) {
			logger.error('WalletTestController', 'Debug info retrieval failed', {
				error: error.message,
				userId: req.params.userId
			});

			sendErrorResponse(res, 'Debug info retrieval failed', 500);
		}
	}

	// Private helper methods

	private async performWalletCreation(userId: string) {
		const startTime = Date.now();

		try {
			// Mirror the exact flow from auth.controller.ts
			const [dgtResult, ccpaymentId] = await Promise.all([
				dgtService.initializeUserWallet(userId),
				walletService.ensureCcPaymentWallet(userId)
			]);

			const creationTime = Date.now() - startTime;

			return {
				success: true,
				userId,
				dgt: {
					initialized: true,
					balance: dgtResult.balance
				},
				ccpayment: {
					initialized: true,
					ccpaymentId
				},
				performance: {
					creationTimeMs: creationTime,
					creationTimeOk: creationTime < 5000 // Should complete within 5 seconds
				}
			};
		} catch (error) {
			return {
				success: false,
				userId,
				error: error.message,
				performance: {
					creationTimeMs: Date.now() - startTime,
					failed: true
				}
			};
		}
	}

	private async simulateWalletCreatedWebhook(userId: string) {
		// Add welcome bonus DGT when wallet is "created"
		const welcomeAmount = 10; // 10 DGT welcome bonus

		const result = await dgtService.awardDGT(userId, welcomeAmount, {
			reason: 'WELCOME_BONUS',
			metadata: {
				source: 'webhook_simulation',
				event: 'wallet_created'
			}
		});

		return {
			event: 'wallet_created',
			userId,
			welcomeBonus: {
				amount: welcomeAmount,
				newBalance: result.newBalance
			}
		};
	}

	private async simulateDepositWebhook(userId: string, amount: string, currency: string) {
		// Convert crypto deposit to DGT (mock conversion at $0.10 per DGT)
		const usdAmount = parseFloat(amount);
		const dgtAmount = usdAmount / 0.1; // $0.10 per DGT

		const result = await dgtService.awardDGT(userId, dgtAmount, {
			reason: 'DEPOSIT_CONVERSION',
			metadata: {
				source: 'webhook_simulation',
				event: 'deposit_completed',
				originalAmount: amount,
				originalCurrency: currency,
				conversionRate: 0.1
			}
		});

		return {
			event: 'deposit_completed',
			userId,
			deposit: {
				originalAmount: amount,
				originalCurrency: currency,
				convertedDgt: dgtAmount,
				newBalance: result.newBalance
			}
		};
	}

	private async simulateWalletFailedWebhook(userId: string) {
		// Log wallet creation failure
		logger.warn('WalletTestController', 'Simulated wallet creation failure', {
			userId,
			simulation: true
		});

		return {
			event: 'wallet_failed',
			userId,
			failure: {
				reason: 'Simulated failure for testing',
				retryRecommended: true
			}
		};
	}
}

// Export singleton instance
export const walletTestController = new WalletTestController();
