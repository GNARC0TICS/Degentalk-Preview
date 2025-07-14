"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.xpRewards = exports.categoryPathMappings = exports.availablePaths = void 0;
exports.getPathForCategory = getPathForCategory;
exports.getPathDefinition = getPathDefinition;
exports.getDominantPath = getDominantPath;
// Define all available paths in the system
exports.availablePaths = {
    gambler: {
        id: 'gambler',
        name: 'Gambler',
        description: 'Risk-taker and casino enthusiast',
        icon: 'dices',
        color: 'text-amber-500'
    },
    shiller: {
        id: 'shiller',
        name: 'Shiller',
        description: 'Advocate and promoter of projects',
        icon: 'megaphone',
        color: 'text-green-500'
    },
    developer: {
        id: 'developer',
        name: 'Developer',
        description: 'Builder and technical contributor',
        icon: 'code',
        color: 'text-blue-500'
    },
    influencer: {
        id: 'influencer',
        name: 'Influencer',
        description: 'Thought leader with social reach',
        icon: 'users',
        color: 'text-purple-500'
    },
    analyst: {
        id: 'analyst',
        name: 'Analyst',
        description: 'Data-driven researcher and trend-spotter',
        icon: 'line-chart',
        color: 'text-cyan-500'
    },
    collector: {
        id: 'collector',
        name: 'Collector',
        description: 'NFT and digital asset enthusiast',
        icon: 'image',
        color: 'text-pink-500'
    },
    trader: {
        id: 'trader',
        name: 'Trader',
        description: 'Active in markets and exchanges',
        icon: 'trending-up',
        color: 'text-red-500'
    },
    hodler: {
        id: 'hodler',
        name: 'Hodler',
        description: 'Long-term investor with diamond hands',
        icon: 'lock',
        color: 'text-indigo-500'
    }
};
// Define which categories map to which paths
// The keys are category IDs, values are path IDs
exports.categoryPathMappings = {
    // Example mappings - update with real category IDs
    1: 'gambler', // Casinos & Gambling category
    2: 'shiller', // Project Announcements category
    3: 'developer', // Development & Technical category
    4: 'influencer', // Social Media & Marketing category
    5: 'analyst', // Analysis & Research category
    6: 'collector', // NFTs & Collectibles category
    7: 'trader', // Trading Strategies category
    8: 'hodler' // Long-term Investments category
};
// XP reward values for various actions
exports.xpRewards = {
    newThread: 10,
    newPost: 5,
    receivedLike: 2,
    receivedReaction: 1,
    generalXpPerAction: 5,
    // XP at which multipliers are awarded (1000 XP = 1.2× multiplier)
    multiplierThreshold: 1000
};
/**
 * Gets the path ID associated with a category
 * @param categoryId The forum category ID
 * @returns The path ID or undefined if no mapping exists
 */
function getPathForCategory(categoryId) {
    return exports.categoryPathMappings[categoryId];
}
/**
 * Gets the path definition from a path ID
 * @param pathId The path identifier
 * @returns The path definition or undefined if not found
 */
function getPathDefinition(pathId) {
    return exports.availablePaths[pathId];
}
/**
 * Gets the user's dominant path (highest XP)
 * @param paths The user's path XP object
 * @returns The dominant path ID or undefined if no paths
 */
function getDominantPath(paths) {
    if (!paths || Object.keys(paths).length === 0)
        return undefined;
    var maxXP = 0;
    var dominantPath = undefined;
    for (var _i = 0, _a = Object.entries(paths); _i < _a.length; _i++) {
        var _b = _a[_i], pathId = _b[0], xp = _b[1];
        if (xp > maxXP) {
            maxXP = xp;
            dominantPath = pathId;
        }
    }
    return dominantPath;
}
