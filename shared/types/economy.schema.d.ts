import { z } from 'zod';
/**
 * Economy Configuration Schemas
 *
 * Runtime validation for DGT economy configuration.
 * Controls all economic parameters, fees, limits, and monetary policies.
 */
export declare const CurrencyConfigSchema: z.ZodObject<{
    symbol: z.ZodLiteral<"DGT">;
    name: z.ZodDefault<z.ZodString>;
    decimals: z.ZodDefault<z.ZodNumber>;
    displayDecimals: z.ZodDefault<z.ZodNumber>;
    minAmount: z.ZodDefault<z.ZodNumber>;
    maxAmount: z.ZodDefault<z.ZodNumber>;
    dustThreshold: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    symbol?: "DGT";
    name?: string;
    decimals?: number;
    displayDecimals?: number;
    minAmount?: number;
    maxAmount?: number;
    dustThreshold?: number;
}, {
    symbol?: "DGT";
    name?: string;
    decimals?: number;
    displayDecimals?: number;
    minAmount?: number;
    maxAmount?: number;
    dustThreshold?: number;
}>;
export declare const FeeConfigSchema: z.ZodObject<{
    withdrawal: z.ZodObject<{
        type: z.ZodEnum<["fixed", "percentage", "tiered"]>;
        value: z.ZodNumber;
        min: z.ZodDefault<z.ZodNumber>;
        max: z.ZodOptional<z.ZodNumber>;
        tiers: z.ZodOptional<z.ZodArray<z.ZodObject<{
            threshold: z.ZodNumber;
            fee: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            threshold?: number;
            fee?: number;
        }, {
            threshold?: number;
            fee?: number;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        type?: "fixed" | "percentage" | "tiered";
        value?: number;
        min?: number;
        max?: number;
        tiers?: {
            threshold?: number;
            fee?: number;
        }[];
    }, {
        type?: "fixed" | "percentage" | "tiered";
        value?: number;
        min?: number;
        max?: number;
        tiers?: {
            threshold?: number;
            fee?: number;
        }[];
    }>;
    transaction: z.ZodObject<{
        internal: z.ZodDefault<z.ZodNumber>;
        external: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        internal?: number;
        external?: number;
    }, {
        internal?: number;
        external?: number;
    }>;
    trading: z.ZodObject<{
        maker: z.ZodDefault<z.ZodNumber>;
        taker: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        maker?: number;
        taker?: number;
    }, {
        maker?: number;
        taker?: number;
    }>;
    conversion: z.ZodObject<{
        rate: z.ZodDefault<z.ZodNumber>;
        minimum: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        minimum?: number;
        rate?: number;
    }, {
        minimum?: number;
        rate?: number;
    }>;
}, "strip", z.ZodTypeAny, {
    transaction?: {
        internal?: number;
        external?: number;
    };
    conversion?: {
        minimum?: number;
        rate?: number;
    };
    withdrawal?: {
        type?: "fixed" | "percentage" | "tiered";
        value?: number;
        min?: number;
        max?: number;
        tiers?: {
            threshold?: number;
            fee?: number;
        }[];
    };
    trading?: {
        maker?: number;
        taker?: number;
    };
}, {
    transaction?: {
        internal?: number;
        external?: number;
    };
    conversion?: {
        minimum?: number;
        rate?: number;
    };
    withdrawal?: {
        type?: "fixed" | "percentage" | "tiered";
        value?: number;
        min?: number;
        max?: number;
        tiers?: {
            threshold?: number;
            fee?: number;
        }[];
    };
    trading?: {
        maker?: number;
        taker?: number;
    };
}>;
export declare const WalletLimitsSchema: z.ZodObject<{
    withdrawal: z.ZodObject<{
        daily: z.ZodDefault<z.ZodNumber>;
        weekly: z.ZodDefault<z.ZodNumber>;
        monthly: z.ZodDefault<z.ZodNumber>;
        perTransaction: z.ZodObject<{
            min: z.ZodDefault<z.ZodNumber>;
            max: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            min?: number;
            max?: number;
        }, {
            min?: number;
            max?: number;
        }>;
        cooldown: z.ZodDefault<z.ZodNumber>;
        requireEmailVerification: z.ZodDefault<z.ZodBoolean>;
        require2FA: z.ZodDefault<z.ZodBoolean>;
        minAccountAge: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        daily?: number;
        weekly?: number;
        cooldown?: number;
        monthly?: number;
        perTransaction?: {
            min?: number;
            max?: number;
        };
        requireEmailVerification?: boolean;
        require2FA?: boolean;
        minAccountAge?: number;
    }, {
        daily?: number;
        weekly?: number;
        cooldown?: number;
        monthly?: number;
        perTransaction?: {
            min?: number;
            max?: number;
        };
        requireEmailVerification?: boolean;
        require2FA?: boolean;
        minAccountAge?: number;
    }>;
    spending: z.ZodObject<{
        daily: z.ZodDefault<z.ZodNumber>;
        perTransaction: z.ZodDefault<z.ZodNumber>;
        tipping: z.ZodObject<{
            daily: z.ZodDefault<z.ZodNumber>;
            perTip: z.ZodObject<{
                min: z.ZodDefault<z.ZodNumber>;
                max: z.ZodDefault<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                min?: number;
                max?: number;
            }, {
                min?: number;
                max?: number;
            }>;
        }, "strip", z.ZodTypeAny, {
            daily?: number;
            perTip?: {
                min?: number;
                max?: number;
            };
        }, {
            daily?: number;
            perTip?: {
                min?: number;
                max?: number;
            };
        }>;
    }, "strip", z.ZodTypeAny, {
        daily?: number;
        perTransaction?: number;
        tipping?: {
            daily?: number;
            perTip?: {
                min?: number;
                max?: number;
            };
        };
    }, {
        daily?: number;
        perTransaction?: number;
        tipping?: {
            daily?: number;
            perTip?: {
                min?: number;
                max?: number;
            };
        };
    }>;
    holding: z.ZodObject<{
        maximum: z.ZodDefault<z.ZodNumber>;
        vipThreshold: z.ZodDefault<z.ZodNumber>;
        whaleThreshold: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        maximum?: number;
        vipThreshold?: number;
        whaleThreshold?: number;
    }, {
        maximum?: number;
        vipThreshold?: number;
        whaleThreshold?: number;
    }>;
}, "strip", z.ZodTypeAny, {
    withdrawal?: {
        daily?: number;
        weekly?: number;
        cooldown?: number;
        monthly?: number;
        perTransaction?: {
            min?: number;
            max?: number;
        };
        requireEmailVerification?: boolean;
        require2FA?: boolean;
        minAccountAge?: number;
    };
    spending?: {
        daily?: number;
        perTransaction?: number;
        tipping?: {
            daily?: number;
            perTip?: {
                min?: number;
                max?: number;
            };
        };
    };
    holding?: {
        maximum?: number;
        vipThreshold?: number;
        whaleThreshold?: number;
    };
}, {
    withdrawal?: {
        daily?: number;
        weekly?: number;
        cooldown?: number;
        monthly?: number;
        perTransaction?: {
            min?: number;
            max?: number;
        };
        requireEmailVerification?: boolean;
        require2FA?: boolean;
        minAccountAge?: number;
    };
    spending?: {
        daily?: number;
        perTransaction?: number;
        tipping?: {
            daily?: number;
            perTip?: {
                min?: number;
                max?: number;
            };
        };
    };
    holding?: {
        maximum?: number;
        vipThreshold?: number;
        whaleThreshold?: number;
    };
}>;
export declare const DistributionConfigSchema: z.ZodObject<{
    faucet: z.ZodObject<{
        enabled: z.ZodDefault<z.ZodBoolean>;
        amount: z.ZodDefault<z.ZodNumber>;
        cooldown: z.ZodDefault<z.ZodNumber>;
        requireCaptcha: z.ZodDefault<z.ZodBoolean>;
        minLevel: z.ZodDefault<z.ZodNumber>;
        lifetime: z.ZodObject<{
            max: z.ZodDefault<z.ZodNumber>;
            resetMonthly: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            max?: number;
            resetMonthly?: boolean;
        }, {
            max?: number;
            resetMonthly?: boolean;
        }>;
    }, "strip", z.ZodTypeAny, {
        lifetime?: {
            max?: number;
            resetMonthly?: boolean;
        };
        minLevel?: number;
        amount?: number;
        enabled?: boolean;
        cooldown?: number;
        requireCaptcha?: boolean;
    }, {
        lifetime?: {
            max?: number;
            resetMonthly?: boolean;
        };
        minLevel?: number;
        amount?: number;
        enabled?: boolean;
        cooldown?: number;
        requireCaptcha?: boolean;
    }>;
    referral: z.ZodObject<{
        enabled: z.ZodDefault<z.ZodBoolean>;
        referee: z.ZodDefault<z.ZodNumber>;
        referrer: z.ZodDefault<z.ZodNumber>;
        tiered: z.ZodOptional<z.ZodArray<z.ZodObject<{
            level: z.ZodNumber;
            bonus: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            level?: number;
            bonus?: number;
        }, {
            level?: number;
            bonus?: number;
        }>, "many">>;
        requirements: z.ZodObject<{
            minLevel: z.ZodDefault<z.ZodNumber>;
            emailVerified: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            minLevel?: number;
            emailVerified?: boolean;
        }, {
            minLevel?: number;
            emailVerified?: boolean;
        }>;
    }, "strip", z.ZodTypeAny, {
        enabled?: boolean;
        referrer?: number;
        requirements?: {
            minLevel?: number;
            emailVerified?: boolean;
        };
        tiered?: {
            level?: number;
            bonus?: number;
        }[];
        referee?: number;
    }, {
        enabled?: boolean;
        referrer?: number;
        requirements?: {
            minLevel?: number;
            emailVerified?: boolean;
        };
        tiered?: {
            level?: number;
            bonus?: number;
        }[];
        referee?: number;
    }>;
    airdrops: z.ZodObject<{
        enabled: z.ZodDefault<z.ZodBoolean>;
        frequency: z.ZodDefault<z.ZodEnum<["daily", "weekly", "monthly", "event"]>>;
        distribution: z.ZodDefault<z.ZodEnum<["equal", "weighted", "random"]>>;
        eligibility: z.ZodObject<{
            minLevel: z.ZodDefault<z.ZodNumber>;
            minActivity: z.ZodDefault<z.ZodNumber>;
            excludeBanned: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            minLevel?: number;
            minActivity?: number;
            excludeBanned?: boolean;
        }, {
            minLevel?: number;
            minActivity?: number;
            excludeBanned?: boolean;
        }>;
    }, "strip", z.ZodTypeAny, {
        enabled?: boolean;
        frequency?: "event" | "daily" | "weekly" | "monthly";
        distribution?: "equal" | "weighted" | "random";
        eligibility?: {
            minLevel?: number;
            minActivity?: number;
            excludeBanned?: boolean;
        };
    }, {
        enabled?: boolean;
        frequency?: "event" | "daily" | "weekly" | "monthly";
        distribution?: "equal" | "weighted" | "random";
        eligibility?: {
            minLevel?: number;
            minActivity?: number;
            excludeBanned?: boolean;
        };
    }>;
    rewards: z.ZodObject<{
        posting: z.ZodObject<{
            enabled: z.ZodDefault<z.ZodBoolean>;
            quality: z.ZodObject<{
                base: z.ZodDefault<z.ZodNumber>;
                upvoteMultiplier: z.ZodDefault<z.ZodNumber>;
                lengthBonus: z.ZodDefault<z.ZodNumber>;
                mediaBonus: z.ZodDefault<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                base?: number;
                upvoteMultiplier?: number;
                lengthBonus?: number;
                mediaBonus?: number;
            }, {
                base?: number;
                upvoteMultiplier?: number;
                lengthBonus?: number;
                mediaBonus?: number;
            }>;
        }, "strip", z.ZodTypeAny, {
            enabled?: boolean;
            quality?: {
                base?: number;
                upvoteMultiplier?: number;
                lengthBonus?: number;
                mediaBonus?: number;
            };
        }, {
            enabled?: boolean;
            quality?: {
                base?: number;
                upvoteMultiplier?: number;
                lengthBonus?: number;
                mediaBonus?: number;
            };
        }>;
        achievements: z.ZodObject<{
            enabled: z.ZodDefault<z.ZodBoolean>;
            multiplier: z.ZodDefault<z.ZodNumber>;
            bonusPerTier: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            enabled?: boolean;
            multiplier?: number;
            bonusPerTier?: number;
        }, {
            enabled?: boolean;
            multiplier?: number;
            bonusPerTier?: number;
        }>;
    }, "strip", z.ZodTypeAny, {
        achievements?: {
            enabled?: boolean;
            multiplier?: number;
            bonusPerTier?: number;
        };
        posting?: {
            enabled?: boolean;
            quality?: {
                base?: number;
                upvoteMultiplier?: number;
                lengthBonus?: number;
                mediaBonus?: number;
            };
        };
    }, {
        achievements?: {
            enabled?: boolean;
            multiplier?: number;
            bonusPerTier?: number;
        };
        posting?: {
            enabled?: boolean;
            quality?: {
                base?: number;
                upvoteMultiplier?: number;
                lengthBonus?: number;
                mediaBonus?: number;
            };
        };
    }>;
}, "strip", z.ZodTypeAny, {
    faucet?: {
        lifetime?: {
            max?: number;
            resetMonthly?: boolean;
        };
        minLevel?: number;
        amount?: number;
        enabled?: boolean;
        cooldown?: number;
        requireCaptcha?: boolean;
    };
    referral?: {
        enabled?: boolean;
        referrer?: number;
        requirements?: {
            minLevel?: number;
            emailVerified?: boolean;
        };
        tiered?: {
            level?: number;
            bonus?: number;
        }[];
        referee?: number;
    };
    airdrops?: {
        enabled?: boolean;
        frequency?: "event" | "daily" | "weekly" | "monthly";
        distribution?: "equal" | "weighted" | "random";
        eligibility?: {
            minLevel?: number;
            minActivity?: number;
            excludeBanned?: boolean;
        };
    };
    rewards?: {
        achievements?: {
            enabled?: boolean;
            multiplier?: number;
            bonusPerTier?: number;
        };
        posting?: {
            enabled?: boolean;
            quality?: {
                base?: number;
                upvoteMultiplier?: number;
                lengthBonus?: number;
                mediaBonus?: number;
            };
        };
    };
}, {
    faucet?: {
        lifetime?: {
            max?: number;
            resetMonthly?: boolean;
        };
        minLevel?: number;
        amount?: number;
        enabled?: boolean;
        cooldown?: number;
        requireCaptcha?: boolean;
    };
    referral?: {
        enabled?: boolean;
        referrer?: number;
        requirements?: {
            minLevel?: number;
            emailVerified?: boolean;
        };
        tiered?: {
            level?: number;
            bonus?: number;
        }[];
        referee?: number;
    };
    airdrops?: {
        enabled?: boolean;
        frequency?: "event" | "daily" | "weekly" | "monthly";
        distribution?: "equal" | "weighted" | "random";
        eligibility?: {
            minLevel?: number;
            minActivity?: number;
            excludeBanned?: boolean;
        };
    };
    rewards?: {
        achievements?: {
            enabled?: boolean;
            multiplier?: number;
            bonusPerTier?: number;
        };
        posting?: {
            enabled?: boolean;
            quality?: {
                base?: number;
                upvoteMultiplier?: number;
                lengthBonus?: number;
                mediaBonus?: number;
            };
        };
    };
}>;
export declare const StakingConfigSchema: z.ZodObject<{
    enabled: z.ZodDefault<z.ZodBoolean>;
    minAmount: z.ZodDefault<z.ZodNumber>;
    maxAmount: z.ZodDefault<z.ZodNumber>;
    lockPeriods: z.ZodDefault<z.ZodArray<z.ZodObject<{
        days: z.ZodNumber;
        apr: z.ZodNumber;
        compounding: z.ZodDefault<z.ZodEnum<["none", "daily", "weekly", "monthly"]>>;
        earlyWithdrawalPenalty: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        days?: number;
        apr?: number;
        compounding?: "daily" | "none" | "weekly" | "monthly";
        earlyWithdrawalPenalty?: number;
    }, {
        days?: number;
        apr?: number;
        compounding?: "daily" | "none" | "weekly" | "monthly";
        earlyWithdrawalPenalty?: number;
    }>, "many">>;
    rewards: z.ZodObject<{
        distribution: z.ZodDefault<z.ZodEnum<["linear", "compound"]>>;
        frequency: z.ZodDefault<z.ZodEnum<["block", "daily", "weekly", "monthly"]>>;
        bonus: z.ZodObject<{
            loyalty: z.ZodDefault<z.ZodNumber>;
            amount: z.ZodOptional<z.ZodArray<z.ZodObject<{
                threshold: z.ZodNumber;
                bonus: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                threshold?: number;
                bonus?: number;
            }, {
                threshold?: number;
                bonus?: number;
            }>, "many">>;
        }, "strip", z.ZodTypeAny, {
            amount?: {
                threshold?: number;
                bonus?: number;
            }[];
            loyalty?: number;
        }, {
            amount?: {
                threshold?: number;
                bonus?: number;
            }[];
            loyalty?: number;
        }>;
    }, "strip", z.ZodTypeAny, {
        frequency?: "daily" | "weekly" | "monthly" | "block";
        bonus?: {
            amount?: {
                threshold?: number;
                bonus?: number;
            }[];
            loyalty?: number;
        };
        distribution?: "linear" | "compound";
    }, {
        frequency?: "daily" | "weekly" | "monthly" | "block";
        bonus?: {
            amount?: {
                threshold?: number;
                bonus?: number;
            }[];
            loyalty?: number;
        };
        distribution?: "linear" | "compound";
    }>;
}, "strip", z.ZodTypeAny, {
    enabled?: boolean;
    minAmount?: number;
    maxAmount?: number;
    rewards?: {
        frequency?: "daily" | "weekly" | "monthly" | "block";
        bonus?: {
            amount?: {
                threshold?: number;
                bonus?: number;
            }[];
            loyalty?: number;
        };
        distribution?: "linear" | "compound";
    };
    lockPeriods?: {
        days?: number;
        apr?: number;
        compounding?: "daily" | "none" | "weekly" | "monthly";
        earlyWithdrawalPenalty?: number;
    }[];
}, {
    enabled?: boolean;
    minAmount?: number;
    maxAmount?: number;
    rewards?: {
        frequency?: "daily" | "weekly" | "monthly" | "block";
        bonus?: {
            amount?: {
                threshold?: number;
                bonus?: number;
            }[];
            loyalty?: number;
        };
        distribution?: "linear" | "compound";
    };
    lockPeriods?: {
        days?: number;
        apr?: number;
        compounding?: "daily" | "none" | "weekly" | "monthly";
        earlyWithdrawalPenalty?: number;
    }[];
}>;
export declare const ShopPricingSchema: z.ZodObject<{
    currency: z.ZodDefault<z.ZodEnum<["DGT", "USD", "BOTH"]>>;
    exchangeRate: z.ZodDefault<z.ZodNumber>;
    dynamicPricing: z.ZodObject<{
        enabled: z.ZodDefault<z.ZodBoolean>;
        algorithm: z.ZodDefault<z.ZodEnum<["supply_demand", "rarity_based", "time_decay"]>>;
        updateFrequency: z.ZodDefault<z.ZodNumber>;
        bounds: z.ZodObject<{
            min: z.ZodDefault<z.ZodNumber>;
            max: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            min?: number;
            max?: number;
        }, {
            min?: number;
            max?: number;
        }>;
    }, "strip", z.ZodTypeAny, {
        enabled?: boolean;
        algorithm?: "supply_demand" | "rarity_based" | "time_decay";
        updateFrequency?: number;
        bounds?: {
            min?: number;
            max?: number;
        };
    }, {
        enabled?: boolean;
        algorithm?: "supply_demand" | "rarity_based" | "time_decay";
        updateFrequency?: number;
        bounds?: {
            min?: number;
            max?: number;
        };
    }>;
    discounts: z.ZodObject<{
        bulk: z.ZodDefault<z.ZodArray<z.ZodObject<{
            quantity: z.ZodNumber;
            discount: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            discount?: number;
            quantity?: number;
        }, {
            discount?: number;
            quantity?: number;
        }>, "many">>;
        seasonal: z.ZodObject<{
            enabled: z.ZodDefault<z.ZodBoolean>;
            events: z.ZodDefault<z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                discount: z.ZodNumber;
                startDate: z.ZodString;
                endDate: z.ZodString;
                categories: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            }, "strip", z.ZodTypeAny, {
                name?: string;
                startDate?: string;
                endDate?: string;
                discount?: number;
                categories?: string[];
            }, {
                name?: string;
                startDate?: string;
                endDate?: string;
                discount?: number;
                categories?: string[];
            }>, "many">>;
        }, "strip", z.ZodTypeAny, {
            enabled?: boolean;
            events?: {
                name?: string;
                startDate?: string;
                endDate?: string;
                discount?: number;
                categories?: string[];
            }[];
        }, {
            enabled?: boolean;
            events?: {
                name?: string;
                startDate?: string;
                endDate?: string;
                discount?: number;
                categories?: string[];
            }[];
        }>;
        vip: z.ZodObject<{
            enabled: z.ZodDefault<z.ZodBoolean>;
            tiers: z.ZodDefault<z.ZodArray<z.ZodObject<{
                minLevel: z.ZodNumber;
                discount: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                minLevel?: number;
                discount?: number;
            }, {
                minLevel?: number;
                discount?: number;
            }>, "many">>;
        }, "strip", z.ZodTypeAny, {
            enabled?: boolean;
            tiers?: {
                minLevel?: number;
                discount?: number;
            }[];
        }, {
            enabled?: boolean;
            tiers?: {
                minLevel?: number;
                discount?: number;
            }[];
        }>;
    }, "strip", z.ZodTypeAny, {
        bulk?: {
            discount?: number;
            quantity?: number;
        }[];
        seasonal?: {
            enabled?: boolean;
            events?: {
                name?: string;
                startDate?: string;
                endDate?: string;
                discount?: number;
                categories?: string[];
            }[];
        };
        vip?: {
            enabled?: boolean;
            tiers?: {
                minLevel?: number;
                discount?: number;
            }[];
        };
    }, {
        bulk?: {
            discount?: number;
            quantity?: number;
        }[];
        seasonal?: {
            enabled?: boolean;
            events?: {
                name?: string;
                startDate?: string;
                endDate?: string;
                discount?: number;
                categories?: string[];
            }[];
        };
        vip?: {
            enabled?: boolean;
            tiers?: {
                minLevel?: number;
                discount?: number;
            }[];
        };
    }>;
}, "strip", z.ZodTypeAny, {
    currency?: "DGT" | "USD" | "BOTH";
    exchangeRate?: number;
    dynamicPricing?: {
        enabled?: boolean;
        algorithm?: "supply_demand" | "rarity_based" | "time_decay";
        updateFrequency?: number;
        bounds?: {
            min?: number;
            max?: number;
        };
    };
    discounts?: {
        bulk?: {
            discount?: number;
            quantity?: number;
        }[];
        seasonal?: {
            enabled?: boolean;
            events?: {
                name?: string;
                startDate?: string;
                endDate?: string;
                discount?: number;
                categories?: string[];
            }[];
        };
        vip?: {
            enabled?: boolean;
            tiers?: {
                minLevel?: number;
                discount?: number;
            }[];
        };
    };
}, {
    currency?: "DGT" | "USD" | "BOTH";
    exchangeRate?: number;
    dynamicPricing?: {
        enabled?: boolean;
        algorithm?: "supply_demand" | "rarity_based" | "time_decay";
        updateFrequency?: number;
        bounds?: {
            min?: number;
            max?: number;
        };
    };
    discounts?: {
        bulk?: {
            discount?: number;
            quantity?: number;
        }[];
        seasonal?: {
            enabled?: boolean;
            events?: {
                name?: string;
                startDate?: string;
                endDate?: string;
                discount?: number;
                categories?: string[];
            }[];
        };
        vip?: {
            enabled?: boolean;
            tiers?: {
                minLevel?: number;
                discount?: number;
            }[];
        };
    };
}>;
export declare const EconomyConfigSchema: z.ZodObject<{
    version: z.ZodDefault<z.ZodString>;
    currency: z.ZodObject<{
        symbol: z.ZodLiteral<"DGT">;
        name: z.ZodDefault<z.ZodString>;
        decimals: z.ZodDefault<z.ZodNumber>;
        displayDecimals: z.ZodDefault<z.ZodNumber>;
        minAmount: z.ZodDefault<z.ZodNumber>;
        maxAmount: z.ZodDefault<z.ZodNumber>;
        dustThreshold: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        symbol?: "DGT";
        name?: string;
        decimals?: number;
        displayDecimals?: number;
        minAmount?: number;
        maxAmount?: number;
        dustThreshold?: number;
    }, {
        symbol?: "DGT";
        name?: string;
        decimals?: number;
        displayDecimals?: number;
        minAmount?: number;
        maxAmount?: number;
        dustThreshold?: number;
    }>;
    fees: z.ZodObject<{
        withdrawal: z.ZodObject<{
            type: z.ZodEnum<["fixed", "percentage", "tiered"]>;
            value: z.ZodNumber;
            min: z.ZodDefault<z.ZodNumber>;
            max: z.ZodOptional<z.ZodNumber>;
            tiers: z.ZodOptional<z.ZodArray<z.ZodObject<{
                threshold: z.ZodNumber;
                fee: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                threshold?: number;
                fee?: number;
            }, {
                threshold?: number;
                fee?: number;
            }>, "many">>;
        }, "strip", z.ZodTypeAny, {
            type?: "fixed" | "percentage" | "tiered";
            value?: number;
            min?: number;
            max?: number;
            tiers?: {
                threshold?: number;
                fee?: number;
            }[];
        }, {
            type?: "fixed" | "percentage" | "tiered";
            value?: number;
            min?: number;
            max?: number;
            tiers?: {
                threshold?: number;
                fee?: number;
            }[];
        }>;
        transaction: z.ZodObject<{
            internal: z.ZodDefault<z.ZodNumber>;
            external: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            internal?: number;
            external?: number;
        }, {
            internal?: number;
            external?: number;
        }>;
        trading: z.ZodObject<{
            maker: z.ZodDefault<z.ZodNumber>;
            taker: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            maker?: number;
            taker?: number;
        }, {
            maker?: number;
            taker?: number;
        }>;
        conversion: z.ZodObject<{
            rate: z.ZodDefault<z.ZodNumber>;
            minimum: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            minimum?: number;
            rate?: number;
        }, {
            minimum?: number;
            rate?: number;
        }>;
    }, "strip", z.ZodTypeAny, {
        transaction?: {
            internal?: number;
            external?: number;
        };
        conversion?: {
            minimum?: number;
            rate?: number;
        };
        withdrawal?: {
            type?: "fixed" | "percentage" | "tiered";
            value?: number;
            min?: number;
            max?: number;
            tiers?: {
                threshold?: number;
                fee?: number;
            }[];
        };
        trading?: {
            maker?: number;
            taker?: number;
        };
    }, {
        transaction?: {
            internal?: number;
            external?: number;
        };
        conversion?: {
            minimum?: number;
            rate?: number;
        };
        withdrawal?: {
            type?: "fixed" | "percentage" | "tiered";
            value?: number;
            min?: number;
            max?: number;
            tiers?: {
                threshold?: number;
                fee?: number;
            }[];
        };
        trading?: {
            maker?: number;
            taker?: number;
        };
    }>;
    limits: z.ZodObject<{
        withdrawal: z.ZodObject<{
            daily: z.ZodDefault<z.ZodNumber>;
            weekly: z.ZodDefault<z.ZodNumber>;
            monthly: z.ZodDefault<z.ZodNumber>;
            perTransaction: z.ZodObject<{
                min: z.ZodDefault<z.ZodNumber>;
                max: z.ZodDefault<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                min?: number;
                max?: number;
            }, {
                min?: number;
                max?: number;
            }>;
            cooldown: z.ZodDefault<z.ZodNumber>;
            requireEmailVerification: z.ZodDefault<z.ZodBoolean>;
            require2FA: z.ZodDefault<z.ZodBoolean>;
            minAccountAge: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            daily?: number;
            weekly?: number;
            cooldown?: number;
            monthly?: number;
            perTransaction?: {
                min?: number;
                max?: number;
            };
            requireEmailVerification?: boolean;
            require2FA?: boolean;
            minAccountAge?: number;
        }, {
            daily?: number;
            weekly?: number;
            cooldown?: number;
            monthly?: number;
            perTransaction?: {
                min?: number;
                max?: number;
            };
            requireEmailVerification?: boolean;
            require2FA?: boolean;
            minAccountAge?: number;
        }>;
        spending: z.ZodObject<{
            daily: z.ZodDefault<z.ZodNumber>;
            perTransaction: z.ZodDefault<z.ZodNumber>;
            tipping: z.ZodObject<{
                daily: z.ZodDefault<z.ZodNumber>;
                perTip: z.ZodObject<{
                    min: z.ZodDefault<z.ZodNumber>;
                    max: z.ZodDefault<z.ZodNumber>;
                }, "strip", z.ZodTypeAny, {
                    min?: number;
                    max?: number;
                }, {
                    min?: number;
                    max?: number;
                }>;
            }, "strip", z.ZodTypeAny, {
                daily?: number;
                perTip?: {
                    min?: number;
                    max?: number;
                };
            }, {
                daily?: number;
                perTip?: {
                    min?: number;
                    max?: number;
                };
            }>;
        }, "strip", z.ZodTypeAny, {
            daily?: number;
            perTransaction?: number;
            tipping?: {
                daily?: number;
                perTip?: {
                    min?: number;
                    max?: number;
                };
            };
        }, {
            daily?: number;
            perTransaction?: number;
            tipping?: {
                daily?: number;
                perTip?: {
                    min?: number;
                    max?: number;
                };
            };
        }>;
        holding: z.ZodObject<{
            maximum: z.ZodDefault<z.ZodNumber>;
            vipThreshold: z.ZodDefault<z.ZodNumber>;
            whaleThreshold: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            maximum?: number;
            vipThreshold?: number;
            whaleThreshold?: number;
        }, {
            maximum?: number;
            vipThreshold?: number;
            whaleThreshold?: number;
        }>;
    }, "strip", z.ZodTypeAny, {
        withdrawal?: {
            daily?: number;
            weekly?: number;
            cooldown?: number;
            monthly?: number;
            perTransaction?: {
                min?: number;
                max?: number;
            };
            requireEmailVerification?: boolean;
            require2FA?: boolean;
            minAccountAge?: number;
        };
        spending?: {
            daily?: number;
            perTransaction?: number;
            tipping?: {
                daily?: number;
                perTip?: {
                    min?: number;
                    max?: number;
                };
            };
        };
        holding?: {
            maximum?: number;
            vipThreshold?: number;
            whaleThreshold?: number;
        };
    }, {
        withdrawal?: {
            daily?: number;
            weekly?: number;
            cooldown?: number;
            monthly?: number;
            perTransaction?: {
                min?: number;
                max?: number;
            };
            requireEmailVerification?: boolean;
            require2FA?: boolean;
            minAccountAge?: number;
        };
        spending?: {
            daily?: number;
            perTransaction?: number;
            tipping?: {
                daily?: number;
                perTip?: {
                    min?: number;
                    max?: number;
                };
            };
        };
        holding?: {
            maximum?: number;
            vipThreshold?: number;
            whaleThreshold?: number;
        };
    }>;
    distribution: z.ZodObject<{
        faucet: z.ZodObject<{
            enabled: z.ZodDefault<z.ZodBoolean>;
            amount: z.ZodDefault<z.ZodNumber>;
            cooldown: z.ZodDefault<z.ZodNumber>;
            requireCaptcha: z.ZodDefault<z.ZodBoolean>;
            minLevel: z.ZodDefault<z.ZodNumber>;
            lifetime: z.ZodObject<{
                max: z.ZodDefault<z.ZodNumber>;
                resetMonthly: z.ZodDefault<z.ZodBoolean>;
            }, "strip", z.ZodTypeAny, {
                max?: number;
                resetMonthly?: boolean;
            }, {
                max?: number;
                resetMonthly?: boolean;
            }>;
        }, "strip", z.ZodTypeAny, {
            lifetime?: {
                max?: number;
                resetMonthly?: boolean;
            };
            minLevel?: number;
            amount?: number;
            enabled?: boolean;
            cooldown?: number;
            requireCaptcha?: boolean;
        }, {
            lifetime?: {
                max?: number;
                resetMonthly?: boolean;
            };
            minLevel?: number;
            amount?: number;
            enabled?: boolean;
            cooldown?: number;
            requireCaptcha?: boolean;
        }>;
        referral: z.ZodObject<{
            enabled: z.ZodDefault<z.ZodBoolean>;
            referee: z.ZodDefault<z.ZodNumber>;
            referrer: z.ZodDefault<z.ZodNumber>;
            tiered: z.ZodOptional<z.ZodArray<z.ZodObject<{
                level: z.ZodNumber;
                bonus: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                level?: number;
                bonus?: number;
            }, {
                level?: number;
                bonus?: number;
            }>, "many">>;
            requirements: z.ZodObject<{
                minLevel: z.ZodDefault<z.ZodNumber>;
                emailVerified: z.ZodDefault<z.ZodBoolean>;
            }, "strip", z.ZodTypeAny, {
                minLevel?: number;
                emailVerified?: boolean;
            }, {
                minLevel?: number;
                emailVerified?: boolean;
            }>;
        }, "strip", z.ZodTypeAny, {
            enabled?: boolean;
            referrer?: number;
            requirements?: {
                minLevel?: number;
                emailVerified?: boolean;
            };
            tiered?: {
                level?: number;
                bonus?: number;
            }[];
            referee?: number;
        }, {
            enabled?: boolean;
            referrer?: number;
            requirements?: {
                minLevel?: number;
                emailVerified?: boolean;
            };
            tiered?: {
                level?: number;
                bonus?: number;
            }[];
            referee?: number;
        }>;
        airdrops: z.ZodObject<{
            enabled: z.ZodDefault<z.ZodBoolean>;
            frequency: z.ZodDefault<z.ZodEnum<["daily", "weekly", "monthly", "event"]>>;
            distribution: z.ZodDefault<z.ZodEnum<["equal", "weighted", "random"]>>;
            eligibility: z.ZodObject<{
                minLevel: z.ZodDefault<z.ZodNumber>;
                minActivity: z.ZodDefault<z.ZodNumber>;
                excludeBanned: z.ZodDefault<z.ZodBoolean>;
            }, "strip", z.ZodTypeAny, {
                minLevel?: number;
                minActivity?: number;
                excludeBanned?: boolean;
            }, {
                minLevel?: number;
                minActivity?: number;
                excludeBanned?: boolean;
            }>;
        }, "strip", z.ZodTypeAny, {
            enabled?: boolean;
            frequency?: "event" | "daily" | "weekly" | "monthly";
            distribution?: "equal" | "weighted" | "random";
            eligibility?: {
                minLevel?: number;
                minActivity?: number;
                excludeBanned?: boolean;
            };
        }, {
            enabled?: boolean;
            frequency?: "event" | "daily" | "weekly" | "monthly";
            distribution?: "equal" | "weighted" | "random";
            eligibility?: {
                minLevel?: number;
                minActivity?: number;
                excludeBanned?: boolean;
            };
        }>;
        rewards: z.ZodObject<{
            posting: z.ZodObject<{
                enabled: z.ZodDefault<z.ZodBoolean>;
                quality: z.ZodObject<{
                    base: z.ZodDefault<z.ZodNumber>;
                    upvoteMultiplier: z.ZodDefault<z.ZodNumber>;
                    lengthBonus: z.ZodDefault<z.ZodNumber>;
                    mediaBonus: z.ZodDefault<z.ZodNumber>;
                }, "strip", z.ZodTypeAny, {
                    base?: number;
                    upvoteMultiplier?: number;
                    lengthBonus?: number;
                    mediaBonus?: number;
                }, {
                    base?: number;
                    upvoteMultiplier?: number;
                    lengthBonus?: number;
                    mediaBonus?: number;
                }>;
            }, "strip", z.ZodTypeAny, {
                enabled?: boolean;
                quality?: {
                    base?: number;
                    upvoteMultiplier?: number;
                    lengthBonus?: number;
                    mediaBonus?: number;
                };
            }, {
                enabled?: boolean;
                quality?: {
                    base?: number;
                    upvoteMultiplier?: number;
                    lengthBonus?: number;
                    mediaBonus?: number;
                };
            }>;
            achievements: z.ZodObject<{
                enabled: z.ZodDefault<z.ZodBoolean>;
                multiplier: z.ZodDefault<z.ZodNumber>;
                bonusPerTier: z.ZodDefault<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                enabled?: boolean;
                multiplier?: number;
                bonusPerTier?: number;
            }, {
                enabled?: boolean;
                multiplier?: number;
                bonusPerTier?: number;
            }>;
        }, "strip", z.ZodTypeAny, {
            achievements?: {
                enabled?: boolean;
                multiplier?: number;
                bonusPerTier?: number;
            };
            posting?: {
                enabled?: boolean;
                quality?: {
                    base?: number;
                    upvoteMultiplier?: number;
                    lengthBonus?: number;
                    mediaBonus?: number;
                };
            };
        }, {
            achievements?: {
                enabled?: boolean;
                multiplier?: number;
                bonusPerTier?: number;
            };
            posting?: {
                enabled?: boolean;
                quality?: {
                    base?: number;
                    upvoteMultiplier?: number;
                    lengthBonus?: number;
                    mediaBonus?: number;
                };
            };
        }>;
    }, "strip", z.ZodTypeAny, {
        faucet?: {
            lifetime?: {
                max?: number;
                resetMonthly?: boolean;
            };
            minLevel?: number;
            amount?: number;
            enabled?: boolean;
            cooldown?: number;
            requireCaptcha?: boolean;
        };
        referral?: {
            enabled?: boolean;
            referrer?: number;
            requirements?: {
                minLevel?: number;
                emailVerified?: boolean;
            };
            tiered?: {
                level?: number;
                bonus?: number;
            }[];
            referee?: number;
        };
        airdrops?: {
            enabled?: boolean;
            frequency?: "event" | "daily" | "weekly" | "monthly";
            distribution?: "equal" | "weighted" | "random";
            eligibility?: {
                minLevel?: number;
                minActivity?: number;
                excludeBanned?: boolean;
            };
        };
        rewards?: {
            achievements?: {
                enabled?: boolean;
                multiplier?: number;
                bonusPerTier?: number;
            };
            posting?: {
                enabled?: boolean;
                quality?: {
                    base?: number;
                    upvoteMultiplier?: number;
                    lengthBonus?: number;
                    mediaBonus?: number;
                };
            };
        };
    }, {
        faucet?: {
            lifetime?: {
                max?: number;
                resetMonthly?: boolean;
            };
            minLevel?: number;
            amount?: number;
            enabled?: boolean;
            cooldown?: number;
            requireCaptcha?: boolean;
        };
        referral?: {
            enabled?: boolean;
            referrer?: number;
            requirements?: {
                minLevel?: number;
                emailVerified?: boolean;
            };
            tiered?: {
                level?: number;
                bonus?: number;
            }[];
            referee?: number;
        };
        airdrops?: {
            enabled?: boolean;
            frequency?: "event" | "daily" | "weekly" | "monthly";
            distribution?: "equal" | "weighted" | "random";
            eligibility?: {
                minLevel?: number;
                minActivity?: number;
                excludeBanned?: boolean;
            };
        };
        rewards?: {
            achievements?: {
                enabled?: boolean;
                multiplier?: number;
                bonusPerTier?: number;
            };
            posting?: {
                enabled?: boolean;
                quality?: {
                    base?: number;
                    upvoteMultiplier?: number;
                    lengthBonus?: number;
                    mediaBonus?: number;
                };
            };
        };
    }>;
    staking: z.ZodObject<{
        enabled: z.ZodDefault<z.ZodBoolean>;
        minAmount: z.ZodDefault<z.ZodNumber>;
        maxAmount: z.ZodDefault<z.ZodNumber>;
        lockPeriods: z.ZodDefault<z.ZodArray<z.ZodObject<{
            days: z.ZodNumber;
            apr: z.ZodNumber;
            compounding: z.ZodDefault<z.ZodEnum<["none", "daily", "weekly", "monthly"]>>;
            earlyWithdrawalPenalty: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            days?: number;
            apr?: number;
            compounding?: "daily" | "none" | "weekly" | "monthly";
            earlyWithdrawalPenalty?: number;
        }, {
            days?: number;
            apr?: number;
            compounding?: "daily" | "none" | "weekly" | "monthly";
            earlyWithdrawalPenalty?: number;
        }>, "many">>;
        rewards: z.ZodObject<{
            distribution: z.ZodDefault<z.ZodEnum<["linear", "compound"]>>;
            frequency: z.ZodDefault<z.ZodEnum<["block", "daily", "weekly", "monthly"]>>;
            bonus: z.ZodObject<{
                loyalty: z.ZodDefault<z.ZodNumber>;
                amount: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    threshold: z.ZodNumber;
                    bonus: z.ZodNumber;
                }, "strip", z.ZodTypeAny, {
                    threshold?: number;
                    bonus?: number;
                }, {
                    threshold?: number;
                    bonus?: number;
                }>, "many">>;
            }, "strip", z.ZodTypeAny, {
                amount?: {
                    threshold?: number;
                    bonus?: number;
                }[];
                loyalty?: number;
            }, {
                amount?: {
                    threshold?: number;
                    bonus?: number;
                }[];
                loyalty?: number;
            }>;
        }, "strip", z.ZodTypeAny, {
            frequency?: "daily" | "weekly" | "monthly" | "block";
            bonus?: {
                amount?: {
                    threshold?: number;
                    bonus?: number;
                }[];
                loyalty?: number;
            };
            distribution?: "linear" | "compound";
        }, {
            frequency?: "daily" | "weekly" | "monthly" | "block";
            bonus?: {
                amount?: {
                    threshold?: number;
                    bonus?: number;
                }[];
                loyalty?: number;
            };
            distribution?: "linear" | "compound";
        }>;
    }, "strip", z.ZodTypeAny, {
        enabled?: boolean;
        minAmount?: number;
        maxAmount?: number;
        rewards?: {
            frequency?: "daily" | "weekly" | "monthly" | "block";
            bonus?: {
                amount?: {
                    threshold?: number;
                    bonus?: number;
                }[];
                loyalty?: number;
            };
            distribution?: "linear" | "compound";
        };
        lockPeriods?: {
            days?: number;
            apr?: number;
            compounding?: "daily" | "none" | "weekly" | "monthly";
            earlyWithdrawalPenalty?: number;
        }[];
    }, {
        enabled?: boolean;
        minAmount?: number;
        maxAmount?: number;
        rewards?: {
            frequency?: "daily" | "weekly" | "monthly" | "block";
            bonus?: {
                amount?: {
                    threshold?: number;
                    bonus?: number;
                }[];
                loyalty?: number;
            };
            distribution?: "linear" | "compound";
        };
        lockPeriods?: {
            days?: number;
            apr?: number;
            compounding?: "daily" | "none" | "weekly" | "monthly";
            earlyWithdrawalPenalty?: number;
        }[];
    }>;
    shop: z.ZodObject<{
        currency: z.ZodDefault<z.ZodEnum<["DGT", "USD", "BOTH"]>>;
        exchangeRate: z.ZodDefault<z.ZodNumber>;
        dynamicPricing: z.ZodObject<{
            enabled: z.ZodDefault<z.ZodBoolean>;
            algorithm: z.ZodDefault<z.ZodEnum<["supply_demand", "rarity_based", "time_decay"]>>;
            updateFrequency: z.ZodDefault<z.ZodNumber>;
            bounds: z.ZodObject<{
                min: z.ZodDefault<z.ZodNumber>;
                max: z.ZodDefault<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                min?: number;
                max?: number;
            }, {
                min?: number;
                max?: number;
            }>;
        }, "strip", z.ZodTypeAny, {
            enabled?: boolean;
            algorithm?: "supply_demand" | "rarity_based" | "time_decay";
            updateFrequency?: number;
            bounds?: {
                min?: number;
                max?: number;
            };
        }, {
            enabled?: boolean;
            algorithm?: "supply_demand" | "rarity_based" | "time_decay";
            updateFrequency?: number;
            bounds?: {
                min?: number;
                max?: number;
            };
        }>;
        discounts: z.ZodObject<{
            bulk: z.ZodDefault<z.ZodArray<z.ZodObject<{
                quantity: z.ZodNumber;
                discount: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                discount?: number;
                quantity?: number;
            }, {
                discount?: number;
                quantity?: number;
            }>, "many">>;
            seasonal: z.ZodObject<{
                enabled: z.ZodDefault<z.ZodBoolean>;
                events: z.ZodDefault<z.ZodArray<z.ZodObject<{
                    name: z.ZodString;
                    discount: z.ZodNumber;
                    startDate: z.ZodString;
                    endDate: z.ZodString;
                    categories: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                }, "strip", z.ZodTypeAny, {
                    name?: string;
                    startDate?: string;
                    endDate?: string;
                    discount?: number;
                    categories?: string[];
                }, {
                    name?: string;
                    startDate?: string;
                    endDate?: string;
                    discount?: number;
                    categories?: string[];
                }>, "many">>;
            }, "strip", z.ZodTypeAny, {
                enabled?: boolean;
                events?: {
                    name?: string;
                    startDate?: string;
                    endDate?: string;
                    discount?: number;
                    categories?: string[];
                }[];
            }, {
                enabled?: boolean;
                events?: {
                    name?: string;
                    startDate?: string;
                    endDate?: string;
                    discount?: number;
                    categories?: string[];
                }[];
            }>;
            vip: z.ZodObject<{
                enabled: z.ZodDefault<z.ZodBoolean>;
                tiers: z.ZodDefault<z.ZodArray<z.ZodObject<{
                    minLevel: z.ZodNumber;
                    discount: z.ZodNumber;
                }, "strip", z.ZodTypeAny, {
                    minLevel?: number;
                    discount?: number;
                }, {
                    minLevel?: number;
                    discount?: number;
                }>, "many">>;
            }, "strip", z.ZodTypeAny, {
                enabled?: boolean;
                tiers?: {
                    minLevel?: number;
                    discount?: number;
                }[];
            }, {
                enabled?: boolean;
                tiers?: {
                    minLevel?: number;
                    discount?: number;
                }[];
            }>;
        }, "strip", z.ZodTypeAny, {
            bulk?: {
                discount?: number;
                quantity?: number;
            }[];
            seasonal?: {
                enabled?: boolean;
                events?: {
                    name?: string;
                    startDate?: string;
                    endDate?: string;
                    discount?: number;
                    categories?: string[];
                }[];
            };
            vip?: {
                enabled?: boolean;
                tiers?: {
                    minLevel?: number;
                    discount?: number;
                }[];
            };
        }, {
            bulk?: {
                discount?: number;
                quantity?: number;
            }[];
            seasonal?: {
                enabled?: boolean;
                events?: {
                    name?: string;
                    startDate?: string;
                    endDate?: string;
                    discount?: number;
                    categories?: string[];
                }[];
            };
            vip?: {
                enabled?: boolean;
                tiers?: {
                    minLevel?: number;
                    discount?: number;
                }[];
            };
        }>;
    }, "strip", z.ZodTypeAny, {
        currency?: "DGT" | "USD" | "BOTH";
        exchangeRate?: number;
        dynamicPricing?: {
            enabled?: boolean;
            algorithm?: "supply_demand" | "rarity_based" | "time_decay";
            updateFrequency?: number;
            bounds?: {
                min?: number;
                max?: number;
            };
        };
        discounts?: {
            bulk?: {
                discount?: number;
                quantity?: number;
            }[];
            seasonal?: {
                enabled?: boolean;
                events?: {
                    name?: string;
                    startDate?: string;
                    endDate?: string;
                    discount?: number;
                    categories?: string[];
                }[];
            };
            vip?: {
                enabled?: boolean;
                tiers?: {
                    minLevel?: number;
                    discount?: number;
                }[];
            };
        };
    }, {
        currency?: "DGT" | "USD" | "BOTH";
        exchangeRate?: number;
        dynamicPricing?: {
            enabled?: boolean;
            algorithm?: "supply_demand" | "rarity_based" | "time_decay";
            updateFrequency?: number;
            bounds?: {
                min?: number;
                max?: number;
            };
        };
        discounts?: {
            bulk?: {
                discount?: number;
                quantity?: number;
            }[];
            seasonal?: {
                enabled?: boolean;
                events?: {
                    name?: string;
                    startDate?: string;
                    endDate?: string;
                    discount?: number;
                    categories?: string[];
                }[];
            };
            vip?: {
                enabled?: boolean;
                tiers?: {
                    minLevel?: number;
                    discount?: number;
                }[];
            };
        };
    }>;
    antiAbuse: z.ZodObject<{
        enabled: z.ZodDefault<z.ZodBoolean>;
        washTrading: z.ZodObject<{
            detection: z.ZodDefault<z.ZodBoolean>;
            minInterval: z.ZodDefault<z.ZodNumber>;
            maxVelocity: z.ZodDefault<z.ZodNumber>;
            penalty: z.ZodDefault<z.ZodEnum<["warning", "tempban", "permaban"]>>;
        }, "strip", z.ZodTypeAny, {
            detection?: boolean;
            minInterval?: number;
            maxVelocity?: number;
            penalty?: "warning" | "tempban" | "permaban";
        }, {
            detection?: boolean;
            minInterval?: number;
            maxVelocity?: number;
            penalty?: "warning" | "tempban" | "permaban";
        }>;
        multiAccount: z.ZodObject<{
            detection: z.ZodDefault<z.ZodBoolean>;
            ipTracking: z.ZodDefault<z.ZodBoolean>;
            deviceFingerprint: z.ZodDefault<z.ZodBoolean>;
            maxAccountsPerIP: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            detection?: boolean;
            ipTracking?: boolean;
            deviceFingerprint?: boolean;
            maxAccountsPerIP?: number;
        }, {
            detection?: boolean;
            ipTracking?: boolean;
            deviceFingerprint?: boolean;
            maxAccountsPerIP?: number;
        }>;
        rateLimits: z.ZodObject<{
            transactions: z.ZodObject<{
                perMinute: z.ZodDefault<z.ZodNumber>;
                perHour: z.ZodDefault<z.ZodNumber>;
                perDay: z.ZodDefault<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                perMinute?: number;
                perHour?: number;
                perDay?: number;
            }, {
                perMinute?: number;
                perHour?: number;
                perDay?: number;
            }>;
            tips: z.ZodObject<{
                perMinute: z.ZodDefault<z.ZodNumber>;
                perHour: z.ZodDefault<z.ZodNumber>;
                perDay: z.ZodDefault<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                perMinute?: number;
                perHour?: number;
                perDay?: number;
            }, {
                perMinute?: number;
                perHour?: number;
                perDay?: number;
            }>;
        }, "strip", z.ZodTypeAny, {
            transactions?: {
                perMinute?: number;
                perHour?: number;
                perDay?: number;
            };
            tips?: {
                perMinute?: number;
                perHour?: number;
                perDay?: number;
            };
        }, {
            transactions?: {
                perMinute?: number;
                perHour?: number;
                perDay?: number;
            };
            tips?: {
                perMinute?: number;
                perHour?: number;
                perDay?: number;
            };
        }>;
    }, "strip", z.ZodTypeAny, {
        enabled?: boolean;
        rateLimits?: {
            transactions?: {
                perMinute?: number;
                perHour?: number;
                perDay?: number;
            };
            tips?: {
                perMinute?: number;
                perHour?: number;
                perDay?: number;
            };
        };
        washTrading?: {
            detection?: boolean;
            minInterval?: number;
            maxVelocity?: number;
            penalty?: "warning" | "tempban" | "permaban";
        };
        multiAccount?: {
            detection?: boolean;
            ipTracking?: boolean;
            deviceFingerprint?: boolean;
            maxAccountsPerIP?: number;
        };
    }, {
        enabled?: boolean;
        rateLimits?: {
            transactions?: {
                perMinute?: number;
                perHour?: number;
                perDay?: number;
            };
            tips?: {
                perMinute?: number;
                perHour?: number;
                perDay?: number;
            };
        };
        washTrading?: {
            detection?: boolean;
            minInterval?: number;
            maxVelocity?: number;
            penalty?: "warning" | "tempban" | "permaban";
        };
        multiAccount?: {
            detection?: boolean;
            ipTracking?: boolean;
            deviceFingerprint?: boolean;
            maxAccountsPerIP?: number;
        };
    }>;
    emergency: z.ZodObject<{
        killSwitch: z.ZodDefault<z.ZodBoolean>;
        maintenanceMode: z.ZodDefault<z.ZodBoolean>;
        withdrawalsDisabled: z.ZodDefault<z.ZodBoolean>;
        tradingDisabled: z.ZodDefault<z.ZodBoolean>;
        message: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        message?: string;
        killSwitch?: boolean;
        maintenanceMode?: boolean;
        withdrawalsDisabled?: boolean;
        tradingDisabled?: boolean;
    }, {
        message?: string;
        killSwitch?: boolean;
        maintenanceMode?: boolean;
        withdrawalsDisabled?: boolean;
        tradingDisabled?: boolean;
    }>;
}, "strip", z.ZodTypeAny, {
    shop?: {
        currency?: "DGT" | "USD" | "BOTH";
        exchangeRate?: number;
        dynamicPricing?: {
            enabled?: boolean;
            algorithm?: "supply_demand" | "rarity_based" | "time_decay";
            updateFrequency?: number;
            bounds?: {
                min?: number;
                max?: number;
            };
        };
        discounts?: {
            bulk?: {
                discount?: number;
                quantity?: number;
            }[];
            seasonal?: {
                enabled?: boolean;
                events?: {
                    name?: string;
                    startDate?: string;
                    endDate?: string;
                    discount?: number;
                    categories?: string[];
                }[];
            };
            vip?: {
                enabled?: boolean;
                tiers?: {
                    minLevel?: number;
                    discount?: number;
                }[];
            };
        };
    };
    currency?: {
        symbol?: "DGT";
        name?: string;
        decimals?: number;
        displayDecimals?: number;
        minAmount?: number;
        maxAmount?: number;
        dustThreshold?: number;
    };
    version?: string;
    limits?: {
        withdrawal?: {
            daily?: number;
            weekly?: number;
            cooldown?: number;
            monthly?: number;
            perTransaction?: {
                min?: number;
                max?: number;
            };
            requireEmailVerification?: boolean;
            require2FA?: boolean;
            minAccountAge?: number;
        };
        spending?: {
            daily?: number;
            perTransaction?: number;
            tipping?: {
                daily?: number;
                perTip?: {
                    min?: number;
                    max?: number;
                };
            };
        };
        holding?: {
            maximum?: number;
            vipThreshold?: number;
            whaleThreshold?: number;
        };
    };
    distribution?: {
        faucet?: {
            lifetime?: {
                max?: number;
                resetMonthly?: boolean;
            };
            minLevel?: number;
            amount?: number;
            enabled?: boolean;
            cooldown?: number;
            requireCaptcha?: boolean;
        };
        referral?: {
            enabled?: boolean;
            referrer?: number;
            requirements?: {
                minLevel?: number;
                emailVerified?: boolean;
            };
            tiered?: {
                level?: number;
                bonus?: number;
            }[];
            referee?: number;
        };
        airdrops?: {
            enabled?: boolean;
            frequency?: "event" | "daily" | "weekly" | "monthly";
            distribution?: "equal" | "weighted" | "random";
            eligibility?: {
                minLevel?: number;
                minActivity?: number;
                excludeBanned?: boolean;
            };
        };
        rewards?: {
            achievements?: {
                enabled?: boolean;
                multiplier?: number;
                bonusPerTier?: number;
            };
            posting?: {
                enabled?: boolean;
                quality?: {
                    base?: number;
                    upvoteMultiplier?: number;
                    lengthBonus?: number;
                    mediaBonus?: number;
                };
            };
        };
    };
    fees?: {
        transaction?: {
            internal?: number;
            external?: number;
        };
        conversion?: {
            minimum?: number;
            rate?: number;
        };
        withdrawal?: {
            type?: "fixed" | "percentage" | "tiered";
            value?: number;
            min?: number;
            max?: number;
            tiers?: {
                threshold?: number;
                fee?: number;
            }[];
        };
        trading?: {
            maker?: number;
            taker?: number;
        };
    };
    staking?: {
        enabled?: boolean;
        minAmount?: number;
        maxAmount?: number;
        rewards?: {
            frequency?: "daily" | "weekly" | "monthly" | "block";
            bonus?: {
                amount?: {
                    threshold?: number;
                    bonus?: number;
                }[];
                loyalty?: number;
            };
            distribution?: "linear" | "compound";
        };
        lockPeriods?: {
            days?: number;
            apr?: number;
            compounding?: "daily" | "none" | "weekly" | "monthly";
            earlyWithdrawalPenalty?: number;
        }[];
    };
    antiAbuse?: {
        enabled?: boolean;
        rateLimits?: {
            transactions?: {
                perMinute?: number;
                perHour?: number;
                perDay?: number;
            };
            tips?: {
                perMinute?: number;
                perHour?: number;
                perDay?: number;
            };
        };
        washTrading?: {
            detection?: boolean;
            minInterval?: number;
            maxVelocity?: number;
            penalty?: "warning" | "tempban" | "permaban";
        };
        multiAccount?: {
            detection?: boolean;
            ipTracking?: boolean;
            deviceFingerprint?: boolean;
            maxAccountsPerIP?: number;
        };
    };
    emergency?: {
        message?: string;
        killSwitch?: boolean;
        maintenanceMode?: boolean;
        withdrawalsDisabled?: boolean;
        tradingDisabled?: boolean;
    };
}, {
    shop?: {
        currency?: "DGT" | "USD" | "BOTH";
        exchangeRate?: number;
        dynamicPricing?: {
            enabled?: boolean;
            algorithm?: "supply_demand" | "rarity_based" | "time_decay";
            updateFrequency?: number;
            bounds?: {
                min?: number;
                max?: number;
            };
        };
        discounts?: {
            bulk?: {
                discount?: number;
                quantity?: number;
            }[];
            seasonal?: {
                enabled?: boolean;
                events?: {
                    name?: string;
                    startDate?: string;
                    endDate?: string;
                    discount?: number;
                    categories?: string[];
                }[];
            };
            vip?: {
                enabled?: boolean;
                tiers?: {
                    minLevel?: number;
                    discount?: number;
                }[];
            };
        };
    };
    currency?: {
        symbol?: "DGT";
        name?: string;
        decimals?: number;
        displayDecimals?: number;
        minAmount?: number;
        maxAmount?: number;
        dustThreshold?: number;
    };
    version?: string;
    limits?: {
        withdrawal?: {
            daily?: number;
            weekly?: number;
            cooldown?: number;
            monthly?: number;
            perTransaction?: {
                min?: number;
                max?: number;
            };
            requireEmailVerification?: boolean;
            require2FA?: boolean;
            minAccountAge?: number;
        };
        spending?: {
            daily?: number;
            perTransaction?: number;
            tipping?: {
                daily?: number;
                perTip?: {
                    min?: number;
                    max?: number;
                };
            };
        };
        holding?: {
            maximum?: number;
            vipThreshold?: number;
            whaleThreshold?: number;
        };
    };
    distribution?: {
        faucet?: {
            lifetime?: {
                max?: number;
                resetMonthly?: boolean;
            };
            minLevel?: number;
            amount?: number;
            enabled?: boolean;
            cooldown?: number;
            requireCaptcha?: boolean;
        };
        referral?: {
            enabled?: boolean;
            referrer?: number;
            requirements?: {
                minLevel?: number;
                emailVerified?: boolean;
            };
            tiered?: {
                level?: number;
                bonus?: number;
            }[];
            referee?: number;
        };
        airdrops?: {
            enabled?: boolean;
            frequency?: "event" | "daily" | "weekly" | "monthly";
            distribution?: "equal" | "weighted" | "random";
            eligibility?: {
                minLevel?: number;
                minActivity?: number;
                excludeBanned?: boolean;
            };
        };
        rewards?: {
            achievements?: {
                enabled?: boolean;
                multiplier?: number;
                bonusPerTier?: number;
            };
            posting?: {
                enabled?: boolean;
                quality?: {
                    base?: number;
                    upvoteMultiplier?: number;
                    lengthBonus?: number;
                    mediaBonus?: number;
                };
            };
        };
    };
    fees?: {
        transaction?: {
            internal?: number;
            external?: number;
        };
        conversion?: {
            minimum?: number;
            rate?: number;
        };
        withdrawal?: {
            type?: "fixed" | "percentage" | "tiered";
            value?: number;
            min?: number;
            max?: number;
            tiers?: {
                threshold?: number;
                fee?: number;
            }[];
        };
        trading?: {
            maker?: number;
            taker?: number;
        };
    };
    staking?: {
        enabled?: boolean;
        minAmount?: number;
        maxAmount?: number;
        rewards?: {
            frequency?: "daily" | "weekly" | "monthly" | "block";
            bonus?: {
                amount?: {
                    threshold?: number;
                    bonus?: number;
                }[];
                loyalty?: number;
            };
            distribution?: "linear" | "compound";
        };
        lockPeriods?: {
            days?: number;
            apr?: number;
            compounding?: "daily" | "none" | "weekly" | "monthly";
            earlyWithdrawalPenalty?: number;
        }[];
    };
    antiAbuse?: {
        enabled?: boolean;
        rateLimits?: {
            transactions?: {
                perMinute?: number;
                perHour?: number;
                perDay?: number;
            };
            tips?: {
                perMinute?: number;
                perHour?: number;
                perDay?: number;
            };
        };
        washTrading?: {
            detection?: boolean;
            minInterval?: number;
            maxVelocity?: number;
            penalty?: "warning" | "tempban" | "permaban";
        };
        multiAccount?: {
            detection?: boolean;
            ipTracking?: boolean;
            deviceFingerprint?: boolean;
            maxAccountsPerIP?: number;
        };
    };
    emergency?: {
        message?: string;
        killSwitch?: boolean;
        maintenanceMode?: boolean;
        withdrawalsDisabled?: boolean;
        tradingDisabled?: boolean;
    };
}>;
export type EconomyConfig = z.infer<typeof EconomyConfigSchema>;
export type CurrencyConfig = z.infer<typeof CurrencyConfigSchema>;
export type FeeConfig = z.infer<typeof FeeConfigSchema>;
export type WalletLimits = z.infer<typeof WalletLimitsSchema>;
export type DistributionConfig = z.infer<typeof DistributionConfigSchema>;
export type StakingConfig = z.infer<typeof StakingConfigSchema>;
export type ShopPricing = z.infer<typeof ShopPricingSchema>;
export declare function validateEconomyConfig(config: unknown): EconomyConfig;
export declare function validatePartialEconomyConfig(config: unknown): Partial<EconomyConfig>;
export declare const defaultEconomyConfig: Partial<EconomyConfig>;
