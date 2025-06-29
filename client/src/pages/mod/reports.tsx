/**
 * Reports Management Page
 *
 * Comprehensive interface for moderators to review, filter, and take action on user reports
 */

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
	Flag,
	CheckCircle,
	XCircle,
	Clock,
	AlertTriangle,
	Eye,
	Ban,
	Trash2,
	Search,
	Filter,
	MessageSquare,
	FileText,
	User,
	Calendar,
	ExternalLink,
	MoreVertical,
	RefreshCw
} from 'lucide-react';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { apiRequest } from '@/lib/queryClient';
import type { ApiErrorData } from '@/types/core.types';

// Types
interface Report {
	id: number;
	contentType: 'thread' | 'post' | 'user' | 'message';
	contentId: number;
	reporterId: string;
	reason: string;
	description?: string;
	status: 'pending' | 'resolved' | 'dismissed';
	priority: 'low' | 'medium' | 'high' | 'urgent';
	createdAt: string;
	updatedAt: string;
	resolvedAt?: string;
	resolvedBy?: string;
	resolverNotes?: string;
	reporter: {
		id: string;
		username: string;
		avatar?: string;
	};
	reportedUser?: {
		id: string;
		username: string;
		avatar?: string;
	};
	content: {
		title?: string;
		preview: string;
		url: string;
	};
	metadata?: {
		violationType?: string;
		severityLevel?: number;
		autoModerated?: boolean;
	};
}

interface ReportsFilters {
	status?: string;
	contentType?: string;
	priority?: string;
	search?: string;
	reporterId?: string;
	dateFrom?: string;
	dateTo?: string;
	page?: number;
	limit?: number;
}

// API Functions
const reportsApi = {
	async getReports(filters: ReportsFilters) {
		return apiRequest<{
			reports: Report[];
			pagination: {
				page: number;
				limit: number;
				totalCount: number;
				totalPages: number;
				hasNext: boolean;
				hasPrev: boolean;
			};
		}>({
			url: '/api/admin/reports',
			method: 'GET',
			params: filters
		});
	},

	async getReport(id: number) {
		return apiRequest<{ report: Report }>({
			url: `/api/admin/reports/${id}`,
			method: 'GET'
		});
	},

	async resolveReport(id: number, data: { action: string; reason?: string; banDuration?: string }) {
		return apiRequest<{ message: string }>({
			url: `/api/admin/reports/${id}/resolve`,
			method: 'POST',
			data
		});
	},

	async dismissReport(id: number, reason: string) {
		return apiRequest<{ message: string }>({
			url: `/api/admin/reports/${id}/dismiss`,
			method: 'POST',
			data: { reason }
		});
	},

	async banUser(userId: string, data: { duration: string; reason: string; reportId: number }) {
		return apiRequest<{ message: string }>({
			url: `/api/admin/reports/users/${userId}/ban`,
			method: 'POST',
			data
		});
	},

	async deleteContent(contentType: string, contentId: number, reason: string) {
		return apiRequest<{ message: string }>({
			url: `/api/admin/reports/content/${contentType}/${contentId}`,
			method: 'DELETE',
			data: { reason }
		});
	}
};

export default function ReportsManagementPage() {
	const [filters, setFilters] = useState<ReportsFilters>({
		status: 'pending',
		page: 1,
		limit: 20
	});
	const [selectedReports, setSelectedReports] = useState<number[]>([]);
	const [showFilters, setShowFilters] = useState(false);
	const [resolveDialogOpen, setResolveDialogOpen] = useState<number | null>(null);

	const queryClient = useQueryClient();

	// Data queries
	const {
		data: reportsData,
		isLoading,
		error
	} = useQuery({
		queryKey: ['mod-reports', filters],
		queryFn: () => reportsApi.getReports(filters),
		staleTime: 30 * 1000, // 30 seconds
		refetchInterval: 60 * 1000 // Auto-refresh every minute
	});

	// Mutations
	const resolveReportMutation = useMutation({
		mutationFn: ({
			id,
			data
		}: {
			id: number;
			data: { action: string; reason?: string; banDuration?: string };
		}) => reportsApi.resolveReport(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['mod-reports'] });
			toast.success('Report resolved successfully');
			setResolveDialogOpen(null);
		},
		onError: (error: ApiErrorData) => {
			toast.error('Failed to resolve report', {
				description: error.message
			});
		}
	});

	const dismissReportMutation = useMutation({
		mutationFn: ({ id, reason }: { id: number; reason: string }) =>
			reportsApi.dismissReport(id, reason),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['mod-reports'] });
			toast.success('Report dismissed');
		},
		onError: (error: ApiErrorData) => {
			toast.error('Failed to dismiss report', {
				description: error.message
			});
		}
	});

	const deleteContentMutation = useMutation({
		mutationFn: ({
			contentType,
			contentId,
			reason
		}: {
			contentType: string;
			contentId: number;
			reason: string;
		}) => reportsApi.deleteContent(contentType, contentId, reason),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['mod-reports'] });
			toast.success('Content deleted successfully');
		},
		onError: (error: ApiErrorData) => {
			toast.error('Failed to delete content', {
				description: error.message
			});
		}
	});

	// Helper functions
	const getStatusIcon = (status: string) => {
		switch (status) {
			case 'pending':
				return <Clock className="h-4 w-4 text-yellow-600" />;
			case 'resolved':
				return <CheckCircle className="h-4 w-4 text-green-600" />;
			case 'dismissed':
				return <XCircle className="h-4 w-4 text-gray-600" />;
			default:
				return <Flag className="h-4 w-4 text-gray-600" />;
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'pending':
				return 'bg-yellow-100 text-yellow-800 border-yellow-200';
			case 'resolved':
				return 'bg-green-100 text-green-800 border-green-200';
			case 'dismissed':
				return 'bg-gray-100 text-gray-800 border-gray-200';
			default:
				return 'bg-gray-100 text-gray-800 border-gray-200';
		}
	};

	const getPriorityColor = (priority: string) => {
		switch (priority) {
			case 'urgent':
				return 'bg-red-100 text-red-800 border-red-200';
			case 'high':
				return 'bg-orange-100 text-orange-800 border-orange-200';
			case 'medium':
				return 'bg-blue-100 text-blue-800 border-blue-200';
			case 'low':
				return 'bg-gray-100 text-gray-800 border-gray-200';
			default:
				return 'bg-gray-100 text-gray-800 border-gray-200';
		}
	};

	const getContentIcon = (contentType: string) => {
		switch (contentType) {
			case 'thread':
				return <FileText className="h-4 w-4" />;
			case 'post':
				return <MessageSquare className="h-4 w-4" />;
			case 'user':
				return <User className="h-4 w-4" />;
			case 'message':
				return <MessageSquare className="h-4 w-4" />;
			default:
				return <Flag className="h-4 w-4" />;
		}
	};

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		const now = new Date();
		const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

		if (diffInHours < 1) {
			const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
			return `${diffInMinutes} minutes ago`;
		}
		if (diffInHours < 24) {
			return `${diffInHours} hours ago`;
		}
		return date.toLocaleDateString();
	};

	const handleQuickAction = (reportId: number, action: string) => {
		switch (action) {
			case 'resolve':
				resolveReportMutation.mutate({ id: reportId, data: { action: 'resolve' } });
				break;
			case 'dismiss':
				dismissReportMutation.mutate({ id: reportId, reason: 'No action needed' });
				break;
			case 'view-details':
				setResolveDialogOpen(reportId);
				break;
		}
	};

	const handleBulkAction = (action: string) => {
		if (selectedReports.length === 0) {
			toast.error('No reports selected');
			return;
		}

		toast.info(`Bulk ${action} for ${selectedReports.length} reports`);
		// TODO: Implement bulk actions
	};

	const updateFilters = (newFilters: Partial<ReportsFilters>) => {
		setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
	};

	const refreshReports = () => {
		queryClient.invalidateQueries({ queryKey: ['mod-reports'] });
		toast.success('Reports refreshed');
	};

	const reports = reportsData?.reports || [];
	const pagination = reportsData?.pagination;

	const pendingCount = reports.filter((r) => r.status === 'pending').length;
	const urgentCount = reports.filter((r) => r.priority === 'urgent').length;

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Reports Management</h1>
					<p className="text-gray-600">Review and manage user reports across the platform</p>
				</div>
				<div className="flex items-center space-x-3">
					<Button variant="outline" size="sm" onClick={refreshReports} disabled={isLoading}>
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
						<CardTitle className="text-sm font-medium">Pending Reports</CardTitle>
						<Clock className="h-4 w-4 text-yellow-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
						<p className="text-xs text-gray-600">Require review</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Urgent Priority</CardTitle>
						<AlertTriangle className="h-4 w-4 text-red-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-red-600">{urgentCount}</div>
						<p className="text-xs text-gray-600">Need immediate attention</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Reports</CardTitle>
						<Flag className="h-4 w-4 text-blue-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-blue-600">{pagination?.totalCount || 0}</div>
						<p className="text-xs text-gray-600">All time</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
						<CheckCircle className="h-4 w-4 text-green-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-green-600">94%</div>
						<p className="text-xs text-gray-600">Last 30 days</p>
					</CardContent>
				</Card>
			</div>

			{/* Filters Panel */}
			{showFilters && (
				<Card>
					<CardHeader>
						<CardTitle className="text-lg">Filter Reports</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
										<SelectItem value="pending">Pending</SelectItem>
										<SelectItem value="resolved">Resolved</SelectItem>
										<SelectItem value="dismissed">Dismissed</SelectItem>
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
										<SelectItem value="message">Messages</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div>
								<Label htmlFor="priority-filter">Priority</Label>
								<Select
									value={filters.priority || 'all'}
									onValueChange={(value) =>
										updateFilters({ priority: value === 'all' ? undefined : value })
									}
								>
									<SelectTrigger>
										<SelectValue placeholder="All priorities" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">All Priorities</SelectItem>
										<SelectItem value="urgent">Urgent</SelectItem>
										<SelectItem value="high">High</SelectItem>
										<SelectItem value="medium">Medium</SelectItem>
										<SelectItem value="low">Low</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div>
								<Label htmlFor="search-filter">Search</Label>
								<div className="relative">
									<Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
									<Input
										id="search-filter"
										placeholder="Search reports..."
										value={filters.search || ''}
										onChange={(e) => updateFilters({ search: e.target.value })}
										className="pl-10"
									/>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Bulk Actions */}
			{selectedReports.length > 0 && (
				<Alert>
					<Flag className="h-4 w-4" />
					<AlertDescription className="flex items-center justify-between">
						<span>{selectedReports.length} reports selected</span>
						<div className="flex space-x-2">
							<Button size="sm" onClick={() => handleBulkAction('resolve')}>
								Resolve All
							</Button>
							<Button size="sm" variant="outline" onClick={() => handleBulkAction('dismiss')}>
								Dismiss All
							</Button>
							<Button size="sm" variant="destructive" onClick={() => handleBulkAction('delete')}>
								Delete Content
							</Button>
						</div>
					</AlertDescription>
				</Alert>
			)}

			{/* Reports Table */}
			<Card>
				<CardHeader>
					<CardTitle>Reports Queue</CardTitle>
					<CardDescription>
						{pagination
							? `Showing ${pagination.page * pagination.limit - pagination.limit + 1}-${Math.min(pagination.page * pagination.limit, pagination.totalCount)} of ${pagination.totalCount} reports`
							: 'Loading reports...'}
					</CardDescription>
				</CardHeader>
				<CardContent>
					{error ? (
						<Alert variant="destructive">
							<AlertTriangle className="h-4 w-4" />
							<AlertDescription>Failed to load reports: {error.message}</AlertDescription>
						</Alert>
					) : isLoading ? (
						<div className="text-center py-8">
							<RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
							<p>Loading reports...</p>
						</div>
					) : reports.length === 0 ? (
						<div className="text-center py-8">
							<Flag className="h-8 w-8 mx-auto mb-4 text-gray-400" />
							<p>No reports found matching your filters</p>
						</div>
					) : (
						<div className="space-y-4">
							{reports.map((report) => (
								<div key={report.id} className="border rounded-lg p-4 hover:bg-gray-50">
									<div className="flex items-start justify-between">
										<div className="flex items-start space-x-4 flex-1">
											<Checkbox
												checked={selectedReports.includes(report.id)}
												onCheckedChange={(checked) => {
													if (checked) {
														setSelectedReports((prev) => [...prev, report.id]);
													} else {
														setSelectedReports((prev) => prev.filter((id) => id !== report.id));
													}
												}}
											/>
											<div className="flex-1">
												<div className="flex items-center space-x-2 mb-2">
													{getContentIcon(report.contentType)}
													<span className="font-medium">Report #{report.id}</span>
													<Badge className={getStatusColor(report.status)}>
														{getStatusIcon(report.status)}
														<span className="ml-1">{report.status}</span>
													</Badge>
													<Badge className={getPriorityColor(report.priority)}>
														{report.priority}
													</Badge>
												</div>
												<div className="space-y-2">
													<div>
														<p className="text-sm font-medium text-gray-900">{report.reason}</p>
														{report.description && (
															<p className="text-sm text-gray-600">{report.description}</p>
														)}
													</div>
													<div className="flex items-center space-x-4 text-sm text-gray-500">
														<div className="flex items-center space-x-1">
															<User className="h-3 w-3" />
															<span>Reported by {report.reporter.username}</span>
														</div>
														{report.reportedUser && (
															<div className="flex items-center space-x-1">
																<Flag className="h-3 w-3" />
																<span>Against {report.reportedUser.username}</span>
															</div>
														)}
														<div className="flex items-center space-x-1">
															<Calendar className="h-3 w-3" />
															<span>{formatDate(report.createdAt)}</span>
														</div>
													</div>
													<div className="text-sm text-gray-600 bg-gray-100 p-2 rounded">
														<p className="font-medium">Content Preview:</p>
														<p className="truncate">{report.content.preview}</p>
													</div>
												</div>
											</div>
										</div>
										<div className="flex items-center space-x-2">
											<Button
												size="sm"
												variant="outline"
												onClick={() => window.open(report.content.url, '_blank')}
											>
												<ExternalLink className="h-4 w-4" />
											</Button>
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button size="sm" variant="outline">
														<MoreVertical className="h-4 w-4" />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align="end">
													<DropdownMenuItem
														onClick={() => handleQuickAction(report.id, 'view-details')}
													>
														<Eye className="h-4 w-4 mr-2" />
														View Details
													</DropdownMenuItem>
													<DropdownMenuItem onClick={() => handleQuickAction(report.id, 'resolve')}>
														<CheckCircle className="h-4 w-4 mr-2" />
														Quick Resolve
													</DropdownMenuItem>
													<DropdownMenuItem onClick={() => handleQuickAction(report.id, 'dismiss')}>
														<XCircle className="h-4 w-4 mr-2" />
														Dismiss
													</DropdownMenuItem>
													<Separator />
													<DropdownMenuItem className="text-red-600">
														<Ban className="h-4 w-4 mr-2" />
														Ban User
													</DropdownMenuItem>
													<DropdownMenuItem className="text-red-600">
														<Trash2 className="h-4 w-4 mr-2" />
														Delete Content
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
		</div>
	);
}
