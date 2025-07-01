import React, { useState } from 'react';
import { Link } from 'wouter';
import { cn } from '@/lib/utils';
import {
	MessageSquare,
	Eye,
	ThumbsUp,
	Clock,
	TrendingUp,
	Bookmark,
	Share2,
	MoreHorizontal,
	Flame
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import type { ContentItem } from '@/hooks/use-content';

export interface ContentFeedProps {
	items: ContentItem[];
	isLoading?: boolean;
	error?: Error | null;
	className?: string;
	variant?: 'default' | 'compact';
	showCategory?: boolean;
}

function ContentFeedSkeleton({ count = 5 }: { count?: number }) {
	return (
		<div className="space-y-0">
			{Array.from({ length: count }).map((_, i) => (
				<div
					key={i}
					className="border-b border-zinc-800/60 last:border-b-0 p-4 animate-pulse"
					style={{ animationDelay: `${i * 100}ms` }}
				>
					<div className="space-y-3">
						<div className="flex items-start gap-3">
							<Skeleton className="h-5 w-5 rounded animate-pulse" />
							<div className="flex-1 space-y-2">
								<Skeleton className="h-4 w-3/4 animate-pulse" />
								<Skeleton className="h-3 w-1/2 animate-pulse" />
								<Skeleton className="h-3 w-11/12 animate-pulse" />
							</div>
							<Skeleton className="h-5 w-12 rounded animate-pulse" />
						</div>
						<div className="flex items-center gap-3">
							<Skeleton className="h-5 w-5 rounded-full animate-pulse" />
							<Skeleton className="h-3 w-20 animate-pulse" />
							<Skeleton className="h-3 w-16 animate-pulse" />
						</div>
						<div className="flex items-center justify-between">
							<div className="flex gap-6">
								<Skeleton className="h-3 w-8 animate-pulse" />
								<Skeleton className="h-3 w-8 animate-pulse" />
								<Skeleton className="h-3 w-8 animate-pulse" />
							</div>
							<Skeleton className="h-4 w-16 rounded animate-pulse" />
						</div>
					</div>
				</div>
			))}
		</div>
	);
}

function ContentItem({ item, showCategory = true }: { item: ContentItem; showCategory?: boolean }) {
	const [isHovered, setIsHovered] = useState(false);
	const [showQuickActions, setShowQuickActions] = useState(false);

	const formatTimeAgo = (dateString: string) => {
		try {
			return formatDistanceToNow(new Date(dateString), { addSuffix: true });
		} catch (e) {
			return dateString;
		}
	};

	const getHotLevel = (viewCount: number, postCount: number) => {
		const score = viewCount * 0.3 + postCount * 0.7;
		if (score > 100) return 'volcanic';
		if (score > 50) return 'hot';
		if (score > 20) return 'warm';
		return 'cool';
	};

	const hotLevel = getHotLevel(item.viewCount, item.postCount);

	const handleQuickAction = (e: React.MouseEvent, action: string) => {
		e.preventDefault();
		e.stopPropagation();
	};

	return (
		<div
			className="content-item relative border-b border-zinc-800/60 last:border-b-0 transition-colors duration-300 group touch-feedback"
			onMouseEnter={() => {
				setIsHovered(true);
				setTimeout(() => setShowQuickActions(true), 200);
			}}
			onMouseLeave={() => {
				setIsHovered(false);
				setShowQuickActions(false);
			}}
		>
			{/* Hover background effect */}
			<div
				className={cn(
					'absolute inset-0 bg-gradient-to-r from-orange-500/5 via-transparent to-red-500/5 transition-opacity duration-300',
					isHovered ? 'opacity-100' : 'opacity-0'
				)}
			/>

			{/* Hot indicator glow */}
			{hotLevel === 'volcanic' && (
				<div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-red-500 to-orange-500 shadow-lg shadow-red-500/50" />
			)}
			{hotLevel === 'hot' && (
				<div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-orange-500 to-yellow-500" />
			)}

			<Link href={`/threads/${item.slug}`}>
				<div
					className={cn(
						'relative p-4 cursor-pointer transition-colors duration-300',
						isHovered && 'bg-zinc-800/30'
					)}
				>
					<div className="space-y-3">
						{/* Thread title with enhanced hover effects */}
						<div className="flex items-start gap-3">
							<div className="relative">
								{hotLevel === 'volcanic' ? (
									<Flame className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
								) : (
									<TrendingUp
										className={cn(
											'h-5 w-5 mt-0.5 flex-shrink-0 transition-colors duration-300',
											hotLevel === 'hot' ? 'text-orange-400' : 'text-zinc-500',
											isHovered && 'text-orange-300'
										)}
									/>
								)}
							</div>

							<div className="flex-1 min-w-0">
								<h3
									className={cn(
										'font-semibold text-zinc-100 transition-all duration-300 line-clamp-2 leading-snug',
										isHovered && 'text-orange-300'
									)}
								>
									{item.title}
								</h3>
								{/* Excerpt preview - hidden on small screens */}
								{item.excerpt && (
									<p
										className={cn(
											'mt-1 text-zinc-400 text-sm leading-relaxed line-clamp-2 hidden md:block',
											'group-hover:text-zinc-300 transition-colors duration-300'
										)}
									>
										{item.excerpt}
									</p>
								)}
							</div>

							{/* Status badges with animations */}
							<div className="flex gap-1">
								{item.isSticky && (
									<Badge variant="outline" className="border-blue-500/30 text-blue-300 text-xs">
										Pinned
									</Badge>
								)}
								{item.isLocked && (
									<Badge variant="outline" className="border-red-500/30 text-red-300 text-xs">
										Locked
									</Badge>
								)}
								{item.isSolved && (
									<Badge variant="outline" className="border-green-500/30 text-green-300 text-xs">
										Solved
									</Badge>
								)}
								{hotLevel === 'volcanic' && (
									<Badge variant="outline" className="border-red-500/30 text-red-300 text-xs">
										🔥 Hot
									</Badge>
								)}
							</div>
						</div>

						{/* User info with enhanced avatars */}
						<div className="flex items-center gap-3 text-xs text-zinc-400">
							<div className="flex items-center gap-2">
								<div className="relative">
									<Avatar className="h-8 w-8 ring-2 ring-zinc-700">
										<AvatarImage src={item.user.avatarUrl || undefined} alt={item.user.username} />
										<AvatarFallback className="text-xs bg-zinc-700">
											{item.user.username.substring(0, 2).toUpperCase()}
										</AvatarFallback>
									</Avatar>
								</div>

								<span className={cn('font-medium text-zinc-300')}>{item.user.username}</span>
							</div>

							<span className="text-zinc-600">•</span>

							<div className="flex items-center gap-1">
								<Clock className="h-3.5 w-3.5" />
								<span>{formatTimeAgo(item.lastPostAt || item.createdAt)}</span>
							</div>
						</div>

						{/* Enhanced stats with hover effects */}
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-6 text-xs">
								<div className="flex items-center gap-1.5 text-zinc-400">
									<MessageSquare className="h-4 w-4" />
									<span className="font-medium">{item.postCount}</span>
								</div>
								<div className="flex items-center gap-1.5 text-zinc-400">
									<Eye className="h-4 w-4" />
									<span className="font-medium">{item.viewCount}</span>
								</div>
								<div className="flex items-center gap-1.5 text-zinc-400">
									<ThumbsUp className="h-4 w-4" />
									<span className="font-medium">{item.firstPostLikeCount}</span>
								</div>
							</div>

							<div className="flex items-center gap-2">
								{/* Category tag */}
								{showCategory && (
									<Link href={`/forums/${item.category.slug}`}>
										<span
											className={cn(
												'bg-zinc-800/50 text-zinc-400 border border-zinc-600 transition-all text-xs cursor-pointer rounded px-2 py-0.5',
												'hover:border-orange-500/50 hover:text-orange-300 hover:bg-zinc-800/70'
											)}
											onClick={(e) => {
												e.stopPropagation();
											}}
										>
											{item.category.name}
										</span>
									</Link>
								)}
							</div>
						</div>
					</div>
				</div>
			</Link>

			{/* Quick actions overlay - Hidden on mobile, shown on hover for desktop */}
			{showQuickActions && (
				<div className="hidden sm:flex absolute top-2 right-2 gap-1 bg-zinc-900/90 backdrop-blur-sm rounded-lg p-1 border border-zinc-700/50 shadow-lg opacity-0 animate-fade-in">
					<button
						onClick={(e) => handleQuickAction(e, 'bookmark')}
						className="quick-action-btn p-1.5 hover:bg-zinc-700/50 rounded text-zinc-400 hover:text-orange-300 transition-colors focus-ring"
						title="Bookmark"
						aria-label="Bookmark this thread"
					>
						<Bookmark className="h-3 w-3" />
					</button>
					<button
						onClick={(e) => handleQuickAction(e, 'share')}
						className="quick-action-btn p-1.5 hover:bg-zinc-700/50 rounded text-zinc-400 hover:text-blue-300 transition-colors focus-ring"
						title="Share"
						aria-label="Share this thread"
					>
						<Share2 className="h-3 w-3" />
					</button>
					<button
						onClick={(e) => handleQuickAction(e, 'more')}
						className="quick-action-btn p-1.5 hover:bg-zinc-700/50 rounded text-zinc-400 hover:text-zinc-200 transition-colors focus-ring"
						title="More options"
						aria-label="More options"
					>
						<MoreHorizontal className="h-3 w-3" />
					</button>
				</div>
			)}

			{/* Mobile touch indicator */}
			{isHovered && (
				<div className="sm:hidden absolute right-2 top-1/2 transform -translate-y-1/2">
					<div className="w-1 h-8 bg-gradient-to-b from-orange-400 to-red-400 rounded-full opacity-60" />
				</div>
			)}
		</div>
	);
}

export function ContentFeed({
	items,
	isLoading = false,
	error = null,
	className,
	variant = 'default',
	showCategory = true
}: ContentFeedProps) {
	if (error) {
		return (
			<div className={cn('text-center py-8', className)} role="alert" aria-live="polite">
				<div className="text-red-400 flex items-center justify-center gap-2 animate-error-bounce">
					<span>Failed to load content</span>
				</div>
				<p className="text-xs text-zinc-500 mt-2">{error.message || 'Unknown error occurred'}</p>
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className={cn('w-full', className)} aria-live="polite" aria-label="Loading content">
				<ContentFeedSkeleton count={variant === 'compact' ? 3 : 5} />
			</div>
		);
	}

	if (!items.length) {
		return (
			<div className={cn('text-center py-8 text-zinc-400', className)} role="status">
				<p>No content available</p>
				<p className="text-xs text-zinc-500">Check back later for new discussions</p>
			</div>
		);
	}

	return (
		<div className={cn('w-full', className)}>
			<div
				className="space-y-0"
				role="feed"
				aria-label={`Content feed with ${items.length} items`}
				aria-live="polite"
			>
				{items.map((item, index) => (
					<ContentItem key={item.id} item={item} showCategory={showCategory} />
				))}
			</div>
		</div>
	);
}

export default ContentFeed;
