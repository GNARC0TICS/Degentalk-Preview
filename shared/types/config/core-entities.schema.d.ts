import { z } from 'zod';
/**
 * Core Entity Validation Schemas
 *
 * Runtime validation for core domain entities.
 * These schemas validate data at API boundaries and during data transformation.
 */
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
            digest?: "none" | "daily" | "weekly";
            replies?: boolean;
        }, {
            enabled?: boolean;
            mentions?: boolean;
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
            digest?: "none" | "daily" | "weekly";
            replies?: boolean;
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
            digest?: "none" | "daily" | "weekly";
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
    }, "strip", z.ZodTypeAny, {
        timezone?: string;
        language?: string;
        dateFormat?: "relative" | "absolute";
        showSignatures?: boolean;
        postsPerPage?: number;
    }, {
        timezone?: string;
        language?: string;
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
            digest?: "none" | "daily" | "weekly";
            replies?: boolean;
        };
    };
    privacy?: {
        profileVisibility?: "public" | "private" | "friends";
        allowFriendRequests?: boolean;
        showLevel?: boolean;
        showStats?: boolean;
        allowMessages?: boolean;
    };
    display?: {
        timezone?: string;
        language?: string;
        dateFormat?: "relative" | "absolute";
        showSignatures?: boolean;
        postsPerPage?: number;
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
            digest?: "none" | "daily" | "weekly";
            replies?: boolean;
        };
    };
    privacy?: {
        profileVisibility?: "public" | "private" | "friends";
        allowFriendRequests?: boolean;
        showLevel?: boolean;
        showStats?: boolean;
        allowMessages?: boolean;
    };
    display?: {
        timezone?: string;
        language?: string;
        dateFormat?: "relative" | "absolute";
        showSignatures?: boolean;
        postsPerPage?: number;
    };
}>;
export declare const UserStatsSchema: z.ZodObject<{
    postCount: z.ZodNumber;
    threadCount: z.ZodNumber;
    tipsSent: z.ZodNumber;
    tipsReceived: z.ZodNumber;
    reputation: z.ZodNumber;
    dailyStreak: z.ZodNumber;
    bestStreak: z.ZodNumber;
    achievementCount: z.ZodNumber;
    lastPostAt: z.ZodNullable<z.ZodString>;
    joinedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    reputation?: number;
    postCount?: number;
    lastPostAt?: string;
    joinedAt?: string;
    bestStreak?: number;
    threadCount?: number;
    tipsSent?: number;
    tipsReceived?: number;
    dailyStreak?: number;
    achievementCount?: number;
}, {
    reputation?: number;
    postCount?: number;
    lastPostAt?: string;
    joinedAt?: string;
    bestStreak?: number;
    threadCount?: number;
    tipsSent?: number;
    tipsReceived?: number;
    dailyStreak?: number;
    achievementCount?: number;
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
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    bannedUntil: z.ZodNullable<z.ZodString>;
    profilePictureUrl: z.ZodNullable<z.ZodString>;
    bio: z.ZodNullable<z.ZodString>;
    lastActiveAt: z.ZodString;
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
                digest?: "none" | "daily" | "weekly";
                replies?: boolean;
            }, {
                enabled?: boolean;
                mentions?: boolean;
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
                digest?: "none" | "daily" | "weekly";
                replies?: boolean;
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
                digest?: "none" | "daily" | "weekly";
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
        }, "strip", z.ZodTypeAny, {
            timezone?: string;
            language?: string;
            dateFormat?: "relative" | "absolute";
            showSignatures?: boolean;
            postsPerPage?: number;
        }, {
            timezone?: string;
            language?: string;
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
                digest?: "none" | "daily" | "weekly";
                replies?: boolean;
            };
        };
        privacy?: {
            profileVisibility?: "public" | "private" | "friends";
            allowFriendRequests?: boolean;
            showLevel?: boolean;
            showStats?: boolean;
            allowMessages?: boolean;
        };
        display?: {
            timezone?: string;
            language?: string;
            dateFormat?: "relative" | "absolute";
            showSignatures?: boolean;
            postsPerPage?: number;
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
                digest?: "none" | "daily" | "weekly";
                replies?: boolean;
            };
        };
        privacy?: {
            profileVisibility?: "public" | "private" | "friends";
            allowFriendRequests?: boolean;
            showLevel?: boolean;
            showStats?: boolean;
            allowMessages?: boolean;
        };
        display?: {
            timezone?: string;
            language?: string;
            dateFormat?: "relative" | "absolute";
            showSignatures?: boolean;
            postsPerPage?: number;
        };
    }>;
    stats: z.ZodObject<{
        postCount: z.ZodNumber;
        threadCount: z.ZodNumber;
        tipsSent: z.ZodNumber;
        tipsReceived: z.ZodNumber;
        reputation: z.ZodNumber;
        dailyStreak: z.ZodNumber;
        bestStreak: z.ZodNumber;
        achievementCount: z.ZodNumber;
        lastPostAt: z.ZodNullable<z.ZodString>;
        joinedAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        reputation?: number;
        postCount?: number;
        lastPostAt?: string;
        joinedAt?: string;
        bestStreak?: number;
        threadCount?: number;
        tipsSent?: number;
        tipsReceived?: number;
        dailyStreak?: number;
        achievementCount?: number;
    }, {
        reputation?: number;
        postCount?: number;
        lastPostAt?: string;
        joinedAt?: string;
        bestStreak?: number;
        threadCount?: number;
        tipsSent?: number;
        tipsReceived?: number;
        dailyStreak?: number;
        achievementCount?: number;
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
                digest?: "none" | "daily" | "weekly";
                replies?: boolean;
            };
        };
        privacy?: {
            profileVisibility?: "public" | "private" | "friends";
            allowFriendRequests?: boolean;
            showLevel?: boolean;
            showStats?: boolean;
            allowMessages?: boolean;
        };
        display?: {
            timezone?: string;
            language?: string;
            dateFormat?: "relative" | "absolute";
            showSignatures?: boolean;
            postsPerPage?: number;
        };
    };
    id?: string;
    createdAt?: string;
    updatedAt?: string;
    email?: string;
    username?: string;
    bio?: string;
    xp?: number;
    level?: number;
    clout?: number;
    role?: string;
    dgt?: number;
    profilePictureUrl?: string;
    emailVerified?: boolean;
    bannedUntil?: string;
    lastActiveAt?: string;
    stats?: {
        reputation?: number;
        postCount?: number;
        lastPostAt?: string;
        joinedAt?: string;
        bestStreak?: number;
        threadCount?: number;
        tipsSent?: number;
        tipsReceived?: number;
        dailyStreak?: number;
        achievementCount?: number;
    };
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
                digest?: "none" | "daily" | "weekly";
                replies?: boolean;
            };
        };
        privacy?: {
            profileVisibility?: "public" | "private" | "friends";
            allowFriendRequests?: boolean;
            showLevel?: boolean;
            showStats?: boolean;
            allowMessages?: boolean;
        };
        display?: {
            timezone?: string;
            language?: string;
            dateFormat?: "relative" | "absolute";
            showSignatures?: boolean;
            postsPerPage?: number;
        };
    };
    id?: string;
    createdAt?: string;
    updatedAt?: string;
    email?: string;
    username?: string;
    bio?: string;
    xp?: number;
    level?: number;
    clout?: number;
    role?: string;
    dgt?: number;
    profilePictureUrl?: string;
    emailVerified?: boolean;
    bannedUntil?: string;
    lastActiveAt?: string;
    stats?: {
        reputation?: number;
        postCount?: number;
        lastPostAt?: string;
        joinedAt?: string;
        bestStreak?: number;
        threadCount?: number;
        tipsSent?: number;
        tipsReceived?: number;
        dailyStreak?: number;
        achievementCount?: number;
    };
}>;
export declare const ForumSettingsSchema: z.ZodObject<{
    allowThreads: z.ZodBoolean;
    allowReplies: z.ZodBoolean;
    allowVoting: z.ZodBoolean;
    allowTags: z.ZodBoolean;
    moderationLevel: z.ZodEnum<["none", "low", "medium", "high"]>;
    prefixes: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        text: z.ZodString;
        color: z.ZodString;
        backgroundColor: z.ZodString;
        requiredLevel: z.ZodNumber;
        requiredRole: z.ZodNullable<z.ZodString>;
        displayOrder: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        text?: string;
        id?: string;
        backgroundColor?: string;
        color?: string;
        requiredLevel?: number;
        displayOrder?: number;
        requiredRole?: string;
    }, {
        text?: string;
        id?: string;
        backgroundColor?: string;
        color?: string;
        requiredLevel?: number;
        displayOrder?: number;
        requiredRole?: string;
    }>, "many">;
    rules: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        title: z.ZodString;
        description: z.ZodString;
        displayOrder: z.ZodNumber;
        severity: z.ZodEnum<["info", "warning", "critical"]>;
    }, "strip", z.ZodTypeAny, {
        description?: string;
        title?: string;
        id?: string;
        displayOrder?: number;
        severity?: "warning" | "info" | "critical";
    }, {
        description?: string;
        title?: string;
        id?: string;
        displayOrder?: number;
        severity?: "warning" | "info" | "critical";
    }>, "many">;
    xpMultiplier: z.ZodNumber;
    dgtMultiplier: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    xpMultiplier?: number;
    rules?: {
        description?: string;
        title?: string;
        id?: string;
        displayOrder?: number;
        severity?: "warning" | "info" | "critical";
    }[];
    allowThreads?: boolean;
    allowReplies?: boolean;
    allowVoting?: boolean;
    allowTags?: boolean;
    moderationLevel?: "none" | "medium" | "low" | "high";
    prefixes?: {
        text?: string;
        id?: string;
        backgroundColor?: string;
        color?: string;
        requiredLevel?: number;
        displayOrder?: number;
        requiredRole?: string;
    }[];
    dgtMultiplier?: number;
}, {
    xpMultiplier?: number;
    rules?: {
        description?: string;
        title?: string;
        id?: string;
        displayOrder?: number;
        severity?: "warning" | "info" | "critical";
    }[];
    allowThreads?: boolean;
    allowReplies?: boolean;
    allowVoting?: boolean;
    allowTags?: boolean;
    moderationLevel?: "none" | "medium" | "low" | "high";
    prefixes?: {
        text?: string;
        id?: string;
        backgroundColor?: string;
        color?: string;
        requiredLevel?: number;
        displayOrder?: number;
        requiredRole?: string;
    }[];
    dgtMultiplier?: number;
}>;
export declare const ForumStatsSchema: z.ZodObject<{
    threadCount: z.ZodNumber;
    postCount: z.ZodNumber;
    uniquePosters: z.ZodNumber;
    lastPostAt: z.ZodNullable<z.ZodString>;
    lastThreadAt: z.ZodNullable<z.ZodString>;
    todayPosts: z.ZodNumber;
    todayThreads: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    postCount?: number;
    lastPostAt?: string;
    threadCount?: number;
    uniquePosters?: number;
    lastThreadAt?: string;
    todayPosts?: number;
    todayThreads?: number;
}, {
    postCount?: number;
    lastPostAt?: string;
    threadCount?: number;
    uniquePosters?: number;
    lastThreadAt?: string;
    todayPosts?: number;
    todayThreads?: number;
}>;
export declare const ForumSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    slug: z.ZodString;
    description: z.ZodString;
    parentId: z.ZodNullable<z.ZodString>;
    displayOrder: z.ZodNumber;
    isActive: z.ZodBoolean;
    isPrivate: z.ZodBoolean;
    requiredLevel: z.ZodNumber;
    requiredRole: z.ZodNullable<z.ZodString>;
    settings: z.ZodObject<{
        allowThreads: z.ZodBoolean;
        allowReplies: z.ZodBoolean;
        allowVoting: z.ZodBoolean;
        allowTags: z.ZodBoolean;
        moderationLevel: z.ZodEnum<["none", "low", "medium", "high"]>;
        prefixes: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            text: z.ZodString;
            color: z.ZodString;
            backgroundColor: z.ZodString;
            requiredLevel: z.ZodNumber;
            requiredRole: z.ZodNullable<z.ZodString>;
            displayOrder: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            text?: string;
            id?: string;
            backgroundColor?: string;
            color?: string;
            requiredLevel?: number;
            displayOrder?: number;
            requiredRole?: string;
        }, {
            text?: string;
            id?: string;
            backgroundColor?: string;
            color?: string;
            requiredLevel?: number;
            displayOrder?: number;
            requiredRole?: string;
        }>, "many">;
        rules: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            title: z.ZodString;
            description: z.ZodString;
            displayOrder: z.ZodNumber;
            severity: z.ZodEnum<["info", "warning", "critical"]>;
        }, "strip", z.ZodTypeAny, {
            description?: string;
            title?: string;
            id?: string;
            displayOrder?: number;
            severity?: "warning" | "info" | "critical";
        }, {
            description?: string;
            title?: string;
            id?: string;
            displayOrder?: number;
            severity?: "warning" | "info" | "critical";
        }>, "many">;
        xpMultiplier: z.ZodNumber;
        dgtMultiplier: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        xpMultiplier?: number;
        rules?: {
            description?: string;
            title?: string;
            id?: string;
            displayOrder?: number;
            severity?: "warning" | "info" | "critical";
        }[];
        allowThreads?: boolean;
        allowReplies?: boolean;
        allowVoting?: boolean;
        allowTags?: boolean;
        moderationLevel?: "none" | "medium" | "low" | "high";
        prefixes?: {
            text?: string;
            id?: string;
            backgroundColor?: string;
            color?: string;
            requiredLevel?: number;
            displayOrder?: number;
            requiredRole?: string;
        }[];
        dgtMultiplier?: number;
    }, {
        xpMultiplier?: number;
        rules?: {
            description?: string;
            title?: string;
            id?: string;
            displayOrder?: number;
            severity?: "warning" | "info" | "critical";
        }[];
        allowThreads?: boolean;
        allowReplies?: boolean;
        allowVoting?: boolean;
        allowTags?: boolean;
        moderationLevel?: "none" | "medium" | "low" | "high";
        prefixes?: {
            text?: string;
            id?: string;
            backgroundColor?: string;
            color?: string;
            requiredLevel?: number;
            displayOrder?: number;
            requiredRole?: string;
        }[];
        dgtMultiplier?: number;
    }>;
    stats: z.ZodObject<{
        threadCount: z.ZodNumber;
        postCount: z.ZodNumber;
        uniquePosters: z.ZodNumber;
        lastPostAt: z.ZodNullable<z.ZodString>;
        lastThreadAt: z.ZodNullable<z.ZodString>;
        todayPosts: z.ZodNumber;
        todayThreads: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        postCount?: number;
        lastPostAt?: string;
        threadCount?: number;
        uniquePosters?: number;
        lastThreadAt?: string;
        todayPosts?: number;
        todayThreads?: number;
    }, {
        postCount?: number;
        lastPostAt?: string;
        threadCount?: number;
        uniquePosters?: number;
        lastThreadAt?: string;
        todayPosts?: number;
        todayThreads?: number;
    }>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name?: string;
    settings?: {
        xpMultiplier?: number;
        rules?: {
            description?: string;
            title?: string;
            id?: string;
            displayOrder?: number;
            severity?: "warning" | "info" | "critical";
        }[];
        allowThreads?: boolean;
        allowReplies?: boolean;
        allowVoting?: boolean;
        allowTags?: boolean;
        moderationLevel?: "none" | "medium" | "low" | "high";
        prefixes?: {
            text?: string;
            id?: string;
            backgroundColor?: string;
            color?: string;
            requiredLevel?: number;
            displayOrder?: number;
            requiredRole?: string;
        }[];
        dgtMultiplier?: number;
    };
    description?: string;
    id?: string;
    slug?: string;
    createdAt?: string;
    updatedAt?: string;
    parentId?: string;
    isActive?: boolean;
    requiredLevel?: number;
    isPrivate?: boolean;
    displayOrder?: number;
    requiredRole?: string;
    stats?: {
        postCount?: number;
        lastPostAt?: string;
        threadCount?: number;
        uniquePosters?: number;
        lastThreadAt?: string;
        todayPosts?: number;
        todayThreads?: number;
    };
}, {
    name?: string;
    settings?: {
        xpMultiplier?: number;
        rules?: {
            description?: string;
            title?: string;
            id?: string;
            displayOrder?: number;
            severity?: "warning" | "info" | "critical";
        }[];
        allowThreads?: boolean;
        allowReplies?: boolean;
        allowVoting?: boolean;
        allowTags?: boolean;
        moderationLevel?: "none" | "medium" | "low" | "high";
        prefixes?: {
            text?: string;
            id?: string;
            backgroundColor?: string;
            color?: string;
            requiredLevel?: number;
            displayOrder?: number;
            requiredRole?: string;
        }[];
        dgtMultiplier?: number;
    };
    description?: string;
    id?: string;
    slug?: string;
    createdAt?: string;
    updatedAt?: string;
    parentId?: string;
    isActive?: boolean;
    requiredLevel?: number;
    isPrivate?: boolean;
    displayOrder?: number;
    requiredRole?: string;
    stats?: {
        postCount?: number;
        lastPostAt?: string;
        threadCount?: number;
        uniquePosters?: number;
        lastThreadAt?: string;
        todayPosts?: number;
        todayThreads?: number;
    };
}>;
export declare const ThreadMetadataSchema: z.ZodObject<{
    edited: z.ZodBoolean;
    editedAt: z.ZodNullable<z.ZodString>;
    editedBy: z.ZodNullable<z.ZodString>;
    editReason: z.ZodNullable<z.ZodString>;
    upvotes: z.ZodNumber;
    downvotes: z.ZodNumber;
    score: z.ZodNumber;
    mentionedUsers: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    editedAt?: string;
    editedBy?: string;
    score?: number;
    edited?: boolean;
    editReason?: string;
    upvotes?: number;
    downvotes?: number;
    mentionedUsers?: string[];
}, {
    editedAt?: string;
    editedBy?: string;
    score?: number;
    edited?: boolean;
    editReason?: string;
    upvotes?: number;
    downvotes?: number;
    mentionedUsers?: string[];
}>;
export declare const ThreadSchema: z.ZodObject<{
    id: z.ZodString;
    forumId: z.ZodString;
    authorId: z.ZodString;
    title: z.ZodString;
    content: z.ZodString;
    status: z.ZodString;
    isPinned: z.ZodBoolean;
    isLocked: z.ZodBoolean;
    isHot: z.ZodBoolean;
    viewCount: z.ZodNumber;
    replyCount: z.ZodNumber;
    lastReplyAt: z.ZodNullable<z.ZodString>;
    lastReplyBy: z.ZodNullable<z.ZodString>;
    tags: z.ZodArray<z.ZodString, "many">;
    prefix: z.ZodNullable<z.ZodObject<{
        id: z.ZodString;
        text: z.ZodString;
        color: z.ZodString;
        backgroundColor: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        text?: string;
        id?: string;
        backgroundColor?: string;
        color?: string;
    }, {
        text?: string;
        id?: string;
        backgroundColor?: string;
        color?: string;
    }>>;
    metadata: z.ZodObject<{
        edited: z.ZodBoolean;
        editedAt: z.ZodNullable<z.ZodString>;
        editedBy: z.ZodNullable<z.ZodString>;
        editReason: z.ZodNullable<z.ZodString>;
        upvotes: z.ZodNumber;
        downvotes: z.ZodNumber;
        score: z.ZodNumber;
        mentionedUsers: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        editedAt?: string;
        editedBy?: string;
        score?: number;
        edited?: boolean;
        editReason?: string;
        upvotes?: number;
        downvotes?: number;
        mentionedUsers?: string[];
    }, {
        editedAt?: string;
        editedBy?: string;
        score?: number;
        edited?: boolean;
        editReason?: string;
        upvotes?: number;
        downvotes?: number;
        mentionedUsers?: string[];
    }>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    deletedAt: z.ZodNullable<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    title?: string;
    id?: string;
    createdAt?: string;
    updatedAt?: string;
    status?: string;
    isLocked?: boolean;
    deletedAt?: string;
    viewCount?: number;
    content?: string;
    metadata?: {
        editedAt?: string;
        editedBy?: string;
        score?: number;
        edited?: boolean;
        editReason?: string;
        upvotes?: number;
        downvotes?: number;
        mentionedUsers?: string[];
    };
    tags?: string[];
    isPinned?: boolean;
    authorId?: string;
    prefix?: {
        text?: string;
        id?: string;
        backgroundColor?: string;
        color?: string;
    };
    lastReplyAt?: string;
    replyCount?: number;
    forumId?: string;
    isHot?: boolean;
    lastReplyBy?: string;
}, {
    title?: string;
    id?: string;
    createdAt?: string;
    updatedAt?: string;
    status?: string;
    isLocked?: boolean;
    deletedAt?: string;
    viewCount?: number;
    content?: string;
    metadata?: {
        editedAt?: string;
        editedBy?: string;
        score?: number;
        edited?: boolean;
        editReason?: string;
        upvotes?: number;
        downvotes?: number;
        mentionedUsers?: string[];
    };
    tags?: string[];
    isPinned?: boolean;
    authorId?: string;
    prefix?: {
        text?: string;
        id?: string;
        backgroundColor?: string;
        color?: string;
    };
    lastReplyAt?: string;
    replyCount?: number;
    forumId?: string;
    isHot?: boolean;
    lastReplyBy?: string;
}>;
export declare const PostMetadataSchema: z.ZodObject<{
    edited: z.ZodBoolean;
    editedAt: z.ZodNullable<z.ZodString>;
    editedBy: z.ZodNullable<z.ZodString>;
    editReason: z.ZodNullable<z.ZodString>;
    upvotes: z.ZodNumber;
    downvotes: z.ZodNumber;
    tipCount: z.ZodNumber;
    tipTotal: z.ZodNumber;
    mentionedUsers: z.ZodArray<z.ZodString, "many">;
    quotedPost: z.ZodNullable<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    tipCount?: number;
    editedAt?: string;
    editedBy?: string;
    tipTotal?: number;
    edited?: boolean;
    editReason?: string;
    upvotes?: number;
    downvotes?: number;
    mentionedUsers?: string[];
    quotedPost?: string;
}, {
    tipCount?: number;
    editedAt?: string;
    editedBy?: string;
    tipTotal?: number;
    edited?: boolean;
    editReason?: string;
    upvotes?: number;
    downvotes?: number;
    mentionedUsers?: string[];
    quotedPost?: string;
}>;
export declare const PostSchema: z.ZodObject<{
    id: z.ZodString;
    threadId: z.ZodString;
    authorId: z.ZodString;
    parentId: z.ZodNullable<z.ZodString>;
    content: z.ZodString;
    status: z.ZodString;
    isDeleted: z.ZodBoolean;
    metadata: z.ZodObject<{
        edited: z.ZodBoolean;
        editedAt: z.ZodNullable<z.ZodString>;
        editedBy: z.ZodNullable<z.ZodString>;
        editReason: z.ZodNullable<z.ZodString>;
        upvotes: z.ZodNumber;
        downvotes: z.ZodNumber;
        tipCount: z.ZodNumber;
        tipTotal: z.ZodNumber;
        mentionedUsers: z.ZodArray<z.ZodString, "many">;
        quotedPost: z.ZodNullable<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        tipCount?: number;
        editedAt?: string;
        editedBy?: string;
        tipTotal?: number;
        edited?: boolean;
        editReason?: string;
        upvotes?: number;
        downvotes?: number;
        mentionedUsers?: string[];
        quotedPost?: string;
    }, {
        tipCount?: number;
        editedAt?: string;
        editedBy?: string;
        tipTotal?: number;
        edited?: boolean;
        editReason?: string;
        upvotes?: number;
        downvotes?: number;
        mentionedUsers?: string[];
        quotedPost?: string;
    }>;
    reactions: z.ZodArray<z.ZodObject<{
        userId: z.ZodString;
        emoji: z.ZodString;
        createdAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        createdAt?: string;
        emoji?: string;
        userId?: string;
    }, {
        createdAt?: string;
        emoji?: string;
        userId?: string;
    }>, "many">;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    deletedAt: z.ZodNullable<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id?: string;
    createdAt?: string;
    updatedAt?: string;
    status?: string;
    parentId?: string;
    isDeleted?: boolean;
    deletedAt?: string;
    threadId?: string;
    content?: string;
    metadata?: {
        tipCount?: number;
        editedAt?: string;
        editedBy?: string;
        tipTotal?: number;
        edited?: boolean;
        editReason?: string;
        upvotes?: number;
        downvotes?: number;
        mentionedUsers?: string[];
        quotedPost?: string;
    };
    authorId?: string;
    reactions?: {
        createdAt?: string;
        emoji?: string;
        userId?: string;
    }[];
}, {
    id?: string;
    createdAt?: string;
    updatedAt?: string;
    status?: string;
    parentId?: string;
    isDeleted?: boolean;
    deletedAt?: string;
    threadId?: string;
    content?: string;
    metadata?: {
        tipCount?: number;
        editedAt?: string;
        editedBy?: string;
        tipTotal?: number;
        edited?: boolean;
        editReason?: string;
        upvotes?: number;
        downvotes?: number;
        mentionedUsers?: string[];
        quotedPost?: string;
    };
    authorId?: string;
    reactions?: {
        createdAt?: string;
        emoji?: string;
        userId?: string;
    }[];
}>;
export declare const WalletFeaturesSchema: z.ZodObject<{
    withdrawalsEnabled: z.ZodBoolean;
    stakingEnabled: z.ZodBoolean;
    tradingEnabled: z.ZodBoolean;
    tippingEnabled: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    tippingEnabled?: boolean;
    withdrawalsEnabled?: boolean;
    stakingEnabled?: boolean;
    tradingEnabled?: boolean;
}, {
    tippingEnabled?: boolean;
    withdrawalsEnabled?: boolean;
    stakingEnabled?: boolean;
    tradingEnabled?: boolean;
}>;
export declare const WalletLimitsSchema: z.ZodObject<{
    dailyWithdrawal: z.ZodNumber;
    singleWithdrawal: z.ZodNumber;
    dailySpend: z.ZodNumber;
    singleTransaction: z.ZodNumber;
    minimumWithdrawal: z.ZodNumber;
    withdrawalCooldown: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    dailyWithdrawal?: number;
    singleWithdrawal?: number;
    dailySpend?: number;
    singleTransaction?: number;
    minimumWithdrawal?: number;
    withdrawalCooldown?: number;
}, {
    dailyWithdrawal?: number;
    singleWithdrawal?: number;
    dailySpend?: number;
    singleTransaction?: number;
    minimumWithdrawal?: number;
    withdrawalCooldown?: number;
}>;
export declare const WalletSchema: z.ZodObject<{
    id: z.ZodString;
    userId: z.ZodString;
    balance: z.ZodNumber;
    pendingBalance: z.ZodNumber;
    lockedBalance: z.ZodNumber;
    totalEarned: z.ZodNumber;
    totalSpent: z.ZodNumber;
    totalWithdrawn: z.ZodNumber;
    withdrawalAddress: z.ZodNullable<z.ZodString>;
    isActive: z.ZodBoolean;
    isLocked: z.ZodBoolean;
    lockedUntil: z.ZodNullable<z.ZodString>;
    lockReason: z.ZodNullable<z.ZodString>;
    features: z.ZodObject<{
        withdrawalsEnabled: z.ZodBoolean;
        stakingEnabled: z.ZodBoolean;
        tradingEnabled: z.ZodBoolean;
        tippingEnabled: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        tippingEnabled?: boolean;
        withdrawalsEnabled?: boolean;
        stakingEnabled?: boolean;
        tradingEnabled?: boolean;
    }, {
        tippingEnabled?: boolean;
        withdrawalsEnabled?: boolean;
        stakingEnabled?: boolean;
        tradingEnabled?: boolean;
    }>;
    limits: z.ZodObject<{
        dailyWithdrawal: z.ZodNumber;
        singleWithdrawal: z.ZodNumber;
        dailySpend: z.ZodNumber;
        singleTransaction: z.ZodNumber;
        minimumWithdrawal: z.ZodNumber;
        withdrawalCooldown: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        dailyWithdrawal?: number;
        singleWithdrawal?: number;
        dailySpend?: number;
        singleTransaction?: number;
        minimumWithdrawal?: number;
        withdrawalCooldown?: number;
    }, {
        dailyWithdrawal?: number;
        singleWithdrawal?: number;
        dailySpend?: number;
        singleTransaction?: number;
        minimumWithdrawal?: number;
        withdrawalCooldown?: number;
    }>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id?: string;
    createdAt?: string;
    updatedAt?: string;
    isLocked?: boolean;
    isActive?: boolean;
    userId?: string;
    balance?: number;
    features?: {
        tippingEnabled?: boolean;
        withdrawalsEnabled?: boolean;
        stakingEnabled?: boolean;
        tradingEnabled?: boolean;
    };
    limits?: {
        dailyWithdrawal?: number;
        singleWithdrawal?: number;
        dailySpend?: number;
        singleTransaction?: number;
        minimumWithdrawal?: number;
        withdrawalCooldown?: number;
    };
    pendingBalance?: number;
    lockedBalance?: number;
    totalEarned?: number;
    totalSpent?: number;
    totalWithdrawn?: number;
    withdrawalAddress?: string;
    lockedUntil?: string;
    lockReason?: string;
}, {
    id?: string;
    createdAt?: string;
    updatedAt?: string;
    isLocked?: boolean;
    isActive?: boolean;
    userId?: string;
    balance?: number;
    features?: {
        tippingEnabled?: boolean;
        withdrawalsEnabled?: boolean;
        stakingEnabled?: boolean;
        tradingEnabled?: boolean;
    };
    limits?: {
        dailyWithdrawal?: number;
        singleWithdrawal?: number;
        dailySpend?: number;
        singleTransaction?: number;
        minimumWithdrawal?: number;
        withdrawalCooldown?: number;
    };
    pendingBalance?: number;
    lockedBalance?: number;
    totalEarned?: number;
    totalSpent?: number;
    totalWithdrawn?: number;
    withdrawalAddress?: string;
    lockedUntil?: string;
    lockReason?: string;
}>;
export declare const TransactionMetadataSchema: z.ZodObject<{
    ipAddress: z.ZodString;
    userAgent: z.ZodString;
    externalId: z.ZodOptional<z.ZodString>;
    blockchainTxHash: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    ipAddress?: string;
    userAgent?: string;
    notes?: string;
    externalId?: string;
    blockchainTxHash?: string;
}, {
    ipAddress?: string;
    userAgent?: string;
    notes?: string;
    externalId?: string;
    blockchainTxHash?: string;
}>;
export declare const TransactionSchema: z.ZodObject<{
    id: z.ZodString;
    type: z.ZodString;
    status: z.ZodString;
    fromWalletId: z.ZodNullable<z.ZodString>;
    toWalletId: z.ZodNullable<z.ZodString>;
    amount: z.ZodNumber;
    fee: z.ZodNumber;
    netAmount: z.ZodNumber;
    currency: z.ZodLiteral<"DGT">;
    reference: z.ZodObject<{
        type: z.ZodEnum<["tip", "purchase", "withdrawal", "deposit", "reward", "refund"]>;
        id: z.ZodString;
        description: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        type?: "purchase" | "reward" | "tip" | "withdrawal" | "deposit" | "refund";
        description?: string;
        id?: string;
    }, {
        type?: "purchase" | "reward" | "tip" | "withdrawal" | "deposit" | "refund";
        description?: string;
        id?: string;
    }>;
    metadata: z.ZodObject<{
        ipAddress: z.ZodString;
        userAgent: z.ZodString;
        externalId: z.ZodOptional<z.ZodString>;
        blockchainTxHash: z.ZodOptional<z.ZodString>;
        notes: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        ipAddress?: string;
        userAgent?: string;
        notes?: string;
        externalId?: string;
        blockchainTxHash?: string;
    }, {
        ipAddress?: string;
        userAgent?: string;
        notes?: string;
        externalId?: string;
        blockchainTxHash?: string;
    }>;
    createdAt: z.ZodString;
    completedAt: z.ZodNullable<z.ZodString>;
    failedAt: z.ZodNullable<z.ZodString>;
    failureReason: z.ZodNullable<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type?: string;
    id?: string;
    createdAt?: string;
    status?: string;
    currency?: "DGT";
    metadata?: {
        ipAddress?: string;
        userAgent?: string;
        notes?: string;
        externalId?: string;
        blockchainTxHash?: string;
    };
    amount?: number;
    completedAt?: string;
    failureReason?: string;
    reference?: {
        type?: "purchase" | "reward" | "tip" | "withdrawal" | "deposit" | "refund";
        description?: string;
        id?: string;
    };
    fromWalletId?: string;
    toWalletId?: string;
    fee?: number;
    netAmount?: number;
    failedAt?: string;
}, {
    type?: string;
    id?: string;
    createdAt?: string;
    status?: string;
    currency?: "DGT";
    metadata?: {
        ipAddress?: string;
        userAgent?: string;
        notes?: string;
        externalId?: string;
        blockchainTxHash?: string;
    };
    amount?: number;
    completedAt?: string;
    failureReason?: string;
    reference?: {
        type?: "purchase" | "reward" | "tip" | "withdrawal" | "deposit" | "refund";
        description?: string;
        id?: string;
    };
    fromWalletId?: string;
    toWalletId?: string;
    fee?: number;
    netAmount?: number;
    failedAt?: string;
}>;
export declare const ItemPriceSchema: z.ZodObject<{
    dgt: z.ZodNumber;
    originalPrice: z.ZodOptional<z.ZodNumber>;
    discount: z.ZodOptional<z.ZodObject<{
        percentage: z.ZodNumber;
        endsAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        percentage?: number;
        endsAt?: string;
    }, {
        percentage?: number;
        endsAt?: string;
    }>>;
    bundlePrice: z.ZodOptional<z.ZodObject<{
        quantity: z.ZodNumber;
        price: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        price?: number;
        quantity?: number;
    }, {
        price?: number;
        quantity?: number;
    }>>;
}, "strip", z.ZodTypeAny, {
    discount?: {
        percentage?: number;
        endsAt?: string;
    };
    dgt?: number;
    originalPrice?: number;
    bundlePrice?: {
        price?: number;
        quantity?: number;
    };
}, {
    discount?: {
        percentage?: number;
        endsAt?: string;
    };
    dgt?: number;
    originalPrice?: number;
    bundlePrice?: {
        price?: number;
        quantity?: number;
    };
}>;
export declare const ItemRequirementsSchema: z.ZodObject<{
    level: z.ZodOptional<z.ZodNumber>;
    role: z.ZodOptional<z.ZodString>;
    achievements: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    items: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    season: z.ZodOptional<z.ZodString>;
    event: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    items?: string[];
    level?: number;
    role?: string;
    achievements?: string[];
    event?: string;
    season?: string;
}, {
    items?: string[];
    level?: number;
    role?: string;
    achievements?: string[];
    event?: string;
    season?: string;
}>;
export declare const ItemMetadataSchema: z.ZodObject<{
    previewUrl: z.ZodOptional<z.ZodString>;
    thumbnailUrl: z.ZodOptional<z.ZodString>;
    animationUrl: z.ZodOptional<z.ZodString>;
    colors: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    effects: z.ZodOptional<z.ZodObject<{
        glow: z.ZodOptional<z.ZodObject<{
            color: z.ZodString;
            intensity: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            color?: string;
            intensity?: number;
        }, {
            color?: string;
            intensity?: number;
        }>>;
        particle: z.ZodOptional<z.ZodObject<{
            type: z.ZodString;
            color: z.ZodString;
            density: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            type?: string;
            color?: string;
            density?: number;
        }, {
            type?: string;
            color?: string;
            density?: number;
        }>>;
        animation: z.ZodOptional<z.ZodObject<{
            type: z.ZodString;
            duration: z.ZodNumber;
            loop: z.ZodBoolean;
        }, "strip", z.ZodTypeAny, {
            type?: string;
            duration?: number;
            loop?: boolean;
        }, {
            type?: string;
            duration?: number;
            loop?: boolean;
        }>>;
    }, "strip", z.ZodTypeAny, {
        animation?: {
            type?: string;
            duration?: number;
            loop?: boolean;
        };
        glow?: {
            color?: string;
            intensity?: number;
        };
        particle?: {
            type?: string;
            color?: string;
            density?: number;
        };
    }, {
        animation?: {
            type?: string;
            duration?: number;
            loop?: boolean;
        };
        glow?: {
            color?: string;
            intensity?: number;
        };
        particle?: {
            type?: string;
            color?: string;
            density?: number;
        };
    }>>;
    stats: z.ZodOptional<z.ZodObject<{
        durability: z.ZodOptional<z.ZodNumber>;
        uses: z.ZodOptional<z.ZodNumber>;
        cooldown: z.ZodOptional<z.ZodNumber>;
        bonusXp: z.ZodOptional<z.ZodNumber>;
        bonusDgt: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        cooldown?: number;
        durability?: number;
        uses?: number;
        bonusXp?: number;
        bonusDgt?: number;
    }, {
        cooldown?: number;
        durability?: number;
        uses?: number;
        bonusXp?: number;
        bonusDgt?: number;
    }>>;
    tags: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    tags?: string[];
    previewUrl?: string;
    thumbnailUrl?: string;
    colors?: string[];
    stats?: {
        cooldown?: number;
        durability?: number;
        uses?: number;
        bonusXp?: number;
        bonusDgt?: number;
    };
    animationUrl?: string;
    effects?: {
        animation?: {
            type?: string;
            duration?: number;
            loop?: boolean;
        };
        glow?: {
            color?: string;
            intensity?: number;
        };
        particle?: {
            type?: string;
            color?: string;
            density?: number;
        };
    };
}, {
    tags?: string[];
    previewUrl?: string;
    thumbnailUrl?: string;
    colors?: string[];
    stats?: {
        cooldown?: number;
        durability?: number;
        uses?: number;
        bonusXp?: number;
        bonusDgt?: number;
    };
    animationUrl?: string;
    effects?: {
        animation?: {
            type?: string;
            duration?: number;
            loop?: boolean;
        };
        glow?: {
            color?: string;
            intensity?: number;
        };
        particle?: {
            type?: string;
            color?: string;
            density?: number;
        };
    };
}>;
export declare const ItemStockSchema: z.ZodObject<{
    type: z.ZodEnum<["unlimited", "limited", "unique"]>;
    total: z.ZodOptional<z.ZodNumber>;
    remaining: z.ZodOptional<z.ZodNumber>;
    perUser: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    total?: number;
    type?: "unique" | "limited" | "unlimited";
    remaining?: number;
    perUser?: number;
}, {
    total?: number;
    type?: "unique" | "limited" | "unlimited";
    remaining?: number;
    perUser?: number;
}>;
export declare const ShopItemSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodString;
    category: z.ZodEnum<["frame", "badge", "title", "effect", "emoji", "theme"]>;
    type: z.ZodEnum<["cosmetic", "consumable", "permanent", "limited"]>;
    rarity: z.ZodEnum<["common", "rare", "epic", "legendary", "mythic"]>;
    price: z.ZodObject<{
        dgt: z.ZodNumber;
        originalPrice: z.ZodOptional<z.ZodNumber>;
        discount: z.ZodOptional<z.ZodObject<{
            percentage: z.ZodNumber;
            endsAt: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            percentage?: number;
            endsAt?: string;
        }, {
            percentage?: number;
            endsAt?: string;
        }>>;
        bundlePrice: z.ZodOptional<z.ZodObject<{
            quantity: z.ZodNumber;
            price: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            price?: number;
            quantity?: number;
        }, {
            price?: number;
            quantity?: number;
        }>>;
    }, "strip", z.ZodTypeAny, {
        discount?: {
            percentage?: number;
            endsAt?: string;
        };
        dgt?: number;
        originalPrice?: number;
        bundlePrice?: {
            price?: number;
            quantity?: number;
        };
    }, {
        discount?: {
            percentage?: number;
            endsAt?: string;
        };
        dgt?: number;
        originalPrice?: number;
        bundlePrice?: {
            price?: number;
            quantity?: number;
        };
    }>;
    requirements: z.ZodObject<{
        level: z.ZodOptional<z.ZodNumber>;
        role: z.ZodOptional<z.ZodString>;
        achievements: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        items: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        season: z.ZodOptional<z.ZodString>;
        event: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        items?: string[];
        level?: number;
        role?: string;
        achievements?: string[];
        event?: string;
        season?: string;
    }, {
        items?: string[];
        level?: number;
        role?: string;
        achievements?: string[];
        event?: string;
        season?: string;
    }>;
    metadata: z.ZodObject<{
        previewUrl: z.ZodOptional<z.ZodString>;
        thumbnailUrl: z.ZodOptional<z.ZodString>;
        animationUrl: z.ZodOptional<z.ZodString>;
        colors: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        effects: z.ZodOptional<z.ZodObject<{
            glow: z.ZodOptional<z.ZodObject<{
                color: z.ZodString;
                intensity: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                color?: string;
                intensity?: number;
            }, {
                color?: string;
                intensity?: number;
            }>>;
            particle: z.ZodOptional<z.ZodObject<{
                type: z.ZodString;
                color: z.ZodString;
                density: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                type?: string;
                color?: string;
                density?: number;
            }, {
                type?: string;
                color?: string;
                density?: number;
            }>>;
            animation: z.ZodOptional<z.ZodObject<{
                type: z.ZodString;
                duration: z.ZodNumber;
                loop: z.ZodBoolean;
            }, "strip", z.ZodTypeAny, {
                type?: string;
                duration?: number;
                loop?: boolean;
            }, {
                type?: string;
                duration?: number;
                loop?: boolean;
            }>>;
        }, "strip", z.ZodTypeAny, {
            animation?: {
                type?: string;
                duration?: number;
                loop?: boolean;
            };
            glow?: {
                color?: string;
                intensity?: number;
            };
            particle?: {
                type?: string;
                color?: string;
                density?: number;
            };
        }, {
            animation?: {
                type?: string;
                duration?: number;
                loop?: boolean;
            };
            glow?: {
                color?: string;
                intensity?: number;
            };
            particle?: {
                type?: string;
                color?: string;
                density?: number;
            };
        }>>;
        stats: z.ZodOptional<z.ZodObject<{
            durability: z.ZodOptional<z.ZodNumber>;
            uses: z.ZodOptional<z.ZodNumber>;
            cooldown: z.ZodOptional<z.ZodNumber>;
            bonusXp: z.ZodOptional<z.ZodNumber>;
            bonusDgt: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            cooldown?: number;
            durability?: number;
            uses?: number;
            bonusXp?: number;
            bonusDgt?: number;
        }, {
            cooldown?: number;
            durability?: number;
            uses?: number;
            bonusXp?: number;
            bonusDgt?: number;
        }>>;
        tags: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        tags?: string[];
        previewUrl?: string;
        thumbnailUrl?: string;
        colors?: string[];
        stats?: {
            cooldown?: number;
            durability?: number;
            uses?: number;
            bonusXp?: number;
            bonusDgt?: number;
        };
        animationUrl?: string;
        effects?: {
            animation?: {
                type?: string;
                duration?: number;
                loop?: boolean;
            };
            glow?: {
                color?: string;
                intensity?: number;
            };
            particle?: {
                type?: string;
                color?: string;
                density?: number;
            };
        };
    }, {
        tags?: string[];
        previewUrl?: string;
        thumbnailUrl?: string;
        colors?: string[];
        stats?: {
            cooldown?: number;
            durability?: number;
            uses?: number;
            bonusXp?: number;
            bonusDgt?: number;
        };
        animationUrl?: string;
        effects?: {
            animation?: {
                type?: string;
                duration?: number;
                loop?: boolean;
            };
            glow?: {
                color?: string;
                intensity?: number;
            };
            particle?: {
                type?: string;
                color?: string;
                density?: number;
            };
        };
    }>;
    stock: z.ZodObject<{
        type: z.ZodEnum<["unlimited", "limited", "unique"]>;
        total: z.ZodOptional<z.ZodNumber>;
        remaining: z.ZodOptional<z.ZodNumber>;
        perUser: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        total?: number;
        type?: "unique" | "limited" | "unlimited";
        remaining?: number;
        perUser?: number;
    }, {
        total?: number;
        type?: "unique" | "limited" | "unlimited";
        remaining?: number;
        perUser?: number;
    }>;
    isActive: z.ZodBoolean;
    isFeatured: z.ZodBoolean;
    displayOrder: z.ZodNumber;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name?: string;
    type?: "cosmetic" | "consumable" | "permanent" | "limited";
    description?: string;
    id?: string;
    createdAt?: string;
    updatedAt?: string;
    rarity?: "common" | "rare" | "epic" | "legendary" | "mythic";
    isActive?: boolean;
    isFeatured?: boolean;
    category?: "badge" | "title" | "emoji" | "effect" | "theme" | "frame";
    metadata?: {
        tags?: string[];
        previewUrl?: string;
        thumbnailUrl?: string;
        colors?: string[];
        stats?: {
            cooldown?: number;
            durability?: number;
            uses?: number;
            bonusXp?: number;
            bonusDgt?: number;
        };
        animationUrl?: string;
        effects?: {
            animation?: {
                type?: string;
                duration?: number;
                loop?: boolean;
            };
            glow?: {
                color?: string;
                intensity?: number;
            };
            particle?: {
                type?: string;
                color?: string;
                density?: number;
            };
        };
    };
    price?: {
        discount?: {
            percentage?: number;
            endsAt?: string;
        };
        dgt?: number;
        originalPrice?: number;
        bundlePrice?: {
            price?: number;
            quantity?: number;
        };
    };
    stock?: {
        total?: number;
        type?: "unique" | "limited" | "unlimited";
        remaining?: number;
        perUser?: number;
    };
    displayOrder?: number;
    requirements?: {
        items?: string[];
        level?: number;
        role?: string;
        achievements?: string[];
        event?: string;
        season?: string;
    };
}, {
    name?: string;
    type?: "cosmetic" | "consumable" | "permanent" | "limited";
    description?: string;
    id?: string;
    createdAt?: string;
    updatedAt?: string;
    rarity?: "common" | "rare" | "epic" | "legendary" | "mythic";
    isActive?: boolean;
    isFeatured?: boolean;
    category?: "badge" | "title" | "emoji" | "effect" | "theme" | "frame";
    metadata?: {
        tags?: string[];
        previewUrl?: string;
        thumbnailUrl?: string;
        colors?: string[];
        stats?: {
            cooldown?: number;
            durability?: number;
            uses?: number;
            bonusXp?: number;
            bonusDgt?: number;
        };
        animationUrl?: string;
        effects?: {
            animation?: {
                type?: string;
                duration?: number;
                loop?: boolean;
            };
            glow?: {
                color?: string;
                intensity?: number;
            };
            particle?: {
                type?: string;
                color?: string;
                density?: number;
            };
        };
    };
    price?: {
        discount?: {
            percentage?: number;
            endsAt?: string;
        };
        dgt?: number;
        originalPrice?: number;
        bundlePrice?: {
            price?: number;
            quantity?: number;
        };
    };
    stock?: {
        total?: number;
        type?: "unique" | "limited" | "unlimited";
        remaining?: number;
        perUser?: number;
    };
    displayOrder?: number;
    requirements?: {
        items?: string[];
        level?: number;
        role?: string;
        achievements?: string[];
        event?: string;
        season?: string;
    };
}>;
export type UserSchemaType = z.infer<typeof UserSchema>;
export type ForumSchemaType = z.infer<typeof ForumSchema>;
export type ThreadSchemaType = z.infer<typeof ThreadSchema>;
export type PostSchemaType = z.infer<typeof PostSchema>;
export type WalletSchemaType = z.infer<typeof WalletSchema>;
export type TransactionSchemaType = z.infer<typeof TransactionSchema>;
export type ShopItemSchemaType = z.infer<typeof ShopItemSchema>;
export declare function validateUser(data: unknown): UserSchemaType;
export declare function validateForum(data: unknown): ForumSchemaType;
export declare function validateThread(data: unknown): ThreadSchemaType;
export declare function validatePost(data: unknown): PostSchemaType;
export declare function validateWallet(data: unknown): WalletSchemaType;
export declare function validateTransaction(data: unknown): TransactionSchemaType;
export declare function validateShopItem(data: unknown): ShopItemSchemaType;
