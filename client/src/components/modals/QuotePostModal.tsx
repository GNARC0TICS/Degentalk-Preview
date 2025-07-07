import React, { useState, useEffect } from 'react';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Quote, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PostWithUser } from '@/types/compat/forum';

interface QuotePostModalProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: (quotedContent: string, replyContent: string) => void;
	post: PostWithUser | null;
	isSubmitting?: boolean;
}

// Helper to convert content to BBCode quote format
const formatQuoteBBCode = (content: string, username: string, postId?: PostId): string => {
	// Split content into lines and add > prefix for BBCode quote style
	const lines = content
		.split('\n')
		.map((line) => `> ${line}`)
		.join('\n');
	const header = postId ? `[quote="${username}" post_id="${postId}"]` : `[quote="${username}"]`;

	return `${header}\n${lines}\n[/quote]\n\n`;
};

export const QuotePostModal: React.FC<QuotePostModalProps> = ({
	isOpen,
	onOpenChange,
	onConfirm,
	post,
	isSubmitting = false
}) => {
	const [selectedText, setSelectedText] = useState<string>('');
	const [replyContent, setReplyContent] = useState<string>('');
	const [showPreview, setShowPreview] = useState<boolean>(false);

	// Reset state when modal opens/closes
	useEffect(() => {
		if (isOpen && post) {
			// Default to full post content
			setSelectedText(post.content);
			setReplyContent('');
			setShowPreview(false);
		}
	}, [isOpen, post]);

	if (!post) return null;

	const quotedContent = formatQuoteBBCode(
		selectedText || post.content,
		post.user.username,
		post.id
	);

	const fullReply = quotedContent + replyContent;

	const handleConfirm = () => {
		onConfirm(quotedContent, replyContent);
		// Modal will be closed by parent component after successful submission
	};

	const handleClose = () => {
		setSelectedText('');
		setReplyContent('');
		setShowPreview(false);
		onOpenChange(false);
	};

	// Simple BBCode to HTML preview (basic implementation)
	const renderPreview = (content: string) => {
		const html = content
			.replace(
				/\[quote="([^"]+)"[^\]]*\]/g,
				'<blockquote class="border-l-4 border-zinc-600 pl-4 my-2 text-zinc-400"><strong>$1 wrote:</strong><br>'
			)
			.replace(/\[\/quote\]/g, '</blockquote>')
			.replace(/^> (.+)$/gm, '<span class="text-zinc-500">$1</span>')
			.replace(/\n/g, '<br>');

		return { __html: html };
	};

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Quote className="h-5 w-5 text-blue-500" />
						Quote Post
					</DialogTitle>
					<DialogDescription className="text-zinc-400">
						Select the text you want to quote and add your reply.
					</DialogDescription>
				</DialogHeader>

				<div className="flex-1 overflow-y-auto space-y-4 py-4">
					{/* Original post content for selection */}
					<div className="space-y-2">
						<Label>Original Post by {post.user.username}</Label>
						<div className="p-3 bg-zinc-800 rounded-md border border-zinc-700">
							<Textarea
								value={selectedText}
								onChange={(e) => setSelectedText(e.target.value)}
								placeholder="Select the text you want to quote..."
								className="min-h-[100px] resize-none bg-transparent border-0 p-0 focus:ring-0"
							/>
						</div>
						<p className="text-xs text-zinc-500">
							Tip: Edit the text above to quote only the relevant parts
						</p>
					</div>

					{/* Reply content */}
					<div className="space-y-2">
						<Label htmlFor="reply-content">Your Reply</Label>
						<Textarea
							id="reply-content"
							value={replyContent}
							onChange={(e) => setReplyContent(e.target.value)}
							placeholder="Type your reply here..."
							className="min-h-[120px] resize-none"
						/>
					</div>

					{/* Preview toggle and content */}
					<div className="space-y-2">
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={() => setShowPreview(!showPreview)}
							className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
						>
							{showPreview ? (
								<>
									<EyeOff className="h-4 w-4 mr-2" />
									Hide Preview
								</>
							) : (
								<>
									<Eye className="h-4 w-4 mr-2" />
									Show Preview
								</>
							)}
						</Button>

						{showPreview && (
							<div className="p-4 bg-zinc-900 rounded-md border border-zinc-700">
								<div
									className="prose prose-invert prose-sm max-w-none"
									dangerouslySetInnerHTML={renderPreview(fullReply)}
								/>
							</div>
						)}
					</div>
				</div>

				<DialogFooter className="border-t border-zinc-800 pt-4">
					<Button
						variant="outline"
						onClick={handleClose}
						disabled={isSubmitting}
						className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
					>
						Cancel
					</Button>
					<Button
						onClick={handleConfirm}
						disabled={isSubmitting || (!selectedText.trim() && !replyContent.trim())}
						className="bg-blue-600 hover:bg-blue-700"
					>
						{isSubmitting ? 'Posting...' : 'Post Reply'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
