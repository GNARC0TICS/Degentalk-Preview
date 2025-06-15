import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import forumApi from '@/features/forum/services/forumApi';
import ThreadCard from '@/components/forum/ThreadCard'; // Corrected import path
import PostCard from '@/features/forum/components/PostCard';
import ReplyForm from '@/features/forum/components/ReplyForm';
import { Button } from '@/components/ui/button';
import { useForumStructure } from '@/contexts/ForumStructureContext'; // Import useForumStructure
import type { MergedForum, MergedZone } from '@/contexts/ForumStructureContext'; // Import context types
import { LoadingSpinner } from '@/components/ui/loader';
import NotFoundPage from '@/pages/not-found';
import { Pagination } from '@/components/ui/pagination';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, CornerUpRight, MessageSquare, Home, ChevronRight, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useThreadZone } from '@/hooks/useThreadZone'; // Import useThreadZone
import { BookmarkButton } from '@/components/ui/bookmark-button';
import LikeButton from '@/features/forum/components/LikeButton';
import ShareButton from '@/components/forum/ShareButton';
import { usePostUpdate } from '@/features/forum/hooks/useForumQueries';
import type { PostWithUser, ThreadWithPostsAndUser } from '@db_types/forum.types';
import { apiRequest } from '@/lib/queryClient'; // Added for like mutation
import { useToast } from '@/hooks/use-toast'; // Added for like mutation
// forumMap might still be used as a fallback or if context is loading, but primary source should be context
// import { forumMap } from '@/config/forumMap.config'; 
// import type { Forum, Zone } from '@/config/forumMap.config'; // Types will come from context
import {
	Breadcrumb,
	BreadcrumbList,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

const PAGE_SIZE = 20;

interface BreadcrumbItemType {
	label: React.ReactNode;
	href: string;
}

export default function ThreadPage() {
	const { user } = useAuth();
	const params = useParams();
	const thread_slug = params.thread_slug;
	const [page, setPage] = useState(1);
	const queryClient = useQueryClient();
	const { toast } = useToast(); // Added
	const postUpdateMutation = usePostUpdate();
	const [replyingToPost, setReplyingToPost] = useState<PostWithUser | null>(null);

	// States for parent forum and zone, typed with Merged types from context
	const [currentParentForum, setCurrentParentForum] = useState<MergedForum | undefined>(undefined);
	// parentZoneForThread will now come from useThreadZone
	// const [parentZoneForThread, setParentZoneForThread] = useState<MergedZone | undefined>(undefined); 
	const [forumConfigError, setForumConfigError] = useState<string | null>(null);
	
	// Corrected destructuring: ensure 'getForum' is consistently used.
	const { getForum, isLoading: isStructureLoading } = useForumStructure(); // getZoneByForumSlug is now part of useThreadZone

	const toggleLikeMutation = useMutation({
		mutationFn: async (data: { postId: number; liked: boolean }) => {
			return apiRequest({
				url: `/api/posts/${data.postId}/react`,
				method: 'POST',
				data: { type: 'like', active: data.liked },
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['thread', thread_slug] });
			// Potentially invalidate other queries if likes affect summaries elsewhere
		},
		onError: (error) => {
			const errorMessage = error instanceof Error ? error.message : 'Failed to update reaction';
			toast({
				title: 'Action Failed',
				description: errorMessage,
				variant: 'destructive',
			});
			// Optionally, implement logic to revert optimistic updates if any were made
		},
	});

	const handleToggleLike = (postId: number, currentIsLiked: boolean) => {
		if (!user) {
			toast({
				title: 'Login Required',
				description: 'Please sign in to like posts',
				variant: 'default',
				action: (
					<a href="/login" className="px-2 py-1 bg-zinc-800 rounded text-sm">
						Sign In
					</a>
				),
			});
			return;
		}
		toggleLikeMutation.mutate({ postId, liked: !currentIsLiked });
	};

	// Use the new useThreadZone hook
	const { 
		threadWithPosts, 
		zone: parentZoneForThread, // Renaming for clarity within this component
		isLoading, 
		error, 
		threadParentForumSlug 
	} = useThreadZone(thread_slug, { page, limit: PAGE_SIZE });

	useEffect(() => {
		if (threadParentForumSlug) {
			const forumFromContext = getForum(threadParentForumSlug);
			if (forumFromContext) {
				setCurrentParentForum(forumFromContext);
				setForumConfigError(null);
			} else {
				setForumConfigError(`Parent forum with slug '${threadParentForumSlug}' not found in ForumStructureContext.`);
				setCurrentParentForum(undefined);
			}
		} else if (threadWithPosts && !threadWithPosts.thread?.parentForumSlug && !isLoading) {
			setForumConfigError('Thread data is missing parentForumSlug.');
			setCurrentParentForum(undefined);
		} else if (!threadParentForumSlug && !isLoading) { // Handles case where threadWithPosts is null/undefined
			setCurrentParentForum(undefined);
			// forumConfigError might be set by useThreadZone if thread itself failed to load
		}
	}, [threadParentForumSlug, threadWithPosts, getForum, isLoading]);

	const solveMutation = useMutation({
		mutationFn: async (postId: number | null = null) => {
			if (typeof threadWithPosts?.thread?.id !== 'number') {
				// Or handle this error more gracefully
				throw new Error("Thread ID is missing or invalid."); 
			}
			return await forumApi.solveThread(threadWithPosts.thread.id, postId === null ? undefined : postId);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['thread', thread_slug] });
		},
	});

	const handlePostUpdate = async (postId: number, content: string, editorState?: any) => {
		await postUpdateMutation.mutateAsync({ postId, content, editorState });
	};

	const handleReplyToPost = (post: PostWithUser) => {
		setReplyingToPost(post);
		setTimeout(() => {
			const replyForm = document.getElementById('direct-reply-form');
			if (replyForm) {
				replyForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
			}
		}, 100);
	};

	const handleCancelReply = () => {
		setReplyingToPost(null);
	};
	
	const breadcrumbItems: BreadcrumbItemType[] = React.useMemo(() => {
		const items: BreadcrumbItemType[] = [{ label: <Home className="h-4 w-4" />, href: '/' }];
		if (parentZoneForThread) {
			items.push({ label: parentZoneForThread.name, href: `/zones/${parentZoneForThread.slug}` });
		}
		if (currentParentForum) {
			items.push({ label: currentParentForum.name, href: `/forums/${currentParentForum.slug}` });
		}
		if (threadWithPosts?.thread?.title) {
			items.push({ label: threadWithPosts.thread.title, href: `/threads/${thread_slug}` });
		}
		return items;
	}, [parentZoneForThread, currentParentForum, threadWithPosts, thread_slug]); 

	if (isLoading) { // Use isLoading from useThreadZone
		return (
			<div className="flex justify-center items-center min-h-[40vh]">
				<LoadingSpinner size="lg" text="Loading thread..." />
			</div>
		);
	}

	if (error || !threadWithPosts?.thread) { // Use error and threadWithPosts from useThreadZone
		// Consider showing error message from 'error' object
		return <NotFoundPage />;
	}

	const { thread, posts, pagination } = threadWithPosts;
	const forumRules = currentParentForum?.rules;
	const parentForumTheme = currentParentForum?.themeOverride;

	const isOP = user && user.id === thread.user?.id;
	const canPostReplies = forumRules?.allowPosting ?? false; 
	const isAdmin = !!(user && user.role === 'admin'); // Ensure boolean
	const isMod = !!(user && user.role === 'mod'); // Ensure boolean
	const canSolve = Boolean(isOP || isAdmin || isMod);

	const firstPost = posts?.[0];
	const replies = posts?.slice(1) || [];

	const handleMarkSolved = () => {
		if (firstPost && firstPost.id) {
			solveMutation.mutate(firstPost.id);
		}
	};

	const handleSubmitReply = async (content: string, editorState?: any) => {
		if (!forumRules?.allowPosting) {
			console.error("Replying is disabled for this forum according to config.");
			return;
		}
		try {
			await forumApi.createPost({
				threadId: thread.id,
				content,
				editorState,
				replyToPostId: replyingToPost?.id,
			});
			setReplyingToPost(null);
			queryClient.invalidateQueries({ queryKey: ['thread', thread_slug] });
		} catch (error) {
			console.error('Error creating post:', error);
		}
	};

	return (
		<div className="container max-w-3xl mx-auto py-6 md:py-8 px-2 md:px-4">
			<Breadcrumb className="mb-4 md:mb-6">
				<BreadcrumbList>
					{breadcrumbItems.map((item, index) => (
						<React.Fragment key={item.href || index}>
							<BreadcrumbItem>
								{index === breadcrumbItems.length - 1 ? (
									<BreadcrumbPage>{item.label}</BreadcrumbPage>
								) : (
									<BreadcrumbLink asChild>
										<Link href={item.href}>{item.label}</Link>
									</BreadcrumbLink>
								)}
							</BreadcrumbItem>
							{index < breadcrumbItems.length - 1 && <BreadcrumbSeparator />} 
						</React.Fragment>
					))}
				</BreadcrumbList>
			</Breadcrumb>

			{forumConfigError && (
				<div className="mb-4 p-3 bg-red-900/30 border border-red-700 text-red-300 rounded-md flex items-center">
					<AlertTriangle className="h-5 w-5 mr-2" />
					<p className="text-sm">{forumConfigError} Thread content is shown, but forum context (rules, theme) may be missing or default.</p>
				</div>
			)}

			{/* Thread Header */}
			<div className="mb-4 md:mb-6 flex flex-col gap-2">
				<ThreadCard
					thread={{
						id: thread.id,
						title: thread.title,
						slug: thread.slug,
						// userId: thread.userId, // Removed: userId is part of thread.user object
						// prefixId: thread.prefixId, // Removed: ThreadCardPropsData expects a 'prefix' object, not prefixId directly
						isSticky: thread.isSticky,
						isLocked: thread.isLocked,
						isHidden: thread.isHidden,
						viewCount: thread.viewCount,
						postCount: thread.postCount,
						firstPostLikeCount: thread.firstPostLikeCount,
						dgtStaked: thread.dgtStaked,
						hotScore: thread.hotScore,
						lastPostAt: thread.lastPostAt ? new Date(thread.lastPostAt).toISOString() : null,
						createdAt: new Date(thread.createdAt).toISOString(),
						updatedAt: thread.updatedAt ? new Date(thread.updatedAt).toISOString() : undefined,
						isSolved: thread.isSolved,
						solvingPostId: thread.solvingPostId,
						user: { // Map to ApiThreadUser
							id: thread.user.id,
							username: thread.user.username,
							avatarUrl: thread.user.avatarUrl,
							activeAvatarUrl: thread.user.activeAvatarUrl,
							role: thread.user.role,
						},
						category: { // Map to ApiThreadCategory
							id: thread.category.id,
							name: thread.category.name,
							slug: thread.category.slug,
						},
						tags: thread.tags || [],
						// canEdit and canDelete are not directly on ThreadWithUserAndCategory
						// They are usually determined dynamically or added for list views (ApiThread)
						// ThreadCard may not use them, or they need to be derived if used.
					}}
					forumSlug={currentParentForum?.slug || thread.parentForumSlug || ''}
					parentForumTheme={currentParentForum?.themeOverride?.color || null}
					tippingEnabled={currentParentForum?.rules?.tippingEnabled}
				/> 
				<div className="flex flex-wrap items-center gap-2 mt-2">
					<div className="flex items-center gap-2">
						<BookmarkButton
							threadId={thread.id}
							hasBookmarked={thread.hasBookmarked || false}
							size="md"
						/>
						<ShareButton
							threadId={thread.id}
							threadTitle={thread.title}
							variant="button"
							className="bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300"
							size="md"
						/>
						{thread.isSolved && (
							<Badge className="bg-emerald-700 text-white ml-1">
								<CheckCircle className="h-4 w-4 mr-1" />
								Solved
							</Badge>
						)}
					</div>
					{canSolve && !thread.isSolved && (
						<Button
							variant="outline"
							size="sm"
							className="ml-auto mt-1 md:mt-0"
							onClick={handleMarkSolved}
							disabled={solveMutation.isPending || !forumRules}
						>
							{solveMutation.isPending ? (
								<LoadingSpinner size="sm" className="mr-1" />
							) : (
								<CheckCircle className="h-4 w-4 mr-1" />
							)}
							Mark as Solved
						</Button>
					)}
				</div>
			</div>

			{thread.user?.signature && (
				<div className="mb-4 md:mb-6 p-3 bg-zinc-900/60 border-l-4 border-emerald-500 text-zinc-300 rounded">
					<div className="text-xs font-semibold mb-1">Signature</div>
					<div dangerouslySetInnerHTML={{ __html: thread.user.signature }} />
				</div>
			)}

			<div className="space-y-4 md:space-y-6">
				{firstPost && (
					<PostCard
						post={firstPost}
						isFirst={true}
						isEditable={user?.id === firstPost.userId || isAdmin || isMod}
						isThreadSolved={thread.isSolved}
						isSolution={thread.solvingPostId === firstPost.id}
						onLike={(postId, currentStatus) => handleToggleLike(postId, currentStatus)}
						onReply={canPostReplies ? () => handleReplyToPost(firstPost) : undefined}
						onEdit={user?.id === firstPost.userId ? () => console.log('Edit post', firstPost.id) : undefined} // Placeholder for actual edit logic
						onDelete={user?.id === firstPost.userId ? () => console.log('Delete post', firstPost.id) : undefined} // Placeholder
						onMarkAsSolution={canSolve && !thread.isSolved ? () => solveMutation.mutate(firstPost.id) : undefined}
						parentForumTheme={parentZoneForThread?.theme?.color || currentParentForum?.themeOverride?.color || null}
						tippingEnabled={currentParentForum?.rules?.tippingEnabled}
					/>
				)}
				{replies.map((reply: PostWithUser) => (
					<PostCard
						key={reply.id}
						post={reply}
						isFirst={false}
						isEditable={user?.id === reply.userId || isAdmin || isMod}
						isThreadSolved={thread.isSolved}
						isSolution={thread.solvingPostId === reply.id}
						onLike={(postId, currentStatus) => handleToggleLike(postId, currentStatus)}
						onReply={canPostReplies ? () => handleReplyToPost(reply) : undefined}
						onEdit={user?.id === reply.userId ? () => console.log('Edit post', reply.id) : undefined} // Placeholder
						onDelete={user?.id === reply.userId ? () => console.log('Delete post', reply.id) : undefined} // Placeholder
						onMarkAsSolution={canSolve && !thread.isSolved && thread.solvingPostId !== reply.id ? () => solveMutation.mutate(reply.id) : undefined}
						parentForumTheme={parentZoneForThread?.theme?.color || currentParentForum?.themeOverride?.color || null}
						tippingEnabled={currentParentForum?.rules?.tippingEnabled}
					/>
				))}
			</div>

			{pagination && pagination.totalPages > 1 && (
				<div className="my-6 md:my-8 flex justify-center">
					<Pagination
						currentPage={pagination.page}
						totalPages={pagination.totalPages}
						onPageChange={setPage}
					/>
				</div>
			)}

			{replyingToPost && canPostReplies && (
				<div id="direct-reply-form" className="mt-6">
					<ReplyForm
						threadId={thread.id}
						replyToId={replyingToPost.id}
						replyToPost={replyingToPost}
						onSubmit={handleSubmitReply}
						showRichEditor
						isReplying={true}
						onCancel={handleCancelReply}
						includeQuote={true}
					/>
				</div>
			)}

			{!replyingToPost && canPostReplies && (
				<div className="mt-6 md:mt-10">
					<div className="mb-2 text-sm font-medium flex items-center">
						<MessageSquare className="h-4 w-4 mr-1.5" />
						Leave a reply
					</div>
					<ReplyForm threadId={thread.id} onSubmit={handleSubmitReply} showRichEditor />
				</div>
			)}
			{!canPostReplies && !isLoading && ( // Use isLoading from useThreadZone
				<div className="mt-6 md:mt-10 p-4 bg-zinc-900/60 border border-zinc-800 rounded-md text-center">
					<p className="text-zinc-400">Replying is disabled in this forum.</p>
				</div>
			)}
		</div>
	);
}
