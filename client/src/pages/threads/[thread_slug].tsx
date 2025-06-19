import React, { useMemo, useRef } from 'react';
import { useRoute } from 'wouter';
import { FixedSizeList as List } from 'react-window';
import type { ListChildComponentProps } from 'react-window'; // Removed ListOnScrollProps
import { AlertCircle, ArrowDownCircle } from 'lucide-react';
import { useThread, usePosts } from '@/features/forum/hooks/useForumQueries';
import PostCard from '@/features/forum/components/PostCard';
import { SiteFooter } from '@/components/layout/site-footer';
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

export default function ThreadPage() {
	// Get slug param from route
	const [match, params] = useRoute<{ thread_slug: string }>('/threads/:thread_slug');
	const slug = params?.thread_slug;
	const listRef = useRef<List>(null);

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

	if (!match) {
		return <div>404 Not Found</div>;
	}

	if (isThreadLoading || isPostsLoading) {
		return (
			<Wide className="py-8">
				<Skeleton className="h-8 w-1/3 mb-4" />
				<Skeleton className="h-16 w-full mb-6" />
				<Skeleton className="h-[600px] w-full" />
			</Wide>
		);
	}

	if (isThreadError || isPostsError || !thread) {
		return (
			<div className="flex flex-col items-center justify-center py-24 text-center text-zinc-300">
				<AlertCircle className="h-12 w-12 text-red-500 mb-2" />
				<p className="text-xl font-semibold mb-1">Error loading thread</p>
				<p className="text-zinc-400">Please try again later.</p>
			</div>
		);
	}

	// Breadcrumb items (simple)
	const breadcrumbItems = [
		{ label: 'Home', href: '/' },
		{ label: 'Forums', href: '/forums' },
		{ label: thread.title, href: `/threads/${thread.slug}` }
	];

	const Row = ({ index, style }: ListChildComponentProps) => {
		const post = posts[index];
		return (
			<div style={style} className="px-4" id={`post-${post.id}`}>
				{' '}
				{/* Add ID to post container */}
				<PostCard
					post={post}
					isFirst={index === 0}
					isThreadSolved={!!thread.isSolved}
					parentForumTheme={null}
					tippingEnabled={false}
				/>
			</div>
		);
	};

	return (
		<div className="min-h-screen bg-black">
			<main>
				<Wide className="px-4 py-8">
					{/* Breadcrumb */}
					<Breadcrumb className="mb-6">
						<BreadcrumbList>
							{breadcrumbItems.map((item, idx) => (
								<React.Fragment key={item.href}>
									<BreadcrumbItem>
										{idx === breadcrumbItems.length - 1 ? (
											<BreadcrumbPage>{item.label}</BreadcrumbPage>
										) : (
											<BreadcrumbLink asChild>
												<a href={item.href}>{item.label}</a>
											</BreadcrumbLink>
										)}
									</BreadcrumbItem>
									{idx < breadcrumbItems.length - 1 && <BreadcrumbSeparator />}
								</React.Fragment>
							))}
						</BreadcrumbList>
					</Breadcrumb>

					{/* Thread title & Jump to Newest button */}
					<div className="flex justify-between items-center mb-6">
						<h1 className="text-2xl md:text-3xl font-bold text-zinc-100">{thread.title}</h1>
						{posts.length > 0 && (
							<Button
								variant="outline"
								size="sm"
								onClick={() => {
									if (listRef.current) {
										listRef.current.scrollToItem(posts.length - 1, 'end');
									}
								}}
								className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
							>
								<ArrowDownCircle className="h-4 w-4 mr-2" />
								Jump to Newest
							</Button>
						)}
					</div>

					{/* Posts virtualized list */}
					{posts.length === 0 ? (
						<p className="text-center text-zinc-400">No posts yet.</p>
					) : (
						<div className="w-full">
							<List
								ref={listRef}
								height={700} // This height might need adjustment based on surrounding UI
								width={Math.min(1200, typeof window !== 'undefined' ? window.innerWidth - 64 : 800)} // Ensure width is a number
								itemCount={posts.length}
								itemSize={280} // Assuming fixed size, adjust if PostCard height varies significantly
							>
								{Row}
							</List>
						</div>
					)}
				</Wide>
			</main>
			<SiteFooter />
		</div>
	);
}
