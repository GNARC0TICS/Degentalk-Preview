import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@app/components/ui/card';
import { Checkbox } from '@app/components/ui/checkbox';
import { Button } from '@app/components/ui/button';

interface Permission {
	id: string;
	name: string;
	description?: string;
	category: string;
}

interface PermissionsEditorProps {
	roleId: string;
	permissions: Permission[];
	rolePermissions: string[];
	onPermissionChange: (roleId: string, permissionId: string, granted: boolean) => void;
	isLoading?: boolean;
}

export function PermissionsEditor({
	roleId,
	permissions,
	rolePermissions,
	onPermissionChange,
	isLoading
}: PermissionsEditorProps) {
	const [localPermissions, setLocalPermissions] = useState<string[]>(rolePermissions);

	const handlePermissionToggle = (permissionId: string, granted: boolean) => {
		setLocalPermissions((prev) =>
			granted ? [...prev, permissionId] : prev.filter((id) => id !== permissionId)
		);
		onPermissionChange(roleId, permissionId, granted);
	};

	// Group permissions by category
	const groupedPermissions = permissions.reduce(
		(groups, permission) => {
			const category = permission.category || 'General';
			if (!groups[category]) {
				groups[category] = [];
			}
			groups[category].push(permission);
			return groups;
		},
		{} as Record<string, Permission[]>
	);

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Permissions</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="text-center py-8 text-zinc-400">Loading permissions...</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Role Permissions</CardTitle>
			</CardHeader>
			<CardContent className="space-y-6">
				{Object.entries(groupedPermissions).map(([category, categoryPermissions]) => (
					<div key={category} className="space-y-3">
						<h4 className="font-medium text-sm text-zinc-300 uppercase tracking-wider">
							{category}
						</h4>
						<div className="space-y-2">
							{categoryPermissions.map((permission) => (
								<div key={permission.id} className="flex items-center space-x-2">
									<Checkbox
										id={permission.id}
										checked={localPermissions.includes(permission.id)}
										onCheckedChange={(checked) =>
											handlePermissionToggle(permission.id, checked as boolean)
										}
									/>
									<div className="flex-1">
										<label
											htmlFor={permission.id}
											className="text-sm font-medium text-zinc-200 cursor-pointer"
										>
											{permission.name}
										</label>
										{permission.description && (
											<p className="text-xs text-zinc-500">{permission.description}</p>
										)}
									</div>
								</div>
							))}
						</div>
					</div>
				))}

				{Object.keys(groupedPermissions).length === 0 && (
					<div className="text-center py-8 text-zinc-400">No permissions available</div>
				)}
			</CardContent>
		</Card>
	);
}
