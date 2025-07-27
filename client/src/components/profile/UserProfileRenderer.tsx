import React from 'react';
import { UnifiedProfileCard } from './UnifiedProfileCard';
import { cn } from '@/utils/utils';
import type { User } from '@shared/types/user.types';

export interface UserProfileRendererProps {
	user: User;
	variant?: 'post-sidebar' | 'card-compact' | 'card-full' | 'inline' | 'mini';
	className?: string;
	showStats?: boolean;
	showBio?: boolean;
	showJoinDate?: boolean;
	showOnlineStatus?: boolean;
	showVerifiedBadge?: boolean;
	showLevel?: boolean;
	showRole?: boolean;
	linkToProfile?: boolean;
}

/**
 * Legacy UserProfileRenderer component - now uses UnifiedProfileCard internally
 * Maps old variants to new unified variants for backward compatibility
 */
export function UserProfileRenderer({
	user,
	variant = 'card-compact',
	className = '',
	showStats = true,
	showBio = true,
	showJoinDate = true,
	showOnlineStatus = true,
	showVerifiedBadge = true,
	showLevel = true,
	showRole = true,
	linkToProfile = true
}: UserProfileRendererProps) {
	// Map old variants to new unified variants
	const getUnifiedVariant = (oldVariant: string) => {
		switch (oldVariant) {
			case 'mini':
				return 'mini';
			case 'inline':
			case 'card-compact':
				return 'compact';
			case 'post-sidebar':
				return 'sidebar';
			case 'card-full':
			default:
				return 'full';
		}
	};

	return (
		<UnifiedProfileCard
			username={user.username}
			variant={getUnifiedVariant(variant) as any}
			className={cn(className)}
			showStats={showStats}
			showJoinDate={showJoinDate}
			showLevel={showLevel}
			showRole={showRole}
			showOnlineStatus={showOnlineStatus}
			animated={true}
		/>
	);
}
