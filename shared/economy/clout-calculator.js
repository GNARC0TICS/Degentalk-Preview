"use strict";
/**
 * Clout Tier Calculator
 * Calculates clout tiers/ranks similar to XP levels
 */
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CLOUT_TIERS = void 0;
exports.getTierForClout = getTierForClout;
exports.getCloutForTier = getCloutForTier;
exports.getNextTierInfo = getNextTierInfo;
exports.calculateCloutTierImpact = calculateCloutTierImpact;
exports.getAllCloutTiers = getAllCloutTiers;
// Clout tier definitions - based on reputation system
exports.CLOUT_TIERS = [
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
function getTierForClout(clout) {
    var _a;
    // Find the highest tier that the user qualifies for
    for (var i = exports.CLOUT_TIERS.length - 1; i >= 0; i--) {
        var tier = exports.CLOUT_TIERS[i];
        if (tier && clout >= tier.cloutRequired) {
            return tier;
        }
    }
    return ((_a = exports.CLOUT_TIERS[0]) !== null && _a !== void 0 ? _a : {
        tier: 0,
        name: 'Unknown',
        cloutRequired: 0,
        color: '#6b7280'
    });
}
/**
 * Get the clout required for a specific tier
 */
function getCloutForTier(tier) {
    var tierData = exports.CLOUT_TIERS.find(function (t) { return t.tier === tier; });
    return tierData ? tierData.cloutRequired : 0;
}
/**
 * Get the next tier info for a given clout amount
 */
function getNextTierInfo(clout) {
    var currentTier = getTierForClout(clout);
    var nextTierIndex = exports.CLOUT_TIERS.findIndex(function (t) { return t.tier === currentTier.tier; }) + 1;
    var nextTier = nextTierIndex < exports.CLOUT_TIERS.length ? exports.CLOUT_TIERS[nextTierIndex] : null;
    if (!nextTier) {
        return {
            currentTier: currentTier,
            nextTier: null,
            cloutToNext: 0,
            progressPercent: 100
        };
    }
    var cloutToNext = nextTier.cloutRequired - clout;
    var tierRange = nextTier.cloutRequired - currentTier.cloutRequired;
    var progressInTier = clout - currentTier.cloutRequired;
    var progressPercent = tierRange > 0 ? (progressInTier / tierRange) * 100 : 0;
    return {
        currentTier: currentTier,
        nextTier: nextTier,
        cloutToNext: Math.max(0, cloutToNext),
        progressPercent: Math.min(100, Math.max(0, progressPercent))
    };
}
/**
 * Calculate clout tier impact for adjustments
 */
function calculateCloutTierImpact(currentClout, newClout) {
    var currentTierInfo = getNextTierInfo(currentClout);
    var newTierInfo = getNextTierInfo(newClout);
    return {
        currentClout: currentClout,
        newClout: newClout,
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
function getAllCloutTiers() {
    return __spreadArray([], exports.CLOUT_TIERS, true);
}
