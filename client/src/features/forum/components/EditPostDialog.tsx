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
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import type { PostWithUser } from '@/types/compat/forum';

interface EditPostDialogProps {
	post: PostWithUser | null;
	isOpen: boolean;
	onClose: () => void;
}

export function EditPostDialog({ post, isOpen, onClose }: EditPostDialogProps) {
	const [content, setContent] = useState('');
	const [editorState, setEditorState] = useState<any>(null);
	const updatePost = usePostUpdate();

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
