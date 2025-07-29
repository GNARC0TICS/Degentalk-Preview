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
    name?: string;
    level?: number;
    minXp?: number;
    color?: string;
    maxXp?: number;
}, {
    name?: string;
    level?: number;
    minXp?: number;
    color?: string;
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
    timezone?: string;
    language?: string;
    threadDisplayMode?: string;
    reducedMotion?: boolean;
    hideNsfw?: boolean;
    showMatureContent?: boolean;
    showOfflineUsers?: boolean;
    dateFormat?: "relative" | "absolute";
    showSignatures?: boolean;
    postsPerPage?: number;
}, {
    fontSize?: string;
    theme?: string;
    timezone?: string;
    language?: string;
    threadDisplayMode?: string;
    reducedMotion?: boolean;
    hideNsfw?: boolean;
    showMatureContent?: boolean;
    showOfflineUsers?: boolean;
    dateFormat?: "relative" | "absolute";
    showSignatures?: boolean;
    postsPerPage?: number;
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
        tips?: boolean;
        replies?: boolean;
        digest?: "none" | "daily" | "weekly";
    }, {
        enabled?: boolean;
        mentions?: boolean;
        tips?: boolean;
        replies?: boolean;
        digest?: "none" | "daily" | "weekly";
    }>;
    push: z.ZodObject<{
        enabled: z.ZodBoolean;
        mentions: z.ZodBoolean;
        replies: z.ZodBoolean;
        tips: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        enabled?: boolean;
        mentions?: boolean;
        tips?: boolean;
        replies?: boolean;
    }, {
        enabled?: boolean;
        mentions?: boolean;
        tips?: boolean;
        replies?: boolean;
    }>;
}, "strip", z.ZodTypeAny, {
    push?: {
        enabled?: boolean;
        mentions?: boolean;
        tips?: boolean;
        replies?: boolean;
    };
    email?: {
        enabled?: boolean;
        mentions?: boolean;
        tips?: boolean;
        replies?: boolean;
        digest?: "none" | "daily" | "weekly";
    };
}, {
    push?: {
        enabled?: boolean;
        mentions?: boolean;
        tips?: boolean;
        replies?: boolean;
    };
    email?: {
        enabled?: boolean;
        mentions?: boolean;
        tips?: boolean;
        replies?: boolean;
        digest?: "none" | "daily" | "weekly";
    };
}>;
export declare const PrivacySettingsSchema: z.ZodObject<{
    profileVisibility: z.ZodEnum<["public", "friends", "private"]>;
    showLevel: z.ZodBoolean;
    showStats: z.ZodBoolean;
    allowMessages: z.ZodBoolean;
    allowFriendRequests: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    profileVisibility?: "public" | "private" | "friends";
    allowFriendRequests?: boolean;
    showLevel?: boolean;
    showStats?: boolean;
    allowMessages?: boolean;
}, {
    profileVisibility?: "public" | "private" | "friends";
    allowFriendRequests?: boolean;
    showLevel?: boolean;
    showStats?: boolean;
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
            tips?: boolean;
            replies?: boolean;
            digest?: "none" | "daily" | "weekly";
        }, {
            enabled?: boolean;
            mentions?: boolean;
            tips?: boolean;
            replies?: boolean;
            digest?: "none" | "daily" | "weekly";
        }>;
        push: z.ZodObject<{
            enabled: z.ZodBoolean;
            mentions: z.ZodBoolean;
            replies: z.ZodBoolean;
            tips: z.ZodBoolean;
        }, "strip", z.ZodTypeAny, {
            enabled?: boolean;
            mentions?: boolean;
            tips?: boolean;
            replies?: boolean;
        }, {
            enabled?: boolean;
            mentions?: boolean;
            tips?: boolean;
            replies?: boolean;
        }>;
    }, "strip", z.ZodTypeAny, {
        push?: {
            enabled?: boolean;
            mentions?: boolean;
            tips?: boolean;
            replies?: boolean;
        };
        email?: {
            enabled?: boolean;
            mentions?: boolean;
            tips?: boolean;
            replies?: boolean;
            digest?: "none" | "daily" | "weekly";
        };
    }, {
        push?: {
            enabled?: boolean;
            mentions?: boolean;
            tips?: boolean;
            replies?: boolean;
        };
        email?: {
            enabled?: boolean;
            mentions?: boolean;
            tips?: boolean;
            replies?: boolean;
            digest?: "none" | "daily" | "weekly";
        };
    }>;
    privacy: z.ZodObject<{
        profileVisibility: z.ZodEnum<["public", "friends", "private"]>;
        showLevel: z.ZodBoolean;
        showStats: z.ZodBoolean;
        allowMessages: z.ZodBoolean;
        allowFriendRequests: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        profileVisibility?: "public" | "private" | "friends";
        allowFriendRequests?: boolean;
        showLevel?: boolean;
        showStats?: boolean;
        allowMessages?: boolean;
    }, {
        profileVisibility?: "public" | "private" | "friends";
        allowFriendRequests?: boolean;
        showLevel?: boolean;
        showStats?: boolean;
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
        timezone?: string;
        language?: string;
        threadDisplayMode?: string;
        reducedMotion?: boolean;
        hideNsfw?: boolean;
        showMatureContent?: boolean;
        showOfflineUsers?: boolean;
        dateFormat?: "relative" | "absolute";
        showSignatures?: boolean;
        postsPerPage?: number;
    }, {
        fontSize?: string;
        theme?: string;
        timezone?: string;
        language?: string;
        threadDisplayMode?: string;
        reducedMotion?: boolean;
        hideNsfw?: boolean;
        showMatureContent?: boolean;
        showOfflineUsers?: boolean;
        dateFormat?: "relative" | "absolute";
        showSignatures?: boolean;
        postsPerPage?: number;
    }>;
}, "strip", z.ZodTypeAny, {
    theme?: "system" | "light" | "dark";
    notifications?: {
        push?: {
            enabled?: boolean;
            mentions?: boolean;
            tips?: boolean;
            replies?: boolean;
        };
        email?: {
            enabled?: boolean;
            mentions?: boolean;
            tips?: boolean;
            replies?: boolean;
            digest?: "none" | "daily" | "weekly";
        };
    };
    display?: {
        fontSize?: string;
        theme?: string;
        timezone?: string;
        language?: string;
        threadDisplayMode?: string;
        reducedMotion?: boolean;
        hideNsfw?: boolean;
        showMatureContent?: boolean;
        showOfflineUsers?: boolean;
        dateFormat?: "relative" | "absolute";
        showSignatures?: boolean;
        postsPerPage?: number;
    };
    privacy?: {
        profileVisibility?: "public" | "private" | "friends";
        allowFriendRequests?: boolean;
        showLevel?: boolean;
        showStats?: boolean;
        allowMessages?: boolean;
    };
}, {
    theme?: "system" | "light" | "dark";
    notifications?: {
        push?: {
            enabled?: boolean;
            mentions?: boolean;
            tips?: boolean;
            replies?: boolean;
        };
        email?: {
            enabled?: boolean;
            mentions?: boolean;
            tips?: boolean;
            replies?: boolean;
            digest?: "none" | "daily" | "weekly";
        };
    };
    display?: {
        fontSize?: string;
        theme?: string;
        timezone?: string;
        language?: string;
        threadDisplayMode?: string;
        reducedMotion?: boolean;
        hideNsfw?: boolean;
        showMatureContent?: boolean;
        showOfflineUsers?: boolean;
        dateFormat?: "relative" | "absolute";
        showSignatures?: boolean;
        postsPerPage?: number;
    };
    privacy?: {
        profileVisibility?: "public" | "private" | "friends";
        allowFriendRequests?: boolean;
        showLevel?: boolean;
        showStats?: boolean;
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
    lastPostAt?: Date;
    joinedAt?: Date;
    threadCount?: number;
    totalXp?: number;
    achievementCount?: number;
    tipsSent?: number;
    tipsReceived?: number;
    dailyStreak?: number;
    bestStreak?: number;
}, {
    reputation?: number;
    postCount?: number;
    lastPostAt?: Date;
    joinedAt?: Date;
    threadCount?: number;
    totalXp?: number;
    achievementCount?: number;
    tipsSent?: number;
    tipsReceived?: number;
    dailyStreak?: number;
    bestStreak?: number;
}>;
export declare const UserBadgeSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodString;
    imageUrl: z.ZodString;
    rarity: z.ZodEnum<["common", "rare", "epic", "legendary", "mythic"]>;
    unlockedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    name?: string;
    description?: string;
    id?: string;
    rarity?: "common" | "rare" | "epic" | "legendary" | "mythic";
    imageUrl?: string;
    unlockedAt?: Date;
}, {
    name?: string;
    description?: string;
    id?: string;
    rarity?: "common" | "rare" | "epic" | "legendary" | "mythic";
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
        gradient?: string[];
        glow?: boolean;
        animate?: boolean;
    }, {
        gradient?: string[];
        glow?: boolean;
        animate?: boolean;
    }>>;
}, "strip", z.ZodTypeAny, {
    text?: string;
    id?: string;
    effects?: {
        gradient?: string[];
        glow?: boolean;
        animate?: boolean;
    };
    color?: string;
}, {
    text?: string;
    id?: string;
    effects?: {
        gradient?: string[];
        glow?: boolean;
        animate?: boolean;
    };
    color?: string;
}>;
export declare const UserFrameSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    previewUrl: z.ZodString;
    cssClass: z.ZodString;
    rarity: z.ZodEnum<["common", "rare", "epic", "legendary", "mythic"]>;
}, "strip", z.ZodTypeAny, {
    name?: string;
    id?: string;
    rarity?: "common" | "rare" | "epic" | "legendary" | "mythic";
    previewUrl?: string;
    cssClass?: string;
}, {
    name?: string;
    id?: string;
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
        name?: string;
        description?: string;
        id?: string;
        rarity?: "common" | "rare" | "epic" | "legendary" | "mythic";
        imageUrl?: string;
        unlockedAt?: Date;
    }, {
        name?: string;
        description?: string;
        id?: string;
        rarity?: "common" | "rare" | "epic" | "legendary" | "mythic";
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
            gradient?: string[];
            glow?: boolean;
            animate?: boolean;
        }, {
            gradient?: string[];
            glow?: boolean;
            animate?: boolean;
        }>>;
    }, "strip", z.ZodTypeAny, {
        text?: string;
        id?: string;
        effects?: {
            gradient?: string[];
            glow?: boolean;
            animate?: boolean;
        };
        color?: string;
    }, {
        text?: string;
        id?: string;
        effects?: {
            gradient?: string[];
            glow?: boolean;
            animate?: boolean;
        };
        color?: string;
    }>>;
    frame: z.ZodNullable<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        previewUrl: z.ZodString;
        cssClass: z.ZodString;
        rarity: z.ZodEnum<["common", "rare", "epic", "legendary", "mythic"]>;
    }, "strip", z.ZodTypeAny, {
        name?: string;
        id?: string;
        rarity?: "common" | "rare" | "epic" | "legendary" | "mythic";
        previewUrl?: string;
        cssClass?: string;
    }, {
        name?: string;
        id?: string;
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
        name?: string;
        level?: number;
        minXp?: number;
        color?: string;
        maxXp?: number;
    }, {
        name?: string;
        level?: number;
        minXp?: number;
        color?: string;
        maxXp?: number;
    }>>;
}, "strip", z.ZodTypeAny, {
    title?: {
        text?: string;
        id?: string;
        effects?: {
            gradient?: string[];
            glow?: boolean;
            animate?: boolean;
        };
        color?: string;
    };
    id?: string;
    level?: number;
    role?: string;
    badges?: {
        name?: string;
        description?: string;
        id?: string;
        rarity?: "common" | "rare" | "epic" | "legendary" | "mythic";
        imageUrl?: string;
        unlockedAt?: Date;
    }[];
    username?: string;
    bio?: string;
    displayName?: string;
    lastSeen?: Date;
    isOnline?: boolean;
    frame?: {
        name?: string;
        id?: string;
        rarity?: "common" | "rare" | "epic" | "legendary" | "mythic";
        previewUrl?: string;
        cssClass?: string;
    };
    levelConfig?: {
        name?: string;
        level?: number;
        minXp?: number;
        color?: string;
        maxXp?: number;
    };
    profilePictureUrl?: string;
}, {
    title?: {
        text?: string;
        id?: string;
        effects?: {
            gradient?: string[];
            glow?: boolean;
            animate?: boolean;
        };
        color?: string;
    };
    id?: string;
    level?: number;
    role?: string;
    badges?: {
        name?: string;
        description?: string;
        id?: string;
        rarity?: "common" | "rare" | "epic" | "legendary" | "mythic";
        imageUrl?: string;
        unlockedAt?: Date;
    }[];
    username?: string;
    bio?: string;
    displayName?: string;
    lastSeen?: Date;
    isOnline?: boolean;
    frame?: {
        name?: string;
        id?: string;
        rarity?: "common" | "rare" | "epic" | "legendary" | "mythic";
        previewUrl?: string;
        cssClass?: string;
    };
    levelConfig?: {
        name?: string;
        level?: number;
        minXp?: number;
        color?: string;
        maxXp?: number;
    };
    profilePictureUrl?: string;
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
    reputation: z.ZodNumber;
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
                tips?: boolean;
                replies?: boolean;
                digest?: "none" | "daily" | "weekly";
            }, {
                enabled?: boolean;
                mentions?: boolean;
                tips?: boolean;
                replies?: boolean;
                digest?: "none" | "daily" | "weekly";
            }>;
            push: z.ZodObject<{
                enabled: z.ZodBoolean;
                mentions: z.ZodBoolean;
                replies: z.ZodBoolean;
                tips: z.ZodBoolean;
            }, "strip", z.ZodTypeAny, {
                enabled?: boolean;
                mentions?: boolean;
                tips?: boolean;
                replies?: boolean;
            }, {
                enabled?: boolean;
                mentions?: boolean;
                tips?: boolean;
                replies?: boolean;
            }>;
        }, "strip", z.ZodTypeAny, {
            push?: {
                enabled?: boolean;
                mentions?: boolean;
                tips?: boolean;
                replies?: boolean;
            };
            email?: {
                enabled?: boolean;
                mentions?: boolean;
                tips?: boolean;
                replies?: boolean;
                digest?: "none" | "daily" | "weekly";
            };
        }, {
            push?: {
                enabled?: boolean;
                mentions?: boolean;
                tips?: boolean;
                replies?: boolean;
            };
            email?: {
                enabled?: boolean;
                mentions?: boolean;
                tips?: boolean;
                replies?: boolean;
                digest?: "none" | "daily" | "weekly";
            };
        }>;
        privacy: z.ZodObject<{
            profileVisibility: z.ZodEnum<["public", "friends", "private"]>;
            showLevel: z.ZodBoolean;
            showStats: z.ZodBoolean;
            allowMessages: z.ZodBoolean;
            allowFriendRequests: z.ZodBoolean;
        }, "strip", z.ZodTypeAny, {
            profileVisibility?: "public" | "private" | "friends";
            allowFriendRequests?: boolean;
            showLevel?: boolean;
            showStats?: boolean;
            allowMessages?: boolean;
        }, {
            profileVisibility?: "public" | "private" | "friends";
            allowFriendRequests?: boolean;
            showLevel?: boolean;
            showStats?: boolean;
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
            timezone?: string;
            language?: string;
            threadDisplayMode?: string;
            reducedMotion?: boolean;
            hideNsfw?: boolean;
            showMatureContent?: boolean;
            showOfflineUsers?: boolean;
            dateFormat?: "relative" | "absolute";
            showSignatures?: boolean;
            postsPerPage?: number;
        }, {
            fontSize?: string;
            theme?: string;
            timezone?: string;
            language?: string;
            threadDisplayMode?: string;
            reducedMotion?: boolean;
            hideNsfw?: boolean;
            showMatureContent?: boolean;
            showOfflineUsers?: boolean;
            dateFormat?: "relative" | "absolute";
            showSignatures?: boolean;
            postsPerPage?: number;
        }>;
    }, "strip", z.ZodTypeAny, {
        theme?: "system" | "light" | "dark";
        notifications?: {
            push?: {
                enabled?: boolean;
                mentions?: boolean;
                tips?: boolean;
                replies?: boolean;
            };
            email?: {
                enabled?: boolean;
                mentions?: boolean;
                tips?: boolean;
                replies?: boolean;
                digest?: "none" | "daily" | "weekly";
            };
        };
        display?: {
            fontSize?: string;
            theme?: string;
            timezone?: string;
            language?: string;
            threadDisplayMode?: string;
            reducedMotion?: boolean;
            hideNsfw?: boolean;
            showMatureContent?: boolean;
            showOfflineUsers?: boolean;
            dateFormat?: "relative" | "absolute";
            showSignatures?: boolean;
            postsPerPage?: number;
        };
        privacy?: {
            profileVisibility?: "public" | "private" | "friends";
            allowFriendRequests?: boolean;
            showLevel?: boolean;
            showStats?: boolean;
            allowMessages?: boolean;
        };
    }, {
        theme?: "system" | "light" | "dark";
        notifications?: {
            push?: {
                enabled?: boolean;
                mentions?: boolean;
                tips?: boolean;
                replies?: boolean;
            };
            email?: {
                enabled?: boolean;
                mentions?: boolean;
                tips?: boolean;
                replies?: boolean;
                digest?: "none" | "daily" | "weekly";
            };
        };
        display?: {
            fontSize?: string;
            theme?: string;
            timezone?: string;
            language?: string;
            threadDisplayMode?: string;
            reducedMotion?: boolean;
            hideNsfw?: boolean;
            showMatureContent?: boolean;
            showOfflineUsers?: boolean;
            dateFormat?: "relative" | "absolute";
            showSignatures?: boolean;
            postsPerPage?: number;
        };
        privacy?: {
            profileVisibility?: "public" | "private" | "friends";
            allowFriendRequests?: boolean;
            showLevel?: boolean;
            showStats?: boolean;
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
        lastPostAt?: Date;
        joinedAt?: Date;
        threadCount?: number;
        totalXp?: number;
        achievementCount?: number;
        tipsSent?: number;
        tipsReceived?: number;
        dailyStreak?: number;
        bestStreak?: number;
    }, {
        reputation?: number;
        postCount?: number;
        lastPostAt?: Date;
        joinedAt?: Date;
        threadCount?: number;
        totalXp?: number;
        achievementCount?: number;
        tipsSent?: number;
        tipsReceived?: number;
        dailyStreak?: number;
        bestStreak?: number;
    }>;
}, "strip", z.ZodTypeAny, {
    settings?: {
        theme?: "system" | "light" | "dark";
        notifications?: {
            push?: {
                enabled?: boolean;
                mentions?: boolean;
                tips?: boolean;
                replies?: boolean;
            };
            email?: {
                enabled?: boolean;
                mentions?: boolean;
                tips?: boolean;
                replies?: boolean;
                digest?: "none" | "daily" | "weekly";
            };
        };
        display?: {
            fontSize?: string;
            theme?: string;
            timezone?: string;
            language?: string;
            threadDisplayMode?: string;
            reducedMotion?: boolean;
            hideNsfw?: boolean;
            showMatureContent?: boolean;
            showOfflineUsers?: boolean;
            dateFormat?: "relative" | "absolute";
            showSignatures?: boolean;
            postsPerPage?: number;
        };
        privacy?: {
            profileVisibility?: "public" | "private" | "friends";
            allowFriendRequests?: boolean;
            showLevel?: boolean;
            showStats?: boolean;
            allowMessages?: boolean;
        };
    };
    id?: string;
    createdAt?: Date;
    updatedAt?: Date;
    email?: string;
    level?: number;
    role?: string;
    username?: string;
    bio?: string;
    xp?: number;
    reputation?: number;
    stats?: {
        reputation?: number;
        postCount?: number;
        lastPostAt?: Date;
        joinedAt?: Date;
        threadCount?: number;
        totalXp?: number;
        achievementCount?: number;
        tipsSent?: number;
        tipsReceived?: number;
        dailyStreak?: number;
        bestStreak?: number;
    };
    emailVerified?: boolean;
    dgt?: number;
    lastActiveAt?: Date;
    bannedUntil?: Date;
    profilePictureUrl?: string;
}, {
    settings?: {
        theme?: "system" | "light" | "dark";
        notifications?: {
            push?: {
                enabled?: boolean;
                mentions?: boolean;
                tips?: boolean;
                replies?: boolean;
            };
            email?: {
                enabled?: boolean;
                mentions?: boolean;
                tips?: boolean;
                replies?: boolean;
                digest?: "none" | "daily" | "weekly";
            };
        };
        display?: {
            fontSize?: string;
            theme?: string;
            timezone?: string;
            language?: string;
            threadDisplayMode?: string;
            reducedMotion?: boolean;
            hideNsfw?: boolean;
            showMatureContent?: boolean;
            showOfflineUsers?: boolean;
            dateFormat?: "relative" | "absolute";
            showSignatures?: boolean;
            postsPerPage?: number;
        };
        privacy?: {
            profileVisibility?: "public" | "private" | "friends";
            allowFriendRequests?: boolean;
            showLevel?: boolean;
            showStats?: boolean;
            allowMessages?: boolean;
        };
    };
    id?: string;
    createdAt?: Date;
    updatedAt?: Date;
    email?: string;
    level?: number;
    role?: string;
    username?: string;
    bio?: string;
    xp?: number;
    reputation?: number;
    stats?: {
        reputation?: number;
        postCount?: number;
        lastPostAt?: Date;
        joinedAt?: Date;
        threadCount?: number;
        totalXp?: number;
        achievementCount?: number;
        tipsSent?: number;
        tipsReceived?: number;
        dailyStreak?: number;
        bestStreak?: number;
    };
    emailVerified?: boolean;
    dgt?: number;
    lastActiveAt?: Date;
    bannedUntil?: Date;
    profilePictureUrl?: string;
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
                tips?: boolean;
                replies?: boolean;
                digest?: "none" | "daily" | "weekly";
            }, {
                enabled?: boolean;
                mentions?: boolean;
                tips?: boolean;
                replies?: boolean;
                digest?: "none" | "daily" | "weekly";
            }>;
            push: z.ZodObject<{
                enabled: z.ZodBoolean;
                mentions: z.ZodBoolean;
                replies: z.ZodBoolean;
                tips: z.ZodBoolean;
            }, "strip", z.ZodTypeAny, {
                enabled?: boolean;
                mentions?: boolean;
                tips?: boolean;
                replies?: boolean;
            }, {
                enabled?: boolean;
                mentions?: boolean;
                tips?: boolean;
                replies?: boolean;
            }>;
        }, "strip", z.ZodTypeAny, {
            push?: {
                enabled?: boolean;
                mentions?: boolean;
                tips?: boolean;
                replies?: boolean;
            };
            email?: {
                enabled?: boolean;
                mentions?: boolean;
                tips?: boolean;
                replies?: boolean;
                digest?: "none" | "daily" | "weekly";
            };
        }, {
            push?: {
                enabled?: boolean;
                mentions?: boolean;
                tips?: boolean;
                replies?: boolean;
            };
            email?: {
                enabled?: boolean;
                mentions?: boolean;
                tips?: boolean;
                replies?: boolean;
                digest?: "none" | "daily" | "weekly";
            };
        }>>;
        privacy: z.ZodOptional<z.ZodObject<{
            profileVisibility: z.ZodEnum<["public", "friends", "private"]>;
            showLevel: z.ZodBoolean;
            showStats: z.ZodBoolean;
            allowMessages: z.ZodBoolean;
            allowFriendRequests: z.ZodBoolean;
        }, "strip", z.ZodTypeAny, {
            profileVisibility?: "public" | "private" | "friends";
            allowFriendRequests?: boolean;
            showLevel?: boolean;
            showStats?: boolean;
            allowMessages?: boolean;
        }, {
            profileVisibility?: "public" | "private" | "friends";
            allowFriendRequests?: boolean;
            showLevel?: boolean;
            showStats?: boolean;
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
            timezone?: string;
            language?: string;
            threadDisplayMode?: string;
            reducedMotion?: boolean;
            hideNsfw?: boolean;
            showMatureContent?: boolean;
            showOfflineUsers?: boolean;
            dateFormat?: "relative" | "absolute";
            showSignatures?: boolean;
            postsPerPage?: number;
        }, {
            fontSize?: string;
            theme?: string;
            timezone?: string;
            language?: string;
            threadDisplayMode?: string;
            reducedMotion?: boolean;
            hideNsfw?: boolean;
            showMatureContent?: boolean;
            showOfflineUsers?: boolean;
            dateFormat?: "relative" | "absolute";
            showSignatures?: boolean;
            postsPerPage?: number;
        }>>;
    }, "strip", z.ZodTypeAny, {
        theme?: "system" | "light" | "dark";
        notifications?: {
            push?: {
                enabled?: boolean;
                mentions?: boolean;
                tips?: boolean;
                replies?: boolean;
            };
            email?: {
                enabled?: boolean;
                mentions?: boolean;
                tips?: boolean;
                replies?: boolean;
                digest?: "none" | "daily" | "weekly";
            };
        };
        display?: {
            fontSize?: string;
            theme?: string;
            timezone?: string;
            language?: string;
            threadDisplayMode?: string;
            reducedMotion?: boolean;
            hideNsfw?: boolean;
            showMatureContent?: boolean;
            showOfflineUsers?: boolean;
            dateFormat?: "relative" | "absolute";
            showSignatures?: boolean;
            postsPerPage?: number;
        };
        privacy?: {
            profileVisibility?: "public" | "private" | "friends";
            allowFriendRequests?: boolean;
            showLevel?: boolean;
            showStats?: boolean;
            allowMessages?: boolean;
        };
    }, {
        theme?: "system" | "light" | "dark";
        notifications?: {
            push?: {
                enabled?: boolean;
                mentions?: boolean;
                tips?: boolean;
                replies?: boolean;
            };
            email?: {
                enabled?: boolean;
                mentions?: boolean;
                tips?: boolean;
                replies?: boolean;
                digest?: "none" | "daily" | "weekly";
            };
        };
        display?: {
            fontSize?: string;
            theme?: string;
            timezone?: string;
            language?: string;
            threadDisplayMode?: string;
            reducedMotion?: boolean;
            hideNsfw?: boolean;
            showMatureContent?: boolean;
            showOfflineUsers?: boolean;
            dateFormat?: "relative" | "absolute";
            showSignatures?: boolean;
            postsPerPage?: number;
        };
        privacy?: {
            profileVisibility?: "public" | "private" | "friends";
            allowFriendRequests?: boolean;
            showLevel?: boolean;
            showStats?: boolean;
            allowMessages?: boolean;
        };
    }>>;
}, "strip", z.ZodTypeAny, {
    settings?: {
        theme?: "system" | "light" | "dark";
        notifications?: {
            push?: {
                enabled?: boolean;
                mentions?: boolean;
                tips?: boolean;
                replies?: boolean;
            };
            email?: {
                enabled?: boolean;
                mentions?: boolean;
                tips?: boolean;
                replies?: boolean;
                digest?: "none" | "daily" | "weekly";
            };
        };
        display?: {
            fontSize?: string;
            theme?: string;
            timezone?: string;
            language?: string;
            threadDisplayMode?: string;
            reducedMotion?: boolean;
            hideNsfw?: boolean;
            showMatureContent?: boolean;
            showOfflineUsers?: boolean;
            dateFormat?: "relative" | "absolute";
            showSignatures?: boolean;
            postsPerPage?: number;
        };
        privacy?: {
            profileVisibility?: "public" | "private" | "friends";
            allowFriendRequests?: boolean;
            showLevel?: boolean;
            showStats?: boolean;
            allowMessages?: boolean;
        };
    };
    email?: string;
    username?: string;
    bio?: string;
    profilePictureUrl?: string;
}, {
    settings?: {
        theme?: "system" | "light" | "dark";
        notifications?: {
            push?: {
                enabled?: boolean;
                mentions?: boolean;
                tips?: boolean;
                replies?: boolean;
            };
            email?: {
                enabled?: boolean;
                mentions?: boolean;
                tips?: boolean;
                replies?: boolean;
                digest?: "none" | "daily" | "weekly";
            };
        };
        display?: {
            fontSize?: string;
            theme?: string;
            timezone?: string;
            language?: string;
            threadDisplayMode?: string;
            reducedMotion?: boolean;
            hideNsfw?: boolean;
            showMatureContent?: boolean;
            showOfflineUsers?: boolean;
            dateFormat?: "relative" | "absolute";
            showSignatures?: boolean;
            postsPerPage?: number;
        };
        privacy?: {
            profileVisibility?: "public" | "private" | "friends";
            allowFriendRequests?: boolean;
            showLevel?: boolean;
            showStats?: boolean;
            allowMessages?: boolean;
        };
    };
    email?: string;
    username?: string;
    bio?: string;
    profilePictureUrl?: string;
}>;
export declare const CreateUserRequestSchema: z.ZodObject<{
    username: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    referralCode: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    password?: string;
    email?: string;
    username?: string;
    referralCode?: string;
}, {
    password?: string;
    email?: string;
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
    query?: string;
    role?: string;
    minLevel?: number;
    sortOrder?: "asc" | "desc";
    isOnline?: boolean;
    maxLevel?: number;
    sortBy?: "createdAt" | "level" | "username" | "xp" | "lastActiveAt";
}, {
    query?: string;
    role?: string;
    minLevel?: number;
    sortOrder?: "asc" | "desc";
    isOnline?: boolean;
    maxLevel?: number;
    sortBy?: "createdAt" | "level" | "username" | "xp" | "lastActiveAt";
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
//# sourceMappingURL=user.schema.d.ts.map