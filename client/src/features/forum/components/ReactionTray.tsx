import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button'; // Using Button for consistency, can be styled
import type { PostId } from '@db/types';

interface ReactionTrayProps {
	postId: PostId; // postId might be used for keys or future data fetching within this component
	currentUserReaction?: string | null;
	reactions: {
		emoji: string;
		count: number;
		// Potentially add a 'reactedByCurrentUser' field here if API provides it per reaction type
	}[];
	onReact: (emoji: string, isAdding: boolean) => void;
	disabled?: boolean;
}

export function ReactionTray({
	// postId, // Not directly used in rendering logic yet, but good to have
	currentUserReaction,
	reactions,
	onReact,
	disabled = false
}: ReactionTrayProps) {
	if (!reactions || reactions.length === 0) {
		return null; // Don't render if there are no reactions to display
	}

	const handleReactionClick = (emoji: string) => {
		if (disabled) return;

		const isCurrentlyReacted = currentUserReaction === emoji;
		onReact(emoji, !isCurrentlyReacted); // If current is this emoji, then we are removing it (isAdding: false)
	};

	return (
		<div className="flex items-center space-x-1 py-1">
			{reactions.map((reaction) => {
				const isSelected = currentUserReaction === reaction.emoji;
				return (
					<Button
						key={reaction.emoji}
						variant="ghost"
						size="sm" // Consistent small size for tray items
						onClick={() => handleReactionClick(reaction.emoji)}
						disabled={disabled}
						className={cn(
							'px-2 py-1 h-auto rounded-full text-xs transition-all',
							isSelected
								? 'bg-sky-500/20 text-sky-400 ring-1 ring-sky-500/50' // Highlight if current user reacted with this
								: 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200',
							disabled && 'opacity-60 cursor-not-allowed'
						)}
						title={`React with ${reaction.emoji}`}
					>
						<span className="text-base mr-1">{reaction.emoji}</span>
						{reaction.count > 0 && (
							<span className={cn('font-medium', isSelected ? 'text-sky-300' : 'text-zinc-500')}>
								{reaction.count}
							</span>
						)}
					</Button>
				);
			})}
		</div>
	);
}

export default ReactionTray;
