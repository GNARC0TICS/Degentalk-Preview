import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminLayout from './admin-layout';
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
	CardFooter
} from '@/components/ui/card';
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
	DialogTitle,
	DialogTrigger
} from '@/components/ui/dialog';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
	MoreHorizontal,
	ExternalLink,
	UserX,
	AlertTriangle,
	Flag,
	Eye,
	CheckCircle,
	X,
	Ban,
	MessageSquareOff,
	Trash2,
	AlertOctagon,
	ShieldAlert,
	Filter,
	Search
} from 'lucide-react';
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious
} from '@/components/ui/pagination';

type ReportStatus = 'pending' | 'resolved' | 'dismissed';
type ReportType = 'post' | 'thread' | 'user' | 'message';

interface Report {
	id: number;
	type: ReportType;
	contentId: number;
	contentPreview: string;
	reportedUserId: number;
	reportedUsername: string;
	reporterId: number;
	reporterUsername: string;
	reason: string;
	status: ReportStatus;
	createdAt: string;
	resolvedAt?: string;
	resolvedById?: number;
	resolvedByUsername?: string;
	notes?: string;
}

export default function AdminReportsPage() {
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [statusFilter, setStatusFilter] = useState<ReportStatus | 'all'>('pending');
	const [typeFilter, setTypeFilter] = useState<ReportType | 'all'>('all');
	const [searchQuery, setSearchQuery] = useState('');
	const [viewReport, setViewReport] = useState<Report | null>(null);
	const [banDialogOpen, setBanDialogOpen] = useState(false);
	const [actionDialogOpen, setActionDialogOpen] = useState(false);
	const [actionNotes, setActionNotes] = useState('');
	const [selectedAction, setSelectedAction] = useState<string>('resolve');

	const { toast } = useToast();
	const queryClient = useQueryClient();

	// Fetch reports with filters
	const {
		data: reportsData,
		isLoading,
		isError
	} = useQuery({
		queryKey: ['/api/admin/reports', page, pageSize, statusFilter, typeFilter, searchQuery],
		queryFn: async () => {
			const queryParams = new URLSearchParams({
				page: page.toString(),
				limit: pageSize.toString(),
				...(statusFilter !== 'all' && { status: statusFilter }),
				...(typeFilter !== 'all' && { type: typeFilter }),
				...(searchQuery && { search: searchQuery })
			});

			const response = await fetch(`/api/admin/reports?${queryParams}`);
			if (!response.ok) {
				throw new Error('Failed to fetch reports');
			}
			return response.json();
		}
	});

	// Handle report action (resolve/dismiss)
	const reportActionMutation = useMutation({
		mutationFn: async ({
			reportId,
			action,
			notes
		}: {
			reportId: number;
			action: string;
			notes?: string;
		}) => {
			const response = await fetch(`/api/admin/reports/${reportId}/${action}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ notes })
			});

			if (!response.ok) {
				throw new Error(`Failed to ${action} report`);
			}

			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ['/api/admin/reports']
			});
			toast({
				title: 'Success',
				description: `Report has been ${selectedAction === 'resolve' ? 'resolved' : 'dismissed'}.`
			});
			setActionDialogOpen(false);
			setViewReport(null);
			setActionNotes('');
		},
		onError: (error) => {
			toast({
				title: 'Error',
				description: error.message,
				variant: 'destructive'
			});
		}
	});

	// Ban user mutation
	const banUserMutation = useMutation({
		mutationFn: async ({
			userId,
			reason,
			duration
		}: {
			userId: number;
			reason: string;
			duration?: string;
		}) => {
			const response = await fetch(`/api/admin/users/${userId}/ban`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ reason, duration })
			});

			if (!response.ok) {
				throw new Error('Failed to ban user');
			}

			return response.json();
		},
		onSuccess: () => {
			toast({
				title: 'Success',
				description: 'User has been banned.'
			});
			setBanDialogOpen(false);
		},
		onError: (error) => {
			toast({
				title: 'Error',
				description: error.message,
				variant: 'destructive'
			});
		}
	});

	// Delete content mutation
	const deleteContentMutation = useMutation({
		mutationFn: async ({
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
					throw new Error('Invalid content type');
			}

			const response = await fetch(endpoint, {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ reason })
			});

			if (!response.ok) {
				throw new Error(`Failed to delete ${type}`);
			}

			return response.json();
		},
		onSuccess: (_, variables) => {
			toast({
				title: 'Success',
				description: `${variables.type} has been deleted.`
			});

			// If we're deleting as part of resolving a report
			if (viewReport) {
				handleReportAction(viewReport.id, 'resolve', `Content deleted: ${actionNotes}`);
			}
		},
		onError: (error) => {
			toast({
				title: 'Error',
				description: error.message,
				variant: 'destructive'
			});
		}
	});

	// Handle resolving or dismissing a report
	const handleReportAction = (reportId: number, action: string, notes?: string) => {
		reportActionMutation.mutate({
			reportId,
			action,
			notes: notes || actionNotes
		});
	};

	// Format timestamp
	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleString();
	};

	// Get badge color based on report status
	const getStatusBadge = (status: ReportStatus) => {
		switch (status) {
			case 'pending':
				return (
					<Badge className="bg-yellow-500">
						<AlertTriangle className="h-3 w-3 mr-1" /> Pending
					</Badge>
				);
			case 'resolved':
				return (
					<Badge className="bg-green-500">
						<CheckCircle className="h-3 w-3 mr-1" /> Resolved
					</Badge>
				);
			case 'dismissed':
				return (
					<Badge className="bg-gray-500">
						<X className="h-3 w-3 mr-1" /> Dismissed
					</Badge>
				);
			default:
				return <Badge>{status}</Badge>;
		}
	};

	// Get badge for report type
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
						<Flag className="h-3 w-3 mr-1" /> Message
					</Badge>
				);
			default:
				return <Badge variant="outline">{type}</Badge>;
		}
	};

	// Calculate pagination
	const totalPages = reportsData?.pagination?.totalPages || 1;

	return (
		<div className="space-y-6">
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
				<h1 className="text-3xl font-bold">Content Moderation</h1>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Reported Content</CardTitle>
					<CardDescription>Review and moderate reported content</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{/* Filters */}
					<div className="flex flex-wrap gap-2">
						<div className="flex-1 min-w-[200px]">
							<Select
								value={statusFilter}
								onValueChange={(value) => setStatusFilter(value as ReportStatus | 'all')}
							>
								<SelectTrigger>
									<Filter className="h-4 w-4 mr-2" />
									<SelectValue placeholder="Status" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Status</SelectItem>
									<SelectItem value="pending">Pending</SelectItem>
									<SelectItem value="resolved">Resolved</SelectItem>
									<SelectItem value="dismissed">Dismissed</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="flex-1 min-w-[200px]">
							<Select
								value={typeFilter}
								onValueChange={(value) => setTypeFilter(value as ReportType | 'all')}
							>
								<SelectTrigger>
									<Filter className="h-4 w-4 mr-2" />
									<SelectValue placeholder="Type" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Types</SelectItem>
									<SelectItem value="post">Posts</SelectItem>
									<SelectItem value="thread">Threads</SelectItem>
									<SelectItem value="user">Users</SelectItem>
									<SelectItem value="message">Messages</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="flex-1 min-w-[200px] md:flex-[2]">
							<div className="relative">
								<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
								<Input
									type="search"
									placeholder="Search reports..."
									className="pl-8"
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									onKeyDown={(e) => {
										if (e.key === 'Enter') {
											setPage(1); // Reset to first page on new search
										}
									}}
								/>
							</div>
						</div>
					</div>

					{isLoading ? (
						<div className="flex justify-center items-center h-40">
							<p>Loading reports...</p>
						</div>
					) : isError ? (
						<div className="flex justify-center items-center h-40">
							<p className="text-red-500">Failed to load reports</p>
						</div>
					) : (reportsData?.reports?.length || 0) > 0 ? (
						<div className="overflow-x-auto">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead className="w-[100px]">Type</TableHead>
										<TableHead>Reported User</TableHead>
										<TableHead>Reason</TableHead>
										<TableHead>Reported By</TableHead>
										<TableHead>Date</TableHead>
										<TableHead>Status</TableHead>
										<TableHead className="text-right">Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{reportsData.reports.map((report: Report) => (
										<TableRow key={report.id}>
											<TableCell>{getTypeBadge(report.type)}</TableCell>
											<TableCell className="font-medium">{report.reportedUsername}</TableCell>
											<TableCell>
												<div className="max-w-[250px] truncate" title={report.reason}>
													{report.reason}
												</div>
											</TableCell>
											<TableCell>{report.reporterUsername}</TableCell>
											<TableCell>{formatDate(report.createdAt)}</TableCell>
											<TableCell>{getStatusBadge(report.status)}</TableCell>
											<TableCell className="text-right">
												<div className="flex justify-end items-center space-x-1">
													<Button variant="outline" size="sm" onClick={() => setViewReport(report)}>
														<Eye className="h-4 w-4" />
														<span className="sr-only">View</span>
													</Button>
													{report.status === 'pending' && (
														<>
															<Button
																variant="outline"
																size="sm"
																className="text-green-500 hover:text-green-600"
																onClick={() => {
																	setViewReport(report);
																	setSelectedAction('resolve');
																	setActionDialogOpen(true);
																}}
															>
																<CheckCircle className="h-4 w-4" />
																<span className="sr-only">Resolve</span>
															</Button>
															<Button
																variant="outline"
																size="sm"
																className="text-gray-500 hover:text-gray-600"
																onClick={() => {
																	setViewReport(report);
																	setSelectedAction('dismiss');
																	setActionDialogOpen(true);
																}}
															>
																<X className="h-4 w-4" />
																<span className="sr-only">Dismiss</span>
															</Button>
														</>
													)}
												</div>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					) : (
						<div className="flex justify-center items-center h-40">
							<p>No reports found matching your criteria.</p>
						</div>
					)}

					{/* Pagination */}
					{totalPages > 1 && (
						<div className="flex justify-center mt-4">
							<Pagination>
								<PaginationContent>
									<PaginationItem>
										<PaginationPrevious
											onClick={() => setPage((p) => Math.max(1, p - 1))}
											className={page === 1 ? 'pointer-events-none opacity-50' : ''}
										/>
									</PaginationItem>

									{[...Array(Math.min(5, totalPages))].map((_, i) => {
										let pageNumber = i + 1;

										// Show different pages based on current page for larger sets
										if (totalPages > 5) {
											if (page > 3 && page < totalPages - 2) {
												// Show current page in the middle with neighbors
												pageNumber = page - 2 + i;
											} else if (page >= totalPages - 2) {
												// Near the end, show the last 5 pages
												pageNumber = totalPages - 4 + i;
											}
										}

										return (
											<PaginationItem key={`page-${pageNumber}`}>
												<PaginationLink
													onClick={() => setPage(pageNumber)}
													isActive={page === pageNumber}
												>
													{pageNumber}
												</PaginationLink>
											</PaginationItem>
										);
									})}

									<PaginationItem>
										<PaginationNext
											onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
											className={page === totalPages ? 'pointer-events-none opacity-50' : ''}
										/>
									</PaginationItem>
								</PaginationContent>
							</Pagination>
						</div>
					)}
				</CardContent>
			</Card>

			{/* View Report Dialog */}
			{viewReport && (
				<Dialog open={!!viewReport} onOpenChange={(open) => !open && setViewReport(null)}>
					<DialogContent className="max-w-3xl">
						<DialogHeader>
							<DialogTitle className="flex items-center">
								Report #{viewReport.id} {getStatusBadge(viewReport.status)}
							</DialogTitle>
							<DialogDescription>{formatDate(viewReport.createdAt)}</DialogDescription>
						</DialogHeader>

						<Tabs defaultValue="details" className="mt-4">
							<TabsList className="grid w-full grid-cols-3">
								<TabsTrigger value="details">Details</TabsTrigger>
								<TabsTrigger value="content">Content</TabsTrigger>
								<TabsTrigger value="actions">Actions</TabsTrigger>
							</TabsList>

							<TabsContent value="details" className="space-y-4 mt-4">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<Label className="text-sm font-medium">Report Type</Label>
										<div className="mt-1">{getTypeBadge(viewReport.type)}</div>
									</div>
									<div>
										<Label className="text-sm font-medium">Status</Label>
										<div className="mt-1">{getStatusBadge(viewReport.status)}</div>
									</div>
								</div>

								<div>
									<Label className="text-sm font-medium">Reason for Report</Label>
									<div className="mt-1 p-3 border rounded-md bg-muted">{viewReport.reason}</div>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<Label className="text-sm font-medium">Reported User</Label>
										<div className="mt-1 flex items-center">
											<span className="font-medium">{viewReport.reportedUsername}</span>
											<Button
												variant="ghost"
												size="sm"
												className="ml-2 h-6"
												onClick={() => {
													window.open(`/profile/${viewReport.reportedUsername}`, '_blank');
												}}
											>
												<ExternalLink className="h-3 w-3" />
											</Button>
										</div>
									</div>
									<div>
										<Label className="text-sm font-medium">Reported By</Label>
										<div className="mt-1">
											<span className="font-medium">{viewReport.reporterUsername}</span>
										</div>
									</div>
								</div>

								{viewReport.status !== 'pending' && (
									<div>
										<Label className="text-sm font-medium">
											{viewReport.status === 'resolved' ? 'Resolution' : 'Dismissal'} Notes
										</Label>
										<div className="mt-1 p-3 border rounded-md bg-muted">
											{viewReport.notes || 'No notes provided.'}
										</div>
										<div className="mt-2 text-sm text-muted-foreground">
											{viewReport.resolvedAt && viewReport.resolvedByUsername && (
												<>
													{viewReport.status === 'resolved' ? 'Resolved' : 'Dismissed'} by{' '}
													{viewReport.resolvedByUsername} on {formatDate(viewReport.resolvedAt)}
												</>
											)}
										</div>
									</div>
								)}
							</TabsContent>

							<TabsContent value="content" className="space-y-4 mt-4">
								<div>
									<Label className="text-sm font-medium">Content Preview</Label>
									<div className="mt-1 p-3 border rounded-md bg-muted whitespace-pre-wrap">
										{viewReport.contentPreview || 'No content preview available.'}
									</div>
								</div>

								<div className="flex justify-between">
									<Button
										variant="outline"
										onClick={() => {
											let url = '';
											switch (viewReport.type) {
												case 'post':
													// This assumes there's a way to link directly to a post
													url = `/threads/${viewReport.contentId}`;
													break;
												case 'thread':
													url = `/threads/${viewReport.contentId}`;
													break;
												case 'user':
													url = `/profile/${viewReport.reportedUsername}`;
													break;
												case 'message':
													// For messages, might not have a direct link
													url = `/`;
													break;
											}
											window.open(url, '_blank');
										}}
									>
										<ExternalLink className="h-4 w-4 mr-2" />
										View in Context
									</Button>

									{viewReport.status === 'pending' && viewReport.type !== 'user' && (
										<Button
											variant="destructive"
											onClick={() => {
												if (
													window.confirm(
														'Are you sure you want to delete this content? This action cannot be undone.'
													)
												) {
													deleteContentMutation.mutate({
														type: viewReport.type,
														contentId: viewReport.contentId,
														reason: 'Deleted due to report: ' + viewReport.reason
													});
												}
											}}
										>
											<Trash2 className="h-4 w-4 mr-2" />
											Delete Content
										</Button>
									)}
								</div>
							</TabsContent>

							<TabsContent value="actions" className="space-y-4 mt-4">
								{viewReport.status === 'pending' && (
									<>
										<div className="space-y-2">
											<Button
												variant="default"
												className="w-full"
												onClick={() => {
													setSelectedAction('resolve');
													setActionDialogOpen(true);
												}}
											>
												<CheckCircle className="h-4 w-4 mr-2" />
												Resolve Report
											</Button>

											<Button
												variant="outline"
												className="w-full"
												onClick={() => {
													setSelectedAction('dismiss');
													setActionDialogOpen(true);
												}}
											>
												<X className="h-4 w-4 mr-2" />
												Dismiss Report
											</Button>
										</div>

										<div className="pt-2 border-t">
											<h3 className="font-medium mb-2">User Actions</h3>
											<div className="space-y-2">
												<Button
													variant="destructive"
													className="w-full"
													onClick={() => setBanDialogOpen(true)}
												>
													<Ban className="h-4 w-4 mr-2" />
													Ban User
												</Button>

												<Button
													variant="outline"
													className="w-full text-yellow-500 border-yellow-500 hover:bg-yellow-500/10"
												>
													<ShieldAlert className="h-4 w-4 mr-2" />
													Warn User
												</Button>
											</div>
										</div>
									</>
								)}

								{viewReport.status !== 'pending' && (
									<div className="flex justify-center items-center h-32">
										<p className="text-muted-foreground">
											This report has been{' '}
											{viewReport.status === 'resolved' ? 'resolved' : 'dismissed'}.
										</p>
									</div>
								)}
							</TabsContent>
						</Tabs>

						<DialogFooter>
							<Button variant="outline" onClick={() => setViewReport(null)}>
								Close
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			)}

			{/* Action Dialog (Resolve/Dismiss) */}
			<Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>{selectedAction === 'resolve' ? 'Resolve' : 'Dismiss'} Report</DialogTitle>
						<DialogDescription>
							Add notes to explain your decision. This will be logged for audit purposes.
						</DialogDescription>
					</DialogHeader>
					<div className="mt-4 space-y-4">
						<div className="space-y-2">
							<Label htmlFor="actionNotes">Notes</Label>
							<Textarea
								id="actionNotes"
								placeholder="Enter your notes here..."
								value={actionNotes}
								onChange={(e) => setActionNotes(e.target.value)}
								className="h-24"
							/>
						</div>
					</div>
					<DialogFooter className="mt-4">
						<Button variant="outline" onClick={() => setActionDialogOpen(false)}>
							Cancel
						</Button>
						<Button
							variant={selectedAction === 'resolve' ? 'default' : 'secondary'}
							onClick={() => {
								if (viewReport) {
									handleReportAction(viewReport.id, selectedAction);
								}
							}}
							disabled={reportActionMutation.isPending}
						>
							{reportActionMutation.isPending
								? 'Processing...'
								: selectedAction === 'resolve'
									? 'Resolve Report'
									: 'Dismiss Report'}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Ban User Dialog */}
			<Dialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>Ban User</DialogTitle>
						<DialogDescription>
							This will ban {viewReport?.reportedUsername} from the platform. Specify the reason and
							duration.
						</DialogDescription>
					</DialogHeader>
					<div className="mt-4 space-y-4">
						<div className="space-y-2">
							<Label htmlFor="banReason">Reason for Ban</Label>
							<Textarea
								id="banReason"
								placeholder="Enter the reason for banning this user..."
								value={actionNotes}
								onChange={(e) => setActionNotes(e.target.value)}
								className="h-24"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="banDuration">Ban Duration</Label>
							<Select defaultValue="permanent">
								<SelectTrigger id="banDuration">
									<SelectValue placeholder="Select duration" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="1d">1 Day</SelectItem>
									<SelectItem value="3d">3 Days</SelectItem>
									<SelectItem value="7d">7 Days</SelectItem>
									<SelectItem value="30d">30 Days</SelectItem>
									<SelectItem value="permanent">Permanent</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
					<DialogFooter className="mt-4">
						<Button variant="outline" onClick={() => setBanDialogOpen(false)}>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={() => {
								if (viewReport) {
									banUserMutation.mutate({
										userId: viewReport.reportedUserId,
										reason: actionNotes || 'No reason provided'
									});
								}
							}}
							disabled={banUserMutation.isPending || !actionNotes}
						>
							{banUserMutation.isPending ? 'Banning User...' : 'Ban User'}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
