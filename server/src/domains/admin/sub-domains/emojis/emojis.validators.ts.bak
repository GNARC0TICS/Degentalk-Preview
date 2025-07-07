import { z } from 'zod';

// Base emoji validation schema
export const EmojiBaseSchema = z.object({
	name: z
		.string()
		.min(1, 'Name is required')
		.max(50, 'Name cannot exceed 50 characters')
		.regex(/^[a-zA-Z0-9_-]+$/, 'Name can only contain letters, numbers, hyphens, and underscores'),

	code: z
		.string()
		.min(1, 'Code is required')
		.max(50, 'Code cannot exceed 50 characters')
		.regex(/^:[a-zA-Z0-9_-]+:$/, 'Code must be in format :emoji_name: (e.g., :fire:)'),

	type: z.enum(['static', 'lottie'], {
		required_error: 'Type is required',
		invalid_type_error: 'Type must be either "static" or "lottie"'
	}),

	url: z
		.string()
		.min(1, 'URL or animation data is required')
		.max(10000, 'URL or animation data cannot exceed 10000 characters')
		.refine((value) => {
			// Allow valid URLs
			try {
				new URL(value);
				return true;
			} catch {
				// Allow valid JSON (for raw Lottie data)
				try {
					const parsed = JSON.parse(value);
					return typeof parsed === 'object' && parsed !== null;
				} catch {
					return false;
				}
			}
		}, 'Must be a valid URL or valid JSON animation data'),

	previewUrl: z
		.string()
		.url('Must be a valid URL')
		.max(255, 'Preview URL cannot exceed 255 characters')
		.optional(),

	// Support both camelCase and snake_case for frontend compatibility
	preview_url: z
		.string()
		.url('Must be a valid URL')
		.max(255, 'Preview URL cannot exceed 255 characters')
		.optional(),

	category: z
		.string()
		.max(50, 'Category cannot exceed 50 characters')
		.optional()
		.default('standard'),

	isLocked: z.boolean().optional().default(true),
	is_locked: z.boolean().optional(), // snake_case support

	unlockType: z.enum(['free', 'purchase', 'path_unlock', 'admin_grant']).optional().default('free'),
	unlock_type: z.enum(['free', 'purchase', 'path_unlock', 'admin_grant']).optional(), // snake_case support

	priceDgt: z.number().min(0, 'Price must be non-negative').optional(),
	price_dgt: z.number().min(0, 'Price must be non-negative').optional(), // snake_case support

	requiredPath: z.string().max(50, 'Required path cannot exceed 50 characters').optional(),

	requiredPathXP: z.number().min(0, 'Required path XP must be non-negative').optional(),
	required_path_xp: z.number().min(0, 'Required path XP must be non-negative').optional(), // snake_case support

	xpValue: z.number().min(0, 'XP value must be non-negative').optional().default(0),

	cloutValue: z.number().min(0, 'Clout value must be non-negative').optional().default(0)
});

// Create emoji schema (excludes auto-generated fields)
export const CreateEmojiSchema = EmojiBaseSchema.omit({}).refine(
	(data) => {
		// If unlock type is 'purchase', price must be specified
		if (data.unlockType === 'purchase' && !data.priceDgt) {
			return false;
		}
		// If unlock type is 'path_unlock', required path must be specified
		if (data.unlockType === 'path_unlock' && (!data.requiredPath || !data.requiredPathXP)) {
			return false;
		}
		return true;
	},
	{
		message:
			'Purchase unlock type requires priceDgt, path unlock type requires requiredPath and requiredPathXP'
	}
);

// Update emoji schema (all fields optional except ID validation)
export const UpdateEmojiSchema = EmojiBaseSchema.partial().refine(
	(data) => {
		// Same validation as create, but only if the fields are provided
		if (data.unlockType === 'purchase' && data.priceDgt === undefined) {
			return false;
		}
		if (data.unlockType === 'path_unlock' && (!data.requiredPath || !data.requiredPathXP)) {
			return false;
		}
		return true;
	},
	{
		message:
			'Purchase unlock type requires priceDgt, path unlock type requires requiredPath and requiredPathXP'
	}
);

// Query parameters for listing emojis
export const ListEmojisQuerySchema = z.object({
	category: z.string().optional(),
	type: z.enum(['static', 'lottie']).optional(),
	unlockType: z.enum(['free', 'purchase', 'path_unlock', 'admin_grant']).optional(),
	isLocked: z.coerce.boolean().optional(),
	includeDeleted: z.coerce.boolean().optional().default(false),
	limit: z.coerce.number().min(1).max(100).optional().default(50),
	offset: z.coerce.number().min(0).optional().default(0),
	sortBy: z.enum(['name', 'createdAt', 'category', 'type']).optional().default('createdAt'),
	sortOrder: z.enum(['asc', 'desc']).optional().default('desc')
});

// Path parameter validation
export const EmojiIdParamSchema = z.object({
	id: z.string().regex(/^\d+$/, 'ID must be a positive integer').transform(Number)
});

// Bulk operations schema
export const BulkDeleteEmojisSchema = z.object({
	ids: z
		.array(z.number().positive())
		.min(1, 'At least one emoji ID is required')
		.max(50, 'Cannot delete more than 50 emojis at once')
});

export const BulkUpdateEmojisSchema = z.object({
	ids: z
		.array(z.number().positive())
		.min(1, 'At least one emoji ID is required')
		.max(50, 'Cannot update more than 50 emojis at once'),
	updates: EmojiBaseSchema.pick({
		category: true,
		isLocked: true,
		unlockType: true,
		priceDgt: true
	}).partial()
});
