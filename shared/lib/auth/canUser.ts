/**
 * Role-Based Access Control (RBAC) utilities for the Degentalk application.
 *
 * This module provides centralized permission checking functions used throughout
 * the application to ensure consistent access control.
 */

import { db } from '@/lib/db';
import { eq, inArray } from 'drizzle-orm';
import { users, roles, userRoles, rolePermissions } from '@schema';

export type UserRole = 'user' | 'moderator' | 'admin' | 'super_admin';

export interface RBACUser {
	id: number;
	primaryRoleId?: number | null;
	// optional cache of secondary roles to avoid extra DB hits
	secondaryRoleIds?: number[];
	isBanned?: boolean;
}

/**
 * Fetch a consolidated list of role permission IDs for the user.
 */
async function getUserPermissions(user: RBACUser): Promise<string[]> {
	const roleIds: number[] = [];
	if (user.primaryRoleId) roleIds.push(user.primaryRoleId);
	if (user.secondaryRoleIds && user.secondaryRoleIds.length) {
		roleIds.push(...user.secondaryRoleIds);
	} else {
		// Pull secondary roles from pivot table if not provided
		const pivotRows = await db
			.select({ roleId: userRoles.roleId })
			.from(userRoles)
			.where(eq(userRoles.userId, user.id));
		roleIds.push(...pivotRows.map((r) => r.roleId));
	}

	if (roleIds.length === 0) return [];

	// Fetch permissions for all roles
	const permissions = await db
		.select({ permission: rolePermissions.permission })
		.from(rolePermissions)
		.where(inArray(rolePermissions.roleId, roleIds));

	return Array.from(new Set(permissions.map((p) => p.permission)));
}

/**
 * Check if user has a specific permission
 */
export async function canUser(user: RBACUser, permission: string): Promise<boolean> {
	if (user.isBanned) return false;

	const permissions = await getUserPermissions(user);
	return permissions.includes(permission);
}

/**
 * Check if user has any of the provided permissions
 */
export async function canUserAny(user: RBACUser, permissions: string[]): Promise<boolean> {
	if (user.isBanned) return false;

	const userPermissions = await getUserPermissions(user);
	return permissions.some((p) => userPermissions.includes(p));
}

/**
 * Check if user has all of the provided permissions
 */
export async function canUserAll(user: RBACUser, permissions: string[]): Promise<boolean> {
	if (user.isBanned) return false;

	const userPermissions = await getUserPermissions(user);
	return permissions.every((p) => userPermissions.includes(p));
}
