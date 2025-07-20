import React from 'react';
import { Clock, Edit3, Users, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/utils/utils';
import { brandConfig } from '@/config/brand.config';

interface PostFooterProps {
	createdAt: Date;
	editedAt?: Date | null;
	editedBy?: string | null;
	isEdited?: boolean;
	reactionCount?: number;
	hasReacted?: boolean;
	className?: string;
}

export function PostFooter({
	createdAt,
	editedAt,
	editedBy,
	isEdited = false,
	reactionCount = 0,
	hasReacted = false,
	className = ''
}: PostFooterProps) {
	const timeAgo = formatDistanceToNow(createdAt, { addSuffix: true });
	const editedTimeAgo = editedAt ? formatDistanceToNow(editedAt, { addSuffix: true }) : null;

	const getReactionText = () => {
		if (reactionCount === 0) return null;
		if (reactionCount === 1) {
			return hasReacted ? 'You reacted' : '1 person reacted';
		}
		if (hasReacted) {
			return reactionCount === 2
				? 'You and 1 other reacted'
				: `You and ${reactionCount - 1} others reacted`;
		}
		return `${reactionCount} people reacted`;
	};

	const reactionText = getReactionText();

	return (
		<div
			className={cn(
				'flex items-center justify-between px-4 py-2',
				'text-xs text-zinc-500',
				'border-t border-zinc-700/20',
				'bg-zinc-900/30',
				className
			)}
		>
			{/* Left side - Post timestamp */}
			<div className="flex items-center space-x-4">
				<div className="flex items-center">
					<Clock className="h-3 w-3 mr-1" />
					<span>Posted {timeAgo}</span>
				</div>

				{/* Edit information */}
				{isEdited && editedTimeAgo && (
					<div className="flex items-center text-zinc-400">
						<Edit3 className="h-3 w-3 mr-1" />
						<span>
							Edited {editedTimeAgo}
							{editedBy && (
								<span className="ml-1 flex items-center">
									by <User className="h-3 w-3 mx-1" /> {editedBy}
								</span>
							)}
						</span>
					</div>
				)}
			</div>

			{/* Right side - Reaction summary */}
			{reactionText && (
				<div className="flex items-center text-zinc-400">
					<Users className="h-3 w-3 mr-1" />
					<span>{reactionText}</span>
				</div>
			)}
		</div>
	);
}
