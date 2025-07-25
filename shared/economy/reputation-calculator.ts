/**
 * Reputation Tier Calculator
 * Calculates reputation tiers/ranks similar to XP levels
 */

// Reputation tier definitions - based on reputation system
export const REPUTATION_TIERS = [
	{ tier: 0, name: 'Unknown', reputationRequired: 0, color: '#6b7280' }, // gray-500
	{ tier: 1, name: 'Newcomer', reputationRequired: 100, color: '#84cc16' }, // lime-500
	{ tier: 2, name: 'Regular', reputationRequired: 500, color: '#22c55e' }, // green-500
	{ tier: 3, name: 'Respected', reputationRequired: 1500, color: '#3b82f6' }, // blue-500
	{ tier: 4, name: 'Influential', reputationRequired: 5000, color: '#8b5cf6' }, // violet-500
	{ tier: 5, name: 'Legendary', reputationRequired: 15000, color: '#f59e0b' }, // amber-500
	{ tier: 6, name: 'Mythic', reputationRequired: 50000, color: '#ef4444' } // red-500
] as const;

export type ReputationTier = (typeof REPUTATION_TIERS)[number];

/**
 * Get the reputation tier for a given reputation amount
 */
export function getTierForReputation(reputation: number): ReputationTier {
	// Find the highest tier that the user qualifies for
	for (let i = REPUTATION_TIERS.length - 1; i >= 0; i--) {
		const tier = REPUTATION_TIERS[i];
		if (tier && reputation >= tier.reputationRequired) {
			return tier;
		}
	}
	return (
		REPUTATION_TIERS[0] ??
		({
			tier: 0,
			name: 'Unknown',
			reputationRequired: 0,
			color: '#6b7280'
		} as const)
	);
}

/**
 * Get the reputation required for a specific tier
 */
export function getReputationForTier(tier: number): number {
	const tierData = REPUTATION_TIERS.find((t) => t.tier === tier);
	return tierData ? tierData.reputationRequired : 0;
}

/**
 * Get the next tier info for a given reputation amount
 */
export function getNextTierInfo(reputation: number): {
	currentTier: ReputationTier;
	nextTier: ReputationTier | null;
	reputationToNext: number;
	progressPercent: number;
} {
	const currentTier = getTierForReputation(reputation);
	const nextTierIndex = REPUTATION_TIERS.findIndex((t) => t.tier === currentTier.tier) + 1;
	const nextTier = nextTierIndex < REPUTATION_TIERS.length ? REPUTATION_TIERS[nextTierIndex] : null;

	if (!nextTier) {
		return {
			currentTier,
			nextTier: null,
			reputationToNext: 0,
			progressPercent: 100
		};
	}

	const reputationToNext = nextTier.reputationRequired - reputation;
	const tierRange = nextTier.reputationRequired - currentTier.reputationRequired;
	const progressInTier = reputation - currentTier.reputationRequired;
	const progressPercent = tierRange > 0 ? (progressInTier / tierRange) * 100 : 0;

	return {
		currentTier,
		nextTier,
		reputationToNext: Math.max(0, reputationToNext),
		progressPercent: Math.min(100, Math.max(0, progressPercent))
	};
}

/**
 * Calculate reputation tier impact for adjustments
 */
export function calculateReputationTierImpact(
	currentReputation: number,
	newReputation: number
): {
	currentReputation: number;
	newReputation: number;
	currentTier: ReputationTier;
	newTier: ReputationTier;
	tierChange: number;
	currentProgress: number;
	newProgress: number;
	reputationToNextTier: number;
} {
	const currentTierInfo = getNextTierInfo(currentReputation);
	const newTierInfo = getNextTierInfo(newReputation);

	return {
		currentReputation,
		newReputation,
		currentTier: currentTierInfo.currentTier,
		newTier: newTierInfo.currentTier,
		tierChange: newTierInfo.currentTier.tier - currentTierInfo.currentTier.tier,
		currentProgress: currentTierInfo.progressPercent,
		newProgress: newTierInfo.progressPercent,
		reputationToNextTier: newTierInfo.reputationToNext
	};
}

/**
 * Get all available tiers
 */
export function getAllReputationTiers(): ReputationTier[] {
	return [...REPUTATION_TIERS];
}
