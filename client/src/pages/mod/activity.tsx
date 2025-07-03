/**
 * Activity Log Page
 *
 * Comprehensive audit trail interface for moderators to track all moderation actions
 */

import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
	History,
	Shield,
	Ban,
	AlertTriangle,
	MessageSquare,
	Trash2,
	Lock,
	Unlock,
	UserCheck,
	UserX,
	Flag,
	Eye,
	Search,
	Filter,
	Calendar,
	Clock,
	Activity,
	RefreshCw,
	Download,
	FileText,
	User,
	Settings
} from 'lucide-react';
import { toast } from 'sonner';
import { apiRequest } from '@/lib/queryClient';
import type { ReportId, ContentId } from '@db/types';

// Types
interface ActivityLogEntry {
	id: string;
	action:
		| 'ban'
		| 'unban'
		| 'warn'
		| 'delete_post'
		| 'delete_thread'
		| 'lock_thread'
		| 'unlock_thread'
		| 'resolve_report'
		| 'dismiss_report'
		| 'promote_user'
		| 'demote_user'
		| 'edit_post'
		| 'move_thread';
	moderatorId: string;
	targetUserId?: string;
	targetContentId?: string;
	targetContentType?: 'thread' | 'post' | 'user' | 'report';
	reason?: string;
	details?: string;
	metadata?: {
		duration?: string;
		previousValue?: string;
		newValue?: string;
		reportId?: ReportId;
		severity?: string;
		originalForum?: string;
		newForum?: string;
	};
	createdAt: string;
	ipAddress?: string;
	userAgent?: string;
	moderator: {
		id: string;
		username: string;
		avatar?: string;
		role: string;
	};
	targetUser?: {
		id: string;
		username: string;
		avatar?: string;
	};
	targetContent?: {
		id: string;
		title?: string;
		preview?: string;
		url?: string;
		type: string;
	};
}

interface ActivityFilters {
	search?: string;
	action?: string;
	moderatorId?: string;
	targetUserId?: string;
	contentType?: string;
	dateFrom?: string;
	dateTo?: string;
	page?: number;
	limit?: number;
}

// API Functions
const activityApi = {
	async getActivityLog(filters: ActivityFilters) {
		return apiRequest<{
			activities: ActivityLogEntry[];
			pagination: {
				page: number;
				limit: number;
				totalCount: number;
				totalPages: number;
				hasNext: boolean;
				hasPrev: boolean;
			};
			stats: {
				totalActions: number;
				actionsToday: number;
				topModerator: string;
				mostCommonAction: string;
			};
		}>({
			url: '/api/mod/activity',
			method: 'GET',
			params: filters
		});
	},

	async exportActivityLog(filters: ActivityFilters) {
		return apiRequest<{ downloadUrl: string }>({
			url: '/api/mod/activity/export',
			method: 'POST',
			data: { filters }
		});
	},

	async getActivityDetails(id: string) {
		return apiRequest<{ activity: ActivityLogEntry }>({
			url: `/api/mod/activity/${id}`,
			method: 'GET'
		});
	}
};

export default function ActivityLogPage() {
	const [filters, setFilters] = useState<ActivityFilters>({
		page: 1,
		limit: 25
	});
	const [showFilters, setShowFilters] = useState(false);
	const [exporting, setExporting] = useState(false);

	const queryClient = useQueryClient();

	// Data queries
	const {
		data: activityData,
		isLoading,
		error
	} = useQuery({
		queryKey: ['mod-activity', filters],
		queryFn: () => activityApi.getActivityLog(filters),
		staleTime: 30 * 1000,
		refetchInterval: 60 * 1000 // Auto-refresh every minute
	});

	// Helper functions
	const getActionIcon = (action: string) => {
		switch (action) {
			case 'ban':
				return <Ban className="h-4 w-4 text-red-600" />;
			case 'unban':
				return <UserCheck className="h-4 w-4 text-green-600" />;
			case 'warn':
				return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
			case 'delete_post':
			case 'delete_thread':
				return <Trash2 className="h-4 w-4 text-red-600" />;
			case 'lock_thread':
				return <Lock className="h-4 w-4 text-orange-600" />;
			case 'unlock_thread':
				return <Unlock className="h-4 w-4 text-green-600" />;
			case 'resolve_report':
				return <Flag className="h-4 w-4 text-blue-600" />;
			case 'dismiss_report':
				return <Eye className="h-4 w-4 text-gray-600" />;
			case 'promote_user':
				return <Shield className="h-4 w-4 text-purple-600" />;
			case 'demote_user':
				return <UserX className="h-4 w-4 text-orange-600" />;
			case 'edit_post':
				return <FileText className="h-4 w-4 text-blue-600" />;
			case 'move_thread':
				return <Settings className="h-4 w-4 text-indigo-600" />;
			default:
				return <Activity className="h-4 w-4 text-gray-600" />;
		}
	};

	const getActionColor = (action: string) => {
		switch (action) {
			case 'ban':
			case 'delete_post':
			case 'delete_thread':
				return 'bg-red-100 text-red-800 border-red-200';
			case 'unban':
			case 'unlock_thread':
				return 'bg-green-100 text-green-800 border-green-200';
			case 'warn':
			case 'lock_thread':
			case 'demote_user':
				return 'bg-yellow-100 text-yellow-800 border-yellow-200';
			case 'resolve_report':
			case 'edit_post':
				return 'bg-blue-100 text-blue-800 border-blue-200';
			case 'promote_user':
				return 'bg-purple-100 text-purple-800 border-purple-200';
			case 'move_thread':
				return 'bg-indigo-100 text-indigo-800 border-indigo-200';
			default:
				return 'bg-gray-100 text-gray-800 border-gray-200';
		}
	};

	const formatActionName = (action: string) => {
		return action
			.split('_')
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(' ');
	};

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		const now = new Date();
		const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

		if (diffInHours < 1) {
			const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
			return `${diffInMinutes}m ago`;
		}
		if (diffInHours < 24) {
			return `${diffInHours}h ago`;
		}
		if (diffInHours < 168) {
			return `${Math.floor(diffInHours / 24)}d ago`;
		}
		return date.toLocaleString();
	};

	const updateFilters = (newFilters: Partial<ActivityFilters>) => {
		setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
	};

	const handleExport = async () => {
		try {
			setExporting(true);
			const result = await activityApi.exportActivityLog(filters);

			// Create download link
			const link = document.createElement('a');
			link.href = result.downloadUrl;
			link.download = `activity-log-${new Date().toISOString().split('T')[0]}.csv`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);

			toast.success('Activity log exported successfully');
		} catch (error: any) {
			toast.error('Failed to export activity log', {
				description: error.message
			});
		} finally {
			setExporting(false);
		}
	};

	const refreshData = () => {
		queryClient.invalidateQueries({ queryKey: ['mod-activity'] });
		toast.success('Activity log refreshed');
	};

	const activities = activityData?.activities || [];
	const pagination = activityData?.pagination;
	const stats = activityData?.stats;

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Activity Log</h1>
					<p className="text-gray-600">Comprehensive audit trail of all moderation actions</p>
				</div>
				<div className="flex items-center space-x-3">
					<Button variant="outline" size="sm" onClick={handleExport} disabled={exporting}>
						<Download className={`h-4 w-4 mr-2 ${exporting ? 'animate-pulse' : ''}`} />
						Export
					</Button>
					<Button variant="outline" size="sm" onClick={refreshData} disabled={isLoading}>
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
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Actions</CardTitle>
						<Activity className="h-4 w-4 text-blue-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-blue-600">{stats?.totalActions || 0}</div>
						<p className="text-xs text-gray-600">All time</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Today's Actions</CardTitle>
						<Clock className="h-4 w-4 text-green-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-green-600">{stats?.actionsToday || 0}</div>
						<p className="text-xs text-gray-600">Last 24 hours</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Top Moderator</CardTitle>
						<Shield className="h-4 w-4 text-purple-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-purple-600">{stats?.topModerator || 'N/A'}</div>
						<p className="text-xs text-gray-600">Most active today</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Common Action</CardTitle>
						<Flag className="h-4 w-4 text-orange-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-orange-600">
							{stats?.mostCommonAction ? formatActionName(stats.mostCommonAction) : 'N/A'}
						</div>
						<p className="text-xs text-gray-600">Most frequent</p>
					</CardContent>
				</Card>
			</div>

			{/* Filters Panel */}
			{showFilters && (
				<Card>
					<CardHeader>
						<CardTitle className="text-lg">Filter Activity Log</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
							<div>
								<Label htmlFor="search-filter">Search</Label>
								<div className="relative">
									<Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
									<Input
										id="search-filter"
										placeholder="Search activities..."
										value={filters.search || ''}
										onChange={(e) => updateFilters({ search: e.target.value })}
										className="pl-10"
									/>
								</div>
							</div>
							<div>
								<Label htmlFor="action-filter">Action Type</Label>
								<Select
									value={filters.action || 'all'}
									onValueChange={(value) =>
										updateFilters({ action: value === 'all' ? undefined : value })
									}
								>
									<SelectTrigger>
										<SelectValue placeholder="All actions" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">All Actions</SelectItem>
										<SelectItem value="ban">Ban User</SelectItem>
										<SelectItem value="unban">Unban User</SelectItem>
										<SelectItem value="warn">Issue Warning</SelectItem>
										<SelectItem value="delete_post">Delete Post</SelectItem>
										<SelectItem value="delete_thread">Delete Thread</SelectItem>
										<SelectItem value="lock_thread">Lock Thread</SelectItem>
										<SelectItem value="unlock_thread">Unlock Thread</SelectItem>
										<SelectItem value="resolve_report">Resolve Report</SelectItem>
										<SelectItem value="dismiss_report">Dismiss Report</SelectItem>
										<SelectItem value="promote_user">Promote User</SelectItem>
										<SelectItem value="demote_user">Demote User</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div>
								<Label htmlFor="content-type-filter">Content Type</Label>
								<Select
									value={filters.contentType || 'all'}
									onValueChange={(value) =>
										updateFilters({ contentType: value === 'all' ? undefined : value })
									}
								>
									<SelectTrigger>
										<SelectValue placeholder="All types" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">All Types</SelectItem>
										<SelectItem value="thread">Threads</SelectItem>
										<SelectItem value="post">Posts</SelectItem>
										<SelectItem value="user">Users</SelectItem>
										<SelectItem value="report">Reports</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div>
								<Label htmlFor="date-from">Date From</Label>
								<Input
									id="date-from"
									type="date"
									value={filters.dateFrom || ''}
									onChange={(e) => updateFilters({ dateFrom: e.target.value })}
								/>
							</div>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Activity Log Table */}
			<Card>
				<CardHeader>
					<CardTitle>Moderation Activities</CardTitle>
					<CardDescription>
						{pagination
							? `Showing ${pagination.page * pagination.limit - pagination.limit + 1}-${Math.min(pagination.page * pagination.limit, pagination.totalCount)} of ${pagination.totalCount} activities`
							: 'Loading activities...'}
					</CardDescription>
				</CardHeader>
				<CardContent>
					{error ? (
						<Alert variant="destructive">
							<AlertTriangle className="h-4 w-4" />
							<AlertDescription>Failed to load activity log: {error.message}</AlertDescription>
						</Alert>
					) : isLoading ? (
						<div className="text-center py-8">
							<RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
							<p>Loading activity log...</p>
						</div>
					) : activities.length === 0 ? (
						<div className="text-center py-8">
							<History className="h-8 w-8 mx-auto mb-4 text-gray-400" />
							<p>No activities found matching your filters</p>
						</div>
					) : (
						<div className="space-y-4">
							{activities.map((activity) => (
								<div key={activity.id} className="border rounded-lg p-4 hover:bg-gray-50">
									<div className="flex items-start justify-between">
										<div className="flex items-start space-x-4 flex-1">
											<div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100">
												{getActionIcon(activity.action)}
											</div>
											<div className="flex-1">
												<div className="flex items-center space-x-2 mb-2">
													<Badge className={getActionColor(activity.action)}>
														{formatActionName(activity.action)}
													</Badge>
													<span className="text-sm text-gray-500">#{activity.id}</span>
												</div>
												<div className="space-y-1">
													<div className="flex items-center space-x-2 text-sm">
														<Avatar className="h-6 w-6">
															<AvatarImage src={activity.moderator.avatar} />
															<AvatarFallback className="text-xs">
																{activity.moderator.username[0].toUpperCase()}
															</AvatarFallback>
														</Avatar>
														<span className="font-medium">{activity.moderator.username}</span>
														<Badge variant="outline" className="text-xs">
															{activity.moderator.role}
														</Badge>
														{activity.targetUser && (
															<>
																<span className="text-gray-400">→</span>
																<Avatar className="h-6 w-6">
																	<AvatarImage src={activity.targetUser.avatar} />
																	<AvatarFallback className="text-xs">
																		{activity.targetUser.username[0].toUpperCase()}
																	</AvatarFallback>
																</Avatar>
																<span className="text-red-600">{activity.targetUser.username}</span>
															</>
														)}
													</div>
													{activity.reason && (
														<p className="text-sm text-gray-700 font-medium">
															Reason: {activity.reason}
														</p>
													)}
													{activity.details && (
														<p className="text-sm text-gray-600">{activity.details}</p>
													)}
													{activity.targetContent && (
														<div className="text-sm text-gray-600 bg-gray-100 p-2 rounded">
															<p className="font-medium">
																Content: {activity.targetContent.title || 'Untitled'}
															</p>
															{activity.targetContent.preview && (
																<p className="truncate">{activity.targetContent.preview}</p>
															)}
														</div>
													)}
													{activity.metadata && (
														<div className="text-xs text-gray-500 space-y-1">
															{activity.metadata.duration && (
																<p>Duration: {activity.metadata.duration}</p>
															)}
															{activity.metadata.severity && (
																<p>Severity: {activity.metadata.severity}</p>
															)}
															{activity.metadata.originalForum && activity.metadata.newForum && (
																<p>
																	Moved: {activity.metadata.originalForum} →{' '}
																	{activity.metadata.newForum}
																</p>
															)}
														</div>
													)}
													<div className="flex items-center space-x-4 text-xs text-gray-500">
														<div className="flex items-center space-x-1">
															<Calendar className="h-3 w-3" />
															<span>{formatDate(activity.createdAt)}</span>
														</div>
														{activity.ipAddress && <span>IP: {activity.ipAddress}</span>}
													</div>
												</div>
											</div>
										</div>
										<div className="flex items-center space-x-2">
											{activity.targetContent?.url && (
												<Button
													size="sm"
													variant="outline"
													onClick={() => window.open(activity.targetContent!.url, '_blank')}
												>
													<Eye className="h-4 w-4" />
												</Button>
											)}
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
		</div>
	);
}
