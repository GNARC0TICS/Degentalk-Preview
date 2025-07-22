import React, { useState } from 'react';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select';
import { useReportPost } from '@/features/forum/hooks/useForumQueries';
import { Loader2, AlertTriangle } from 'lucide-react';
import type { PostWithUser } from '@/types/compat/forum';
import { postIdToContentId } from '@shared/utils/id-conversions';

interface ReportPostDialogProps {
	post: PostWithUser | null;
	isOpen: boolean;
	onClose: () => void;
}

const REPORT_REASONS = [
	{ value: 'spam', label: 'Spam or unwanted content' },
	{ value: 'harassment', label: 'Harassment or bullying' },
	{ value: 'inappropriate_content', label: 'Inappropriate or offensive content' },
	{ value: 'hate_speech', label: 'Hate speech or discrimination' },
	{ value: 'misinformation', label: 'Misinformation or false claims' },
	{ value: 'copyright_violation', label: 'Copyright violation' },
	{ value: 'scam', label: 'Scam or fraudulent content' },
	{ value: 'off_topic', label: 'Off-topic or irrelevant' },
	{ value: 'low_quality', label: 'Low quality or unhelpful' },
	{ value: 'duplicate', label: 'Duplicate content' },
	{ value: 'other', label: 'Other (please specify)' }
];

export function ReportPostDialog({ post, isOpen, onClose }: ReportPostDialogProps) {
	const [reason, setReason] = useState('');
	const [details, setDetails] = useState('');
	const reportPost = useReportPost();

	const handleSubmit = async () => {
		if (!post || !reason) return;

		try {
			await reportPost.mutateAsync({
				contentType: 'post',
				contentId: postIdToContentId(post.id),
				reason,
				details: details.trim() || undefined
			});
			onClose();
			setReason('');
			setDetails('');
		} catch (error) {
			// Error handling is done in the mutation hook
		}
	};

	const handleCancel = () => {
		onClose();
		setReason('');
		setDetails('');
	};

	if (!post) return null;

	const selectedReason = REPORT_REASONS.find((r) => r.value === reason);
	const isOtherReason = reason === 'other';
	const canSubmit = reason && (!isOtherReason || details.trim());

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<AlertTriangle className="h-5 w-5 text-amber-500" />
						Report Post
					</DialogTitle>
				</DialogHeader>

				<div className="space-y-4">
					<div className="text-sm text-zinc-400">
						You are reporting a post by{' '}
						<span className="font-medium text-zinc-200">{post.user.username}</span>
					</div>

					<div>
						<Label htmlFor="reason" className="text-sm font-medium text-zinc-200">
							Reason for reporting *
						</Label>
						<Select value={reason} onValueChange={setReason}>
							<SelectTrigger className="mt-2">
								<SelectValue placeholder="Select a reason..." />
							</SelectTrigger>
							<SelectContent>
								{REPORT_REASONS.map((reportReason) => (
									<SelectItem key={reportReason.value} value={reportReason.value}>
										{reportReason.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div>
						<Label htmlFor="details" className="text-sm font-medium text-zinc-200">
							Additional details {isOtherReason && '*'}
						</Label>
						<Textarea
							id="details"
							value={details}
							onChange={(e) => setDetails(e.target.value)}
							placeholder={
								isOtherReason
									? "Please explain why you're reporting this post..."
									: 'Optional: Provide additional context about this report...'
							}
							className="mt-2 min-h-[80px]"
							maxLength={500}
						/>
						<div className="text-xs text-zinc-500 mt-1">{details.length}/500 characters</div>
					</div>

					{reason && (
						<div className="text-xs text-zinc-400 bg-zinc-800/50 rounded p-3">
							<strong>What happens next:</strong> Our moderation team will review this report. If
							the content violates our community guidelines, appropriate action will be taken. All
							reports are handled confidentially.
						</div>
					)}
				</div>

				<DialogFooter className="flex justify-end space-x-2 pt-4">
					<Button variant="outline" onClick={handleCancel} disabled={reportPost.isPending}>
						Cancel
					</Button>
					<Button
						onClick={handleSubmit}
						disabled={reportPost.isPending || !canSubmit}
						className="bg-red-600 hover:bg-red-700"
					>
						{reportPost.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
						Submit Report
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
