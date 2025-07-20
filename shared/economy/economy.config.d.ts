import { z } from 'zod';
import type { ForumId } from '../types/ids.js';
import type { UserId } from '../types/ids.js';
export declare const EconomyConfigSchema: z.ZodObject<{
    DGT_TO_USD: z.ZodNumber;
    XP_PER_DGT: z.ZodNumber;
    MAX_XP_PER_DAY: z.ZodNumber;
    MAX_TIP_XP_PER_DAY: z.ZodNumber;
    MIN_TIP_DGT: z.ZodNumber;
    TIP_FEE_PERCENTAGE: z.ZodNumber;
    FAUCET_REWARD_XP: z.ZodNumber;
    FAUCET_REWARD_DGT: z.ZodNumber;
    MIN_WITHDRAWAL_DGT: z.ZodNumber;
    levelXPMap: z.ZodRecord<z.ZodString, z.ZodNumber>;
    referralRewards: z.ZodObject<{
        referee: z.ZodObject<{
            dgt: z.ZodNumber;
            xp: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            xp?: number;
            dgt?: number;
        }, {
            xp?: number;
            dgt?: number;
        }>;
        referrer: z.ZodObject<{
            dgt: z.ZodNumber;
            xp: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            xp?: number;
            dgt?: number;
        }, {
            xp?: number;
            dgt?: number;
        }>;
    }, "strip", z.ZodTypeAny, {
        referee?: {
            xp?: number;
            dgt?: number;
        };
        referrer?: {
            xp?: number;
            dgt?: number;
        };
    }, {
        referee?: {
            xp?: number;
            dgt?: number;
        };
        referrer?: {
            xp?: number;
            dgt?: number;
        };
    }>;
    rainSettings: z.ZodObject<{
        minAmount: z.ZodNumber;
        maxRecipients: z.ZodNumber;
        cooldownSeconds: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        minAmount?: number;
        maxRecipients?: number;
        cooldownSeconds?: number;
    }, {
        minAmount?: number;
        maxRecipients?: number;
        cooldownSeconds?: number;
    }>;
    xpMultiplierLimits: z.ZodObject<{
        maxTotalMultiplier: z.ZodNumber;
        maxRoleMultiplier: z.ZodNumber;
        maxForumMultiplier: z.ZodNumber;
        stackingRule: z.ZodEnum<["additive", "multiplicative", "best_of", "weighted_average"]>;
        enforcementMode: z.ZodEnum<["strict", "warn", "log_only"]>;
    }, "strip", z.ZodTypeAny, {
        maxTotalMultiplier?: number;
        maxRoleMultiplier?: number;
        maxForumMultiplier?: number;
        stackingRule?: "additive" | "multiplicative" | "best_of" | "weighted_average";
        enforcementMode?: "strict" | "warn" | "log_only";
    }, {
        maxTotalMultiplier?: number;
        maxRoleMultiplier?: number;
        maxForumMultiplier?: number;
        stackingRule?: "additive" | "multiplicative" | "best_of" | "weighted_average";
        enforcementMode?: "strict" | "warn" | "log_only";
    }>;
}, "strict", z.ZodTypeAny, {
    DGT_TO_USD?: number;
    XP_PER_DGT?: number;
    MAX_XP_PER_DAY?: number;
    MAX_TIP_XP_PER_DAY?: number;
    MIN_TIP_DGT?: number;
    TIP_FEE_PERCENTAGE?: number;
    FAUCET_REWARD_XP?: number;
    FAUCET_REWARD_DGT?: number;
    MIN_WITHDRAWAL_DGT?: number;
    levelXPMap?: Record<string, number>;
    referralRewards?: {
        referee?: {
            xp?: number;
            dgt?: number;
        };
        referrer?: {
            xp?: number;
            dgt?: number;
        };
    };
    rainSettings?: {
        minAmount?: number;
        maxRecipients?: number;
        cooldownSeconds?: number;
    };
    xpMultiplierLimits?: {
        maxTotalMultiplier?: number;
        maxRoleMultiplier?: number;
        maxForumMultiplier?: number;
        stackingRule?: "additive" | "multiplicative" | "best_of" | "weighted_average";
        enforcementMode?: "strict" | "warn" | "log_only";
    };
}, {
    DGT_TO_USD?: number;
    XP_PER_DGT?: number;
    MAX_XP_PER_DAY?: number;
    MAX_TIP_XP_PER_DAY?: number;
    MIN_TIP_DGT?: number;
    TIP_FEE_PERCENTAGE?: number;
    FAUCET_REWARD_XP?: number;
    FAUCET_REWARD_DGT?: number;
    MIN_WITHDRAWAL_DGT?: number;
    levelXPMap?: Record<string, number>;
    referralRewards?: {
        referee?: {
            xp?: number;
            dgt?: number;
        };
        referrer?: {
            xp?: number;
            dgt?: number;
        };
    };
    rainSettings?: {
        minAmount?: number;
        maxRecipients?: number;
        cooldownSeconds?: number;
    };
    xpMultiplierLimits?: {
        maxTotalMultiplier?: number;
        maxRoleMultiplier?: number;
        maxForumMultiplier?: number;
        stackingRule?: "additive" | "multiplicative" | "best_of" | "weighted_average";
        enforcementMode?: "strict" | "warn" | "log_only";
    };
}>;
export declare const economyConfig: {
    readonly DGT_TO_USD: 0.1;
    readonly XP_PER_DGT: 1000;
    readonly MAX_XP_PER_DAY: 1000;
    readonly MAX_TIP_XP_PER_DAY: 200;
    readonly MIN_TIP_DGT: 1;
    readonly TIP_FEE_PERCENTAGE: 0.05;
    readonly FAUCET_REWARD_XP: 50;
    readonly FAUCET_REWARD_DGT: 0.5;
    readonly MIN_WITHDRAWAL_DGT: 3;
    readonly levelXPMap: {
        readonly 2: 250;
        readonly 3: 750;
        readonly 4: 1500;
        readonly 5: 2500;
        readonly 6: 4000;
        readonly 7: 6000;
        readonly 8: 8500;
        readonly 9: 11500;
        readonly 10: 15000;
    };
    readonly referralRewards: {
        readonly referee: {
            readonly dgt: 1;
            readonly xp: 50;
        };
        readonly referrer: {
            readonly dgt: 5;
            readonly xp: 200;
        };
    };
    readonly rainSettings: {
        readonly minAmount: 5;
        readonly maxRecipients: 15;
        readonly cooldownSeconds: 3600;
    };
    readonly xpMultiplierLimits: {
        readonly maxTotalMultiplier: 3.5;
        readonly maxRoleMultiplier: 2.5;
        readonly maxForumMultiplier: 2;
        readonly stackingRule: "additive";
        readonly enforcementMode: "strict";
    };
};
export type EconomyConfig = typeof economyConfig;
export declare const getEconomyConfig: () => EconomyConfig;
export declare const getXpForLevel: (level: number) => number;
/**
 * Multiplier combination strategies
 */
export declare const MultiplierStrategy: {
    /**
     * Additive stacking: (role - 1) + (forum - 1) + 1
     * Example: role=1.5, forum=1.3 → (0.5) + (0.3) + 1 = 1.8x
     */
    readonly additive: (roleMultiplier: number, forumMultiplier: number) => number;
    /**
     * Multiplicative stacking: role * forum
     * Example: role=1.5, forum=1.3 → 1.5 * 1.3 = 1.95x
     */
    readonly multiplicative: (roleMultiplier: number, forumMultiplier: number) => number;
    /**
     * Best of: max(role, forum)
     * Example: role=1.5, forum=1.3 → max(1.5, 1.3) = 1.5x
     */
    readonly bestOf: (roleMultiplier: number, forumMultiplier: number) => number;
    /**
     * Weighted average: role gets 60% weight, forum gets 40% weight
     * Example: role=1.5, forum=1.3 → (1.5 * 0.6) + (1.3 * 0.4) = 1.42x
     */
    readonly weightedAverage: (roleMultiplier: number, forumMultiplier: number) => number;
};
/**
 * Sanitizes and combines multiple XP multipliers according to economy config rules
 *
 * @param roleMultiplier - Multiplier from user's role(s)
 * @param forumMultiplier - Multiplier from forum settings
 * @param contextInfo - Optional context for logging
 * @returns Sanitized total multiplier within configured limits
 */
export declare function sanitizeMultiplier(roleMultiplier: number, forumMultiplier: number, contextInfo?: {
    userId?: UserId;
    forumId?: ForumId;
    action?: string;
}): {
    finalMultiplier: number;
    originalMultiplier: number;
    wasCapped: boolean;
    violations: string[];
};
/**
 * Quick utility to get a safe multiplier value
 * @param roleMultiplier Role-based multiplier
 * @param forumMultiplier Forum-based multiplier
 * @returns Clamped multiplier value
 */
export declare function getSafeMultiplier(roleMultiplier: number, forumMultiplier: number): number;
