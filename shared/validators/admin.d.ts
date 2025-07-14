/**
 * Admin Validators
 *
 * Shared validation schemas for admin API requests
 */
import { z } from 'zod';
/**
 * Pagination and search query params
 */
export declare const AdminPaginationQuery: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    pageSize: z.ZodDefault<z.ZodNumber>;
    search: z.ZodOptional<z.ZodString>;
    sortBy: z.ZodOptional<z.ZodString>;
    sortOrder: z.ZodDefault<z.ZodOptional<z.ZodEnum<["asc", "desc"]>>>;
}, "strip", z.ZodTypeAny, {
    search?: string;
    page?: number;
    sortBy?: string;
    sortOrder?: "desc" | "asc";
    pageSize?: number;
}, {
    search?: string;
    page?: number;
    sortBy?: string;
    sortOrder?: "desc" | "asc";
    pageSize?: number;
}>;
/**
 * User schemas
 */
export declare const AdminUserCreateSchema: z.ZodObject<{
    username: z.ZodString;
    email: z.ZodString;
    bio: z.ZodNullable<z.ZodString>;
    groupId: z.ZodNullable<z.ZodString>;
    isActive: z.ZodBoolean;
    isVerified: z.ZodBoolean;
    isBanned: z.ZodBoolean;
    role: z.ZodEnum<["user", "mod", "admin"]>;
}, "strip", z.ZodTypeAny, {
    role?: "user" | "admin" | "mod";
    email?: string;
    username?: string;
    bio?: string;
    isVerified?: boolean;
    isActive?: boolean;
    isBanned?: boolean;
    groupId?: string;
}, {
    role?: "user" | "admin" | "mod";
    email?: string;
    username?: string;
    bio?: string;
    isVerified?: boolean;
    isActive?: boolean;
    isBanned?: boolean;
    groupId?: string;
}>;
export declare const AdminUserUpdateSchema: z.ZodObject<{
    username: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    bio: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    groupId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    isActive: z.ZodOptional<z.ZodBoolean>;
    isVerified: z.ZodOptional<z.ZodBoolean>;
    isBanned: z.ZodOptional<z.ZodBoolean>;
    role: z.ZodOptional<z.ZodEnum<["user", "mod", "admin"]>>;
}, "strip", z.ZodTypeAny, {
    role?: "user" | "admin" | "mod";
    email?: string;
    username?: string;
    bio?: string;
    isVerified?: boolean;
    isActive?: boolean;
    isBanned?: boolean;
    groupId?: string;
}, {
    role?: "user" | "admin" | "mod";
    email?: string;
    username?: string;
    bio?: string;
    isVerified?: boolean;
    isActive?: boolean;
    isBanned?: boolean;
    groupId?: string;
}>;
/**
 * Category schemas
 */
export declare const AdminCategoryCreateSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodNullable<z.ZodString>;
    slug: z.ZodString;
    position: z.ZodNumber;
    isLocked: z.ZodBoolean;
    isVip: z.ZodBoolean;
    parentId: z.ZodNullable<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    position?: number;
    name?: string;
    slug?: string;
    description?: string;
    isLocked?: boolean;
    isVip?: boolean;
    parentId?: string;
}, {
    position?: number;
    name?: string;
    slug?: string;
    description?: string;
    isLocked?: boolean;
    isVip?: boolean;
    parentId?: string;
}>;
export declare const AdminCategoryUpdateSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    slug: z.ZodOptional<z.ZodString>;
    position: z.ZodOptional<z.ZodNumber>;
    isLocked: z.ZodOptional<z.ZodBoolean>;
    isVip: z.ZodOptional<z.ZodBoolean>;
    parentId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    position?: number;
    name?: string;
    slug?: string;
    description?: string;
    isLocked?: boolean;
    isVip?: boolean;
    parentId?: string;
}, {
    position?: number;
    name?: string;
    slug?: string;
    description?: string;
    isLocked?: boolean;
    isVip?: boolean;
    parentId?: string;
}>;
/**
 * Thread prefix schemas
 */
export declare const AdminThreadPrefixCreateSchema: z.ZodObject<{
    name: z.ZodString;
    color: z.ZodString;
    isActive: z.ZodBoolean;
    position: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    color?: string;
    position?: number;
    name?: string;
    isActive?: boolean;
}, {
    color?: string;
    position?: number;
    name?: string;
    isActive?: boolean;
}>;
export declare const AdminThreadPrefixUpdateSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    color: z.ZodOptional<z.ZodString>;
    isActive: z.ZodOptional<z.ZodBoolean>;
    position: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    color?: string;
    position?: number;
    name?: string;
    isActive?: boolean;
}, {
    color?: string;
    position?: number;
    name?: string;
    isActive?: boolean;
}>;
/**
 * Feature flag schemas
 */
export declare const AdminFeatureFlagCreateSchema: z.ZodObject<{
    enabled: z.ZodBoolean;
    name: z.ZodString;
    description: z.ZodString;
    expiresAt: z.ZodNullable<z.ZodDate>;
    rolloutPercentage: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    name?: string;
    enabled?: boolean;
    description?: string;
    expiresAt?: Date;
    rolloutPercentage?: number;
}, {
    name?: string;
    enabled?: boolean;
    description?: string;
    expiresAt?: Date;
    rolloutPercentage?: number;
}>;
export declare const AdminFeatureFlagUpdateSchema: z.ZodObject<{
    enabled: z.ZodOptional<z.ZodBoolean>;
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    expiresAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
    rolloutPercentage: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    name?: string;
    enabled?: boolean;
    description?: string;
    expiresAt?: Date;
    rolloutPercentage?: number;
}, {
    name?: string;
    enabled?: boolean;
    description?: string;
    expiresAt?: Date;
    rolloutPercentage?: number;
}>;
export declare const AdminUserBody: z.ZodObject<{
    username: z.ZodString;
    email: z.ZodString;
    role: z.ZodString;
    isActive: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    role?: string;
    email?: string;
    username?: string;
    isActive?: boolean;
}, {
    role?: string;
    email?: string;
    username?: string;
    isActive?: boolean;
}>;
export declare const AdminUserGroupBody: z.ZodObject<{
    name: z.ZodString;
    permissions: z.ZodArray<z.ZodString, "many">;
    description: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name?: string;
    description?: string;
    permissions?: string[];
}, {
    name?: string;
    description?: string;
    permissions?: string[];
}>;
export declare const AdminPaginatedResponse: <T extends z.ZodTypeAny>(item: T) => z.ZodObject<{
    data: z.ZodArray<T, "many">;
    total: z.ZodNumber;
    page: z.ZodNumber;
    pageSize: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    data?: T["_output"][];
    page?: number;
    pageSize?: number;
    total?: number;
}, {
    data?: T["_input"][];
    page?: number;
    pageSize?: number;
    total?: number;
}>;
export declare const ToggleFeatureFlagSchema: z.ZodObject<{
    enabled: z.ZodOptional<z.ZodBoolean>;
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    expiresAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
    rolloutPercentage: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    name?: string;
    enabled?: boolean;
    description?: string;
    expiresAt?: Date;
    rolloutPercentage?: number;
}, {
    name?: string;
    enabled?: boolean;
    description?: string;
    expiresAt?: Date;
    rolloutPercentage?: number;
}>;
export declare const RoleCreateInput: z.ZodObject<{
    name: z.ZodString;
    slug: z.ZodString;
    rank: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    name?: string;
    slug?: string;
    rank?: number;
}, {
    name?: string;
    slug?: string;
    rank?: number;
}>;
export declare const RoleUpdateInput: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    slug: z.ZodOptional<z.ZodString>;
    rank: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    name?: string;
    slug?: string;
    rank?: number;
}, {
    name?: string;
    slug?: string;
    rank?: number;
}>;
export declare const BulkUserRoleAssignment: z.ZodObject<{
    userIds: z.ZodArray<z.ZodString, "many">;
    newRole: z.ZodString;
    reason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    reason?: string;
    userIds?: string[];
    newRole?: string;
}, {
    reason?: string;
    userIds?: string[];
    newRole?: string;
}>;
export declare const TitleCreateInput: z.ZodObject<{
    name: z.ZodString;
    imageUrl: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name?: string;
    description?: string;
    imageUrl?: string;
}, {
    name?: string;
    description?: string;
    imageUrl?: string;
}>;
export declare const PermissionUpdateInput: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name?: string;
    description?: string;
}, {
    name?: string;
    description?: string;
}>;
export declare const XpActionCreateSchema: z.ZodObject<{
    key: z.ZodString;
    label: z.ZodString;
    amount: z.ZodNumber;
    icon: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    key?: string;
    label?: string;
    icon?: string;
    amount?: number;
}, {
    key?: string;
    label?: string;
    icon?: string;
    amount?: number;
}>;
export type XpActionCreateInput = z.infer<typeof XpActionCreateSchema>;
export declare const XpActionUpdateSchema: z.ZodObject<{
    key: z.ZodOptional<z.ZodString>;
    label: z.ZodOptional<z.ZodString>;
    amount: z.ZodOptional<z.ZodNumber>;
    icon: z.ZodOptional<z.ZodOptional<z.ZodString>>;
} & {
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    key?: string;
    label?: string;
    id?: string;
    icon?: string;
    amount?: number;
}, {
    key?: string;
    label?: string;
    id?: string;
    icon?: string;
    amount?: number;
}>;
export type XpActionUpdateInput = z.infer<typeof XpActionUpdateSchema>;
export declare const PermissionGroupCreateSchema: z.ZodObject<{
    name: z.ZodString;
    permissions: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    name?: string;
    permissions?: string[];
}, {
    name?: string;
    permissions?: string[];
}>;
export type PermissionGroupCreateInput = z.infer<typeof PermissionGroupCreateSchema>;
export declare const PermissionGroupUpdateSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    permissions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
} & {
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id?: string;
    name?: string;
    permissions?: string[];
}, {
    id?: string;
    name?: string;
    permissions?: string[];
}>;
export type PermissionGroupUpdateInput = z.infer<typeof PermissionGroupUpdateSchema>;
export declare const AdminToggleSchema: z.ZodObject<{
    key: z.ZodString;
    value: z.ZodUnion<[z.ZodBoolean, z.ZodString, z.ZodNumber]>;
}, "strip", z.ZodTypeAny, {
    key?: string;
    value?: string | number | boolean;
}, {
    key?: string;
    value?: string | number | boolean;
}>;
export type AdminToggleInput = z.infer<typeof AdminToggleSchema>;
