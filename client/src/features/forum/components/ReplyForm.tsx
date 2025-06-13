import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { RichTextEditor } from '@/components/editor/rich-text-editor';
import { LoadingSpinner } from '@/components/ui/loader';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { X, CornerDownRight } from 'lucide-react';
import type { PostWithUser } from '@db_types/forum.types';

interface ReplyFormProps {
	threadId: number;
	replyToId?: number | null;
	replyToPost?: PostWithUser | null;
	onSubmit: (content: string, editorState?: any) => Promise<void>;
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
	const [editorContent, setEditorContent] = useState<any>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

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
			<Card className="mb-4">
				<CardContent className="p-4">
					<p className="text-center text-sm text-muted-foreground">
						Please{' '}
						<Button
							variant="link"
							className="p-0 h-auto"
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
		<Card className="mb-4">
			{(isReplying || replyToPost) && (
				<CardHeader className="px-4 py-3 flex flex-row items-center justify-between bg-zinc-900/80 border-b border-zinc-800">
					<div className="flex items-center">
						<CornerDownRight className="h-4 w-4 mr-2" />
						<span className="text-sm font-medium">
							{replyToPost ? `Replying to ${replyToPost.user?.username}` : 'Add a reply'}
						</span>
					</div>
					{isReplying && (
						<Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={handleCancel}>
							<X className="h-4 w-4" />
							<span className="sr-only">Cancel</span>
						</Button>
					)}
				</CardHeader>
			)}

			<form onSubmit={handleSubmit}>
				<CardContent className="p-4">
					{showRichEditor ? (
						<RichTextEditor
							content={editorContent}
							onChange={setEditorContent}
							disabled={isSubmitting}
							placeholder={placeholder}
							className="min-h-[120px]"
						/>
					) : (
						<Textarea
							value={content}
							onChange={(e) => setContent(e.target.value)}
							placeholder={placeholder}
							rows={4}
							disabled={isSubmitting}
							className="resize-none"
						/>
					)}
				</CardContent>

				<CardFooter className="px-4 py-3 flex justify-end space-x-2 border-t">
					{isReplying && (
						<Button type="button" variant="ghost" onClick={handleCancel} disabled={isSubmitting}>
							Cancel
						</Button>
					)}

					<Button type="submit" disabled={isSubmitting || (!content && !editorContent)}>
						{isSubmitting ? (
							<>
								<LoadingSpinner className="mr-2 h-4 w-4" />
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
