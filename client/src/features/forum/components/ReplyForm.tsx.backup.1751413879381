import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { RichTextEditor } from '@/components/editor/rich-text-editor';
import { LoadingSpinner } from '@/components/ui/loader';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { X, CornerDownRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBreakpoint } from '@/hooks/useMediaQuery';
import { getAdaptiveConfig } from '@/utils/adaptiveSpacing';
import type { PostWithUser } from '@/types/compat/forum';

interface ReplyFormProps {
	threadId: number;
	replyToId?: number | null;
	replyToPost?: PostWithUser | null;
	onSubmit: (content: string, editorState?: Record<string, unknown>) => Promise<void>;
	showRichEditor?: boolean;
	placeholder?: string;
	isReplying?: boolean;
	onCancel?: () => void;
	includeQuote?: boolean;
}

export function ReplyForm({
	threadId,
	replyToId = null,
	replyToPost = null,
	onSubmit,
	showRichEditor = false,
	placeholder = 'Write your reply...',
	isReplying = false,
	onCancel,
	includeQuote = false
}: ReplyFormProps) {
	const { user, isAuthenticated } = useAuth();
	const [, setLocation] = useLocation();
	const [content, setContent] = useState('');
	const [editorContent, setEditorContent] = useState<Record<string, unknown> | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const breakpoint = useBreakpoint();

	// Get adaptive spacing configuration
	const adaptiveConfig = getAdaptiveConfig({
		spacing: 'sm',
		padding: 'md',
		typography: 'body',
		touchTarget: 'md',
		density: breakpoint.isMobile ? 'compact' : 'comfortable'
	});

	// Generate quote content when replying to a specific post with quote
	useEffect(() => {
		if (replyToPost && includeQuote && !content && !editorContent) {
			const username = replyToPost.user?.username || 'User';
			const postContent = replyToPost.content || '';

			// Create a simple quote block for the text editor
			const quoteContent = `<blockquote>
<p><strong>@${username} wrote:</strong></p>
${postContent}
</blockquote>
<p></p>`;

			if (showRichEditor) {
				setEditorContent(quoteContent);
			} else {
				// For plain text editor, create a simplified quote
				const textContent = `> @${username} wrote:\n> ${postContent.replace(/<[^>]*>/g, '')}\n\n`;
				setContent(textContent);
			}
		}
	}, [replyToPost, includeQuote, showRichEditor]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!isAuthenticated) {
			// Redirect to login page with return URL
			setLocation(`/auth?returnUrl=${encodeURIComponent(window.location.pathname)}`);
			return;
		}

		// Check if content is empty
		const useEditorContent = showRichEditor && editorContent;
		const contentToSubmit = useEditorContent ? editorContent : content;

		if (!contentToSubmit || contentToSubmit.trim() === '') {
			return;
		}

		setIsSubmitting(true);

		try {
			await onSubmit(contentToSubmit, useEditorContent ? editorContent : undefined);

			// Clear form after successful submission
			setContent('');
			setEditorContent(null);

			// Call onCancel to close the reply form if it's a direct reply
			if (isReplying && onCancel) {
				onCancel();
			}
		} catch (error) {
			console.error('Error submitting reply:', error);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleCancel = () => {
		setContent('');
		setEditorContent(null);
		onCancel && onCancel();
	};

	if (!isAuthenticated) {
		return (
			<Card className={cn('mb-4', adaptiveConfig.spacing)}>
				<CardContent className={cn(adaptiveConfig.padding)}>
					<p className={cn('text-center text-muted-foreground', adaptiveConfig.typography)}>
						Please{' '}
						<Button
							variant="link"
							className={cn(
								'p-0 h-auto',
								// Better touch target for mobile
								breakpoint.isMobile && 'min-h-[44px] inline-flex items-center'
							)}
							onClick={() =>
								setLocation(`/auth?returnUrl=${encodeURIComponent(window.location.pathname)}`)
							}
						>
							sign in
						</Button>{' '}
						to reply
					</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className={cn('mb-4', adaptiveConfig.spacing)}>
			{(isReplying || replyToPost) && (
				<CardHeader
					className={cn(
						'flex flex-row items-center justify-between bg-zinc-900/80 border-b border-zinc-800',
						adaptiveConfig.padding
					)}
				>
					<div className="flex items-center min-w-0 flex-1">
						<CornerDownRight
							className={cn('mr-2 flex-shrink-0', breakpoint.isMobile ? 'h-4 w-4' : 'h-4 w-4')}
						/>
						<span className={cn('font-medium truncate', adaptiveConfig.typography)}>
							{replyToPost ? `Replying to ${replyToPost.user?.username}` : 'Add a reply'}
						</span>
					</div>
					{isReplying && (
						<Button
							variant="ghost"
							size={breakpoint.isMobile ? 'default' : 'sm'}
							className={cn('p-0 flex-shrink-0', adaptiveConfig.touchTarget)}
							onClick={handleCancel}
						>
							<X className={cn(breakpoint.isMobile ? 'h-5 w-5' : 'h-4 w-4')} />
							<span className="sr-only">Cancel</span>
						</Button>
					)}
				</CardHeader>
			)}

			<form onSubmit={handleSubmit}>
				<CardContent className={cn(adaptiveConfig.padding)}>
					{showRichEditor ? (
						<RichTextEditor
							content={editorContent}
							onChange={setEditorContent}
							disabled={isSubmitting}
							placeholder={placeholder}
							className={cn(
								'resize-none',
								// Adaptive height based on device
								breakpoint.isMobile ? 'min-h-[100px]' : 'min-h-[120px]'
							)}
						/>
					) : (
						<Textarea
							value={content}
							onChange={(e) => setContent(e.target.value)}
							placeholder={placeholder}
							rows={breakpoint.isMobile ? 3 : 4}
							disabled={isSubmitting}
							className={cn(
								'resize-none',
								adaptiveConfig.typography,
								// Mobile: Larger text for better readability
								breakpoint.isMobile && 'text-base'
							)}
						/>
					)}
				</CardContent>

				<CardFooter
					className={cn(
						'flex justify-end border-t',
						adaptiveConfig.padding,
						// Mobile: Full-width buttons
						breakpoint.isMobile ? 'flex-col space-y-2' : 'flex-row space-x-2'
					)}
				>
					{isReplying && (
						<Button
							type="button"
							variant="ghost"
							onClick={handleCancel}
							disabled={isSubmitting}
							className={cn(breakpoint.isMobile && 'w-full', adaptiveConfig.touchTarget)}
						>
							Cancel
						</Button>
					)}

					<Button
						type="submit"
						disabled={isSubmitting || (!content && !editorContent)}
						className={cn(breakpoint.isMobile && 'w-full', adaptiveConfig.touchTarget)}
					>
						{isSubmitting ? (
							<>
								<LoadingSpinner
									className={cn('mr-2', breakpoint.isMobile ? 'h-5 w-5' : 'h-4 w-4')}
								/>
								Posting...
							</>
						) : (
							'Post Reply'
						)}
					</Button>
				</CardFooter>
			</form>
		</Card>
	);
}

export default ReplyForm;
