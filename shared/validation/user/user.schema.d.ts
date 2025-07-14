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
    color?: string;
    name?: string;
    level?: number;
    minXp?: number;
    maxXp?: number;
}, {
    color?: string;
    name?: string;
    level?: number;
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
    fontSize?: string;
    theme?: string;
    showSignatures?: boolean;
    postsPerPage?: number;
    language?: string;
    timezone?: string;
    threadDisplayMode?: string;
    reducedMotion?: boolean;
    hideNsfw?: boolean;
    showMatureContent?: boolean;
    showOfflineUsers?: boolean;
    dateFormat?: "relative" | "absolute";
}, {
    fontSize?: string;
    theme?: string;
    showSignatures?: boolean;
    postsPerPage?: number;
    language?: string;
    timezone?: string;
    threadDisplayMode?: string;
    reducedMotion?: boolean;
    hideNsfw?: boolean;
    showMatureContent?: boolean;
    showOfflineUsers?: boolean;
    dateFormat?: "relative" | "absolute";
}>;
export declare const NotificationSettingsSchema: z.ZodObject<{
    email: z.ZodObject<{
        enabled: z.ZodBoolean;
        digest: z.ZodEnum<["none", "daily", "weekly"]>;
        mentions: z.ZodBoolean;
        replies: z.ZodBoolean;
        tips: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        enabled?: boolean;
        mentions?: boolean;
        replies?: boolean;
        tips?: boolean;
        digest?: "none" | "weekly" | "daily";
    }, {
        enabled?: boolean;
        mentions?: boolean;
        replies?: boolean;
        tips?: boolean;
        digest?: "none" | "weekly" | "daily";
    }>;
    push: z.ZodObject<{
        enabled: z.ZodBoolean;
        mentions: z.ZodBoolean;
        replies: z.ZodBoolean;
        tips: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        enabled?: boolean;
        mentions?: boolean;
        replies?: boolean;
        tips?: boolean;
    }, {
        enabled?: boolean;
        mentions?: boolean;
        replies?: boolean;
        tips?: boolean;
    }>;
}, "strip", z.ZodTypeAny, {
    email?: {
        enabled?: boolean;
        mentions?: boolean;
        replies?: boolean;
        tips?: boolean;
        digest?: "none" | "weekly" | "daily";
    };
    push?: {
        enabled?: boolean;
        mentions?: boolean;
        replies?: boolean;
        tips?: boolean;
    };
}, {
    email?: {
        enabled?: boolean;
        mentions?: boolean;
        replies?: boolean;
        tips?: boolean;
        digest?: "none" | "weekly" | "daily";
    };
    push?: {
        enabled?: boolean;
        mentions?: boolean;
        replies?: boolean;
        tips?: boolean;
    };
}>;
export declare const PrivacySettingsSchema: z.ZodObject<{
    profileVisibility: z.ZodEnum<["public", "friends", "private"]>;
    showLevel: z.ZodBoolean;
    showStats: z.ZodBoolean;
    allowMessages: z.ZodBoolean;
    allowFriendRequests: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    showStats?: boolean;
    showLevel?: boolean;
    allowFriendRequests?: boolean;
    profileVisibility?: "friends" | "public" | "private";
    allowMessages?: boolean;
}, {
    showStats?: boolean;
    showLevel?: boolean;
    allowFriendRequests?: boolean;
    profileVisibility?: "friends" | "public" | "private";
    allowMessages?: boolean;
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
            enabled?: boolean;
            mentions?: boolean;
            replies?: boolean;
            tips?: boolean;
            digest?: "none" | "weekly" | "daily";
        }, {
            enabled?: boolean;
            mentions?: boolean;
            replies?: boolean;
            tips?: boolean;
            digest?: "none" | "weekly" | "daily";
        }>;
        push: z.ZodObject<{
            enabled: z.ZodBoolean;
            mentions: z.ZodBoolean;
            replies: z.ZodBoolean;
            tips: z.ZodBoolean;
        }, "strip", z.ZodTypeAny, {
            enabled?: boolean;
            mentions?: boolean;
            replies?: boolean;
            tips?: boolean;
        }, {
            enabled?: boolean;
            mentions?: boolean;
            replies?: boolean;
            tips?: boolean;
        }>;
    }, "strip", z.ZodTypeAny, {
        email?: {
            enabled?: boolean;
            mentions?: boolean;
            replies?: boolean;
            tips?: boolean;
            digest?: "none" | "weekly" | "daily";
        };
        push?: {
            enabled?: boolean;
            mentions?: boolean;
            replies?: boolean;
            tips?: boolean;
        };
    }, {
        email?: {
            enabled?: boolean;
            mentions?: boolean;
            replies?: boolean;
            tips?: boolean;
            digest?: "none" | "weekly" | "daily";
        };
        push?: {
            enabled?: boolean;
            mentions?: boolean;
            replies?: boolean;
            tips?: boolean;
        };
    }>;
    privacy: z.ZodObject<{
        profileVisibility: z.ZodEnum<["public", "friends", "private"]>;
        showLevel: z.ZodBoolean;
        showStats: z.ZodBoolean;
        allowMessages: z.ZodBoolean;
        allowFriendRequests: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        showStats?: boolean;
        showLevel?: boolean;
        allowFriendRequests?: boolean;
        profileVisibility?: "friends" | "public" | "private";
        allowMessages?: boolean;
    }, {
        showStats?: boolean;
        showLevel?: boolean;
        allowFriendRequests?: boolean;
        profileVisibility?: "friends" | "public" | "private";
        allowMessages?: boolean;
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
        fontSize?: string;
        theme?: string;
        showSignatures?: boolean;
        postsPerPage?: number;
        language?: string;
        timezone?: string;
        threadDisplayMode?: string;
        reducedMotion?: boolean;
        hideNsfw?: boolean;
        showMatureContent?: boolean;
        showOfflineUsers?: boolean;
        dateFormat?: "relative" | "absolute";
    }, {
        fontSize?: string;
        theme?: string;
        showSignatures?: boolean;
        postsPerPage?: number;
        language?: string;
        timezone?: string;
        threadDisplayMode?: string;
        reducedMotion?: boolean;
        hideNsfw?: boolean;
        showMatureContent?: boolean;
        showOfflineUsers?: boolean;
        dateFormat?: "relative" | "absolute";
    }>;
}, "strip", z.ZodTypeAny, {
    display?: {
        fontSize?: string;
        theme?: string;
        showSignatures?: boolean;
        postsPerPage?: number;
        language?: string;
        timezone?: string;
        threadDisplayMode?: string;
        reducedMotion?: boolean;
        hideNsfw?: boolean;
        showMatureContent?: boolean;
        showOfflineUsers?: boolean;
        dateFormat?: "relative" | "absolute";
    };
    theme?: "system" | "dark" | "light";
    notifications?: {
        email?: {
            enabled?: boolean;
            mentions?: boolean;
            replies?: boolean;
            tips?: boolean;
            digest?: "none" | "weekly" | "daily";
        };
        push?: {
            enabled?: boolean;
            mentions?: boolean;
            replies?: boolean;
            tips?: boolean;
        };
    };
    privacy?: {
        showStats?: boolean;
        showLevel?: boolean;
        allowFriendRequests?: boolean;
        profileVisibility?: "friends" | "public" | "private";
        allowMessages?: boolean;
    };
}, {
    display?: {
        fontSize?: string;
        theme?: string;
        showSignatures?: boolean;
        postsPerPage?: number;
        language?: string;
        timezone?: string;
        threadDisplayMode?: string;
        reducedMotion?: boolean;
        hideNsfw?: boolean;
        showMatureContent?: boolean;
        showOfflineUsers?: boolean;
        dateFormat?: "relative" | "absolute";
    };
    theme?: "system" | "dark" | "light";
    notifications?: {
        email?: {
            enabled?: boolean;
            mentions?: boolean;
            replies?: boolean;
            tips?: boolean;
            digest?: "none" | "weekly" | "daily";
        };
        push?: {
            enabled?: boolean;
            mentions?: boolean;
            replies?: boolean;
            tips?: boolean;
        };
    };
    privacy?: {
        showStats?: boolean;
        showLevel?: boolean;
        allowFriendRequests?: boolean;
        profileVisibility?: "friends" | "public" | "private";
        allowMessages?: boolean;
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
    reputation?: number;
    postCount?: number;
    threadCount?: number;
    joinedAt?: Date;
    lastPostAt?: Date;
    tipsSent?: number;
    tipsReceived?: number;
    totalXp?: number;
    dailyStreak?: number;
    bestStreak?: number;
    achievementCount?: number;
}, {
    reputation?: number;
    postCount?: number;
    threadCount?: number;
    joinedAt?: Date;
    lastPostAt?: Date;
    tipsSent?: number;
    tipsReceived?: number;
    totalXp?: number;
    dailyStreak?: number;
    bestStreak?: number;
    achievementCount?: number;
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
    name?: string;
    description?: string;
    rarity?: "common" | "legendary" | "mythic" | "epic" | "rare";
    imageUrl?: string;
    unlockedAt?: Date;
}, {
    id?: string;
    name?: string;
    description?: string;
    rarity?: "common" | "legendary" | "mythic" | "epic" | "rare";
    imageUrl?: string;
    unlockedAt?: Date;
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
        animate?: boolean;
        gradient?: string[];
        glow?: boolean;
    }, {
        animate?: boolean;
        gradient?: string[];
        glow?: boolean;
    }>>;
}, "strip", z.ZodTypeAny, {
    text?: string;
    id?: string;
    color?: string;
    effects?: {
        animate?: boolean;
        gradient?: string[];
        glow?: boolean;
    };
}, {
    text?: string;
    id?: string;
    color?: string;
    effects?: {
        animate?: boolean;
        gradient?: string[];
        glow?: boolean;
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
    rarity?: "common" | "legendary" | "mythic" | "epic" | "rare";
    previewUrl?: string;
    cssClass?: string;
}, {
    id?: string;
    name?: string;
    rarity?: "common" | "legendary" | "mythic" | "epic" | "rare";
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
        name?: string;
        description?: string;
        rarity?: "common" | "legendary" | "mythic" | "epic" | "rare";
        imageUrl?: string;
        unlockedAt?: Date;
    }, {
        id?: string;
        name?: string;
        description?: string;
        rarity?: "common" | "legendary" | "mythic" | "epic" | "rare";
        imageUrl?: string;
        unlockedAt?: Date;
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
            animate?: boolean;
            gradient?: string[];
            glow?: boolean;
        }, {
            animate?: boolean;
            gradient?: string[];
            glow?: boolean;
        }>>;
    }, "strip", z.ZodTypeAny, {
        text?: string;
        id?: string;
        color?: string;
        effects?: {
            animate?: boolean;
            gradient?: string[];
            glow?: boolean;
        };
    }, {
        text?: string;
        id?: string;
        color?: string;
        effects?: {
            animate?: boolean;
            gradient?: string[];
            glow?: boolean;
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
        rarity?: "common" | "legendary" | "mythic" | "epic" | "rare";
        previewUrl?: string;
        cssClass?: string;
    }, {
        id?: string;
        name?: string;
        rarity?: "common" | "legendary" | "mythic" | "epic" | "rare";
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
        color?: string;
        name?: string;
        level?: number;
        minXp?: number;
        maxXp?: number;
    }, {
        color?: string;
        name?: string;
        level?: number;
        minXp?: number;
        maxXp?: number;
    }>>;
}, "strip", z.ZodTypeAny, {
    displayName?: string;
    title?: {
        text?: string;
        id?: string;
        color?: string;
        effects?: {
            animate?: boolean;
            gradient?: string[];
            glow?: boolean;
        };
    };
    id?: string;
    role?: string;
    level?: number;
    frame?: {
        id?: string;
        name?: string;
        rarity?: "common" | "legendary" | "mythic" | "epic" | "rare";
        previewUrl?: string;
        cssClass?: string;
    };
    isOnline?: boolean;
    username?: string;
    profilePictureUrl?: string;
    bio?: string;
    levelConfig?: {
        color?: string;
        name?: string;
        level?: number;
        minXp?: number;
        maxXp?: number;
    };
    badges?: {
        id?: string;
        name?: string;
        description?: string;
        rarity?: "common" | "legendary" | "mythic" | "epic" | "rare";
        imageUrl?: string;
        unlockedAt?: Date;
    }[];
    lastSeen?: Date;
}, {
    displayName?: string;
    title?: {
        text?: string;
        id?: string;
        color?: string;
        effects?: {
            animate?: boolean;
            gradient?: string[];
            glow?: boolean;
        };
    };
    id?: string;
    role?: string;
    level?: number;
    frame?: {
        id?: string;
        name?: string;
        rarity?: "common" | "legendary" | "mythic" | "epic" | "rare";
        previewUrl?: string;
        cssClass?: string;
    };
    isOnline?: boolean;
    username?: string;
    profilePictureUrl?: string;
    bio?: string;
    levelConfig?: {
        color?: string;
        name?: string;
        level?: number;
        minXp?: number;
        maxXp?: number;
    };
    badges?: {
        id?: string;
        name?: string;
        description?: string;
        rarity?: "common" | "legendary" | "mythic" | "epic" | "rare";
        imageUrl?: string;
        unlockedAt?: Date;
    }[];
    lastSeen?: Date;
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
                enabled?: boolean;
                mentions?: boolean;
                replies?: boolean;
                tips?: boolean;
                digest?: "none" | "weekly" | "daily";
            }, {
                enabled?: boolean;
                mentions?: boolean;
                replies?: boolean;
                tips?: boolean;
                digest?: "none" | "weekly" | "daily";
            }>;
            push: z.ZodObject<{
                enabled: z.ZodBoolean;
                mentions: z.ZodBoolean;
                replies: z.ZodBoolean;
                tips: z.ZodBoolean;
            }, "strip", z.ZodTypeAny, {
                enabled?: boolean;
                mentions?: boolean;
                replies?: boolean;
                tips?: boolean;
            }, {
                enabled?: boolean;
                mentions?: boolean;
                replies?: boolean;
                tips?: boolean;
            }>;
        }, "strip", z.ZodTypeAny, {
            email?: {
                enabled?: boolean;
                mentions?: boolean;
                replies?: boolean;
                tips?: boolean;
                digest?: "none" | "weekly" | "daily";
            };
            push?: {
                enabled?: boolean;
                mentions?: boolean;
                replies?: boolean;
                tips?: boolean;
            };
        }, {
            email?: {
                enabled?: boolean;
                mentions?: boolean;
                replies?: boolean;
                tips?: boolean;
                digest?: "none" | "weekly" | "daily";
            };
            push?: {
                enabled?: boolean;
                mentions?: boolean;
                replies?: boolean;
                tips?: boolean;
            };
        }>;
        privacy: z.ZodObject<{
            profileVisibility: z.ZodEnum<["public", "friends", "private"]>;
            showLevel: z.ZodBoolean;
            showStats: z.ZodBoolean;
            allowMessages: z.ZodBoolean;
            allowFriendRequests: z.ZodBoolean;
        }, "strip", z.ZodTypeAny, {
            showStats?: boolean;
            showLevel?: boolean;
            allowFriendRequests?: boolean;
            profileVisibility?: "friends" | "public" | "private";
            allowMessages?: boolean;
        }, {
            showStats?: boolean;
            showLevel?: boolean;
            allowFriendRequests?: boolean;
            profileVisibility?: "friends" | "public" | "private";
            allowMessages?: boolean;
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
            fontSize?: string;
            theme?: string;
            showSignatures?: boolean;
            postsPerPage?: number;
            language?: string;
            timezone?: string;
            threadDisplayMode?: string;
            reducedMotion?: boolean;
            hideNsfw?: boolean;
            showMatureContent?: boolean;
            showOfflineUsers?: boolean;
            dateFormat?: "relative" | "absolute";
        }, {
            fontSize?: string;
            theme?: string;
            showSignatures?: boolean;
            postsPerPage?: number;
            language?: string;
            timezone?: string;
            threadDisplayMode?: string;
            reducedMotion?: boolean;
            hideNsfw?: boolean;
            showMatureContent?: boolean;
            showOfflineUsers?: boolean;
            dateFormat?: "relative" | "absolute";
        }>;
    }, "strip", z.ZodTypeAny, {
        display?: {
            fontSize?: string;
            theme?: string;
            showSignatures?: boolean;
            postsPerPage?: number;
            language?: string;
            timezone?: string;
            threadDisplayMode?: string;
            reducedMotion?: boolean;
            hideNsfw?: boolean;
            showMatureContent?: boolean;
            showOfflineUsers?: boolean;
            dateFormat?: "relative" | "absolute";
        };
        theme?: "system" | "dark" | "light";
        notifications?: {
            email?: {
                enabled?: boolean;
                mentions?: boolean;
                replies?: boolean;
                tips?: boolean;
                digest?: "none" | "weekly" | "daily";
            };
            push?: {
                enabled?: boolean;
                mentions?: boolean;
                replies?: boolean;
                tips?: boolean;
            };
        };
        privacy?: {
            showStats?: boolean;
            showLevel?: boolean;
            allowFriendRequests?: boolean;
            profileVisibility?: "friends" | "public" | "private";
            allowMessages?: boolean;
        };
    }, {
        display?: {
            fontSize?: string;
            theme?: string;
            showSignatures?: boolean;
            postsPerPage?: number;
            language?: string;
            timezone?: string;
            threadDisplayMode?: string;
            reducedMotion?: boolean;
            hideNsfw?: boolean;
            showMatureContent?: boolean;
            showOfflineUsers?: boolean;
            dateFormat?: "relative" | "absolute";
        };
        theme?: "system" | "dark" | "light";
        notifications?: {
            email?: {
                enabled?: boolean;
                mentions?: boolean;
                replies?: boolean;
                tips?: boolean;
                digest?: "none" | "weekly" | "daily";
            };
            push?: {
                enabled?: boolean;
                mentions?: boolean;
                replies?: boolean;
                tips?: boolean;
            };
        };
        privacy?: {
            showStats?: boolean;
            showLevel?: boolean;
            allowFriendRequests?: boolean;
            profileVisibility?: "friends" | "public" | "private";
            allowMessages?: boolean;
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
        reputation?: number;
        postCount?: number;
        threadCount?: number;
        joinedAt?: Date;
        lastPostAt?: Date;
        tipsSent?: number;
        tipsReceived?: number;
        totalXp?: number;
        dailyStreak?: number;
        bestStreak?: number;
        achievementCount?: number;
    }, {
        reputation?: number;
        postCount?: number;
        threadCount?: number;
        joinedAt?: Date;
        lastPostAt?: Date;
        tipsSent?: number;
        tipsReceived?: number;
        totalXp?: number;
        dailyStreak?: number;
        bestStreak?: number;
        achievementCount?: number;
    }>;
}, "strip", z.ZodTypeAny, {
    id?: string;
    role?: string;
    stats?: {
        reputation?: number;
        postCount?: number;
        threadCount?: number;
        joinedAt?: Date;
        lastPostAt?: Date;
        tipsSent?: number;
        tipsReceived?: number;
        totalXp?: number;
        dailyStreak?: number;
        bestStreak?: number;
        achievementCount?: number;
    };
    email?: string;
    level?: number;
    username?: string;
    createdAt?: Date;
    emailVerified?: boolean;
    xp?: number;
    dgt?: number;
    clout?: number;
    updatedAt?: Date;
    bannedUntil?: Date;
    profilePictureUrl?: string;
    bio?: string;
    lastActiveAt?: Date;
    settings?: {
        display?: {
            fontSize?: string;
            theme?: string;
            showSignatures?: boolean;
            postsPerPage?: number;
            language?: string;
            timezone?: string;
            threadDisplayMode?: string;
            reducedMotion?: boolean;
            hideNsfw?: boolean;
            showMatureContent?: boolean;
            showOfflineUsers?: boolean;
            dateFormat?: "relative" | "absolute";
        };
        theme?: "system" | "dark" | "light";
        notifications?: {
            email?: {
                enabled?: boolean;
                mentions?: boolean;
                replies?: boolean;
                tips?: boolean;
                digest?: "none" | "weekly" | "daily";
            };
            push?: {
                enabled?: boolean;
                mentions?: boolean;
                replies?: boolean;
                tips?: boolean;
            };
        };
        privacy?: {
            showStats?: boolean;
            showLevel?: boolean;
            allowFriendRequests?: boolean;
            profileVisibility?: "friends" | "public" | "private";
            allowMessages?: boolean;
        };
    };
}, {
    id?: string;
    role?: string;
    stats?: {
        reputation?: number;
        postCount?: number;
        threadCount?: number;
        joinedAt?: Date;
        lastPostAt?: Date;
        tipsSent?: number;
        tipsReceived?: number;
        totalXp?: number;
        dailyStreak?: number;
        bestStreak?: number;
        achievementCount?: number;
    };
    email?: string;
    level?: number;
    username?: string;
    createdAt?: Date;
    emailVerified?: boolean;
    xp?: number;
    dgt?: number;
    clout?: number;
    updatedAt?: Date;
    bannedUntil?: Date;
    profilePictureUrl?: string;
    bio?: string;
    lastActiveAt?: Date;
    settings?: {
        display?: {
            fontSize?: string;
            theme?: string;
            showSignatures?: boolean;
            postsPerPage?: number;
            language?: string;
            timezone?: string;
            threadDisplayMode?: string;
            reducedMotion?: boolean;
            hideNsfw?: boolean;
            showMatureContent?: boolean;
            showOfflineUsers?: boolean;
            dateFormat?: "relative" | "absolute";
        };
        theme?: "system" | "dark" | "light";
        notifications?: {
            email?: {
                enabled?: boolean;
                mentions?: boolean;
                replies?: boolean;
                tips?: boolean;
                digest?: "none" | "weekly" | "daily";
            };
            push?: {
                enabled?: boolean;
                mentions?: boolean;
                replies?: boolean;
                tips?: boolean;
            };
        };
        privacy?: {
            showStats?: boolean;
            showLevel?: boolean;
            allowFriendRequests?: boolean;
            profileVisibility?: "friends" | "public" | "private";
            allowMessages?: boolean;
        };
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
                enabled?: boolean;
                mentions?: boolean;
                replies?: boolean;
                tips?: boolean;
                digest?: "none" | "weekly" | "daily";
            }, {
                enabled?: boolean;
                mentions?: boolean;
                replies?: boolean;
                tips?: boolean;
                digest?: "none" | "weekly" | "daily";
            }>;
            push: z.ZodObject<{
                enabled: z.ZodBoolean;
                mentions: z.ZodBoolean;
                replies: z.ZodBoolean;
                tips: z.ZodBoolean;
            }, "strip", z.ZodTypeAny, {
                enabled?: boolean;
                mentions?: boolean;
                replies?: boolean;
                tips?: boolean;
            }, {
                enabled?: boolean;
                mentions?: boolean;
                replies?: boolean;
                tips?: boolean;
            }>;
        }, "strip", z.ZodTypeAny, {
            email?: {
                enabled?: boolean;
                mentions?: boolean;
                replies?: boolean;
                tips?: boolean;
                digest?: "none" | "weekly" | "daily";
            };
            push?: {
                enabled?: boolean;
                mentions?: boolean;
                replies?: boolean;
                tips?: boolean;
            };
        }, {
            email?: {
                enabled?: boolean;
                mentions?: boolean;
                replies?: boolean;
                tips?: boolean;
                digest?: "none" | "weekly" | "daily";
            };
            push?: {
                enabled?: boolean;
                mentions?: boolean;
                replies?: boolean;
                tips?: boolean;
            };
        }>>;
        privacy: z.ZodOptional<z.ZodObject<{
            profileVisibility: z.ZodEnum<["public", "friends", "private"]>;
            showLevel: z.ZodBoolean;
            showStats: z.ZodBoolean;
            allowMessages: z.ZodBoolean;
            allowFriendRequests: z.ZodBoolean;
        }, "strip", z.ZodTypeAny, {
            showStats?: boolean;
            showLevel?: boolean;
            allowFriendRequests?: boolean;
            profileVisibility?: "friends" | "public" | "private";
            allowMessages?: boolean;
        }, {
            showStats?: boolean;
            showLevel?: boolean;
            allowFriendRequests?: boolean;
            profileVisibility?: "friends" | "public" | "private";
            allowMessages?: boolean;
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
            fontSize?: string;
            theme?: string;
            showSignatures?: boolean;
            postsPerPage?: number;
            language?: string;
            timezone?: string;
            threadDisplayMode?: string;
            reducedMotion?: boolean;
            hideNsfw?: boolean;
            showMatureContent?: boolean;
            showOfflineUsers?: boolean;
            dateFormat?: "relative" | "absolute";
        }, {
            fontSize?: string;
            theme?: string;
            showSignatures?: boolean;
            postsPerPage?: number;
            language?: string;
            timezone?: string;
            threadDisplayMode?: string;
            reducedMotion?: boolean;
            hideNsfw?: boolean;
            showMatureContent?: boolean;
            showOfflineUsers?: boolean;
            dateFormat?: "relative" | "absolute";
        }>>;
    }, "strip", z.ZodTypeAny, {
        display?: {
            fontSize?: string;
            theme?: string;
            showSignatures?: boolean;
            postsPerPage?: number;
            language?: string;
            timezone?: string;
            threadDisplayMode?: string;
            reducedMotion?: boolean;
            hideNsfw?: boolean;
            showMatureContent?: boolean;
            showOfflineUsers?: boolean;
            dateFormat?: "relative" | "absolute";
        };
        theme?: "system" | "dark" | "light";
        notifications?: {
            email?: {
                enabled?: boolean;
                mentions?: boolean;
                replies?: boolean;
                tips?: boolean;
                digest?: "none" | "weekly" | "daily";
            };
            push?: {
                enabled?: boolean;
                mentions?: boolean;
                replies?: boolean;
                tips?: boolean;
            };
        };
        privacy?: {
            showStats?: boolean;
            showLevel?: boolean;
            allowFriendRequests?: boolean;
            profileVisibility?: "friends" | "public" | "private";
            allowMessages?: boolean;
        };
    }, {
        display?: {
            fontSize?: string;
            theme?: string;
            showSignatures?: boolean;
            postsPerPage?: number;
            language?: string;
            timezone?: string;
            threadDisplayMode?: string;
            reducedMotion?: boolean;
            hideNsfw?: boolean;
            showMatureContent?: boolean;
            showOfflineUsers?: boolean;
            dateFormat?: "relative" | "absolute";
        };
        theme?: "system" | "dark" | "light";
        notifications?: {
            email?: {
                enabled?: boolean;
                mentions?: boolean;
                replies?: boolean;
                tips?: boolean;
                digest?: "none" | "weekly" | "daily";
            };
            push?: {
                enabled?: boolean;
                mentions?: boolean;
                replies?: boolean;
                tips?: boolean;
            };
        };
        privacy?: {
            showStats?: boolean;
            showLevel?: boolean;
            allowFriendRequests?: boolean;
            profileVisibility?: "friends" | "public" | "private";
            allowMessages?: boolean;
        };
    }>>;
}, "strip", z.ZodTypeAny, {
    email?: string;
    username?: string;
    profilePictureUrl?: string;
    bio?: string;
    settings?: {
        display?: {
            fontSize?: string;
            theme?: string;
            showSignatures?: boolean;
            postsPerPage?: number;
            language?: string;
            timezone?: string;
            threadDisplayMode?: string;
            reducedMotion?: boolean;
            hideNsfw?: boolean;
            showMatureContent?: boolean;
            showOfflineUsers?: boolean;
            dateFormat?: "relative" | "absolute";
        };
        theme?: "system" | "dark" | "light";
        notifications?: {
            email?: {
                enabled?: boolean;
                mentions?: boolean;
                replies?: boolean;
                tips?: boolean;
                digest?: "none" | "weekly" | "daily";
            };
            push?: {
                enabled?: boolean;
                mentions?: boolean;
                replies?: boolean;
                tips?: boolean;
            };
        };
        privacy?: {
            showStats?: boolean;
            showLevel?: boolean;
            allowFriendRequests?: boolean;
            profileVisibility?: "friends" | "public" | "private";
            allowMessages?: boolean;
        };
    };
}, {
    email?: string;
    username?: string;
    profilePictureUrl?: string;
    bio?: string;
    settings?: {
        display?: {
            fontSize?: string;
            theme?: string;
            showSignatures?: boolean;
            postsPerPage?: number;
            language?: string;
            timezone?: string;
            threadDisplayMode?: string;
            reducedMotion?: boolean;
            hideNsfw?: boolean;
            showMatureContent?: boolean;
            showOfflineUsers?: boolean;
            dateFormat?: "relative" | "absolute";
        };
        theme?: "system" | "dark" | "light";
        notifications?: {
            email?: {
                enabled?: boolean;
                mentions?: boolean;
                replies?: boolean;
                tips?: boolean;
                digest?: "none" | "weekly" | "daily";
            };
            push?: {
                enabled?: boolean;
                mentions?: boolean;
                replies?: boolean;
                tips?: boolean;
            };
        };
        privacy?: {
            showStats?: boolean;
            showLevel?: boolean;
            allowFriendRequests?: boolean;
            profileVisibility?: "friends" | "public" | "private";
            allowMessages?: boolean;
        };
    };
}>;
export declare const CreateUserRequestSchema: z.ZodObject<{
    username: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    referralCode: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    email?: string;
    password?: string;
    username?: string;
    referralCode?: string;
}, {
    email?: string;
    password?: string;
    username?: string;
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
    query?: string;
    isOnline?: boolean;
    sortBy?: "level" | "username" | "createdAt" | "xp" | "lastActiveAt";
    sortOrder?: "desc" | "asc";
    minLevel?: number;
    maxLevel?: number;
}, {
    role?: string;
    query?: string;
    isOnline?: boolean;
    sortBy?: "level" | "username" | "createdAt" | "xp" | "lastActiveAt";
    sortOrder?: "desc" | "asc";
    minLevel?: number;
    maxLevel?: number;
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
