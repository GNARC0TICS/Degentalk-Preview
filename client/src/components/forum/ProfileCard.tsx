import React from 'react';
import { UnifiedProfileCard } from '@app/components/profile/UnifiedProfileCard';
import { cn } from '@app/utils/utils';
import type { User } from '@app/types/compat/user';

interface ProfileCardProps {
	user: User;
	compact?: boolean;
	className?: string;
	showPostCount?: boolean;
	showJoinDate?: boolean;
	showLevel?: boolean;
	showFlair?: boolean;
	showTitle?: boolean;
}

/**
 * Forum ProfileCard component - now uses UnifiedProfileCard internally
 * Maintains backward compatibility for forum-specific usage patterns
 */
export function ProfileCard({
	user,
	compact = false,
	className = '',
	showPostCount = true,
	showJoinDate = true,
	showLevel = true,
	showFlair = true,
	showTitle = true
}: ProfileCardProps) {
	return (
		<UnifiedProfileCard
			username={user.username}
			variant={compact ? 'compact' : 'sidebar'}
			className={cn(className)}
			showStats={showPostCount}
			showJoinDate={showJoinDate}
			showLevel={showLevel}
			showRole={true}
			showOnlineStatus={true}
			animated={true}
		/>
	);
}
