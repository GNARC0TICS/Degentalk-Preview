/**
 * Telegram-Style Sticker System Database Schema
 *
 * Collectible inventory-based sticker system with rarity tiers and packs
 */

import {
	pgTable,
	serial,
	varchar,
	text,
	boolean,
	integer,
	bigint,
	uuid,
	timestamp,
	index
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from '../user/users';

// Sticker packs - themed collections (Whale Pack, Wojak Pack, etc.)
export const stickerPacks = pgTable(
	'sticker_packs',
	{
		id: serial('id').primaryKey(),

		// Pack identification
		name: varchar('name', { length: 100 }).notNull().unique(), // "whale_pack"
		displayName: varchar('display_name', { length: 150 }).notNull(), // "Whale Pack"
		description: text('description'),

		// Pack media
		coverUrl: varchar('cover_url', { length: 255 }), // Pack cover image
		previewUrl: varchar('preview_url', { length: 255 }), // Preview/thumbnail

		// Pack properties
		theme: varchar('theme', { length: 50 }), // "crypto", "memes", "animals"
		totalStickers: integer('total_stickers').notNull().default(0), // Auto-calculated

		// Pack unlock mechanics
		unlockType: varchar('unlock_type', { length: 20 }).notNull().default('shop'), // 'shop' | 'xp_milestone' | 'admin_grant' | 'event' | 'bundle'
		priceDgt: bigint('price_dgt', { mode: 'number' }).default(0), // Pack bundle price
		requiredXp: integer('required_xp'), // XP to unlock entire pack
		requiredLevel: integer('required_level'), // User level requirement

		// Pack status
		isActive: boolean('is_active').notNull().default(true), // Available for unlock
		isVisible: boolean('is_visible').notNull().default(true), // Visible in shop
		isPromoted: boolean('is_promoted').notNull().default(false), // Featured pack
		sortOrder: integer('sort_order').default(0), // Display order

		// Analytics
		totalUnlocks: integer('total_unlocks').notNull().default(0), // Users who own this pack
		popularityScore: integer('popularity_score').notNull().default(0),

		// Audit trail
		createdBy: uuid('created_by').references(() => users.id),
		createdAt: timestamp('created_at')
			.notNull()
			.default(sql`now()`),
		updatedAt: timestamp('updated_at')
			.notNull()
			.default(sql`now()`),

		// Admin metadata
		adminNotes: text('admin_notes')
	},
	(table) => ({
		nameIdx: index('idx_sticker_packs_name').on(table.name),
		themeIdx: index('idx_sticker_packs_theme').on(table.theme),
		unlockTypeIdx: index('idx_sticker_packs_unlock_type').on(table.unlockType),
		isActiveIdx: index('idx_sticker_packs_is_active').on(table.isActive),
		isPromotedIdx: index('idx_sticker_packs_is_promoted').on(table.isPromoted),
		sortOrderIdx: index('idx_sticker_packs_sort_order').on(table.sortOrder)
	})
);

// Core stickers table - collectible assets with rarity system
export const stickers = pgTable(
	'stickers',
	{
		id: serial('id').primaryKey(),

		// Basic sticker identification
		name: varchar('name', { length: 50 }).notNull().unique(), // Internal name "pepe_cry"
		displayName: varchar('display_name', { length: 100 }).notNull(), // "Crying Pepe"
		shortcode: varchar('shortcode', { length: 30 }).notNull().unique(), // ":pepe_cry:"
		description: text('description'),

		// Media URLs - supports both static and animated
		staticUrl: varchar('static_url', { length: 255 }).notNull(), // WebP/PNG fallback (always required)
		animatedUrl: varchar('animated_url', { length: 255 }), // WebM/Lottie (optional for animated stickers)
		thumbnailUrl: varchar('thumbnail_url', { length: 255 }), // Small preview (64x64)

		// File properties
		width: integer('width').default(128), // Display width
		height: integer('height').default(128), // Display height
		staticFileSize: integer('static_file_size'), // Static file size in bytes
		animatedFileSize: integer('animated_file_size'), // Animated file size in bytes
		format: varchar('format', { length: 15 }).default('webp'), // Primary format: 'webp' | 'png' | 'webm' | 'lottie'

		// Collectible properties
		rarity: varchar('rarity', { length: 20 }).notNull().default('common'), // 'common' | 'rare' | 'epic' | 'legendary' | 'mythic'
		packId: integer('pack_id').references(() => stickerPacks.id), // Optional pack membership

		// Unlock mechanics
		unlockType: varchar('unlock_type', { length: 20 }).notNull().default('shop'), // 'shop' | 'xp_milestone' | 'admin_grant' | 'event' | 'free'
		priceDgt: bigint('price_dgt', { mode: 'number' }).default(0), // Individual DGT cost
		requiredXp: integer('required_xp'), // XP milestone unlock
		requiredLevel: integer('required_level'), // User level requirement

		// Usage and visibility
		isActive: boolean('is_active').notNull().default(true), // Available for unlock/use
		isVisible: boolean('is_visible').notNull().default(true), // Visible in shop/browser
		isAnimated: boolean('is_animated').notNull().default(false), // Has animated version
		isDeleted: boolean('is_deleted').notNull().default(false),
		deletedAt: timestamp('deleted_at'),

		// Analytics
		totalUnlocks: integer('total_unlocks').notNull().default(0), // How many users own this
		totalUsage: integer('total_usage').notNull().default(0), // Total usage count across all users
		popularityScore: integer('popularity_score').notNull().default(0), // Calculated popularity

		// Audit trail
		createdBy: uuid('created_by').references(() => users.id),
		createdAt: timestamp('created_at')
			.notNull()
			.default(sql`now()`),
		updatedAt: timestamp('updated_at')
			.notNull()
			.default(sql`now()`),

		// Admin metadata
		adminNotes: text('admin_notes'),
		tags: text('tags') // Comma-separated searchable tags: "crypto,whale,bullish"
	},
	(table) => ({
		shortcodeIdx: index('idx_stickers_shortcode').on(table.shortcode),
		rarityIdx: index('idx_stickers_rarity').on(table.rarity),
		packIdIdx: index('idx_stickers_pack_id').on(table.packId),
		unlockTypeIdx: index('idx_stickers_unlock_type').on(table.unlockType),
		isActiveIdx: index('idx_stickers_is_active').on(table.isActive),
		isVisibleIdx: index('idx_stickers_is_visible').on(table.isVisible),
		isAnimatedIdx: index('idx_stickers_is_animated').on(table.isAnimated),
		popularityIdx: index('idx_stickers_popularity').on(table.popularityScore),
		createdAtIdx: index('idx_stickers_created_at').on(table.createdAt)
	})
);

// User sticker inventory - what stickers each user owns
export const userStickerInventory = pgTable(
	'user_sticker_inventory',
	{
		id: serial('id').primaryKey(),

		// Relationships
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		stickerId: integer('sticker_id')
			.notNull()
			.references(() => stickers.id, { onDelete: 'cascade' }),

		// Unlock details
		unlockedAt: timestamp('unlocked_at')
			.notNull()
			.default(sql`now()`),
		unlockMethod: varchar('unlock_method', { length: 20 }).notNull(), // 'shop_purchase' | 'pack_unlock' | 'xp_milestone' | 'admin_grant' | 'event_reward'
		pricePaid: bigint('price_paid', { mode: 'number' }).default(0), // DGT spent to unlock

		// Quick access slots (Telegram-style favorites)
		isEquipped: boolean('is_equipped').notNull().default(false), // In user's quick slots
		slotPosition: integer('slot_position'), // Position in quick slots (1-8 or similar)

		// Usage tracking
		usageCount: integer('usage_count').notNull().default(0), // How many times this user used this sticker
		lastUsed: timestamp('last_used'),

		// Status
		isActive: boolean('is_active').notNull().default(true) // User can use this sticker
	},
	(table) => ({
		userIdIdx: index('idx_user_sticker_inventory_user_id').on(table.userId),
		stickerIdIdx: index('idx_user_sticker_inventory_sticker_id').on(table.stickerId),
		unlockedAtIdx: index('idx_user_sticker_inventory_unlocked_at').on(table.unlockedAt),
		isEquippedIdx: index('idx_user_sticker_inventory_is_equipped').on(table.isEquipped),
		slotPositionIdx: index('idx_user_sticker_inventory_slot_position').on(table.slotPosition),
		// Unique constraint to prevent duplicate ownership
		uniqueUserSticker: index('idx_user_sticker_inventory_unique').on(table.userId, table.stickerId)
	})
);

// User sticker pack ownership
export const userStickerPacks = pgTable(
	'user_sticker_packs',
	{
		id: serial('id').primaryKey(),

		// Relationships
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		packId: integer('pack_id')
			.notNull()
			.references(() => stickerPacks.id, { onDelete: 'cascade' }),

		// Unlock details
		unlockedAt: timestamp('unlocked_at')
			.notNull()
			.default(sql`now()`),
		unlockMethod: varchar('unlock_method', { length: 20 }).notNull(), // 'pack_purchase' | 'xp_milestone' | 'admin_grant' | 'event_reward'
		pricePaid: bigint('price_paid', { mode: 'number' }).default(0), // DGT spent for pack

		// Progress tracking
		stickersUnlocked: integer('stickers_unlocked').notNull().default(0), // Individual stickers from this pack
		totalStickers: integer('total_stickers').notNull().default(0), // Total stickers in pack at unlock time
		isComplete: boolean('is_complete').notNull().default(false), // User owns all stickers in pack

		// Status
		isActive: boolean('is_active').notNull().default(true)
	},
	(table) => ({
		userIdIdx: index('idx_user_sticker_packs_user_id').on(table.userId),
		packIdIdx: index('idx_user_sticker_packs_pack_id').on(table.packId),
		unlockedAtIdx: index('idx_user_sticker_packs_unlocked_at').on(table.unlockedAt),
		// Unique constraint to prevent duplicate pack ownership
		uniqueUserPack: index('idx_user_sticker_packs_unique').on(table.userId, table.packId)
	})
);

// Sticker usage tracking (for analytics and trending)
export const stickerUsage = pgTable(
	'sticker_usage',
	{
		id: serial('id').primaryKey(),

		// Relationships
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		stickerId: integer('sticker_id')
			.notNull()
			.references(() => stickers.id, { onDelete: 'cascade' }),

		// Context where used
		contextType: varchar('context_type', { length: 20 }).notNull(), // 'thread' | 'comment' | 'shoutbox' | 'message'
		contextId: varchar('context_id', { length: 50 }), // ID of the thread/comment/etc.

		// Usage metadata
		usedAt: timestamp('used_at')
			.notNull()
			.default(sql`now()`),
		ipAddress: varchar('ip_address', { length: 45 }) // For analytics/anti-spam
	},
	(table) => ({
		userIdIdx: index('idx_sticker_usage_user_id').on(table.userId),
		stickerIdIdx: index('idx_sticker_usage_sticker_id').on(table.stickerId),
		contextTypeIdx: index('idx_sticker_usage_context_type').on(table.contextType),
		usedAtIdx: index('idx_sticker_usage_used_at').on(table.usedAt)
	})
);

// TypeScript types
export type StickerPack = typeof stickerPacks.$inferSelect;
export type NewStickerPack = typeof stickerPacks.$inferInsert;
export type Sticker = typeof stickers.$inferSelect;
export type NewSticker = typeof stickers.$inferInsert;
export type UserStickerInventory = typeof userStickerInventory.$inferSelect;
export type NewUserStickerInventory = typeof userStickerInventory.$inferInsert;
export type UserStickerPack = typeof userStickerPacks.$inferSelect;
export type NewUserStickerPack = typeof userStickerPacks.$inferInsert;
export type StickerUsage = typeof stickerUsage.$inferSelect;
export type NewStickerUsage = typeof stickerUsage.$inferInsert;

// Rarity tier enum for TypeScript
export type StickerRarity = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
export type StickerUnlockType = 'shop' | 'xp_milestone' | 'admin_grant' | 'event' | 'free';
export type StickerFormat = 'webp' | 'png' | 'webm' | 'lottie';
