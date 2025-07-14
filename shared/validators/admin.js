"use strict";
/**
 * Admin Validators
 *
 * Shared validation schemas for admin API requests
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminToggleSchema = exports.PermissionGroupUpdateSchema = exports.PermissionGroupCreateSchema = exports.XpActionUpdateSchema = exports.XpActionCreateSchema = exports.PermissionUpdateInput = exports.TitleCreateInput = exports.BulkUserRoleAssignment = exports.RoleUpdateInput = exports.RoleCreateInput = exports.ToggleFeatureFlagSchema = exports.AdminPaginatedResponse = exports.AdminUserGroupBody = exports.AdminUserBody = exports.AdminFeatureFlagUpdateSchema = exports.AdminFeatureFlagCreateSchema = exports.AdminThreadPrefixUpdateSchema = exports.AdminThreadPrefixCreateSchema = exports.AdminCategoryUpdateSchema = exports.AdminCategoryCreateSchema = exports.AdminUserUpdateSchema = exports.AdminUserCreateSchema = exports.AdminPaginationQuery = void 0;
var zod_1 = require("zod");
var common_schemas_1 = require("../validation/common.schemas");
/**
 * Pagination and search query params
 */
exports.AdminPaginationQuery = zod_1.z.object({
    page: zod_1.z.coerce.number().min(1).default(1),
    pageSize: zod_1.z.coerce.number().min(1).max(100).default(10),
    search: zod_1.z.string().optional(),
    sortBy: zod_1.z.string().optional(),
    sortOrder: zod_1.z.enum(['asc', 'desc']).optional().default('desc')
});
/**
 * User schemas
 */
exports.AdminUserCreateSchema = zod_1.z.object({
    username: zod_1.z.string().min(3).max(50),
    email: zod_1.z.string().email(),
    bio: zod_1.z.string().max(1000).nullable(),
    groupId: common_schemas_1.groupId.nullable(),
    isActive: zod_1.z.boolean(),
    isVerified: zod_1.z.boolean(),
    isBanned: zod_1.z.boolean(),
    role: zod_1.z.enum(['user', 'mod', 'admin'])
});
exports.AdminUserUpdateSchema = exports.AdminUserCreateSchema.partial();
/**
 * Category schemas
 */
exports.AdminCategoryCreateSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100),
    description: zod_1.z.string().max(1000).nullable(),
    slug: zod_1.z.string().min(1).max(100),
    position: zod_1.z.number(),
    isLocked: zod_1.z.boolean(),
    isVip: zod_1.z.boolean(),
    parentId: zod_1.z.string().uuid().nullable()
});
exports.AdminCategoryUpdateSchema = exports.AdminCategoryCreateSchema.partial();
/**
 * Thread prefix schemas
 */
exports.AdminThreadPrefixCreateSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(30),
    color: zod_1.z.string().min(3).max(20),
    isActive: zod_1.z.boolean(),
    position: zod_1.z.number()
});
exports.AdminThreadPrefixUpdateSchema = exports.AdminThreadPrefixCreateSchema.partial();
/**
 * Feature flag schemas
 */
exports.AdminFeatureFlagCreateSchema = zod_1.z.object({
    enabled: zod_1.z.boolean(),
    name: zod_1.z.string().min(1).max(100),
    description: zod_1.z.string(),
    expiresAt: zod_1.z.date().nullable(),
    rolloutPercentage: zod_1.z
        .number()
        .min(0, 'Must be between 0 and 100')
        .max(100, 'Must be between 0 and 100')
});
exports.AdminFeatureFlagUpdateSchema = exports.AdminFeatureFlagCreateSchema.partial();
// User schema for admin create/update
exports.AdminUserBody = zod_1.z.object({
    username: zod_1.z.string().min(3).max(32),
    email: zod_1.z.string().email(),
    role: zod_1.z.string().min(1),
    isActive: zod_1.z.boolean().optional()
    // ...add more fields as needed
});
// User group schema for admin create/update
exports.AdminUserGroupBody = zod_1.z.object({
    name: zod_1.z.string().min(2).max(32),
    permissions: zod_1.z.array(zod_1.z.string()),
    description: zod_1.z.string().optional()
});
// Response format for paginated admin endpoints
var AdminPaginatedResponse = function (item) {
    return zod_1.z.object({
        data: zod_1.z.array(item),
        total: zod_1.z.number(),
        page: zod_1.z.number(),
        pageSize: zod_1.z.number()
    });
};
exports.AdminPaginatedResponse = AdminPaginatedResponse;
// Usage: AdminPaginatedResponse(AdminUserBody)
exports.ToggleFeatureFlagSchema = exports.AdminFeatureFlagUpdateSchema;
// =====================
// New Admin Schemas V2
// =====================
var _RoleBase = zod_1.z.object({
    name: zod_1.z.string().min(1),
    slug: zod_1.z
        .string()
        .min(1)
        .regex(/^[a-z0-9-]+$/),
    rank: zod_1.z.number().int().min(0)
});
exports.RoleCreateInput = _RoleBase;
exports.RoleUpdateInput = _RoleBase.partial();
exports.BulkUserRoleAssignment = zod_1.z.object({
    userIds: zod_1.z.array(common_schemas_1.userId).min(1),
    newRole: zod_1.z.string().min(1),
    reason: zod_1.z.string().optional()
});
exports.TitleCreateInput = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100),
    imageUrl: zod_1.z.string().url().optional(),
    description: zod_1.z.string().optional()
});
exports.PermissionUpdateInput = zod_1.z.object({
    name: zod_1.z.string().min(1),
    description: zod_1.z.string().optional()
});
// =====================
// XP Actions Schemas
// =====================
exports.XpActionCreateSchema = zod_1.z.object({
    key: zod_1.z.string().min(1),
    label: zod_1.z.string().min(1),
    amount: zod_1.z.number().int().nonnegative(),
    icon: zod_1.z.string().optional()
});
exports.XpActionUpdateSchema = exports.XpActionCreateSchema.partial().extend({
    id: zod_1.z.string().uuid()
});
// =====================
// Permission Group Schemas
// =====================
exports.PermissionGroupCreateSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    permissions: zod_1.z.array(zod_1.z.string())
});
exports.PermissionGroupUpdateSchema = exports.PermissionGroupCreateSchema.partial().extend({
    id: zod_1.z.string().uuid()
});
// =====================
// Admin Toggle Schema
// =====================
exports.AdminToggleSchema = zod_1.z.object({
    key: zod_1.z.string(),
    value: zod_1.z.union([zod_1.z.boolean(), zod_1.z.string(), zod_1.z.number()])
});
