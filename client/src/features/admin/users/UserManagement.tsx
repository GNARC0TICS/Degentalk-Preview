import type { UserId } from '@shared/types/ids';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/utils/queryClient';
import { useCrudMutation } from '@/hooks/useCrudMutation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
	User,
	MoreHorizontal,
	UserPlus,
	Pencil,
	Trash2,
	Ban,
	CheckCircle,
	ShieldAlert,
	Shield,
	Package
} from 'lucide-react';

import { AdminPageShell } from '@/features/admin/layout/layout/AdminPageShell';
import { AdminDataTable } from '@/features/admin/components/common/AdminDataTable';
import type { AdminDataTableProps } from '@/features/admin/components/common/AdminDataTable';
import { EntityFilters } from '@/features/admin/layout/layout/EntityFilters';
import type { FilterConfig, FilterValue } from '@/features/admin/layout/layout/EntityFilters'; // Type-only imports
import UserFormDialog from '@/features/admin/components/forms/users/UserFormDialog';
import {
	BanUserDialog,
	UnbanUserDialog,
	DeleteUserDialog,
	ChangeUserRoleDialog
} from '@/features/admin/components/forms/users/UserActionDialogs';
import { ROUTES } from '@/constants/routes';

// Define user type for type safety
// Ensure this matches the actual structure from your API and EntityTable needs
export interface AdminUser {
	id: string; // Changed to string to align with typical DB IDs, adjust if number
	username: string;
	email: string;
	role: string;
	status: string;
	posts: number;
	threads: number;
	createdAt: string; // Consider Date object if you do transformations
	// Add any other fields that might be returned or needed
}

// Form data for user creation/updates
export interface UserFormData {
	username?: string;
	email?: string;
	role?: string;
	password?: string;
}

interface UsersResponse {
	users: AdminUser[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

// Available roles for filtering and dialogs
const ROLES_OPTIONS = [
	{ value: 'all', label: 'All Roles' },
	{ value: 'admin', label: 'Admin' },
	{ value: 'moderator', label: 'Moderator' },
	{ value: 'user', label: 'User' }
];

// Available statuses for filtering
const STATUS_OPTIONS = [
	{ value: 'all', label: 'All Statuses' },
	{ value: 'active', label: 'Active' },
	{ value: 'banned', label: 'Banned' },
	{ value: 'pending', label: 'Pending' }
];

// Define a simple pagination state for now, until a proper pagination component is integrated
interface SimplePaginationState {
	pageIndex: number;
	pageSize: number;
}

export default function AdminUsersPage() {
	const [pagination, setPagination] = useState<SimplePaginationState>({
		pageIndex: 0, // API might be 1-indexed, adjust queryFn
		pageSize: 10
	});
	const [searchQuery, setSearchQuery] = useState('');
	const [filters, setFilters] = useState<Record<string, FilterValue>>({});

	// Dialog states
	const [isUserFormOpen, setIsUserFormOpen] = useState(false);
	const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
	const [userToBan, setUserToBan] = useState<AdminUser | null>(null);
	const [userToUnban, setUserToUnban] = useState<AdminUser | null>(null);
	const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);
	const [userToChangeRole, setUserToChangeRole] = useState<AdminUser | null>(null);

	const {
		data: usersResponse,
		isLoading,
		error
	} = useQuery<{ success: boolean; data: UsersResponse }>({
		queryKey: ['/api/admin/users', pagination.pageIndex, pagination.pageSize, searchQuery, filters],
		queryFn: async () => {
			const params: Record<string, string> = {
				page: (pagination.pageIndex + 1).toString(), // API is 1-indexed
				limit: pagination.pageSize.toString()
			};
			if (searchQuery) params.search = searchQuery;
			if (filters.role && filters.role !== 'all') params.role = filters.role as string;
			if (filters.status && filters.status !== 'all') params.status = filters.status as string;

			return apiRequest<{ success: boolean; data: UsersResponse }>({
				url: '/api/admin/users',
				method: 'GET',
				params
			});
		},
		placeholderData: (previousData) => previousData // Keep previous data while loading
	});

	const usersData = usersResponse?.data;

	const handleSearch = (query: string) => {
		setSearchQuery(query);
		setPagination((prev: SimplePaginationState) => ({ ...prev, pageIndex: 0 })); // Reset to first page on search
	};

	const handleFilterChange = (filterKey: string, value: FilterValue) => {
		setFilters((prev: Record<string, FilterValue>) => ({ ...prev, [filterKey]: value }));
		setPagination((prev: SimplePaginationState) => ({ ...prev, pageIndex: 0 })); // Reset to first page on filter change
	};

	const filtersConfig: FilterConfig[] = [
		{
			id: 'role',
			label: 'Role',
			type: 'select',
			options: ROLES_OPTIONS,
			placeholder: 'Filter by Role'
		},
		{
			id: 'status',
			label: 'Status',
			type: 'select',
			options: STATUS_OPTIONS,
			placeholder: 'Filter by Status'
		}
		// Date range filter can be added here once DatePickerWithRange is available
	];

	// Badge renderers (can be memoized or moved to utils if complex)
	const getStatusBadge = (status: string) => {
		switch (status) {
			case 'active':
				return <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>;
			case 'banned':
				return <Badge variant="destructive">Banned</Badge>;
			case 'pending':
				return (
					<Badge variant="outline" className="text-amber-600 border-amber-600">
						Pending
					</Badge>
				);
			default:
				return <Badge variant="outline">{status}</Badge>;
		}
	};

	const getRoleBadge = (role: string) => {
		switch (role) {
			case 'admin':
				return (
					<Badge className="bg-purple-600 hover:bg-purple-700">
						<Shield className="h-3 w-3 mr-1" /> Admin
					</Badge>
				);
			case 'moderator':
				return (
					<Badge className="bg-blue-600 hover:bg-blue-700">
						<ShieldAlert className="h-3 w-3 mr-1" /> Moderator
					</Badge>
				);
			case 'user':
				return (
					<Badge variant="outline">
						<User className="h-3 w-3 mr-1" /> User
					</Badge>
				);
			default:
				return <Badge variant="outline">{role}</Badge>;
		}
	};

	// Define columns for AdminDataTable
	const columns: AdminDataTableProps['columns'] = [
		{
			key: 'username',
			header: 'Username',
			render: (user: AdminUser) => (
				<Link
					href={`${ROUTES.ADMIN_USERS}/${user.id}`}
					className="font-medium text-primary hover:underline"
				>
					{user.username}
				</Link>
			)
		},
		{ key: 'email', header: 'Email', render: (user: AdminUser) => user.email },
		{
			key: 'role',
			header: 'Role',
			render: (user: AdminUser) => getRoleBadge(user.role)
		},
		{
			key: 'status',
			header: 'Status',
			render: (user: AdminUser) => getStatusBadge(user.status)
		},
		{
			key: 'posts',
			header: 'Posts',
			render: (user: AdminUser) => <div className="text-right">{user.posts}</div>
		},
		{
			key: 'threads',
			header: 'Threads',
			render: (user: AdminUser) => <div className="text-right">{user.threads}</div>
		},
		{
			key: 'createdAt',
			header: 'Joined',
			render: (user: AdminUser) => new Date(user.createdAt).toLocaleDateString()
		}
	];

	const renderUserActions = (user: AdminUser) => (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon">
					<MoreHorizontal className="h-4 w-4" />
					<span className="sr-only">Open menu for {user.username}</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuLabel>Actions</DropdownMenuLabel>
				<DropdownMenuItem
					onClick={() => {
						setEditingUser(user);
						setIsUserFormOpen(true);
					}}
				>
					<Pencil className="h-4 w-4 mr-2" /> Edit User
				</DropdownMenuItem>
				<DropdownMenuItem asChild>
					<Link to={`/admin/user-inventory/${user.id}`}>
						{' '}
						{/* Assuming this route exists */}
						<Package className="h-4 w-4 mr-2" /> View Inventory
					</Link>
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => setUserToChangeRole(user)}>
					<Shield className="h-4 w-4 mr-2" /> Change Role
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				{user.status === 'banned' ? (
					<DropdownMenuItem onClick={() => setUserToUnban(user)}>
						<CheckCircle className="h-4 w-4 mr-2" /> Unban User
					</DropdownMenuItem>
				) : (
					<DropdownMenuItem onClick={() => setUserToBan(user)}>
						<Ban className="h-4 w-4 mr-2" /> Ban User
					</DropdownMenuItem>
				)}
				<DropdownMenuSeparator />
				<DropdownMenuItem
					className="text-red-600 hover:!text-red-600 hover:!bg-red-100"
					onClick={() => setUserToDelete(user)}
				>
					<Trash2 className="h-4 w-4 mr-2" /> Delete User
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);

	// Define a type for the user form data
	interface UserFormData {
		username?: string;
		email?: string;
		// Add other fields as they are defined in UserFormDialog
		// e.g., password?: string; role?: string;
	}

	// CRUD mutations
	const createUserMutation = useCrudMutation({
		mutationFn: async (userData: UserFormData) => {
			return apiRequest<{ success: boolean; data: AdminUser }>({
				url: '/api/admin/users',
				method: 'POST',
				data: userData
			});
		},
		queryKeyToInvalidate: ['/api/admin/users'],
		successMessage: 'User created successfully!',
		errorMessage: 'Failed to create user'
	});

	const updateUserMutation = useCrudMutation({
		mutationFn: async ({ id, userData }: { id: string; userData: UserFormData }) => {
			return apiRequest<{ success: boolean; data: AdminUser }>({
				url: `/api/admin/users/${id}`,
				method: 'PUT',
				data: userData
			});
		},
		queryKeyToInvalidate: ['/api/admin/users'],
		successMessage: 'User updated successfully!',
		errorMessage: 'Failed to update user'
	});

	const handleUserFormSubmit = async (data: UserFormData) => {
		try {
			if (editingUser) {
				await updateUserMutation.mutateAsync({ id: editingUser.id, userData: data });
			} else {
				await createUserMutation.mutateAsync(data);
			}
			setIsUserFormOpen(false);
			setEditingUser(null);
		} catch (error) {
			// Error handling is done by useCrudMutation
			console.error('User form submission failed:', error);
		}
	};

	const banUserMutation = useCrudMutation({
		mutationFn: async (userId: UserId) => {
			return apiRequest<{ success: boolean; message: string }>({
				url: `/api/admin/users/${userId}/ban`,
				method: 'POST'
			});
		},
		queryKeyToInvalidate: ['/api/admin/users'],
		successMessage: 'User banned successfully!',
		errorMessage: 'Failed to ban user'
	});

	const unbanUserMutation = useCrudMutation({
		mutationFn: async (userId: UserId) => {
			return apiRequest<{ success: boolean; message: string }>({
				url: `/api/admin/users/${userId}/unban`,
				method: 'POST'
			});
		},
		queryKeyToInvalidate: ['/api/admin/users'],
		successMessage: 'User unbanned successfully!',
		errorMessage: 'Failed to unban user'
	});

	const deleteUserMutation = useCrudMutation({
		mutationFn: async (userId: UserId) => {
			return apiRequest<{ success: boolean; message: string }>({
				url: `/api/admin/users/${userId}`,
				method: 'DELETE'
			});
		},
		queryKeyToInvalidate: ['/api/admin/users'],
		successMessage: 'User deleted successfully!',
		errorMessage: 'Failed to delete user'
	});

	const changeRoleMutation = useCrudMutation({
		mutationFn: async ({ userId, newRole }: { userId: UserId; newRole: string }) => {
			return apiRequest<{ success: boolean; data: AdminUser }>({
				url: `/api/admin/users/${userId}/role`,
				method: 'PATCH',
				data: { role: newRole }
			});
		},
		queryKeyToInvalidate: ['/api/admin/users'],
		successMessage: 'User role updated successfully!',
		errorMessage: 'Failed to update user role'
	});

	const handleBanUser = async (userId: UserId) => {
		try {
			await banUserMutation.mutateAsync(userId);
			setUserToBan(null);
		} catch (error) {
			console.error('Ban user failed:', error);
		}
	};

	const handleUnbanUser = async (userId: UserId) => {
		try {
			await unbanUserMutation.mutateAsync(userId);
			setUserToUnban(null);
		} catch (error) {
			console.error('Unban user failed:', error);
		}
	};

	const handleDeleteUser = async (userId: UserId) => {
		try {
			await deleteUserMutation.mutateAsync(userId);
			setUserToDelete(null);
		} catch (error) {
			console.error('Delete user failed:', error);
		}
	};

	const handleChangeUserRole = async (userId: UserId, newRole: string) => {
		try {
			await changeRoleMutation.mutateAsync({ userId, newRole });
			setUserToChangeRole(null);
		} catch (error) {
			console.error('Change user role failed:', error);
		}
	};

	// const pageCount = usersData?.totalPages ?? -1; // For EntityTable pagination - to be handled by a separate pagination component

	return (
		<AdminPageShell
			title="Users Management"
			// description="Manage user accounts, roles, and permissions." // AdminPageShell does not have description prop
			pageActions={
				<Button
					onClick={() => {
						setEditingUser(null);
						setIsUserFormOpen(true);
					}}
				>
					<UserPlus className="h-4 w-4 mr-2" />
					Add New User
				</Button>
			}
		>
			<div className="space-y-4">
				{' '}
				{/* Added a wrapper for spacing */}
				<EntityFilters
					filtersConfig={filtersConfig}
					filters={filters}
					onFilterChange={handleFilterChange}
					onClearFilters={() => {
						setFilters({});
						setSearchQuery(''); // Also clear search query if desired
						setPagination((prev: SimplePaginationState) => ({ ...prev, pageIndex: 0 }));
					}}
					// Pass searchQuery and onSearchChange if EntityFilters is updated to handle a main search input
				/>
				<AdminDataTable
					columns={columns}
					data={usersData?.users || []}
					isLoading={isLoading}
					error={error as Error | null} // Cast error if needed
					renderActions={renderUserActions}
					searchPlaceholder="Search users by name/email..." // Example if EntityTable's internal search is used
					searchTerm={searchQuery}
					onSearchChange={handleSearch} // Connects to EntityTable's internal search
				/>
			</div>

			{/* Dialogs */}
			<UserFormDialog
				isOpen={isUserFormOpen}
				onClose={() => {
					setIsUserFormOpen(false);
					setEditingUser(null);
				}}
				user={editingUser}
				onSubmit={handleUserFormSubmit}
			/>
			<BanUserDialog
				isOpen={!!userToBan}
				onClose={() => setUserToBan(null)}
				user={userToBan}
				onConfirm={handleBanUser}
			/>
			<UnbanUserDialog
				isOpen={!!userToUnban}
				onClose={() => setUserToUnban(null)}
				user={userToUnban}
				onConfirm={handleUnbanUser}
			/>
			<DeleteUserDialog
				isOpen={!!userToDelete}
				onClose={() => setUserToDelete(null)}
				user={userToDelete}
				onConfirm={handleDeleteUser}
			/>
			<ChangeUserRoleDialog
				isOpen={!!userToChangeRole}
				onClose={() => setUserToChangeRole(null)}
				user={userToChangeRole}
				roles={ROLES_OPTIONS.filter((r) => r.value !== 'all').map((r) => r.value)} // Pass actual roles
				onConfirm={handleChangeUserRole}
			/>
		</AdminPageShell>
	);
}
