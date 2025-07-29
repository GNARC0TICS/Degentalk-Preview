import { z } from 'zod';
/**
 * XP & Progression Configuration Schemas
 *
 * Runtime validation for XP system configuration.
 * All XP-related business logic should be configurable through these schemas.
 */
export declare const XpActionSchema: z.ZodObject<{
    base: z.ZodNumber;
    multiplierEligible: z.ZodDefault<z.ZodBoolean>;
    cooldown: z.ZodDefault<z.ZodNumber>;
    dailyCap: z.ZodOptional<z.ZodNumber>;
    requiredLevel: z.ZodDefault<z.ZodNumber>;
    requiredRole: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    requiredLevel?: number;
    requiredRole?: string;
    base?: number;
    multiplierEligible?: boolean;
    cooldown?: number;
    dailyCap?: number;
}, {
    requiredLevel?: number;
    requiredRole?: string;
    base?: number;
    multiplierEligible?: boolean;
    cooldown?: number;
    dailyCap?: number;
}>;
export declare const XpMultiplierSchema: z.ZodObject<{
    source: z.ZodString;
    value: z.ZodNumber;
    condition: z.ZodOptional<z.ZodObject<{
        type: z.ZodEnum<["role", "level", "streak", "time", "event"]>;
        value: z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodObject<{
            start: z.ZodString;
            end: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            end?: string;
            start?: string;
        }, {
            end?: string;
            start?: string;
        }>]>;
    }, "strip", z.ZodTypeAny, {
        type?: "time" | "level" | "role" | "event" | "streak";
        value?: string | number | {
            end?: string;
            start?: string;
        };
    }, {
        type?: "time" | "level" | "role" | "event" | "streak";
        value?: string | number | {
            end?: string;
            start?: string;
        };
    }>>;
    stackable: z.ZodDefault<z.ZodBoolean>;
    maxStack: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    source?: string;
    value?: number;
    condition?: {
        type?: "time" | "level" | "role" | "event" | "streak";
        value?: string | number | {
            end?: string;
            start?: string;
        };
    };
    stackable?: boolean;
    maxStack?: number;
}, {
    source?: string;
    value?: number;
    condition?: {
        type?: "time" | "level" | "role" | "event" | "streak";
        value?: string | number | {
            end?: string;
            start?: string;
        };
    };
    stackable?: boolean;
    maxStack?: number;
}>;
export declare const LevelFormulaSchema: z.ZodDiscriminatedUnion<"type", [z.ZodObject<{
    type: z.ZodLiteral<"linear">;
    base: z.ZodNumber;
    increment: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    type?: "linear";
    base?: number;
    increment?: number;
}, {
    type?: "linear";
    base?: number;
    increment?: number;
}>, z.ZodObject<{
    type: z.ZodLiteral<"polynomial">;
    coefficient: z.ZodNumber;
    exponent: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    type?: "polynomial";
    offset?: number;
    coefficient?: number;
    exponent?: number;
}, {
    type?: "polynomial";
    offset?: number;
    coefficient?: number;
    exponent?: number;
}>, z.ZodObject<{
    type: z.ZodLiteral<"exponential">;
    base: z.ZodNumber;
    multiplier: z.ZodNumber;
    offset: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    type?: "exponential";
    offset?: number;
    base?: number;
    multiplier?: number;
}, {
    type?: "exponential";
    offset?: number;
    base?: number;
    multiplier?: number;
}>, z.ZodObject<{
    type: z.ZodLiteral<"custom">;
    thresholds: z.ZodArray<z.ZodNumber, "many">;
}, "strip", z.ZodTypeAny, {
    type?: "custom";
    thresholds?: number[];
}, {
    type?: "custom";
    thresholds?: number[];
}>]>;
export declare const LevelMilestoneSchema: z.ZodObject<{
    level: z.ZodNumber;
    rewards: z.ZodObject<{
        dgt: z.ZodOptional<z.ZodNumber>;
        xp: z.ZodOptional<z.ZodNumber>;
        items: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        unlocks: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        title: z.ZodOptional<z.ZodString>;
        badge: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        badge?: string;
        title?: string;
        items?: string[];
        xp?: number;
        unlocks?: string[];
        dgt?: number;
    }, {
        badge?: string;
        title?: string;
        items?: string[];
        xp?: number;
        unlocks?: string[];
        dgt?: number;
    }>;
    announcement: z.ZodOptional<z.ZodObject<{
        enabled: z.ZodDefault<z.ZodBoolean>;
        message: z.ZodOptional<z.ZodString>;
        type: z.ZodDefault<z.ZodEnum<["info", "success", "celebration"]>>;
    }, "strip", z.ZodTypeAny, {
        message?: string;
        type?: "info" | "success" | "celebration";
        enabled?: boolean;
    }, {
        message?: string;
        type?: "info" | "success" | "celebration";
        enabled?: boolean;
    }>>;
}, "strip", z.ZodTypeAny, {
    level?: number;
    rewards?: {
        badge?: string;
        title?: string;
        items?: string[];
        xp?: number;
        unlocks?: string[];
        dgt?: number;
    };
    announcement?: {
        message?: string;
        type?: "info" | "success" | "celebration";
        enabled?: boolean;
    };
}, {
    level?: number;
    rewards?: {
        badge?: string;
        title?: string;
        items?: string[];
        xp?: number;
        unlocks?: string[];
        dgt?: number;
    };
    announcement?: {
        message?: string;
        type?: "info" | "success" | "celebration";
        enabled?: boolean;
    };
}>;
export declare const XpConfigSchema: z.ZodObject<{
    version: z.ZodDefault<z.ZodString>;
    actions: z.ZodObject<{
        post: z.ZodObject<{
            base: z.ZodNumber;
            multiplierEligible: z.ZodDefault<z.ZodBoolean>;
            cooldown: z.ZodDefault<z.ZodNumber>;
            dailyCap: z.ZodOptional<z.ZodNumber>;
            requiredLevel: z.ZodDefault<z.ZodNumber>;
            requiredRole: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            requiredLevel?: number;
            requiredRole?: string;
            base?: number;
            multiplierEligible?: boolean;
            cooldown?: number;
            dailyCap?: number;
        }, {
            requiredLevel?: number;
            requiredRole?: string;
            base?: number;
            multiplierEligible?: boolean;
            cooldown?: number;
            dailyCap?: number;
        }>;
        thread: z.ZodObject<{
            base: z.ZodNumber;
            multiplierEligible: z.ZodDefault<z.ZodBoolean>;
            cooldown: z.ZodDefault<z.ZodNumber>;
            dailyCap: z.ZodOptional<z.ZodNumber>;
            requiredLevel: z.ZodDefault<z.ZodNumber>;
            requiredRole: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            requiredLevel?: number;
            requiredRole?: string;
            base?: number;
            multiplierEligible?: boolean;
            cooldown?: number;
            dailyCap?: number;
        }, {
            requiredLevel?: number;
            requiredRole?: string;
            base?: number;
            multiplierEligible?: boolean;
            cooldown?: number;
            dailyCap?: number;
        }>;
        reply: z.ZodObject<{
            base: z.ZodNumber;
            multiplierEligible: z.ZodDefault<z.ZodBoolean>;
            cooldown: z.ZodDefault<z.ZodNumber>;
            dailyCap: z.ZodOptional<z.ZodNumber>;
            requiredLevel: z.ZodDefault<z.ZodNumber>;
            requiredRole: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            requiredLevel?: number;
            requiredRole?: string;
            base?: number;
            multiplierEligible?: boolean;
            cooldown?: number;
            dailyCap?: number;
        }, {
            requiredLevel?: number;
            requiredRole?: string;
            base?: number;
            multiplierEligible?: boolean;
            cooldown?: number;
            dailyCap?: number;
        }>;
        upvote: z.ZodObject<{
            base: z.ZodNumber;
            multiplierEligible: z.ZodDefault<z.ZodBoolean>;
            cooldown: z.ZodDefault<z.ZodNumber>;
            dailyCap: z.ZodOptional<z.ZodNumber>;
            requiredLevel: z.ZodDefault<z.ZodNumber>;
            requiredRole: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            requiredLevel?: number;
            requiredRole?: string;
            base?: number;
            multiplierEligible?: boolean;
            cooldown?: number;
            dailyCap?: number;
        }, {
            requiredLevel?: number;
            requiredRole?: string;
            base?: number;
            multiplierEligible?: boolean;
            cooldown?: number;
            dailyCap?: number;
        }>;
        tip_sent: z.ZodObject<{
            base: z.ZodNumber;
            multiplierEligible: z.ZodDefault<z.ZodBoolean>;
            cooldown: z.ZodDefault<z.ZodNumber>;
            dailyCap: z.ZodOptional<z.ZodNumber>;
            requiredLevel: z.ZodDefault<z.ZodNumber>;
            requiredRole: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            requiredLevel?: number;
            requiredRole?: string;
            base?: number;
            multiplierEligible?: boolean;
            cooldown?: number;
            dailyCap?: number;
        }, {
            requiredLevel?: number;
            requiredRole?: string;
            base?: number;
            multiplierEligible?: boolean;
            cooldown?: number;
            dailyCap?: number;
        }>;
        tip_received: z.ZodObject<{
            base: z.ZodNumber;
            multiplierEligible: z.ZodDefault<z.ZodBoolean>;
            cooldown: z.ZodDefault<z.ZodNumber>;
            dailyCap: z.ZodOptional<z.ZodNumber>;
            requiredLevel: z.ZodDefault<z.ZodNumber>;
            requiredRole: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            requiredLevel?: number;
            requiredRole?: string;
            base?: number;
            multiplierEligible?: boolean;
            cooldown?: number;
            dailyCap?: number;
        }, {
            requiredLevel?: number;
            requiredRole?: string;
            base?: number;
            multiplierEligible?: boolean;
            cooldown?: number;
            dailyCap?: number;
        }>;
        daily_login: z.ZodObject<{
            base: z.ZodNumber;
            multiplierEligible: z.ZodDefault<z.ZodBoolean>;
            cooldown: z.ZodDefault<z.ZodNumber>;
            dailyCap: z.ZodOptional<z.ZodNumber>;
            requiredLevel: z.ZodDefault<z.ZodNumber>;
            requiredRole: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            requiredLevel?: number;
            requiredRole?: string;
            base?: number;
            multiplierEligible?: boolean;
            cooldown?: number;
            dailyCap?: number;
        }, {
            requiredLevel?: number;
            requiredRole?: string;
            base?: number;
            multiplierEligible?: boolean;
            cooldown?: number;
            dailyCap?: number;
        }>;
        achievement: z.ZodObject<{
            base: z.ZodNumber;
            multiplierEligible: z.ZodDefault<z.ZodBoolean>;
            cooldown: z.ZodDefault<z.ZodNumber>;
            dailyCap: z.ZodOptional<z.ZodNumber>;
            requiredLevel: z.ZodDefault<z.ZodNumber>;
            requiredRole: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            requiredLevel?: number;
            requiredRole?: string;
            base?: number;
            multiplierEligible?: boolean;
            cooldown?: number;
            dailyCap?: number;
        }, {
            requiredLevel?: number;
            requiredRole?: string;
            base?: number;
            multiplierEligible?: boolean;
            cooldown?: number;
            dailyCap?: number;
        }>;
        referral: z.ZodObject<{
            base: z.ZodNumber;
            multiplierEligible: z.ZodDefault<z.ZodBoolean>;
            cooldown: z.ZodDefault<z.ZodNumber>;
            dailyCap: z.ZodOptional<z.ZodNumber>;
            requiredLevel: z.ZodDefault<z.ZodNumber>;
            requiredRole: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            requiredLevel?: number;
            requiredRole?: string;
            base?: number;
            multiplierEligible?: boolean;
            cooldown?: number;
            dailyCap?: number;
        }, {
            requiredLevel?: number;
            requiredRole?: string;
            base?: number;
            multiplierEligible?: boolean;
            cooldown?: number;
            dailyCap?: number;
        }>;
    }, "strip", z.ZodTypeAny, {
        achievement?: {
            requiredLevel?: number;
            requiredRole?: string;
            base?: number;
            multiplierEligible?: boolean;
            cooldown?: number;
            dailyCap?: number;
        };
        tip_received?: {
            requiredLevel?: number;
            requiredRole?: string;
            base?: number;
            multiplierEligible?: boolean;
            cooldown?: number;
            dailyCap?: number;
        };
        post?: {
            requiredLevel?: number;
            requiredRole?: string;
            base?: number;
            multiplierEligible?: boolean;
            cooldown?: number;
            dailyCap?: number;
        };
        thread?: {
            requiredLevel?: number;
            requiredRole?: string;
            base?: number;
            multiplierEligible?: boolean;
            cooldown?: number;
            dailyCap?: number;
        };
        tip_sent?: {
            requiredLevel?: number;
            requiredRole?: string;
            base?: number;
            multiplierEligible?: boolean;
            cooldown?: number;
            dailyCap?: number;
        };
        reply?: {
            requiredLevel?: number;
            requiredRole?: string;
            base?: number;
            multiplierEligible?: boolean;
            cooldown?: number;
            dailyCap?: number;
        };
        upvote?: {
            requiredLevel?: number;
            requiredRole?: string;
            base?: number;
            multiplierEligible?: boolean;
            cooldown?: number;
            dailyCap?: number;
        };
        daily_login?: {
            requiredLevel?: number;
            requiredRole?: string;
            base?: number;
            multiplierEligible?: boolean;
            cooldown?: number;
            dailyCap?: number;
        };
        referral?: {
            requiredLevel?: number;
            requiredRole?: string;
            base?: number;
            multiplierEligible?: boolean;
            cooldown?: number;
            dailyCap?: number;
        };
    }, {
        achievement?: {
            requiredLevel?: number;
            requiredRole?: string;
            base?: number;
            multiplierEligible?: boolean;
            cooldown?: number;
            dailyCap?: number;
        };
        tip_received?: {
            requiredLevel?: number;
            requiredRole?: string;
            base?: number;
            multiplierEligible?: boolean;
            cooldown?: number;
            dailyCap?: number;
        };
        post?: {
            requiredLevel?: number;
            requiredRole?: string;
            base?: number;
            multiplierEligible?: boolean;
            cooldown?: number;
            dailyCap?: number;
        };
        thread?: {
            requiredLevel?: number;
            requiredRole?: string;
            base?: number;
            multiplierEligible?: boolean;
            cooldown?: number;
            dailyCap?: number;
        };
        tip_sent?: {
            requiredLevel?: number;
            requiredRole?: string;
            base?: number;
            multiplierEligible?: boolean;
            cooldown?: number;
            dailyCap?: number;
        };
        reply?: {
            requiredLevel?: number;
            requiredRole?: string;
            base?: number;
            multiplierEligible?: boolean;
            cooldown?: number;
            dailyCap?: number;
        };
        upvote?: {
            requiredLevel?: number;
            requiredRole?: string;
            base?: number;
            multiplierEligible?: boolean;
            cooldown?: number;
            dailyCap?: number;
        };
        daily_login?: {
            requiredLevel?: number;
            requiredRole?: string;
            base?: number;
            multiplierEligible?: boolean;
            cooldown?: number;
            dailyCap?: number;
        };
        referral?: {
            requiredLevel?: number;
            requiredRole?: string;
            base?: number;
            multiplierEligible?: boolean;
            cooldown?: number;
            dailyCap?: number;
        };
    }>;
    multipliers: z.ZodObject<{
        enabled: z.ZodDefault<z.ZodBoolean>;
        stacking: z.ZodDefault<z.ZodEnum<["additive", "multiplicative"]>>;
        sources: z.ZodArray<z.ZodObject<{
            source: z.ZodString;
            value: z.ZodNumber;
            condition: z.ZodOptional<z.ZodObject<{
                type: z.ZodEnum<["role", "level", "streak", "time", "event"]>;
                value: z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodObject<{
                    start: z.ZodString;
                    end: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    end?: string;
                    start?: string;
                }, {
                    end?: string;
                    start?: string;
                }>]>;
            }, "strip", z.ZodTypeAny, {
                type?: "time" | "level" | "role" | "event" | "streak";
                value?: string | number | {
                    end?: string;
                    start?: string;
                };
            }, {
                type?: "time" | "level" | "role" | "event" | "streak";
                value?: string | number | {
                    end?: string;
                    start?: string;
                };
            }>>;
            stackable: z.ZodDefault<z.ZodBoolean>;
            maxStack: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            source?: string;
            value?: number;
            condition?: {
                type?: "time" | "level" | "role" | "event" | "streak";
                value?: string | number | {
                    end?: string;
                    start?: string;
                };
            };
            stackable?: boolean;
            maxStack?: number;
        }, {
            source?: string;
            value?: number;
            condition?: {
                type?: "time" | "level" | "role" | "event" | "streak";
                value?: string | number | {
                    end?: string;
                    start?: string;
                };
            };
            stackable?: boolean;
            maxStack?: number;
        }>, "many">;
        globalCap: z.ZodDefault<z.ZodNumber>;
        calculation: z.ZodDefault<z.ZodEnum<["highest", "sum", "product"]>>;
    }, "strip", z.ZodTypeAny, {
        enabled?: boolean;
        stacking?: "additive" | "multiplicative";
        sources?: {
            source?: string;
            value?: number;
            condition?: {
                type?: "time" | "level" | "role" | "event" | "streak";
                value?: string | number | {
                    end?: string;
                    start?: string;
                };
            };
            stackable?: boolean;
            maxStack?: number;
        }[];
        globalCap?: number;
        calculation?: "product" | "highest" | "sum";
    }, {
        enabled?: boolean;
        stacking?: "additive" | "multiplicative";
        sources?: {
            source?: string;
            value?: number;
            condition?: {
                type?: "time" | "level" | "role" | "event" | "streak";
                value?: string | number | {
                    end?: string;
                    start?: string;
                };
            };
            stackable?: boolean;
            maxStack?: number;
        }[];
        globalCap?: number;
        calculation?: "product" | "highest" | "sum";
    }>;
    levels: z.ZodObject<{
        maxLevel: z.ZodDefault<z.ZodNumber>;
        formula: z.ZodDiscriminatedUnion<"type", [z.ZodObject<{
            type: z.ZodLiteral<"linear">;
            base: z.ZodNumber;
            increment: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            type?: "linear";
            base?: number;
            increment?: number;
        }, {
            type?: "linear";
            base?: number;
            increment?: number;
        }>, z.ZodObject<{
            type: z.ZodLiteral<"polynomial">;
            coefficient: z.ZodNumber;
            exponent: z.ZodDefault<z.ZodNumber>;
            offset: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            type?: "polynomial";
            offset?: number;
            coefficient?: number;
            exponent?: number;
        }, {
            type?: "polynomial";
            offset?: number;
            coefficient?: number;
            exponent?: number;
        }>, z.ZodObject<{
            type: z.ZodLiteral<"exponential">;
            base: z.ZodNumber;
            multiplier: z.ZodNumber;
            offset: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            type?: "exponential";
            offset?: number;
            base?: number;
            multiplier?: number;
        }, {
            type?: "exponential";
            offset?: number;
            base?: number;
            multiplier?: number;
        }>, z.ZodObject<{
            type: z.ZodLiteral<"custom">;
            thresholds: z.ZodArray<z.ZodNumber, "many">;
        }, "strip", z.ZodTypeAny, {
            type?: "custom";
            thresholds?: number[];
        }, {
            type?: "custom";
            thresholds?: number[];
        }>]>;
        milestones: z.ZodArray<z.ZodObject<{
            level: z.ZodNumber;
            rewards: z.ZodObject<{
                dgt: z.ZodOptional<z.ZodNumber>;
                xp: z.ZodOptional<z.ZodNumber>;
                items: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                unlocks: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                title: z.ZodOptional<z.ZodString>;
                badge: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                badge?: string;
                title?: string;
                items?: string[];
                xp?: number;
                unlocks?: string[];
                dgt?: number;
            }, {
                badge?: string;
                title?: string;
                items?: string[];
                xp?: number;
                unlocks?: string[];
                dgt?: number;
            }>;
            announcement: z.ZodOptional<z.ZodObject<{
                enabled: z.ZodDefault<z.ZodBoolean>;
                message: z.ZodOptional<z.ZodString>;
                type: z.ZodDefault<z.ZodEnum<["info", "success", "celebration"]>>;
            }, "strip", z.ZodTypeAny, {
                message?: string;
                type?: "info" | "success" | "celebration";
                enabled?: boolean;
            }, {
                message?: string;
                type?: "info" | "success" | "celebration";
                enabled?: boolean;
            }>>;
        }, "strip", z.ZodTypeAny, {
            level?: number;
            rewards?: {
                badge?: string;
                title?: string;
                items?: string[];
                xp?: number;
                unlocks?: string[];
                dgt?: number;
            };
            announcement?: {
                message?: string;
                type?: "info" | "success" | "celebration";
                enabled?: boolean;
            };
        }, {
            level?: number;
            rewards?: {
                badge?: string;
                title?: string;
                items?: string[];
                xp?: number;
                unlocks?: string[];
                dgt?: number;
            };
            announcement?: {
                message?: string;
                type?: "info" | "success" | "celebration";
                enabled?: boolean;
            };
        }>, "many">;
        prestigeEnabled: z.ZodDefault<z.ZodBoolean>;
        prestigeMultiplier: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    }, "strip", z.ZodTypeAny, {
        maxLevel?: number;
        formula?: {
            type?: "linear";
            base?: number;
            increment?: number;
        } | {
            type?: "polynomial";
            offset?: number;
            coefficient?: number;
            exponent?: number;
        } | {
            type?: "exponential";
            offset?: number;
            base?: number;
            multiplier?: number;
        } | {
            type?: "custom";
            thresholds?: number[];
        };
        milestones?: {
            level?: number;
            rewards?: {
                badge?: string;
                title?: string;
                items?: string[];
                xp?: number;
                unlocks?: string[];
                dgt?: number;
            };
            announcement?: {
                message?: string;
                type?: "info" | "success" | "celebration";
                enabled?: boolean;
            };
        }[];
        prestigeEnabled?: boolean;
        prestigeMultiplier?: number;
    }, {
        maxLevel?: number;
        formula?: {
            type?: "linear";
            base?: number;
            increment?: number;
        } | {
            type?: "polynomial";
            offset?: number;
            coefficient?: number;
            exponent?: number;
        } | {
            type?: "exponential";
            offset?: number;
            base?: number;
            multiplier?: number;
        } | {
            type?: "custom";
            thresholds?: number[];
        };
        milestones?: {
            level?: number;
            rewards?: {
                badge?: string;
                title?: string;
                items?: string[];
                xp?: number;
                unlocks?: string[];
                dgt?: number;
            };
            announcement?: {
                message?: string;
                type?: "info" | "success" | "celebration";
                enabled?: boolean;
            };
        }[];
        prestigeEnabled?: boolean;
        prestigeMultiplier?: number;
    }>;
    daily: z.ZodObject<{
        enabled: z.ZodDefault<z.ZodBoolean>;
        earnedCap: z.ZodDefault<z.ZodNumber>;
        bonusCap: z.ZodDefault<z.ZodNumber>;
        resetHour: z.ZodDefault<z.ZodNumber>;
        timezone: z.ZodDefault<z.ZodString>;
        streakBonus: z.ZodOptional<z.ZodObject<{
            enabled: z.ZodDefault<z.ZodBoolean>;
            multiplier: z.ZodDefault<z.ZodNumber>;
            maxStreak: z.ZodDefault<z.ZodNumber>;
            resetOnMiss: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            enabled?: boolean;
            multiplier?: number;
            maxStreak?: number;
            resetOnMiss?: boolean;
        }, {
            enabled?: boolean;
            multiplier?: number;
            maxStreak?: number;
            resetOnMiss?: boolean;
        }>>;
    }, "strip", z.ZodTypeAny, {
        timezone?: string;
        enabled?: boolean;
        earnedCap?: number;
        bonusCap?: number;
        resetHour?: number;
        streakBonus?: {
            enabled?: boolean;
            multiplier?: number;
            maxStreak?: number;
            resetOnMiss?: boolean;
        };
    }, {
        timezone?: string;
        enabled?: boolean;
        earnedCap?: number;
        bonusCap?: number;
        resetHour?: number;
        streakBonus?: {
            enabled?: boolean;
            multiplier?: number;
            maxStreak?: number;
            resetOnMiss?: boolean;
        };
    }>;
    decay: z.ZodOptional<z.ZodObject<{
        enabled: z.ZodDefault<z.ZodBoolean>;
        inactivityDays: z.ZodDefault<z.ZodNumber>;
        rate: z.ZodDefault<z.ZodNumber>;
        minLevel: z.ZodDefault<z.ZodNumber>;
        protected: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        minLevel?: number;
        enabled?: boolean;
        inactivityDays?: number;
        rate?: number;
        protected?: string[];
    }, {
        minLevel?: number;
        enabled?: boolean;
        inactivityDays?: number;
        rate?: number;
        protected?: string[];
    }>>;
    boosts: z.ZodOptional<z.ZodObject<{
        weekend: z.ZodObject<{
            enabled: z.ZodDefault<z.ZodBoolean>;
            multiplier: z.ZodDefault<z.ZodNumber>;
            days: z.ZodDefault<z.ZodArray<z.ZodNumber, "many">>;
        }, "strip", z.ZodTypeAny, {
            enabled?: boolean;
            multiplier?: number;
            days?: number[];
        }, {
            enabled?: boolean;
            multiplier?: number;
            days?: number[];
        }>;
        happyHour: z.ZodObject<{
            enabled: z.ZodDefault<z.ZodBoolean>;
            multiplier: z.ZodDefault<z.ZodNumber>;
            hours: z.ZodDefault<z.ZodArray<z.ZodObject<{
                start: z.ZodNumber;
                end: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                end?: number;
                start?: number;
            }, {
                end?: number;
                start?: number;
            }>, "many">>;
        }, "strip", z.ZodTypeAny, {
            enabled?: boolean;
            multiplier?: number;
            hours?: {
                end?: number;
                start?: number;
            }[];
        }, {
            enabled?: boolean;
            multiplier?: number;
            hours?: {
                end?: number;
                start?: number;
            }[];
        }>;
        events: z.ZodDefault<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            multiplier: z.ZodNumber;
            startDate: z.ZodString;
            endDate: z.ZodString;
            announcement: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            name?: string;
            startDate?: string;
            endDate?: string;
            multiplier?: number;
            announcement?: string;
        }, {
            name?: string;
            startDate?: string;
            endDate?: string;
            multiplier?: number;
            announcement?: string;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        events?: {
            name?: string;
            startDate?: string;
            endDate?: string;
            multiplier?: number;
            announcement?: string;
        }[];
        weekend?: {
            enabled?: boolean;
            multiplier?: number;
            days?: number[];
        };
        happyHour?: {
            enabled?: boolean;
            multiplier?: number;
            hours?: {
                end?: number;
                start?: number;
            }[];
        };
    }, {
        events?: {
            name?: string;
            startDate?: string;
            endDate?: string;
            multiplier?: number;
            announcement?: string;
        }[];
        weekend?: {
            enabled?: boolean;
            multiplier?: number;
            days?: number[];
        };
        happyHour?: {
            enabled?: boolean;
            multiplier?: number;
            hours?: {
                end?: number;
                start?: number;
            }[];
        };
    }>>;
}, "strip", z.ZodTypeAny, {
    actions?: {
        achievement?: {
            requiredLevel?: number;
            requiredRole?: string;
            base?: number;
            multiplierEligible?: boolean;
            cooldown?: number;
            dailyCap?: number;
        };
        tip_received?: {
            requiredLevel?: number;
            requiredRole?: string;
            base?: number;
            multiplierEligible?: boolean;
            cooldown?: number;
            dailyCap?: number;
        };
        post?: {
            requiredLevel?: number;
            requiredRole?: string;
            base?: number;
            multiplierEligible?: boolean;
            cooldown?: number;
            dailyCap?: number;
        };
        thread?: {
            requiredLevel?: number;
            requiredRole?: string;
            base?: number;
            multiplierEligible?: boolean;
            cooldown?: number;
            dailyCap?: number;
        };
        tip_sent?: {
            requiredLevel?: number;
            requiredRole?: string;
            base?: number;
            multiplierEligible?: boolean;
            cooldown?: number;
            dailyCap?: number;
        };
        reply?: {
            requiredLevel?: number;
            requiredRole?: string;
            base?: number;
            multiplierEligible?: boolean;
            cooldown?: number;
            dailyCap?: number;
        };
        upvote?: {
            requiredLevel?: number;
            requiredRole?: string;
            base?: number;
            multiplierEligible?: boolean;
            cooldown?: number;
            dailyCap?: number;
        };
        daily_login?: {
            requiredLevel?: number;
            requiredRole?: string;
            base?: number;
            multiplierEligible?: boolean;
            cooldown?: number;
            dailyCap?: number;
        };
        referral?: {
            requiredLevel?: number;
            requiredRole?: string;
            base?: number;
            multiplierEligible?: boolean;
            cooldown?: number;
            dailyCap?: number;
        };
    };
    version?: string;
    levels?: {
        maxLevel?: number;
        formula?: {
            type?: "linear";
            base?: number;
            increment?: number;
        } | {
            type?: "polynomial";
            offset?: number;
            coefficient?: number;
            exponent?: number;
        } | {
            type?: "exponential";
            offset?: number;
            base?: number;
            multiplier?: number;
        } | {
            type?: "custom";
            thresholds?: number[];
        };
        milestones?: {
            level?: number;
            rewards?: {
                badge?: string;
                title?: string;
                items?: string[];
                xp?: number;
                unlocks?: string[];
                dgt?: number;
            };
            announcement?: {
                message?: string;
                type?: "info" | "success" | "celebration";
                enabled?: boolean;
            };
        }[];
        prestigeEnabled?: boolean;
        prestigeMultiplier?: number;
    };
    daily?: {
        timezone?: string;
        enabled?: boolean;
        earnedCap?: number;
        bonusCap?: number;
        resetHour?: number;
        streakBonus?: {
            enabled?: boolean;
            multiplier?: number;
            maxStreak?: number;
            resetOnMiss?: boolean;
        };
    };
    multipliers?: {
        enabled?: boolean;
        stacking?: "additive" | "multiplicative";
        sources?: {
            source?: string;
            value?: number;
            condition?: {
                type?: "time" | "level" | "role" | "event" | "streak";
                value?: string | number | {
                    end?: string;
                    start?: string;
                };
            };
            stackable?: boolean;
            maxStack?: number;
        }[];
        globalCap?: number;
        calculation?: "product" | "highest" | "sum";
    };
    decay?: {
        minLevel?: number;
        enabled?: boolean;
        inactivityDays?: number;
        rate?: number;
        protected?: string[];
    };
    boosts?: {
        events?: {
            name?: string;
            startDate?: string;
            endDate?: string;
            multiplier?: number;
            announcement?: string;
        }[];
        weekend?: {
            enabled?: boolean;
            multiplier?: number;
            days?: number[];
        };
        happyHour?: {
            enabled?: boolean;
            multiplier?: number;
            hours?: {
                end?: number;
                start?: number;
            }[];
        };
    };
}, {
    actions?: {
        achievement?: {
            requiredLevel?: number;
            requiredRole?: string;
            base?: number;
            multiplierEligible?: boolean;
            cooldown?: number;
            dailyCap?: number;
        };
        tip_received?: {
            requiredLevel?: number;
            requiredRole?: string;
            base?: number;
            multiplierEligible?: boolean;
            cooldown?: number;
            dailyCap?: number;
        };
        post?: {
            requiredLevel?: number;
            requiredRole?: string;
            base?: number;
            multiplierEligible?: boolean;
            cooldown?: number;
            dailyCap?: number;
        };
        thread?: {
            requiredLevel?: number;
            requiredRole?: string;
            base?: number;
            multiplierEligible?: boolean;
            cooldown?: number;
            dailyCap?: number;
        };
        tip_sent?: {
            requiredLevel?: number;
            requiredRole?: string;
            base?: number;
            multiplierEligible?: boolean;
            cooldown?: number;
            dailyCap?: number;
        };
        reply?: {
            requiredLevel?: number;
            requiredRole?: string;
            base?: number;
            multiplierEligible?: boolean;
            cooldown?: number;
            dailyCap?: number;
        };
        upvote?: {
            requiredLevel?: number;
            requiredRole?: string;
            base?: number;
            multiplierEligible?: boolean;
            cooldown?: number;
            dailyCap?: number;
        };
        daily_login?: {
            requiredLevel?: number;
            requiredRole?: string;
            base?: number;
            multiplierEligible?: boolean;
            cooldown?: number;
            dailyCap?: number;
        };
        referral?: {
            requiredLevel?: number;
            requiredRole?: string;
            base?: number;
            multiplierEligible?: boolean;
            cooldown?: number;
            dailyCap?: number;
        };
    };
    version?: string;
    levels?: {
        maxLevel?: number;
        formula?: {
            type?: "linear";
            base?: number;
            increment?: number;
        } | {
            type?: "polynomial";
            offset?: number;
            coefficient?: number;
            exponent?: number;
        } | {
            type?: "exponential";
            offset?: number;
            base?: number;
            multiplier?: number;
        } | {
            type?: "custom";
            thresholds?: number[];
        };
        milestones?: {
            level?: number;
            rewards?: {
                badge?: string;
                title?: string;
                items?: string[];
                xp?: number;
                unlocks?: string[];
                dgt?: number;
            };
            announcement?: {
                message?: string;
                type?: "info" | "success" | "celebration";
                enabled?: boolean;
            };
        }[];
        prestigeEnabled?: boolean;
        prestigeMultiplier?: number;
    };
    daily?: {
        timezone?: string;
        enabled?: boolean;
        earnedCap?: number;
        bonusCap?: number;
        resetHour?: number;
        streakBonus?: {
            enabled?: boolean;
            multiplier?: number;
            maxStreak?: number;
            resetOnMiss?: boolean;
        };
    };
    multipliers?: {
        enabled?: boolean;
        stacking?: "additive" | "multiplicative";
        sources?: {
            source?: string;
            value?: number;
            condition?: {
                type?: "time" | "level" | "role" | "event" | "streak";
                value?: string | number | {
                    end?: string;
                    start?: string;
                };
            };
            stackable?: boolean;
            maxStack?: number;
        }[];
        globalCap?: number;
        calculation?: "product" | "highest" | "sum";
    };
    decay?: {
        minLevel?: number;
        enabled?: boolean;
        inactivityDays?: number;
        rate?: number;
        protected?: string[];
    };
    boosts?: {
        events?: {
            name?: string;
            startDate?: string;
            endDate?: string;
            multiplier?: number;
            announcement?: string;
        }[];
        weekend?: {
            enabled?: boolean;
            multiplier?: number;
            days?: number[];
        };
        happyHour?: {
            enabled?: boolean;
            multiplier?: number;
            hours?: {
                end?: number;
                start?: number;
            }[];
        };
    };
}>;
export type XpConfig = z.infer<typeof XpConfigSchema>;
export type XpAction = z.infer<typeof XpActionSchema>;
export type XpMultiplier = z.infer<typeof XpMultiplierSchema>;
export type LevelFormula = z.infer<typeof LevelFormulaSchema>;
export type LevelMilestone = z.infer<typeof LevelMilestoneSchema>;
export declare function validateXpConfig(config: unknown): XpConfig;
export declare function validatePartialXpConfig(config: unknown): Partial<XpConfig>;
export declare const defaultXpConfig: XpConfig;
