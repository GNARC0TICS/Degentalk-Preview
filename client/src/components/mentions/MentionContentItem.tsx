import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@app/utils/utils';
import { AtSign, MessageSquare, FileText, MessageCircle, Send } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@app/components/ui/avatar';
import { Badge } from '@app/components/ui/badge';
import { formatRelativeTime } from '@app/utils/utils';
import type { Thread } from '@shared/types/thread.types';

interface MentionContentItemProps {
	item: Thread;
	isCompact?: boolean;
	onMarkAsRead?: (mentionId: number) => void;
}

export function MentionContentItem({ item, isCompact = false, onMarkAsRead }: MentionContentItemProps) {
	const metadata = item.metadata as any;
	const mentionType = metadata?.mentionType || 'post';
	const mentionId = metadata?.mentionId;

	// Get appropriate icon and label for mention type
	const getMentionTypeInfo = () => {
		switch (mentionType) {
			case 'thread':
				return { icon: FileText, label: 'in a thread', color: 'text-blue-400' };
			case 'post':
				return { icon: MessageSquare, label: 'in a reply', color: 'text-green-400' };
			case 'shoutbox':
				return { icon: MessageCircle, label: 'in shoutbox', color: 'text-purple-400' };
			case 'whisper':
				return { icon: Send, label: 'in a whisper', color: 'text-pink-400' };
			default:
				return { icon: AtSign, label: 'mentioned you', color: 'text-orange-400' };
		}
	};

	const { icon: TypeIcon, label, color } = getMentionTypeInfo();

	// Build the appropriate link based on mention type
	const getMentionLink = () => {
		if (metadata?.originalThreadId) {
			return `/thread/${metadata.originalThreadId}${metadata?.originalPostId ? `#post-${metadata.originalPostId}` : ''}`;
		}
		// For shoutbox/whisper, we might want different handling
		return '#';
	};

	const handleClick = () => {
		// If clicking the main area, mark as read
		if (onMarkAsRead && mentionId && !item.isRead) {
			onMarkAsRead(mentionId);
		}
	};

	return (
		<Link
			to={getMentionLink()}
			onClick={handleClick}
			className={cn(
				'block group hover:bg-zinc-900/50 transition-colors',
				'border-b border-zinc-800/60',
				!item.isRead && 'bg-orange-500/5 hover:bg-orange-500/10',
				isCompact ? 'px-3 py-2' : 'px-4 py-3'
			)}
		>
			<div className="flex items-start gap-3">
				{/* User Avatar */}
				<Avatar className={cn('flex-shrink-0', isCompact ? 'h-8 w-8' : 'h-10 w-10')}>
					<AvatarImage
						src={item.user?.activeAvatarUrl || item.user?.avatarUrl || undefined}
						alt={item.user?.username}
					/>
					<AvatarFallback className="bg-zinc-800 text-xs">
						{item.user?.username?.charAt(0).toUpperCase()}
					</AvatarFallback>
				</Avatar>

				{/* Content */}
				<div className="flex-1 min-w-0">
					{/* Header */}
					<div className="flex items-center gap-2 mb-1">
						<span className="font-medium text-zinc-100 text-sm">
							{item.user?.username}
						</span>
						<span className={cn('flex items-center gap-1 text-xs', color)}>
							<TypeIcon className="h-3 w-3" />
							{label}
						</span>
						{!item.isRead && (
							<Badge variant="secondary" className="bg-orange-500/20 text-orange-300 text-xs px-1.5 py-0">
								New
							</Badge>
						)}
						<span className="text-xs text-zinc-500 ml-auto">
							{formatRelativeTime(item.createdAt)}
						</span>
					</div>

					{/* Context/Content */}
					<p className={cn(
						'text-zinc-300 line-clamp-2',
						isCompact ? 'text-xs' : 'text-sm'
					)}>
						{item.content}
					</p>

					{/* Additional info */}
					{metadata?.originalThreadId && (
						<div className="flex items-center gap-2 mt-1">
							<span className="text-xs text-zinc-500 group-hover:text-zinc-400 transition-colors">
								View {mentionType === 'thread' ? 'thread' : 'post'} →
							</span>
						</div>
					)}
				</div>
			</div>
		</Link>
	);
}

export default MentionContentItem;