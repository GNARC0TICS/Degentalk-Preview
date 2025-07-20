import { z } from 'zod';
/**
 * XP & Progression Configuration Schemas
 *
 * Runtime validation for XP system configuration.
 * All XP-related business logic should be configurable through these schemas.
 */
// XP Action configuration
export const XpActionSchema = z.object({
    base: z.number().positive().describe('Base XP awarded for this action'),
    multiplierEligible: z.boolean().default(true).describe('Whether multipliers apply'),
    cooldown: z.number().nonnegative().default(0).describe('Cooldown in seconds'),
    dailyCap: z.number().positive().optional().describe('Max XP from this action per day'),
    requiredLevel: z.number().nonnegative().default(0).describe('Min level to perform action'),
    requiredRole: z.string().optional().describe('Required role to perform action')
});
// XP Multiplier configuration
export const XpMultiplierSchema = z.object({
    source: z.string().describe('Multiplier source identifier'),
    value: z.number().positive().max(5).describe('Multiplier value'),
    condition: z
        .object({
        type: z.enum(['role', 'level', 'streak', 'time', 'event']),
        value: z.union([
            z.string(),
            z.number(),
            z.object({
                start: z.string(),
                end: z.string()
            })
        ])
    })
        .optional(),
    stackable: z.boolean().default(true),
    maxStack: z.number().positive().default(1)
});
// Level progression formula
export const LevelFormulaSchema = z.discriminatedUnion('type', [
    z.object({
        type: z.literal('linear'),
        base: z.number().positive(),
        increment: z.number().positive()
    }),
    z.object({
        type: z.literal('polynomial'),
        coefficient: z.number().positive(),
        exponent: z.number().positive().default(2),
        offset: z.number().default(0)
    }),
    z.object({
        type: z.literal('exponential'),
        base: z.number().positive(),
        multiplier: z.number().positive(),
        offset: z.number().default(0)
    }),
    z.object({
        type: z.literal('custom'),
        thresholds: z.array(z.number().positive()).describe('XP required for each level')
    })
]);
// Level milestone rewards
export const LevelMilestoneSchema = z.object({
    level: z.number().positive(),
    rewards: z.object({
        dgt: z.number().nonnegative().optional(),
        xp: z.number().nonnegative().optional(),
        items: z.array(z.string()).optional(),
        unlocks: z.array(z.string()).optional(),
        title: z.string().optional(),
        badge: z.string().optional()
    }),
    announcement: z
        .object({
        enabled: z.boolean().default(true),
        message: z.string().optional(),
        type: z.enum(['info', 'success', 'celebration']).default('success')
    })
        .optional()
});
// Main XP configuration schema
export const XpConfigSchema = z.object({
    version: z.string().default('1.0.0'),
    actions: z
        .object({
        post: XpActionSchema,
        thread: XpActionSchema,
        reply: XpActionSchema,
        upvote: XpActionSchema,
        tip_sent: XpActionSchema,
        tip_received: XpActionSchema,
        daily_login: XpActionSchema,
        achievement: XpActionSchema,
        referral: XpActionSchema
    })
        .describe('XP rewards for different actions'),
    multipliers: z.object({
        enabled: z.boolean().default(true),
        stacking: z.enum(['additive', 'multiplicative']).default('additive'),
        sources: z.array(XpMultiplierSchema),
        globalCap: z.number().positive().max(10).default(5),
        calculation: z.enum(['highest', 'sum', 'product']).default('sum')
    }),
    levels: z.object({
        maxLevel: z.number().positive().default(100),
        formula: LevelFormulaSchema,
        milestones: z.array(LevelMilestoneSchema),
        prestigeEnabled: z.boolean().default(false),
        prestigeMultiplier: z.number().positive().default(1.1).optional()
    }),
    daily: z.object({
        enabled: z.boolean().default(true),
        earnedCap: z.number().positive().default(1000),
        bonusCap: z.number().positive().default(500),
        resetHour: z.number().min(0).max(23).default(0),
        timezone: z.string().default('UTC'),
        streakBonus: z
            .object({
            enabled: z.boolean().default(true),
            multiplier: z.number().positive().default(0.1),
            maxStreak: z.number().positive().default(30),
            resetOnMiss: z.boolean().default(true)
        })
            .optional()
    }),
    decay: z
        .object({
        enabled: z.boolean().default(false),
        inactivityDays: z.number().positive().default(30),
        rate: z.number().positive().max(1).default(0.01),
        minLevel: z.number().positive().default(10),
        protected: z.array(z.string()).default(['admin', 'moderator'])
    })
        .optional(),
    boosts: z
        .object({
        weekend: z.object({
            enabled: z.boolean().default(true),
            multiplier: z.number().positive().default(1.5),
            days: z.array(z.number().min(0).max(6)).default([0, 6]) // 0 = Sunday, 6 = Saturday
        }),
        happyHour: z.object({
            enabled: z.boolean().default(true),
            multiplier: z.number().positive().default(2),
            hours: z
                .array(z.object({
                start: z.number().min(0).max(23),
                end: z.number().min(0).max(23)
            }))
                .default([{ start: 20, end: 22 }])
        }),
        events: z
            .array(z.object({
            name: z.string(),
            multiplier: z.number().positive(),
            startDate: z.string().datetime(),
            endDate: z.string().datetime(),
            announcement: z.string().optional()
        }))
            .default([])
    })
        .optional()
});
// Validation helpers
export function validateXpConfig(config) {
    return XpConfigSchema.parse(config);
}
export function validatePartialXpConfig(config) {
    const result = XpConfigSchema.partial().parse(config);
    return result;
}
// Default configuration
export const defaultXpConfig = {
    version: '1.0.0',
    actions: {
        post: { base: 5, multiplierEligible: true, cooldown: 60, requiredLevel: 1 },
        thread: { base: 10, multiplierEligible: true, cooldown: 300, requiredLevel: 1 },
        reply: { base: 3, multiplierEligible: true, cooldown: 30, requiredLevel: 1 },
        upvote: { base: 1, multiplierEligible: false, cooldown: 0, dailyCap: 50, requiredLevel: 1 },
        tip_sent: { base: 2, multiplierEligible: false, cooldown: 0, requiredLevel: 5 },
        tip_received: { base: 3, multiplierEligible: true, cooldown: 0, requiredLevel: 1 },
        daily_login: { base: 25, multiplierEligible: true, cooldown: 86400, requiredLevel: 1 },
        achievement: { base: 50, multiplierEligible: false, cooldown: 0, requiredLevel: 1 },
        referral: { base: 100, multiplierEligible: false, cooldown: 0, requiredLevel: 10 }
    },
    multipliers: {
        enabled: true,
        stacking: 'additive',
        sources: [
            {
                source: 'role_vip',
                value: 1.5,
                condition: { type: 'role', value: 'vip' },
                stackable: false,
                maxStack: 1
            },
            {
                source: 'streak_bonus',
                value: 1.1,
                condition: { type: 'streak', value: 7 },
                stackable: true,
                maxStack: 3
            }
        ],
        globalCap: 5,
        calculation: 'sum'
    },
    levels: {
        maxLevel: 100,
        formula: {
            type: 'polynomial',
            coefficient: 250,
            exponent: 2,
            offset: -250
        },
        milestones: [
            {
                level: 5,
                rewards: {
                    dgt: 50,
                    unlocks: ['withdrawals']
                }
            },
            {
                level: 10,
                rewards: {
                    dgt: 100,
                    badge: 'veteran',
                    unlocks: ['advanced_wallet']
                }
            }
        ],
        prestigeEnabled: false
    },
    daily: {
        enabled: true,
        earnedCap: 1000,
        bonusCap: 500,
        resetHour: 0,
        timezone: 'UTC',
        streakBonus: {
            enabled: true,
            multiplier: 0.1,
            maxStreak: 30,
            resetOnMiss: true
        }
    }
};
