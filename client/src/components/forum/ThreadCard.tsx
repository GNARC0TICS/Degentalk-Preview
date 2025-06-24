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
	Flame
} from 'lucide-react';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

export interface ThreadCardProps {
	thread: {
		id: string;
		title: string;
		slug: string;
		excerpt?: string;
		createdAt: string;
		lastPostAt?: string;
		viewCount: number;
		postCount: number;
		isSticky?: boolean;
		isLocked?: boolean;
		isHot?: boolean;
		hotScore?: number;
		user: {
			id: string;
			username: string;
			avatarUrl?: string;
			reputation?: number;
			isVerified?: boolean;
		};
		zone: {
			name: string;
			slug: string;
			colorTheme: string;
		};
		tags?: Array<{
			id: number;
			name: string;
			color?: string;
		}>;
		prefix?: {
			name: string;
			color: string;
		};
		engagement?: {
			totalTips: number;
			uniqueTippers: number;
			bookmarks: number;
			momentum: 'bullish' | 'bearish' | 'neutral';
		};
	};
	variant?: 'default' | 'compact' | 'featured';
	showPreview?: boolean;
	onTip?: (threadId: string, amount: number) => void;
	onBookmark?: (threadId: string) => void;
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
		const [isHovered, setIsHovered] = useState(false);
		const [isBookmarked, setIsBookmarked] = useState(false);

		const isHot = thread.isHot || (thread.hotScore && thread.hotScore > 10);
		const timeAgo = formatDistanceToNow(new Date(thread.createdAt), { addSuffix: true });

		const handleTip = (e: React.MouseEvent) => {
			e.preventDefault();
			e.stopPropagation();
			onTip?.(thread.id, 10); // Default tip amount
		};

		const handleBookmark = (e: React.MouseEvent) => {
			e.preventDefault();
			e.stopPropagation();
			setIsBookmarked(!isBookmarked);
			onBookmark?.(thread.id);
		};

		const cardVariants = {
			default: 'p-4 space-y-4',
			compact: 'p-3 space-y-2',
			featured: 'p-6 space-y-4 border-2'
		} as const;

		const zoneColorClasses = {
			pit: 'border-red-500/30 hover:border-red-500/60',
			mission: 'border-blue-500/30 hover:border-blue-500/60',
			casino: 'border-purple-500/30 hover:border-purple-500/60',
			briefing: 'border-amber-500/30 hover:border-amber-500/60',
			archive: 'border-gray-500/30 hover:border-gray-500/60',
			shop: 'border-violet-500/30 hover:border-violet-500/60'
		} as const;

		const zoneThemeClass =
			zoneColorClasses[thread.zone.colorTheme as keyof typeof zoneColorClasses] ||
			'border-zinc-700/30 hover:border-zinc-600/60';

		return (
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3 }}
				onHoverStart={() => setIsHovered(true)}
				onHoverEnd={() => setIsHovered(false)}
			>
				<Link href={`/threads/${thread.slug}`}>
					<Card
						className={cn(
							'group relative cursor-pointer transition-all duration-300 ease-out',
							'bg-zinc-900/40 backdrop-blur-sm border border-zinc-800/50',
							'hover:bg-zinc-900/80 hover:scale-[1.02] hover:shadow-xl hover:shadow-black/20',
							zoneThemeClass,
							isHot && 'ring-1 ring-orange-500/30',
							cardVariants[variant],
							className
						)}
					>
						{/* Hot Thread Indicator */}
						{isHot && (
							<motion.div
								initial={{ scale: 0 }}
								animate={{ scale: 1 }}
								className="absolute -top-2 -right-2 z-10"
							>
								<Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-1 text-xs font-bold">
									<Flame className="w-3 h-3 mr-1" />
									HOT
								</Badge>
							</motion.div>
						)}

						{/* Primary Content Layer */}
						<div className="space-y-3">
							{/* Header Row */}
							<div className="flex items-start justify-between gap-3">
								<div className="flex items-center gap-3 min-w-0 flex-1">
									<Avatar className="h-10 w-10 ring-2 ring-zinc-700/50">
										<AvatarImage src={thread.user.avatarUrl} alt={thread.user.username} />
										<AvatarFallback className="bg-zinc-800 text-zinc-300">
											{thread.user.username.slice(0, 2).toUpperCase()}
										</AvatarFallback>
									</Avatar>

									<div className="min-w-0 flex-1">
										<div className="flex items-center gap-2">
											<span className="font-medium text-zinc-200 truncate">
												{thread.user.username}
											</span>
											{thread.user.isVerified && (
												<Crown className="w-4 h-4 text-amber-500 flex-shrink-0" />
											)}
											{thread.user.reputation && thread.user.reputation > 100 && (
												<Badge variant="outline" className="text-xs px-1 py-0">
													{thread.user.reputation}
												</Badge>
											)}
										</div>
										<div className="flex items-center gap-2 text-xs text-zinc-500">
											<Clock className="w-3 h-3" />
											{timeAgo}
											<span>•</span>
											<span className="text-zinc-400">{thread.zone.name}</span>
										</div>
									</div>
								</div>
							</div>

							{/* Engagement Preview */}
							{thread.engagement && (
								<motion.div
									initial={{ opacity: 0, x: 20 }}
									animate={{ opacity: isHovered ? 1 : 0.7, x: 0 }}
									className="flex items-center gap-1 text-xs"
								>
									{thread.engagement.totalTips > 0 && (
										<div className="flex items-center gap-1 text-emerald-400">
											<Zap className="w-3 h-3" />
											<span>{thread.engagement.totalTips} DGT</span>
										</div>
									)}
								</motion.div>
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

							<h3 className="text-lg font-semibold text-white leading-tight line-clamp-2 group-hover:text-emerald-400 transition-colors">
								{thread.title}
							</h3>
						</div>

						{/* Progressive Disclosure Content */}
						<AnimatePresence>
							{isHovered && showPreview && thread.excerpt && (
								<motion.div
									initial={{ opacity: 0, height: 0 }}
									animate={{ opacity: 1, height: 'auto' }}
									exit={{ opacity: 0, height: 0 }}
									transition={{ duration: 0.2 }}
									className="overflow-hidden"
								>
									<p className="text-sm text-zinc-400 line-clamp-2 leading-relaxed">
										{thread.excerpt}
									</p>

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
								</motion.div>
							)}
						</AnimatePresence>
					</Card>
				</Link>

				{/* Bottom Row - Stats and Actions */}
				<div className="flex items-center justify-between pt-2 border-t border-zinc-800/50">
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
					<AnimatePresence>
						{isHovered && (
							<motion.div
								initial={{ opacity: 0, x: 20 }}
								animate={{ opacity: 1, x: 0 }}
								exit={{ opacity: 0, x: 20 }}
								transition={{ duration: 0.2 }}
								className="flex items-center gap-1"
								onClick={(e) => e.preventDefault()}
							>
								{onTip && (
									<Button
										size="sm"
										variant="ghost"
										className="h-8 w-8 p-0 text-zinc-400 hover:text-emerald-400 hover:bg-emerald-900/20"
										onClick={handleTip}
									>
										<Zap className="w-4 h-4" />
									</Button>
								)}

								<Button
									size="sm"
									variant="ghost"
									className={cn(
										'h-8 w-8 p-0 transition-colors',
										isBookmarked
											? 'text-amber-400 hover:text-amber-300'
											: 'text-zinc-400 hover:text-amber-400 hover:bg-amber-900/20'
									)}
									onClick={handleBookmark}
								>
									<Bookmark className={cn('w-4 h-4', isBookmarked && 'fill-current')} />
								</Button>

								<Button
									size="sm"
									variant="ghost"
									className="h-8 w-8 p-0 text-zinc-400 hover:text-blue-400 hover:bg-blue-900/20"
								>
									<Share2 className="w-4 h-4" />
								</Button>
							</motion.div>
						)}
					</AnimatePresence>
				</div>
			</motion.div>
		);
	}
);

ThreadCard.displayName = 'ThreadCard';

export default ThreadCard;
export { ThreadCard };
