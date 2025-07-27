import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { apiRequest, queryClient } from '@/utils/queryClient';
import { useCanonicalAuth } from '@/features/auth/useCanonicalAuth';
import { useToast } from '@/hooks/use-toast';
import type { ThreadId, PostId } from '@shared/types/ids';
import { useMutation } from '@tanstack/react-query';

// Define a custom form schema instead of importing from shared/schema
const formSchema = z.object({
	content: z.string().min(1, 'Content is required')
});

type CreatePostFormProps = {
	threadId: ThreadId;
	replyToPostId?: PostId;
	onSuccess?: () => void;
};

export function CreatePostForm({ threadId, replyToPostId, onSuccess }: CreatePostFormProps) {
	const { toast } = useToast();
	const { user } = useCanonicalAuth();

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			content: ''
		}
	});

	const createPostMutation = useMutation({
		mutationFn: async (values: z.infer<typeof formSchema>) => {
			const postData = {
				...values,
				replyToPostId
			};
			// Updated apiRequest call
			return apiRequest<any>({
				method: 'POST',
				url: `/api/threads/${threadId}/posts`,
				data: postData
			});
		},
		onSuccess: (data) => {
			// Added data parameter
			toast({
				title: 'Reply posted',
				description: 'Your reply has been posted successfully.'
			});

			// Invalidate posts and thread queries
			queryClient.invalidateQueries({ queryKey: [`/api/threads/${threadId}/posts`] });
			queryClient.invalidateQueries({ queryKey: [`/api/threads/${threadId}`] });

			// Reset form
			form.reset();

			// Call onSuccess if provided
			if (onSuccess) {
				onSuccess();
			}
		},
		onError: (error) => {
			toast({
				title: 'Error',
				description: 'Failed to post reply. Please try again.',
				variant: 'destructive'
			});
		}
	});

	function onSubmit(values: z.infer<typeof formSchema>) {
		if (!user) {
			toast({
				title: 'Error',
				description: 'You must be logged in to post a reply.',
				variant: 'destructive'
			});
			return;
		}

		createPostMutation.mutate(values);
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
				<FormField
					control={form.control}
					name="content"
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<Textarea
									placeholder="Write your reply here..."
									className="min-h-[150px]"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<div className="flex justify-end">
					<Button type="submit" disabled={createPostMutation.isPending}>
						{createPostMutation.isPending ? 'Posting...' : 'Post Reply'}
					</Button>
				</div>
			</form>
		</Form>
	);
}

// Add default export
export default CreatePostForm;
