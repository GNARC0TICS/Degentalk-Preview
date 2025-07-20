/**
 * Clout Tier Calculator
 * Calculates clout tiers/ranks similar to XP levels
 */
// Clout tier definitions - based on reputation system
export const CLOUT_TIERS = [
    { tier: 0, name: 'Unknown', cloutRequired: 0, color: '#6b7280' }, // gray-500
    { tier: 1, name: 'Newcomer', cloutRequired: 100, color: '#84cc16' }, // lime-500
    { tier: 2, name: 'Regular', cloutRequired: 500, color: '#22c55e' }, // green-500
    { tier: 3, name: 'Respected', cloutRequired: 1500, color: '#3b82f6' }, // blue-500
    { tier: 4, name: 'Influential', cloutRequired: 5000, color: '#8b5cf6' }, // violet-500
    { tier: 5, name: 'Legendary', cloutRequired: 15000, color: '#f59e0b' }, // amber-500
    { tier: 6, name: 'Mythic', cloutRequired: 50000, color: '#ef4444' } // red-500
];
/**
 * Get the clout tier for a given clout amount
 */
export function getTierForClout(clout) {
    // Find the highest tier that the user qualifies for
    for (let i = CLOUT_TIERS.length - 1; i >= 0; i--) {
        const tier = CLOUT_TIERS[i];
        if (tier && clout >= tier.cloutRequired) {
            return tier;
        }
    }
    return (CLOUT_TIERS[0] ??
        {
            tier: 0,
            name: 'Unknown',
            cloutRequired: 0,
            color: '#6b7280'
        });
}
/**
 * Get the clout required for a specific tier
 */
export function getCloutForTier(tier) {
    const tierData = CLOUT_TIERS.find((t) => t.tier === tier);
    return tierData ? tierData.cloutRequired : 0;
}
/**
 * Get the next tier info for a given clout amount
 */
export function getNextTierInfo(clout) {
    const currentTier = getTierForClout(clout);
    const nextTierIndex = CLOUT_TIERS.findIndex((t) => t.tier === currentTier.tier) + 1;
    const nextTier = nextTierIndex < CLOUT_TIERS.length ? CLOUT_TIERS[nextTierIndex] : null;
    if (!nextTier) {
        return {
            currentTier,
            nextTier: null,
            cloutToNext: 0,
            progressPercent: 100
        };
    }
    const cloutToNext = nextTier.cloutRequired - clout;
    const tierRange = nextTier.cloutRequired - currentTier.cloutRequired;
    const progressInTier = clout - currentTier.cloutRequired;
    const progressPercent = tierRange > 0 ? (progressInTier / tierRange) * 100 : 0;
    return {
        currentTier,
        nextTier,
        cloutToNext: Math.max(0, cloutToNext),
        progressPercent: Math.min(100, Math.max(0, progressPercent))
    };
}
/**
 * Calculate clout tier impact for adjustments
 */
export function calculateCloutTierImpact(currentClout, newClout) {
    const currentTierInfo = getNextTierInfo(currentClout);
    const newTierInfo = getNextTierInfo(newClout);
    return {
        currentClout,
        newClout,
        currentTier: currentTierInfo.currentTier,
        newTier: newTierInfo.currentTier,
        tierChange: newTierInfo.currentTier.tier - currentTierInfo.currentTier.tier,
        currentProgress: currentTierInfo.progressPercent,
        newProgress: newTierInfo.progressPercent,
        cloutToNextTier: newTierInfo.cloutToNext
    };
}
/**
 * Get all available tiers
 */
export function getAllCloutTiers() {
    return [...CLOUT_TIERS];
}
