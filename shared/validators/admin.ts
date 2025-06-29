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
	expiresAt: z.date().optional().nullable(),
	rolloutPercentage: z
		.number()
		.min(0, 'Must be between 0 and 100')
		.max(100, 'Must be between 0 and 100')
		.optional()
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

export const ToggleFeatureFlagSchema = AdminFeatureFlagUpdateSchema;

// =====================
// New Admin Schemas V2
// =====================

const _RoleBase = z.object({
	name: z.string().min(1),
	slug: z
		.string()
		.min(1)
		.regex(/^[a-z0-9-]+$/),
	rank: z.number().int().min(0)
});
export const RoleCreateInput = _RoleBase;
export const RoleUpdateInput = _RoleBase.partial();

export const BulkUserRoleAssignment = z.object({
	userIds: z.array(z.number()).min(1),
	newRole: z.string().min(1),
	reason: z.string().optional()
});

export const TitleCreateInput = z.object({
	name: z.string().min(1).max(100),
	imageUrl: z.string().url().optional(),
	description: z.string().optional()
});

export const PermissionUpdateInput = z.object({
	name: z.string().min(1),
	description: z.string().optional()
});

// =====================
// XP Actions Schemas
// =====================
export const XpActionCreateSchema = z.object({
	key: z.string().min(1),
	label: z.string().min(1),
	amount: z.number().int().nonnegative(),
	icon: z.string().optional()
});
export type XpActionCreateInput = z.infer<typeof XpActionCreateSchema>;

export const XpActionUpdateSchema = XpActionCreateSchema.extend({
	id: z.number().int()
});
export type XpActionUpdateInput = z.infer<typeof XpActionUpdateSchema>;

// =====================
// Permission Group Schemas
// =====================
export const PermissionGroupCreateSchema = z.object({
	name: z.string().min(1),
	permissions: z.array(z.string())
});
export type PermissionGroupCreateInput = z.infer<typeof PermissionGroupCreateSchema>;

export const PermissionGroupUpdateSchema = PermissionGroupCreateSchema.extend({
	id: z.number().int()
});
export type PermissionGroupUpdateInput = z.infer<typeof PermissionGroupUpdateSchema>;

// =====================
// Admin Toggle Schema
// =====================
export const AdminToggleSchema = z.object({
	key: z.string(),
	value: z.union([z.boolean(), z.string(), z.number()])
});
export type AdminToggleInput = z.infer<typeof AdminToggleSchema>;
