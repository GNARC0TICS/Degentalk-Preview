import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query'; // Removed useMutation and useQueryClient
import { RequireSuperAdmin } from '@/components/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
// useToast is now handled by useCrudMutation, but keep if used elsewhere directly
// import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useCrudMutation } from '@/hooks/useCrudMutation'; // Import the new hook
import { Plus, Pencil, Trash2 } from 'lucide-react';

import { AdminPageShell } from '@/components/admin/layout/AdminPageShell';
import { AdminDataTable } from '@/components/admin/common/AdminDataTable';
import { RoleFormDialog, roleSchema } from '@/components/admin/forms/roles/RoleFormDialog';
import type { RoleFormValues } from '@/components/admin/forms/roles/RoleFormDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'; // Keep Card for now
import type { RoleId } from '@shared/types';

// Type for Role data, extending form values with ID and timestamps
type Role = RoleFormValues & {
	id: RoleId;
	createdAt: string;
	updatedAt: string;
};

function RolesAdminPage() {
	// const queryClient = useQueryClient(); // Handled by useCrudMutation for invalidation
	// const { toast } = useToast(); // Handled by useCrudMutation

	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [editingRole, setEditingRole] = useState<Role | null>(null);

	const form = useForm<RoleFormValues>({
		resolver: zodResolver(roleSchema),
		defaultValues: {
			name: '',
			slug: '',
			rank: 0,
			isStaff: false,
			isModerator: false,
			isAdmin: false
		}
	});

	const {
		data: roles = [],
		isLoading,
		isError,
		error // Capture error for EntityTable
	} = useQuery<Role[]>({
		queryKey: ['/api/admin/roles'],
		queryFn: () => apiRequest({ url: '/api/admin/roles', method: 'GET' })
	});

	const saveRoleMutation = useCrudMutation<
		Role, // Assuming the API returns the saved/updated role
		Error,
		RoleFormValues & { id?: RoleId }
	>({
		mutationFn: async (values) => {
			if (values.id) {
				const { id, ...rest } = values;
				return apiRequest({ url: `/api/admin/roles/${id}`, method: 'PUT', data: rest  });
			}
			return apiRequest({ url: '/api/admin/roles', method: 'POST', data: values  });
		},
		queryKeyToInvalidate: ['/api/admin/roles'],
		successMessage: `Role ${editingRole ? 'updated' : 'created'} successfully.`,
		errorMessage: `Failed to ${editingRole ? 'update' : 'create'} role.`,
		onSuccessCallback: () => {
			form.reset();
			setEditingRole(null);
			setIsDialogOpen(false);
		}
	});

	const deleteRoleMutation = useCrudMutation<
		unknown, // Assuming delete might not return significant data
		Error,
		number // ID of the role to delete
	>({
		mutationFn: async (id) => apiRequest({ url: `/api/admin/roles/${id}`, method: 'DELETE' }),
		queryKeyToInvalidate: ['/api/admin/roles'],
		successMessage: 'Role removed successfully.',
		errorMessage: 'Failed to delete role.'
	});

	const handleSubmitDialog = (values: RoleFormValues) => {
		saveRoleMutation.mutate(editingRole ? { ...values, id: editingRole.id } : values);
	};

	const handleOpenNewDialog = () => {
		setEditingRole(null);
		// Form reset is handled by RoleFormDialog's useEffect
		setIsDialogOpen(true);
	};

	const handleOpenEditDialog = (role: Role) => {
		setEditingRole(role);
		// Form reset with initialData is handled by RoleFormDialog's useEffect
		setIsDialogOpen(true);
	};

	const handleDelete = (role: Role) => {
		// TODO: Replace confirm with a custom confirmation dialog for consistency
		if (window.confirm(`Are you sure you want to delete the role "${role.name}"?`)) {
			deleteRoleMutation.mutate(role.id);
		}
	};

	const columns = [
		{ key: 'name', header: 'Name' },
		{ key: 'slug', header: 'Slug' },
		{ key: 'rank', header: 'Rank' },
		{
			key: 'flags',
			header: 'Flags',
			render: (role: Role) => (
				<div className="flex gap-1">
					{role.isAdmin && (
						<span className="text-xs font-semibold px-2 py-0.5 rounded bg-red-500 text-white">
							Admin
						</span>
					)}
					{role.isModerator && (
						<span className="text-xs font-semibold px-2 py-0.5 rounded bg-yellow-500 text-black">
							Mod
						</span>
					)}
					{role.isStaff && (
						<span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-500 text-white">
							Staff
						</span>
					)}
				</div>
			)
		}
	];

	const pageActions = (
		<Button onClick={handleOpenNewDialog}>
			<Plus className="w-4 h-4 mr-2" /> New Role
		</Button>
	);

	return (
		<AdminPageShell title="Role Management" pageActions={pageActions}>
			<Card>
				<CardHeader>
					<CardTitle>All Roles</CardTitle>
					<CardDescription>Manage user roles and their privileges.</CardDescription>
				</CardHeader>
				<CardContent>
					<AdminDataTable<Role>
						columns={columns}
						data={roles}
						isLoading={isLoading}
						isError={isError}
						error={error}
						emptyStateMessage="No roles found. Click 'New Role' to add one."
						renderActions={(role) => (
							<div className="space-x-2">
								<Button size="sm" variant="outline" onClick={() => handleOpenEditDialog(role)}>
									<Pencil className="w-3 h-3 mr-1" /> Edit
								</Button>
								<Button size="sm" variant="destructive" onClick={() => handleDelete(role)}>
									<Trash2 className="w-3 h-3 mr-1" /> Delete
								</Button>
							</div>
						)}
					/>
				</CardContent>
			</Card>

			<RoleFormDialog
				isOpen={isDialogOpen}
				onOpenChange={setIsDialogOpen}
				onSubmit={handleSubmitDialog}
				initialData={editingRole}
				isSubmitting={saveRoleMutation.isPending}
				form={form}
			/>
		</AdminPageShell>
	);
}

export default function ProtectedRolesAdminPage() {
	return (
		<RequireSuperAdmin>
			<RolesAdminPage />
		</RequireSuperAdmin>
	);
}
