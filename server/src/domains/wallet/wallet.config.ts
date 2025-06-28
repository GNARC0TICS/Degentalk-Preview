/**
 * Wallet Configuration
 *
 * Default configuration for the Degentalk wallet system.
 * These defaults can be overridden by database settings via the admin panel.
 */

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
		usdToDGTRate: number;
		minDepositUSD: number;
		maxDGTBalance: number;
	};
	limits: {
		depositsPerHour: number;
		tipsPerMinute: number;
		maxDGTTransfer: number;
		maxDailyCreditAmount: number;
	};
	security: {
		requireTwoFactorForLargeTransfers: boolean;
		largeTransferThreshold: number;
		auditAllTransactions: boolean;
	};
}

/**
 * Default wallet configuration
 * These values are used as fallbacks when database settings are not available
 */
export const defaultWalletConfig: WalletConfig = {
	ccpayment: {
		autoSwapEnabled: true, // ✅ All deposits auto-converted to USDT
		autoWithdrawEnabled: false, // ❌ Manual treasury management
		testNetworkEnabled: process.env.NODE_ENV !== 'production',
		rateLockEnabled: false // ❌ Fixed DGT pricing
	},
	features: {
		allowCryptoWithdrawals: false, // 🚫 Block user crypto withdrawals
		allowCryptoSwaps: false, // 🚫 Block user crypto swaps
		allowDGTSpending: true, // ✅ Allow DGT for shop, tips, etc.
		allowInternalTransfers: true, // ✅ Allow user-to-user DGT transfers
		allowManualCredits: true // ✅ Allow admin manual DGT credits
	},
	dgt: {
		usdPrice: 0.1, // $0.10 per DGT (fixed)
		usdToDGTRate: 10, // $1 USD = 10 DGT
		minDepositUSD: 1.0, // Minimum deposit threshold
		maxDGTBalance: 1000000 // Maximum DGT per user (anti-spam)
	},
	limits: {
		depositsPerHour: 10, // Max deposits per user per hour
		tipsPerMinute: 5, // Max tips per user per minute
		maxDGTTransfer: 1000, // Max DGT per single transfer
		maxDailyCreditAmount: 10000 // Max DGT admin can credit per day per user
	},
	security: {
		requireTwoFactorForLargeTransfers: false, // Future feature
		largeTransferThreshold: 500, // DGT amount threshold
		auditAllTransactions: true // Log all DGT movements
	}
};

/**
 * Wallet configuration keys for database storage
 */
export const WALLET_CONFIG_KEYS = {
	// CCPayment settings
	'wallet.ccpayment.autoSwapEnabled': 'ccpayment.autoSwapEnabled',
	'wallet.ccpayment.autoWithdrawEnabled': 'ccpayment.autoWithdrawEnabled',
	'wallet.ccpayment.testNetworkEnabled': 'ccpayment.testNetworkEnabled',
	'wallet.ccpayment.rateLockEnabled': 'ccpayment.rateLockEnabled',

	// Feature flags
	'wallet.features.allowCryptoWithdrawals': 'features.allowCryptoWithdrawals',
	'wallet.features.allowCryptoSwaps': 'features.allowCryptoSwaps',
	'wallet.features.allowDGTSpending': 'features.allowDGTSpending',
	'wallet.features.allowInternalTransfers': 'features.allowInternalTransfers',
	'wallet.features.allowManualCredits': 'features.allowManualCredits',

	// DGT economy
	'wallet.dgt.usdPrice': 'dgt.usdPrice',
	'wallet.dgt.usdToDGTRate': 'dgt.usdToDGTRate',
	'wallet.dgt.minDepositUSD': 'dgt.minDepositUSD',
	'wallet.dgt.maxDGTBalance': 'dgt.maxDGTBalance',

	// Rate limits
	'wallet.limits.depositsPerHour': 'limits.depositsPerHour',
	'wallet.limits.tipsPerMinute': 'limits.tipsPerMinute',
	'wallet.limits.maxDGTTransfer': 'limits.maxDGTTransfer',
	'wallet.limits.maxDailyCreditAmount': 'limits.maxDailyCreditAmount',

	// Security
	'wallet.security.requireTwoFactorForLargeTransfers': 'security.requireTwoFactorForLargeTransfers',
	'wallet.security.largeTransferThreshold': 'security.largeTransferThreshold',
	'wallet.security.auditAllTransactions': 'security.auditAllTransactions'
} as const;

/**
 * Environment-specific overrides
 */
export const getEnvironmentConfig = (): Partial<WalletConfig> => {
	const overrides: Partial<WalletConfig> = {};

	// Development-specific settings
	if (process.env.NODE_ENV === 'development') {
		overrides.ccpayment = {
			...defaultWalletConfig.ccpayment,
			testNetworkEnabled: true
		};
		overrides.limits = {
			...defaultWalletConfig.limits,
			depositsPerHour: 100, // Higher limits for testing
			tipsPerMinute: 50
		};
	}

	// Test environment settings
	if (process.env.NODE_ENV === 'test') {
		overrides.limits = {
			...defaultWalletConfig.limits,
			depositsPerHour: 1000,
			tipsPerMinute: 1000
		};
	}

	return overrides;
};
