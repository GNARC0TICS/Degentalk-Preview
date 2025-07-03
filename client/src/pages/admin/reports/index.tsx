import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage
} from '@/components/ui/form';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
	MoreHorizontal,
	Search,
	Eye,
	CheckCircle,
	XCircle,
	UserX,
	Trash2,
	AlertTriangle,
	MessageSquare,
	FileText,
	User,
	RefreshCw
} from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { AdminPageShell } from '@/components/admin/layout/AdminPageShell';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { apiRequest } from '@/lib/queryClient';
import type { ContentId, UserId } from '@db/types';

// Types for reports
interface ReportedContent {
	id: string;
	reporterId: string;
	contentType: 'post' | 'thread' | 'message' | 'user';
	contentId: ContentId;
	reason: string;
	details?: string;
	status: 'pending' | 'resolved' | 'dismissed';
	createdAt: string;
	resolvedAt?: string;
	resolvedBy?: string;
	resolutionNotes?: string;
	reporterUsername?: string;
	reportedUsername?: string;
	resolvedByUsername?: string;
	contentPreview?: string;
}

interface ReportsResponse {
	reports: ReportedContent[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		pages: number;
	};
}

// Validation schemas
const reportActionSchema = z.object({
	notes: z.string().optional()
});

const banUserSchema = z.object({
	reason: z.string().min(1, 'Ban reason is required'),
	duration: z.string().optional()
});

const deleteContentSchema = z.object({
	reason: z.string().min(1, 'Deletion reason is required')
});

type ReportActionForm = z.infer<typeof reportActionSchema>;
type BanUserForm = z.infer<typeof banUserSchema>;
type DeleteContentForm = z.infer<typeof deleteContentSchema>;

export default function ReportsPage() {
	const queryClient = useQueryClient();
	const [page, setPage] = useState(1);
	const [status, setStatus] = useState<string>('all');
	const [contentType, setContentType] = useState<string>('all');
	const [search, setSearch] = useState('');
	const [selectedReport, setSelectedReport] = useState<ReportedContent | null>(null);
	const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
	const [isResolveDialogOpen, setIsResolveDialogOpen] = useState(false);
	const [isDismissDialogOpen, setIsDismissDialogOpen] = useState(false);
	const [isBanDialogOpen, setIsBanDialogOpen] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

	const resolveForm = useForm<ReportActionForm>({
		resolver: zodResolver(reportActionSchema),
		defaultValues: { notes: '' }
	});

	const dismissForm = useForm<ReportActionForm>({
		resolver: zodResolver(reportActionSchema),
		defaultValues: { notes: '' }
	});

	const banForm = useForm<BanUserForm>({
		resolver: zodResolver(banUserSchema),
		defaultValues: { reason: '', duration: '' }
	});

	const deleteForm = useForm<DeleteContentForm>({
		resolver: zodResolver(deleteContentSchema),
		defaultValues: { reason: '' }
	});

	// Fetch reports
	const {
		data: reportsData,
		isLoading,
		isError,
		refetch
	} = useQuery({
		queryKey: ['admin-reports', page, status, contentType, search],
		queryFn: async (): Promise<ReportsResponse> => {
			const params = new URLSearchParams({
				page: page.toString(),
				limit: '20',
				status: status === 'all' ? '' : status,
				type: contentType === 'all' ? '' : contentType,
				search
			});

			return apiRequest({ url: `/api/admin/reports?${params}`, method: 'GET' });
		}
	});

	// Resolve report mutation
	const resolveReportMutation = useMutation({
		mutationFn: async (data: { id: string; notes?: string }) => {
			return apiRequest({ url: `/api/admin/reports/${data.id}/resolve`,
				method: 'POST',
				data: { notes: data.notes }
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['admin-reports'] });
			setIsResolveDialogOpen(false);
			setSelectedReport(null);
			resolveForm.reset();
		}
	});

	// Dismiss report mutation
	const dismissReportMutation = useMutation({
		mutationFn: async (data: { id: string; notes?: string }) => {
			return apiRequest({ url: `/api/admin/reports/${data.id}/dismiss`,
				method: 'POST',
				data: { notes: data.notes }
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['admin-reports'] });
			setIsDismissDialogOpen(false);
			setSelectedReport(null);
			dismissForm.reset();
		}
	});

	// Ban user mutation
	const banUserMutation = useMutation({
		mutationFn: async (data: { userId: UserId; reason: string; duration?: string }) => {
			return apiRequest({ url: `/api/admin/reports/users/${data.userId}/ban`,
				method: 'POST',
				data: { reason: data.reason, duration: data.duration }
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['admin-reports'] });
			setIsBanDialogOpen(false);
			setSelectedReport(null);
			banForm.reset();
		}
	});

	// Delete content mutation
	const deleteContentMutation = useMutation({
		mutationFn: async (data: { contentType: string; contentId: ContentId; reason: string }) => {
			return apiRequest({ url: `/api/admin/reports/content/${data.contentType}/${data.contentId}`,
				method: 'DELETE',
				data: { reason: data.reason }
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['admin-reports'] });
			setIsDeleteDialogOpen(false);
			setSelectedReport(null);
			deleteForm.reset();
		}
	});

	const getStatusBadge = (status: string) => {
		switch (status) {
			case 'pending':
				return (
					<Badge variant="outline" className="bg-yellow-500/10 text-yellow-700 border-yellow-300">
						Pending
					</Badge>
				);
			case 'resolved':
				return (
					<Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-300">
						Resolved
					</Badge>
				);
			case 'dismissed':
				return (
					<Badge variant="outline" className="bg-gray-500/10 text-gray-700 border-gray-300">
						Dismissed
					</Badge>
				);
			default:
				return <Badge variant="outline">{status}</Badge>;
		}
	};

	const getContentTypeIcon = (type: string) => {
		switch (type) {
			case 'post':
				return <MessageSquare className="h-4 w-4" />;
			case 'thread':
				return <FileText className="h-4 w-4" />;
			case 'message':
				return <MessageSquare className="h-4 w-4" />;
			case 'user':
				return <User className="h-4 w-4" />;
			default:
				return <FileText className="h-4 w-4" />;
		}
	};

	const handleViewDetails = (report: ReportedContent) => {
		setSelectedReport(report);
		setIsDetailDialogOpen(true);
	};

	const handleResolveReport = (report: ReportedContent) => {
		setSelectedReport(report);
		setIsResolveDialogOpen(true);
	};

	const handleDismissReport = (report: ReportedContent) => {
		setSelectedReport(report);
		setIsDismissDialogOpen(true);
	};

	const handleBanUser = (report: ReportedContent) => {
		setSelectedReport(report);
		setIsBanDialogOpen(true);
	};

	const handleDeleteContent = (report: ReportedContent) => {
		setSelectedReport(report);
		setIsDeleteDialogOpen(true);
	};

	const onResolveSubmit = (data: ReportActionForm) => {
		if (selectedReport) {
			resolveReportMutation.mutate({ id: selectedReport.id, notes: data.notes });
		}
	};

	const onDismissSubmit = (data: ReportActionForm) => {
		if (selectedReport) {
			dismissReportMutation.mutate({ id: selectedReport.id, notes: data.notes });
		}
	};

	const onBanSubmit = (data: BanUserForm) => {
		if (selectedReport) {
			banUserMutation.mutate({
				userId:
					selectedReport.contentType === 'user'
						? selectedReport.contentId
						: selectedReport.contentId, // Adjust based on actual user ID
				reason: data.reason,
				duration: data.duration
			});
		}
	};

	const onDeleteSubmit = (data: DeleteContentForm) => {
		if (selectedReport) {
			deleteContentMutation.mutate({
				contentType: selectedReport.contentType,
				contentId: selectedReport.contentId,
				reason: data.reason
			});
		}
	};

	const reports = reportsData?.reports || [];
	const pagination = reportsData?.pagination;

	return (
		<AdminPageShell title="Reports Management">
			<div className="space-y-6">
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
					<div>
						<h1 className="text-3xl font-bold">Content Reports</h1>
						<p className="text-muted-foreground">
							Review and moderate reported content across the platform
						</p>
					</div>
					<Button onClick={() => refetch()} disabled={isLoading}>
						<RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
						Refresh
					</Button>
				</div>

				<Card>
					<CardHeader>
						<CardTitle>Filter Reports</CardTitle>
						<CardDescription>Filter and search through reported content</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="flex flex-col md:flex-row gap-4">
							<div className="flex-1">
								<div className="relative">
									<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
									<Input
										type="search"
										placeholder="Search reports..."
										className="pl-8"
										value={search}
										onChange={(e) => setSearch(e.target.value)}
									/>
								</div>
							</div>
							<Select value={status} onValueChange={setStatus}>
								<SelectTrigger className="w-40">
									<SelectValue placeholder="Status" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Status</SelectItem>
									<SelectItem value="pending">Pending</SelectItem>
									<SelectItem value="resolved">Resolved</SelectItem>
									<SelectItem value="dismissed">Dismissed</SelectItem>
								</SelectContent>
							</Select>
							<Select value={contentType} onValueChange={setContentType}>
								<SelectTrigger className="w-40">
									<SelectValue placeholder="Type" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Types</SelectItem>
									<SelectItem value="post">Posts</SelectItem>
									<SelectItem value="thread">Threads</SelectItem>
									<SelectItem value="message">Messages</SelectItem>
									<SelectItem value="user">Users</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-0">
						{isLoading ? (
							<div className="flex justify-center items-center h-40">
								<p>Loading reports...</p>
							</div>
						) : isError ? (
							<div className="flex justify-center items-center h-40">
								<p className="text-red-500">Failed to load reports</p>
							</div>
						) : reports.length === 0 ? (
							<div className="flex justify-center items-center h-40">
								<p>No reports found</p>
							</div>
						) : (
							<div className="overflow-x-auto">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Type</TableHead>
											<TableHead>Reason</TableHead>
											<TableHead>Reporter</TableHead>
											<TableHead>Reported User</TableHead>
											<TableHead>Status</TableHead>
											<TableHead>Date</TableHead>
											<TableHead className="text-right">Actions</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{reports.map((report) => (
											<TableRow key={report.id}>
												<TableCell>
													<div className="flex items-center space-x-2">
														{getContentTypeIcon(report.contentType)}
														<span className="capitalize">{report.contentType}</span>
													</div>
												</TableCell>
												<TableCell className="max-w-xs">
													<div className="font-medium">{report.reason}</div>
													{report.contentPreview && (
														<div className="text-sm text-muted-foreground truncate">
															{report.contentPreview}
														</div>
													)}
												</TableCell>
												<TableCell>{report.reporterUsername || 'Unknown'}</TableCell>
												<TableCell>{report.reportedUsername || 'Unknown'}</TableCell>
												<TableCell>{getStatusBadge(report.status)}</TableCell>
												<TableCell className="text-sm text-muted-foreground">
													{new Date(report.createdAt).toLocaleDateString()}
												</TableCell>
												<TableCell className="text-right">
													<DropdownMenu>
														<DropdownMenuTrigger asChild>
															<Button variant="ghost" size="sm">
																<MoreHorizontal className="h-4 w-4" />
																<span className="sr-only">Actions</span>
															</Button>
														</DropdownMenuTrigger>
														<DropdownMenuContent align="end" className="w-48">
															<DropdownMenuLabel>Actions</DropdownMenuLabel>
															<DropdownMenuItem onClick={() => handleViewDetails(report)}>
																<Eye className="h-4 w-4 mr-2" />
																View Details
															</DropdownMenuItem>
															<DropdownMenuSeparator />
															{report.status === 'pending' && (
																<>
																	<DropdownMenuItem onClick={() => handleResolveReport(report)}>
																		<CheckCircle className="h-4 w-4 mr-2" />
																		Resolve
																	</DropdownMenuItem>
																	<DropdownMenuItem onClick={() => handleDismissReport(report)}>
																		<XCircle className="h-4 w-4 mr-2" />
																		Dismiss
																	</DropdownMenuItem>
																	<DropdownMenuSeparator />
																	<DropdownMenuItem
																		onClick={() => handleBanUser(report)}
																		className="text-red-600"
																	>
																		<UserX className="h-4 w-4 mr-2" />
																		Ban User
																	</DropdownMenuItem>
																	{report.contentType !== 'user' && (
																		<DropdownMenuItem
																			onClick={() => handleDeleteContent(report)}
																			className="text-red-600"
																		>
																			<Trash2 className="h-4 w-4 mr-2" />
																			Delete Content
																		</DropdownMenuItem>
																	)}
																</>
															)}
														</DropdownMenuContent>
													</DropdownMenu>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</div>
						)}
					</CardContent>
				</Card>

				{/* Pagination */}
				{pagination && pagination.pages > 1 && (
					<div className="flex justify-between items-center">
						<div className="text-sm text-muted-foreground">
							Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
							{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}{' '}
							reports
						</div>
						<div className="flex space-x-2">
							<Button
								variant="outline"
								size="sm"
								onClick={() => setPage(page - 1)}
								disabled={page <= 1}
							>
								Previous
							</Button>
							<Button
								variant="outline"
								size="sm"
								onClick={() => setPage(page + 1)}
								disabled={page >= pagination.pages}
							>
								Next
							</Button>
						</div>
					</div>
				)}

				{/* Report Details Dialog */}
				<Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
					<DialogContent className="sm:max-w-[600px]">
						<DialogHeader>
							<DialogTitle>Report Details</DialogTitle>
							<DialogDescription>View detailed information about this report</DialogDescription>
						</DialogHeader>
						{selectedReport && (
							<div className="space-y-4">
								<div className="grid grid-cols-2 gap-4">
									<div>
										<h4 className="font-semibold">Content Type</h4>
										<div className="flex items-center space-x-2">
											{getContentTypeIcon(selectedReport.contentType)}
											<span className="capitalize">{selectedReport.contentType}</span>
										</div>
									</div>
									<div>
										<h4 className="font-semibold">Status</h4>
										{getStatusBadge(selectedReport.status)}
									</div>
									<div>
										<h4 className="font-semibold">Reporter</h4>
										<p>{selectedReport.reporterUsername || 'Unknown'}</p>
									</div>
									<div>
										<h4 className="font-semibold">Reported User</h4>
										<p>{selectedReport.reportedUsername || 'Unknown'}</p>
									</div>
								</div>

								<Separator />

								<div>
									<h4 className="font-semibold mb-2">Reason</h4>
									<p>{selectedReport.reason}</p>
								</div>

								{selectedReport.details && (
									<div>
										<h4 className="font-semibold mb-2">Details</h4>
										<p className="text-sm text-muted-foreground">{selectedReport.details}</p>
									</div>
								)}

								{selectedReport.contentPreview && (
									<div>
										<h4 className="font-semibold mb-2">Content Preview</h4>
										<div className="p-3 bg-muted rounded-md">
											<p className="text-sm">{selectedReport.contentPreview}</p>
										</div>
									</div>
								)}

								{selectedReport.resolutionNotes && (
									<div>
										<h4 className="font-semibold mb-2">Resolution Notes</h4>
										<p className="text-sm">{selectedReport.resolutionNotes}</p>
									</div>
								)}

								<div className="text-xs text-muted-foreground">
									<p>Reported: {new Date(selectedReport.createdAt).toLocaleString()}</p>
									{selectedReport.resolvedAt && (
										<p>Resolved: {new Date(selectedReport.resolvedAt).toLocaleString()}</p>
									)}
								</div>
							</div>
						)}
					</DialogContent>
				</Dialog>

				{/* Resolve Report Dialog */}
				<Dialog open={isResolveDialogOpen} onOpenChange={setIsResolveDialogOpen}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Resolve Report</DialogTitle>
							<DialogDescription>
								Mark this report as resolved and add optional notes
							</DialogDescription>
						</DialogHeader>
						<Form {...resolveForm}>
							<form onSubmit={resolveForm.handleSubmit(onResolveSubmit)} className="space-y-4">
								<FormField
									control={resolveForm.control}
									name="notes"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Resolution Notes (Optional)</FormLabel>
											<FormControl>
												<Textarea
													placeholder="Add notes about how this report was resolved..."
													{...field}
												/>
											</FormControl>
											<FormDescription>
												These notes will be saved for audit purposes
											</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>
								<DialogFooter>
									<Button
										type="button"
										variant="outline"
										onClick={() => setIsResolveDialogOpen(false)}
									>
										Cancel
									</Button>
									<Button type="submit" disabled={resolveReportMutation.isPending}>
										{resolveReportMutation.isPending ? 'Resolving...' : 'Resolve Report'}
									</Button>
								</DialogFooter>
							</form>
						</Form>
					</DialogContent>
				</Dialog>

				{/* Dismiss Report Dialog */}
				<Dialog open={isDismissDialogOpen} onOpenChange={setIsDismissDialogOpen}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Dismiss Report</DialogTitle>
							<DialogDescription>
								Mark this report as dismissed and add optional notes
							</DialogDescription>
						</DialogHeader>
						<Form {...dismissForm}>
							<form onSubmit={dismissForm.handleSubmit(onDismissSubmit)} className="space-y-4">
								<FormField
									control={dismissForm.control}
									name="notes"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Dismissal Notes (Optional)</FormLabel>
											<FormControl>
												<Textarea
													placeholder="Add notes about why this report was dismissed..."
													{...field}
												/>
											</FormControl>
											<FormDescription>
												These notes will be saved for audit purposes
											</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>
								<DialogFooter>
									<Button
										type="button"
										variant="outline"
										onClick={() => setIsDismissDialogOpen(false)}
									>
										Cancel
									</Button>
									<Button
										type="submit"
										variant="secondary"
										disabled={dismissReportMutation.isPending}
									>
										{dismissReportMutation.isPending ? 'Dismissing...' : 'Dismiss Report'}
									</Button>
								</DialogFooter>
							</form>
						</Form>
					</DialogContent>
				</Dialog>

				{/* Ban User Dialog */}
				<Dialog open={isBanDialogOpen} onOpenChange={setIsBanDialogOpen}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Ban User</DialogTitle>
							<DialogDescription>
								Permanently or temporarily ban the reported user
							</DialogDescription>
						</DialogHeader>
						<Alert variant="destructive">
							<AlertTriangle className="h-4 w-4" />
							<AlertTitle>Warning</AlertTitle>
							<AlertDescription>
								This action will ban the user from the platform. Use with caution.
							</AlertDescription>
						</Alert>
						<Form {...banForm}>
							<form onSubmit={banForm.handleSubmit(onBanSubmit)} className="space-y-4">
								<FormField
									control={banForm.control}
									name="reason"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Ban Reason</FormLabel>
											<FormControl>
												<Textarea
													placeholder="Explain why this user is being banned..."
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={banForm.control}
									name="duration"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Duration (Optional)</FormLabel>
											<FormControl>
												<Input placeholder="e.g., 7d, 1m, permanent" {...field} />
											</FormControl>
											<FormDescription>
												Leave empty for permanent ban. Use 7d for 7 days, 1m for 1 month, etc.
											</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>
								<DialogFooter>
									<Button type="button" variant="outline" onClick={() => setIsBanDialogOpen(false)}>
										Cancel
									</Button>
									<Button type="submit" variant="destructive" disabled={banUserMutation.isPending}>
										{banUserMutation.isPending ? 'Banning...' : 'Ban User'}
									</Button>
								</DialogFooter>
							</form>
						</Form>
					</DialogContent>
				</Dialog>

				{/* Delete Content Dialog */}
				<Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Delete Content</DialogTitle>
							<DialogDescription>Permanently delete the reported content</DialogDescription>
						</DialogHeader>
						<Alert variant="destructive">
							<AlertTriangle className="h-4 w-4" />
							<AlertTitle>Warning</AlertTitle>
							<AlertDescription>
								This action cannot be undone. The content will be permanently deleted.
							</AlertDescription>
						</Alert>
						<Form {...deleteForm}>
							<form onSubmit={deleteForm.handleSubmit(onDeleteSubmit)} className="space-y-4">
								<FormField
									control={deleteForm.control}
									name="reason"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Deletion Reason</FormLabel>
											<FormControl>
												<Textarea
													placeholder="Explain why this content is being deleted..."
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<DialogFooter>
									<Button
										type="button"
										variant="outline"
										onClick={() => setIsDeleteDialogOpen(false)}
									>
										Cancel
									</Button>
									<Button
										type="submit"
										variant="destructive"
										disabled={deleteContentMutation.isPending}
									>
										{deleteContentMutation.isPending ? 'Deleting...' : 'Delete Content'}
									</Button>
								</DialogFooter>
							</form>
						</Form>
					</DialogContent>
				</Dialog>
			</div>
		</AdminPageShell>
	);
}
