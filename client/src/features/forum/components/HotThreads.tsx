import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { ThreadCard } from '@/components/forum/thread-card';
import type { ThreadTag } from '@schema';
import { Link } from 'wouter';
import {
	MessageSquare,
	Eye,
	ThumbsUp,
	ArrowRight,
	Clock,
	TrendingUp,
	ChevronLeft,
	ChevronRight
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion, AnimatePresence } from 'framer-motion';

interface ThreadResponse {
	thread_id: number;
	title: string;
	slug: string;
	post_count: number;
	view_count: number;
	hot_score: number;
	created_at: string;
	last_post_at: string;
	user_id: number;
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
}

export function HotThreads({ className = '', limit = 5 }: HotThreadsProps) {
	const {
		data: threads,
		isLoading,
		error
	} = useQuery<ThreadResponse[]>({
		queryKey: ['/api/forum/hot-threads', { limit }],
		queryFn: async () => {
			const res = await fetch(`/api/forum/hot-threads?limit=${limit}`);
			if (!res.ok) throw new Error('Failed to fetch hot threads');
			return res.json();
		}
	});

	const [currentPage, setCurrentPage] = useState(0);
	const threadsPerPage = 3;
	const maxPages = Math.ceil((threads?.length || 0) / threadsPerPage);

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

	// Get current threads to display
	const getCurrentThreads = () => {
		if (!threads) return [];
		const start = currentPage * threadsPerPage;
		return threads.slice(start, start + threadsPerPage);
	};

	const nextPage = () => {
		setCurrentPage((prev) => (prev + 1) % maxPages);
	};

	const prevPage = () => {
		setCurrentPage((prev) => (prev - 1 + maxPages) % maxPages);
	};

	return (
		<Card
			className={`bg-gradient-to-br from-zinc-900/90 to-zinc-900/60 border border-zinc-800/60 shadow-xl backdrop-blur-sm ${className}`}
		>
			<CardHeader className="pb-3">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="h-8 w-8 flex items-center justify-center">
							<DotLottieReact
								src="https://lottie.host/abeba818-d877-4e4d-8d8a-7f7f9099411c/6Pqbh2E87a.lottie"
								loop
								autoplay
								style={{ height: '32px', width: '32px' }}
							/>
						</div>
						<div>
							<CardTitle className="text-xl font-bold bg-gradient-to-r from-orange-400 to-red-400 text-transparent bg-clip-text">
								Hot Threads
							</CardTitle>
							<p className="text-xs text-zinc-400 mt-0.5">Trending discussions</p>
						</div>
					</div>

					{/* Pagination controls */}
					{threads && threads.length > threadsPerPage && (
						<div className="flex items-center gap-1">
							<button
								onClick={prevPage}
								className="p-1 text-zinc-400 hover:text-orange-400 transition-colors"
								disabled={maxPages <= 1}
							>
								<ChevronLeft className="h-4 w-4" />
							</button>
							<span className="text-xs text-zinc-500 px-2">
								{currentPage + 1} / {maxPages}
							</span>
							<button
								onClick={nextPage}
								className="p-1 text-zinc-400 hover:text-orange-400 transition-colors"
								disabled={maxPages <= 1}
							>
								<ChevronRight className="h-4 w-4" />
							</button>
						</div>
					)}
				</div>
			</CardHeader>

			<CardContent className="space-y-0">
				{isLoading ? (
					<div className="flex items-center justify-center py-8">
						<div className="w-6 h-6 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
						<span className="ml-3 text-zinc-400">Loading hot threads...</span>
					</div>
				) : error ? (
					<div className="text-center py-8">
						<div className="text-red-400 flex items-center justify-center gap-2">
							<span>Failed to load hot threads</span>
						</div>
					</div>
				) : threads && threads.length > 0 ? (
					<div className="space-y-3">
						<AnimatePresence mode="wait">
							<motion.div
								key={currentPage}
								initial={{ opacity: 0, x: 20 }}
								animate={{ opacity: 1, x: 0 }}
								exit={{ opacity: 0, x: -20 }}
								transition={{ duration: 0.3 }}
								className="space-y-3"
							>
								{getCurrentThreads().map((thread) => (
									<div key={thread.thread_id} className="group">
										<Link href={`/threads/${thread.thread_id}`}>
											<div className="relative p-4 rounded-lg bg-gradient-to-r from-zinc-800/50 to-zinc-800/30 border border-zinc-700/50 hover:border-orange-500/30 transition-all duration-300 cursor-pointer">
												<div className="relative z-10">
													{/* Header with badge */}
													<div className="flex items-start justify-between mb-3">
														<div
															className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${getBadgeStyle(thread.hot_score)}`}
														>
															<TrendingUp className="h-3 w-3" />
															{getHotnessLevel(thread.hot_score)}
														</div>

														{/* Simple flame for very hot threads */}
														{thread.hot_score > 75 && (
															<div className="text-orange-500">
																<DotLottieReact
																	src="https://lottie.host/abeba818-d877-4e4d-8d8a-7f7f9099411c/6Pqbh2E87a.lottie"
																	loop
																	autoplay
																	style={{ height: '16px', width: '16px' }}
																/>
															</div>
														)}
													</div>

													{/* Thread title */}
													<h3 className="font-semibold text-zinc-100 line-clamp-2 mb-3 group-hover:text-orange-300 transition-colors text-base leading-relaxed">
														{thread.title}
													</h3>

													{/* Author and meta info */}
													<div className="flex items-center gap-3 text-sm text-zinc-400 mb-3">
														<div className="flex items-center gap-2">
															<Avatar className="h-6 w-6">
																<AvatarImage src={thread.avatar_url} alt={thread.username} />
																<AvatarFallback className="text-xs bg-zinc-800 text-zinc-300">
																	{getInitials(thread.username)}
																</AvatarFallback>
															</Avatar>
															<span className="text-zinc-300 font-medium">{thread.username}</span>
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
															<Badge
																variant="outline"
																className="bg-zinc-800/50 text-zinc-400 border-zinc-600 hover:border-orange-500/50 hover:text-orange-300 transition-all text-xs"
															>
																{thread.category_name}
															</Badge>
														</Link>
													</div>
												</div>
											</div>
										</Link>
									</div>
								))}
							</motion.div>
						</AnimatePresence>
					</div>
				) : (
					<div className="text-center py-8 text-zinc-400">
						<div className="flex justify-center mb-2">
							<DotLottieReact
								src="https://lottie.host/abeba818-d877-4e4d-8d8a-7f7f9099411c/6Pqbh2E87a.lottie"
								loop
								autoplay
								style={{ height: '32px', width: '32px', opacity: 0.6 }}
							/>
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

export default HotThreads;
