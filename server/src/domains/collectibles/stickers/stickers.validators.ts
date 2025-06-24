/**
 * Sticker System Validation Schemas
 *
 * Zod schemas for sticker and sticker pack validation
 */

import { z } from 'zod';

// Enums for validation
export const StickerRaritySchema = z.enum(['common', 'rare', 'epic', 'legendary', 'mythic']);
export const StickerUnlockTypeSchema = z.enum([
	'shop',
	'xp_milestone',
	'admin_grant',
	'event',
	'free'
]);
export const StickerFormatSchema = z.enum(['webp', 'png', 'webm', 'lottie']);

// Create sticker schema
export const createStickerSchema = z.object({
	name: z
		.string()
		.min(1)
		.max(50)
		.regex(/^[a-z0-9_]+$/, 'Name must be lowercase letters, numbers, and underscores only'),
	displayName: z.string().min(1).max(100),
	shortcode: z
		.string()
		.min(1)
		.max(30)
		.regex(/^[a-z0-9_]+$/, 'Shortcode must be lowercase letters, numbers, and underscores only'),
	description: z.string().optional(),

	// Media URLs (static is required, animated is optional)
	staticUrl: z.string().url('Invalid static URL'),
	animatedUrl: z.string().url('Invalid animated URL').optional(),
	thumbnailUrl: z.string().url('Invalid thumbnail URL').optional(),

	// File properties
	width: z.number().int().min(16).max(512).default(128),
	height: z.number().int().min(16).max(512).default(128),
	staticFileSize: z.number().int().positive().optional(),
	animatedFileSize: z.number().int().positive().optional(),
	format: StickerFormatSchema.default('webp'),

	// Collectible properties
	rarity: StickerRaritySchema.default('common'),
	packId: z.number().int().positive().optional(),

	// Unlock mechanics
	unlockType: StickerUnlockTypeSchema.default('shop'),
	priceDgt: z.number().int().min(0).default(0),
	requiredXp: z.number().int().positive().optional(),
	requiredLevel: z.number().int().positive().optional(),

	// Visibility
	isActive: z.boolean().default(true),
	isVisible: z.boolean().default(true),
	isAnimated: z.boolean().default(false),

	// Metadata
	adminNotes: z.string().optional(),
	tags: z.string().optional() // Comma-separated tags
});

// Update sticker schema (partial create schema)
export const updateStickerSchema = createStickerSchema.partial();

// List stickers schema (query parameters)
export const listStickersSchema = z.object({
	page: z.coerce.number().int().min(1).default(1),
	limit: z.coerce.number().int().min(1).max(100).default(20),
	search: z.string().optional(),
	rarity: StickerRaritySchema.optional(),
	packId: z.coerce.number().int().positive().optional(),
	unlockType: StickerUnlockTypeSchema.optional(),
	isActive: z.coerce.boolean().optional(),
	isVisible: z.coerce.boolean().optional(),
	isAnimated: z.coerce.boolean().optional(),
	sortBy: z
		.enum(['name', 'displayName', 'rarity', 'createdAt', 'popularity', 'unlocks'])
		.default('createdAt'),
	sortOrder: z.enum(['asc', 'desc']).default('desc')
});

// Create sticker pack schema
export const createStickerPackSchema = z.object({
	name: z
		.string()
		.min(1)
		.max(100)
		.regex(/^[a-z0-9_]+$/, 'Name must be lowercase letters, numbers, and underscores only'),
	displayName: z.string().min(1).max(150),
	description: z.string().optional(),

	// Pack media
	coverUrl: z.string().url('Invalid cover URL').optional(),
	previewUrl: z.string().url('Invalid preview URL').optional(),

	// Pack properties
	theme: z.string().max(50).optional(),

	// Unlock mechanics
	unlockType: StickerUnlockTypeSchema.default('shop'),
	priceDgt: z.number().int().min(0).default(0),
	requiredXp: z.number().int().positive().optional(),
	requiredLevel: z.number().int().positive().optional(),

	// Pack status
	isActive: z.boolean().default(true),
	isVisible: z.boolean().default(true),
	isPromoted: z.boolean().default(false),
	sortOrder: z.number().int().min(0).default(0),

	// Admin metadata
	adminNotes: z.string().optional()
});

// Update sticker pack schema
export const updateStickerPackSchema = createStickerPackSchema.partial();

// List sticker packs schema
export const listStickerPacksSchema = z.object({
	page: z.coerce.number().int().min(1).default(1),
	limit: z.coerce.number().int().min(1).max(100).default(20),
	search: z.string().optional(),
	theme: z.string().optional(),
	unlockType: StickerUnlockTypeSchema.optional(),
	isActive: z.coerce.boolean().optional(),
	isVisible: z.coerce.boolean().optional(),
	isPromoted: z.coerce.boolean().optional(),
	sortBy: z
		.enum(['name', 'displayName', 'createdAt', 'popularity', 'unlocks', 'sortOrder'])
		.default('sortOrder'),
	sortOrder: z.enum(['asc', 'desc']).default('asc')
});

// Bulk operations
export const bulkDeleteStickersSchema = z.object({
	ids: z.array(z.number().int().positive()).min(1).max(50)
});

export const bulkDeleteStickerPacksSchema = z.object({
	ids: z.array(z.number().int().positive()).min(1).max(20)
});

// Sticker pack management (add/remove stickers)
export const addStickersToPackSchema = z.object({
	packId: z.number().int().positive(),
	stickerIds: z.array(z.number().int().positive()).min(1).max(100)
});

export const removeStickersFromPackSchema = z.object({
	packId: z.number().int().positive(),
	stickerIds: z.array(z.number().int().positive()).min(1).max(100)
});

// File upload schema (for S3-ready logic)
export const stickerFileUploadSchema = z.object({
	type: z.enum(['static', 'animated', 'thumbnail']),
	format: StickerFormatSchema,
	maxSize: z
		.number()
		.int()
		.positive()
		.default(5 * 1024 * 1024) // 5MB default
});

// Usage tracking
export const trackStickerUsageSchema = z.object({
	stickerId: z.number().int().positive(),
	contextType: z.enum(['thread', 'comment', 'shoutbox', 'message']),
	contextId: z.string().optional()
});

// Export types
export type CreateStickerInput = z.infer<typeof createStickerSchema>;
export type UpdateStickerInput = z.infer<typeof updateStickerSchema>;
export type ListStickersInput = z.infer<typeof listStickersSchema>;
export type CreateStickerPackInput = z.infer<typeof createStickerPackSchema>;
export type UpdateStickerPackInput = z.infer<typeof updateStickerPackSchema>;
export type ListStickerPacksInput = z.infer<typeof listStickerPacksSchema>;
export type BulkDeleteStickersInput = z.infer<typeof bulkDeleteStickersSchema>;
export type BulkDeleteStickerPacksInput = z.infer<typeof bulkDeleteStickerPacksSchema>;
export type AddStickersToPackInput = z.infer<typeof addStickersToPackSchema>;
export type RemoveStickersFromPackInput = z.infer<typeof removeStickersFromPackSchema>;
export type StickerFileUploadInput = z.infer<typeof stickerFileUploadSchema>;
export type TrackStickerUsageInput = z.infer<typeof trackStickerUsageSchema>;
