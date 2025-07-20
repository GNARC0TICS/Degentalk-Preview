/**
 * Common Validation Schemas
 *
 * Reusable Zod schemas to eliminate validation pattern duplication
 * Provides consistent validation across domains
 */

import { z } from 'zod';

// Basic primitive validators
export const positiveInt = z.number().int().positive();
export const nonNegativeInt = z.number().int().min(0);
export const positiveFloat = z.number().positive();
export const nonNegativeFloat = z.number().min(0);

// String validators
export const nonEmptyString = z.string().min(1, 'Cannot be empty');
export const trimmedString = z.string().trim();
export const email = z.string().email('Invalid email format');
export const url = z.string().url('Invalid URL format');
export const slug = z.string().regex(/^[a-z0-9-]+$/, 'Invalid slug format');
export const username = z
	.string()
	.min(3, 'Username must be at least 3 characters')
	.max(20, 'Username must be less than 20 characters')
	.regex(
		/^[a-zA-Z0-9_-]+$/,
		'Username can only contain letters, numbers, underscores, and hyphens'
	);

// Date validators
export const dateString = z.string().datetime();
export const futureDate = z
	.date()
	.refine((date) => date > new Date(), 'Date must be in the future');
export const pastDate = z.date().refine((date) => date < new Date(), 'Date must be in the past');

// ID validators (UUID-based)
export const userId = z.string().uuid('Invalid userId format');
export const groupId = z.string().uuid('Invalid groupId format');
export const threadId = z.string().uuid('Invalid threadId format');
export const postId = z.string().uuid('Invalid postId format');
export const forumId = z.string().uuid('Invalid forumId format');

// Pagination schemas
export const paginationSchema = z.object({
	page: z.number().int().min(1).default(1),
	limit: z.number().int().min(1).max(100).default(20),
	offset: z.number().int().min(0).optional()
});

export const sortSchema = z.object({
	sortBy: z.string().optional(),
	sortOrder: z.enum(['asc', 'desc']).default('desc')
});

export const searchSchema = z.object({
	query: z.string().min(1).max(100).optional(),
	filters: z.record(z.any()).optional()
});

// Common field validators
export const passwordSchema = z
	.string()
	.min(8, 'Password must be at least 8 characters')
	.max(128, 'Password must be less than 128 characters')
	.regex(
		/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
		'Password must contain at least one lowercase letter, one uppercase letter, and one number'
	);

export const tokenSchema = z
	.string()
	.min(32, 'Token must be at least 32 characters')
	.max(512, 'Token must be less than 512 characters');

export const colorSchema = z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color');

export const currencySchema = z.object({
	symbol: z.string().min(1).max(10),
	amount: positiveFloat,
	decimals: z.number().int().min(0).max(18).default(2)
});

// User role validators
export const userRoleSchema = z.enum(['user', 'moderator', 'admin']);
export const permissionSchema = z.string().min(1);

// Content validators
export const titleSchema = z
	.string()
	.min(1, 'Title cannot be empty')
	.max(200, 'Title must be less than 200 characters');

export const contentSchema = z
	.string()
	.min(1, 'Content cannot be empty')
	.max(50000, 'Content must be less than 50,000 characters');

export const tagSchema = z
	.string()
	.min(1, 'Tag cannot be empty')
	.max(50, 'Tag must be less than 50 characters')
	.regex(/^[a-zA-Z0-9-_]+$/, 'Tag can only contain letters, numbers, hyphens, and underscores');

export const tagsArraySchema = z.array(tagSchema).max(10, 'Cannot have more than 10 tags');

// File upload validators
export const fileTypeSchema = z.enum([
	'image/jpeg',
	'image/png',
	'image/gif',
	'image/webp',
	'application/pdf',
	'text/plain',
	'application/json'
]);

export const fileSizeSchema = z
	.number()
	.min(1, 'File cannot be empty')
	.max(10 * 1024 * 1024, 'File cannot be larger than 10MB'); // 10MB

export const fileUploadSchema = z.object({
	filename: nonEmptyString,
	size: fileSizeSchema,
	type: fileTypeSchema,
	data: z.string() // base64 or similar
});

// API response schemas
export const successResponseSchema = z.object({
	success: z.literal(true),
	data: z.any(),
	meta: z
		.object({
			pagination: paginationSchema.optional(),
			timestamp: dateString.optional()
		})
		.optional()
});

export const errorResponseSchema = z.object({
	success: z.literal(false),
	error: nonEmptyString,
	code: z.string().optional(),
	details: z.any().optional(),
	timestamp: dateString.optional()
});

// Configuration schemas
export const featureGateSchema = z.object({
	id: nonEmptyString,
	name: nonEmptyString,
	description: nonEmptyString,
	enabled: z.boolean(),
	minLevel: nonNegativeInt.optional(),
	devOnly: z.boolean().optional(),
	rolloutPercentage: z.number().min(0).max(100).optional()
});

export const configCreateSchema = z.object({
	field: nonEmptyString,
	value: z.any(),
	reason: z.string()
});

export const configUpdateSchema = configCreateSchema.partial();

// Wallet/Economy schemas
export const dgtAmountSchema = z
	.number()
	.min(0.000001, 'Amount must be greater than 0')
	.max(1000000, 'Amount cannot exceed 1,000,000 DGT');

export const cryptoAddressSchema = z
	.string()
	.min(20, 'Invalid crypto address')
	.max(100, 'Invalid crypto address');

export const transactionTypeSchema = z.enum([
	'deposit',
	'withdrawal',
	'transfer',
	'tip',
	'purchase',
	'reward',
	'refund'
]);

// Forum-specific schemas
export const threadTypeSchema = z.enum(['discussion', 'question', 'announcement', 'poll']);
export const postTypeSchema = z.enum(['post', 'reply']);

export const forumAccessLevelSchema = z.enum(['public', 'registered', 'level_10+', 'moderator', 'admin']);

// Social features schemas
export const friendshipStatusSchema = z.enum(['pending', 'accepted', 'blocked', 'declined']);

export const privacyLevelSchema = z.enum(['public', 'friends', 'private']);

// Notification schemas
export const notificationTypeSchema = z.enum([
	'mention',
	'reply',
	'friend_request',
	'achievement',
	'system',
	'tip_received'
]);

export const channelSchema = z.enum(['email', 'sms', 'push', 'webhook']);

// Admin schemas
export const auditActionSchema = z.enum([
	'create',
	'update',
	'delete',
	'login',
	'logout',
	'permission_change'
]);

// Time-based validators
export const timeRangeSchema = z
	.object({
		start: z.date(),
		end: z.date()
	})
	.refine((data) => data.end > data.start, 'End date must be after start date');

export const durationSchema = z.object({
	value: positiveInt,
	unit: z.enum(['seconds', 'minutes', 'hours', 'days', 'weeks', 'months'])
});

// Complex object validators
export const coordinatesSchema = z.object({
	latitude: z.number().min(-90).max(90),
	longitude: z.number().min(-180).max(180)
});

export const versionSchema = z
	.string()
	.regex(/^\d+\.\d+\.\d+$/, 'Must be in semver format (x.y.z)');

// Utility functions for schema composition
export function createArraySchema<T extends z.ZodTypeAny>(
	itemSchema: T,
	minItems: number = 0,
	maxItems: number = 100
) {
	return z.array(itemSchema).min(minItems).max(maxItems);
}

export function createOptionalWithDefault<T extends z.ZodTypeAny>(
	schema: T,
	defaultValue: z.infer<T>
) {
	return schema.default(defaultValue);
}

export function createEnumSchema<T extends readonly [string, ...string[]]>(
	values: T,
	errorMessage?: string
) {
	return z.enum(values, {
		errorMap: () => ({ message: errorMessage || `Must be one of: ${values.join(', ')}` })
	});
}

// Schema combinations for common use cases
export const userCreateSchema = z.object({
	username,
	email,
	password: passwordSchema,
	role: userRoleSchema.optional()
});

export const userUpdateSchema = userCreateSchema.partial().omit({ password: true });

export const threadCreateSchema = z.object({
	title: titleSchema,
	content: contentSchema,
	forumId,
	tags: tagsArraySchema.optional(),
	type: threadTypeSchema.optional()
});

export const postCreateSchema = z.object({
	content: contentSchema,
	threadId,
	replyToPostId: postId.optional()
});

export const paginatedQuerySchema = paginationSchema.merge(sortSchema).merge(searchSchema);

// Export commonly used combinations
export const apiQuerySchema = paginatedQuerySchema;
export const idParamSchema = z.object({ id: z.string().uuid('Invalid ID format') });
export const slugParamSchema = z.object({ slug });

// Validation helper functions
export function validateId(id: unknown): string {
	return z.string().uuid().parse(id);
}

export function validateEmail(emailValue: unknown): string {
	return email.parse(emailValue);
}

export function validatePagination(query: unknown) {
	return paginationSchema.parse(query);
}

export function sanitizeInput(input: unknown): string {
	if (typeof input !== 'string') {
		throw new Error('Input must be a string');
	}
	return input.trim().substring(0, 10000); // Prevent excessively long inputs
}
