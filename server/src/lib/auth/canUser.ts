import { roles as rolesTable, userRoles as userRolesTable } from '@schema';
import { db } from '@degentalk/db';
import { and, eq, inArray } from 'drizzle-orm';
import type { UserId } from '@shared/types';

/**
 * Shape of the User object expected in permission checks.
 * - `primaryRoleId` may be null for legacy users.
 * - `roles` is an optional array of secondary role IDs already pre-loaded by the calling code.
 */
export interface RBACUser {
	id: UserId;
	primaryRoleId?: string | null;
	// optional cache of secondary roles to avoid extra DB hits
	secondaryRoleIds?: string[];
	isBanned?: boolean;
}

/**
 * Fetch a consolidated list of role permission strings for the user.
 */
async function getUserPermissions(user: RBACUser): Promise<string[]> {
	const roleIds: string[] = [];
	if (user.primaryRoleId) roleIds.push(user.primaryRoleId);
	if (user.secondaryRoleIds && user.secondaryRoleIds.length) {
		roleIds.push(...user.secondaryRoleIds);
	} else {
		// Pull secondary roles from pivot table if not provided
		const pivotRows = await db
			.select({ roleId: userRolesTable.roleId })
			.from(userRolesTable)
			.where(eq(userRolesTable.userId, user.id));
		roleIds.push(...pivotRows.map((r: { roleId: string }) => r.roleId));
	}

	if (roleIds.length === 0) return [];

	const roleRows = await db
		.select({ permissions: rolesTable.permissions })
		.from(rolesTable)
		.where(inArray(rolesTable.id, roleIds));

	const perms = new Set<string>();
	roleRows.forEach((row: { permissions: string[] | null }) => {
		if (Array.isArray(row.permissions)) {
			row.permissions.forEach((p: string) => perms.add(p));
		}
	});
	return Array.from(perms);
}

/**
 * Central permission gate.
 * Returns true if *any* of the user's roles includes the requested action.
 */
export async function canUser(user: RBACUser, action: string): Promise<boolean> {
	if (!user || user.isBanned) return false;

	const permissions = await getUserPermissions(user);
	if (permissions.includes('*')) return true;
	return permissions.includes(action);
}

/**
 * Return the highest XP multiplier across all user roles.
 * Defaults to 1.0.
 */
export async function getXpMultiplier(user: RBACUser): Promise<number> {
	if (!user || user.isBanned) return 0;
	const roleIds: string[] = [];
	if (user.primaryRoleId) roleIds.push(user.primaryRoleId);
	if (user.secondaryRoleIds && user.secondaryRoleIds.length) {
		roleIds.push(...user.secondaryRoleIds);
	}
	if (roleIds.length === 0) return 1.0;
	const rows = await db
		.select({ xpMultiplier: rolesTable.xpMultiplier })
		.from(rolesTable)
		.where(inArray(rolesTable.id, roleIds));
	const max = rows.reduce(
		(acc: number, r: { xpMultiplier: number | null }) => Math.max(acc, r.xpMultiplier ?? 1),
		1
	);
	return max || 1.0;
}

/*
 * Convenience sync versions for callers that already have permissions cached.
 */
export function canUserSync(permissions: string[] | undefined, action: string): boolean {
	if (!permissions) return false;
	if (permissions.includes('*')) return true;
	return permissions.includes(action);
}
