import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from '@/components/ui/table';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle
} from '@/components/ui/dialog';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
	Plus,
	MoreHorizontal,
	Edit,
	Trash2,
	Shield,
	Crown,
	Settings,
	Users,
	ChevronRight,
	ChevronDown
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@utils/api-request';
import { RoleForm } from './RoleForm';
import { PermissionsEditor } from '../permissions/PermissionsEditor';
import type { Role, Title, Permission } from '@/features/admin/views/roles-titles';

interface RolesSectionProps {
	roles: Role[];
	permissions: Record<string, Permission[]>;
	titles: Title[];
	isLoading: boolean;
}

export function RolesSection({ roles, titles, isLoading }: Omit<RolesSectionProps, 'permissions'>) {
	const { toast } = useToast();
	const queryClient = useQueryClient();
	const [selectedRole, setSelectedRole] = useState<Role | null>(null);
	const [expandedRoles, setExpandedRoles] = useState<Set<string>>(new Set());
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

	// Delete role mutation
	const deleteRoleMutation = useMutation({
		mutationFn: async (roleId: string) => {
			return apiRequest({ url: `/api/admin/roles/${roleId}`, method: 'DELETE' });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['admin-roles'] });
			setIsDeleteDialogOpen(false);
			setSelectedRole(null);
			toast({
				title: 'Role Deleted',
				description: 'The role has been successfully deleted.'
			});
		},
		onError: (error: Error) => {
			toast({
				title: 'Delete Failed',
				description: error.message || 'Failed to delete role',
				variant: 'destructive'
			});
		}
	});

	const handleCreateRole = () => {
		setSelectedRole(null);
		setIsCreateDialogOpen(true);
	};

	const handleEditRole = (role: Role) => {
		setSelectedRole(role);
		setIsEditDialogOpen(true);
	};

	const handleDeleteRole = (role: Role) => {
		setSelectedRole(role);
		setIsDeleteDialogOpen(true);
	};

	const confirmDelete = () => {
		if (selectedRole) {
			deleteRoleMutation.mutate(selectedRole.id);
		}
	};

	const toggleRoleExpansion = (roleId: string) => {
		setExpandedRoles((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(roleId)) {
				newSet.delete(roleId);
			} else {
				newSet.add(roleId);
			}
			return newSet;
		});
	};

	const getRoleTypeIcon = (role: Role) => {
		if (role.isAdmin) return <Shield className="h-4 w-4 text-red-500" />;
		if (role.isModerator) return <Shield className="h-4 w-4 text-blue-500" />;
		if (role.isStaff) return <Settings className="h-4 w-4 text-green-500" />;
		return <Users className="h-4 w-4 text-gray-500" />;
	};

	const getRoleTypeBadge = (role: Role) => {
		if (role.isAdmin) return <Badge variant="destructive">Admin</Badge>;
		if (role.isModerator) return <Badge variant="default">Moderator</Badge>;
		if (role.isStaff) return <Badge variant="secondary">Staff</Badge>;
		return <Badge variant="outline">User</Badge>;
	};

	const getRoleTitles = (roleId: string) => {
		return titles.filter((title) => title.roleId === roleId);
	};

	if (isLoading) {
		return (
			<Card>
				<CardContent className="p-6">
					<div className="flex justify-center">
						<p>Loading roles...</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle className="flex items-center gap-2">
								<Shield className="h-5 w-5" />
								User Roles
							</CardTitle>
							<CardDescription>Manage user roles, permissions, and access levels</CardDescription>
						</div>
						<Button onClick={handleCreateRole}>
							<Plus className="h-4 w-4 mr-2" />
							Create Role
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					<div className="rounded-md border">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="w-12"></TableHead>
									<TableHead>Role</TableHead>
									<TableHead>Type</TableHead>
									<TableHead>Permissions</TableHead>
									<TableHead>XP Multiplier</TableHead>
									<TableHead>Titles</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{roles.map((role) => {
									const isExpanded = expandedRoles.has(role.id);
									const roleTitles = getRoleTitles(role.id);

									return (
										<React.Fragment key={role.id}>
											<TableRow>
												<TableCell>
													<Button
														variant="ghost"
														size="sm"
														onClick={() => toggleRoleExpansion(role.id)}
													>
														{isExpanded ? (
															<ChevronDown className="h-4 w-4" />
														) : (
															<ChevronRight className="h-4 w-4" />
														)}
													</Button>
												</TableCell>
												<TableCell>
													<div className="flex items-center space-x-3">
														{getRoleTypeIcon(role)}
														<div>
															<div className="flex items-center space-x-2">
																<span className="font-medium">{role.name}</span>
																{role.isSystemRole && (
																	<Badge variant="outline" className="text-xs">
																		System
																	</Badge>
																)}
															</div>
															{role.description && (
																<p className="text-sm text-muted-foreground">{role.description}</p>
															)}
														</div>
													</div>
												</TableCell>
												<TableCell>{getRoleTypeBadge(role)}</TableCell>
												<TableCell>
													<Badge variant="outline">{role.permissions.length} permissions</Badge>
												</TableCell>
												<TableCell>
													<Badge variant="outline">{role.xpMultiplier}x</Badge>
												</TableCell>
												<TableCell>
													{roleTitles.length > 0 ? (
														<Badge variant="outline">{roleTitles.length} titles</Badge>
													) : (
														<span className="text-muted-foreground text-sm">No titles</span>
													)}
												</TableCell>
												<TableCell className="text-right">
													<DropdownMenu>
														<DropdownMenuTrigger asChild>
															<Button variant="ghost" size="sm">
																<MoreHorizontal className="h-4 w-4" />
																<span className="sr-only">Actions</span>
															</Button>
														</DropdownMenuTrigger>
														<DropdownMenuContent align="end">
															<DropdownMenuLabel>Actions</DropdownMenuLabel>
															<DropdownMenuItem onClick={() => handleEditRole(role)}>
																<Edit className="h-4 w-4 mr-2" />
																Edit Role
															</DropdownMenuItem>
															<DropdownMenuSeparator />
															{!role.isSystemRole && (
																<DropdownMenuItem
																	onClick={() => handleDeleteRole(role)}
																	className="text-red-600"
																>
																	<Trash2 className="h-4 w-4 mr-2" />
																	Delete Role
																</DropdownMenuItem>
															)}
														</DropdownMenuContent>
													</DropdownMenu>
												</TableCell>
											</TableRow>
											{isExpanded && (
												<TableRow>
													<TableCell colSpan={7} className="p-0">
														<div className="border-t bg-muted/50 p-4 space-y-4">
															{/* Role Details */}
															<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
																<div>
																	<h4 className="font-semibold mb-2">Role Information</h4>
																	<div className="space-y-1 text-sm">
																		<div className="flex justify-between">
																			<span>Slug:</span>
																			<code className="text-xs bg-background px-1 rounded">
																				{role.slug}
																			</code>
																		</div>
																		<div className="flex justify-between">
																			<span>Rank:</span>
																			<span>{role.rank}</span>
																		</div>
																		<div className="flex justify-between">
																			<span>Created:</span>
																			<span>{new Date(role.createdAt).toLocaleDateString()}</span>
																		</div>
																	</div>
																</div>
																<div>
																	<h4 className="font-semibold mb-2">Visual Settings</h4>
																	<div className="space-y-1 text-sm">
																		{role.textColor && (
																			<div className="flex justify-between items-center">
																				<span>Text Color:</span>
																				<div className="flex items-center space-x-2">
																					<div
																						className="w-4 h-4 rounded border"
																						style={{ backgroundColor: role.textColor }}
																					/>
																					<code className="text-xs">{role.textColor}</code>
																				</div>
																			</div>
																		)}
																		{role.backgroundColor && (
																			<div className="flex justify-between items-center">
																				<span>Background:</span>
																				<div className="flex items-center space-x-2">
																					<div
																						className="w-4 h-4 rounded border"
																						style={{ backgroundColor: role.backgroundColor }}
																					/>
																					<code className="text-xs">{role.backgroundColor}</code>
																				</div>
																			</div>
																		)}
																	</div>
																</div>
															</div>

															{/* Role Titles */}
															{roleTitles.length > 0 && (
																<div>
																	<h4 className="font-semibold mb-2 flex items-center gap-2">
																		<Crown className="h-4 w-4" />
																		Associated Titles
																	</h4>
																	<div className="flex flex-wrap gap-2">
																		{roleTitles.map((title) => (
																			<div
																				key={title.id}
																				className="inline-block px-2 py-1 rounded text-sm border"
																				style={{
																					color: title.textColor || undefined,
																					backgroundColor: title.backgroundColor || undefined,
																					borderColor: title.borderColor || undefined
																				}}
																			>
																				{title.emoji && <span className="mr-1">{title.emoji}</span>}
																				{title.name}
																			</div>
																		))}
																	</div>
																</div>
															)}

															{/* Permissions Preview */}
															<div>
																<h4 className="font-semibold mb-2 flex items-center gap-2">
																	<Settings className="h-4 w-4" />
																	Permissions ({role.permissions.length})
																</h4>
																{role.permissions.length > 0 ? (
																	<div className="flex flex-wrap gap-1">
																		{role.permissions.slice(0, 10).map((permission) => (
																			<Badge key={permission} variant="outline" className="text-xs">
																				{permission}
																			</Badge>
																		))}
																		{role.permissions.length > 10 && (
																			<Badge variant="outline" className="text-xs">
																				+{role.permissions.length - 10} more
																			</Badge>
																		)}
																	</div>
																) : (
																	<p className="text-sm text-muted-foreground">
																		No permissions assigned
																	</p>
																)}
															</div>
														</div>
													</TableCell>
												</TableRow>
											)}
										</React.Fragment>
									);
								})}
							</TableBody>
						</Table>
					</div>
				</CardContent>
			</Card>

			{/* Create Role Dialog */}
			<Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
				<DialogContent className="sm:max-w-[600px]">
					<DialogHeader>
						<DialogTitle>Create New Role</DialogTitle>
						<DialogDescription>
							Create a new user role with specific permissions and settings.
						</DialogDescription>
					</DialogHeader>
					<RoleForm
						role={undefined}
						onSubmit={() => {
							setIsCreateDialogOpen(false);
							queryClient.invalidateQueries({ queryKey: ['admin-roles'] });
						}}
						onCancel={() => setIsCreateDialogOpen(false)}
					/>
				</DialogContent>
			</Dialog>

			{/* Edit Role Dialog */}
			<Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
				<DialogContent className="sm:max-w-[600px]">
					<DialogHeader>
						<DialogTitle>Edit Role</DialogTitle>
						<DialogDescription>
							Modify role settings, permissions, and visual properties.
						</DialogDescription>
					</DialogHeader>
					<RoleForm
						role={selectedRole || undefined}
						onSubmit={() => {
							setIsEditDialogOpen(false);
							setSelectedRole(null);
							queryClient.invalidateQueries({ queryKey: ['admin-roles'] });
						}}
						onCancel={() => {
							setIsEditDialogOpen(false);
							setSelectedRole(null);
						}}
					/>
				</DialogContent>
			</Dialog>

			{/* Delete Role Dialog */}
			<Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Delete Role</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete this role? This action cannot be undone.
						</DialogDescription>
					</DialogHeader>
					{selectedRole && (
						<div className="py-4">
							<div className="flex items-center space-x-3 p-3 border rounded-md">
								{getRoleTypeIcon(selectedRole)}
								<div>
									<p className="font-medium">{selectedRole.name}</p>
									{selectedRole.description && (
										<p className="text-sm text-muted-foreground">{selectedRole.description}</p>
									)}
								</div>
								{getRoleTypeBadge(selectedRole)}
							</div>
							{selectedRole.isSystemRole && (
								<p className="text-sm text-red-600 mt-2">
									⚠️ This is a system role and cannot be deleted.
								</p>
							)}
						</div>
					)}
					<DialogFooter>
						<Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={confirmDelete}
							disabled={deleteRoleMutation.isPending || selectedRole?.isSystemRole}
						>
							{deleteRoleMutation.isPending ? 'Deleting...' : 'Delete Role'}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
