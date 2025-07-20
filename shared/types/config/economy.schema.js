import { z } from 'zod';
/**
 * Economy Configuration Schemas
 *
 * Runtime validation for DGT economy configuration.
 * Controls all economic parameters, fees, limits, and monetary policies.
 */
// Currency configuration
export const CurrencyConfigSchema = z.object({
    symbol: z.literal('DGT'),
    name: z.string().default('DegenTalk Token'),
    decimals: z.number().positive().max(18).default(8),
    displayDecimals: z.number().nonnegative().max(8).default(2),
    minAmount: z.number().positive().default(0.00000001),
    maxAmount: z.number().positive().default(1000000000),
    dustThreshold: z.number().positive().default(0.0001)
});
// Fee configuration
export const FeeConfigSchema = z.object({
    withdrawal: z.object({
        type: z.enum(['fixed', 'percentage', 'tiered']),
        value: z.number().nonnegative(),
        min: z.number().nonnegative().default(0),
        max: z.number().nonnegative().optional(),
        tiers: z
            .array(z.object({
            threshold: z.number().positive(),
            fee: z.number().nonnegative()
        }))
            .optional()
    }),
    transaction: z.object({
        internal: z.number().nonnegative().default(0),
        external: z.number().nonnegative().default(0.001)
    }),
    trading: z.object({
        maker: z.number().nonnegative().default(0.001),
        taker: z.number().nonnegative().default(0.002)
    }),
    conversion: z.object({
        rate: z.number().positive().default(0.01),
        minimum: z.number().positive().default(1)
    })
});
// Wallet limits configuration
export const WalletLimitsSchema = z.object({
    withdrawal: z.object({
        daily: z.number().positive().default(10000),
        weekly: z.number().positive().default(50000),
        monthly: z.number().positive().default(150000),
        perTransaction: z.object({
            min: z.number().positive().default(10),
            max: z.number().positive().default(5000)
        }),
        cooldown: z.number().nonnegative().default(86400), // 24 hours in seconds
        requireEmailVerification: z.boolean().default(true),
        require2FA: z.boolean().default(false),
        minAccountAge: z.number().nonnegative().default(604800) // 7 days
    }),
    spending: z.object({
        daily: z.number().positive().default(5000),
        perTransaction: z.number().positive().default(1000),
        tipping: z.object({
            daily: z.number().positive().default(500),
            perTip: z.object({
                min: z.number().positive().default(0.1),
                max: z.number().positive().default(100)
            })
        })
    }),
    holding: z.object({
        maximum: z.number().positive().default(1000000),
        vipThreshold: z.number().positive().default(10000),
        whaleThreshold: z.number().positive().default(100000)
    })
});
// Distribution configuration
export const DistributionConfigSchema = z.object({
    faucet: z.object({
        enabled: z.boolean().default(true),
        amount: z.number().positive().default(0.5),
        cooldown: z.number().positive().default(86400), // 24 hours
        requireCaptcha: z.boolean().default(true),
        minLevel: z.number().nonnegative().default(1),
        lifetime: z.object({
            max: z.number().positive().default(100),
            resetMonthly: z.boolean().default(false)
        })
    }),
    referral: z.object({
        enabled: z.boolean().default(true),
        referee: z.number().positive().default(1),
        referrer: z.number().positive().default(5),
        tiered: z
            .array(z.object({
            level: z.number().positive(),
            bonus: z.number().positive()
        }))
            .optional(),
        requirements: z.object({
            minLevel: z.number().nonnegative().default(2),
            emailVerified: z.boolean().default(true)
        })
    }),
    airdrops: z.object({
        enabled: z.boolean().default(true),
        frequency: z.enum(['daily', 'weekly', 'monthly', 'event']).default('event'),
        distribution: z.enum(['equal', 'weighted', 'random']).default('weighted'),
        eligibility: z.object({
            minLevel: z.number().nonnegative().default(5),
            minActivity: z.number().nonnegative().default(10), // posts in last 30 days
            excludeBanned: z.boolean().default(true)
        })
    }),
    rewards: z.object({
        posting: z.object({
            enabled: z.boolean().default(true),
            quality: z.object({
                base: z.number().positive().default(0.1),
                upvoteMultiplier: z.number().positive().default(0.01),
                lengthBonus: z.number().positive().default(0.001), // per 100 chars
                mediaBonus: z.number().positive().default(0.05)
            })
        }),
        achievements: z.object({
            enabled: z.boolean().default(true),
            multiplier: z.number().positive().default(1),
            bonusPerTier: z.number().positive().default(0.5)
        })
    })
});
// Staking configuration
export const StakingConfigSchema = z.object({
    enabled: z.boolean().default(true),
    minAmount: z.number().positive().default(100),
    maxAmount: z.number().positive().default(100000),
    lockPeriods: z
        .array(z.object({
        days: z.number().positive(),
        apr: z.number().positive().max(1), // 0-100%
        compounding: z.enum(['none', 'daily', 'weekly', 'monthly']).default('daily'),
        earlyWithdrawalPenalty: z.number().nonnegative().max(1).default(0.1) // 10%
    }))
        .default([
        { days: 30, apr: 0.05, compounding: 'daily', earlyWithdrawalPenalty: 0.1 },
        { days: 90, apr: 0.08, compounding: 'daily', earlyWithdrawalPenalty: 0.15 },
        { days: 180, apr: 0.12, compounding: 'daily', earlyWithdrawalPenalty: 0.2 }
    ]),
    rewards: z.object({
        distribution: z.enum(['linear', 'compound']).default('compound'),
        frequency: z.enum(['block', 'daily', 'weekly', 'monthly']).default('daily'),
        bonus: z.object({
            loyalty: z.number().nonnegative().default(0.01), // per month staked
            amount: z
                .array(z.object({
                threshold: z.number().positive(),
                bonus: z.number().positive()
            }))
                .optional()
        })
    })
});
// Shop pricing configuration
export const ShopPricingSchema = z.object({
    currency: z.enum(['DGT', 'USD', 'BOTH']).default('DGT'),
    exchangeRate: z.number().positive().default(0.1), // 1 DGT = $0.10
    dynamicPricing: z.object({
        enabled: z.boolean().default(false),
        algorithm: z.enum(['supply_demand', 'rarity_based', 'time_decay']).default('rarity_based'),
        updateFrequency: z.number().positive().default(3600), // 1 hour
        bounds: z.object({
            min: z.number().positive().default(0.5), // 50% of base
            max: z.number().positive().default(2.0) // 200% of base
        })
    }),
    discounts: z.object({
        bulk: z
            .array(z.object({
            quantity: z.number().positive(),
            discount: z.number().positive().max(1)
        }))
            .default([
            { quantity: 5, discount: 0.05 },
            { quantity: 10, discount: 0.1 },
            { quantity: 25, discount: 0.15 }
        ]),
        seasonal: z.object({
            enabled: z.boolean().default(true),
            events: z
                .array(z.object({
                name: z.string(),
                discount: z.number().positive().max(1),
                startDate: z.string(),
                endDate: z.string(),
                categories: z.array(z.string()).optional()
            }))
                .default([])
        }),
        vip: z.object({
            enabled: z.boolean().default(true),
            tiers: z
                .array(z.object({
                minLevel: z.number().positive(),
                discount: z.number().positive().max(1)
            }))
                .default([
                { minLevel: 10, discount: 0.05 },
                { minLevel: 25, discount: 0.1 },
                { minLevel: 50, discount: 0.15 }
            ])
        })
    })
});
// Main economy configuration schema
export const EconomyConfigSchema = z.object({
    version: z.string().default('1.0.0'),
    currency: CurrencyConfigSchema,
    fees: FeeConfigSchema,
    limits: WalletLimitsSchema,
    distribution: DistributionConfigSchema,
    staking: StakingConfigSchema,
    shop: ShopPricingSchema,
    antiAbuse: z.object({
        enabled: z.boolean().default(true),
        washTrading: z.object({
            detection: z.boolean().default(true),
            minInterval: z.number().positive().default(300), // 5 minutes
            maxVelocity: z.number().positive().default(10), // transactions per hour
            penalty: z.enum(['warning', 'tempban', 'permaban']).default('warning')
        }),
        multiAccount: z.object({
            detection: z.boolean().default(true),
            ipTracking: z.boolean().default(true),
            deviceFingerprint: z.boolean().default(true),
            maxAccountsPerIP: z.number().positive().default(3)
        }),
        rateLimits: z.object({
            transactions: z.object({
                perMinute: z.number().positive().default(10),
                perHour: z.number().positive().default(100),
                perDay: z.number().positive().default(500)
            }),
            tips: z.object({
                perMinute: z.number().positive().default(5),
                perHour: z.number().positive().default(30),
                perDay: z.number().positive().default(100)
            })
        })
    }),
    emergency: z.object({
        killSwitch: z.boolean().default(false),
        maintenanceMode: z.boolean().default(false),
        withdrawalsDisabled: z.boolean().default(false),
        tradingDisabled: z.boolean().default(false),
        message: z.string().optional()
    })
});
// Validation helpers
export function validateEconomyConfig(config) {
    return EconomyConfigSchema.parse(config);
}
export function validatePartialEconomyConfig(config) {
    const result = EconomyConfigSchema.partial().parse(config);
    return result;
}
// Default configuration
export const defaultEconomyConfig = {
    version: '1.0.0',
    currency: {
        symbol: 'DGT',
        name: 'DegenTalk Token',
        decimals: 8,
        displayDecimals: 2,
        minAmount: 0.00000001,
        maxAmount: 1000000000,
        dustThreshold: 0.0001
    }
};
