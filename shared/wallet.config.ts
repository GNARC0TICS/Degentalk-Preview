import type { UserId } from './types/ids';

// Unified Wallet System Configuration
// Consolidated from 3 separate configs for single source of truth

export interface WalletFeatureGate {
	id: string;
	name: string;
	description: string;
	enabled: boolean;
	minLevel?: number;
	devOnly?: boolean;
	rolloutPercentage?: number;
}

export interface WalletConfig {
	ccpayment: {
		autoSwapEnabled: boolean;
		autoWithdrawEnabled: boolean;
		testNetworkEnabled: boolean;
		rateLockEnabled: boolean;
	};
	features: {
		allowCryptoWithdrawals: boolean;
		allowCryptoSwaps: boolean;
		allowDGTSpending: boolean;
		allowInternalTransfers: boolean;
		allowManualCredits: boolean;
	};
	dgt: {
		usdPrice: number;
		minDepositUSD: number;
		maxDGTBalance: number;
	};
	limits: {
		maxDGTTransfer: number;
		maxCryptoWithdrawal: number;
		dailyWithdrawalLimit: number;
	};
}

export const walletConfig = {
	// Basic feature flags
	WALLET_ENABLED: process.env.NODE_ENV === 'development' || process.env.WALLET_ENABLED === 'true',
	DEPOSITS_ENABLED: true,
	WITHDRAWALS_ENABLED: true,
	INTERNAL_TRANSFERS_ENABLED: true,

	// Auto-conversion settings (admin hot-swappable)
	AUTO_CONVERT_DEPOSITS: true, // Auto-convert crypto deposits to DGT
	MANUAL_CONVERSION_ALLOWED: false, // Allow users to manually convert instead
	CONVERSION_RATE_BUFFER: 0.02, // 2% buffer on conversions to account for rate fluctuations

	// Supported tokens
	SUPPORTED_TOKENS: ['DGT', 'USDT'] as const,

	// DGT configuration
	DGT: {
		PRICE_USD: 0.1, // Pegged price
		DECIMALS: 8,
		SYMBOL: 'DGT',
		NAME: 'Degentalk Token'
	},

	// Limits
	LIMITS: {
		MIN_DEPOSIT_USD: 10,
		MAX_DEPOSIT_USD: 10000,
		MIN_WITHDRAWAL_USD: 50,
		MAX_WITHDRAWAL_USD: 5000,
		DAILY_TIP_LIMIT: 1000, // DGT
		DAILY_WITHDRAWAL_LIMIT: 10000, // USD
		MAX_TIP_AMOUNT: 500 // DGT per tip
	},

	// Cooldowns (in seconds)
	COOLDOWNS: {
		WITHDRAWAL_COOLDOWN: 86400, // 24 hours
		TIP_COOLDOWN: 60 // 1 minute between tips
	},

	// Fees
	FEES: {
		DEPOSIT_FEE_PERCENT: 0, // No deposit fee
		WITHDRAWAL_FEE_PERCENT: 2, // 2% withdrawal fee
		WITHDRAWAL_FLAT_FEE_USD: 5 // $5 flat fee
	},

	// Requirements
	REQUIREMENTS: {
		MIN_LEVEL_TO_TIP: 0, // No level requirement for now
		MIN_LEVEL_TO_WITHDRAW: 5, // Level 5 required to withdraw
		EMAIL_VERIFIED_FOR_WITHDRAWAL: true
	},

	// CCPayment Configuration
	CCPAYMENT: {
		APP_ID: process.env.CCPAYMENT_APP_ID || '',
		APP_SECRET: process.env.CCPAYMENT_APP_SECRET || '',
		API_URL: 'https://api.ccpayment.com/v1',
		WEBHOOK_PATH: '/api/webhook/ccpayment',
		SUPPORTED_NETWORKS: {
			USDT: ['TRC20', 'ERC20', 'BEP20'],
			ETH: ['Ethereum', 'Arbitrum', 'Optimism']
		}
	},

	// Development mode
	DEV_MODE: {
		MOCK_CCPAYMENT:
			process.env.NODE_ENV === 'development' && process.env.MOCK_CCPAYMENT !== 'false',
		ALLOW_DEV_TOPUP: process.env.NODE_ENV === 'development',
		BYPASS_LIMITS:
			process.env.NODE_ENV === 'development' && process.env.BYPASS_WALLET_LIMITS === 'true'
	}
} as const;

export type SupportedToken = (typeof walletConfig.SUPPORTED_TOKENS)[number];
export const WALLET_FEATURE_GATES: WalletFeatureGate[] = [
	{
		id: 'wallet_basic',
		name: 'Basic Wallet',
		description: 'Access to DGT balance and basic wallet features',
		enabled: true,
		minLevel: 0
	},
	{
		id: 'wallet_deposits',
		name: 'Crypto Deposits',
		description: 'Deposit crypto to buy DGT tokens',
		enabled: true,
		minLevel: 1
	},
	{
		id: 'wallet_withdrawals',
		name: 'Crypto Withdrawals',
		description: 'Convert DGT to crypto and withdraw',
		enabled: true,
		minLevel: 5
	},
	{
		id: 'wallet_tipping',
		name: 'User Tipping',
		description: 'Send DGT tips to other users',
		enabled: true,
		minLevel: 2
	},
	{
		id: 'wallet_shop',
		name: 'Shop Purchases',
		description: 'Buy items from the shop with DGT',
		enabled: true,
		minLevel: 0
	},
	{
		id: 'wallet_rain',
		name: 'Rain Events',
		description: 'Participate in DGT rain events',
		enabled: true,
		minLevel: 3
	},
	{
		id: 'wallet_advanced',
		name: 'Advanced Wallet',
		description: 'Advanced wallet features and analytics',
		enabled: true,
		minLevel: 10
	},
	{
		id: 'wallet_beta',
		name: 'Beta Wallet Features',
		description: 'Access to experimental wallet features',
		enabled: false,
		minLevel: 15,
		rolloutPercentage: 10 // Only 10% of eligible users
	},
	{
		id: 'wallet_dev',
		name: 'Development Tools',
		description: 'Wallet development and testing tools',
		enabled: true,
		devOnly: true
	}
];

// Feature checking utilities
export class WalletFeatureChecker {
	/**
	 * Check if user has access to a wallet feature
	 */
	static hasAccess(
		featureId: string,
		userLevel: number,
		isDev: boolean = false,
		userId?: UserId
	): { hasAccess: boolean; reason?: string } {
		const feature = WALLET_FEATURE_GATES.find((f) => f.id === featureId);

		if (!feature) {
			return { hasAccess: false, reason: 'Feature not found' };
		}

		if (!feature.enabled) {
			return { hasAccess: false, reason: 'Feature is disabled' };
		}

		if (feature.devOnly && !isDev) {
			return { hasAccess: false, reason: 'Development only feature' };
		}

		if (feature.minLevel && userLevel < feature.minLevel) {
			return {
				hasAccess: false,
				reason: `Requires level ${feature.minLevel} (current: ${userLevel})`
			};
		}

		// Check rollout percentage
		if (feature.rolloutPercentage && userId) {
			// Simple hash function to get a number from the userId string
			const getNumericHash = (str: string) => {
				let hash = 0;
				for (let i = 0; i < str.length; i++) {
					const char = str.charCodeAt(i);
					hash = (hash << 5) - hash + char;
					hash |= 0; // Convert to 32bit integer
				}
				return Math.abs(hash);
			};

			const userHash = getNumericHash(userId) % 100;
			if (userHash >= feature.rolloutPercentage) {
				return { hasAccess: false, reason: 'Not in rollout group' };
			}
		}

		return { hasAccess: true };
	}

	/**
	 * Get all wallet features for a user
	 */
	static getUserFeatures(
		userLevel: number,
		isDev: boolean = false,
		userId?: UserId
	): Array<WalletFeatureGate & { hasAccess: boolean; reason?: string }> {
		return WALLET_FEATURE_GATES.map((feature) => ({
			...feature,
			...this.hasAccess(feature.id, userLevel, isDev, userId)
		}));
	}

	/**
	 * Check multiple features at once
	 */
	static checkFeatures(
		featureIds: string[],
		userLevel: number,
		isDev: boolean = false,
		userId?: UserId
	): Record<string, boolean> {
		const result: Record<string, boolean> = {};

		featureIds.forEach((featureId) => {
			result[featureId] = this.hasAccess(featureId, userLevel, isDev, userId).hasAccess;
		});

		return result;
	}
}

// Common feature combinations
export const WALLET_FEATURE_SETS = {
	BASIC: ['wallet_basic', 'wallet_shop'],
	STANDARD: ['wallet_basic', 'wallet_deposits', 'wallet_tipping', 'wallet_shop'],
	ADVANCED: [
		'wallet_basic',
		'wallet_deposits',
		'wallet_withdrawals',
		'wallet_tipping',
		'wallet_shop',
		'wallet_rain'
	],
	PREMIUM: [
		'wallet_basic',
		'wallet_deposits',
		'wallet_withdrawals',
		'wallet_tipping',
		'wallet_shop',
		'wallet_rain',
		'wallet_advanced'
	],
	DEV: [
		'wallet_basic',
		'wallet_deposits',
		'wallet_withdrawals',
		'wallet_tipping',
		'wallet_shop',
		'wallet_rain',
		'wallet_advanced',
		'wallet_dev'
	]
} as const;
