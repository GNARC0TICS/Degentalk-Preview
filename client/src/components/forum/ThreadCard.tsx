import React, { useState, memo } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import {
	Clock,
	MessageSquare,
	Eye,
	TrendingUp,
	Zap,
	Bookmark,
	Share2,
	Crown,
	Flame
} from 'lucide-react';

import { Card } from '@app/components/ui/card';
import { Badge } from '@app/components/ui/badge';
import { Button } from '@app/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@app/components/ui/avatar';
import { OnlineIndicator, AvatarWithOnline } from '@app/components/common/OnlineIndicator';
import { cn } from '@app/utils/utils';
import { useBreakpoint } from '@app/hooks/useMediaQuery';
import type { Thread } from '@shared/types/thread.types';
import type { ThreadId } from '@shared/types/ids';
import { toId, parseId } from '@shared/types/index';
import { getForumTheme } from '@shared/config/zoneThemes.config';
import { useThreadActionsOptional } from '@app/features/forum/contexts/ThreadActionsContext';
import QuickReplyInput from '@app/components/forum/QuickReplyInput';
import { ButtonTooltip } from '@app/components/ui/tooltip-utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@app/components/ui/tooltip';

export interface ThreadCardProps {
	thread: Thread;
	variant?: 'default' | 'compact' | 'featured' | undefined;
	showPreview?: boolean | undefined;
	onTip?: ((threadId: ThreadId, amount: number) => void) | undefined;
	onBookmark?: ((threadId: ThreadId) => void) | undefined;
	className?: string;
}

const ThreadCard = memo(
	({
		thread,
		variant = 'default',
		showPreview = true,
		onTip,
		onBookmark,
		className
	}: ThreadCardProps) => {
		// If an actions provider exists, defer bookmark state to it
		const actionsCtx = useThreadActionsOptional();

		const [localBookmark, setLocalBookmark] = useState(thread.hasBookmarked ?? false);

		// Sync local state when parent data updates (only when no provider)
		React.useEffect(() => {
			if (!actionsCtx) {
				setLocalBookmark(thread.hasBookmarked ?? false);
			}
		}, [thread.hasBookmarked, actionsCtx]);

		const isBookmarked = actionsCtx ? actionsCtx.isBookmarked : localBookmark;

		const breakpoint = useBreakpoint();

		const isHot = thread.isHot || (thread.hotScore && thread.hotScore > 10);
		const timeAgo = formatDistanceToNow(new Date(thread.createdAt), { addSuffix: true });

		const threadId = parseId<'ThreadId'>(String(thread.id)) || toId<'ThreadId'>(String(thread.id));

		const tipFn = onTip ?? actionsCtx?.tip;
		const bookmarkFn = onBookmark ?? actionsCtx?.toggleBookmark;

		// Responsive spacing based on breakpoint
		const getCardSpacing = () => {
			if (breakpoint.isMobile) {
				return {
					default: 'p-3 space-y-3',
					compact: 'p-2 space-y-2',
					featured: 'p-4 space-y-3 border-2'
				};
			}
			return {
				default: 'p-4 space-y-4',
				compact: 'p-3 space-y-2',
				featured: 'p-6 space-y-4 border-2'
			};
		};

		const cardVariants = getCardSpacing();

		// Resolve theme safely via shared config util
		const zoneTheme = getForumTheme(thread.featuredForum.colorTheme);
		const zoneThemeClass = zoneTheme.border ?? 'border-zinc-700/30 hover:border-zinc-600/60';

		return (
			<Link to={`/threads/${thread.slug}`}>
				<Card
					className={cn(
						'group relative cursor-pointer transition-colors duration-200',
						'bg-zinc-900/40 backdrop-blur-sm border border-zinc-800/50',
						'hover:bg-zinc-900/80',
						zoneThemeClass,
						isHot && 'ring-1 ring-orange-500/30',
						cardVariants[variant],
						className
					)}
				>
					{/* Hot Thread Indicator */}
					{isHot && (
						<div className="absolute -top-2 -right-2 z-10">
							<Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-1 text-xs font-bold">
								<Flame className="w-3 h-3 mr-1" />
								HOT
							</Badge>
						</div>
					)}

					{/* Primary Content Layer */}
					<div className="space-y-3">
						{/* Header Row */}
						<div className="flex items-start justify-between gap-3">
							<div className="flex items-center gap-3 min-w-0 flex-1">
								{/* Responsive avatar sizing */}
								<AvatarWithOnline 
									isOnline={thread.user.isOnline}
									size={breakpoint.isMobile ? 'xs' : 'sm'}
								>
									<Avatar
										className={cn(
											'ring-2 ring-zinc-700/50',
											breakpoint.isMobile ? 'h-8 w-8' : 'h-10 w-10'
										)}
									>
										<AvatarImage src={thread.user.avatarUrl} alt={thread.user.username} />
										<AvatarFallback className="bg-zinc-800 text-zinc-300">
											{thread.user.username.slice(0, 2).toUpperCase()}
										</AvatarFallback>
									</Avatar>
								</AvatarWithOnline>

								<div className="min-w-0 flex-1">
									<div className="flex items-center gap-2">
										<TooltipProvider>
											<Tooltip>
												<TooltipTrigger asChild>
													<span className="font-medium text-zinc-200 truncate cursor-help">
														{thread.user.username}
													</span>
												</TooltipTrigger>
												<TooltipContent side="top" align="start">
													<div className="space-y-1">
														<p className="font-semibold">{thread.user.username}</p>
														{thread.user.displayRole && (
															<p className="text-xs text-zinc-400">Role: {thread.user.displayRole}</p>
														)}
														{thread.user.forumStats && (
															<>
																<p className="text-xs text-zinc-400">Level {thread.user.forumStats.level} • {thread.user.forumStats.xp} XP</p>
																<p className="text-xs text-zinc-400">{thread.user.forumStats.totalPosts} posts • {thread.user.forumStats.totalThreads} threads</p>
															</>
														)}
														<p className="text-xs text-zinc-400">Joined {formatDistanceToNow(new Date(thread.user.joinedAt), { addSuffix: true })}</p>
													</div>
												</TooltipContent>
											</Tooltip>
										</TooltipProvider>
										{thread.user.isVerified && (
											<Crown
												className="w-4 h-4 text-amber-500 flex-shrink-0"
												role="img"
												aria-label="Verified account"
											/>
										)}
										{thread.user.reputation && thread.user.reputation > 100 && (
											<Badge variant="outline" className="text-xs px-1 py-0">
												{thread.user.reputation}
											</Badge>
										)}
									</div>
									{/* Mobile: Simplified metadata */}
									<div
										className={cn(
											'flex items-center gap-2 text-zinc-500',
											breakpoint.isMobile ? 'text-xs' : 'text-xs'
										)}
									>
										<Clock className="w-3 h-3" />
										{timeAgo}
										{!breakpoint.isMobile && (
											<>
												<span>•</span>
												<TooltipProvider>
													<Tooltip>
														<TooltipTrigger asChild>
															<span className="text-zinc-400 cursor-help">{thread.featuredForum.name}</span>
														</TooltipTrigger>
														<TooltipContent>
															<p className="text-xs">Click to explore more threads in {thread.featuredForum.name}</p>
														</TooltipContent>
													</Tooltip>
												</TooltipProvider>
											</>
										)}
									</div>
								</div>
							</div>
						</div>

						{/* Engagement Preview */}
						{thread.engagement && (
							<div className="flex items-center gap-1 text-xs">
								{thread.engagement.totalTips > 0 && (
									<div className="flex items-center gap-1 text-emerald-400">
										<Zap className="w-3 h-3" />
										<span>{thread.engagement.totalTips} DGT</span>
									</div>
								)}
							</div>
						)}
					</div>

					{/* Thread Title */}
					<div className="space-y-2">
						<div className="flex items-start gap-2">
							{/* Status Badges */}
							<div className="flex gap-1 flex-wrap">
								{thread.prefix && (
									<Badge
										variant="outline"
										className={cn(
											'text-xs px-2 py-0.5',
											`bg-${thread.prefix.color}-900/30 text-${thread.prefix.color}-300 border-${thread.prefix.color}-700/30`
										)}
									>
										{thread.prefix.name}
									</Badge>
								)}
								{thread.isSticky && (
									<Badge className="bg-cyan-900/60 text-cyan-300 border-cyan-700/30 text-xs px-2 py-0.5">
										Pinned
									</Badge>
								)}
								{thread.isLocked && (
									<Badge className="bg-red-900/60 text-red-300 border-red-700/30 text-xs px-2 py-0.5">
										Locked
									</Badge>
								)}
							</div>
						</div>

						{/* Responsive typography */}
						<h3
							className={cn(
								'font-semibold text-white leading-tight line-clamp-2 group-hover:text-emerald-400 transition-colors',
								breakpoint.isMobile ? 'text-base' : 'text-lg'
							)}
						>
							{thread.title}
						</h3>
					</div>

					{/* Preview Content */}
					{showPreview && thread.excerpt && (
						<div className="overflow-hidden">
							<p className="text-sm text-zinc-400 line-clamp-2 leading-relaxed">{thread.excerpt}</p>

							{thread.tags && thread.tags.length > 0 && (
								<div className="flex flex-wrap gap-1 mt-2">
									{thread.tags.slice(0, 3).map((tag) => (
										<Badge
											key={tag.id}
											variant="secondary"
											className="text-xs px-2 py-0.5 bg-zinc-800/50 text-zinc-400"
										>
											{tag.name}
										</Badge>
									))}
									{thread.tags.length > 3 && (
										<Badge
											variant="secondary"
											className="text-xs px-2 py-0.5 bg-zinc-800/50 text-zinc-400"
										>
											+{thread.tags.length - 3} more
										</Badge>
									)}
								</div>
							)}
						</div>
					)}

					{/* Bottom Row - Stats and Actions */}
					<div className="flex items-center justify-between pt-3 mt-3 border-t border-zinc-800/50">
						{/* Thread Stats */}
						<div className="flex items-center gap-4 text-xs text-zinc-500">
							<div className="flex items-center gap-1">
								<MessageSquare className="w-3 h-3" />
								<span>{thread.postCount}</span>
							</div>
							<div className="flex items-center gap-1">
								<Eye className="w-3 h-3" />
								<span>{thread.viewCount}</span>
							</div>
							{thread.engagement?.momentum === 'bullish' && (
								<div className="flex items-center gap-1 text-emerald-400">
									<TrendingUp className="w-3 h-3" />
									<span>Trending</span>
								</div>
							)}
						</div>

						{/* Quick Actions */}
						<div
							className={cn(
								'flex items-center',
								// Mobile: Larger touch targets, different spacing
								breakpoint.isMobile ? 'gap-2' : 'gap-1'
							)}
							onClick={(e) => e.preventDefault()}
						>
							{onTip && (
								<Button
									size={breakpoint.isMobile ? 'default' : 'sm'}
									variant="ghost"
									aria-label="Tip"
									className={cn(
										'p-0',
										tipFn
											? 'text-zinc-400 hover:text-emerald-400 hover:bg-emerald-900/20'
											: 'text-zinc-700 cursor-not-allowed',
										breakpoint.isMobile ? 'h-11 w-11' : 'h-8 w-8'
									)}
									disabled={!tipFn}
									onClick={(e) => {
										e.preventDefault();
										e.stopPropagation();
										tipFn?.(threadId, 10);
									}}
								>
									<Zap
										className={cn(breakpoint.isMobile ? 'w-5 h-5' : 'w-4 h-4')}
										aria-hidden="true"
									/>
									<span className="sr-only">Tip</span>
								</Button>
							)}

							<Button
								size={breakpoint.isMobile ? 'default' : 'sm'}
								variant="ghost"
								aria-label={isBookmarked ? 'Remove Bookmark' : 'Bookmark'}
								className={cn(
									'p-0 transition-colors',
									isBookmarked
										? 'text-amber-400 hover:text-amber-300'
										: 'text-zinc-400 hover:text-amber-400 hover:bg-amber-900/20',
									// Mobile: 44px touch target minimum
									breakpoint.isMobile ? 'h-11 w-11' : 'h-8 w-8'
								)}
								disabled={!bookmarkFn}
								onClick={(e) => {
									e.preventDefault();
									e.stopPropagation();
									if (!actionsCtx) {
										setLocalBookmark(!localBookmark);
									}
									if (!bookmarkFn) return;
									if (bookmarkFn.length === 0) {
										(bookmarkFn as () => void)();
									} else {
										bookmarkFn?.(threadId);
									}
								}}
							>
								<Bookmark
									className={cn(
										breakpoint.isMobile ? 'w-5 h-5' : 'w-4 h-4',
										isBookmarked && 'fill-current'
									)}
									aria-hidden="true"
								/>
								<span className="sr-only">Bookmark</span>
							</Button>

							{/* Share button - Hidden on mobile to save space */}
							{!breakpoint.isMobile &&
								(actionsCtx?.share ? (
									<ButtonTooltip content="Copy link" side="top">
										<Button
											size="sm"
											variant="ghost"
											aria-label="Share"
											className="h-8 w-8 p-0 text-zinc-400 hover:text-blue-400 hover:bg-blue-900/20"
											onClick={(e) => {
												e.preventDefault();
												e.stopPropagation();
												actionsCtx.share();
											}}
										>
											<Share2 className="w-4 h-4" aria-hidden="true" />
											<span className="sr-only">Share</span>
										</Button>
									</ButtonTooltip>
								) : (
									<Button
										size="sm"
										variant="ghost"
										aria-label="Share (disabled)"
										className="h-8 w-8 p-0 text-zinc-700 cursor-not-allowed"
										disabled
									>
										<Share2 className="w-4 h-4" aria-hidden="true" />
										<span className="sr-only">Share</span>
									</Button>
								))}
						</div>
					</div>

					{actionsCtx && (
						<div className="pt-3">
							<QuickReplyInput />
						</div>
					)}
				</Card>
			</Link>
		);
	}
);

ThreadCard.displayName = 'ThreadCard';

export default ThreadCard;
export { ThreadCard };
