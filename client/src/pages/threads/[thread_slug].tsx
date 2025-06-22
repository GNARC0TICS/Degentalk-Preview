import React, { useMemo } from 'react';
import { useRoute } from 'wouter';
import { AlertCircle, ArrowDownCircle } from 'lucide-react';
import { useThread, usePosts } from '@/features/forum/hooks/useForumQueries';
import PostCard from '@/features/forum/components/PostCard';
import { SiteFooter } from '@/components/footer';
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { Skeleton } from '@/components/ui/skeleton';
import { Wide } from '@/layout/primitives';

import type { PostWithUser, ThreadWithPostsAndUser } from '@db_types/forum.types';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { ReplyForm } from '@/features/forum/components/ReplyForm';
import { EditPostDialog } from '@/features/forum/components/EditPostDialog';
import { ReportPostDialog } from '@/features/forum/components/ReportPostDialog';
import {
	useLikePost,
	useUnlikePost,
	useCreatePost,
	useDeletePost,
	useSolveThread,
	useTipPost
} from '@/features/forum/hooks/useForumQueries';
import { toast } from 'sonner';

export default function ThreadPage() {
	// Get slug param from route
	const [match, params] = useRoute<{ thread_slug: string }>('/threads/:thread_slug');
	const slug = params?.thread_slug;

	// Fetch thread meta & posts
	const { data: threadData, isLoading: isThreadLoading, isError: isThreadError } = useThread(slug);

	const thread = threadData?.thread as ThreadWithPostsAndUser['thread'] | undefined;

	const {
		data: postResponse,
		isLoading: isPostsLoading,
		isError: isPostsError
	} = usePosts(thread?.id);

	// Flatten posts if pagination returns pages/arrays
	const posts: PostWithUser[] = useMemo(() => {
		if (postResponse && Array.isArray(postResponse.posts)) {
			return postResponse.posts;
		}
		if (threadData?.posts) return threadData.posts;
		return [];
	}, [postResponse, threadData]);

	// Auth context
	const { user: currentUser } = useAuth();

	// ----- Mutations -----
	const likePost = useLikePost();
	const unlikePost = useUnlikePost();
	const createPost = useCreatePost();
	const deletePost = useDeletePost();
	const solveThread = useSolveThread();
	const tipPost = useTipPost();

	// ----- Local State -----
	const [replyToPost, setReplyToPost] = React.useState<PostWithUser | null>(null);
	const [editingPost, setEditingPost] = React.useState<PostWithUser | null>(null);
	const [reportingPost, setReportingPost] = React.useState<PostWithUser | null>(null);

	// Handlers
	const handleLike = React.useCallback(
		(postId: number, hasLiked: boolean) => {
			if (hasLiked) {
				unlikePost.mutate(postId);
			} else {
				likePost.mutate(postId);
			}
		},
		[likePost, unlikePost]
	);

	const handleReply = (postId: number) => {
		const post = posts.find((p) => p.id === postId) || null;
		setReplyToPost(post);
		// Scroll to reply form after short delay to ensure it is in DOM
		setTimeout(() => {
			const replyFormElem = document.getElementById('reply-form');
			replyFormElem?.scrollIntoView({ behavior: 'smooth', block: 'center' });
		}, 100);
	};

	const handleDelete = (postId: number) => {
		if (confirm('Delete this post?')) {
			deletePost.mutate(postId);
		}
	};

	const handleEdit = (postId: number) => {
		const post = posts.find((p) => p.id === postId);
		if (post) {
			setEditingPost(post);
		}
	};

	const handleMarkSolution = (postId: number) => {
		if (!thread) return;
		solveThread.mutate({ threadId: thread.id, postId });
	};

	const handleTip = (postId: number) => {
		const amount = parseFloat(prompt('Enter amount to tip') || '0');
		if (amount > 0) {
			tipPost.mutate({ postId, amount });
		}
	};

	const handleReport = (postId: number) => {
		const post = posts.find((p) => p.id === postId);
		if (post) {
			setReportingPost(post);
		}
	};

	const submitReply = async (content: string, editorState?: any) => {
		if (!thread) return;
		await createPost.mutateAsync({
			threadId: thread.id,
			content,
			replyToPostId: replyToPost?.id,
			editorState
		});
		setReplyToPost(null);
	};

	if (!match) {
		return (
			<Wide className="px-2 sm:px-4 py-6 sm:py-8 md:py-12">
				<div className="text-center">
					<h1 className="text-2xl font-bold mb-4">404 - Thread Not Found</h1>
					<p className="text-zinc-400 mb-6">
						The thread you are looking for does not exist or could not be found.
					</p>
					<Button asChild>
						<a href="/">Go back to Home</a>
					</Button>
				</div>
			</Wide>
		);
	}

	if (isThreadLoading || isPostsLoading) {
		return (
			<Wide className="px-2 sm:px-4 py-6 sm:py-8 md:py-12">
				<div className="animate-pulse">
					<Skeleton className="h-8 w-1/3 mb-4" />
					<Skeleton className="h-16 w-full mb-6" />
					<div className="space-y-4">
						{Array.from({ length: 5 }).map((_, i) => (
							<Skeleton key={i} className="h-40 w-full" />
						))}
					</div>
				</div>
			</Wide>
		);
	}

	if (isThreadError || isPostsError || !thread) {
		return (
			<Wide className="px-2 sm:px-4 py-6 sm:py-8 md:py-12">
				<div className="flex flex-col items-center justify-center py-24 text-center text-zinc-300">
					<AlertCircle className="h-12 w-12 text-red-500 mb-4" />
					<h2 className="text-xl font-semibold mb-2">Error loading thread</h2>
					<p className="text-zinc-400 mb-6">Please try again later.</p>
					<Button asChild variant="outline">
						<a href="/forums">Browse Forums</a>
					</Button>
				</div>
			</Wide>
		);
	}

	// Breadcrumb items (simple)
	const breadcrumbItems = [
		{ label: 'Home', href: '/' },
		{ label: 'Forums', href: '/forums' },
		{ label: thread.title, href: `/threads/${thread.slug}` }
	];

	return (
		<div className="min-h-screen bg-black">
			<main>
				<Wide className="px-2 sm:px-4 py-6 sm:py-8 md:py-12">
					{/* Breadcrumb */}
					<Breadcrumb className="mb-6">
						<BreadcrumbList>
							{breadcrumbItems.map((item, idx) => (
								<React.Fragment key={item.href}>
									<BreadcrumbItem>
										{idx === breadcrumbItems.length - 1 ? (
											<BreadcrumbPage className="text-zinc-300">{item.label}</BreadcrumbPage>
										) : (
											<BreadcrumbLink asChild>
												<a href={item.href} className="text-zinc-400 hover:text-zinc-200">
													{item.label}
												</a>
											</BreadcrumbLink>
										)}
									</BreadcrumbItem>
									{idx < breadcrumbItems.length - 1 && <BreadcrumbSeparator />}
								</React.Fragment>
							))}
						</BreadcrumbList>
					</Breadcrumb>

					{/* Thread Header */}
					<div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 sm:p-6 mb-6">
						<div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
							<div className="flex-1">
								<h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-zinc-100 mb-2">
									{thread.title}
								</h1>
								<div className="flex flex-wrap gap-4 text-sm text-zinc-400">
									<span>
										Posts: <span className="text-zinc-300 font-medium">{posts.length}</span>
									</span>
									{thread.isSolved && (
										<>
											<span>•</span>
											<span className="text-emerald-400">✓ Solved</span>
										</>
									)}
								</div>
							</div>
							{posts.length > 0 && (
								<Button
									variant="outline"
									size="sm"
									onClick={() => {
										const lastPost = document.getElementById(`post-${posts[posts.length - 1]?.id}`);
										lastPost?.scrollIntoView({ behavior: 'smooth', block: 'center' });
									}}
									className="border-zinc-600 text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100 shrink-0"
								>
									<ArrowDownCircle className="h-4 w-4 mr-2" />
									<span className="hidden sm:inline">Jump to</span> Newest
								</Button>
							)}
						</div>
					</div>

					{/* Posts List */}
					{posts.length === 0 ? (
						<div className="text-center py-12">
							<p className="text-zinc-400 text-lg">No posts yet.</p>
							<p className="text-zinc-500 text-sm mt-2">Be the first to start the discussion!</p>
						</div>
					) : (
						<div className="space-y-4">
							{posts.map((post, index) => {
								const canEdit = !!currentUser && currentUser.id === post.user.id;
								return (
									<div key={post.id} id={`post-${post.id}`} className="scroll-mt-6">
										<PostCard
											post={post}
											isFirst={index === 0}
											isThreadSolved={!!thread.isSolved}
											parentForumTheme={null}
											tippingEnabled={false}
											onLike={handleLike}
											onReply={handleReply}
											onEdit={handleEdit}
											onDelete={handleDelete}
											onMarkAsSolution={handleMarkSolution}
											onTip={handleTip}
											onReport={handleReport}
											isEditable={canEdit}
										/>
									</div>
								);
							})}
						</div>
					)}

					{/* Reply Form */}
					<div id="reply-form" className="mt-8">
						<ReplyForm
							threadId={thread.id}
							replyToId={replyToPost?.id || null}
							replyToPost={replyToPost}
							onSubmit={submitReply}
							onCancel={() => setReplyToPost(null)}
							isReplying={!!replyToPost}
							showRichEditor
						/>
					</div>
				</Wide>
			</main>

			{/* Edit Post Dialog */}
			<EditPostDialog
				post={editingPost}
				isOpen={!!editingPost}
				onClose={() => setEditingPost(null)}
			/>

			{/* Report Post Dialog */}
			<ReportPostDialog
				post={reportingPost}
				isOpen={!!reportingPost}
				onClose={() => setReportingPost(null)}
			/>

			<SiteFooter />
		</div>
	);
}
