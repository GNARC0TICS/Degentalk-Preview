import React, { useMemo, useEffect, useState, useCallback } from 'react';
import { useRoute } from 'wouter';
import { AlertCircle, ArrowUp, MessageSquare, Plus } from 'lucide-react';
import { useThread, usePosts } from '@/features/forum/hooks/useForumQueries';
import { BBCodePostCard } from '@/components/forum/BBCodePostCard';
import { ThreadSidebar } from '@/components/forum/ThreadSidebar';
import { ThreadPagination } from '@/components/forum/ThreadPagination';
import { SiteFooter } from '@/components/layout/site-footer';
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Wide } from '@/layout/primitives';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import type { PostWithUser, ThreadWithPostsAndUser } from '@db_types/forum.types';

export default function BBCodeThreadPage() {
	// Get slug param from route
	const [match, params] = useRoute<{ thread_slug: string }>('/threads/:thread_slug');
	const slug = params?.thread_slug;

	// Pagination state
	const [currentPage, setCurrentPage] = useState(1);
	const [postsPerPage] = useState(20);

	// Scroll state for back-to-top button
	const [showBackToTop, setShowBackToTop] = useState(false);
	const [showSidebar, setShowSidebar] = useState(true);

	// Fetch thread meta & posts
	const { data: threadData, isLoading: isThreadLoading, isError: isThreadError } = useThread(slug);
	const thread = threadData?.thread as ThreadWithPostsAndUser['thread'] | undefined;

	const {
		data: postResponse,
		isLoading: isPostsLoading,
		isError: isPostsError
	} = usePosts(thread?.id);

	// Flatten posts if pagination returns pages/arrays
	const allPosts: PostWithUser[] = useMemo(() => {
		if (postResponse && Array.isArray(postResponse.posts)) {
			return postResponse.posts;
		}
		if (threadData?.posts) return threadData.posts;
		return [];
	}, [postResponse, threadData]);

	// Calculate pagination
	const totalPages = Math.ceil(allPosts.length / postsPerPage);
	const startIndex = (currentPage - 1) * postsPerPage;
	const endIndex = startIndex + postsPerPage;
	const posts = allPosts.slice(startIndex, endIndex);

	// Handle page change
	const handlePageChange = useCallback((page: number) => {
		setCurrentPage(page);
		window.scrollTo({ top: 0, behavior: 'smooth' });

		// Update URL with page parameter (optional)
		const url = new URL(window.location.href);
		if (page > 1) {
			url.searchParams.set('page', page.toString());
		} else {
			url.searchParams.delete('page');
		}
		window.history.replaceState({}, '', url.toString());
	}, []);

	// Handle anchor links (e.g., #post-123)
	useEffect(() => {
		const hash = window.location.hash;
		if (hash.startsWith('#post-')) {
			const postId = parseInt(hash.replace('#post-', ''));
			const postIndex = allPosts.findIndex((p) => p.id === postId);

			if (postIndex !== -1) {
				const pageForPost = Math.floor(postIndex / postsPerPage) + 1;
				if (pageForPost !== currentPage) {
					setCurrentPage(pageForPost);
				}

				// Scroll to post after render
				setTimeout(() => {
					const element = document.getElementById(`post-${postId}`);
					if (element) {
						element.scrollIntoView({ behavior: 'smooth', block: 'start' });
					}
				}, 100);
			}
		}
	}, [allPosts, currentPage, postsPerPage]);

	// Initialize page from URL
	useEffect(() => {
		const urlParams = new URLSearchParams(window.location.search);
		const pageParam = urlParams.get('page');
		if (pageParam) {
			const page = parseInt(pageParam);
			if (page > 0 && page <= totalPages) {
				setCurrentPage(page);
			}
		}
	}, [totalPages]);

	// Handle scroll for back-to-top button
	useEffect(() => {
		const handleScroll = () => {
			setShowBackToTop(window.scrollY > 500);
		};

		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	// Responsive sidebar handling
	useEffect(() => {
		const handleResize = () => {
			setShowSidebar(window.innerWidth >= 1280); // xl breakpoint
		};

		handleResize();
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	const scrollToTop = () => {
		window.scrollTo({ top: 0, behavior: 'smooth' });
	};

	const scrollToBottom = () => {
		window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
	};

	// Mock handlers - these should be connected to actual API calls
	const handleLike = (postId: number, hasLiked: boolean) => {
		console.log('Like post:', postId, !hasLiked);
	};

	const handleReply = (postId: number) => {
		console.log('Reply to post:', postId);
		// Could scroll to reply form or open modal
	};

	const handleQuote = (postId: number) => {
		console.log('Quote post:', postId);
		// Could populate reply form with quoted content
	};

	const handleEdit = (postId: number) => {
		console.log('Edit post:', postId);
	};

	const handleDelete = (postId: number) => {
		console.log('Delete post:', postId);
	};

	const handleMarkSolution = (postId: number) => {
		console.log('Mark as solution:', postId);
	};

	const handleTip = (postId: number) => {
		console.log('Tip post:', postId);
	};

	const handleReport = (postId: number) => {
		console.log('Report post:', postId);
	};

	if (!match) {
		return <div>404 Not Found</div>;
	}

	if (isThreadLoading || isPostsLoading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-black">
				<Wide className="py-8">
					<Skeleton className="h-8 w-1/3 mb-4" />
					<Skeleton className="h-16 w-full mb-6" />
					<div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-8">
						<div className="space-y-6">
							{[...Array(3)].map((_, i) => (
								<div key={i} className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-4">
									<Skeleton className="h-64 w-full" />
									<Skeleton className="h-64 w-full" />
								</div>
							))}
						</div>
						{showSidebar && <Skeleton className="h-96 w-full" />}
					</div>
				</Wide>
			</div>
		);
	}

	if (isThreadError || isPostsError || !thread) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-black">
				<Wide className="py-8">
					<div className="flex flex-col items-center justify-center py-24 text-center text-zinc-300">
						<AlertCircle className="h-12 w-12 text-red-500 mb-2" />
						<p className="text-xl font-semibold mb-1">Error loading thread</p>
						<p className="text-zinc-400">Please try again later.</p>
					</div>
				</Wide>
			</div>
		);
	}

	// Breadcrumb items
	const breadcrumbItems = [
		{ label: 'Home', href: '/' },
		{ label: 'Forums', href: '/forums' },
		{ label: thread.forumName || 'Forum', href: `/forums/${thread.forumSlug || ''}` },
		{ label: thread.title, href: `/threads/${thread.slug}` }
	];

	return (
		<div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-black">
			<main>
				<Wide className="px-4 py-8">
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
												<a href={item.href} className="text-zinc-400 hover:text-emerald-400">
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
					<div className="mb-8">
						<div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
							<div className="flex-grow">
								<h1 className="text-2xl lg:text-3xl font-bold text-zinc-100 mb-3 leading-tight">
									{thread.title}
								</h1>

								{/* Thread metadata */}
								<div className="flex flex-wrap items-center gap-3 text-sm text-zinc-400">
									<div className="flex items-center">
										<MessageSquare className="h-4 w-4 mr-1" />
										{allPosts.length} {allPosts.length === 1 ? 'post' : 'posts'}
									</div>
									<div className="flex items-center">
										👀 {(thread.viewCount || 0).toLocaleString()} views
									</div>
									{totalPages > 1 && (
										<div className="text-xs text-zinc-500">
											Page {currentPage} of {totalPages}
										</div>
									)}
									{thread.tags && thread.tags.length > 0 && (
										<div className="flex flex-wrap gap-1">
											{thread.tags.slice(0, 3).map((tag, i) => (
												<Badge key={i} variant="outline" className="text-xs">
													{tag}
												</Badge>
											))}
										</div>
									)}
								</div>
							</div>

							{/* Quick actions */}
							<div className="flex items-center gap-2">
								<Button
									variant="outline"
									size="sm"
									onClick={scrollToBottom}
									className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
								>
									<Plus className="h-4 w-4 mr-2" />
									Reply
								</Button>

								{!showSidebar && (
									<Button
										variant="ghost"
										size="sm"
										onClick={() => setShowSidebar(true)}
										className="text-zinc-400 hover:text-zinc-300"
									>
										Show Info
									</Button>
								)}
							</div>
						</div>

						{/* Thread status badges */}
						<div className="flex flex-wrap gap-2">
							{thread.isPinned && (
								<Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
									📌 Pinned
								</Badge>
							)}
							{thread.isLocked && (
								<Badge className="bg-red-500/20 text-red-400 border-red-500/30">🔒 Locked</Badge>
							)}
							{thread.isSolved && (
								<Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
									✅ Solved
								</Badge>
							)}
						</div>
					</div>

					{/* Main Layout */}
					<div className={`grid gap-8 ${showSidebar ? 'xl:grid-cols-[1fr_300px]' : 'grid-cols-1'}`}>
						{/* Posts Content */}
						<div className="space-y-0">
							{posts.length === 0 ? (
								<div className="text-center py-12 text-zinc-400">
									<MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
									<p>No posts yet in this thread.</p>
								</div>
							) : (
								<AnimatePresence>
									{posts.map((post, index) => (
										<motion.div
											key={post.id}
											initial={{ opacity: 0, y: 20 }}
											animate={{ opacity: 1, y: 0 }}
											transition={{ duration: 0.4, delay: index * 0.05 }}
										>
											<BBCodePostCard
												post={post}
												isFirst={index === 0}
												isThreadSolved={!!thread.isSolved}
												isSolution={post.id === thread.solutionPostId}
												canEdit={false} // TODO: Check permissions
												canDelete={false} // TODO: Check permissions
												canMarkSolution={!thread.isSolved} // TODO: Check permissions
												tippingEnabled={true}
												showSignatures={true}
												onLike={handleLike}
												onReply={handleReply}
												onQuote={handleQuote}
												onEdit={handleEdit}
												onDelete={handleDelete}
												onMarkSolution={handleMarkSolution}
												onTip={handleTip}
												onReport={handleReport}
											/>
										</motion.div>
									))}
								</AnimatePresence>
							)}

							{/* Thread Pagination */}
							{totalPages > 1 && (
								<div className="mt-8">
									<ThreadPagination
										currentPage={currentPage}
										totalPages={totalPages}
										postsPerPage={postsPerPage}
										totalPosts={allPosts.length}
										onPageChange={handlePageChange}
										showPostCount={true}
									/>
								</div>
							)}
						</div>

						{/* Right Sidebar */}
						{showSidebar && (
							<motion.div
								initial={{ opacity: 0, x: 20 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ duration: 0.4 }}
								className="hidden xl:block"
							>
								<div className="sticky top-4">
									<ThreadSidebar
										thread={thread}
										postCount={allPosts.length}
										canModerate={false} // TODO: Check permissions
										canEdit={false} // TODO: Check permissions
										canDelete={false} // TODO: Check permissions
									/>
								</div>
							</motion.div>
						)}
					</div>
				</Wide>
			</main>

			{/* Back to top button */}
			<AnimatePresence>
				{showBackToTop && (
					<motion.div
						initial={{ opacity: 0, scale: 0.8 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.8 }}
						className="fixed bottom-8 right-8 z-50"
					>
						<Button
							size="icon"
							onClick={scrollToTop}
							className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg"
						>
							<ArrowUp className="h-4 w-4" />
						</Button>
					</motion.div>
				)}
			</AnimatePresence>

			<SiteFooter />
		</div>
	);
}
