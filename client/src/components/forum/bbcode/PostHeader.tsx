import React from 'react';
import { Link2, Pin, CheckCircle, Edit3 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { brandConfig } from '@/config/brand.config';
import { cn } from '@/utils/utils';
import type { PostId } from '@shared/types/ids';

interface PostHeaderProps {
	postId: PostId;
	postNumber: number;
	createdAt: Date;
	editedAt?: Date | null;
	isFirst?: boolean;
	isSolution?: boolean;
	threadTitle?: string;
	className?: string;
	onCopyPermalink?: () => void;
}

export function PostHeader({
	postId,
	postNumber,
	createdAt,
	editedAt,
	isFirst = false,
	isSolution = false,
	threadTitle,
	className = '',
	onCopyPermalink
}: PostHeaderProps) {
	const timeAgo = formatDistanceToNow(createdAt, { addSuffix: true });
	const editedTimeAgo = editedAt ? formatDistanceToNow(editedAt, { addSuffix: true }) : null;

	const handleCopyPermalink = async () => {
		const postUrl = `${window.location.origin}${window.location.pathname}#post-${postId}`;
		try {
			await navigator.clipboard.writeText(postUrl);
			onCopyPermalink?.();
		} catch (err) {
			// Failed to copy permalink
		}
	};

	return (
		<div
			className={cn(
				'border-b border-zinc-700/30',
				isFirst ? 'bg-zinc-800/30' : 'bg-zinc-800/20',
				className
			)}
		>
			{/* Thread title for original post */}
			{isFirst && threadTitle && (
				<div className="px-3 pt-3 pb-2">
					<h2 className="text-lg font-semibold text-zinc-200 leading-snug">{threadTitle}</h2>
				</div>
			)}

			{/* Header controls */}
			<div className="flex items-center justify-between p-3">
				{/* Left side - Post indicators */}
				<div className="flex items-center space-x-2">
					{isFirst && (
						<Badge className="bg-zinc-800/60 text-zinc-200 border-zinc-600/50 text-sm font-medium">
							<Pin className="h-3 w-3 mr-1" />
							Original Post
						</Badge>
					)}
					{isSolution && (
						<Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">
							<CheckCircle className="h-3 w-3 mr-1" />
							Solution
						</Badge>
					)}
				</div>

				{/* Right side - Post number and permalink */}
				<div className="flex items-center space-x-3">
					{/* Edit indicator */}
					{editedAt && (
						<div
							className="flex items-center text-xs text-zinc-500 italic cursor-help"
							title={`Last edited ${editedTimeAgo}`}
						>
							<Edit3 className="h-3 w-3 mr-1" />
							edited
						</div>
					)}

					{/* Post number */}
					<span className={cn('text-sm font-mono text-zinc-400', brandConfig.typography.caption)}>
						#{postNumber}
					</span>

					{/* Permalink button */}
					<Button
						size="sm"
						variant="ghost"
						className="h-6 w-6 p-0 text-zinc-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all"
						onClick={handleCopyPermalink}
						title="Copy permalink to this post"
					>
						<Link2 className="h-3 w-3" />
					</Button>
				</div>
			</div>
		</div>
	);
}
