import { db } from '@db';
import { ccpaymentUsers, users, cryptoWallets } from '@schema';
import { eq, and } from 'drizzle-orm';
import { CCPaymentService } from './ccpayment.service';
import type { CoinId } from '@shared/types/ids';
import { logger } from "../../core/logger";

/**
 * User Management Service for CCPayment Integration
 *
 * Handles the mapping between Degentalk users and CCPayment user accounts.
 * Ensures each Degentalk user has a corresponding CCPayment user for wallet operations.
 */
export class UserManagementService {
	private ccpaymentService: CCPaymentService;

	constructor() {
		this.ccpaymentService = new CCPaymentService();
	}

	/**
	 * Get or create a CCPayment user for a Degentalk user
	 */
	async getOrCreateCCPaymentUser(userId: string): Promise<string> {
		try {
			// First check if user already has a CCPayment mapping
			const existingMapping = await db
				.select()
				.from(ccpaymentUsers)
				.where(eq(ccpaymentUsers.userId, userId))
				.limit(1);

			if (existingMapping.length > 0) {
				return existingMapping[0].ccpaymentUserId;
			}

			// Get user details from Degentalk
			const userDetails = await db
				.select({
					id: users.id,
					username: users.username,
					email: users.email
				})
				.from(users)
				.where(eq(users.id, userId))
				.limit(1);

			if (userDetails.length === 0) {
				throw new Error('User not found');
			}

			const user = userDetails[0];

			// Create CCPayment user
			const ccpaymentUserId = await this.ccpaymentService.createUser({
				uid: user.id,
				name: user.username,
				email: user.email || `${user.username}@degentalk.com` // Fallback email
			});

			// Store the mapping
			await db.insert(ccpaymentUsers).values({
				userId: user.id,
				ccpaymentUserId: ccpaymentUserId
			});

			return ccpaymentUserId;
		} catch (error) {
			logger.error('Error getting/creating CCPayment user:', error);
			throw new Error('Failed to initialize user wallet');
		}
	}

	/**
	 * Get CCPayment user ID for a Degentalk user
	 */
	async getCCPaymentUserId(userId: string): Promise<string | null> {
		try {
			const mapping = await db
				.select()
				.from(ccpaymentUsers)
				.where(eq(ccpaymentUsers.userId, userId))
				.limit(1);

			return mapping.length > 0 ? mapping[0].ccpaymentUserId : null;
		} catch (error) {
			logger.error('Error getting CCPayment user ID:', error);
			return null;
		}
	}

	/**
	 * Get Degentalk user ID from CCPayment user ID
	 */
	async getDegentalkUserId(ccpaymentUserId: string): Promise<string | null> {
		try {
			const mapping = await db
				.select()
				.from(ccpaymentUsers)
				.where(eq(ccpaymentUsers.ccpaymentUserId, ccpaymentUserId))
				.limit(1);

			return mapping.length > 0 ? mapping[0].userId : null;
		} catch (error) {
			logger.error('Error getting Degentalk user ID:', error);
			return null;
		}
	}

	/**
	 * Check if user has CCPayment account
	 */
	async hasCCPaymentAccount(userId: string): Promise<boolean> {
		try {
			const mapping = await db
				.select()
				.from(ccpaymentUsers)
				.where(eq(ccpaymentUsers.userId, userId))
				.limit(1);

			return mapping.length > 0;
		} catch (error) {
			logger.error('Error checking CCPayment account:', error);
			return false;
		}
	}

	/**
	 * Initialize wallet system for a user (creates CCPayment account and default wallets)
	 */
	async initializeUserWallet(userId: string): Promise<{
		ccpaymentUserId: string;
		wallets: Array<{
			coinId: CoinId;
			coinSymbol: string;
			chain: string;
			address: string;
		}>;
	}> {
		try {
			// Get or create CCPayment user
			const ccpaymentUserId = await this.getOrCreateCCPaymentUser(userId);

			// Get supported coins for wallet creation
			const supportedCoins = await this.ccpaymentService.getSupportedCoins();

			// Create wallets for major cryptocurrencies (ETH, BTC, USDT)
			const primaryCoins = supportedCoins.filter((coin) =>
				['ETH', 'BTC', 'USDT'].includes(coin.coinSymbol.toUpperCase())
			);

			const wallets = [];
			for (const coin of primaryCoins) {
				try {
					const address = await this.ccpaymentService.createWallet({
						uid: ccpaymentUserId,
						coinId: coin.coinId,
						chain: coin.chain
					});

					// Store wallet in database
					await db.insert(cryptoWallets).values({
						userId: userId,
						ccpaymentUserId: ccpaymentUserId,
						coinId: coin.coinId,
						coinSymbol: coin.coinSymbol,
						chain: coin.chain,
						address: address
					});

					wallets.push({
						coinId: coin.coinId,
						coinSymbol: coin.coinSymbol,
						chain: coin.chain,
						address: address
					});
				} catch (walletError) {
					logger.error(`Error creating wallet for ${coin.coinSymbol}:`, walletError);
					// Continue with other wallets even if one fails
				}
			}

			return {
				ccpaymentUserId,
				wallets
			};
		} catch (error) {
			logger.error('Error initializing user wallet:', error);
			throw new Error('Failed to initialize wallet system');
		}
	}

	/**
	 * Ensure user has all necessary wallets for supported coins
	 */
	async ensureUserWallets(userId: string, coinIds?: CoinId[]): Promise<void> {
		try {
			const ccpaymentUserId = await this.getOrCreateCCPaymentUser(userId);

			// Get all supported coins if no specific coins requested
			const supportedCoins = await this.ccpaymentService.getSupportedCoins();
			const targetCoins = coinIds
				? supportedCoins.filter((coin) => coinIds.includes(coin.coinId))
				: supportedCoins;

			// Check existing wallets
			const existingWallets = await db
				.select()
				.from(cryptoWallets)
				.where(eq(cryptoWallets.userId, userId));

			const existingCoinIds = existingWallets.map((w) => w.coinId);

			// Create missing wallets
			for (const coin of targetCoins) {
				if (!existingCoinIds.includes(coin.coinId)) {
					try {
						const address = await this.ccpaymentService.createWallet({
							uid: ccpaymentUserId,
							coinId: coin.coinId,
							chain: coin.chain
						});

						await db.insert(cryptoWallets).values({
							userId: userId,
							ccpaymentUserId: ccpaymentUserId,
							coinId: coin.coinId,
							coinSymbol: coin.coinSymbol,
							chain: coin.chain,
							address: address
						});
					} catch (walletError) {
						logger.error(`Error creating wallet for ${coin.coinSymbol}:`, walletError);
					}
				}
			}
		} catch (error) {
			logger.error('Error ensuring user wallets:', error);
			throw new Error('Failed to ensure user wallets');
		}
	}
}
