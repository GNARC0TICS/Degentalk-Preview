import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
	Heart,
	Reply,
	Quote,
	Flag,
	MoreHorizontal,
	Edit,
	Trash,
	Bookmark,
	Share,
	Link2,
	ThumbsUp,
	Coins,
	MessageSquare,
	PenTool
} from 'lucide-react';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { brandConfig } from '@/config/brand.config';
import type { PostId } from '@shared/types/ids';

interface PostActionsProps {
	postId: PostId;
	likeCount?: number;
	hasLiked?: boolean;
	canEdit?: boolean;
	canDelete?: boolean;
	canMarkSolution?: boolean;
	isSolution?: boolean;
	isThreadSolved?: boolean;
	isFirst?: boolean;
	tippingEnabled?: boolean;
	className?: string;
	onLike?: (postId: PostId, hasLiked: boolean) => void;
	onReply?: (postId: PostId) => void;
	onQuote?: (postId: PostId) => void;
	onEdit?: (postId: PostId) => void;
	onDelete?: (postId: PostId) => void;
	onMarkSolution?: (postId: PostId) => void;
	onTip?: (postId: PostId) => void;
	onReport?: (postId: PostId) => void;
	onBookmark?: (postId: PostId) => void;
	onShare?: (postId: PostId) => void;
	onCopyLink?: (postId: PostId) => void;
}

export function PostActions({
	postId,
	likeCount = 0,
	hasLiked = false,
	canEdit = false,
	canDelete = false,
	canMarkSolution = false,
	isSolution = false,
	isThreadSolved = false,
	isFirst = false,
	tippingEnabled = false,
	className = '',
	onLike,
	onReply,
	onQuote,
	onEdit,
	onDelete,
	onMarkSolution,
	onTip,
	onReport,
	onBookmark,
	onShare,
	onCopyLink
}: PostActionsProps) {
	const [isBookmarked, setIsBookmarked] = useState(false);

	const handleLike = () => {
		onLike?.(postId, hasLiked);
	};

	const handleReply = () => {
		onReply?.(postId);
	};

	const handleQuote = () => {
		onQuote?.(postId);
	};

	const handleBookmark = () => {
		setIsBookmarked(!isBookmarked);
		onBookmark?.(postId);
	};

	const handleCopyLink = async () => {
		const postUrl = `${window.location.origin}${window.location.pathname}#post-${postId}`;
		try {
			await navigator.clipboard.writeText(postUrl);
			onCopyLink?.(postId);
		} catch (err) {
			// Failed to copy link
		}
	};

	return (
		<div
			className={cn(
				'flex items-center justify-between px-4 py-3',
				'border-t border-zinc-700/30',
				'bg-zinc-800/20',
				className
			)}
		>
			{/* Left side - Primary actions */}
			<div className="flex items-center space-x-1">
				{/* Like button */}
				<Button
					size="sm"
					variant="ghost"
					className={cn(
						'h-8 px-3 transition-all',
						hasLiked
							? 'text-pink-400 bg-pink-500/10 hover:bg-pink-500/20'
							: 'text-zinc-400 hover:text-pink-400 hover:bg-pink-500/10'
					)}
					onClick={handleLike}
				>
					<Heart className={cn('h-4 w-4 mr-1.5', hasLiked && 'fill-current')} />
					<span className="text-xs">{likeCount > 0 ? likeCount : 'Like'}</span>
				</Button>

				{/* Reply button */}
				<Button
					size="sm"
					variant="ghost"
					className="h-8 px-3 text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all"
					onClick={handleReply}
				>
					<MessageSquare className="h-4 w-4 mr-1.5" />
					<span className="text-xs">Reply</span>
				</Button>

				{/* Quote button */}
				<Button
					size="sm"
					variant="ghost"
					className="h-8 px-3 text-zinc-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all"
					onClick={handleQuote}
				>
					<PenTool className="h-4 w-4 mr-1.5" />
					<span className="text-xs">Quote</span>
				</Button>

				{/* Mark as Solution button - only show on replies, not original post */}
				{canMarkSolution && !isThreadSolved && !isSolution && !isFirst && (
					<Button
						size="sm"
						variant="outline"
						className="h-8 px-3 border-emerald-600/50 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/70 transition-all"
						onClick={() => onMarkSolution?.(postId)}
					>
						<ThumbsUp className="h-4 w-4 mr-1.5" />
						<span className="text-xs">Mark Solution</span>
					</Button>
				)}

				{/* Tip button (if enabled) */}
				{tippingEnabled && (
					<Button
						size="sm"
						variant="ghost"
						className="h-8 px-3 text-zinc-400 hover:text-yellow-400 hover:bg-yellow-500/10 transition-all"
						onClick={() => onTip?.(postId)}
					>
						<Coins className="h-4 w-4 mr-1.5" />
						<span className="text-xs">Tip</span>
					</Button>
				)}
			</div>

			{/* Right side - Secondary actions */}
			<div className="flex items-center space-x-1">
				{/* Quick bookmark (visible) */}
				<Button
					size="sm"
					variant="ghost"
					className={cn(
						'h-8 w-8 p-0 transition-all',
						isBookmarked
							? 'text-amber-400 bg-amber-500/10 hover:bg-amber-500/20'
							: 'text-zinc-400 hover:text-amber-400 hover:bg-amber-500/10'
					)}
					onClick={handleBookmark}
					title={isBookmarked ? 'Remove bookmark' : 'Bookmark post'}
				>
					<Bookmark className={cn('h-4 w-4', isBookmarked && 'fill-current')} />
				</Button>

				{/* More actions dropdown */}
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							size="sm"
							variant="ghost"
							className="h-8 w-8 p-0 text-zinc-400 hover:text-zinc-300 hover:bg-zinc-700/50 transition-all"
						>
							<MoreHorizontal className="h-4 w-4" />
							<span className="sr-only">More options</span>
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						align="end"
						className="bg-zinc-900/95 backdrop-blur-sm border-zinc-700/50 shadow-xl"
					>
						<DropdownMenuItem
							onClick={handleCopyLink}
							className="text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800/80 transition-colors"
						>
							<Link2 className="h-4 w-4 mr-2" />
							Copy Link
						</DropdownMenuItem>

						<DropdownMenuItem
							onClick={() => onShare?.(postId)}
							className="text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800/80 transition-colors"
						>
							<Share className="h-4 w-4 mr-2" />
							Share Post
						</DropdownMenuItem>

						{(canEdit || canDelete) && <DropdownMenuSeparator className="bg-zinc-700/50" />}

						{canEdit && (
							<DropdownMenuItem
								onClick={() => onEdit?.(postId)}
								className="text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800/80 transition-colors"
							>
								<Edit className="h-4 w-4 mr-2" />
								Edit Post
							</DropdownMenuItem>
						)}

						{canDelete && (
							<DropdownMenuItem
								onClick={() => onDelete?.(postId)}
								className="text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
							>
								<Trash className="h-4 w-4 mr-2" />
								Delete Post
							</DropdownMenuItem>
						)}

						<DropdownMenuSeparator className="bg-zinc-700/50" />

						<DropdownMenuItem
							onClick={() => onReport?.(postId)}
							className="text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 transition-colors"
						>
							<Flag className="h-4 w-4 mr-2" />
							Report Post
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</div>
	);
}
