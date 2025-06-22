import React from 'react';
import { useParams, Link } from 'wouter';
import { ThreadCard } from '@/components/forum/ThreadCard';
import { useThreadsByTag, useTags } from '@/features/forum/hooks/useForumQueries';
import { SiteHeader } from '@/components/header';
import { SiteFooter } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Hash, AlertTriangle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Pagination } from '@/components/ui/pagination';

export default function TagPage() {
	const { tagSlug } = useParams();
	const [page, setPage] = React.useState(1);
	const limit = 20;

	// Fetch threads with this tag
	const {
		data: threadsData,
		isLoading: isLoadingThreads,
		isError: isThreadsError,
		error: threadsError
	} = useThreadsByTag(tagSlug, {
		page,
		limit,
		sortBy: 'latest'
	});

	// Also fetch all tags to find the current tag's name
	const { data: allTags, isLoading: isLoadingTags } = useTags();

	// Find the current tag's name from all tags
	const currentTag = allTags?.find((tag) => tag.slug === tagSlug);

	return (
		<div className="min-h-screen bg-black text-white flex flex-col">
			<SiteHeader />

			<main className="flex-grow container mx-auto px-4 py-8">
				<div className="mb-6 flex items-center gap-2">
					<Button
						variant="outline"
						size="icon"
						onClick={() => window.history.back()}
						className="border-zinc-700 bg-zinc-900/50"
					>
						<ArrowLeft className="h-4 w-4" />
					</Button>
					<div>
						<h1 className="text-2xl font-bold flex items-center">
							<Hash className="h-5 w-5 mr-2 text-emerald-400" />
							{isLoadingTags ? <Skeleton className="h-8 w-32" /> : currentTag?.name || tagSlug}
						</h1>
						<p className="text-zinc-400 text-sm">
							Threads tagged with #{currentTag?.name || tagSlug}
						</p>
					</div>
				</div>

				{isThreadsError ? (
					<Card className="bg-red-900/20 border-red-800">
						<CardContent className="pt-6">
							<div className="flex items-center gap-2">
								<AlertTriangle className="h-5 w-5 text-red-400" />
								<div>
									<p className="font-medium text-red-400">Error loading threads</p>
									<p className="text-sm text-red-300">
										{threadsError instanceof Error
											? threadsError.message
											: 'Unknown error occurred'}
									</p>
								</div>
							</div>
							<Button
								variant="outline"
								className="mt-4 border-red-700 text-red-300 hover:bg-red-900/50"
								onClick={() => window.location.reload()}
							>
								Try Again
							</Button>
						</CardContent>
					</Card>
				) : isLoadingThreads || !threadsData ? (
					<>
						<Card className="bg-zinc-900/60 border-zinc-800 mb-4">
							<CardHeader>
								<Skeleton className="h-6 w-2/3 mb-2" />
								<Skeleton className="h-4 w-1/3" />
							</CardHeader>
							<CardContent>
								<Skeleton className="h-32 w-full" />
							</CardContent>
						</Card>
						{Array.from({ length: 3 }).map((_, i) => (
							<Skeleton key={i} className="h-28 w-full mb-4" />
						))}
					</>
				) : threadsData.threads.length === 0 ? (
					<Card className="bg-zinc-900/60 border-zinc-800">
						<CardContent className="pt-6 pb-8 text-center">
							<p className="text-zinc-400">No threads found with this tag.</p>
							<Button
								variant="outline"
								className="mt-4 border-zinc-700 bg-zinc-800/50"
								onClick={() => window.history.back()}
							>
								Go Back
							</Button>
						</CardContent>
					</Card>
				) : (
					<>
						<div className="flex justify-between items-center mb-4">
							<p className="text-zinc-400">
								{threadsData.pagination.totalThreads}{' '}
								{threadsData.pagination.totalThreads === 1 ? 'thread' : 'threads'} found
							</p>
							<div className="flex items-center gap-2">
								<span className="text-sm text-zinc-500">Sort by:</span>
								<select className="bg-zinc-800 border border-zinc-700 rounded p-1 text-sm">
									<option value="latest">Latest</option>
									<option value="hot">Hot</option>
									<option value="popular">Popular</option>
								</select>
							</div>
						</div>

						<div className="space-y-4">
							{threadsData.threads.map((thread) => (
								<ThreadCard
									key={thread.id}
									thread={{
										id: thread.id,
										title: thread.title,
										slug: thread.slug, // Assuming thread object from useThreadsByTag has slug
										createdAt: thread.createdAt,
										lastPostAt: thread.lastPostAt,
										viewCount: thread.viewCount,
										postCount: thread.postCount,
										user: thread.user, // Assuming thread.user matches Partial<User> & { username, id, avatarUrl?, activeAvatarUrl?, role? }
										isSticky: thread.isSticky,
										isLocked: thread.isLocked,
										isFeatured: thread.isFeatured, // For isAnnouncement in ThreadCard
										firstPostLikeCount: thread.firstPostLikeCount,
										// Fields that might not be on thread object from useThreadsByTag, relying on ThreadCardPropsData optionals
										hasBookmarked: (thread as any).hasBookmarked, // Cast to any if not on type, will be undefined if not present
										isSolved: thread.isSolved,
										solvingPostId: thread.solvingPostId,
										tags: (thread as any).tags, // ThreadWithUser doesn't have tags directly
										category: undefined, // ThreadWithUser only has categoryId, not the full object.
										prefix: undefined, // ThreadWithUser only has prefixId, not the full object.
										preview: (thread as any).preview || '' // ThreadWithUser doesn't have preview
										// hotScore, isHidden, dgtStaked, updatedAt will be undefined
									}}
								/>
							))}
						</div>

						{threadsData.pagination.totalPages > 1 && (
							<div className="mt-6 flex justify-center">
								<Pagination
									currentPage={page}
									totalPages={threadsData.pagination.totalPages}
									onPageChange={setPage}
								/>
							</div>
						)}
					</>
				)}
			</main>

			<SiteFooter />
		</div>
	);
}
