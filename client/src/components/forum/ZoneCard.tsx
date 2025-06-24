import React from 'react';
import { ZoneCardPure } from '@/components/forum/enhanced';

export interface ZoneCardProps {
	// Core data
	id: string | number;
	name: string;
	slug: string;
	description: string;

	// Visual customization
	icon?: string;
	colorTheme?: string;
	themeColor?: string; // Actual hex color for dynamic styling

	// Stats and metadata
	forumCount?: number;
	threadCount?: number;
	postCount?: number;
	activeUsersCount?: number;
	lastActivityAt?: Date;
	lastActivityUser?: {
		id: number;
		username: string;
		avatarUrl?: string | null;
		activeAvatarUrl?: string | null;
	};

	// Forum previews
	forums?: Array<{
		id: number;
		slug: string;
		name: string;
		description?: string | null;
		threadCount: number;
		postCount: number;
	}>;

	// Special states
	hasXpBoost?: boolean;
	boostMultiplier?: number;
	isEventActive?: boolean;
	eventData?: {
		name: string;
		endsAt: Date;
	};
	rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

	// Component behavior
	className?: string;
	onClick?: () => void;
	layout?: 'vertical' | 'horizontal';
	showForumPreviews?: boolean; // New prop to control forum preview display
}

/**
 * Enhanced ZoneCard wrapper that maps legacy interface to EnhancedZoneCard
 * Preserves all existing functionality while using the enhanced component
 */
export function ZoneCard({
	id,
	name,
	slug,
	description,
	icon,
	colorTheme = 'default',
	themeColor,
	forumCount = 0,
	threadCount = 0,
	postCount = 0,
	activeUsersCount = 0,
	lastActivityAt,
	lastActivityUser,
	forums = [],
	hasXpBoost = false,
	boostMultiplier = 1,
	isEventActive = false,
	eventData,
	rarity = 'common',
	className = '',
	onClick,
	layout = 'vertical',
	showForumPreviews = false
}: ZoneCardProps) {
	// Map legacy props to enhanced zone interface
	const enhancedZone = {
		id: String(id),
		name,
		slug,
		description,
		icon,
		colorTheme: colorTheme || 'default',
		bannerImage: undefined, // Not available in legacy interface
		stats: {
			activeUsers: activeUsersCount,
			totalThreads: threadCount,
			totalPosts: postCount,
			todaysPosts: 0 // Not available in legacy interface
		},
		features: {
			hasXpBoost,
			boostMultiplier,
			isEventActive,
			isPremium: rarity !== 'common'
		},
		activity: lastActivityAt
			? {
					trendingThreads: 0, // Not available in legacy interface
					momentum: 'stable' as const,
					lastActiveUser: lastActivityUser
						? {
								username: lastActivityUser.username,
								avatarUrl:
									lastActivityUser.activeAvatarUrl || lastActivityUser.avatarUrl || undefined,
								timestamp: lastActivityAt.toISOString()
							}
						: undefined
				}
			: undefined,
		forums: forums?.map((forum) => ({
			id: String(forum.id),
			name: forum.name,
			threadCount: forum.threadCount,
			isPopular: forum.threadCount > 100 // Simple heuristic
		}))
	};

	// Map layout prop
	const enhancedLayout = layout === 'horizontal' ? 'compact' : 'default';

	// Determine variant based on features
	let variant: 'default' | 'premium' | 'event' = 'default';
	if (isEventActive) variant = 'event';
	else if (rarity !== 'common') variant = 'premium';

	// Handle zone entry
	const handleEnter = (zoneId: string) => {
		onClick?.();
	};

	return (
		<ZoneCardPure
			zone={enhancedZone}
			layout={enhancedLayout}
			variant={variant}
			showStats={true}
			showPreview={showForumPreviews}
			className={className}
			onEnter={handleEnter}
		/>
	);
}

export default ZoneCard;
