import type { AnyPgColumn } from 'drizzle-orm/pg-core';
import {
	pgTable,
	serial,
	text,
	varchar,
	boolean,
	timestamp,
	integer,
	bigint,
	uuid,
	jsonb,
	unique,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { userRoleEnum } from '../core/enums';
import { roles } from './roles';
import { titles } from '../economy/titles';
import { badges } from '../economy/badges';
import { avatarFrames } from './avatarFrames';
// import { userGroups } from "./userGroups"; // Placeholder for future import
// import { titles } from "../economy/titles"; // Placeholder for future import
// import { badges } from "../economy/badges"; // Placeholder for future import
// import { avatarFrames } from "./avatarFrames"; // Placeholder for future import

export const users = pgTable(
	'users',
	{
		id: serial('user_id').primaryKey(),
		uuid: uuid('uuid').notNull().defaultRandom(),
		username: text('username').notNull(),
		email: text('email').notNull(),
		password: text('password_hash').notNull(),
		bio: text('bio'),
		signature: text('signature'),
		avatarUrl: varchar('avatar_url', { length: 255 }),
		activeAvatarUrl: varchar('active_avatar_url', { length: 255 }),
		profileBannerUrl: varchar('profile_banner_url', { length: 255 }),
		activeFrameId: integer('active_frame_id'),
		avatarFrameId: integer('avatar_frame_id').references(() => avatarFrames.id, {
			onDelete: 'set null'
		}),
		/**
		 * Primary role for the user – replaces legacy groupId.
		 * Nullable to support users without explicit role (falls back to default).
		 */
		primaryRoleId: uuid('primary_role_id').references(() => roles.id, { onDelete: 'set null' }),
		discordHandle: varchar('discord_handle', { length: 255 }),
		twitterHandle: varchar('twitter_handle', { length: 255 }),
		website: varchar('website', { length: 255 }),
		telegramHandle: varchar('telegram_handle', { length: 255 }),
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
		referrerId: integer('referrer_id').references((): AnyPgColumn => users.id, {
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
		pointsVersion: integer('points_version').notNull().default(1),
		dailyXpGained: integer('daily_xp_gained').notNull().default(0),
		lastXpGainDate: timestamp('last_xp_gain_date'),
		role: userRoleEnum('role').default('user'),
		walletAddress: varchar('wallet_address', { length: 255 }),
		encryptedPrivateKey: varchar('encrypted_private_key', { length: 512 }),
		walletBalanceUSDT: bigint('wallet_balance_usdt', { mode: 'number' }).notNull().default(0), // Corrected to bigint based on schema.ts (doublePrecision was used there, but bigint seems more appropriate for currency)
		walletPendingWithdrawals: jsonb('wallet_pending_withdrawals').default('[]'),
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
		updatedAt: timestamp('updated_at').defaultNow().notNull(),
		/**
		 * DEPRECATED: Legacy group integer ID. Retained temporarily to keep code compiling
		 * while we migrate services to the new role system. Do NOT use in new code.
		 */
		groupId: integer('group_id'),
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
	uuid: true,
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
