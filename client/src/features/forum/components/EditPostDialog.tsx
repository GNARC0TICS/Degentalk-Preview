import React, { useState, useEffect } from 'react';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RichTextEditor } from '@/components/editor/rich-text-editor';
import { usePostUpdate } from '@/features/forum/hooks/useForumQueries';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { Post } from '@shared/types/post.types';

interface EditPostDialogProps {
	post: Post | null;
	isOpen: boolean;
	onClose: () => void;
}

export function EditPostDialog({ post, isOpen, onClose }: EditPostDialogProps) {
	const [content, setContent] = useState('');
	const [editorState, setEditorState] = useState<any>(null);
	const updatePost = usePostUpdate();
	const { user } = useAuth();

	// Permission check function
	const canEditPost = (post: Post): boolean => {
		if (!user || !post.user) return false;
		// User can edit their own posts
		if (post.user?.id === user.id) return true;
		// Moderators/admins can edit any post
		if (user.role === 'admin' || user.role === 'moderator') return true;
		return false;
	};

	// Initialize content when post changes
	useEffect(() => {
		if (post) {
			setContent(post.content || '');
			// TODO: Add editor state support if needed
			setEditorState(null);
		}
	}, [post]);

	const handleSave = async () => {
		if (!post || !content.trim()) {
			toast.error('Content cannot be empty');
			return;
		}

		try {
			await updatePost.mutateAsync({
				postId: post.id,
				content,
				editorState
			});
			onClose();
			setContent('');
			setEditorState(null);
		} catch (error) {
			// Error handling is already done in the mutation
		}
	};

	const handleCancel = () => {
		onClose();
		// Reset to original content
		if (post) {
			setContent(post.content || '');
			setEditorState(null);
		}
	};

	if (!post) return null;

	// Permission check - Defense in depth
	if (!canEditPost(post)) {
		return (
			<Dialog open={isOpen} onOpenChange={onClose}>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2 text-red-500">
							<AlertTriangle className="h-5 w-5" />
							Permission Denied
						</DialogTitle>
					</DialogHeader>
					<Alert variant="destructive">
						<AlertTriangle className="h-4 w-4" />
						<AlertDescription>
							You don't have permission to edit this post. Only the post author, moderators, and administrators can edit posts.
						</AlertDescription>
					</Alert>
					<DialogFooter>
						<Button variant="outline" onClick={onClose}>
							Close
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		);
	}

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Edit Post</DialogTitle>
				</DialogHeader>

				<div className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-zinc-200 mb-2">Content</label>
						<RichTextEditor
							content={content}
							onChange={(html) => setContent(html)}
							placeholder="Edit your post content..."
							editorClass="min-h-[300px]"
						/>
					</div>
				</div>

				<DialogFooter className="flex justify-end space-x-2 pt-4">
					<Button variant="outline" onClick={handleCancel} disabled={updatePost.isPending}>
						Cancel
					</Button>
					<Button onClick={handleSave} disabled={updatePost.isPending || !content.trim()}>
						{updatePost.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
						Save Changes
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
