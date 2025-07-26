import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@app/utils/utils';
import {
	MessageSquare,
	Eye,
	ThumbsUp,
	Clock,
	TrendingUp,
	Bookmark,
	Share2,
	MoreHorizontal,
	Flame,
	Bell,
	ChevronDown,
	Coins
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@app/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@app/components/ui/avatar';
import { Skeleton } from '@app/components/ui/skeleton';
import type { Thread } from '@shared/types/thread.types';
import theme from '@app/config/theme.config';
import { MentionContentItem } from '@app/components/mentions/MentionContentItem';

export interface ContentFeedProps {
	items: Thread[];
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
					className="border-b border-zinc-800 last:border-b-0 p-4"
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

function ContentItem({ item, showCategory = true }: { item: Thread; showCategory?: boolean }) {
	const [isHovered, setIsHovered] = useState(false);
	const [showQuickActions, setShowQuickActions] = useState(false);
	const [isExpanded, setIsExpanded] = useState(false);

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
		
		// Handle different quick actions
		switch (action) {
			case 'bookmark':
				// TODO: Implement bookmark functionality
				console.log('Bookmarking thread:', item.id);
				break;
			case 'share':
				// Copy thread URL to clipboard
				const threadUrl = `${window.location.origin}/threads/${item.slug}`;
				navigator.clipboard.writeText(threadUrl);
				break;
			case 'hide':
				// TODO: Implement hide functionality
				console.log('Hiding thread:', item.id);
				break;
		}
	};

	return (
		<div
			className="content-item relative border-b border-zinc-800 last:border-b-0 hover:bg-zinc-900/30 transition-colors"
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
		>

			{/* Hot indicator */}
			{hotLevel === 'volcanic' && (
				<div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500" />
			)}
			{hotLevel === 'hot' && (
				<div className="absolute left-0 top-0 bottom-0 w-0.5 bg-orange-400" />
			)}

			<Link to={`/threads/${item.slug}`}>
				<div className="relative cursor-pointer p-4">
					<div className="space-y-3">
						{/* Thread title with enhanced hover effects */}
						<div className="flex items-start gap-3">
							<div className="relative">
								{/* Unread indicator */}
								{item.hasNewReplies && !isHovered && (
									<div className="absolute -left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
								)}
								{hotLevel === 'volcanic' ? (
									<Flame className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
								) : (
									<TrendingUp
										className={cn(
											'h-5 w-5 mt-0.5 flex-shrink-0',
											hotLevel === 'hot' ? 'text-orange-400' : 'text-zinc-500'
										)}
									/>
								)}
							</div>

							<div className="flex-1 min-w-0">
								<h3
									className={cn(
										'text-zinc-100 line-clamp-2 font-medium',
										isHovered && 'text-white'
									)}
								>
									{item.title}
								</h3>
								{/* Excerpt preview - hidden on small screens */}
								{(item.excerpt || item.content) && (
									<>
										<p
											className={cn(
												'mt-1 text-zinc-400 hidden md:block',
												'group-hover:text-zinc-300 transition-colors',
												!isExpanded && 'line-clamp-2'
											)}
											style={{
												fontSize: theme.components.feed.typography.preview.size,
												fontWeight: theme.components.feed.typography.preview.weight,
												lineHeight: theme.components.feed.typography.preview.lineHeight,
												transitionDuration: theme.animation.durations.normal
											}}
										>
											{(() => {
												const text = item.excerpt || item.content || '';
												if (isExpanded) return text;
												// Strip HTML and truncate to 180 chars for better preview
												const stripped = text.replace(/<[^>]*>/g, '').trim();
												return stripped.length > 180 ? stripped.substring(0, 180) + '...' : stripped;
											})()}
										</p>
										{(item.excerpt || item.content || '').length > 180 && (
											<button
												className="hidden md:inline-flex items-center gap-1 mt-1 text-xs text-orange-400 hover:text-orange-300 transition-colors"
												onClick={(e) => {
													e.preventDefault();
													e.stopPropagation();
													setIsExpanded(!isExpanded);
												}}
											>
												<span>{isExpanded ? 'Show less' : 'Read more'}</span>
												<ChevronDown className={cn('h-3 w-3 transition-transform', isExpanded && 'rotate-180')} />
											</button>
										)}
									</>
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
								{item.hasNewReplies && (
									<div className="flex items-center gap-1 relative">
										<div className="relative">
											<div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
											<div className="absolute inset-0 w-2 h-2 bg-green-400 rounded-full animate-ping" />
										</div>
										<span className="text-xs text-green-400 font-medium">New</span>
									</div>
								)}
							</div>
						</div>

						{/* User info with enhanced avatars */}
						<div className="flex items-center gap-3" style={{ fontSize: theme.components.feed.typography.meta.size, color: theme.components.feed.typography.meta.color }}>
							<div className="flex items-center gap-2">
								<div className="relative">
									<Avatar className="h-8 w-8 ring-2 ring-zinc-800 hover:ring-zinc-700 transition-all">
										<AvatarImage src={item.user.avatarUrl || undefined} alt={item.user.username} />
										<AvatarFallback className="text-xs bg-zinc-800">
											{item.user.username.substring(0, 2).toUpperCase()}
										</AvatarFallback>
									</Avatar>
									{item.user.isVerified && (
										<div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
											<svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
												<path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
											</svg>
										</div>
									)}
								</div>

								<span className="font-medium text-zinc-300">{item.user.username}</span>
								{item.user.role === 'admin' && (
									<Badge variant="outline" className="border-blue-500/30 text-blue-300 text-xs px-1.5 py-0">
										Staff
									</Badge>
								)}
							</div>

							<span className="text-zinc-600">•</span>

							<div className="flex items-center gap-1">
								<Clock className="h-3.5 w-3.5" />
								<span title={new Date(item.lastPostAt || item.createdAt).toLocaleString()}>
									{formatTimeAgo(item.lastPostAt || item.createdAt)}
								</span>
							</div>
						</div>

						{/* Enhanced stats with hover effects */}
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2 text-xs" style={{ color: theme.components.feed.typography.stats.color }}>
								<span className="flex items-center gap-1">
									<span>💬</span>
									<span style={{ fontWeight: theme.components.feed.typography.stats.weight }}>
										{item.postCount} {item.postCount === 1 ? 'reply' : 'replies'}
									</span>
								</span>
								<span className="text-zinc-600">·</span>
								<span className="flex items-center gap-1">
									<span>👁️</span>
									<span style={{ fontWeight: theme.components.feed.typography.stats.weight }}>
										{item.viewCount.toLocaleString()} {item.viewCount === 1 ? 'view' : 'views'}
									</span>
								</span>
								{item.totalTips && item.totalTips > 0 && (
									<>
										<span className="text-zinc-600">·</span>
										<span className="flex items-center gap-1">
											<span>💰</span>
											<span style={{ fontWeight: theme.components.feed.typography.stats.weight }}>
												{item.totalTips.toLocaleString()} DGT tipped
											</span>
										</span>
									</>
								)}
							</div>

							<div className="flex items-center gap-2">
								{/* Category tag */}
								{showCategory && item.zone && (
									<Link to={`/forums/${item.featuredForum.slug}`}>
										<span
											className={cn(
												'bg-zinc-900/60 text-zinc-300 border border-zinc-700 transition-all cursor-pointer rounded px-2 py-0.5',
												'hover:border-orange-500/50 hover:text-orange-300 hover:bg-zinc-800/80',
												'hover:shadow-md hover:shadow-orange-500/10'
											)}
											style={{ 
												fontSize: theme.components.feed.typography.stats.size,
												borderColor: item.featuredForum.colorTheme ? `${item.featuredForum.colorTheme}50` : undefined
											}}
											onClick={(e) => {
												e.stopPropagation();
											}}
										>
											{item.featuredForum.name}
										</span>
									</Link>
								)}
							</div>
						</div>
					</div>
				</div>
			</Link>

			{/* Enhanced quick actions overlay */}
			{showQuickActions && (
				<div className="hidden sm:flex absolute top-2 right-2 gap-1 bg-zinc-950/95 backdrop-blur-md rounded-lg p-1 border border-zinc-800/80 shadow-xl opacity-0 animate-fade-in">
					<button
						onClick={(e) => handleQuickAction(e, 'bookmark')}
						className="quick-action-btn p-1.5 hover:bg-zinc-800/80 rounded text-zinc-400 hover:text-orange-300 transition-all hover:scale-110 focus-ring"
						title="Bookmark"
						aria-label="Bookmark this thread"
					>
						<Bookmark className="h-3 w-3" />
					</button>
					<button
						onClick={(e) => handleQuickAction(e, 'share')}
						className="quick-action-btn p-1.5 hover:bg-zinc-800/80 rounded text-zinc-400 hover:text-blue-300 transition-all hover:scale-110 focus-ring"
						title="Share"
						aria-label="Share this thread"
					>
						<Share2 className="h-3 w-3" />
					</button>
					<button
						onClick={(e) => handleQuickAction(e, 'hide')}
						className="quick-action-btn p-1.5 hover:bg-zinc-800/80 rounded text-zinc-400 hover:text-red-300 transition-all hover:scale-110 focus-ring"
						title="Hide thread"
						aria-label="Hide this thread"
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
				{items.map((item, index) => {
					// Check if this is a mention item
					const isMention = item.metadata?.mentionId != null;
					
					if (isMention) {
						return <MentionContentItem key={item.id || `mention-${index}`} item={item} />;
					}
					
					return <ContentItem key={item.id} item={item} showCategory={showCategory} />;
				})}
			</div>
		</div>
	);
}

export default ContentFeed;
