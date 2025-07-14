import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { hasRoleAtLeast, getUserPermissions } from '@/utils/roles';
import type { Role } from '@/utils/roles';

export function RoleTest() {
	const { user } = useAuth();

	if (!user) {
		return <div className="p-4 bg-red-100">Not authenticated</div>;
	}

	const userRole = user.role as Role;
	const permissions = getUserPermissions(userRole);

	return (
		<div className="p-4 bg-gray-100 rounded-lg space-y-2">
			<h3 className="font-bold">Role Testing Panel</h3>
			<p>
				<strong>User:</strong> {user.username}
			</p>
			<p>
				<strong>Role:</strong> {user.role}
			</p>

			<div className="space-y-1">
				<h4 className="font-semibold">Role Hierarchy Tests:</h4>
				<p>• Can access admin panel: {hasRoleAtLeast(userRole, 'admin') ? '✅' : '❌'}</p>
				<p>• Can moderate: {hasRoleAtLeast(userRole, 'moderator') ? '✅' : '❌'}</p>
				<p>• Is super admin: {hasRoleAtLeast(userRole, 'super_admin') ? '✅' : '❌'}</p>
				<p>• Can moderate shoutbox: {permissions.canModerateShoutbox ? '✅' : '❌'}</p>
			</div>

			<div className="space-y-1">
				<h4 className="font-semibold">Legacy Compatibility:</h4>
				<p>• isAdmin: {permissions.isAdmin ? '✅' : '❌'}</p>
				<p>• isModerator: {permissions.isModerator ? '✅' : '❌'}</p>
				<p>• isSuperAdmin: {permissions.isSuperAdmin ? '✅' : '❌'}</p>
			</div>
		</div>
	);
}
