// STREAM-LOCK: B
import { z } from 'zod';

/**
 * Zod schemas for user validation
 * These schemas must mirror the interfaces in shared/types/core/user.types.ts
 */

export const LevelConfigSchema = z.object({
	level: z.number().int().min(1),
	name: z.string().min(1),
	minXp: z.number().int().min(0),
	maxXp: z.number().int().min(0),
	color: z.string().min(1)
});

export const DisplaySettingsSchema = z.object({
	language: z.string().min(1),
	timezone: z.string().min(1),
	dateFormat: z.enum(['relative', 'absolute']),
	showSignatures: z.boolean(),
	postsPerPage: z.number().int().min(1).max(100),
	theme: z.string().min(1),
	fontSize: z.string().min(1),
	threadDisplayMode: z.string().min(1),
	reducedMotion: z.boolean(),
	hideNsfw: z.boolean(),
	showMatureContent: z.boolean(),
	showOfflineUsers: z.boolean()
});

export const NotificationSettingsSchema = z.object({
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
});

export const PrivacySettingsSchema = z.object({
	profileVisibility: z.enum(['public', 'friends', 'private']),
	showLevel: z.boolean(),
	showStats: z.boolean(),
	allowMessages: z.boolean(),
	allowFriendRequests: z.boolean()
});

export const UserSettingsSchema = z.object({
	theme: z.enum(['light', 'dark', 'system']),
	notifications: NotificationSettingsSchema,
	privacy: PrivacySettingsSchema,
	display: DisplaySettingsSchema
});

export const UserStatsSchema = z.object({
	postCount: z.number().int().min(0),
	threadCount: z.number().int().min(0),
	tipsSent: z.number().int().min(0),
	tipsReceived: z.number().int().min(0),
	reputation: z.number().int(),
	totalXp: z.number().int().min(0),
	dailyStreak: z.number().int().min(0),
	bestStreak: z.number().int().min(0),
	achievementCount: z.number().int().min(0),
	lastPostAt: z.date().nullable(),
	joinedAt: z.date()
});

export const UserBadgeSchema = z.object({
	id: z.string().min(1),
	name: z.string().min(1),
	description: z.string().min(1),
	imageUrl: z.string().url(),
	rarity: z.enum(['common', 'rare', 'epic', 'legendary', 'mythic']),
	unlockedAt: z.date()
});

export const UserTitleSchema = z.object({
	id: z.string().min(1),
	text: z.string().min(1),
	color: z.string().min(1),
	effects: z
		.object({
			glow: z.boolean().optional(),
			animate: z.boolean().optional(),
			gradient: z.array(z.string()).optional()
		})
		.optional()
});

export const UserFrameSchema = z.object({
	id: z.string().min(1),
	name: z.string().min(1),
	previewUrl: z.string().url(),
	cssClass: z.string().min(1),
	rarity: z.enum(['common', 'rare', 'epic', 'legendary', 'mythic'])
});

export const UserProfileSchema = z.object({
	id: z.string().min(1),
	username: z.string().min(1),
	level: z.number().int().min(1),
	role: z.string().min(1),
	profilePictureUrl: z.string().url().nullable(),
	bio: z.string().nullable(),
	displayName: z.string().min(1),
	badges: z.array(UserBadgeSchema),
	title: UserTitleSchema.nullable(),
	frame: UserFrameSchema.nullable(),
	isOnline: z.boolean(),
	lastSeen: z.date(),
	levelConfig: LevelConfigSchema.optional()
});

export const UserSchema = z.object({
	id: z.string().min(1),
	username: z.string().min(1),
	email: z.string().email(),
	emailVerified: z.boolean(),
	role: z.string().min(1),
	level: z.number().int().min(1),
	xp: z.number().int().min(0),
	dgt: z.number().int().min(0),
	reputation: z.number().int().min(0),
	createdAt: z.date(),
	updatedAt: z.date(),
	bannedUntil: z.date().nullable(),
	profilePictureUrl: z.string().url().nullable(),
	bio: z.string().nullable(),
	lastActiveAt: z.date(),
	settings: UserSettingsSchema,
	stats: UserStatsSchema
});

// Update user request schemas
export const UpdateUserRequestSchema = z.object({
	username: z.string().min(1).optional(),
	email: z.string().email().optional(),
	bio: z.string().nullable().optional(),
	profilePictureUrl: z.string().url().nullable().optional(),
	settings: UserSettingsSchema.partial().optional()
});

export const CreateUserRequestSchema = z.object({
	username: z.string().min(1),
	email: z.string().email(),
	password: z.string().min(8),
	referralCode: z.string().optional()
});

export const UserSearchParamsSchema = z.object({
	query: z.string().optional(),
	role: z.string().optional(),
	minLevel: z.number().int().min(1).optional(),
	maxLevel: z.number().int().min(1).optional(),
	isOnline: z.boolean().optional(),
	sortBy: z.enum(['username', 'level', 'xp', 'createdAt', 'lastActiveAt']).optional(),
	sortOrder: z.enum(['asc', 'desc']).optional()
});

// Export schema types
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
