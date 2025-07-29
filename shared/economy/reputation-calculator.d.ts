/**
 * Reputation Tier Calculator
 * Calculates reputation tiers/ranks similar to XP levels
 */
export declare const REPUTATION_TIERS: readonly [{
    readonly tier: 0;
    readonly name: "Unknown";
    readonly reputationRequired: 0;
    readonly color: "#6b7280";
}, {
    readonly tier: 1;
    readonly name: "Newcomer";
    readonly reputationRequired: 100;
    readonly color: "#84cc16";
}, {
    readonly tier: 2;
    readonly name: "Regular";
    readonly reputationRequired: 500;
    readonly color: "#22c55e";
}, {
    readonly tier: 3;
    readonly name: "Respected";
    readonly reputationRequired: 1500;
    readonly color: "#3b82f6";
}, {
    readonly tier: 4;
    readonly name: "Influential";
    readonly reputationRequired: 5000;
    readonly color: "#8b5cf6";
}, {
    readonly tier: 5;
    readonly name: "Legendary";
    readonly reputationRequired: 15000;
    readonly color: "#f59e0b";
}, {
    readonly tier: 6;
    readonly name: "Mythic";
    readonly reputationRequired: 50000;
    readonly color: "#ef4444";
}];
export type ReputationTier = (typeof REPUTATION_TIERS)[number];
/**
 * Get the reputation tier for a given reputation amount
 */
export declare function getTierForReputation(reputation: number): ReputationTier;
/**
 * Get the reputation required for a specific tier
 */
export declare function getReputationForTier(tier: number): number;
/**
 * Get the next tier info for a given reputation amount
 */
export declare function getNextTierInfo(reputation: number): {
    currentTier: ReputationTier;
    nextTier: ReputationTier | null;
    reputationToNext: number;
    progressPercent: number;
};
/**
 * Calculate reputation tier impact for adjustments
 */
export declare function calculateReputationTierImpact(currentReputation: number, newReputation: number): {
    currentReputation: number;
    newReputation: number;
    currentTier: ReputationTier;
    newTier: ReputationTier;
    tierChange: number;
    currentProgress: number;
    newProgress: number;
    reputationToNextTier: number;
};
/**
 * Get all available tiers
 */
export declare function getAllReputationTiers(): ReputationTier[];
//# sourceMappingURL=reputation-calculator.d.ts.map