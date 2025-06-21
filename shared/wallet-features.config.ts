/**
 * Wallet Feature Configuration
 *
 * This file defines feature flags and access controls for wallet functionality
 */

export interface WalletFeatureGate {
	id: string;
	name: string;
	description: string;
	enabled: boolean;
	minLevel?: number;
	devOnly?: boolean;
	rolloutPercentage?: number;
}

// Wallet feature gates
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
		userId?: number
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
			const userHash = userId % 100;
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
		userId?: number
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
		userId?: number
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
