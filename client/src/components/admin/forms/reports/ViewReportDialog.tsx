import React from 'react';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
	ExternalLink,
	UserX,
	AlertTriangle,
	Flag,
	MessageSquareOff,
	AlertOctagon,
	CheckCircle,
	X,
	Ban,
	ShieldAlert,
	Trash2
} from 'lucide-react';

// Types (should ideally be shared)
export type ReportStatus = 'pending' | 'resolved' | 'dismissed';
export type ReportType = 'post' | 'thread' | 'user' | 'message';

export interface Report {
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

// Helper functions (can be moved to a shared util)
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
					<Flag className="h-3 w-3 mr-1" /> Message
				</Badge>
			);
		default:
			return <Badge variant="outline">{type}</Badge>;
	}
};

interface ViewReportDialogProps {
	report: Report | null;
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	onOpenActionDialog: (action: 'resolve' | 'dismiss') => void;
	onOpenBanDialog: () => void;
	onDeleteContent: () => void;
}

export const ViewReportDialog: React.FC<ViewReportDialogProps> = ({
	report,
	isOpen,
	onOpenChange,
	onOpenActionDialog,
	onOpenBanDialog,
	onDeleteContent
}) => {
	if (!report) return null;

	const handleViewInContext = () => {
		let url = '';
		switch (report.type) {
			case 'post':
				url = `/threads/${report.contentId}`;
				break; // Assuming post ID can link to thread
			case 'thread':
				url = `/threads/${report.contentId}`;
				break;
			case 'user':
				url = `/profile/${report.reportedUsername}`;
				break;
			case 'message':
				url = `/`;
				break; // May not have a direct link
		}
		if (url) window.open(url, '_blank');
	};

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-3xl">
				<DialogHeader>
					<DialogTitle className="flex items-center">
						Report #{report.id} {getStatusBadge(report.status)}
					</DialogTitle>
					<DialogDescription>{formatDate(report.createdAt)}</DialogDescription>
				</DialogHeader>

				<Tabs defaultValue="details" className="mt-4">
					<TabsList className="grid w-full grid-cols-3">
						<TabsTrigger value="details">Details</TabsTrigger>
						<TabsTrigger value="content">Content</TabsTrigger>
						<TabsTrigger value="actions">Actions</TabsTrigger>
					</TabsList>

					<TabsContent value="details" className="space-y-4 mt-4 max-h-[60vh] overflow-y-auto pr-2">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<Label className="text-sm font-medium">Report Type</Label>
								<div className="mt-1">{getTypeBadge(report.type)}</div>
							</div>
							<div>
								<Label className="text-sm font-medium">Status</Label>
								<div className="mt-1">{getStatusBadge(report.status)}</div>
							</div>
						</div>
						<div>
							<Label className="text-sm font-medium">Reason for Report</Label>
							<div className="mt-1 p-3 border rounded-md bg-muted text-sm">{report.reason}</div>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<Label className="text-sm font-medium">Reported User</Label>
								<div className="mt-1 flex items-center">
									<span className="font-medium">{report.reportedUsername}</span>
									<Button
										variant="ghost"
										size="sm"
										className="ml-2 h-6"
										onClick={() => window.open(`/profile/${report.reportedUsername}`, '_blank')}
									>
										<ExternalLink className="h-3 w-3" />
									</Button>
								</div>
							</div>
							<div>
								<Label className="text-sm font-medium">Reported By</Label>
								<div className="mt-1">
									<span className="font-medium">{report.reporterUsername}</span>
								</div>
							</div>
						</div>
						{report.status !== 'pending' && (
							<div>
								<Label className="text-sm font-medium">
									{report.status === 'resolved' ? 'Resolution' : 'Dismissal'} Notes
								</Label>
								<div className="mt-1 p-3 border rounded-md bg-muted text-sm">
									{report.notes || 'No notes provided.'}
								</div>
								<div className="mt-2 text-xs text-muted-foreground">
									{report.resolvedAt && report.resolvedByUsername && (
										<>
											{report.status === 'resolved' ? 'Resolved' : 'Dismissed'} by{' '}
											{report.resolvedByUsername} on {formatDate(report.resolvedAt)}
										</>
									)}
								</div>
							</div>
						)}
					</TabsContent>

					<TabsContent value="content" className="space-y-4 mt-4 max-h-[60vh] overflow-y-auto pr-2">
						<div>
							<Label className="text-sm font-medium">Content Preview</Label>
							<div className="mt-1 p-3 border rounded-md bg-muted whitespace-pre-wrap text-sm">
								{report.contentPreview || 'No content preview available.'}
							</div>
						</div>
						<div className="flex justify-between items-center">
							<Button variant="outline" onClick={handleViewInContext}>
								<ExternalLink className="h-4 w-4 mr-2" />
								View in Context
							</Button>
							{report.status === 'pending' && report.type !== 'user' && (
								<Button variant="destructive" onClick={onDeleteContent}>
									<Trash2 className="h-4 w-4 mr-2" />
									Delete Content
								</Button>
							)}
						</div>
					</TabsContent>

					<TabsContent value="actions" className="space-y-4 mt-4 max-h-[60vh] overflow-y-auto pr-2">
						{report.status === 'pending' ? (
							<>
								<div className="space-y-2">
									<Button
										variant="default"
										className="w-full"
										onClick={() => onOpenActionDialog('resolve')}
									>
										<CheckCircle className="h-4 w-4 mr-2" />
										Resolve Report
									</Button>
									<Button
										variant="outline"
										className="w-full"
										onClick={() => onOpenActionDialog('dismiss')}
									>
										<X className="h-4 w-4 mr-2" />
										Dismiss Report
									</Button>
								</div>
								<div className="pt-4 mt-4 border-t">
									<h3 className="font-medium mb-2 text-sm">User Actions</h3>
									<div className="space-y-2">
										<Button variant="destructive" className="w-full" onClick={onOpenBanDialog}>
											<Ban className="h-4 w-4 mr-2" />
											Ban User ({report.reportedUsername})
										</Button>
										<Button
											variant="outline"
											className="w-full text-yellow-500 border-yellow-500 hover:bg-yellow-500/10 hover:text-yellow-600"
										>
											<ShieldAlert className="h-4 w-4 mr-2" />
											Warn User (Placeholder)
										</Button>
									</div>
								</div>
							</>
						) : (
							<div className="flex justify-center items-center h-32">
								<p className="text-muted-foreground">This report has been {report.status}.</p>
							</div>
						)}
					</TabsContent>
				</Tabs>

				<DialogFooter className="mt-2 flex-wrap gap-2 sm:justify-end">
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Close
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
