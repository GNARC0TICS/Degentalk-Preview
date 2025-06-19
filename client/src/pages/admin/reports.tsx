import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import {
	Eye,
	CheckCircle,
	X,
	MessageSquareOff,
	AlertOctagon,
	UserX,
	Flag as ReportFlagIcon,
	AlertTriangle
} from 'lucide-react'; // Removed Filter, Search

import { AdminPageShell } from '@/components/admin/layout/AdminPageShell';
import { EntityTable } from '@/components/admin/layout/EntityTable';
import { EntityFilters } from '@/components/admin/layout/EntityFilters';
import type { FilterConfig, FilterValue } from '@/components/admin/layout/EntityFilters';
import { ViewReportDialog } from '@/components/admin/forms/reports/ViewReportDialog';
import type {
	Report,
	ReportStatus,
	ReportType
} from '@/components/admin/forms/reports/ViewReportDialog';
import {
	ReportActionDialog,
	BanUserDialog
} from '@/components/admin/forms/reports/ReportActionDialogs';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Pagination } from '@/components/ui/pagination'; // Removed unused sub-components

// API response structure
interface ReportsApiResponse {
	reports: Report[];
	pagination: {
		currentPage: number;
		totalPages: number;
		totalItems: number;
		pageSize: number;
	};
}

// Helper functions (could be moved to a shared util if not already in ViewReportDialog)
const formatDate = (dateString?: string) => {
	if (!dateString) return 'N/A';
	return new Date(dateString).toLocaleString();
};

const getStatusBadge = (status: ReportStatus) => {
	switch (status) {
		case 'pending':
			return (
				<Badge className="bg-yellow-500 hover:bg-yellow-600">
					<AlertTriangle className="h-3 w-3 mr-1" /> Pending
				</Badge>
			);
		case 'resolved':
			return (
				<Badge className="bg-green-500 hover:bg-green-600">
					<CheckCircle className="h-3 w-3 mr-1" /> Resolved
				</Badge>
			);
		case 'dismissed':
			return (
				<Badge className="bg-gray-500 hover:bg-gray-600">
					<X className="h-3 w-3 mr-1" /> Dismissed
				</Badge>
			);
		default:
			return <Badge>{status}</Badge>;
	}
};

const getTypeBadge = (type: ReportType) => {
	switch (type) {
		case 'post':
			return (
				<Badge variant="outline">
					<MessageSquareOff className="h-3 w-3 mr-1" /> Post
				</Badge>
			);
		case 'thread':
			return (
				<Badge variant="outline">
					<AlertOctagon className="h-3 w-3 mr-1" /> Thread
				</Badge>
			);
		case 'user':
			return (
				<Badge variant="outline">
					<UserX className="h-3 w-3 mr-1" /> User
				</Badge>
			);
		case 'message':
			return (
				<Badge variant="outline">
					<ReportFlagIcon className="h-3 w-3 mr-1" /> Message
				</Badge>
			);
		default:
			return <Badge variant="outline">{type}</Badge>;
	}
};

export default function AdminReportsPage() {
	const { toast } = useToast();
	const queryClient = useQueryClient();

	const [filters, setFilters] = useState<Record<string, FilterValue>>({
		status: 'pending',
		type: 'all',
		search: ''
	});
	const [page, setPage] = useState(1);
	const pageSize = 10; // Or make this configurable

	const [selectedReport, setSelectedReport] = useState<Report | null>(null);
	const [isViewReportDialogOpen, setIsViewReportDialogOpen] = useState(false);
	const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
	const [isBanDialogOpen, setIsBanDialogOpen] = useState(false);

	const [currentActionType, setCurrentActionType] = useState<'resolve' | 'dismiss'>('resolve');
	const [actionNotes, setActionNotes] = useState('');
	const [banReason, setBanReason] = useState('');
	const [banDuration, setBanDuration] = useState('permanent');

	const queryParams = useMemo(() => {
		const params: Record<string, string> = {
			page: page.toString(),
			limit: pageSize.toString()
		};
		if (filters.status && filters.status !== 'all') params.status = filters.status as string;
		if (filters.type && filters.type !== 'all') params.type = filters.type as string;
		if (filters.search) params.search = filters.search as string;
		return params;
	}, [page, pageSize, filters]);

	const {
		data: reportsApiResponse,
		isLoading,
		isError,
		error
	} = useQuery<ReportsApiResponse>({
		queryKey: ['/api/admin/reports', queryParams],
		queryFn: () => apiRequest({ url: '/api/admin/reports', method: 'GET', params: queryParams })
	});

	const reports = reportsApiResponse?.reports || [];
	const pagination = reportsApiResponse?.pagination;

	const reportActionMutation = useMutation({
		mutationFn: ({
			reportId,
			action,
			notes
		}: {
			reportId: number;
			action: string;
			notes?: string;
		}) =>
			apiRequest({
				url: `/api/admin/reports/${reportId}/${action}`,
				method: 'POST',
				data: { notes }
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['/api/admin/reports'] });
			toast({ title: 'Success', description: `Report has been ${currentActionType}.` });
			setIsActionDialogOpen(false);
			setSelectedReport(null); // Close view dialog if action was taken from there
			setIsViewReportDialogOpen(false);
			setActionNotes('');
		},
		onError: (err: unknown) => {
			const message = err instanceof Error ? err.message : 'Failed to process report action.';
			toast({ title: 'Error', description: message, variant: 'destructive' });
		}
	});

	const banUserMutation = useMutation({
		mutationFn: ({
			userId,
			reason,
			duration
		}: {
			userId: number;
			reason: string;
			duration?: string;
		}) =>
			apiRequest({
				url: `/api/admin/users/${userId}/ban`,
				method: 'POST',
				data: { reason, duration }
			}),
		onSuccess: () => {
			toast({ title: 'Success', description: 'User has been banned.' });
			setIsBanDialogOpen(false);
			setBanReason(''); // Reset ban reason
		},
		onError: (err: unknown) => {
			const message = err instanceof Error ? err.message : 'Failed to ban user.';
			toast({ title: 'Error', description: message, variant: 'destructive' });
		}
	});

	const deleteContentMutation = useMutation({
		mutationFn: ({
			type,
			contentId,
			reason
		}: {
			type: ReportType;
			contentId: number;
			reason: string;
		}) => {
			let endpoint = '';
			switch (type) {
				case 'post':
					endpoint = `/api/admin/posts/${contentId}`;
					break;
				case 'thread':
					endpoint = `/api/admin/threads/${contentId}`;
					break;
				case 'message':
					endpoint = `/api/admin/shoutbox/messages/${contentId}`;
					break;
				default:
					throw new Error('Invalid content type for deletion');
			}
			return apiRequest({ url: endpoint, method: 'DELETE', data: { reason } });
		},
		onSuccess: (_, variables) => {
			toast({ title: 'Success', description: `${variables.type} has been deleted.` });
			if (selectedReport) {
				// If deleting from view dialog, also resolve the report
				handlePerformReportAction(
					selectedReport.id,
					'resolve',
					`Content deleted. Original notes: ${actionNotes}`
				);
			}
		},
		onError: (err: unknown) => {
			const message = err instanceof Error ? err.message : 'Failed to delete content.';
			toast({ title: 'Error', description: message, variant: 'destructive' });
		}
	});

	const handleFilterChange = (filterId: string, value: FilterValue) => {
		setFilters((prev) => ({ ...prev, [filterId]: value }));
		setPage(1); // Reset to first page on filter change
	};

	const handleClearFilters = () => {
		setFilters({ status: 'pending', type: 'all', search: '' });
		setPage(1);
	};

	const handleOpenViewDialog = (report: Report) => {
		setSelectedReport(report);
		setIsViewReportDialogOpen(true);
	};

	const handleOpenActionDialog = (action: 'resolve' | 'dismiss') => {
		setCurrentActionType(action);
		// Notes for this action will be taken from the action dialog itself
		setIsActionDialogOpen(true);
	};

	const handlePerformReportAction = (
		reportId?: number,
		action?: 'resolve' | 'dismiss',
		notes?: string
	) => {
		const finalReportId = reportId || selectedReport?.id;
		const finalAction = action || currentActionType;
		const finalNotes = notes || actionNotes;

		if (finalReportId) {
			reportActionMutation.mutate({
				reportId: finalReportId,
				action: finalAction,
				notes: finalNotes
			});
		}
	};

	const handleOpenBanDialog = () => {
		if (selectedReport) {
			setBanReason(''); // Clear previous reason
			setBanDuration('permanent'); // Default duration
			setIsBanDialogOpen(true);
		}
	};

	const handlePerformBanUser = () => {
		if (selectedReport) {
			banUserMutation.mutate({
				userId: selectedReport.reportedUserId,
				reason: banReason,
				duration: banDuration
			});
		}
	};

	const handlePerformDeleteContent = () => {
		if (selectedReport && selectedReport.type !== 'user') {
			if (
				window.confirm(
					'Are you sure you want to delete this content? This action cannot be undone.'
				)
			) {
				deleteContentMutation.mutate({
					type: selectedReport.type,
					contentId: selectedReport.contentId,
					reason: `Deleted due to report #${selectedReport.id}: ${selectedReport.reason}`
				});
			}
		}
	};

	const filtersConfig: FilterConfig[] = [
		{ id: 'search', label: 'Search', type: 'text', placeholder: 'Search by reason, user...' },
		{
			id: 'status',
			label: 'Status',
			type: 'select',
			options: [
				{ value: 'all', label: 'All Statuses' },
				{ value: 'pending', label: 'Pending' },
				{ value: 'resolved', label: 'Resolved' },
				{ value: 'dismissed', label: 'Dismissed' }
			]
		},
		{
			id: 'type',
			label: 'Type',
			type: 'select',
			options: [
				{ value: 'all', label: 'All Types' },
				{ value: 'post', label: 'Post' },
				{ value: 'thread', label: 'Thread' },
				{ value: 'user', label: 'User' },
				{ value: 'message', label: 'Message' }
			]
		}
	];

	const columns = [
		{ key: 'type', header: 'Type', render: (report: Report) => getTypeBadge(report.type) },
		{ key: 'reportedUsername', header: 'Reported User' },
		{
			key: 'reason',
			header: 'Reason',
			render: (report: Report) => (
				<span className="block max-w-[250px] truncate" title={report.reason}>
					{report.reason}
				</span>
			)
		},
		{ key: 'reporterUsername', header: 'Reported By' },
		{ key: 'createdAt', header: 'Date', render: (report: Report) => formatDate(report.createdAt) },
		{ key: 'status', header: 'Status', render: (report: Report) => getStatusBadge(report.status) }
	];

	return (
		<AdminPageShell title="Content Moderation">
			<Card>
				<CardHeader>
					<CardTitle>Reported Content</CardTitle>
					<CardDescription>Review and moderate reported content.</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<EntityFilters
						filtersConfig={filtersConfig}
						filters={filters}
						onFilterChange={handleFilterChange}
						onClearFilters={handleClearFilters}
					/>
					<EntityTable<Report>
						columns={columns}
						data={reports}
						isLoading={isLoading}
						isError={isError}
						error={error}
						emptyStateMessage="No reports found matching your criteria."
						renderActions={(report) => (
							<div className="flex justify-end items-center space-x-1">
								<Button variant="outline" size="sm" onClick={() => handleOpenViewDialog(report)}>
									<Eye className="h-4 w-4 mr-1" /> View
								</Button>
								{/* Quick actions can be added here if needed, or rely on ViewReportDialog */}
							</div>
						)}
					/>
					{pagination && pagination.totalPages > 1 && (
						<div className="flex justify-center mt-4 border-t border-admin-border-subtle pt-4">
							<Pagination
								currentPage={pagination.currentPage}
								totalPages={pagination.totalPages}
								onPageChange={(newPage) => setPage(newPage)}
								// totalItems={pagination.totalItems} // Optional, if your API provides it and component uses it
								// pageSize={pagination.pageSize} // Optional
								showSummary={false} // Or true if you want the summary text
							/>
						</div>
					)}
				</CardContent>
			</Card>

			<ViewReportDialog
				report={selectedReport}
				isOpen={isViewReportDialogOpen}
				onOpenChange={setIsViewReportDialogOpen}
				onOpenActionDialog={handleOpenActionDialog}
				onOpenBanDialog={handleOpenBanDialog}
				onDeleteContent={handlePerformDeleteContent}
			/>
			<ReportActionDialog
				isOpen={isActionDialogOpen}
				onOpenChange={setIsActionDialogOpen}
				actionType={currentActionType}
				notes={actionNotes}
				setNotes={setActionNotes}
				onSubmit={() => handlePerformReportAction()}
				isSubmitting={reportActionMutation.isPending}
			/>
			<BanUserDialog
				isOpen={isBanDialogOpen}
				onOpenChange={setIsBanDialogOpen}
				reportedUsername={selectedReport?.reportedUsername}
				banReason={banReason}
				setBanReason={setBanReason}
				banDuration={banDuration}
				setBanDuration={setBanDuration}
				onSubmit={handlePerformBanUser}
				isSubmitting={banUserMutation.isPending}
			/>
		</AdminPageShell>
	);
}
