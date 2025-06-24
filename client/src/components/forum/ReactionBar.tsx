import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import QuickReactions from '@/components/forum/enhanced/QuickReactions';
import {
	Heart,
	ThumbsUp,
	Reply,
	Quote,
	Share,
	Bookmark,
	MoreHorizontal,
	Edit,
	Trash,
	Flag,
	Coins,
	Link2,
	MessageSquare
} from 'lucide-react';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';

interface ReactionBarProps {
	postId: number;
	likeCount?: number;
	hasLiked?: boolean;
	canEdit?: boolean;
	canDelete?: boolean;
	canMarkSolution?: boolean;
	isSolution?: boolean;
	isThreadSolved?: boolean;
	tippingEnabled?: boolean;
	createdAt?: string;
	editedAt?: string | null;
	isEdited?: boolean;
	onLike?: (postId: number, hasLiked: boolean) => void;
	onReply?: (postId: number) => void;
	onQuote?: (postId: number) => void;
	onEdit?: (postId: number) => void;
	onDelete?: (postId: number) => void;
	onMarkSolution?: (postId: number) => void;
	onTip?: (postId: number) => void;
	onReport?: (postId: number) => void;
	onBookmark?: (postId: number) => void;
	onShare?: (postId: number) => void;
	onCopyLink?: (postId: number) => void;
	className?: string;
}

export function ReactionBar({
	postId,
	likeCount = 0,
	hasLiked = false,
	canEdit = false,
	canDelete = false,
	canMarkSolution = false,
	isSolution = false,
	isThreadSolved = false,
	tippingEnabled = false,
	createdAt,
	editedAt,
	isEdited = false,
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
	onCopyLink,
	className = ''
}: ReactionBarProps) {
	const [isBookmarked, setIsBookmarked] = useState(false);

	const timeAgo = createdAt ? formatDistanceToNow(new Date(createdAt), { addSuffix: true }) : '';
	const editedTimeAgo = editedAt
		? formatDistanceToNow(new Date(editedAt), { addSuffix: true })
		: '';

	const handleBookmark = () => {
		setIsBookmarked(!isBookmarked);
		onBookmark?.(postId);
	};

	const handleCopyLink = async () => {
		const postUrl = `${window.location.origin}${window.location.pathname}#post-${postId}`;
		try {
			await navigator.clipboard.writeText(postUrl);
			// Could add a toast notification here
			onCopyLink?.(postId);
		} catch (err) {
			console.error('Failed to copy link:', err);
		}
	};

	// Create mock crypto reactions for enhanced experience
	const mockReactions = [
		{
			id: 'love',
			type: 'love' as const,
			emoji: '💎',
			label: 'Love',
			count: hasLiked ? likeCount : Math.max(likeCount - 1, 0),
			hasReacted: hasLiked,
			color: 'text-pink-400',
			bgColor: 'bg-pink-900/20',
			borderColor: 'border-pink-500/30'
		},
		{
			id: 'bullish',
			type: 'bullish' as const,
			emoji: '📈',
			label: 'Bullish',
			count: Math.floor(Math.random() * 5),
			hasReacted: false,
			color: 'text-green-400',
			bgColor: 'bg-green-900/20',
			borderColor: 'border-green-500/30'
		},
		{
			id: 'fire',
			type: 'fire' as const,
			emoji: '🔥',
			label: 'Fire',
			count: Math.floor(Math.random() * 3),
			hasReacted: false,
			color: 'text-orange-400',
			bgColor: 'bg-orange-900/20',
			borderColor: 'border-orange-500/30'
		}
	];

	const handleReaction = (reactionType: string) => {
		if (reactionType === 'love') {
			onLike?.(postId, hasLiked);
		}
		// TODO: Add support for other reaction types
		console.log('Reaction:', reactionType);
	};

	const handleTipAmount = (amount: number) => {
		onTip?.(postId);
	};

	return (
		<div className={`space-y-2 ${className}`}>
			{/* Enhanced Crypto Reactions */}
			<QuickReactions
				reactions={mockReactions}
				onReact={handleReaction}
				onTip={tippingEnabled ? handleTipAmount : undefined}
				compact={true}
				showTipIntegration={tippingEnabled}
			/>

			{/* Traditional Action Bar */}
			<div className="flex items-center justify-between py-3 px-4 border-t border-zinc-800/50 bg-zinc-900/30">
				{/* Left side - Main actions */}
				<div className="flex items-center space-x-1">
					{/* Reply button */}
					<Button
						size="sm"
						variant="ghost"
						className="h-8 px-3 text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all"
						onClick={() => onReply?.(postId)}
					>
						<Reply className="h-4 w-4 mr-1.5" />
						<span className="text-xs">Reply</span>
					</Button>

					{/* Quote button */}
					<Button
						size="sm"
						variant="ghost"
						className="h-8 px-3 text-zinc-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all"
						onClick={() => onQuote?.(postId)}
					>
						<Quote className="h-4 w-4 mr-1.5" />
						<span className="text-xs">Quote</span>
					</Button>

					{/* Mark as Solution button */}
					{canMarkSolution && !isThreadSolved && !isSolution && (
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
				</div>

				{/* Right side - Timestamp and more actions */}
				<div className="flex items-center space-x-2">
					{/* Post timestamp */}
					<div className="text-xs text-zinc-500">
						<span>{timeAgo}</span>
						{isEdited && editedTimeAgo && (
							<span className="ml-2 italic">(edited {editedTimeAgo})</span>
						)}
					</div>

					{/* More actions dropdown */}
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								size="sm"
								variant="ghost"
								className="h-8 w-8 p-0 text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800"
							>
								<MoreHorizontal className="h-4 w-4" />
								<span className="sr-only">More options</span>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-700">
							<DropdownMenuItem
								onClick={handleCopyLink}
								className="text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800"
							>
								<Link2 className="h-4 w-4 mr-2" />
								Copy Link
							</DropdownMenuItem>

							<DropdownMenuItem
								onClick={handleBookmark}
								className="text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800"
							>
								<Bookmark
									className={`h-4 w-4 mr-2 ${isBookmarked ? 'fill-amber-400 text-amber-400' : ''}`}
								/>
								{isBookmarked ? 'Remove Bookmark' : 'Bookmark'}
							</DropdownMenuItem>

							<DropdownMenuItem
								onClick={() => onShare?.(postId)}
								className="text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800"
							>
								<Share className="h-4 w-4 mr-2" />
								Share
							</DropdownMenuItem>

							{(canEdit || canDelete) && <DropdownMenuSeparator className="bg-zinc-700" />}

							{canEdit && (
								<DropdownMenuItem
									onClick={() => onEdit?.(postId)}
									className="text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800"
								>
									<Edit className="h-4 w-4 mr-2" />
									Edit Post
								</DropdownMenuItem>
							)}

							{canDelete && (
								<DropdownMenuItem
									onClick={() => onDelete?.(postId)}
									className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
								>
									<Trash className="h-4 w-4 mr-2" />
									Delete Post
								</DropdownMenuItem>
							)}

							<DropdownMenuSeparator className="bg-zinc-700" />

							<DropdownMenuItem
								onClick={() => onReport?.(postId)}
								className="text-orange-400 hover:text-orange-300 hover:bg-orange-500/10"
							>
								<Flag className="h-4 w-4 mr-2" />
								Report Post
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
		</div>
	);
}
