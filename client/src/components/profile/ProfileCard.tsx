import React from 'react';
import { UnifiedProfileCard } from './UnifiedProfileCard';
import { cn } from '@/utils/utils';

interface ProfileCardProps {
	username: string;
	className?: string;
	variant?: 'compact' | 'full' | 'sidebar' | 'mini';
}

/**
 * Legacy ProfileCard component - now uses UnifiedProfileCard internally
 * Maintains backward compatibility while providing modern unified design
 */
export default function ProfileCard({ username, className, variant = 'full' }: ProfileCardProps) {
	return (
		<UnifiedProfileCard
			username={username}
			variant={variant}
			className={cn(className)}
			showStats={true}
			showJoinDate={true}
			showLevel={true}
			showRole={true}
			showOnlineStatus={true}
			animated={true}
		/>
	);
}
