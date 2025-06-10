import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocation } from 'wouter';
import { useMutation, useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import RichTextEditor from '@/components/editor/rich-text-editor';
import { useAuth } from '@/hooks/use-auth.tsx';
import { usePrefixesByCategory } from '@/features/forum/hooks/useForumQueries'; // Assuming this path is correct or will be adjusted
import { PrefixBadge } from '@/components/forum/prefix-badge'; // Corrected path
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle
} from '@/components/ui/dialog';
import {
	Form,
	FormControl,
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TagInput } from '@/components/forum/tag-input'; // Corrected path and import style
import type { Tag } from '@/types/forum'; // Import the actual Tag type

// Define placeholder types for Prefix based on usage
interface Prefix {
	id: number | string;
	name: string; // Assuming PrefixBadge uses name, adjust if needed
	// other properties used by PrefixBadge...
}

// Define a type for the draft data for clarity
interface DraftData {
	id: number;
	title?: string;
	categoryId?: number;
	prefixId?: string; // Or number, ensure consistency
	content?: string;
	editorState?: any;
	// Add other draft fields if necessary
}

// Form schema with validation
const threadFormSchema = z.object({
	title: z
		.string()
		.min(3, {
			message: 'Title must be at least 3 characters.'
		})
		.max(255, {
			message: 'Title cannot be more than 255 characters.'
		}),
	categoryId: z.string().min(1, {
		message: 'Please select a category.'
	}),
	prefixId: z.string().optional(),
	content: z.string().min(10, {
		message: 'Content must be at least 10 characters.'
	}),
	editorState: z.any().optional(),
	tags: z.array(z.string()).max(10).optional()
});

type ThreadFormValues = z.infer<typeof threadFormSchema>;

interface CreateThreadFormProps {
	categoryId?: number;
	isOpen: boolean;
	onClose: () => void;
	onSuccess?: () => void;
}

export function CreateThreadForm({
	categoryId,
	isOpen,
	onClose,
	onSuccess
}: CreateThreadFormProps) {
	const { toast } = useToast();
	const [, navigate] = useLocation();
	const { user } = useAuth();
	const [editorContent, setEditorContent] = useState('');
	const [editorState, setEditorState] = useState(null);
	const [hasActiveDraft, setHasActiveDraft] = useState(false);
	const [draftId, setDraftId] = useState<number | null>(null);
	const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>(categoryId);
	const queryClient = useQueryClient();

	// Get categories for the select dropdown
	const { data: categories, isLoading: loadingCategories } = useQuery({
		queryKey: ['/api/categories'],
		queryFn: () => apiRequest<any>({ method: 'GET', url: '/api/categories' }), // Updated
		enabled: isOpen
	});

	// Get thread prefixes based on selected category
	const { data: prefixes, isLoading: loadingPrefixes } = usePrefixesByCategory(selectedCategoryId);

	// Get feature permissions for the current user
	const { data: featurePermissions, isLoading: loadingPermissions } = useQuery({
		queryKey: ['/api/threads/permissions'],
		queryFn: () => apiRequest<any>({ method: 'GET', url: '/api/threads/permissions' }), // Updated
		enabled: isOpen && !!user
	});

	const queryOptions: UseQueryOptions<
		DraftData, // TQueryFnData
		Error, // TError
		DraftData, // TData
		[string, { categoryId: string | undefined }] // TQueryKey
	> = {
		queryKey: ['/api/threads/drafts', { categoryId: categoryId?.toString() }],
		queryFn: async () => {
			const currentCategoryId = categoryId?.toString();
			const queryParams: { categoryId?: string } = {};
			if (currentCategoryId) {
				queryParams.categoryId = currentCategoryId;
			}
			return apiRequest<DraftData>({
				method: 'GET',
				url: '/api/threads/drafts',
				params: queryParams
			});
		},
		enabled: isOpen && !!categoryId && !!user
	};

	const {
		// Ensure draftData and isDraftLoadSuccess are destructured
		data: draftData,
		isLoading: loadingDraft,
		isSuccess: isDraftLoadSuccess
	} = useQuery(queryOptions);

	const form = useForm<ThreadFormValues>({
		// Moved form declaration before titleValue
		resolver: zodResolver(threadFormSchema),
		defaultValues: {
			title: '',
			categoryId: categoryId ? categoryId.toString() : '',
			prefixId: '',
			content: '',
			tags: []
		}
	});

	const titleValue = form.watch('title'); // Watch title for debouncedSaveDraft dependency - MOVED HERE

	useEffect(() => {
		if (categoryId) {
			form.setValue('categoryId', categoryId.toString());
			setSelectedCategoryId(categoryId);
		}
	}, [categoryId, form]);

	const userCanCreateThread = true;

	const saveDraftMutation = useMutation({
		mutationFn: async (values: ThreadFormValues & { draftId?: number }) => {
			const endpoint = values.draftId
				? `/api/threads/drafts/${values.draftId}`
				: '/api/threads/drafts';
			const method = values.draftId ? 'PUT' : 'POST';

			return apiRequest<any>({
				// Updated
				method,
				url: endpoint,
				data: {
					...values,
					categoryId: parseInt(values.categoryId),
					prefixId:
						values.prefixId && values.prefixId.trim() !== '' ? parseInt(values.prefixId) : undefined
				}
			});
		},
		onSuccess: (data) => {
			if (data && data.id && !draftId) {
				setDraftId(data.id);
				setHasActiveDraft(true);
			}
			toast({
				title: 'Draft saved',
				description: 'Your thread draft has been saved.'
			});
		},
		onError: (error: Error) => {
			toast({
				title: 'Error',
				description: `Failed to save draft: ${error.message}`,
				variant: 'destructive'
			});
		}
	});

	const createThreadMutation = useMutation({
		mutationFn: async (values: ThreadFormValues) => {
			return apiRequest<any>({
				// Updated
				method: 'POST',
				url: '/api/threads/create',
				data: {
					...values,
					categoryId: parseInt(values.categoryId),
					prefixId:
						values.prefixId && values.prefixId.trim() !== '' ? parseInt(values.prefixId) : undefined
				}
			});
		},
		onSuccess: (data) => {
			if (draftId) {
				apiRequest<any>({ method: 'PUT', url: `/api/threads/drafts/${draftId}/publish`, data: {} }); // Updated
			}
			queryClient.invalidateQueries({ queryKey: ['/api/threads'] });
			queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
			toast({
				title: 'Success',
				description: 'Thread created successfully'
			});
			if (onSuccess) {
				onSuccess();
			} else if (data && data.slug) {
				navigate(`/threads/${data.slug}`); // Corrected path
			}
			onClose();
		},
		onError: (error: Error) => {
			toast({
				title: 'Error',
				description: error.message || 'Failed to create thread', // Added fallback error message
				variant: 'destructive'
			});
		}
	});

	const handleSaveDraft = useCallback(
		(html: string, json: any) => {
			if (!form.getValues('title') && !html) return; // Don't save if title and content are empty
			const currentValues = form.getValues();
			saveDraftMutation.mutate({
				...currentValues,
				content: html,
				editorState: json,
				draftId: draftId ?? undefined
			});
		},
		[form, saveDraftMutation, draftId]
	);

	const onSubmit = (values: ThreadFormValues) => {
		if (!user) {
			toast({
				title: 'Authentication Error',
				description: 'You must be logged in to create a thread.',
				variant: 'destructive'
			});
			return;
		}
		if (!userCanCreateThread) {
			toast({
				title: 'Permission Denied',
				description: 'You do not have permission to create a thread in this category.',
				variant: 'destructive'
			});
			return;
		}
		createThreadMutation.mutate(values);
	};

	const handleEditorChange = (html: string, json: any) => {
		setEditorContent(html);
		setEditorState(json);
		form.setValue('content', html, { shouldValidate: true });
		form.setValue('editorState', json);
	};

	const handleCategoryChange = (value: string) => {
		setSelectedCategoryId(parseInt(value));
		form.setValue('categoryId', value);
		form.setValue('prefixId', ''); // Reset prefix when category changes
	};

	const debouncedSaveDraft = useCallback(
		debounce(handleSaveDraft, 3000), // Save draft every 3 seconds
		[handleSaveDraft]
	);

	useEffect(() => {
		if (editorContent || titleValue) {
			// Trigger debounce only if there's content or title
			debouncedSaveDraft(editorContent, editorState);
		}
		return () => {
			debouncedSaveDraft.cancel();
		};
	}, [editorContent, editorState, titleValue, debouncedSaveDraft]);

	// useEffect to handle draft data loading success
	useEffect(() => {
		if (isDraftLoadSuccess && draftData) {
			if (draftData.id) {
				setHasActiveDraft(true);
				setDraftId(draftData.id);

				if (draftData.title) {
					form.setValue('title', draftData.title);
				}
				if (draftData.categoryId) {
					form.setValue('categoryId', draftData.categoryId.toString());
					setSelectedCategoryId(draftData.categoryId);
				}
				if (draftData.prefixId !== null && draftData.prefixId !== undefined) {
					form.setValue('prefixId', String(draftData.prefixId));
				}
				if (draftData.content) {
					form.setValue('content', draftData.content);
					setEditorContent(draftData.content);
				}
				if (draftData.editorState) {
					setEditorState(draftData.editorState);
				}
			}
		}
	}, [isDraftLoadSuccess, draftData, form]); // Dependencies for the effect

	if (!isOpen) return null;

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="sm:max-w-[600px] md:max-w-[800px] lg:max-w-[1000px]">
				<DialogHeader>
					<DialogTitle>{hasActiveDraft ? 'Edit Draft' : 'Create New Thread'}</DialogTitle>
					<DialogDescription>
						{hasActiveDraft
							? 'Continue editing your saved draft or start fresh.'
							: 'Fill in the details below to start a new discussion.'}
					</DialogDescription>
				</DialogHeader>
				{loadingPermissions && <Loader2 className="h-8 w-8 animate-spin text-center" />}

				{!loadingPermissions && !userCanCreateThread && (
					<Alert variant="destructive">
						<AlertDescription>
							You do not have permission to create threads in this category. Please contact an
							administrator if you believe this is an error.
						</AlertDescription>
					</Alert>
				)}

				{!loadingPermissions && userCanCreateThread && (
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
							<FormField
								control={form.control}
								name="title"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Title</FormLabel>
										<FormControl>
											<Input placeholder="Enter thread title" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name="categoryId"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Category (Topic)</FormLabel>
											<Select
												onValueChange={(value) => {
													field.onChange(value);
													handleCategoryChange(value);
												}}
												value={field.value}
												disabled={loadingCategories || !!categoryId} // Disable if categoryId prop is passed
											>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder="Select a topic to post in" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													{loadingCategories && (
														<SelectItem value="loading" disabled>
															Loading categories...
														</SelectItem>
													)}
													{categories?.map(
														(
															cat: any // TODO: Type categories properly
														) => (
															<React.Fragment key={cat.id}>
																<SelectItem
																	value={cat.id.toString()}
																	className="font-bold"
																	disabled
																>
																	{cat.name} (Forum)
																</SelectItem>
																{cat.children?.map(
																	(
																		topic: any // TODO: Type topics properly
																	) => (
																		<SelectItem
																			key={topic.id}
																			value={topic.id.toString()}
																			className="ml-4"
																		>
																			{topic.name}
																		</SelectItem>
																	)
																)}
															</React.Fragment>
														)
													)}
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="prefixId"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Prefix (Optional)</FormLabel>
											<Select
												onValueChange={field.onChange}
												value={field.value}
												disabled={loadingPrefixes || !selectedCategoryId}
											>
												<FormControl>
													<SelectTrigger>
														{field.value &&
														Array.isArray(prefixes) &&
														(prefixes as Prefix[]).find(
															(p: Prefix) => p.id.toString() === field.value
														) ? (
															<PrefixBadge
																prefix={(prefixes as Prefix[]).find(
																	(p: Prefix) => p.id.toString() === field.value
																)}
															/>
														) : (
															<SelectValue placeholder="Select a prefix" />
														)}
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													{loadingPrefixes && (
														<SelectItem value="loading" disabled>
															Loading prefixes...
														</SelectItem>
													)}
													<SelectItem value="">No Prefix</SelectItem>
													{Array.isArray(prefixes) &&
														(prefixes as Prefix[]).map((prefix: Prefix) => (
															<SelectItem key={prefix.id.toString()} value={prefix.id.toString()}>
																<PrefixBadge prefix={prefix} />
															</SelectItem>
														))}
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<FormField
								control={form.control}
								name="tags"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Tags</FormLabel>
										<FormControl>
											<TagInput
												value={(field.value || []).map(
													(tagName): Tag => ({
														name: tagName,
														id: 0, // Placeholder ID for new/unresolved tags
														slug: tagName.toLowerCase().replace(/\s+/g, '-') // Placeholder slug
													})
												)}
												onChange={(tagsFromInput: Tag[]) =>
													field.onChange(tagsFromInput.map((tag) => tag.name))
												}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="content"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Content</FormLabel>
										<FormControl>
											<RichTextEditor
												content={editorContent}
												onChange={handleEditorChange}
												readOnly={createThreadMutation.isPending}
												// initialEditorState={editorState}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<DialogFooter className="gap-2 sm:justify-end">
								<Button
									type="button"
									variant="outline"
									onClick={onClose}
									disabled={createThreadMutation.isPending}
								>
									Cancel
								</Button>
								<Button
									type="button"
									variant="ghost"
									onClick={() => handleSaveDraft(editorContent, editorState)}
									disabled={saveDraftMutation.isPending || createThreadMutation.isPending}
								>
									{saveDraftMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
									Save Draft
								</Button>
								<Button
									type="submit"
									disabled={createThreadMutation.isPending || saveDraftMutation.isPending}
								>
									{(createThreadMutation.isPending || saveDraftMutation.isPending) && (
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									)}
									{hasActiveDraft ? 'Update & Publish' : 'Create Thread'}
								</Button>
							</DialogFooter>
						</form>
					</Form>
				)}
			</DialogContent>
		</Dialog>
	);
}

// Add default export
export default CreateThreadForm;

// Basic debounce function moved outside the component
function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
	let timeout: ReturnType<typeof setTimeout> | null = null;

	const debounced = (...args: Parameters<F>) => {
		if (timeout !== null) {
			clearTimeout(timeout);
			timeout = null;
		}
		timeout = setTimeout(() => func(...args), waitFor);
	};

	debounced.cancel = () => {
		if (timeout !== null) {
			clearTimeout(timeout);
			timeout = null;
		}
	};

	return debounced;
}
