import React, { useState, memo } from 'react';
import { Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
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
	Flame,
	Heart,
	ArrowUp,
	MoreHorizontal,
	Pin
} from 'lucide-react';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useBreakpoint } from '@/hooks/useMediaQuery';
import type { ThreadDisplay } from '@/types/thread.types';

export interface EnhancedThreadCardProps {
	thread: ThreadDisplay;
	variant?: 'default' | 'compact' | 'featured' | 'mobile-optimized';
	showPreview?: boolean;
	onTip?: (threadId: string, amount: number) => void;
	onBookmark?: (threadId: string) => void;
	onLike?: (threadId: string) => void;
	onShare?: (threadId: string) => void;
	className?: string;
}

const EnhancedThreadCard = memo(
	({
		thread,
		variant = 'default',
		showPreview = true,
		onTip,
		onBookmark,
		onLike,
		onShare,
		className
	}: EnhancedThreadCardProps) => {
		const { isMobile, isTablet } = useBreakpoint();
		const [isExpanded, setIsExpanded] = useState(false);
		const [isLiked, setIsLiked] = useState(false);
		const [isBookmarked, setIsBookmarked] = useState(false);
		const [showActions, setShowActions] = useState(false);

		// Enhanced mobile-first responsive variants
		const isMobileOptimized = variant === 'mobile-optimized' || (isMobile && variant === 'default');
		const isCompactView = variant === 'compact' || isTablet;

		// Animation variants for smooth interactions
		const cardVariants = {
			hidden: { opacity: 0, y: 20, scale: 0.95 },
			visible: {
				opacity: 1,
				y: 0,
				scale: 1,
				transition: {
					duration: 0.3,
					ease: [0.25, 0.46, 0.45, 0.94]
				}
			},
			hover: {
				y: -2,
				scale: 1.02,
				transition: {
					duration: 0.2,
					ease: 'easeOut'
				}
			},
			tap: {
				scale: 0.98,
				transition: {
					duration: 0.1
				}
			}
		};

		const actionVariants = {
			hidden: { opacity: 0, scale: 0.8, y: 10 },
			visible: {
				opacity: 1,
				scale: 1,
				y: 0,
				transition: {
					duration: 0.2,
					delay: 0.1
				}
			}
		};

		// Enhanced touch-friendly action handlers
		const handleLike = (e: React.MouseEvent) => {
			e.preventDefault();
			e.stopPropagation();
			setIsLiked(!isLiked);
			onLike?.(thread.id);
		};

		const handleBookmark = (e: React.MouseEvent) => {
			e.preventDefault();
			e.stopPropagation();
			setIsBookmarked(!isBookmarked);
			onBookmark?.(thread.id);
		};

		const handleShare = (e: React.MouseEvent) => {
			e.preventDefault();
			e.stopPropagation();
			onShare?.(thread.id);
		};

		const formatViewCount = (count: number) => {
			if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
			if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
			return count.toString();
		};

		const getThreadStatusIcon = () => {
			if (thread.isSticky) return <Pin className="w-3 h-3 text-yellow-400" />;
			if (thread.isSolved) return <Crown className="w-3 h-3 text-emerald-400" />;
			if (thread.firstPostLikeCount > 50) return <Flame className="w-3 h-3 text-orange-400" />;
			return null;
		};

		// Mobile-optimized layout
		if (isMobileOptimized) {
			return (
				<motion.div
					variants={cardVariants}
					initial="hidden"
					animate="visible"
					whileHover="hover"
					whileTap="tap"
					className={cn(className)}
				>
					<Card className="bg-zinc-900/90 border-zinc-800/50 backdrop-blur-sm hover:border-zinc-700/50 transition-all duration-200">
						<Link href={`/threads/${thread.slug}`}>
							<div className="p-4 space-y-3">
								{/* Header with user and metadata */}
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-3 flex-1 min-w-0">
										<Avatar className="w-8 h-8">
											<AvatarImage src={thread.user.activeAvatarUrl} />
											<AvatarFallback className="text-xs">
												{thread.user.username.slice(0, 2).toUpperCase()}
											</AvatarFallback>
										</Avatar>
										<div className="flex flex-col min-w-0 flex-1">
											<span className="text-sm font-medium text-white truncate">
												{thread.user.username}
											</span>
											<div className="flex items-center gap-2 text-xs text-zinc-400">
												<Clock className="w-3 h-3" />
												{formatDistanceToNow(new Date(thread.createdAt), { addSuffix: true })}
											</div>
										</div>
									</div>
									{getThreadStatusIcon()}
								</div>

								{/* Title with better typography for mobile */}
								<h3 className="text-base font-semibold text-white leading-snug line-clamp-2">
									{thread.title}
								</h3>

								{/* Mobile-optimized stats */}
								<div className="flex items-center justify-between pt-2">
									<div className="flex items-center gap-4 text-xs text-zinc-400">
										<div className="flex items-center gap-1">
											<Eye className="w-3 h-3" />
											{formatViewCount(thread.viewCount)}
										</div>
										<div className="flex items-center gap-1">
											<MessageSquare className="w-3 h-3" />
											{thread.postCount}
										</div>
									</div>

									{/* Touch-friendly action buttons */}
									<div className="flex items-center gap-1">
										<motion.button
											whileHover={{ scale: 1.1 }}
											whileTap={{ scale: 0.9 }}
											onClick={handleLike}
											className={cn(
												'flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-colors',
												isLiked
													? 'bg-red-500/20 text-red-400'
													: 'bg-zinc-800/50 text-zinc-400 hover:text-red-400'
											)}
										>
											<Heart className={cn('w-3 h-3', isLiked && 'fill-current')} />
											{thread.firstPostLikeCount}
										</motion.button>

										<motion.button
											whileHover={{ scale: 1.1 }}
											whileTap={{ scale: 0.9 }}
											onClick={handleBookmark}
											className={cn(
												'p-1.5 rounded-full transition-colors',
												isBookmarked
													? 'bg-blue-500/20 text-blue-400'
													: 'bg-zinc-800/50 text-zinc-400 hover:text-blue-400'
											)}
										>
											<Bookmark className={cn('w-3 h-3', isBookmarked && 'fill-current')} />
										</motion.button>
									</div>
								</div>

								{/* Zone indicator */}
								{thread.zone && (
									<Badge variant="outline" className="text-xs">
										{thread.zone.name}
									</Badge>
								)}
							</div>
						</Link>
					</Card>
				</motion.div>
			);
		}

		// Default enhanced layout for tablet/desktop
		return (
			<motion.div
				variants={cardVariants}
				initial="hidden"
				animate="visible"
				whileHover="hover"
				onHoverStart={() => setShowActions(true)}
				onHoverEnd={() => setShowActions(false)}
				className={cn(className)}
			>
				<Card className="bg-zinc-900/90 border-zinc-800/50 backdrop-blur-sm hover:border-zinc-700/50 transition-all duration-200 group">
					<Link href={`/threads/${thread.slug}`}>
						<div className="p-6">
							{/* Enhanced header */}
							<div className="flex items-start justify-between mb-4">
								<div className="flex items-center gap-3">
									<Avatar className="w-10 h-10">
										<AvatarImage src={thread.user.activeAvatarUrl} />
										<AvatarFallback>
											{thread.user.username.slice(0, 2).toUpperCase()}
										</AvatarFallback>
									</Avatar>
									<div>
										<div className="flex items-center gap-2">
											<span className="font-medium text-white">{thread.user.username}</span>
											{getThreadStatusIcon()}
										</div>
										<div className="flex items-center gap-2 text-sm text-zinc-400">
											<Clock className="w-3 h-3" />
											{formatDistanceToNow(new Date(thread.createdAt), { addSuffix: true })}
										</div>
									</div>
								</div>

								{/* Enhanced action menu */}
								<AnimatePresence>
									{showActions && (
										<motion.div
											variants={actionVariants}
											initial="hidden"
											animate="visible"
											exit="hidden"
											className="flex items-center gap-2"
										>
											<Button
												variant="ghost"
												size="sm"
												onClick={handleLike}
												className={cn('h-8 px-3', isLiked && 'text-red-400')}
											>
												<Heart className={cn('w-4 h-4', isLiked && 'fill-current')} />
												{thread.firstPostLikeCount}
											</Button>
											<Button
												variant="ghost"
												size="sm"
												onClick={handleBookmark}
												className={cn('h-8 px-2', isBookmarked && 'text-blue-400')}
											>
												<Bookmark className={cn('w-4 h-4', isBookmarked && 'fill-current')} />
											</Button>
											<Button variant="ghost" size="sm" onClick={handleShare} className="h-8 px-2">
												<Share2 className="w-4 h-4" />
											</Button>
										</motion.div>
									)}
								</AnimatePresence>
							</div>

							{/* Enhanced title */}
							<h3 className="text-lg font-semibold text-white mb-3 leading-tight group-hover:text-emerald-400 transition-colors">
								{thread.title}
							</h3>

							{/* Enhanced stats */}
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-6 text-sm text-zinc-400">
									<div className="flex items-center gap-2">
										<Eye className="w-4 h-4" />
										{formatViewCount(thread.viewCount)} views
									</div>
									<div className="flex items-center gap-2">
										<MessageSquare className="w-4 h-4" />
										{thread.postCount} replies
									</div>
									<div className="flex items-center gap-2">
										<TrendingUp className="w-4 h-4" />
										{thread.firstPostLikeCount} likes
									</div>
								</div>

								{thread.zone && (
									<Badge variant="outline" className="text-xs">
										{thread.zone.name}
									</Badge>
								)}
							</div>
						</div>
					</Link>
				</Card>
			</motion.div>
		);
	}
);

EnhancedThreadCard.displayName = 'EnhancedThreadCard';

export default EnhancedThreadCard;
