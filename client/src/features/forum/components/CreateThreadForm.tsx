import React from 'react';
// Explicitly import hooks, though the combined import should work.
// This is to try and resolve the "Cannot find name" errors.
import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocation } from 'wouter';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import RichTextEditor from '@/components/editor/rich-text-editor';
import { useAuth } from '@/hooks/use-auth';
import { usePrefixes, useCreateThread } from '@/features/forum/hooks/useForumQueries';
import type { CreateThreadParams } from '@/features/forum/hooks/useForumQueries';
import { PrefixBadge } from '@/components/forum/prefix-badge';
import { useDraft } from '@/hooks/use-draft';
import { Clock, Save } from 'lucide-react';
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
	SelectGroup,
	SelectLabel,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TagInput } from '@/components/forum/tag-input';
import type { Tag, ThreadPrefix as Prefix } from '@/types/forum';
import { useForumStructure } from '@/contexts/ForumStructureContext';
import type { MergedRules } from '@/contexts/ForumStructureContext';
import { usePermission } from '@/hooks/usePermission';
import type { DraftId } from '@shared/types/ids';

interface DraftData {
	id: DraftId;
	title?: string;
	forumSlug?: string;
	prefixId?: string;
	content?: string;
	editorState?: Record<string, unknown>;
	tags?: string[];
}

const threadFormSchema = z.object({
	title: z
		.string()
		.min(3, { message: 'Title must be at least 3 characters.' })
		.max(255, { message: 'Title cannot be more than 255 characters.' }),
	forumSlug: z.string().min(1, { message: 'Please select a forum.' }),
	prefixId: z.string().optional(),
	content: z.string().min(10, { message: 'Content must be at least 10 characters.' }),
	editorState: z.record(z.unknown()).optional(),
	tags: z.array(z.string()).max(10).optional()
});

type ThreadFormValues = z.infer<typeof threadFormSchema>;

interface CreateThreadFormProps {
	forumSlug?: string;
	forumRules?: MergedRules;
	isForumLocked?: boolean;
	forumName?: string;
	isOpen?: boolean;
	onClose?: () => void;
	onSuccess?: (newThreadSlug: string) => void;
}

export function CreateThreadForm({
	forumSlug: passedForumSlug,
	forumRules: passedForumRules,
	isForumLocked: passedIsForumLocked,
	forumName: passedForumName,
	isOpen = true,
	onClose,
	onSuccess
}: CreateThreadFormProps) {
	const { toast } = useToast();
	const [, navigate] = useLocation();
	const { user } = useAuth();
	const [editorContent, setEditorContent] = useState('');
	const [editorState, setEditorState] = useState<Record<string, unknown> | null>(null);
	const [hasActiveDraft, setHasActiveDraft] = useState(false);
	const [draftId, setDraftId] = useState<number | null>(null);
	const [selectedForumSlugState, setSelectedForumSlugState] = useState<string | undefined>(
		passedForumSlug
	);
	const queryClient = useQueryClient();

	// Initialize form
	const form = useForm<ThreadFormValues>({
		resolver: zodResolver(threadFormSchema),
		defaultValues: {
			title: '',
			forumSlug: passedForumSlug || '',
			prefixId: '',
			content: '',
			tags: []
		}
	});

	const [targetForumConfig, setTargetForumConfig] = useState<Record<string, unknown> | undefined>(
		undefined
	); // Merged forum data from context
	const [formDisabledReason, setFormDisabledReason] = useState<string | null>(null);

	const { zones, getForum } = useForumStructure();

	const activeForumSlug = passedForumSlug || selectedForumSlugState;
	const activeForumData = activeForumSlug ? getForum(activeForumSlug) : undefined;
	const categoryIdForPrefixes = activeForumData ? activeForumData.id : undefined;
	const { data: prefixes, isLoading: loadingPrefixes } = usePrefixes({
		categoryId: categoryIdForPrefixes
	});

	const { canPost, reason: permissionReason } = usePermission(activeForumData);

	useEffect(() => {
		if (permissionReason) {
			setFormDisabledReason(permissionReason);
		} else {
			setFormDisabledReason(null);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [permissionReason]);

	useEffect(() => {
		// This effect primarily sets the disabled reason based on PROPS when a forum is PASSED IN
		if (passedForumSlug) {
			setSelectedForumSlugState(passedForumSlug); // Ensure internal state matches prop
			if (passedIsForumLocked) {
				setFormDisabledReason(
					`Posting is disabled in "${passedForumName || passedForumSlug}" because it is locked.`
				);
			} else if (passedForumRules && !passedForumRules.allowPosting) {
				setFormDisabledReason(
					`Posting is disabled in "${passedForumName || passedForumSlug}" by its rules.`
				);
			} else {
				setFormDisabledReason(null);
			}
			// Also, find the static config for the passed forum slug to populate targetForumConfig
			// This is mainly for consistency if other parts of the form rely on targetForumConfig
			const staticForum = passedForumSlug ? getForum(passedForumSlug) : undefined;
			setTargetForumConfig(staticForum);
		} else {
			// If no forum is passed, reset disabled reason; it will be set by the forum selector logic below
			setFormDisabledReason(null);
			setTargetForumConfig(undefined);
		}
	}, [passedForumSlug, passedForumRules, passedIsForumLocked, passedForumName]);

	useEffect(() => {
		// This effect updates targetForumConfig and disabledReason when the USER SELECTS a new forum from the dropdown
		// (i.e., when passedForumSlug is initially undefined, and selectedForumSlugState changes)
		if (!passedForumSlug && selectedForumSlugState) {
			const foundForum = selectedForumSlugState ? getForum(selectedForumSlugState) : undefined;
			setTargetForumConfig(foundForum);
			if (foundForum) {
				// For user-selected forums, rules come from static config, as MergedForum isn't available here directly
				if (!foundForum.rules.allowPosting) {
					setFormDisabledReason(`Posting is disabled in "${foundForum.name}" by its rules.`);
				} else {
					setFormDisabledReason(null);
				}
			} else {
				setFormDisabledReason('Invalid forum selected.');
			}
		}
	}, [selectedForumSlugState, passedForumSlug]); // Dependencies ensure this runs when selection changes

	const {
		data: draftData,
		isLoading: loadingDraft,
		isSuccess: isDraftLoadSuccess
	} = useQuery<DraftData>({
		queryKey: ['threadDraft', { forumSlug: activeForumSlug }],
		queryFn: async () => {
			if (!activeForumSlug) return Promise.reject('No forum selected for draft.');
			return apiRequest<DraftData>({
				method: 'GET',
				url: '/api/threads/drafts',
				params: { forumSlug: activeForumSlug }
			});
		},
		enabled: isOpen && !!activeForumSlug && !!user
	});

	const saveDraftMutation = useMutation({
		mutationFn: async (
			values: ThreadFormValues & { draftId?: DraftId; forumSlugToSave: string }
		) => {
			const endpoint = values.draftId
				? `/api/threads/drafts/${values.draftId}`
				: '/api/threads/drafts';
			const method = values.draftId ? 'PUT' : 'POST';
			return apiRequest<DraftData>({
				method,
				url: endpoint,
				data: {
					title: values.title,
					content: values.content,
					editorState: values.editorState,
					forumSlug: values.forumSlugToSave,
					prefixId:
						values.prefixId && values.prefixId.trim() !== '' && values.prefixId !== 'none'
							? values.prefixId
							: undefined,
					tags: values.tags
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

	const createThreadMutation = useCreateThread();

	// Draft management
	const { draft, updateDraft, clearDraft, isDirty, isSaving, lastSaved, hasDraft } = useDraft({
		key: `thread-${activeForumSlug || 'default'}`,
		autoSaveInterval: 30000, // 30 seconds
		enableCloudSync: true,
		onAutoSave: () => {
			toast({
				title: 'Draft saved',
				description: 'Your work has been automatically saved.',
				variant: 'default'
			});
		}
	});

	useEffect(() => {
		if (isDraftLoadSuccess && draftData && draftData.id) {
			setHasActiveDraft(true);
			setDraftId(draftData.id);
			form.reset({
				title: draftData.title || '',
				forumSlug: draftData.forumSlug || passedForumSlug || '',
				prefixId: draftData.prefixId || '',
				content: draftData.content || '',
				tags: draftData.tags || [],
				editorState: draftData.editorState
			});
			if (draftData.content) setEditorContent(draftData.content);
			if (draftData.editorState) setEditorState(draftData.editorState);
			if (draftData.forumSlug) setSelectedForumSlugState(draftData.forumSlug);
		}
	}, [isDraftLoadSuccess, draftData, form, passedForumSlug]);

	const handleSaveDraft = useCallback(
		(html: string, jsonState: Record<string, unknown>) => {
			const currentValues = form.getValues();
			if (!currentValues.title && !html) return;
			if (!currentValues.forumSlug) {
				toast({
					title: 'Cannot Save Draft',
					description: 'Please select a forum first.',
					variant: 'destructive'
				});
				return;
			}
			saveDraftMutation.mutate({
				...currentValues,
				content: html,
				editorState: jsonState,
				draftId: draftId ?? undefined,
				forumSlugToSave: currentValues.forumSlug
			});
		},
		[form, saveDraftMutation, draftId, toast]
	);

	const onSubmit = (values: ThreadFormValues) => {
		if (!user) {
			toast({
				title: 'Authentication Error',
				description: 'You must be logged in.',
				variant: 'destructive'
			});
			return;
		}
		// Use props for rule check if a forum was passed in.
		// Otherwise, rely on the internal targetForumConfig derived from user selection.
		let canPost = true;
		let reason = formDisabledReason;

		if (passedForumSlug) {
			if (passedIsForumLocked) {
				canPost = false;
				reason = `Posting is disabled in "${passedForumName || passedForumSlug}" because it is locked.`;
			} else if (passedForumRules && !passedForumRules.allowPosting) {
				canPost = false;
				reason = `Posting is disabled in "${passedForumName || passedForumSlug}" by its rules.`;
			}
		} else if (targetForumConfig) {
			// User selected a forum from dropdown
			if (!targetForumConfig.rules.allowPosting) {
				canPost = false;
				reason = `Posting is disabled in "${targetForumConfig.name}" by its rules.`;
			}
		} else if (!values.forumSlug) {
			// No forum selected at all
			canPost = false;
			reason = 'Please select a forum to post in.';
		}

		if (!canPost) {
			toast({
				title: 'Permission Denied',
				description: reason || 'Posting is disabled in this forum.',
				variant: 'destructive'
			});
			return;
		}

		if (!activeForumData || activeForumData.id <= 0) {
			toast({
				title: 'Error',
				description: 'Unable to determine target forum. Please try again.',
				variant: 'destructive'
			});
			return;
		}

		const newThreadPayload: CreateThreadParams = {
			title: values.title,
			content: values.content,
			categoryId: activeForumData.id,
			forumSlug: activeForumData.slug,
			prefixId:
				values.prefixId && values.prefixId.trim() !== '' && values.prefixId !== 'none'
					? values.prefixId
					: undefined,
			tags: values.tags,
			editorState: values.editorState
		};

		createThreadMutation.mutate(newThreadPayload, {
			onSuccess: (data) => {
				if (draftId) {
					apiRequest<any>({ method: 'DELETE', url: `/api/threads/drafts/${draftId}` });
				}
				queryClient.invalidateQueries({
					queryKey: ['/api/threads', { forumSlug: values.forumSlug }]
				});
				queryClient.invalidateQueries({ queryKey: ['/api/threads'] });
				queryClient.invalidateQueries({ queryKey: ['forumCategoriesTree'] });
				queryClient.invalidateQueries({ queryKey: ['/api/categories', 'with-stats'] });
				toast({ title: 'Success', description: 'Thread created successfully' });
				if (onSuccess) {
					onSuccess(data.slug);
				} else if (data && data.slug) {
					navigate(`/threads/${data.slug}`);
				}
				if (onClose) onClose();
			}
		});
	};

	const handleEditorChange = (html: string, jsonState: Record<string, unknown>) => {
		setEditorContent(html);
		setEditorState(jsonState);
		form.setValue('content', html, { shouldValidate: true });
		form.setValue('editorState', jsonState);
	};

	const handleForumChange = (value: string) => {
		form.setValue('forumSlug', value, { shouldValidate: true });
		form.setValue('prefixId', '');
		setSelectedForumSlugState(value);
	};

	const debouncedSaveDraft = useCallback(debounce(handleSaveDraft, 3000), [handleSaveDraft]);

	useEffect(() => {
		if (editorContent || form.getValues('title')) {
			debouncedSaveDraft(editorContent, editorState);
		}
		return () => {
			debouncedSaveDraft.cancel();
		};
	}, [editorContent, editorState, form, debouncedSaveDraft]);

	if (!isOpen && onClose) return null;

	const renderFormContent = () => (
		<Form {...form}>
			{/* Draft Status Indicator */}
			{(hasDraft || lastSaved || isSaving) && (
				<div className="flex items-center gap-2 text-sm text-zinc-400 pb-4 border-b border-zinc-800">
					{isSaving ? (
						<>
							<Save className="h-4 w-4 animate-pulse" />
							<span>Saving draft...</span>
						</>
					) : lastSaved ? (
						<>
							<Clock className="h-4 w-4" />
							<span>Draft saved {lastSaved.toLocaleTimeString()}</span>
						</>
					) : null}

					{hasDraft && (
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onClick={() => {
								form.setValue('title', draft.title || '');
								if (draft.prefixId) {
									form.setValue('prefixId', draft.prefixId);
								}
								toast({
									title: 'Draft restored',
									description: 'Your previous work has been restored.',
									variant: 'default'
								});
							}}
							className="ml-auto"
						>
							Restore Draft
						</Button>
					)}
				</div>
			)}

			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
				<FormField
					control={form.control}
					name="title"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Title</FormLabel>
							<FormControl>
								<Input
									placeholder="Enter thread title"
									{...field}
									disabled={!!formDisabledReason || createThreadMutation.isPending}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<FormField
						control={form.control}
						name="forumSlug"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Forum</FormLabel>
								<Select
									onValueChange={handleForumChange}
									value={field.value}
									disabled={
										!!passedForumSlug || !!formDisabledReason || createThreadMutation.isPending
									}
								>
									<FormControl>
										<SelectTrigger>
											<SelectValue placeholder="Select a forum to post in" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										{/* If a forumSlug is passed, it's pre-selected and disabled */}
										{passedForumSlug && passedForumName ? (
											<SelectItem value={passedForumSlug} disabled={true}>
												{passedForumName}
											</SelectItem>
										) : (
											// If no forumSlug is passed, populate dropdown from merged zones (includes DB IDs)
											zones.map((zone) => (
												<SelectGroup key={zone.slug}>
													<SelectLabel>
														{zone.name} ({zone.type})
													</SelectLabel>
													{zone.forums.map((forumItem) => (
														<SelectItem
															key={forumItem.slug}
															value={forumItem.slug}
															disabled={!forumItem.rules.allowPosting}
														>
															{forumItem.name}{' '}
															{!forumItem.rules.allowPosting && '(Posting Disabled)'}
														</SelectItem>
													))}
												</SelectGroup>
											))
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
									disabled={
										loadingPrefixes ||
										!activeForumData?.id ||
										!!formDisabledReason ||
										createThreadMutation.isPending
									}
								>
									<FormControl>
										<SelectTrigger>
											{field.value &&
											Array.isArray(prefixes) &&
											prefixes.find((p) => p.id.toString() === field.value) ? (
												<PrefixBadge
													prefix={prefixes.find((p) => p.id.toString() === field.value)!}
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
										<SelectItem value="none">No Prefix</SelectItem>
										{Array.isArray(prefixes) &&
											prefixes.map((prefix: Prefix) => (
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
							<FormLabel>Tags (Max 10)</FormLabel>
							<FormControl>
								<TagInput
									value={(field.value || []).map((tagName) => ({
										name: tagName,
										id: crypto.randomUUID(),
										slug: tagName.toLowerCase().replace(/\s+/g, '-')
									}))}
									onChange={(tagsFromInput: Tag[]) =>
										field.onChange(tagsFromInput.map((tag) => tag.name))
									}
									// The TagInput itself doesn't take a general disabled prop.
									// Its internal input is disabled if maxTags is reached.
									// General form disabling is handled by disabling the submit button and other fields.
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
									readOnly={!!formDisabledReason || createThreadMutation.isPending}
									// initialEditorState is not a prop. Editor is initialized via `content` prop.
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				{formDisabledReason && (
					<Alert variant="destructive">
						<AlertTriangle className="h-4 w-4" />
						<AlertDescription>{formDisabledReason}</AlertDescription>
					</Alert>
				)}
				<DialogFooter className="gap-2 sm:justify-end pt-4">
					{onClose && (
						<Button
							type="button"
							variant="outline"
							onClick={onClose}
							disabled={createThreadMutation.isPending || saveDraftMutation.isPending}
						>
							Cancel
						</Button>
					)}
					<Button
						type="button"
						variant="ghost"
						onClick={() => handleSaveDraft(editorContent, editorState)}
						disabled={
							!!formDisabledReason || saveDraftMutation.isPending || createThreadMutation.isPending
						}
					>
						{saveDraftMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
						Save Draft
					</Button>
					<Button
						type="submit"
						disabled={
							!!formDisabledReason || createThreadMutation.isPending || saveDraftMutation.isPending
						}
					>
						{(createThreadMutation.isPending || saveDraftMutation.isPending) && (
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						)}
						{hasActiveDraft ? 'Update & Publish' : 'Create Thread'}
					</Button>
				</DialogFooter>
			</form>
		</Form>
	);

	// Block entire UI if user lacks permission. (Placed after all hooks to preserve hook order.)
	if (!canPost) {
		return (
			<Alert variant="destructive" className="my-6">
				<AlertTriangle className="w-4 h-4 mr-2" />
				<AlertDescription>
					{permissionReason ?? 'You do not have permission to post in this forum.'}
				</AlertDescription>
			</Alert>
		);
	}

	if (!onClose) {
		return renderFormContent();
	}

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose && onClose()}>
			<DialogContent className="sm:max-w-[600px] md:max-w-[800px] lg:max-w-[1000px]">
				<DialogHeader>
					<DialogTitle>
						{hasActiveDraft ? 'Edit Draft' : 'Create New Thread'}{' '}
						{passedForumName
							? `in ${passedForumName}`
							: targetForumConfig
								? `in ${targetForumConfig.name}`
								: ''}
					</DialogTitle>
					<DialogDescription>
						{hasActiveDraft
							? 'Continue editing your saved draft or start fresh.'
							: 'Fill in the details below to start a new discussion.'}
					</DialogDescription>
				</DialogHeader>
				{renderFormContent()}
			</DialogContent>
		</Dialog>
	);
}

export default CreateThreadForm;

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
