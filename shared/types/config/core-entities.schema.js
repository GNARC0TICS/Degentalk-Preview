import { z } from 'zod';
/**
 * Core Entity Validation Schemas
 *
 * Runtime validation for core domain entities.
 * These schemas validate data at API boundaries and during data transformation.
 */
// User schemas
export const UserSettingsSchema = z.object({
    theme: z.enum(['light', 'dark', 'system']),
    notifications: z.object({
        email: z.object({
            enabled: z.boolean(),
            digest: z.enum(['none', 'daily', 'weekly']),
            mentions: z.boolean(),
            replies: z.boolean(),
            tips: z.boolean()
        }),
        push: z.object({
            enabled: z.boolean(),
            mentions: z.boolean(),
            replies: z.boolean(),
            tips: z.boolean()
        })
    }),
    privacy: z.object({
        profileVisibility: z.enum(['public', 'friends', 'private']),
        showLevel: z.boolean(),
        showStats: z.boolean(),
        allowMessages: z.boolean(),
        allowFriendRequests: z.boolean()
    }),
    display: z.object({
        language: z.string(),
        timezone: z.string(),
        dateFormat: z.enum(['relative', 'absolute']),
        showSignatures: z.boolean(),
        postsPerPage: z.number().positive().max(100)
    })
});
export const UserStatsSchema = z.object({
    postCount: z.number().nonnegative(),
    threadCount: z.number().nonnegative(),
    tipsSent: z.number().nonnegative(),
    tipsReceived: z.number().nonnegative(),
    reputation: z.number(),
    dailyStreak: z.number().nonnegative(),
    bestStreak: z.number().nonnegative(),
    achievementCount: z.number().nonnegative(),
    lastPostAt: z.string().datetime().nullable(),
    joinedAt: z.string().datetime()
});
export const UserSchema = z.object({
    id: z.string().uuid(),
    username: z
        .string()
        .min(3)
        .max(20)
        .regex(/^[a-zA-Z0-9_-]+$/),
    email: z.string().email(),
    emailVerified: z.boolean(),
    role: z.string(),
    level: z.number().nonnegative(),
    xp: z.number().nonnegative(),
    dgt: z.number().nonnegative(),
    clout: z.number(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    bannedUntil: z.string().datetime().nullable(),
    profilePictureUrl: z.string().url().nullable(),
    bio: z.string().max(500).nullable(),
    lastActiveAt: z.string().datetime(),
    settings: UserSettingsSchema,
    stats: UserStatsSchema
});
// Forum schemas
export const ForumSettingsSchema = z.object({
    allowThreads: z.boolean(),
    allowReplies: z.boolean(),
    allowVoting: z.boolean(),
    allowTags: z.boolean(),
    moderationLevel: z.enum(['none', 'low', 'medium', 'high']),
    prefixes: z.array(z.object({
        id: z.string().uuid(),
        text: z.string(),
        color: z.string(),
        backgroundColor: z.string(),
        requiredLevel: z.number().nonnegative(),
        requiredRole: z.string().nullable(),
        displayOrder: z.number()
    })),
    rules: z.array(z.object({
        id: z.string(),
        title: z.string(),
        description: z.string(),
        displayOrder: z.number(),
        severity: z.enum(['info', 'warning', 'critical'])
    })),
    xpMultiplier: z.number().positive(),
    dgtMultiplier: z.number().positive()
});
export const ForumStatsSchema = z.object({
    threadCount: z.number().nonnegative(),
    postCount: z.number().nonnegative(),
    uniquePosters: z.number().nonnegative(),
    lastPostAt: z.string().datetime().nullable(),
    lastThreadAt: z.string().datetime().nullable(),
    todayPosts: z.number().nonnegative(),
    todayThreads: z.number().nonnegative()
});
export const ForumSchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(1).max(100),
    slug: z
        .string()
        .min(1)
        .max(100)
        .regex(/^[a-z0-9-]+$/),
    description: z.string().max(500),
    parentId: z.string().uuid().nullable(),
    displayOrder: z.number().nonnegative(),
    isActive: z.boolean(),
    isPrivate: z.boolean(),
    requiredLevel: z.number().nonnegative(),
    requiredRole: z.string().nullable(),
    settings: ForumSettingsSchema,
    stats: ForumStatsSchema,
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime()
});
export const ThreadMetadataSchema = z.object({
    edited: z.boolean(),
    editedAt: z.string().datetime().nullable(),
    editedBy: z.string().uuid().nullable(),
    editReason: z.string().nullable(),
    upvotes: z.number().nonnegative(),
    downvotes: z.number().nonnegative(),
    score: z.number(),
    mentionedUsers: z.array(z.string().uuid())
});
export const ThreadSchema = z.object({
    id: z.string().uuid(),
    forumId: z.string().uuid(),
    authorId: z.string().uuid(),
    title: z.string().min(1).max(200),
    content: z.string().min(1),
    status: z.string(),
    isPinned: z.boolean(),
    isLocked: z.boolean(),
    isHot: z.boolean(),
    viewCount: z.number().nonnegative(),
    replyCount: z.number().nonnegative(),
    lastReplyAt: z.string().datetime().nullable(),
    lastReplyBy: z.string().uuid().nullable(),
    tags: z.array(z.string()),
    prefix: z
        .object({
        id: z.string().uuid(),
        text: z.string(),
        color: z.string(),
        backgroundColor: z.string()
    })
        .nullable(),
    metadata: ThreadMetadataSchema,
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    deletedAt: z.string().datetime().nullable()
});
export const PostMetadataSchema = z.object({
    edited: z.boolean(),
    editedAt: z.string().datetime().nullable(),
    editedBy: z.string().uuid().nullable(),
    editReason: z.string().nullable(),
    upvotes: z.number().nonnegative(),
    downvotes: z.number().nonnegative(),
    tipCount: z.number().nonnegative(),
    tipTotal: z.number().nonnegative(),
    mentionedUsers: z.array(z.string().uuid()),
    quotedPost: z.string().uuid().nullable()
});
export const PostSchema = z.object({
    id: z.string().uuid(),
    threadId: z.string().uuid(),
    authorId: z.string().uuid(),
    parentId: z.string().uuid().nullable(),
    content: z.string().min(1),
    status: z.string(),
    isDeleted: z.boolean(),
    metadata: PostMetadataSchema,
    reactions: z.array(z.object({
        userId: z.string().uuid(),
        emoji: z.string(),
        createdAt: z.string().datetime()
    })),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    deletedAt: z.string().datetime().nullable()
});
// Wallet schemas
export const WalletFeaturesSchema = z.object({
    withdrawalsEnabled: z.boolean(),
    stakingEnabled: z.boolean(),
    tradingEnabled: z.boolean(),
    tippingEnabled: z.boolean()
});
export const WalletLimitsSchema = z.object({
    dailyWithdrawal: z.number().nonnegative(),
    singleWithdrawal: z.number().nonnegative(),
    dailySpend: z.number().nonnegative(),
    singleTransaction: z.number().nonnegative(),
    minimumWithdrawal: z.number().nonnegative(),
    withdrawalCooldown: z.number().nonnegative()
});
export const WalletSchema = z.object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    balance: z.number().nonnegative(),
    pendingBalance: z.number().nonnegative(),
    lockedBalance: z.number().nonnegative(),
    totalEarned: z.number().nonnegative(),
    totalSpent: z.number().nonnegative(),
    totalWithdrawn: z.number().nonnegative(),
    withdrawalAddress: z.string().nullable(),
    isActive: z.boolean(),
    isLocked: z.boolean(),
    lockedUntil: z.string().datetime().nullable(),
    lockReason: z.string().nullable(),
    features: WalletFeaturesSchema,
    limits: WalletLimitsSchema,
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime()
});
export const TransactionMetadataSchema = z.object({
    ipAddress: z.string(),
    userAgent: z.string(),
    externalId: z.string().optional(),
    blockchainTxHash: z.string().optional(),
    notes: z.string().optional()
});
export const TransactionSchema = z.object({
    id: z.string().uuid(),
    type: z.string(),
    status: z.string(),
    fromWalletId: z.string().uuid().nullable(),
    toWalletId: z.string().uuid().nullable(),
    amount: z.number().nonnegative(),
    fee: z.number().nonnegative(),
    netAmount: z.number().nonnegative(),
    currency: z.literal('DGT'),
    reference: z.object({
        type: z.enum(['tip', 'purchase', 'withdrawal', 'deposit', 'reward', 'refund']),
        id: z.string(),
        description: z.string()
    }),
    metadata: TransactionMetadataSchema,
    createdAt: z.string().datetime(),
    completedAt: z.string().datetime().nullable(),
    failedAt: z.string().datetime().nullable(),
    failureReason: z.string().nullable()
});
// Shop Item schemas
export const ItemPriceSchema = z.object({
    dgt: z.number().positive(),
    originalPrice: z.number().positive().optional(),
    discount: z
        .object({
        percentage: z.number().min(0).max(1),
        endsAt: z.string().datetime()
    })
        .optional(),
    bundlePrice: z
        .object({
        quantity: z.number().positive(),
        price: z.number().positive()
    })
        .optional()
});
export const ItemRequirementsSchema = z.object({
    level: z.number().nonnegative().optional(),
    role: z.string().optional(),
    achievements: z.array(z.string()).optional(),
    items: z.array(z.string().uuid()).optional(),
    season: z.string().optional(),
    event: z.string().optional()
});
export const ItemMetadataSchema = z.object({
    previewUrl: z.string().url().optional(),
    thumbnailUrl: z.string().url().optional(),
    animationUrl: z.string().url().optional(),
    colors: z.array(z.string()).optional(),
    effects: z
        .object({
        glow: z
            .object({
            color: z.string(),
            intensity: z.number().min(0).max(1)
        })
            .optional(),
        particle: z
            .object({
            type: z.string(),
            color: z.string(),
            density: z.number().min(0).max(1)
        })
            .optional(),
        animation: z
            .object({
            type: z.string(),
            duration: z.number().positive(),
            loop: z.boolean()
        })
            .optional()
    })
        .optional(),
    stats: z
        .object({
        durability: z.number().positive().optional(),
        uses: z.number().positive().optional(),
        cooldown: z.number().nonnegative().optional(),
        bonusXp: z.number().nonnegative().optional(),
        bonusDgt: z.number().nonnegative().optional()
    })
        .optional(),
    tags: z.array(z.string())
});
export const ItemStockSchema = z.object({
    type: z.enum(['unlimited', 'limited', 'unique']),
    total: z.number().positive().optional(),
    remaining: z.number().nonnegative().optional(),
    perUser: z.number().positive().optional()
});
export const ShopItemSchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(1).max(100),
    description: z.string().max(500),
    category: z.enum(['frame', 'badge', 'title', 'effect', 'emoji', 'theme']),
    type: z.enum(['cosmetic', 'consumable', 'permanent', 'limited']),
    rarity: z.enum(['common', 'rare', 'epic', 'legendary', 'mythic']),
    price: ItemPriceSchema,
    requirements: ItemRequirementsSchema,
    metadata: ItemMetadataSchema,
    stock: ItemStockSchema,
    isActive: z.boolean(),
    isFeatured: z.boolean(),
    displayOrder: z.number().nonnegative(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime()
});
// Validation helpers
export function validateUser(data) {
    return UserSchema.parse(data);
}
export function validateForum(data) {
    return ForumSchema.parse(data);
}
export function validateThread(data) {
    return ThreadSchema.parse(data);
}
export function validatePost(data) {
    return PostSchema.parse(data);
}
export function validateWallet(data) {
    return WalletSchema.parse(data);
}
export function validateTransaction(data) {
    return TransactionSchema.parse(data);
}
export function validateShopItem(data) {
    return ShopItemSchema.parse(data);
}
