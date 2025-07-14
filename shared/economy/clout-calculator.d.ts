/**
 * Clout Tier Calculator
 * Calculates clout tiers/ranks similar to XP levels
 */
export declare const CLOUT_TIERS: readonly [{
    readonly tier: 0;
    readonly name: "Unknown";
    readonly cloutRequired: 0;
    readonly color: "#6b7280";
}, {
    readonly tier: 1;
    readonly name: "Newcomer";
    readonly cloutRequired: 100;
    readonly color: "#84cc16";
}, {
    readonly tier: 2;
    readonly name: "Regular";
    readonly cloutRequired: 500;
    readonly color: "#22c55e";
}, {
    readonly tier: 3;
    readonly name: "Respected";
    readonly cloutRequired: 1500;
    readonly color: "#3b82f6";
}, {
    readonly tier: 4;
    readonly name: "Influential";
    readonly cloutRequired: 5000;
    readonly color: "#8b5cf6";
}, {
    readonly tier: 5;
    readonly name: "Legendary";
    readonly cloutRequired: 15000;
    readonly color: "#f59e0b";
}, {
    readonly tier: 6;
    readonly name: "Mythic";
    readonly cloutRequired: 50000;
    readonly color: "#ef4444";
}];
export type CloutTier = (typeof CLOUT_TIERS)[number];
/**
 * Get the clout tier for a given clout amount
 */
export declare function getTierForClout(clout: number): CloutTier;
/**
 * Get the clout required for a specific tier
 */
export declare function getCloutForTier(tier: number): number;
/**
 * Get the next tier info for a given clout amount
 */
export declare function getNextTierInfo(clout: number): {
    currentTier: CloutTier;
    nextTier: CloutTier | null;
    cloutToNext: number;
    progressPercent: number;
};
/**
 * Calculate clout tier impact for adjustments
 */
export declare function calculateCloutTierImpact(currentClout: number, newClout: number): {
    currentClout: number;
    newClout: number;
    currentTier: CloutTier;
    newTier: CloutTier;
    tierChange: number;
    currentProgress: number;
    newProgress: number;
    cloutToNextTier: number;
};
/**
 * Get all available tiers
 */
export declare function getAllCloutTiers(): CloutTier[];
