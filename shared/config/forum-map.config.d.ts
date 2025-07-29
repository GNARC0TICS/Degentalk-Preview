import { z } from 'zod';
export declare const FORUM_TYPES: readonly ["featured", "regular"];
export type ForumType = (typeof FORUM_TYPES)[number];
declare const PrefixGrantRuleSchema: z.ZodObject<{
    slug: z.ZodString;
    autoAssign: z.ZodBoolean;
    condition: z.ZodOptional<z.ZodObject<{
        minReplies: z.ZodOptional<z.ZodNumber>;
        minLikes: z.ZodOptional<z.ZodNumber>;
        minXp: z.ZodOptional<z.ZodNumber>;
        role: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        role?: string;
        minXp?: number;
        minReplies?: number;
        minLikes?: number;
    }, {
        role?: string;
        minXp?: number;
        minReplies?: number;
        minLikes?: number;
    }>>;
}, "strip", z.ZodTypeAny, {
    slug?: string;
    condition?: {
        role?: string;
        minXp?: number;
        minReplies?: number;
        minLikes?: number;
    };
    autoAssign?: boolean;
}, {
    slug?: string;
    condition?: {
        role?: string;
        minXp?: number;
        minReplies?: number;
        minLikes?: number;
    };
    autoAssign?: boolean;
}>;
declare const ForumRulesSchema: z.ZodObject<{
    allowPosting: z.ZodBoolean;
    xpEnabled: z.ZodBoolean;
    tippingEnabled: z.ZodBoolean;
    xpMultiplier: z.ZodOptional<z.ZodNumber>;
    accessLevel: z.ZodOptional<z.ZodEnum<["public", "registered", "level_10+", "vip", "moderator", "admin"]>>;
    minXpRequired: z.ZodOptional<z.ZodNumber>;
    allowPolls: z.ZodOptional<z.ZodBoolean>;
    allowTags: z.ZodOptional<z.ZodBoolean>;
    allowAttachments: z.ZodOptional<z.ZodBoolean>;
    availablePrefixes: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    prefixGrantRules: z.ZodOptional<z.ZodArray<z.ZodObject<{
        slug: z.ZodString;
        autoAssign: z.ZodBoolean;
        condition: z.ZodOptional<z.ZodObject<{
            minReplies: z.ZodOptional<z.ZodNumber>;
            minLikes: z.ZodOptional<z.ZodNumber>;
            minXp: z.ZodOptional<z.ZodNumber>;
            role: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            role?: string;
            minXp?: number;
            minReplies?: number;
            minLikes?: number;
        }, {
            role?: string;
            minXp?: number;
            minReplies?: number;
            minLikes?: number;
        }>>;
    }, "strip", z.ZodTypeAny, {
        slug?: string;
        condition?: {
            role?: string;
            minXp?: number;
            minReplies?: number;
            minLikes?: number;
        };
        autoAssign?: boolean;
    }, {
        slug?: string;
        condition?: {
            role?: string;
            minXp?: number;
            minReplies?: number;
            minLikes?: number;
        };
        autoAssign?: boolean;
    }>, "many">>;
    requiredPrefix: z.ZodOptional<z.ZodBoolean>;
    customComponent: z.ZodOptional<z.ZodString>;
    customRules: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    xpMultiplier?: number;
    tippingEnabled?: boolean;
    minXpRequired?: number;
    allowPosting?: boolean;
    xpEnabled?: boolean;
    accessLevel?: "public" | "admin" | "moderator" | "vip" | "registered" | "level_10+";
    allowPolls?: boolean;
    allowTags?: boolean;
    allowAttachments?: boolean;
    availablePrefixes?: string[];
    prefixGrantRules?: {
        slug?: string;
        condition?: {
            role?: string;
            minXp?: number;
            minReplies?: number;
            minLikes?: number;
        };
        autoAssign?: boolean;
    }[];
    requiredPrefix?: boolean;
    customComponent?: string;
    customRules?: Record<string, unknown>;
}, {
    xpMultiplier?: number;
    tippingEnabled?: boolean;
    minXpRequired?: number;
    allowPosting?: boolean;
    xpEnabled?: boolean;
    accessLevel?: "public" | "admin" | "moderator" | "vip" | "registered" | "level_10+";
    allowPolls?: boolean;
    allowTags?: boolean;
    allowAttachments?: boolean;
    availablePrefixes?: string[];
    prefixGrantRules?: {
        slug?: string;
        condition?: {
            role?: string;
            minXp?: number;
            minReplies?: number;
            minLikes?: number;
        };
        autoAssign?: boolean;
    }[];
    requiredPrefix?: boolean;
    customComponent?: string;
    customRules?: Record<string, unknown>;
}>;
declare const ForumThemeSchema: z.ZodObject<{
    color: z.ZodString;
    icon: z.ZodString;
    colorTheme: z.ZodString;
    bannerImage: z.ZodOptional<z.ZodString>;
    backgroundImage: z.ZodOptional<z.ZodString>;
    landingComponent: z.ZodOptional<z.ZodString>;
    customStyles: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    color?: string;
    icon?: string;
    colorTheme?: string;
    backgroundImage?: string;
    bannerImage?: string;
    landingComponent?: string;
    customStyles?: Record<string, string>;
}, {
    color?: string;
    icon?: string;
    colorTheme?: string;
    backgroundImage?: string;
    bannerImage?: string;
    landingComponent?: string;
    customStyles?: Record<string, string>;
}>;
export type ForumRules = z.infer<typeof ForumRulesSchema>;
export type ForumTheme = z.infer<typeof ForumThemeSchema>;
export type Forum = {
    slug: string;
    name: string;
    description?: string;
    rules: ForumRules;
    themeOverride?: Partial<ForumTheme>;
    position?: number;
    tags?: string[];
    forums?: Forum[];
};
declare const RootForumSchema: z.ZodObject<{
    slug: z.ZodString;
    name: z.ZodString;
    description: z.ZodString;
    isFeatured: z.ZodBoolean;
    position: z.ZodOptional<z.ZodNumber>;
    theme: z.ZodObject<{
        color: z.ZodString;
        icon: z.ZodString;
        colorTheme: z.ZodString;
        bannerImage: z.ZodOptional<z.ZodString>;
        backgroundImage: z.ZodOptional<z.ZodString>;
        landingComponent: z.ZodOptional<z.ZodString>;
        customStyles: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        color?: string;
        icon?: string;
        colorTheme?: string;
        backgroundImage?: string;
        bannerImage?: string;
        landingComponent?: string;
        customStyles?: Record<string, string>;
    }, {
        color?: string;
        icon?: string;
        colorTheme?: string;
        backgroundImage?: string;
        bannerImage?: string;
        landingComponent?: string;
        customStyles?: Record<string, string>;
    }>;
    defaultRules: z.ZodOptional<z.ZodObject<{
        allowPosting: z.ZodOptional<z.ZodBoolean>;
        xpEnabled: z.ZodOptional<z.ZodBoolean>;
        tippingEnabled: z.ZodOptional<z.ZodBoolean>;
        xpMultiplier: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
        accessLevel: z.ZodOptional<z.ZodOptional<z.ZodEnum<["public", "registered", "level_10+", "vip", "moderator", "admin"]>>>;
        minXpRequired: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
        allowPolls: z.ZodOptional<z.ZodOptional<z.ZodBoolean>>;
        allowTags: z.ZodOptional<z.ZodOptional<z.ZodBoolean>>;
        allowAttachments: z.ZodOptional<z.ZodOptional<z.ZodBoolean>>;
        availablePrefixes: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
        prefixGrantRules: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodObject<{
            slug: z.ZodString;
            autoAssign: z.ZodBoolean;
            condition: z.ZodOptional<z.ZodObject<{
                minReplies: z.ZodOptional<z.ZodNumber>;
                minLikes: z.ZodOptional<z.ZodNumber>;
                minXp: z.ZodOptional<z.ZodNumber>;
                role: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                role?: string;
                minXp?: number;
                minReplies?: number;
                minLikes?: number;
            }, {
                role?: string;
                minXp?: number;
                minReplies?: number;
                minLikes?: number;
            }>>;
        }, "strip", z.ZodTypeAny, {
            slug?: string;
            condition?: {
                role?: string;
                minXp?: number;
                minReplies?: number;
                minLikes?: number;
            };
            autoAssign?: boolean;
        }, {
            slug?: string;
            condition?: {
                role?: string;
                minXp?: number;
                minReplies?: number;
                minLikes?: number;
            };
            autoAssign?: boolean;
        }>, "many">>>;
        requiredPrefix: z.ZodOptional<z.ZodOptional<z.ZodBoolean>>;
        customComponent: z.ZodOptional<z.ZodOptional<z.ZodString>>;
        customRules: z.ZodOptional<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
    }, "strip", z.ZodTypeAny, {
        xpMultiplier?: number;
        tippingEnabled?: boolean;
        minXpRequired?: number;
        allowPosting?: boolean;
        xpEnabled?: boolean;
        accessLevel?: "public" | "admin" | "moderator" | "vip" | "registered" | "level_10+";
        allowPolls?: boolean;
        allowTags?: boolean;
        allowAttachments?: boolean;
        availablePrefixes?: string[];
        prefixGrantRules?: {
            slug?: string;
            condition?: {
                role?: string;
                minXp?: number;
                minReplies?: number;
                minLikes?: number;
            };
            autoAssign?: boolean;
        }[];
        requiredPrefix?: boolean;
        customComponent?: string;
        customRules?: Record<string, unknown>;
    }, {
        xpMultiplier?: number;
        tippingEnabled?: boolean;
        minXpRequired?: number;
        allowPosting?: boolean;
        xpEnabled?: boolean;
        accessLevel?: "public" | "admin" | "moderator" | "vip" | "registered" | "level_10+";
        allowPolls?: boolean;
        allowTags?: boolean;
        allowAttachments?: boolean;
        availablePrefixes?: string[];
        prefixGrantRules?: {
            slug?: string;
            condition?: {
                role?: string;
                minXp?: number;
                minReplies?: number;
                minLikes?: number;
            };
            autoAssign?: boolean;
        }[];
        requiredPrefix?: boolean;
        customComponent?: string;
        customRules?: Record<string, unknown>;
    }>>;
    forums: z.ZodArray<any, "many">;
}, "strip", z.ZodTypeAny, {
    name?: string;
    description?: string;
    slug?: string;
    position?: number;
    isFeatured?: boolean;
    theme?: {
        color?: string;
        icon?: string;
        colorTheme?: string;
        backgroundImage?: string;
        bannerImage?: string;
        landingComponent?: string;
        customStyles?: Record<string, string>;
    };
    forums?: any[];
    defaultRules?: {
        xpMultiplier?: number;
        tippingEnabled?: boolean;
        minXpRequired?: number;
        allowPosting?: boolean;
        xpEnabled?: boolean;
        accessLevel?: "public" | "admin" | "moderator" | "vip" | "registered" | "level_10+";
        allowPolls?: boolean;
        allowTags?: boolean;
        allowAttachments?: boolean;
        availablePrefixes?: string[];
        prefixGrantRules?: {
            slug?: string;
            condition?: {
                role?: string;
                minXp?: number;
                minReplies?: number;
                minLikes?: number;
            };
            autoAssign?: boolean;
        }[];
        requiredPrefix?: boolean;
        customComponent?: string;
        customRules?: Record<string, unknown>;
    };
}, {
    name?: string;
    description?: string;
    slug?: string;
    position?: number;
    isFeatured?: boolean;
    theme?: {
        color?: string;
        icon?: string;
        colorTheme?: string;
        backgroundImage?: string;
        bannerImage?: string;
        landingComponent?: string;
        customStyles?: Record<string, string>;
    };
    forums?: any[];
    defaultRules?: {
        xpMultiplier?: number;
        tippingEnabled?: boolean;
        minXpRequired?: number;
        allowPosting?: boolean;
        xpEnabled?: boolean;
        accessLevel?: "public" | "admin" | "moderator" | "vip" | "registered" | "level_10+";
        allowPolls?: boolean;
        allowTags?: boolean;
        allowAttachments?: boolean;
        availablePrefixes?: string[];
        prefixGrantRules?: {
            slug?: string;
            condition?: {
                role?: string;
                minXp?: number;
                minReplies?: number;
                minLikes?: number;
            };
            autoAssign?: boolean;
        }[];
        requiredPrefix?: boolean;
        customComponent?: string;
        customRules?: Record<string, unknown>;
    };
}>;
export declare const forumMapSchema: z.ZodObject<{
    forums: z.ZodArray<z.ZodObject<{
        slug: z.ZodString;
        name: z.ZodString;
        description: z.ZodString;
        isFeatured: z.ZodBoolean;
        position: z.ZodOptional<z.ZodNumber>;
        theme: z.ZodObject<{
            color: z.ZodString;
            icon: z.ZodString;
            colorTheme: z.ZodString;
            bannerImage: z.ZodOptional<z.ZodString>;
            backgroundImage: z.ZodOptional<z.ZodString>;
            landingComponent: z.ZodOptional<z.ZodString>;
            customStyles: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        }, "strip", z.ZodTypeAny, {
            color?: string;
            icon?: string;
            colorTheme?: string;
            backgroundImage?: string;
            bannerImage?: string;
            landingComponent?: string;
            customStyles?: Record<string, string>;
        }, {
            color?: string;
            icon?: string;
            colorTheme?: string;
            backgroundImage?: string;
            bannerImage?: string;
            landingComponent?: string;
            customStyles?: Record<string, string>;
        }>;
        defaultRules: z.ZodOptional<z.ZodObject<{
            allowPosting: z.ZodOptional<z.ZodBoolean>;
            xpEnabled: z.ZodOptional<z.ZodBoolean>;
            tippingEnabled: z.ZodOptional<z.ZodBoolean>;
            xpMultiplier: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
            accessLevel: z.ZodOptional<z.ZodOptional<z.ZodEnum<["public", "registered", "level_10+", "vip", "moderator", "admin"]>>>;
            minXpRequired: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
            allowPolls: z.ZodOptional<z.ZodOptional<z.ZodBoolean>>;
            allowTags: z.ZodOptional<z.ZodOptional<z.ZodBoolean>>;
            allowAttachments: z.ZodOptional<z.ZodOptional<z.ZodBoolean>>;
            availablePrefixes: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
            prefixGrantRules: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodObject<{
                slug: z.ZodString;
                autoAssign: z.ZodBoolean;
                condition: z.ZodOptional<z.ZodObject<{
                    minReplies: z.ZodOptional<z.ZodNumber>;
                    minLikes: z.ZodOptional<z.ZodNumber>;
                    minXp: z.ZodOptional<z.ZodNumber>;
                    role: z.ZodOptional<z.ZodString>;
                }, "strip", z.ZodTypeAny, {
                    role?: string;
                    minXp?: number;
                    minReplies?: number;
                    minLikes?: number;
                }, {
                    role?: string;
                    minXp?: number;
                    minReplies?: number;
                    minLikes?: number;
                }>>;
            }, "strip", z.ZodTypeAny, {
                slug?: string;
                condition?: {
                    role?: string;
                    minXp?: number;
                    minReplies?: number;
                    minLikes?: number;
                };
                autoAssign?: boolean;
            }, {
                slug?: string;
                condition?: {
                    role?: string;
                    minXp?: number;
                    minReplies?: number;
                    minLikes?: number;
                };
                autoAssign?: boolean;
            }>, "many">>>;
            requiredPrefix: z.ZodOptional<z.ZodOptional<z.ZodBoolean>>;
            customComponent: z.ZodOptional<z.ZodOptional<z.ZodString>>;
            customRules: z.ZodOptional<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
        }, "strip", z.ZodTypeAny, {
            xpMultiplier?: number;
            tippingEnabled?: boolean;
            minXpRequired?: number;
            allowPosting?: boolean;
            xpEnabled?: boolean;
            accessLevel?: "public" | "admin" | "moderator" | "vip" | "registered" | "level_10+";
            allowPolls?: boolean;
            allowTags?: boolean;
            allowAttachments?: boolean;
            availablePrefixes?: string[];
            prefixGrantRules?: {
                slug?: string;
                condition?: {
                    role?: string;
                    minXp?: number;
                    minReplies?: number;
                    minLikes?: number;
                };
                autoAssign?: boolean;
            }[];
            requiredPrefix?: boolean;
            customComponent?: string;
            customRules?: Record<string, unknown>;
        }, {
            xpMultiplier?: number;
            tippingEnabled?: boolean;
            minXpRequired?: number;
            allowPosting?: boolean;
            xpEnabled?: boolean;
            accessLevel?: "public" | "admin" | "moderator" | "vip" | "registered" | "level_10+";
            allowPolls?: boolean;
            allowTags?: boolean;
            allowAttachments?: boolean;
            availablePrefixes?: string[];
            prefixGrantRules?: {
                slug?: string;
                condition?: {
                    role?: string;
                    minXp?: number;
                    minReplies?: number;
                    minLikes?: number;
                };
                autoAssign?: boolean;
            }[];
            requiredPrefix?: boolean;
            customComponent?: string;
            customRules?: Record<string, unknown>;
        }>>;
        forums: z.ZodArray<any, "many">;
    }, "strip", z.ZodTypeAny, {
        name?: string;
        description?: string;
        slug?: string;
        position?: number;
        isFeatured?: boolean;
        theme?: {
            color?: string;
            icon?: string;
            colorTheme?: string;
            backgroundImage?: string;
            bannerImage?: string;
            landingComponent?: string;
            customStyles?: Record<string, string>;
        };
        forums?: any[];
        defaultRules?: {
            xpMultiplier?: number;
            tippingEnabled?: boolean;
            minXpRequired?: number;
            allowPosting?: boolean;
            xpEnabled?: boolean;
            accessLevel?: "public" | "admin" | "moderator" | "vip" | "registered" | "level_10+";
            allowPolls?: boolean;
            allowTags?: boolean;
            allowAttachments?: boolean;
            availablePrefixes?: string[];
            prefixGrantRules?: {
                slug?: string;
                condition?: {
                    role?: string;
                    minXp?: number;
                    minReplies?: number;
                    minLikes?: number;
                };
                autoAssign?: boolean;
            }[];
            requiredPrefix?: boolean;
            customComponent?: string;
            customRules?: Record<string, unknown>;
        };
    }, {
        name?: string;
        description?: string;
        slug?: string;
        position?: number;
        isFeatured?: boolean;
        theme?: {
            color?: string;
            icon?: string;
            colorTheme?: string;
            backgroundImage?: string;
            bannerImage?: string;
            landingComponent?: string;
            customStyles?: Record<string, string>;
        };
        forums?: any[];
        defaultRules?: {
            xpMultiplier?: number;
            tippingEnabled?: boolean;
            minXpRequired?: number;
            allowPosting?: boolean;
            xpEnabled?: boolean;
            accessLevel?: "public" | "admin" | "moderator" | "vip" | "registered" | "level_10+";
            allowPolls?: boolean;
            allowTags?: boolean;
            allowAttachments?: boolean;
            availablePrefixes?: string[];
            prefixGrantRules?: {
                slug?: string;
                condition?: {
                    role?: string;
                    minXp?: number;
                    minReplies?: number;
                    minLikes?: number;
                };
                autoAssign?: boolean;
            }[];
            requiredPrefix?: boolean;
            customComponent?: string;
            customRules?: Record<string, unknown>;
        };
    }>, "many">;
    version: z.ZodString;
    lastUpdated: z.ZodString;
}, "strip", z.ZodTypeAny, {
    version?: string;
    lastUpdated?: string;
    forums?: {
        name?: string;
        description?: string;
        slug?: string;
        position?: number;
        isFeatured?: boolean;
        theme?: {
            color?: string;
            icon?: string;
            colorTheme?: string;
            backgroundImage?: string;
            bannerImage?: string;
            landingComponent?: string;
            customStyles?: Record<string, string>;
        };
        forums?: any[];
        defaultRules?: {
            xpMultiplier?: number;
            tippingEnabled?: boolean;
            minXpRequired?: number;
            allowPosting?: boolean;
            xpEnabled?: boolean;
            accessLevel?: "public" | "admin" | "moderator" | "vip" | "registered" | "level_10+";
            allowPolls?: boolean;
            allowTags?: boolean;
            allowAttachments?: boolean;
            availablePrefixes?: string[];
            prefixGrantRules?: {
                slug?: string;
                condition?: {
                    role?: string;
                    minXp?: number;
                    minReplies?: number;
                    minLikes?: number;
                };
                autoAssign?: boolean;
            }[];
            requiredPrefix?: boolean;
            customComponent?: string;
            customRules?: Record<string, unknown>;
        };
    }[];
}, {
    version?: string;
    lastUpdated?: string;
    forums?: {
        name?: string;
        description?: string;
        slug?: string;
        position?: number;
        isFeatured?: boolean;
        theme?: {
            color?: string;
            icon?: string;
            colorTheme?: string;
            backgroundImage?: string;
            bannerImage?: string;
            landingComponent?: string;
            customStyles?: Record<string, string>;
        };
        forums?: any[];
        defaultRules?: {
            xpMultiplier?: number;
            tippingEnabled?: boolean;
            minXpRequired?: number;
            allowPosting?: boolean;
            xpEnabled?: boolean;
            accessLevel?: "public" | "admin" | "moderator" | "vip" | "registered" | "level_10+";
            allowPolls?: boolean;
            allowTags?: boolean;
            allowAttachments?: boolean;
            availablePrefixes?: string[];
            prefixGrantRules?: {
                slug?: string;
                condition?: {
                    role?: string;
                    minXp?: number;
                    minReplies?: number;
                    minLikes?: number;
                };
                autoAssign?: boolean;
            }[];
            requiredPrefix?: boolean;
            customComponent?: string;
            customRules?: Record<string, unknown>;
        };
    }[];
}>;
export type PrefixGrantRule = z.infer<typeof PrefixGrantRuleSchema>;
export type RootForum = z.infer<typeof RootForumSchema>;
export type ForumMap = z.infer<typeof forumMapSchema>;
export declare const DEFAULT_FORUM_RULES: ForumRules;
export declare const forumMap: ForumMap;
export declare const getForumBySlug: (slug: string) => {
    forum: Forum;
    parent: RootForum;
} | null;
export declare const getFeaturedForums: () => {
    name?: string;
    description?: string;
    slug?: string;
    position?: number;
    isFeatured?: boolean;
    theme?: {
        color?: string;
        icon?: string;
        colorTheme?: string;
        backgroundImage?: string;
        bannerImage?: string;
        landingComponent?: string;
        customStyles?: Record<string, string>;
    };
    forums?: any[];
    defaultRules?: {
        xpMultiplier?: number;
        tippingEnabled?: boolean;
        minXpRequired?: number;
        allowPosting?: boolean;
        xpEnabled?: boolean;
        accessLevel?: "public" | "admin" | "moderator" | "vip" | "registered" | "level_10+";
        allowPolls?: boolean;
        allowTags?: boolean;
        allowAttachments?: boolean;
        availablePrefixes?: string[];
        prefixGrantRules?: {
            slug?: string;
            condition?: {
                role?: string;
                minXp?: number;
                minReplies?: number;
                minLikes?: number;
            };
            autoAssign?: boolean;
        }[];
        requiredPrefix?: boolean;
        customComponent?: string;
        customRules?: Record<string, unknown>;
    };
}[];
export declare const getRegularForums: () => {
    name?: string;
    description?: string;
    slug?: string;
    position?: number;
    isFeatured?: boolean;
    theme?: {
        color?: string;
        icon?: string;
        colorTheme?: string;
        backgroundImage?: string;
        bannerImage?: string;
        landingComponent?: string;
        customStyles?: Record<string, string>;
    };
    forums?: any[];
    defaultRules?: {
        xpMultiplier?: number;
        tippingEnabled?: boolean;
        minXpRequired?: number;
        allowPosting?: boolean;
        xpEnabled?: boolean;
        accessLevel?: "public" | "admin" | "moderator" | "vip" | "registered" | "level_10+";
        allowPolls?: boolean;
        allowTags?: boolean;
        allowAttachments?: boolean;
        availablePrefixes?: string[];
        prefixGrantRules?: {
            slug?: string;
            condition?: {
                role?: string;
                minXp?: number;
                minReplies?: number;
                minLikes?: number;
            };
            autoAssign?: boolean;
        }[];
        requiredPrefix?: boolean;
        customComponent?: string;
        customRules?: Record<string, unknown>;
    };
}[];
export {};
