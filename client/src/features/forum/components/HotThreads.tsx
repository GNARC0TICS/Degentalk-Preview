import React from 'react'; // Removed useState
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
// Temporarily remove heavy lottie dependency until build issues resolved
import { Link } from 'wouter';
import { MessageSquare, Eye, ThumbsUp, ArrowRight, Clock, TrendingUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { HotThreadsSkeleton } from '@/components/ui/thread-skeleton';
import { API_ROUTES } from '@/constants/apiRoutes';
import type { ThreadId } from '@shared/types';
// Removed motion, AnimatePresence

interface ThreadResponse {
	thread_id: ThreadId;
	title: string;
	slug: string;
	post_count: number;
	view_count: number;
	hot_score: number;
	created_at: string;
	last_post_at: string;
	user_id: ThreadId;
	username: string;
	avatar_url: string;
	category_name: string;
	category_slug: string;
	like_count: number;
	// Add fields that are part of ThreadWithUserAndCategory but might be missing from this specific API response
	// We'll provide default/placeholder values in the mapping
	uuid?: string;
	isSticky?: boolean;
	isLocked?: boolean;
	isHidden?: boolean;
	isFeatured?: boolean;
	updated_at?: string; // Assuming API might return this as string
	isSolved?: boolean;
	solving_post_id?: number | null;
	tags?: ThreadTag[];
	prefix_id?: number | null; // Assuming prefix_id from API
}

interface HotThreadsProps {
	className?: string;
	limit?: number;
	/**
	 * Variant controls overall styling / sizing.
	 * "widget" (default) – bigger card intended for sidebars / widgets
	 * "feed" – compact version used inline in main content feed
	 */
	variant?: 'widget' | 'feed';
}

function HotThreads({ className = '', limit = 5, variant = 'widget' }: HotThreadsProps) {
	const {
		data: threads,
		isLoading,
		error
	} = useQuery<ThreadResponse[]>({
		queryKey: [API_ROUTES.threads.hot, { limit }],
		queryFn: async () => {
			const res = await fetch(`${API_ROUTES.threads.hot}?limit=${limit}`);
			if (!res.ok) throw new Error('Failed to fetch hot threads');
			return res.json();
		}
	});

	// Removed pagination state: currentPage, threadsPerPage, maxPages

	// Get badge styling based on hotness
	const getBadgeStyle = (score: number) => {
		if (score >= 100) return 'bg-gradient-to-r from-red-500 to-orange-500 text-white border-0';
		if (score >= 75) return 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white border-0';
		if (score >= 50) return 'bg-gradient-to-r from-yellow-500 to-orange-400 text-white border-0';
		return 'bg-gradient-to-r from-orange-400 to-red-400 text-white border-0'; // Warmer color for "warm"
	};

	const getHotnessLevel = (score: number) => {
		if (score >= 100) return 'VOLCANIC';
		if (score >= 75) return 'BLAZING';
		if (score >= 50) return 'HOT';
		return 'WARM';
	};

	// Format relative time
	const formatTimeAgo = (dateString: string) => {
		try {
			return formatDistanceToNow(new Date(dateString), { addSuffix: true });
		} catch (e) {
			return dateString;
		}
	};

	// Get initials for avatar fallback
	const getInitials = (name: string) => {
		return name?.substring(0, 2).toUpperCase() || 'UN';
	};

	// Render individual thread item
	const renderThreadItem = (thread: ThreadResponse, index: number) => (
		<div key={thread.thread_id}>
			<Link href={`/threads/${thread.slug}`}>
				<div className="border-b border-zinc-800/60 last:border-b-0 p-4 hover:bg-zinc-800/40 transition-all duration-200 cursor-pointer group">
					<div className="space-y-3">
						{/* Thread title */}
						<div className="flex items-start gap-3">
							<TrendingUp className="h-5 w-5 text-orange-400 mt-0.5 flex-shrink-0" />
							<div className="flex-1 min-w-0">
								<h3 className="font-semibold text-zinc-100 group-hover:text-orange-300 transition-colors line-clamp-2 leading-snug">
									{thread.title}
								</h3>
							</div>
							{thread.hot_score && (
								<Badge variant="outline" className="border-orange-500/30 text-orange-300 text-xs">
									{Math.round(thread.hot_score)}
								</Badge>
							)}
						</div>

						{/* User and timestamp */}
						<div className="flex items-center gap-3 text-xs text-zinc-400">
							<div className="flex items-center gap-2">
								<Avatar className="h-5 w-5">
									<AvatarImage src={thread.avatar_url} alt={thread.username} />
									<AvatarFallback className="text-xs bg-zinc-700">
										{thread.username.substring(0, 2).toUpperCase()}
									</AvatarFallback>
								</Avatar>
								<span className="font-medium text-zinc-300">{thread.username}</span>
							</div>

							<span className="text-zinc-600">•</span>

							<div className="flex items-center gap-1">
								<Clock className="h-3.5 w-3.5" />
								<span>{formatTimeAgo(thread.last_post_at)}</span>
							</div>
						</div>

						{/* Stats */}
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-6 text-xs">
								<div className="flex items-center gap-1.5 text-zinc-400">
									<MessageSquare className="h-4 w-4" />
									<span className="font-medium">{thread.post_count}</span>
								</div>
								<div className="flex items-center gap-1.5 text-zinc-400">
									<Eye className="h-4 w-4" />
									<span className="font-medium">{thread.view_count}</span>
								</div>
								<div className="flex items-center gap-1.5 text-zinc-400">
									<ThumbsUp className="h-4 w-4" />
									<span className="font-medium">{thread.like_count}</span>
								</div>
							</div>

							{/* Category tag */}
							<Link href={`/forums/${thread.category_slug}`}>
								<span
									className="bg-zinc-800/50 text-zinc-400 border border-zinc-600 hover:border-orange-500/50 hover:text-orange-300 transition-all text-xs cursor-pointer rounded px-2 py-0.5"
									onClick={(e) => {
										e.stopPropagation();
									}}
								>
									{thread.category_name}
								</span>
							</Link>
						</div>
					</div>
				</div>
			</Link>
		</div>
	);

	// Choose a slightly different background for the feed variant (less flashy)
	const cardBackground =
		variant === 'feed' ? 'bg-zinc-900/70' : 'bg-gradient-to-br from-zinc-900/90 to-zinc-900/60';

	const mergedClassName = `w-full overflow-hidden ${cardBackground} border border-zinc-800/60 shadow-xl backdrop-blur-sm ${className}`;

	return (
		<Card className={mergedClassName}>
			<CardHeader className="pb-3">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="h-8 w-8 flex items-center justify-center">
							{/* Temporarily remove heavy lottie dependency until build issues resolved */}
						</div>
						<div>
							<CardTitle className="text-xl font-bold bg-gradient-to-r from-orange-400 to-red-400 text-transparent bg-clip-text">
								Hot Threads
							</CardTitle>
							<p className="text-xs text-zinc-400 mt-0.5">Trending discussions</p>
						</div>
					</div>

					{/* Pagination controls removed */}
				</div>
			</CardHeader>

			<CardContent className="space-y-0">
				{isLoading ? (
					<HotThreadsSkeleton count={limit} />
				) : error ? (
					<div className="text-center py-8">
						<div className="text-red-400 flex items-center justify-center gap-2">
							<span>Failed to load hot threads</span>
						</div>
					</div>
				) : threads && threads.length > 0 ? (
					<div className="space-y-0">
						{threads.map((thread, index) => renderThreadItem(thread, index))}
					</div>
				) : (
					<div className="text-center py-8 text-zinc-400">
						<div className="flex justify-center mb-2">
							{/* Temporarily remove heavy lottie dependency until build issues resolved */}
						</div>
						<p>No hot threads right now</p>
						<p className="text-xs text-zinc-500">Check back later for trending discussions</p>
					</div>
				)}

				{/* View more button with proper spacing */}
				<div className="mt-8 pt-4 border-t border-zinc-800/50">
					<div className="text-center">
						<Link href="/hot-threads">
							<div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500/10 to-red-500/10 hover:from-orange-500/20 hover:to-red-500/20 border border-orange-500/20 hover:border-orange-500/40 rounded-lg text-orange-300 hover:text-orange-200 transition-all duration-300 cursor-pointer">
								<span className="font-medium">View All Hot Threads</span>
								<ArrowRight className="h-4 w-4" />
							</div>
						</Link>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

const FlameIcon = () => (
	<span role="img" aria-label="flame" className="text-orange-500 mr-1">
		🔥
	</span>
);

export default HotThreads;
