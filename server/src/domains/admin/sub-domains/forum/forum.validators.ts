/**
 * Admin Forum Validators
 *
 * Zod validation schemas for forum management.
 */

import { z } from 'zod';

// Schema for category management
export const CategorySchema = z.object({
	name: z.string().min(2, 'Name must be at least 2 characters').max(100),
	description: z.string().optional().nullable(),
	slug: z
		.string()
		.min(2)
		.max(100)
		.regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
	parentId: z.number().int().nullable().optional(),
	position: z.number().int().min(0).default(0),
	icon: z.string().optional().nullable(),
	isHidden: z.boolean().default(false).optional(),
	allowThreads: z.boolean().default(true).optional(),
	viewPermission: z.enum(['all', 'registered', 'staff', 'admin']).default('all').optional(),
	postPermission: z.enum(['all', 'registered', 'staff', 'admin']).default('registered').optional()
});

// Schema for prefix management
export const PrefixSchema = z.object({
	name: z.string().min(1, 'Name must be at least 1 character').max(50),
	color: z
		.string()
		.regex(/^#([0-9A-F]{3,6})$/i, 'Must be a valid hex color (e.g., #RRGGBB or #RGB)')
		.default('#3366ff'),
	icon: z.string().optional().nullable(),
	categoryId: z.number().int().nullable().optional(), // Null if global
	isHidden: z.boolean().default(false).optional(),
	position: z.number().int().min(0).default(0)
});

// Schema for thread moderation
export const ModerateThreadSchema = z.object({
	isLocked: z.boolean().optional(),
	isSticky: z.boolean().optional(), // Using isSticky field from schema instead of isPinned
	isHidden: z.boolean().optional(),
	prefixId: z.number().int().nullable().optional(),
	categoryId: z.number().int().optional(),
	moderationReason: z.string().max(255).optional()
});

// Schema for pagination
export const PaginationSchema = z.object({
	page: z.coerce.number().min(1).default(1),
	limit: z.coerce.number().min(1).max(100).default(20)
});

// Forum entity schemas
export const createEntitySchema = z.object({
	name: z.string().min(1).max(100),
	slug: z
		.string()
		.min(1)
		.max(100)
		.regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
	description: z.string().max(500).optional().nullable(),
	type: z.enum(['zone', 'category', 'forum']),
	parentId: z.number().int().positive().optional().nullable(),
	position: z.number().int().min(0).default(0),
	isVip: z.boolean().default(false),
	isLocked: z.boolean().default(false),
	isHidden: z.boolean().default(false),
	minXp: z.number().int().min(0).default(0),
	color: z.string().optional().nullable(),
	icon: z.string().optional().nullable(),
	colorTheme: z.string().optional().nullable(),
	tippingEnabled: z.boolean().default(false),
	xpMultiplier: z.number().min(0).default(1),
	pluginData: z.record(z.any()).optional().nullable()
});

export const updateEntitySchema = createEntitySchema.partial();

export type CategoryInput = z.infer<typeof CategorySchema>;
export type PrefixInput = z.infer<typeof PrefixSchema>;
export type ModerateThreadInput = z.infer<typeof ModerateThreadSchema>;
export type PaginationInput = z.infer<typeof PaginationSchema>;
