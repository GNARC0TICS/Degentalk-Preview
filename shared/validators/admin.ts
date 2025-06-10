/**
 * Admin Validators
 *
 * Shared validation schemas for admin API requests
 */

import { z } from 'zod';

/**
 * Pagination and search query params
 */
export const AdminPaginationQuery = z.object({
	page: z.coerce.number().min(1).default(1),
	pageSize: z.coerce.number().min(1).max(100).default(10),
	search: z.string().optional(),
	sortBy: z.string().optional(),
	sortOrder: z.enum(['asc', 'desc']).optional().default('desc')
});

/**
 * User update schema
 */
export const AdminUserUpdateSchema = z.object({
	username: z.string().min(3).max(50).optional(),
	email: z.string().email().optional(),
	bio: z.string().max(1000).optional().nullable(),
	groupId: z.number().nullable().optional(),
	isActive: z.boolean().optional(),
	isVerified: z.boolean().optional(),
	isBanned: z.boolean().optional(),
	role: z.enum(['user', 'mod', 'admin']).optional()
});

/**
 * Category update schema
 */
export const AdminCategoryUpdateSchema = z.object({
	name: z.string().min(1).max(100).optional(),
	description: z.string().max(1000).optional().nullable(),
	slug: z.string().min(1).max(100).optional(),
	position: z.number().optional(),
	isLocked: z.boolean().optional(),
	isVip: z.boolean().optional(),
	parentId: z.number().nullable().optional()
});

/**
 * Thread prefix update schema
 */
export const AdminThreadPrefixUpdateSchema = z.object({
	name: z.string().min(1).max(30).optional(),
	color: z.string().min(3).max(20).optional(),
	isActive: z.boolean().optional(),
	position: z.number().optional()
});

/**
 * Feature flag update schema
 */
export const AdminFeatureFlagUpdateSchema = z.object({
	enabled: z.boolean().optional(),
	name: z.string().min(1).max(100).optional(),
	description: z.string().optional(),
	expiresAt: z.date().optional().nullable()
});

// User schema for admin create/update
export const AdminUserBody = z.object({
	username: z.string().min(3).max(32),
	email: z.string().email(),
	role: z.string().min(1),
	isActive: z.boolean().optional()
	// ...add more fields as needed
});

// User group schema for admin create/update
export const AdminUserGroupBody = z.object({
	name: z.string().min(2).max(32),
	permissions: z.array(z.string()),
	description: z.string().optional()
});

// Response format for paginated admin endpoints
export const AdminPaginatedResponse = <T extends z.ZodTypeAny>(item: T) =>
	z.object({
		data: z.array(item),
		total: z.number(),
		page: z.number(),
		pageSize: z.number()
	});

// Usage: AdminPaginatedResponse(AdminUserBody)
