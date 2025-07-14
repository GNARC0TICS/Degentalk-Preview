"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultiplierStrategy = exports.getXpForLevel = exports.getEconomyConfig = exports.economyConfig = exports.EconomyConfigSchema = void 0;
exports.sanitizeMultiplier = sanitizeMultiplier;
exports.getSafeMultiplier = getSafeMultiplier;
var zod_1 = require("zod");
/*
 * Centralised XP / DGT economy configuration.
 * Do NOT import numbers directly anywhere else – always reference this object.
 * Values are mirrored from XP-DGT-SOURCE-OF-TRUTH.md (Smart-Adjustables section).
 */
// -----------------------------
// 1.  Zod schema for validation
// -----------------------------
exports.EconomyConfigSchema = zod_1.z
    .object({
    DGT_TO_USD: zod_1.z.number().positive(),
    XP_PER_DGT: zod_1.z.number().int().positive(),
    MAX_XP_PER_DAY: zod_1.z.number().int().positive(),
    MAX_TIP_XP_PER_DAY: zod_1.z.number().int().positive(),
    MIN_TIP_DGT: zod_1.z.number().positive(),
    TIP_FEE_PERCENTAGE: zod_1.z.number().positive(),
    FAUCET_REWARD_XP: zod_1.z.number().int().positive(),
    FAUCET_REWARD_DGT: zod_1.z.number().positive(),
    MIN_WITHDRAWAL_DGT: zod_1.z.number().positive(),
    levelXPMap: zod_1.z.record(zod_1.z.string(), zod_1.z.number().int().positive()),
    referralRewards: zod_1.z.object({
        referee: zod_1.z.object({ dgt: zod_1.z.number().positive(), xp: zod_1.z.number().int().positive() }),
        referrer: zod_1.z.object({ dgt: zod_1.z.number().positive(), xp: zod_1.z.number().int().positive() })
    }),
    rainSettings: zod_1.z.object({
        minAmount: zod_1.z.number().positive(),
        maxRecipients: zod_1.z.number().int().positive(),
        cooldownSeconds: zod_1.z.number().int().positive()
    }),
    // New XP multiplier protection settings
    xpMultiplierLimits: zod_1.z.object({
        maxTotalMultiplier: zod_1.z.number().positive(),
        maxRoleMultiplier: zod_1.z.number().positive(),
        maxForumMultiplier: zod_1.z.number().positive(),
        stackingRule: zod_1.z.enum(['additive', 'multiplicative', 'best_of', 'weighted_average']),
        enforcementMode: zod_1.z.enum(['strict', 'warn', 'log_only'])
    })
})
    .strict();
// -----------------------------
// 2.  Runtime configuration
// -----------------------------
exports.economyConfig = {
    DGT_TO_USD: 0.1,
    XP_PER_DGT: 1000,
    MAX_XP_PER_DAY: 1000,
    MAX_TIP_XP_PER_DAY: 200,
    MIN_TIP_DGT: 1,
    TIP_FEE_PERCENTAGE: 0.05,
    FAUCET_REWARD_XP: 50,
    FAUCET_REWARD_DGT: 0.5,
    MIN_WITHDRAWAL_DGT: 3,
    levelXPMap: {
        2: 250,
        3: 750,
        4: 1500,
        5: 2500,
        6: 4000,
        7: 6000,
        8: 8500,
        9: 11500,
        10: 15000
    },
    referralRewards: {
        referee: { dgt: 1, xp: 50 },
        referrer: { dgt: 5, xp: 200 }
    },
    rainSettings: {
        minAmount: 5,
        maxRecipients: 15,
        cooldownSeconds: 3600
    },
    // XP multiplier protection configuration
    xpMultiplierLimits: {
        // Maximum total multiplier from all sources combined (suggested 3.5x)
        maxTotalMultiplier: 3.5,
        // Maximum multiplier from user roles (prevents super-admin abuse)
        maxRoleMultiplier: 2.5,
        // Maximum multiplier from forum-specific bonuses
        maxForumMultiplier: 2.0,
        // How multiple multipliers combine:
        // - 'additive': (role - 1) + (forum - 1) + 1 (linear stacking)
        // - 'multiplicative': role * forum (exponential stacking)
        // - 'best_of': max(role, forum) (highest wins)
        // - 'weighted_average': Weighted average based on source priority
        stackingRule: 'additive',
        // How violations are handled:
        // - 'strict': Cap multipliers, log warning
        // - 'warn': Log warning but allow
        // - 'log_only': Silent logging for analysis
        enforcementMode: 'strict'
    }
};
// Validate once at module init – will throw on bad edit
exports.EconomyConfigSchema.parse(exports.economyConfig);
var getEconomyConfig = function () { return exports.economyConfig; };
exports.getEconomyConfig = getEconomyConfig;
// Derive helper for level formula ≥ 11
var getXpForLevel = function (level) {
    if (level <= 1)
        return 0;
    if (level <= 10) {
        var xp = exports.economyConfig.levelXPMap[level];
        if (xp !== undefined)
            return xp;
    }
    // Formula for level 11+
    return level * level * 250 - 250;
};
exports.getXpForLevel = getXpForLevel;
// -----------------------------
// 4. XP Multiplier Protection
// -----------------------------
/**
 * Multiplier combination strategies
 */
exports.MultiplierStrategy = {
    /**
     * Additive stacking: (role - 1) + (forum - 1) + 1
     * Example: role=1.5, forum=1.3 → (0.5) + (0.3) + 1 = 1.8x
     */
    additive: function (roleMultiplier, forumMultiplier) {
        return roleMultiplier - 1 + (forumMultiplier - 1) + 1;
    },
    /**
     * Multiplicative stacking: role * forum
     * Example: role=1.5, forum=1.3 → 1.5 * 1.3 = 1.95x
     */
    multiplicative: function (roleMultiplier, forumMultiplier) {
        return roleMultiplier * forumMultiplier;
    },
    /**
     * Best of: max(role, forum)
     * Example: role=1.5, forum=1.3 → max(1.5, 1.3) = 1.5x
     */
    bestOf: function (roleMultiplier, forumMultiplier) {
        return Math.max(roleMultiplier, forumMultiplier);
    },
    /**
     * Weighted average: role gets 60% weight, forum gets 40% weight
     * Example: role=1.5, forum=1.3 → (1.5 * 0.6) + (1.3 * 0.4) = 1.42x
     */
    weightedAverage: function (roleMultiplier, forumMultiplier) {
        return roleMultiplier * 0.6 + forumMultiplier * 0.4;
    }
};
/**
 * Sanitizes and combines multiple XP multipliers according to economy config rules
 *
 * @param roleMultiplier - Multiplier from user's role(s)
 * @param forumMultiplier - Multiplier from forum settings
 * @param contextInfo - Optional context for logging
 * @returns Sanitized total multiplier within configured limits
 */
function sanitizeMultiplier(roleMultiplier, forumMultiplier, contextInfo) {
    var config = exports.economyConfig.xpMultiplierLimits;
    var violations = [];
    // Sanitize individual multipliers first
    var sanitizedRole = Math.max(1, roleMultiplier);
    var sanitizedForum = Math.max(1, forumMultiplier);
    // Check individual caps
    if (sanitizedRole > config.maxRoleMultiplier) {
        violations.push("Role multiplier ".concat(sanitizedRole.toFixed(2), " exceeds cap ").concat(config.maxRoleMultiplier));
        sanitizedRole = config.maxRoleMultiplier;
    }
    if (sanitizedForum > config.maxForumMultiplier) {
        violations.push("Forum multiplier ".concat(sanitizedForum.toFixed(2), " exceeds cap ").concat(config.maxForumMultiplier));
        sanitizedForum = config.maxForumMultiplier;
    }
    // Combine multipliers according to stacking rule
    var combinedMultiplier;
    var stackingRule = config.stackingRule;
    switch (stackingRule) {
        case 'additive':
            combinedMultiplier = exports.MultiplierStrategy.additive(sanitizedRole, sanitizedForum);
            break;
        case 'multiplicative':
            combinedMultiplier = exports.MultiplierStrategy.multiplicative(sanitizedRole, sanitizedForum);
            break;
        case 'best_of':
            combinedMultiplier = exports.MultiplierStrategy.bestOf(sanitizedRole, sanitizedForum);
            break;
        case 'weighted_average':
            combinedMultiplier = exports.MultiplierStrategy.weightedAverage(sanitizedRole, sanitizedForum);
            break;
        default:
            combinedMultiplier = exports.MultiplierStrategy.additive(sanitizedRole, sanitizedForum);
    }
    var originalMultiplier = combinedMultiplier;
    // Apply total cap
    var finalMultiplier = combinedMultiplier;
    if (combinedMultiplier > config.maxTotalMultiplier) {
        violations.push("Total multiplier ".concat(combinedMultiplier.toFixed(2), " exceeds cap ").concat(config.maxTotalMultiplier));
        finalMultiplier = config.maxTotalMultiplier;
    }
    var wasCapped = finalMultiplier !== originalMultiplier || violations.length > 0;
    // Handle enforcement
    if (violations.length > 0 && contextInfo) {
        var logData = {
            userId: contextInfo.userId,
            forumId: contextInfo.forumId,
            action: contextInfo.action,
            roleMultiplier: sanitizedRole,
            forumMultiplier: sanitizedForum,
            stackingRule: config.stackingRule,
            originalMultiplier: originalMultiplier.toFixed(3),
            finalMultiplier: finalMultiplier.toFixed(3),
            violations: violations
        };
        var enforcementMode = config.enforcementMode;
        switch (enforcementMode) {
            case 'strict':
                console.warn('XP_MULTIPLIER_VIOLATION', 'Multiplier capped due to violations', logData);
                break;
            case 'warn':
                console.warn('XP_MULTIPLIER_WARNING', 'Multiplier violations detected', logData);
                // In warn mode, return original uncapped multiplier
                finalMultiplier = originalMultiplier;
                break;
            case 'log_only':
                console.log('XP_MULTIPLIER_ANALYSIS', 'Multiplier data logged', logData);
                // In log_only mode, return original uncapped multiplier
                finalMultiplier = originalMultiplier;
                break;
        }
    }
    // Ensure minimum multiplier of 1.0
    finalMultiplier = Math.max(1.0, finalMultiplier);
    return {
        finalMultiplier: finalMultiplier,
        originalMultiplier: originalMultiplier,
        wasCapped: wasCapped,
        violations: violations
    };
}
/**
 * Quick utility to get a safe multiplier value
 * @param roleMultiplier Role-based multiplier
 * @param forumMultiplier Forum-based multiplier
 * @returns Clamped multiplier value
 */
function getSafeMultiplier(roleMultiplier, forumMultiplier) {
    return sanitizeMultiplier(roleMultiplier, forumMultiplier).finalMultiplier;
}
