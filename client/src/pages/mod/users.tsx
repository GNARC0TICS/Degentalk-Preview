/**
 * User Management Page
 *
 * Comprehensive interface for moderators to manage users, bans, warnings, and bulk operations
 */

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
	Users,
	Search,
	Filter,
	Ban,
	Shield,
	AlertTriangle,
	Clock,
	Calendar,
	UserCheck,
	UserX,
	MessageSquare,
	Flag,
	Eye,
	MoreVertical,
	RefreshCw,
	UserPlus,
	Settings,
	History,
	Mail
} from 'lucide-react';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { apiRequest } from '@/lib/queryClient';

// Types
interface User {
	id: string;
	username: string;
	email: string;
	avatar?: string;
	role: 'user' | 'moderator' | 'admin';
	status: 'active' | 'banned' | 'suspended' | 'pending';
	joinedAt: string;
	lastActive: string;
	postCount: number;
	threadCount: number;
	reputation: number;
	warnings: number;
	bans: Ban[];
	isOnline: boolean;
	ipAddress?: string;
	userAgent?: string;
	metadata: {
		totalReports: number;
		reportsAgainst: number;
		moderationActions: number;
		trustScore: number;
	};
}

interface Ban {
	id: number;
	userId: string;
	bannedBy: string;
	reason: string;
	duration: string;
	createdAt: string;
	expiresAt?: string;
	isActive: boolean;
	type: 'temporary' | 'permanent' | 'suspended';
}

interface Warning {
	id: number;
	userId: string;
	issuedBy: string;
	reason: string;
	severity: 'low' | 'medium' | 'high';
	createdAt: string;
	acknowledged: boolean;
}

interface UsersFilters {
	search?: string;
	role?: string;
	status?: string;
	joinedAfter?: string;
	joinedBefore?: string;
	minPosts?: number;
	maxPosts?: number;
	hasWarnings?: boolean;
	isBanned?: boolean;
	isOnline?: boolean;
	sortBy?: string;
	sortOrder?: 'asc' | 'desc';
	page?: number;
	limit?: number;
}

// API Functions
const usersApi = {
	async getUsers(filters: UsersFilters) {
		return apiRequest<{
			users: User[];
			pagination: {
				page: number;
				limit: number;
				totalCount: number;
				totalPages: number;
				hasNext: boolean;
				hasPrev: boolean;
			};
		}>({
			url: '/api/mod/users',
			method: 'GET',
			params: filters
		});
	},

	async getUser(id: string) {
		return apiRequest<{ user: User }>({
			url: `/api/mod/users/${id}`,
			method: 'GET'
		});
	},

	async banUser(userId: string, data: { reason: string; duration: string; type: string }) {
		return apiRequest<{ message: string }>({
			url: `/api/mod/users/${userId}/ban`,
			method: 'POST',
			data
		});
	},

	async unbanUser(userId: string, reason: string) {
		return apiRequest<{ message: string }>({
			url: `/api/mod/users/${userId}/unban`,
			method: 'POST',
			data: { reason }
		});
	},

	async warnUser(userId: string, data: { reason: string; severity: string }) {
		return apiRequest<{ message: string }>({
			url: `/api/mod/users/${userId}/warn`,
			method: 'POST',
			data
		});
	},

	async updateUserRole(userId: string, role: string) {
		return apiRequest<{ message: string }>({
			url: `/api/mod/users/${userId}/role`,
			method: 'PATCH',
			data: { role }
		});
	},

	async getUserWarnings(userId: string) {
		return apiRequest<{ warnings: Warning[] }>({
			url: `/api/mod/users/${userId}/warnings`,
			method: 'GET'
		});
	}
};

export default function UserManagementPage() {
	const [filters, setFilters] = useState<UsersFilters>({
		page: 1,
		limit: 25,
		sortBy: 'lastActive',
		sortOrder: 'desc'
	});
	const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
	const [showFilters, setShowFilters] = useState(false);
	const [actionDialogOpen, setActionDialogOpen] = useState<{ type: string; userId: string } | null>(
		null
	);
	const [banData, setBanData] = useState({ reason: '', duration: '1d', type: 'temporary' });
	const [warnData, setWarnData] = useState({ reason: '', severity: 'medium' });

	const queryClient = useQueryClient();

	// Data queries
	const {
		data: usersData,
		isLoading,
		error
	} = useQuery({
		queryKey: ['mod-users', filters],
		queryFn: () => usersApi.getUsers(filters),
		staleTime: 30 * 1000
	});

	// Mutations
	const banUserMutation = useMutation({
		mutationFn: ({ userId, data }: { userId: string; data: any }) => usersApi.banUser(userId, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['mod-users'] });
			toast.success('User banned successfully');
			setActionDialogOpen(null);
			setBanData({ reason: '', duration: '1d', type: 'temporary' });
		},
		onError: (error: any) => {
			toast.error('Failed to ban user', { description: error.message });
		}
	});

	const unbanUserMutation = useMutation({
		mutationFn: ({ userId, reason }: { userId: string; reason: string }) =>
			usersApi.unbanUser(userId, reason),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['mod-users'] });
			toast.success('User unbanned successfully');
		},
		onError: (error: any) => {
			toast.error('Failed to unban user', { description: error.message });
		}
	});

	const warnUserMutation = useMutation({
		mutationFn: ({ userId, data }: { userId: string; data: any }) =>
			usersApi.warnUser(userId, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['mod-users'] });
			toast.success('Warning issued successfully');
			setActionDialogOpen(null);
			setWarnData({ reason: '', severity: 'medium' });
		},
		onError: (error: any) => {
			toast.error('Failed to issue warning', { description: error.message });
		}
	});

	const updateRoleMutation = useMutation({
		mutationFn: ({ userId, role }: { userId: string; role: string }) =>
			usersApi.updateUserRole(userId, role),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['mod-users'] });
			toast.success('User role updated successfully');
		},
		onError: (error: any) => {
			toast.error('Failed to update user role', { description: error.message });
		}
	});

	// Helper functions
	const getStatusColor = (status: string) => {
		switch (status) {
			case 'active':
				return 'bg-green-100 text-green-800 border-green-200';
			case 'banned':
				return 'bg-red-100 text-red-800 border-red-200';
			case 'suspended':
				return 'bg-yellow-100 text-yellow-800 border-yellow-200';
			case 'pending':
				return 'bg-blue-100 text-blue-800 border-blue-200';
			default:
				return 'bg-gray-100 text-gray-800 border-gray-200';
		}
	};

	const getRoleColor = (role: string) => {
		switch (role) {
			case 'admin':
				return 'bg-purple-100 text-purple-800 border-purple-200';
			case 'moderator':
				return 'bg-blue-100 text-blue-800 border-blue-200';
			default:
				return 'bg-gray-100 text-gray-800 border-gray-200';
		}
	};

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		const now = new Date();
		const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

		if (diffInHours < 1) {
			return 'Just now';
		}
		if (diffInHours < 24) {
			return `${diffInHours}h ago`;
		}
		if (diffInHours < 168) {
			return `${Math.floor(diffInHours / 24)}d ago`;
		}
		return date.toLocaleDateString();
	};

	const updateFilters = (newFilters: Partial<UsersFilters>) => {
		setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
	};

	const handleBulkAction = (action: string) => {
		if (selectedUsers.length === 0) {
			toast.error('No users selected');
			return;
		}
		toast.info(`Bulk ${action} for ${selectedUsers.length} users`);
		// TODO: Implement bulk actions
	};

	const handleQuickAction = (userId: string, action: string) => {
		const user = users.find((u) => u.id === userId);
		if (!user) return;

		switch (action) {
			case 'ban':
				setActionDialogOpen({ type: 'ban', userId });
				break;
			case 'unban':
				unbanUserMutation.mutate({ userId, reason: 'Manual unban by moderator' });
				break;
			case 'warn':
				setActionDialogOpen({ type: 'warn', userId });
				break;
			case 'promote':
				updateRoleMutation.mutate({ userId, role: 'moderator' });
				break;
			case 'demote':
				updateRoleMutation.mutate({ userId, role: 'user' });
				break;
		}
	};

	const users = usersData?.users || [];
	const pagination = usersData?.pagination;

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">User Management</h1>
					<p className="text-gray-600">Manage users, handle bans, warnings, and role assignments</p>
				</div>
				<div className="flex items-center space-x-3">
					<Button
						variant="outline"
						size="sm"
						onClick={() => queryClient.invalidateQueries({ queryKey: ['mod-users'] })}
						disabled={isLoading}
					>
						<RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
						Refresh
					</Button>
					<Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
						<Filter className="h-4 w-4 mr-2" />
						Filters
					</Button>
				</div>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-5 gap-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Users</CardTitle>
						<Users className="h-4 w-4 text-blue-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-blue-600">{pagination?.totalCount || 0}</div>
						<p className="text-xs text-gray-600">All registered</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Active Users</CardTitle>
						<UserCheck className="h-4 w-4 text-green-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-green-600">
							{users.filter((u) => u.status === 'active').length}
						</div>
						<p className="text-xs text-gray-600">Currently active</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Banned Users</CardTitle>
						<Ban className="h-4 w-4 text-red-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-red-600">
							{users.filter((u) => u.status === 'banned').length}
						</div>
						<p className="text-xs text-gray-600">Currently banned</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Online Now</CardTitle>
						<Clock className="h-4 w-4 text-purple-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-purple-600">
							{users.filter((u) => u.isOnline).length}
						</div>
						<p className="text-xs text-gray-600">Currently online</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Warnings Issued</CardTitle>
						<AlertTriangle className="h-4 w-4 text-yellow-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-yellow-600">
							{users.reduce((sum, u) => sum + u.warnings, 0)}
						</div>
						<p className="text-xs text-gray-600">Total warnings</p>
					</CardContent>
				</Card>
			</div>

			{/* Filters Panel */}
			{showFilters && (
				<Card>
					<CardHeader>
						<CardTitle className="text-lg">Filter Users</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
							<div>
								<Label htmlFor="search-filter">Search</Label>
								<div className="relative">
									<Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
									<Input
										id="search-filter"
										placeholder="Username or email..."
										value={filters.search || ''}
										onChange={(e) => updateFilters({ search: e.target.value })}
										className="pl-10"
									/>
								</div>
							</div>
							<div>
								<Label htmlFor="role-filter">Role</Label>
								<Select
									value={filters.role || 'all'}
									onValueChange={(value) =>
										updateFilters({ role: value === 'all' ? undefined : value })
									}
								>
									<SelectTrigger>
										<SelectValue placeholder="All roles" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">All Roles</SelectItem>
										<SelectItem value="user">User</SelectItem>
										<SelectItem value="moderator">Moderator</SelectItem>
										<SelectItem value="admin">Admin</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div>
								<Label htmlFor="status-filter">Status</Label>
								<Select
									value={filters.status || 'all'}
									onValueChange={(value) =>
										updateFilters({ status: value === 'all' ? undefined : value })
									}
								>
									<SelectTrigger>
										<SelectValue placeholder="All statuses" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">All Statuses</SelectItem>
										<SelectItem value="active">Active</SelectItem>
										<SelectItem value="banned">Banned</SelectItem>
										<SelectItem value="suspended">Suspended</SelectItem>
										<SelectItem value="pending">Pending</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div>
								<Label htmlFor="sort-filter">Sort By</Label>
								<Select
									value={filters.sortBy || 'lastActive'}
									onValueChange={(value) => updateFilters({ sortBy: value })}
								>
									<SelectTrigger>
										<SelectValue placeholder="Sort by" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="lastActive">Last Active</SelectItem>
										<SelectItem value="joinedAt">Join Date</SelectItem>
										<SelectItem value="username">Username</SelectItem>
										<SelectItem value="postCount">Post Count</SelectItem>
										<SelectItem value="reputation">Reputation</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Bulk Actions */}
			{selectedUsers.length > 0 && (
				<Alert>
					<Users className="h-4 w-4" />
					<AlertDescription className="flex items-center justify-between">
						<span>{selectedUsers.length} users selected</span>
						<div className="flex space-x-2">
							<Button size="sm" onClick={() => handleBulkAction('warn')}>
								Issue Warning
							</Button>
							<Button size="sm" variant="outline" onClick={() => handleBulkAction('message')}>
								Send Message
							</Button>
							<Button size="sm" variant="destructive" onClick={() => handleBulkAction('ban')}>
								Ban Users
							</Button>
						</div>
					</AlertDescription>
				</Alert>
			)}

			{/* Users Table */}
			<Card>
				<CardHeader>
					<CardTitle>Users</CardTitle>
					<CardDescription>
						{pagination
							? `Showing ${pagination.page * pagination.limit - pagination.limit + 1}-${Math.min(pagination.page * pagination.limit, pagination.totalCount)} of ${pagination.totalCount} users`
							: 'Loading users...'}
					</CardDescription>
				</CardHeader>
				<CardContent>
					{error ? (
						<Alert variant="destructive">
							<AlertTriangle className="h-4 w-4" />
							<AlertDescription>Failed to load users: {error.message}</AlertDescription>
						</Alert>
					) : isLoading ? (
						<div className="text-center py-8">
							<RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
							<p>Loading users...</p>
						</div>
					) : users.length === 0 ? (
						<div className="text-center py-8">
							<Users className="h-8 w-8 mx-auto mb-4 text-gray-400" />
							<p>No users found matching your filters</p>
						</div>
					) : (
						<div className="space-y-4">
							{users.map((user) => (
								<div key={user.id} className="border rounded-lg p-4 hover:bg-gray-50">
									<div className="flex items-center justify-between">
										<div className="flex items-center space-x-4 flex-1">
											<Checkbox
												checked={selectedUsers.includes(user.id)}
												onCheckedChange={(checked) => {
													if (checked) {
														setSelectedUsers((prev) => [...prev, user.id]);
													} else {
														setSelectedUsers((prev) => prev.filter((id) => id !== user.id));
													}
												}}
											/>
											<Avatar className="h-10 w-10">
												<AvatarImage src={user.avatar} />
												<AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
											</Avatar>
											<div className="flex-1">
												<div className="flex items-center space-x-2 mb-1">
													<span className="font-medium">{user.username}</span>
													{user.isOnline && (
														<div className="w-2 h-2 bg-green-500 rounded-full"></div>
													)}
													<Badge className={getStatusColor(user.status)}>{user.status}</Badge>
													<Badge className={getRoleColor(user.role)}>{user.role}</Badge>
													{user.warnings > 0 && (
														<Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
															{user.warnings} warnings
														</Badge>
													)}
												</div>
												<div className="flex items-center space-x-4 text-sm text-gray-500">
													<span>{user.email}</span>
													<span>{user.postCount} posts</span>
													<span>{user.threadCount} threads</span>
													<span>Rep: {user.reputation}</span>
													<span>Joined: {formatDate(user.joinedAt)}</span>
													<span>Last active: {formatDate(user.lastActive)}</span>
												</div>
											</div>
										</div>
										<div className="flex items-center space-x-2">
											<Button
												size="sm"
												variant="outline"
												onClick={() => window.open(`/profile/${user.username}`, '_blank')}
											>
												<Eye className="h-4 w-4" />
											</Button>
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button size="sm" variant="outline">
														<MoreVertical className="h-4 w-4" />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align="end">
													<DropdownMenuItem onClick={() => handleQuickAction(user.id, 'warn')}>
														<AlertTriangle className="h-4 w-4 mr-2" />
														Issue Warning
													</DropdownMenuItem>
													{user.status === 'banned' ? (
														<DropdownMenuItem onClick={() => handleQuickAction(user.id, 'unban')}>
															<UserCheck className="h-4 w-4 mr-2" />
															Unban User
														</DropdownMenuItem>
													) : (
														<DropdownMenuItem onClick={() => handleQuickAction(user.id, 'ban')}>
															<Ban className="h-4 w-4 mr-2" />
															Ban User
														</DropdownMenuItem>
													)}
													<Separator />
													{user.role === 'user' && (
														<DropdownMenuItem onClick={() => handleQuickAction(user.id, 'promote')}>
															<Shield className="h-4 w-4 mr-2" />
															Promote to Moderator
														</DropdownMenuItem>
													)}
													{user.role === 'moderator' && (
														<DropdownMenuItem onClick={() => handleQuickAction(user.id, 'demote')}>
															<UserX className="h-4 w-4 mr-2" />
															Demote to User
														</DropdownMenuItem>
													)}
													<DropdownMenuItem>
														<Mail className="h-4 w-4 mr-2" />
														Send Message
													</DropdownMenuItem>
													<DropdownMenuItem>
														<History className="h-4 w-4 mr-2" />
														View History
													</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>
										</div>
									</div>
								</div>
							))}
						</div>
					)}

					{/* Pagination */}
					{pagination && pagination.totalPages > 1 && (
						<div className="flex items-center justify-between mt-6">
							<Button
								variant="outline"
								disabled={!pagination.hasPrev}
								onClick={() => updateFilters({ page: filters.page! - 1 })}
							>
								Previous
							</Button>
							<span className="text-sm text-gray-600">
								Page {pagination.page} of {pagination.totalPages}
							</span>
							<Button
								variant="outline"
								disabled={!pagination.hasNext}
								onClick={() => updateFilters({ page: filters.page! + 1 })}
							>
								Next
							</Button>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Action Dialogs */}
			{actionDialogOpen && (
				<Dialog open={true} onOpenChange={() => setActionDialogOpen(null)}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>
								{actionDialogOpen.type === 'ban' ? 'Ban User' : 'Issue Warning'}
							</DialogTitle>
							<DialogDescription>
								{actionDialogOpen.type === 'ban'
									? 'Temporarily or permanently ban this user from the platform'
									: 'Issue a formal warning to this user'}
							</DialogDescription>
						</DialogHeader>
						{actionDialogOpen.type === 'ban' ? (
							<div className="space-y-4">
								<div>
									<Label htmlFor="ban-reason">Reason</Label>
									<Textarea
										id="ban-reason"
										placeholder="Enter the reason for this ban..."
										value={banData.reason}
										onChange={(e) => setBanData({ ...banData, reason: e.target.value })}
									/>
								</div>
								<div className="grid grid-cols-2 gap-4">
									<div>
										<Label htmlFor="ban-duration">Duration</Label>
										<Select
											value={banData.duration}
											onValueChange={(value) => setBanData({ ...banData, duration: value })}
										>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="1h">1 Hour</SelectItem>
												<SelectItem value="1d">1 Day</SelectItem>
												<SelectItem value="3d">3 Days</SelectItem>
												<SelectItem value="1w">1 Week</SelectItem>
												<SelectItem value="1m">1 Month</SelectItem>
												<SelectItem value="permanent">Permanent</SelectItem>
											</SelectContent>
										</Select>
									</div>
									<div>
										<Label htmlFor="ban-type">Type</Label>
										<Select
											value={banData.type}
											onValueChange={(value) => setBanData({ ...banData, type: value })}
										>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="temporary">Temporary</SelectItem>
												<SelectItem value="permanent">Permanent</SelectItem>
												<SelectItem value="suspended">Suspended</SelectItem>
											</SelectContent>
										</Select>
									</div>
								</div>
							</div>
						) : (
							<div className="space-y-4">
								<div>
									<Label htmlFor="warn-reason">Reason</Label>
									<Textarea
										id="warn-reason"
										placeholder="Enter the reason for this warning..."
										value={warnData.reason}
										onChange={(e) => setWarnData({ ...warnData, reason: e.target.value })}
									/>
								</div>
								<div>
									<Label htmlFor="warn-severity">Severity</Label>
									<Select
										value={warnData.severity}
										onValueChange={(value) => setWarnData({ ...warnData, severity: value })}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="low">Low</SelectItem>
											<SelectItem value="medium">Medium</SelectItem>
											<SelectItem value="high">High</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>
						)}
						<DialogFooter>
							<Button variant="outline" onClick={() => setActionDialogOpen(null)}>
								Cancel
							</Button>
							<Button
								onClick={() => {
									if (actionDialogOpen.type === 'ban') {
										banUserMutation.mutate({ userId: actionDialogOpen.userId, data: banData });
									} else {
										warnUserMutation.mutate({ userId: actionDialogOpen.userId, data: warnData });
									}
								}}
								disabled={
									actionDialogOpen.type === 'ban'
										? !banData.reason || banUserMutation.isPending
										: !warnData.reason || warnUserMutation.isPending
								}
							>
								{actionDialogOpen.type === 'ban' ? 'Ban User' : 'Issue Warning'}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			)}
		</div>
	);
}
