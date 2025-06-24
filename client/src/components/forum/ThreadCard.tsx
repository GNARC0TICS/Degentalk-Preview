import React, { memo } from 'react';
import { ThreadCardPure } from '@/components/forum/enhanced';
import type { ThreadCardComponentProps } from '@/types/forum';
import type { Tag } from '@/types/forum';
import { useForumStructure } from '@/contexts/ForumStructureContext';

// Enhanced ThreadCard wrapper that maps legacy interface to EnhancedThreadCard
const ThreadCardComponent = ({
	thread,
	className = '',
	linkAs = 'wouter', // Preserved for compatibility but not used in enhanced version
	forumSlug
}: ThreadCardComponentProps) => {
	const { zones } = useForumStructure();

	if (!thread) {
		return null;
	}

	// Find the zone for this thread's category
	const parentZone = zones?.find((zone) => zone.forums.some((f) => f.id === thread.category?.id));

	// Map legacy thread data to enhanced interface
	const enhancedThread = {
		id: String(thread.id),
		title: thread.title,
		slug: thread.slug,
		excerpt: (thread as any).preview || '', // Optional preview text
		createdAt: thread.createdAt,
		lastPostAt: thread.lastPostAt || undefined,
		viewCount: thread.viewCount,
		postCount: thread.postCount,
		isSticky: thread.isSticky,
		isLocked: thread.isLocked,
		isHot: thread.hotScore !== undefined && thread.hotScore > 10,
		hotScore: thread.hotScore,
		user: {
			id: String(thread.user?.id || ''),
			username: thread.user?.username || 'Unknown',
			avatarUrl: thread.user?.activeAvatarUrl || thread.user?.avatarUrl,
			reputation: (thread.user as any)?.reputation || 0,
			isVerified: (thread.user as any)?.isVerified || false
		},
		zone: {
			name: parentZone?.name || thread.category?.name || 'General',
			slug: parentZone?.slug || thread.category?.slug || 'general',
			colorTheme: parentZone?.slug || 'general'
		},
		tags:
			(thread.tags as Tag[])?.map((tag) => ({
				id: tag.id,
				name: tag.name,
				color: (tag as any).color || undefined
			})) || [],
		prefix: thread.prefix
			? {
					name: thread.prefix.name,
					color: thread.prefix.color || 'zinc'
				}
			: undefined,
		engagement: {
			totalTips: (thread as any).totalTips || 0,
			uniqueTippers: (thread as any).uniqueTippers || 0,
			bookmarks: (thread as any).bookmarks || 0,
			momentum: 'neutral' as const // Default momentum
		}
	};

	// Tip and bookmark handlers (placeholder implementation)
	const handleTip = (threadId: string, amount: number) => {
		console.log('Tip thread:', threadId, amount);
		// TODO: Implement tipping functionality
	};

	const handleBookmark = (threadId: string) => {
		console.log('Bookmark thread:', threadId);
		// TODO: Implement bookmarking functionality
	};

	return (
		<ThreadCardPure
			thread={enhancedThread}
			variant="default"
			onTip={handleTip}
			onBookmark={handleBookmark}
			className={className}
		/>
	);
};

export const ThreadCard = memo(ThreadCardComponent);
export default ThreadCard;
