import type { AnyPgColumn, uuid } from 'drizzle-orm/pg-core';

import {
	pgTable,
	text,
	varchar,
	boolean,
	timestamp,
	integer,
	bigint,
	uuid,
	jsonb,
	unique
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { userRoleEnum } from '../../../shared/enums/user';
import { roles } from './roles';
import { titles } from '../economy/titles';
import { badges } from '../economy/badges';
import { avatarFrames } from './avatarFrames';
import { posts } from '../forum/posts';
// import { userGroups } from "./userGroups"; // Placeholder for future import
// import { titles } from "../economy/titles"; // Placeholder for future import
// import { badges } from "../economy/badges"; // Placeholder for future import
// import { avatarFrames } from "./avatarFrames"; // Placeholder for future import
// import { uiThemes } from '../admin/themes'; // For future profile theme support

export const users = pgTable(
	'users',
	{
		id: uuid('user_id').primaryKey().defaultRandom(),
		username: text('username').notNull(),
		email: text('email').notNull(),
		password: text('password_hash').notNull(),
		bio: text('bio'),
		signature: text('signature'),
		avatarUrl: varchar('avatar_url', { length: 255 }),
		activeAvatarUrl: varchar('active_avatar_url', { length: 255 }),
		profileBannerUrl: varchar('profile_banner_url', { length: 255 }),
		activeFrameId: integer('active_frame_id').references(() => avatarFrames.id, {
			onDelete: 'set null'
		}),
		avatarFrameId: integer('avatar_frame_id').references(() => avatarFrames.id, {
			onDelete: 'set null'
		}),
		/**
		 * Primary role for the user – replaces legacy groupId.
		 * Nullable to support users without explicit role (falls back to default).
		 */
		primaryRoleId: integer('primary_role_id').references(() => roles.id, { onDelete: 'set null' }),
		discordHandle: varchar('discord_handle', { length: 255 }),
		twitterHandle: varchar('twitter_handle', { length: 255 }),
		website: varchar('website', { length: 255 }),
		telegramHandle: varchar('telegram_handle', { length: 255 }),
		// X (Twitter) Integration Fields
		xAccountId: varchar('x_account_id', { length: 255 }),
		xAccessToken: text('x_access_token'),
		xRefreshToken: text('x_refresh_token'),
		xTokenExpiresAt: timestamp('x_token_expires_at'),
		xLinkedAt: timestamp('x_linked_at'),
		isActive: boolean('is_active').notNull().default(true),
		isVerified: boolean('is_verified').notNull().default(false),
		isDeleted: boolean('is_deleted').notNull().default(false),
		isBanned: boolean('is_banned').notNull().default(false),
		isShadowbanned: boolean('is_shadowbanned').notNull().default(false),
		subscribedToNewsletter: boolean('subscribed_to_newsletter').notNull().default(false),
		lastSeenAt: timestamp('last_seen_at'),
		createdAt: timestamp('created_at')
			.notNull()
			.default(sql`CURRENT_TIMESTAMP`),
		lastLogin: timestamp('last_login'),
		// TODO: self-reference FK (referrerId → users.id) should be added via migration or pgTable foreignKey config once TypeScript circular reference issue is resolved
		referrerId: uuid('referrer_id').references((): AnyPgColumn => users.id as AnyPgColumn, {
			onDelete: 'set null'
		}),
		referralLevel: integer('referral_level'),
		xp: bigint('xp', { mode: 'number' }).notNull().default(0),
		level: integer('level').notNull().default(1),
		clout: integer('clout').notNull().default(0),
		activeTitleId: integer('active_title_id').references(() => titles.id, { onDelete: 'set null' }),
		activeBadgeId: integer('active_badge_id').references(() => badges.id, { onDelete: 'set null' }),
		dgtPoints: integer('dgt_points').notNull().default(0),
		dgtWalletBalance: integer('dgt_wallet_balance').notNull().default(0),
		// Enhanced profile metrics
		dgtBalance: bigint('dgt_balance', { mode: 'number' }).notNull().default(0),
		reputation: integer('reputation').notNull().default(0),
		totalPosts: integer('total_posts').notNull().default(0),
		totalThreads: integer('total_threads').notNull().default(0),
		totalLikes: integer('total_likes').notNull().default(0),
		totalTips: integer('total_tips').notNull().default(0),
		nextLevelXp: integer('next_level_xp').notNull().default(100),
		// Profile system enhancements
		pointsVersion: integer('points_version').notNull().default(1),
		dailyXpGained: integer('daily_xp_gained').notNull().default(0),
		lastXpGainDate: timestamp('last_xp_gain_date'),
		friendRequestsSent: integer('friend_requests_sent').notNull().default(0),
		friendRequestsReceived: integer('friend_requests_received').notNull().default(0),
		isStaff: boolean('is_staff').notNull().default(false),
		isModerator: boolean('is_moderator').notNull().default(false),
		isAdmin: boolean('is_admin').notNull().default(false),
		/** @deprecated – use primaryRoleId and roles table */
		role: userRoleEnum('role').default('user'),
		walletAddress: varchar('wallet_address', { length: 255 }),
		encryptedPrivateKey: varchar('encrypted_private_key', { length: 512 }),
		walletBalanceUSDT: bigint('wallet_balance_usdt', { mode: 'number' }).notNull().default(0), // Corrected to bigint based on schema.ts (doublePrecision was used there, but bigint seems more appropriate for currency)
		walletPendingWithdrawals: bigint('wallet_pending_withdrawals', { mode: 'number' })
			.notNull()
			.default(0),
		ccpaymentAccountId: varchar('ccpayment_account_id', { length: 100 }),
		verifyToken: varchar('verify_token', { length: 255 }),
		resetToken: varchar('reset_token', { length: 255 }),
		resetTokenExpiresAt: timestamp('reset_token_expires_at'),
		gdprConsentedAt: timestamp('gdpr_consented_at'),
		tosAgreedAt: timestamp('tos_agreed_at'),
		privacyAgreedAt: timestamp('privacy_agreed_at'),
		pathXp: jsonb('path_xp').default('{}'),
		pathMultipliers: jsonb('path_multipliers').default('{}'),
		pluginData: jsonb('plugin_data').default('{}'),
		statusLine: text('status_line'),
		pinnedPostId: uuid('pinned_post_id').references((): AnyPgColumn => posts.id as AnyPgColumn, {
			onDelete: 'set null'
		}),
		// Optional future enhancements
		// profileThemeId: integer('profile_theme_id').references(() => uiThemes.id, { onDelete: 'set null' }),
		// resumeSlug: text('resume_slug'),
		updatedAt: timestamp('updated_at').defaultNow().notNull(),
		/** @deprecated – legacy group integer. Planned removal Q4 */
		groupId: integer('group_id')
	},
	(table) => ({
		usernameUnique: unique('users_username_unique').on(table.username),
		emailUnique: unique('users_email_unique').on(table.email)
		// referrerIdx: index('idx_users_referrer_id').on(table.referrerId), // Drizzle infers this
		// groupIdx: index('idx_users_group_id').on(table.groupId) // Drizzle infers this
	})
);

// Define relations for users table (placeholders, to be filled when related tables are moved)
// import { relations } from "drizzle-orm";
// import { posts } from "../forum/posts"; // Example
// import { threads } from "../forum/threads"; // Example
// export const usersRelations = relations(users, ({ one, many }) => ({
//   group: one(userGroups, { fields: [users.groupId], references: [userGroups.id] }),
//   posts: many(posts),
//   threads: many(threads),
//   activeTitle: one(titles, { fields: [users.activeTitleId], references: [titles.id] }),
//   // ... other relations
// }));

// Zod schema for validation (example, adjust as needed)
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

export const insertUserSchema = createInsertSchema(users, {
	email: z.string().email(),
	username: z.string().min(3).max(50),
	password: z.string().min(8),
	tosAgreedAt: z.date().optional(),
	privacyAgreedAt: z.date().optional()
}).omit({
	id: true,
	isActive: true,
	isVerified: true,
	isDeleted: true,
	isBanned: true,
	createdAt: true,
	lastLogin: true,
	referralLevel: true,
	xp: true,
	level: true,
	dgtPoints: true,
	pointsVersion: true,
	verifyToken: true,
	resetToken: true,
	resetTokenExpiresAt: true,
	gdprConsentedAt: true
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

/**
 * Performance Indices (Applied via Migration)
 *
 * The following indices are applied to optimize admin panel queries:
 *
 * 1. idx_users_search_gin - Full-text search index
 *    ON users USING gin(to_tsvector('english', username || ' ' || email))
 *    Purpose: Fast user search in admin panel
 *
 * 2. idx_users_role_status - Composite B-tree index
 *    ON users(role, status, is_active)
 *    Purpose: Efficient role-based filtering
 *
 * 3. idx_users_username_trgm - Trigram GIN index
 *    ON users USING gin(username gin_trgm_ops)
 *    Purpose: Fuzzy username search capability
 *
 * These indices are managed via db/migrations/2025-06-24_admin_performance_indices
 */
