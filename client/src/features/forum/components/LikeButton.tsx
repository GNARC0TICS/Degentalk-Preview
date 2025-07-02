import React from 'react';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PostId } from '@db/types';

interface LikeButtonProps {
	postId: number; // Retained for context, though not directly used in this simplified version
	isLiked: boolean;
	likeCount: number;
	onToggleLike: (liked: boolean) => void;
	disabled?: boolean;
}

export function LikeButton({
	// postId, // Not directly used in UI rendering or click handler now
	isLiked,
	likeCount,
	onToggleLike,
	disabled = false
}: LikeButtonProps) {
	const handleClick = (e: React.MouseEvent) => {
		e.preventDefault();
		if (disabled) return;
		onToggleLike(!isLiked);
	};

	// Using 'sm' size as a default for simplicity
	const sizeClasses = 'w-8 h-8';
	const iconSizes = 'h-4 w-4';

	return (
		<div className="flex items-center gap-1.5">
			<button
				aria-label={isLiked ? 'Unlike' : 'Like'}
				onClick={handleClick}
				disabled={disabled}
				className={cn(
					'relative flex items-center justify-center rounded-full transition-all outline-none',
					'focus:ring-2 focus:ring-rose-500',
					isLiked
						? 'bg-rose-600/80 hover:bg-rose-700/80 text-rose-100' // Simplified active state
						: 'bg-zinc-800/70 hover:bg-zinc-700/70 text-zinc-400', // Simplified inactive state
					disabled && 'opacity-50 cursor-not-allowed',
					sizeClasses
				)}
				tabIndex={0}
			>
				<Heart
					className={cn(
						'transition-all',
						isLiked
							? 'fill-rose-400 text-rose-400' // Simplified active icon
							: 'text-zinc-400 group-hover:text-rose-400', // Simplified inactive icon
						iconSizes
					)}
					strokeWidth={isLiked ? 1.5 : 2}
				/>
				<span className="sr-only">{isLiked ? 'Liked' : 'Like'}</span>
			</button>

			<span
				className={cn(
					'text-zinc-400',
					isLiked && 'text-rose-400',
					'text-xs' // Simplified size
				)}
			>
				{likeCount > 0 ? likeCount : ''}
			</span>
		</div>
	);
}

export default LikeButton;
