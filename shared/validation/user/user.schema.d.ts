import { z } from 'zod';
/**
 * Zod schemas for user validation
 * These schemas must mirror the interfaces in shared/types/core/user.types.ts
 */
export declare const LevelConfigSchema: z.ZodObject<{
    level: z.ZodNumber;
    name: z.ZodString;
    minXp: z.ZodNumber;
    maxXp: z.ZodNumber;
    color: z.ZodString;
}, "strip", z.ZodTypeAny, {
    level?: number;
    name?: string;
    color?: string;
    minXp?: number;
    maxXp?: number;
}, {
    level?: number;
    name?: string;
    color?: string;
    minXp?: number;
    maxXp?: number;
}>;
export declare const DisplaySettingsSchema: z.ZodObject<{
    language: z.ZodString;
    timezone: z.ZodString;
    dateFormat: z.ZodEnum<["relative", "absolute"]>;
    showSignatures: z.ZodBoolean;
    postsPerPage: z.ZodNumber;
    theme: z.ZodString;
    fontSize: z.ZodString;
    threadDisplayMode: z.ZodString;
    reducedMotion: z.ZodBoolean;
    hideNsfw: z.ZodBoolean;
    showMatureContent: z.ZodBoolean;
    showOfflineUsers: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    theme?: string;
    timezone?: string;
    language?: string;
    dateFormat?: "relative" | "absolute";
    showSignatures?: boolean;
    postsPerPage?: number;
    fontSize?: string;
    threadDisplayMode?: string;
    reducedMotion?: boolean;
    hideNsfw?: boolean;
    showMatureContent?: boolean;
    showOfflineUsers?: boolean;
}, {
    theme?: string;
    timezone?: string;
    language?: string;
    dateFormat?: "relative" | "absolute";
    showSignatures?: boolean;
    postsPerPage?: number;
    fontSize?: string;
    threadDisplayMode?: string;
    reducedMotion?: boolean;
    hideNsfw?: boolean;
    showMatureContent?: boolean;
    showOfflineUsers?: boolean;
}>;
export declare const NotificationSettingsSchema: z.ZodObject<{
    email: z.ZodObject<{
        enabled: z.ZodBoolean;
        digest: z.ZodEnum<["none", "daily", "weekly"]>;
        mentions: z.ZodBoolean;
        replies: z.ZodBoolean;
        tips: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        mentions?: boolean;
        enabled?: boolean;
        tips?: boolean;
        digest?: "none" | "daily" | "weekly";
        replies?: boolean;
    }, {
        mentions?: boolean;
        enabled?: boolean;
        tips?: boolean;
        digest?: "none" | "daily" | "weekly";
        replies?: boolean;
    }>;
    push: z.ZodObject<{
        enabled: z.ZodBoolean;
        mentions: z.ZodBoolean;
        replies: z.ZodBoolean;
        tips: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        mentions?: boolean;
        enabled?: boolean;
        tips?: boolean;
        replies?: boolean;
    }, {
        mentions?: boolean;
        enabled?: boolean;
        tips?: boolean;
        replies?: boolean;
    }>;
}, "strip", z.ZodTypeAny, {
    email?: {
        mentions?: boolean;
        enabled?: boolean;
        tips?: boolean;
        digest?: "none" | "daily" | "weekly";
        replies?: boolean;
    };
    push?: {
        mentions?: boolean;
        enabled?: boolean;
        tips?: boolean;
        replies?: boolean;
    };
}, {
    email?: {
        mentions?: boolean;
        enabled?: boolean;
        tips?: boolean;
        digest?: "none" | "daily" | "weekly";
        replies?: boolean;
    };
    push?: {
        mentions?: boolean;
        enabled?: boolean;
        tips?: boolean;
        replies?: boolean;
    };
}>;
export declare const PrivacySettingsSchema: z.ZodObject<{
    profileVisibility: z.ZodEnum<["public", "friends", "private"]>;
    showLevel: z.ZodBoolean;
    showStats: z.ZodBoolean;
    allowMessages: z.ZodBoolean;
    allowFriendRequests: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    profileVisibility?: "public" | "friends" | "private";
    showLevel?: boolean;
    showStats?: boolean;
    allowMessages?: boolean;
    allowFriendRequests?: boolean;
}, {
    profileVisibility?: "public" | "friends" | "private";
    showLevel?: boolean;
    showStats?: boolean;
    allowMessages?: boolean;
    allowFriendRequests?: boolean;
}>;
export declare const UserSettingsSchema: z.ZodObject<{
    theme: z.ZodEnum<["light", "dark", "system"]>;
    notifications: z.ZodObject<{
        email: z.ZodObject<{
            enabled: z.ZodBoolean;
            digest: z.ZodEnum<["none", "daily", "weekly"]>;
            mentions: z.ZodBoolean;
            replies: z.ZodBoolean;
            tips: z.ZodBoolean;
        }, "strip", z.ZodTypeAny, {
            mentions?: boolean;
            enabled?: boolean;
            tips?: boolean;
            digest?: "none" | "daily" | "weekly";
            replies?: boolean;
        }, {
            mentions?: boolean;
            enabled?: boolean;
            tips?: boolean;
            digest?: "none" | "daily" | "weekly";
            replies?: boolean;
        }>;
        push: z.ZodObject<{
            enabled: z.ZodBoolean;
            mentions: z.ZodBoolean;
            replies: z.ZodBoolean;
            tips: z.ZodBoolean;
        }, "strip", z.ZodTypeAny, {
            mentions?: boolean;
            enabled?: boolean;
            tips?: boolean;
            replies?: boolean;
        }, {
            mentions?: boolean;
            enabled?: boolean;
            tips?: boolean;
            replies?: boolean;
        }>;
    }, "strip", z.ZodTypeAny, {
        email?: {
            mentions?: boolean;
            enabled?: boolean;
            tips?: boolean;
            digest?: "none" | "daily" | "weekly";
            replies?: boolean;
        };
        push?: {
            mentions?: boolean;
            enabled?: boolean;
            tips?: boolean;
            replies?: boolean;
        };
    }, {
        email?: {
            mentions?: boolean;
            enabled?: boolean;
            tips?: boolean;
            digest?: "none" | "daily" | "weekly";
            replies?: boolean;
        };
        push?: {
            mentions?: boolean;
            enabled?: boolean;
            tips?: boolean;
            replies?: boolean;
        };
    }>;
    privacy: z.ZodObject<{
        profileVisibility: z.ZodEnum<["public", "friends", "private"]>;
        showLevel: z.ZodBoolean;
        showStats: z.ZodBoolean;
        allowMessages: z.ZodBoolean;
        allowFriendRequests: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        profileVisibility?: "public" | "friends" | "private";
        showLevel?: boolean;
        showStats?: boolean;
        allowMessages?: boolean;
        allowFriendRequests?: boolean;
    }, {
        profileVisibility?: "public" | "friends" | "private";
        showLevel?: boolean;
        showStats?: boolean;
        allowMessages?: boolean;
        allowFriendRequests?: boolean;
    }>;
    display: z.ZodObject<{
        language: z.ZodString;
        timezone: z.ZodString;
        dateFormat: z.ZodEnum<["relative", "absolute"]>;
        showSignatures: z.ZodBoolean;
        postsPerPage: z.ZodNumber;
        theme: z.ZodString;
        fontSize: z.ZodString;
        threadDisplayMode: z.ZodString;
        reducedMotion: z.ZodBoolean;
        hideNsfw: z.ZodBoolean;
        showMatureContent: z.ZodBoolean;
        showOfflineUsers: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        theme?: string;
        timezone?: string;
        language?: string;
        dateFormat?: "relative" | "absolute";
        showSignatures?: boolean;
        postsPerPage?: number;
        fontSize?: string;
        threadDisplayMode?: string;
        reducedMotion?: boolean;
        hideNsfw?: boolean;
        showMatureContent?: boolean;
        showOfflineUsers?: boolean;
    }, {
        theme?: string;
        timezone?: string;
        language?: string;
        dateFormat?: "relative" | "absolute";
        showSignatures?: boolean;
        postsPerPage?: number;
        fontSize?: string;
        threadDisplayMode?: string;
        reducedMotion?: boolean;
        hideNsfw?: boolean;
        showMatureContent?: boolean;
        showOfflineUsers?: boolean;
    }>;
}, "strip", z.ZodTypeAny, {
    theme?: "light" | "dark" | "system";
    notifications?: {
        email?: {
            mentions?: boolean;
            enabled?: boolean;
            tips?: boolean;
            digest?: "none" | "daily" | "weekly";
            replies?: boolean;
        };
        push?: {
            mentions?: boolean;
            enabled?: boolean;
            tips?: boolean;
            replies?: boolean;
        };
    };
    privacy?: {
        profileVisibility?: "public" | "friends" | "private";
        showLevel?: boolean;
        showStats?: boolean;
        allowMessages?: boolean;
        allowFriendRequests?: boolean;
    };
    display?: {
        theme?: string;
        timezone?: string;
        language?: string;
        dateFormat?: "relative" | "absolute";
        showSignatures?: boolean;
        postsPerPage?: number;
        fontSize?: string;
        threadDisplayMode?: string;
        reducedMotion?: boolean;
        hideNsfw?: boolean;
        showMatureContent?: boolean;
        showOfflineUsers?: boolean;
    };
}, {
    theme?: "light" | "dark" | "system";
    notifications?: {
        email?: {
            mentions?: boolean;
            enabled?: boolean;
            tips?: boolean;
            digest?: "none" | "daily" | "weekly";
            replies?: boolean;
        };
        push?: {
            mentions?: boolean;
            enabled?: boolean;
            tips?: boolean;
            replies?: boolean;
        };
    };
    privacy?: {
        profileVisibility?: "public" | "friends" | "private";
        showLevel?: boolean;
        showStats?: boolean;
        allowMessages?: boolean;
        allowFriendRequests?: boolean;
    };
    display?: {
        theme?: string;
        timezone?: string;
        language?: string;
        dateFormat?: "relative" | "absolute";
        showSignatures?: boolean;
        postsPerPage?: number;
        fontSize?: string;
        threadDisplayMode?: string;
        reducedMotion?: boolean;
        hideNsfw?: boolean;
        showMatureContent?: boolean;
        showOfflineUsers?: boolean;
    };
}>;
export declare const UserStatsSchema: z.ZodObject<{
    postCount: z.ZodNumber;
    threadCount: z.ZodNumber;
    tipsSent: z.ZodNumber;
    tipsReceived: z.ZodNumber;
    reputation: z.ZodNumber;
    totalXp: z.ZodNumber;
    dailyStreak: z.ZodNumber;
    bestStreak: z.ZodNumber;
    achievementCount: z.ZodNumber;
    lastPostAt: z.ZodNullable<z.ZodDate>;
    joinedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    postCount?: number;
    threadCount?: number;
    tipsSent?: number;
    tipsReceived?: number;
    reputation?: number;
    dailyStreak?: number;
    bestStreak?: number;
    achievementCount?: number;
    lastPostAt?: Date;
    joinedAt?: Date;
    totalXp?: number;
}, {
    postCount?: number;
    threadCount?: number;
    tipsSent?: number;
    tipsReceived?: number;
    reputation?: number;
    dailyStreak?: number;
    bestStreak?: number;
    achievementCount?: number;
    lastPostAt?: Date;
    joinedAt?: Date;
    totalXp?: number;
}>;
export declare const UserBadgeSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodString;
    imageUrl: z.ZodString;
    rarity: z.ZodEnum<["common", "rare", "epic", "legendary", "mythic"]>;
    unlockedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id?: string;
    unlockedAt?: Date;
    name?: string;
    description?: string;
    imageUrl?: string;
    rarity?: "common" | "rare" | "epic" | "legendary" | "mythic";
}, {
    id?: string;
    unlockedAt?: Date;
    name?: string;
    description?: string;
    imageUrl?: string;
    rarity?: "common" | "rare" | "epic" | "legendary" | "mythic";
}>;
export declare const UserTitleSchema: z.ZodObject<{
    id: z.ZodString;
    text: z.ZodString;
    color: z.ZodString;
    effects: z.ZodOptional<z.ZodObject<{
        glow: z.ZodOptional<z.ZodBoolean>;
        animate: z.ZodOptional<z.ZodBoolean>;
        gradient: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        gradient?: string[];
        glow?: boolean;
        animate?: boolean;
    }, {
        gradient?: string[];
        glow?: boolean;
        animate?: boolean;
    }>>;
}, "strip", z.ZodTypeAny, {
    id?: string;
    color?: string;
    text?: string;
    effects?: {
        gradient?: string[];
        glow?: boolean;
        animate?: boolean;
    };
}, {
    id?: string;
    color?: string;
    text?: string;
    effects?: {
        gradient?: string[];
        glow?: boolean;
        animate?: boolean;
    };
}>;
export declare const UserFrameSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    previewUrl: z.ZodString;
    cssClass: z.ZodString;
    rarity: z.ZodEnum<["common", "rare", "epic", "legendary", "mythic"]>;
}, "strip", z.ZodTypeAny, {
    id?: string;
    name?: string;
    rarity?: "common" | "rare" | "epic" | "legendary" | "mythic";
    previewUrl?: string;
    cssClass?: string;
}, {
    id?: string;
    name?: string;
    rarity?: "common" | "rare" | "epic" | "legendary" | "mythic";
    previewUrl?: string;
    cssClass?: string;
}>;
export declare const UserProfileSchema: z.ZodObject<{
    id: z.ZodString;
    username: z.ZodString;
    level: z.ZodNumber;
    role: z.ZodString;
    profilePictureUrl: z.ZodNullable<z.ZodString>;
    bio: z.ZodNullable<z.ZodString>;
    displayName: z.ZodString;
    badges: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        description: z.ZodString;
        imageUrl: z.ZodString;
        rarity: z.ZodEnum<["common", "rare", "epic", "legendary", "mythic"]>;
        unlockedAt: z.ZodDate;
    }, "strip", z.ZodTypeAny, {
        id?: string;
        unlockedAt?: Date;
        name?: string;
        description?: string;
        imageUrl?: string;
        rarity?: "common" | "rare" | "epic" | "legendary" | "mythic";
    }, {
        id?: string;
        unlockedAt?: Date;
        name?: string;
        description?: string;
        imageUrl?: string;
        rarity?: "common" | "rare" | "epic" | "legendary" | "mythic";
    }>, "many">;
    title: z.ZodNullable<z.ZodObject<{
        id: z.ZodString;
        text: z.ZodString;
        color: z.ZodString;
        effects: z.ZodOptional<z.ZodObject<{
            glow: z.ZodOptional<z.ZodBoolean>;
            animate: z.ZodOptional<z.ZodBoolean>;
            gradient: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            gradient?: string[];
            glow?: boolean;
            animate?: boolean;
        }, {
            gradient?: string[];
            glow?: boolean;
            animate?: boolean;
        }>>;
    }, "strip", z.ZodTypeAny, {
        id?: string;
        color?: string;
        text?: string;
        effects?: {
            gradient?: string[];
            glow?: boolean;
            animate?: boolean;
        };
    }, {
        id?: string;
        color?: string;
        text?: string;
        effects?: {
            gradient?: string[];
            glow?: boolean;
            animate?: boolean;
        };
    }>>;
    frame: z.ZodNullable<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        previewUrl: z.ZodString;
        cssClass: z.ZodString;
        rarity: z.ZodEnum<["common", "rare", "epic", "legendary", "mythic"]>;
    }, "strip", z.ZodTypeAny, {
        id?: string;
        name?: string;
        rarity?: "common" | "rare" | "epic" | "legendary" | "mythic";
        previewUrl?: string;
        cssClass?: string;
    }, {
        id?: string;
        name?: string;
        rarity?: "common" | "rare" | "epic" | "legendary" | "mythic";
        previewUrl?: string;
        cssClass?: string;
    }>>;
    isOnline: z.ZodBoolean;
    lastSeen: z.ZodDate;
    levelConfig: z.ZodOptional<z.ZodObject<{
        level: z.ZodNumber;
        name: z.ZodString;
        minXp: z.ZodNumber;
        maxXp: z.ZodNumber;
        color: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        level?: number;
        name?: string;
        color?: string;
        minXp?: number;
        maxXp?: number;
    }, {
        level?: number;
        name?: string;
        color?: string;
        minXp?: number;
        maxXp?: number;
    }>>;
}, "strip", z.ZodTypeAny, {
    id?: string;
    username?: string;
    level?: number;
    role?: string;
    profilePictureUrl?: string;
    bio?: string;
    displayName?: string;
    badges?: {
        id?: string;
        unlockedAt?: Date;
        name?: string;
        description?: string;
        imageUrl?: string;
        rarity?: "common" | "rare" | "epic" | "legendary" | "mythic";
    }[];
    title?: {
        id?: string;
        color?: string;
        text?: string;
        effects?: {
            gradient?: string[];
            glow?: boolean;
            animate?: boolean;
        };
    };
    frame?: {
        id?: string;
        name?: string;
        rarity?: "common" | "rare" | "epic" | "legendary" | "mythic";
        previewUrl?: string;
        cssClass?: string;
    };
    isOnline?: boolean;
    lastSeen?: Date;
    levelConfig?: {
        level?: number;
        name?: string;
        color?: string;
        minXp?: number;
        maxXp?: number;
    };
}, {
    id?: string;
    username?: string;
    level?: number;
    role?: string;
    profilePictureUrl?: string;
    bio?: string;
    displayName?: string;
    badges?: {
        id?: string;
        unlockedAt?: Date;
        name?: string;
        description?: string;
        imageUrl?: string;
        rarity?: "common" | "rare" | "epic" | "legendary" | "mythic";
    }[];
    title?: {
        id?: string;
        color?: string;
        text?: string;
        effects?: {
            gradient?: string[];
            glow?: boolean;
            animate?: boolean;
        };
    };
    frame?: {
        id?: string;
        name?: string;
        rarity?: "common" | "rare" | "epic" | "legendary" | "mythic";
        previewUrl?: string;
        cssClass?: string;
    };
    isOnline?: boolean;
    lastSeen?: Date;
    levelConfig?: {
        level?: number;
        name?: string;
        color?: string;
        minXp?: number;
        maxXp?: number;
    };
}>;
export declare const UserSchema: z.ZodObject<{
    id: z.ZodString;
    username: z.ZodString;
    email: z.ZodString;
    emailVerified: z.ZodBoolean;
    role: z.ZodString;
    level: z.ZodNumber;
    xp: z.ZodNumber;
    dgt: z.ZodNumber;
    clout: z.ZodNumber;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
    bannedUntil: z.ZodNullable<z.ZodDate>;
    profilePictureUrl: z.ZodNullable<z.ZodString>;
    bio: z.ZodNullable<z.ZodString>;
    lastActiveAt: z.ZodDate;
    settings: z.ZodObject<{
        theme: z.ZodEnum<["light", "dark", "system"]>;
        notifications: z.ZodObject<{
            email: z.ZodObject<{
                enabled: z.ZodBoolean;
                digest: z.ZodEnum<["none", "daily", "weekly"]>;
                mentions: z.ZodBoolean;
                replies: z.ZodBoolean;
                tips: z.ZodBoolean;
            }, "strip", z.ZodTypeAny, {
                mentions?: boolean;
                enabled?: boolean;
                tips?: boolean;
                digest?: "none" | "daily" | "weekly";
                replies?: boolean;
            }, {
                mentions?: boolean;
                enabled?: boolean;
                tips?: boolean;
                digest?: "none" | "daily" | "weekly";
                replies?: boolean;
            }>;
            push: z.ZodObject<{
                enabled: z.ZodBoolean;
                mentions: z.ZodBoolean;
                replies: z.ZodBoolean;
                tips: z.ZodBoolean;
            }, "strip", z.ZodTypeAny, {
                mentions?: boolean;
                enabled?: boolean;
                tips?: boolean;
                replies?: boolean;
            }, {
                mentions?: boolean;
                enabled?: boolean;
                tips?: boolean;
                replies?: boolean;
            }>;
        }, "strip", z.ZodTypeAny, {
            email?: {
                mentions?: boolean;
                enabled?: boolean;
                tips?: boolean;
                digest?: "none" | "daily" | "weekly";
                replies?: boolean;
            };
            push?: {
                mentions?: boolean;
                enabled?: boolean;
                tips?: boolean;
                replies?: boolean;
            };
        }, {
            email?: {
                mentions?: boolean;
                enabled?: boolean;
                tips?: boolean;
                digest?: "none" | "daily" | "weekly";
                replies?: boolean;
            };
            push?: {
                mentions?: boolean;
                enabled?: boolean;
                tips?: boolean;
                replies?: boolean;
            };
        }>;
        privacy: z.ZodObject<{
            profileVisibility: z.ZodEnum<["public", "friends", "private"]>;
            showLevel: z.ZodBoolean;
            showStats: z.ZodBoolean;
            allowMessages: z.ZodBoolean;
            allowFriendRequests: z.ZodBoolean;
        }, "strip", z.ZodTypeAny, {
            profileVisibility?: "public" | "friends" | "private";
            showLevel?: boolean;
            showStats?: boolean;
            allowMessages?: boolean;
            allowFriendRequests?: boolean;
        }, {
            profileVisibility?: "public" | "friends" | "private";
            showLevel?: boolean;
            showStats?: boolean;
            allowMessages?: boolean;
            allowFriendRequests?: boolean;
        }>;
        display: z.ZodObject<{
            language: z.ZodString;
            timezone: z.ZodString;
            dateFormat: z.ZodEnum<["relative", "absolute"]>;
            showSignatures: z.ZodBoolean;
            postsPerPage: z.ZodNumber;
            theme: z.ZodString;
            fontSize: z.ZodString;
            threadDisplayMode: z.ZodString;
            reducedMotion: z.ZodBoolean;
            hideNsfw: z.ZodBoolean;
            showMatureContent: z.ZodBoolean;
            showOfflineUsers: z.ZodBoolean;
        }, "strip", z.ZodTypeAny, {
            theme?: string;
            timezone?: string;
            language?: string;
            dateFormat?: "relative" | "absolute";
            showSignatures?: boolean;
            postsPerPage?: number;
            fontSize?: string;
            threadDisplayMode?: string;
            reducedMotion?: boolean;
            hideNsfw?: boolean;
            showMatureContent?: boolean;
            showOfflineUsers?: boolean;
        }, {
            theme?: string;
            timezone?: string;
            language?: string;
            dateFormat?: "relative" | "absolute";
            showSignatures?: boolean;
            postsPerPage?: number;
            fontSize?: string;
            threadDisplayMode?: string;
            reducedMotion?: boolean;
            hideNsfw?: boolean;
            showMatureContent?: boolean;
            showOfflineUsers?: boolean;
        }>;
    }, "strip", z.ZodTypeAny, {
        theme?: "light" | "dark" | "system";
        notifications?: {
            email?: {
                mentions?: boolean;
                enabled?: boolean;
                tips?: boolean;
                digest?: "none" | "daily" | "weekly";
                replies?: boolean;
            };
            push?: {
                mentions?: boolean;
                enabled?: boolean;
                tips?: boolean;
                replies?: boolean;
            };
        };
        privacy?: {
            profileVisibility?: "public" | "friends" | "private";
            showLevel?: boolean;
            showStats?: boolean;
            allowMessages?: boolean;
            allowFriendRequests?: boolean;
        };
        display?: {
            theme?: string;
            timezone?: string;
            language?: string;
            dateFormat?: "relative" | "absolute";
            showSignatures?: boolean;
            postsPerPage?: number;
            fontSize?: string;
            threadDisplayMode?: string;
            reducedMotion?: boolean;
            hideNsfw?: boolean;
            showMatureContent?: boolean;
            showOfflineUsers?: boolean;
        };
    }, {
        theme?: "light" | "dark" | "system";
        notifications?: {
            email?: {
                mentions?: boolean;
                enabled?: boolean;
                tips?: boolean;
                digest?: "none" | "daily" | "weekly";
                replies?: boolean;
            };
            push?: {
                mentions?: boolean;
                enabled?: boolean;
                tips?: boolean;
                replies?: boolean;
            };
        };
        privacy?: {
            profileVisibility?: "public" | "friends" | "private";
            showLevel?: boolean;
            showStats?: boolean;
            allowMessages?: boolean;
            allowFriendRequests?: boolean;
        };
        display?: {
            theme?: string;
            timezone?: string;
            language?: string;
            dateFormat?: "relative" | "absolute";
            showSignatures?: boolean;
            postsPerPage?: number;
            fontSize?: string;
            threadDisplayMode?: string;
            reducedMotion?: boolean;
            hideNsfw?: boolean;
            showMatureContent?: boolean;
            showOfflineUsers?: boolean;
        };
    }>;
    stats: z.ZodObject<{
        postCount: z.ZodNumber;
        threadCount: z.ZodNumber;
        tipsSent: z.ZodNumber;
        tipsReceived: z.ZodNumber;
        reputation: z.ZodNumber;
        totalXp: z.ZodNumber;
        dailyStreak: z.ZodNumber;
        bestStreak: z.ZodNumber;
        achievementCount: z.ZodNumber;
        lastPostAt: z.ZodNullable<z.ZodDate>;
        joinedAt: z.ZodDate;
    }, "strip", z.ZodTypeAny, {
        postCount?: number;
        threadCount?: number;
        tipsSent?: number;
        tipsReceived?: number;
        reputation?: number;
        dailyStreak?: number;
        bestStreak?: number;
        achievementCount?: number;
        lastPostAt?: Date;
        joinedAt?: Date;
        totalXp?: number;
    }, {
        postCount?: number;
        threadCount?: number;
        tipsSent?: number;
        tipsReceived?: number;
        reputation?: number;
        dailyStreak?: number;
        bestStreak?: number;
        achievementCount?: number;
        lastPostAt?: Date;
        joinedAt?: Date;
        totalXp?: number;
    }>;
}, "strip", z.ZodTypeAny, {
    id?: string;
    username?: string;
    level?: number;
    role?: string;
    profilePictureUrl?: string;
    bio?: string;
    email?: string;
    emailVerified?: boolean;
    xp?: number;
    dgt?: number;
    clout?: number;
    createdAt?: Date;
    updatedAt?: Date;
    bannedUntil?: Date;
    lastActiveAt?: Date;
    settings?: {
        theme?: "light" | "dark" | "system";
        notifications?: {
            email?: {
                mentions?: boolean;
                enabled?: boolean;
                tips?: boolean;
                digest?: "none" | "daily" | "weekly";
                replies?: boolean;
            };
            push?: {
                mentions?: boolean;
                enabled?: boolean;
                tips?: boolean;
                replies?: boolean;
            };
        };
        privacy?: {
            profileVisibility?: "public" | "friends" | "private";
            showLevel?: boolean;
            showStats?: boolean;
            allowMessages?: boolean;
            allowFriendRequests?: boolean;
        };
        display?: {
            theme?: string;
            timezone?: string;
            language?: string;
            dateFormat?: "relative" | "absolute";
            showSignatures?: boolean;
            postsPerPage?: number;
            fontSize?: string;
            threadDisplayMode?: string;
            reducedMotion?: boolean;
            hideNsfw?: boolean;
            showMatureContent?: boolean;
            showOfflineUsers?: boolean;
        };
    };
    stats?: {
        postCount?: number;
        threadCount?: number;
        tipsSent?: number;
        tipsReceived?: number;
        reputation?: number;
        dailyStreak?: number;
        bestStreak?: number;
        achievementCount?: number;
        lastPostAt?: Date;
        joinedAt?: Date;
        totalXp?: number;
    };
}, {
    id?: string;
    username?: string;
    level?: number;
    role?: string;
    profilePictureUrl?: string;
    bio?: string;
    email?: string;
    emailVerified?: boolean;
    xp?: number;
    dgt?: number;
    clout?: number;
    createdAt?: Date;
    updatedAt?: Date;
    bannedUntil?: Date;
    lastActiveAt?: Date;
    settings?: {
        theme?: "light" | "dark" | "system";
        notifications?: {
            email?: {
                mentions?: boolean;
                enabled?: boolean;
                tips?: boolean;
                digest?: "none" | "daily" | "weekly";
                replies?: boolean;
            };
            push?: {
                mentions?: boolean;
                enabled?: boolean;
                tips?: boolean;
                replies?: boolean;
            };
        };
        privacy?: {
            profileVisibility?: "public" | "friends" | "private";
            showLevel?: boolean;
            showStats?: boolean;
            allowMessages?: boolean;
            allowFriendRequests?: boolean;
        };
        display?: {
            theme?: string;
            timezone?: string;
            language?: string;
            dateFormat?: "relative" | "absolute";
            showSignatures?: boolean;
            postsPerPage?: number;
            fontSize?: string;
            threadDisplayMode?: string;
            reducedMotion?: boolean;
            hideNsfw?: boolean;
            showMatureContent?: boolean;
            showOfflineUsers?: boolean;
        };
    };
    stats?: {
        postCount?: number;
        threadCount?: number;
        tipsSent?: number;
        tipsReceived?: number;
        reputation?: number;
        dailyStreak?: number;
        bestStreak?: number;
        achievementCount?: number;
        lastPostAt?: Date;
        joinedAt?: Date;
        totalXp?: number;
    };
}>;
export declare const UpdateUserRequestSchema: z.ZodObject<{
    username: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    bio: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    profilePictureUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    settings: z.ZodOptional<z.ZodObject<{
        theme: z.ZodOptional<z.ZodEnum<["light", "dark", "system"]>>;
        notifications: z.ZodOptional<z.ZodObject<{
            email: z.ZodObject<{
                enabled: z.ZodBoolean;
                digest: z.ZodEnum<["none", "daily", "weekly"]>;
                mentions: z.ZodBoolean;
                replies: z.ZodBoolean;
                tips: z.ZodBoolean;
            }, "strip", z.ZodTypeAny, {
                mentions?: boolean;
                enabled?: boolean;
                tips?: boolean;
                digest?: "none" | "daily" | "weekly";
                replies?: boolean;
            }, {
                mentions?: boolean;
                enabled?: boolean;
                tips?: boolean;
                digest?: "none" | "daily" | "weekly";
                replies?: boolean;
            }>;
            push: z.ZodObject<{
                enabled: z.ZodBoolean;
                mentions: z.ZodBoolean;
                replies: z.ZodBoolean;
                tips: z.ZodBoolean;
            }, "strip", z.ZodTypeAny, {
                mentions?: boolean;
                enabled?: boolean;
                tips?: boolean;
                replies?: boolean;
            }, {
                mentions?: boolean;
                enabled?: boolean;
                tips?: boolean;
                replies?: boolean;
            }>;
        }, "strip", z.ZodTypeAny, {
            email?: {
                mentions?: boolean;
                enabled?: boolean;
                tips?: boolean;
                digest?: "none" | "daily" | "weekly";
                replies?: boolean;
            };
            push?: {
                mentions?: boolean;
                enabled?: boolean;
                tips?: boolean;
                replies?: boolean;
            };
        }, {
            email?: {
                mentions?: boolean;
                enabled?: boolean;
                tips?: boolean;
                digest?: "none" | "daily" | "weekly";
                replies?: boolean;
            };
            push?: {
                mentions?: boolean;
                enabled?: boolean;
                tips?: boolean;
                replies?: boolean;
            };
        }>>;
        privacy: z.ZodOptional<z.ZodObject<{
            profileVisibility: z.ZodEnum<["public", "friends", "private"]>;
            showLevel: z.ZodBoolean;
            showStats: z.ZodBoolean;
            allowMessages: z.ZodBoolean;
            allowFriendRequests: z.ZodBoolean;
        }, "strip", z.ZodTypeAny, {
            profileVisibility?: "public" | "friends" | "private";
            showLevel?: boolean;
            showStats?: boolean;
            allowMessages?: boolean;
            allowFriendRequests?: boolean;
        }, {
            profileVisibility?: "public" | "friends" | "private";
            showLevel?: boolean;
            showStats?: boolean;
            allowMessages?: boolean;
            allowFriendRequests?: boolean;
        }>>;
        display: z.ZodOptional<z.ZodObject<{
            language: z.ZodString;
            timezone: z.ZodString;
            dateFormat: z.ZodEnum<["relative", "absolute"]>;
            showSignatures: z.ZodBoolean;
            postsPerPage: z.ZodNumber;
            theme: z.ZodString;
            fontSize: z.ZodString;
            threadDisplayMode: z.ZodString;
            reducedMotion: z.ZodBoolean;
            hideNsfw: z.ZodBoolean;
            showMatureContent: z.ZodBoolean;
            showOfflineUsers: z.ZodBoolean;
        }, "strip", z.ZodTypeAny, {
            theme?: string;
            timezone?: string;
            language?: string;
            dateFormat?: "relative" | "absolute";
            showSignatures?: boolean;
            postsPerPage?: number;
            fontSize?: string;
            threadDisplayMode?: string;
            reducedMotion?: boolean;
            hideNsfw?: boolean;
            showMatureContent?: boolean;
            showOfflineUsers?: boolean;
        }, {
            theme?: string;
            timezone?: string;
            language?: string;
            dateFormat?: "relative" | "absolute";
            showSignatures?: boolean;
            postsPerPage?: number;
            fontSize?: string;
            threadDisplayMode?: string;
            reducedMotion?: boolean;
            hideNsfw?: boolean;
            showMatureContent?: boolean;
            showOfflineUsers?: boolean;
        }>>;
    }, "strip", z.ZodTypeAny, {
        theme?: "light" | "dark" | "system";
        notifications?: {
            email?: {
                mentions?: boolean;
                enabled?: boolean;
                tips?: boolean;
                digest?: "none" | "daily" | "weekly";
                replies?: boolean;
            };
            push?: {
                mentions?: boolean;
                enabled?: boolean;
                tips?: boolean;
                replies?: boolean;
            };
        };
        privacy?: {
            profileVisibility?: "public" | "friends" | "private";
            showLevel?: boolean;
            showStats?: boolean;
            allowMessages?: boolean;
            allowFriendRequests?: boolean;
        };
        display?: {
            theme?: string;
            timezone?: string;
            language?: string;
            dateFormat?: "relative" | "absolute";
            showSignatures?: boolean;
            postsPerPage?: number;
            fontSize?: string;
            threadDisplayMode?: string;
            reducedMotion?: boolean;
            hideNsfw?: boolean;
            showMatureContent?: boolean;
            showOfflineUsers?: boolean;
        };
    }, {
        theme?: "light" | "dark" | "system";
        notifications?: {
            email?: {
                mentions?: boolean;
                enabled?: boolean;
                tips?: boolean;
                digest?: "none" | "daily" | "weekly";
                replies?: boolean;
            };
            push?: {
                mentions?: boolean;
                enabled?: boolean;
                tips?: boolean;
                replies?: boolean;
            };
        };
        privacy?: {
            profileVisibility?: "public" | "friends" | "private";
            showLevel?: boolean;
            showStats?: boolean;
            allowMessages?: boolean;
            allowFriendRequests?: boolean;
        };
        display?: {
            theme?: string;
            timezone?: string;
            language?: string;
            dateFormat?: "relative" | "absolute";
            showSignatures?: boolean;
            postsPerPage?: number;
            fontSize?: string;
            threadDisplayMode?: string;
            reducedMotion?: boolean;
            hideNsfw?: boolean;
            showMatureContent?: boolean;
            showOfflineUsers?: boolean;
        };
    }>>;
}, "strip", z.ZodTypeAny, {
    username?: string;
    profilePictureUrl?: string;
    bio?: string;
    email?: string;
    settings?: {
        theme?: "light" | "dark" | "system";
        notifications?: {
            email?: {
                mentions?: boolean;
                enabled?: boolean;
                tips?: boolean;
                digest?: "none" | "daily" | "weekly";
                replies?: boolean;
            };
            push?: {
                mentions?: boolean;
                enabled?: boolean;
                tips?: boolean;
                replies?: boolean;
            };
        };
        privacy?: {
            profileVisibility?: "public" | "friends" | "private";
            showLevel?: boolean;
            showStats?: boolean;
            allowMessages?: boolean;
            allowFriendRequests?: boolean;
        };
        display?: {
            theme?: string;
            timezone?: string;
            language?: string;
            dateFormat?: "relative" | "absolute";
            showSignatures?: boolean;
            postsPerPage?: number;
            fontSize?: string;
            threadDisplayMode?: string;
            reducedMotion?: boolean;
            hideNsfw?: boolean;
            showMatureContent?: boolean;
            showOfflineUsers?: boolean;
        };
    };
}, {
    username?: string;
    profilePictureUrl?: string;
    bio?: string;
    email?: string;
    settings?: {
        theme?: "light" | "dark" | "system";
        notifications?: {
            email?: {
                mentions?: boolean;
                enabled?: boolean;
                tips?: boolean;
                digest?: "none" | "daily" | "weekly";
                replies?: boolean;
            };
            push?: {
                mentions?: boolean;
                enabled?: boolean;
                tips?: boolean;
                replies?: boolean;
            };
        };
        privacy?: {
            profileVisibility?: "public" | "friends" | "private";
            showLevel?: boolean;
            showStats?: boolean;
            allowMessages?: boolean;
            allowFriendRequests?: boolean;
        };
        display?: {
            theme?: string;
            timezone?: string;
            language?: string;
            dateFormat?: "relative" | "absolute";
            showSignatures?: boolean;
            postsPerPage?: number;
            fontSize?: string;
            threadDisplayMode?: string;
            reducedMotion?: boolean;
            hideNsfw?: boolean;
            showMatureContent?: boolean;
            showOfflineUsers?: boolean;
        };
    };
}>;
export declare const CreateUserRequestSchema: z.ZodObject<{
    username: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    referralCode: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    username?: string;
    email?: string;
    password?: string;
    referralCode?: string;
}, {
    username?: string;
    email?: string;
    password?: string;
    referralCode?: string;
}>;
export declare const UserSearchParamsSchema: z.ZodObject<{
    query: z.ZodOptional<z.ZodString>;
    role: z.ZodOptional<z.ZodString>;
    minLevel: z.ZodOptional<z.ZodNumber>;
    maxLevel: z.ZodOptional<z.ZodNumber>;
    isOnline: z.ZodOptional<z.ZodBoolean>;
    sortBy: z.ZodOptional<z.ZodEnum<["username", "level", "xp", "createdAt", "lastActiveAt"]>>;
    sortOrder: z.ZodOptional<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    role?: string;
    minLevel?: number;
    sortBy?: "username" | "level" | "xp" | "createdAt" | "lastActiveAt";
    sortOrder?: "asc" | "desc";
    query?: string;
    maxLevel?: number;
    isOnline?: boolean;
}, {
    role?: string;
    minLevel?: number;
    sortBy?: "username" | "level" | "xp" | "createdAt" | "lastActiveAt";
    sortOrder?: "asc" | "desc";
    query?: string;
    maxLevel?: number;
    isOnline?: boolean;
}>;
export type LevelConfig = z.infer<typeof LevelConfigSchema>;
export type DisplaySettings = z.infer<typeof DisplaySettingsSchema>;
export type NotificationSettings = z.infer<typeof NotificationSettingsSchema>;
export type PrivacySettings = z.infer<typeof PrivacySettingsSchema>;
export type UserSettings = z.infer<typeof UserSettingsSchema>;
export type UserStats = z.infer<typeof UserStatsSchema>;
export type UserBadge = z.infer<typeof UserBadgeSchema>;
export type UserTitle = z.infer<typeof UserTitleSchema>;
export type UserFrame = z.infer<typeof UserFrameSchema>;
export type UserProfile = z.infer<typeof UserProfileSchema>;
export type User = z.infer<typeof UserSchema>;
export type UpdateUserRequest = z.infer<typeof UpdateUserRequestSchema>;
export type CreateUserRequest = z.infer<typeof CreateUserRequestSchema>;
export type UserSearchParams = z.infer<typeof UserSearchParamsSchema>;
