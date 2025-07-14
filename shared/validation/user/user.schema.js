"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSearchParamsSchema = exports.CreateUserRequestSchema = exports.UpdateUserRequestSchema = exports.UserSchema = exports.UserProfileSchema = exports.UserFrameSchema = exports.UserTitleSchema = exports.UserBadgeSchema = exports.UserStatsSchema = exports.UserSettingsSchema = exports.PrivacySettingsSchema = exports.NotificationSettingsSchema = exports.DisplaySettingsSchema = exports.LevelConfigSchema = void 0;
// STREAM-LOCK: B
var zod_1 = require("zod");
/**
 * Zod schemas for user validation
 * These schemas must mirror the interfaces in shared/types/core/user.types.ts
 */
exports.LevelConfigSchema = zod_1.z.object({
    level: zod_1.z.number().int().min(1),
    name: zod_1.z.string().min(1),
    minXp: zod_1.z.number().int().min(0),
    maxXp: zod_1.z.number().int().min(0),
    color: zod_1.z.string().min(1)
});
exports.DisplaySettingsSchema = zod_1.z.object({
    language: zod_1.z.string().min(1),
    timezone: zod_1.z.string().min(1),
    dateFormat: zod_1.z.enum(['relative', 'absolute']),
    showSignatures: zod_1.z.boolean(),
    postsPerPage: zod_1.z.number().int().min(1).max(100),
    theme: zod_1.z.string().min(1),
    fontSize: zod_1.z.string().min(1),
    threadDisplayMode: zod_1.z.string().min(1),
    reducedMotion: zod_1.z.boolean(),
    hideNsfw: zod_1.z.boolean(),
    showMatureContent: zod_1.z.boolean(),
    showOfflineUsers: zod_1.z.boolean()
});
exports.NotificationSettingsSchema = zod_1.z.object({
    email: zod_1.z.object({
        enabled: zod_1.z.boolean(),
        digest: zod_1.z.enum(['none', 'daily', 'weekly']),
        mentions: zod_1.z.boolean(),
        replies: zod_1.z.boolean(),
        tips: zod_1.z.boolean()
    }),
    push: zod_1.z.object({
        enabled: zod_1.z.boolean(),
        mentions: zod_1.z.boolean(),
        replies: zod_1.z.boolean(),
        tips: zod_1.z.boolean()
    })
});
exports.PrivacySettingsSchema = zod_1.z.object({
    profileVisibility: zod_1.z.enum(['public', 'friends', 'private']),
    showLevel: zod_1.z.boolean(),
    showStats: zod_1.z.boolean(),
    allowMessages: zod_1.z.boolean(),
    allowFriendRequests: zod_1.z.boolean()
});
exports.UserSettingsSchema = zod_1.z.object({
    theme: zod_1.z.enum(['light', 'dark', 'system']),
    notifications: exports.NotificationSettingsSchema,
    privacy: exports.PrivacySettingsSchema,
    display: exports.DisplaySettingsSchema
});
exports.UserStatsSchema = zod_1.z.object({
    postCount: zod_1.z.number().int().min(0),
    threadCount: zod_1.z.number().int().min(0),
    tipsSent: zod_1.z.number().int().min(0),
    tipsReceived: zod_1.z.number().int().min(0),
    reputation: zod_1.z.number().int(),
    totalXp: zod_1.z.number().int().min(0),
    dailyStreak: zod_1.z.number().int().min(0),
    bestStreak: zod_1.z.number().int().min(0),
    achievementCount: zod_1.z.number().int().min(0),
    lastPostAt: zod_1.z.date().nullable(),
    joinedAt: zod_1.z.date()
});
exports.UserBadgeSchema = zod_1.z.object({
    id: zod_1.z.string().min(1),
    name: zod_1.z.string().min(1),
    description: zod_1.z.string().min(1),
    imageUrl: zod_1.z.string().url(),
    rarity: zod_1.z.enum(['common', 'rare', 'epic', 'legendary', 'mythic']),
    unlockedAt: zod_1.z.date()
});
exports.UserTitleSchema = zod_1.z.object({
    id: zod_1.z.string().min(1),
    text: zod_1.z.string().min(1),
    color: zod_1.z.string().min(1),
    effects: zod_1.z
        .object({
        glow: zod_1.z.boolean().optional(),
        animate: zod_1.z.boolean().optional(),
        gradient: zod_1.z.array(zod_1.z.string()).optional()
    })
        .optional()
});
exports.UserFrameSchema = zod_1.z.object({
    id: zod_1.z.string().min(1),
    name: zod_1.z.string().min(1),
    previewUrl: zod_1.z.string().url(),
    cssClass: zod_1.z.string().min(1),
    rarity: zod_1.z.enum(['common', 'rare', 'epic', 'legendary', 'mythic'])
});
exports.UserProfileSchema = zod_1.z.object({
    id: zod_1.z.string().min(1),
    username: zod_1.z.string().min(1),
    level: zod_1.z.number().int().min(1),
    role: zod_1.z.string().min(1),
    profilePictureUrl: zod_1.z.string().url().nullable(),
    bio: zod_1.z.string().nullable(),
    displayName: zod_1.z.string().min(1),
    badges: zod_1.z.array(exports.UserBadgeSchema),
    title: exports.UserTitleSchema.nullable(),
    frame: exports.UserFrameSchema.nullable(),
    isOnline: zod_1.z.boolean(),
    lastSeen: zod_1.z.date(),
    levelConfig: exports.LevelConfigSchema.optional()
});
exports.UserSchema = zod_1.z.object({
    id: zod_1.z.string().min(1),
    username: zod_1.z.string().min(1),
    email: zod_1.z.string().email(),
    emailVerified: zod_1.z.boolean(),
    role: zod_1.z.string().min(1),
    level: zod_1.z.number().int().min(1),
    xp: zod_1.z.number().int().min(0),
    dgt: zod_1.z.number().int().min(0),
    clout: zod_1.z.number().int().min(0),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date(),
    bannedUntil: zod_1.z.date().nullable(),
    profilePictureUrl: zod_1.z.string().url().nullable(),
    bio: zod_1.z.string().nullable(),
    lastActiveAt: zod_1.z.date(),
    settings: exports.UserSettingsSchema,
    stats: exports.UserStatsSchema
});
// Update user request schemas
exports.UpdateUserRequestSchema = zod_1.z.object({
    username: zod_1.z.string().min(1).optional(),
    email: zod_1.z.string().email().optional(),
    bio: zod_1.z.string().nullable().optional(),
    profilePictureUrl: zod_1.z.string().url().nullable().optional(),
    settings: exports.UserSettingsSchema.partial().optional()
});
exports.CreateUserRequestSchema = zod_1.z.object({
    username: zod_1.z.string().min(1),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8),
    referralCode: zod_1.z.string().optional()
});
exports.UserSearchParamsSchema = zod_1.z.object({
    query: zod_1.z.string().optional(),
    role: zod_1.z.string().optional(),
    minLevel: zod_1.z.number().int().min(1).optional(),
    maxLevel: zod_1.z.number().int().min(1).optional(),
    isOnline: zod_1.z.boolean().optional(),
    sortBy: zod_1.z.enum(['username', 'level', 'xp', 'createdAt', 'lastActiveAt']).optional(),
    sortOrder: zod_1.z.enum(['asc', 'desc']).optional()
});
