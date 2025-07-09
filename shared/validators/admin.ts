/**
 * Admin Validators
 *
 * Shared validation schemas for admin API requests
 */

import { z } from 'zod';
import { userId, groupId } from '../validation/common.schemas';

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
 * User schemas
 */
export const AdminUserCreateSchema = z.object({
	username: z.string().min(3).max(50),
	email: z.string().email(),
	bio: z.string().max(1000).nullable(),
	groupId: groupId.nullable(),
	isActive: z.boolean(),
	isVerified: z.boolean(),
	isBanned: z.boolean(),
	role: z.enum(['user', 'mod', 'admin'])
});

export const AdminUserUpdateSchema = AdminUserCreateSchema.partial();

/**
 * Category schemas
 */
export const AdminCategoryCreateSchema = z.object({
	name: z.string().min(1).max(100),
	description: z.string().max(1000).nullable(),
	slug: z.string().min(1).max(100),
	position: z.number(),
	isLocked: z.boolean(),
	isVip: z.boolean(),
	parentId: z.string().uuid().nullable()
});

export const AdminCategoryUpdateSchema = AdminCategoryCreateSchema.partial();

/**
 * Thread prefix schemas
 */
export const AdminThreadPrefixCreateSchema = z.object({
	name: z.string().min(1).max(30),
	color: z.string().min(3).max(20),
	isActive: z.boolean(),
	position: z.number()
});

export const AdminThreadPrefixUpdateSchema = AdminThreadPrefixCreateSchema.partial();

/**
 * Feature flag schemas
 */
export const AdminFeatureFlagCreateSchema = z.object({
	enabled: z.boolean(),
	name: z.string().min(1).max(100),
	description: z.string(),
	expiresAt: z.date().nullable(),
	rolloutPercentage: z
		.number()
		.min(0, 'Must be between 0 and 100')
		.max(100, 'Must be between 0 and 100')
});

export const AdminFeatureFlagUpdateSchema = AdminFeatureFlagCreateSchema.partial();

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
	userIds: z.array(userId).min(1),
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

export const XpActionUpdateSchema = XpActionCreateSchema.partial().extend({
	id: z.string().uuid()
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

export const PermissionGroupUpdateSchema = PermissionGroupCreateSchema.partial().extend({
	id: z.string().uuid()
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
