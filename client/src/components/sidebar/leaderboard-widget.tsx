/**
 * Legacy Sidebar Leaderboard Widget
 * 
 * This component now acts as a wrapper around the new unified LeaderboardWidget
 * to maintain backward compatibility while using the new implementation
 */

import React from 'react';
import { LeaderboardWidget } from '@app/components/leaderboard';
import type { User } from '@shared/types/user.types';

// Define structure needed by the component
type FormattedUser = {
	id: string;
	username: string;
	xp: number;
	level: number;
	rank: number;
	avatar?: string;
};

interface LeaderboardWidgetProps {
	users?: User[] | FormattedUser[] | null;
	isLoading?: boolean;
	// List of usernames currently active in the main feed
	activeFeedUsers?: string[];
}

export default function SidebarLeaderboardWidget({
	users,
	isLoading = false,
	activeFeedUsers = []
}: LeaderboardWidgetProps) {
	// Simply use the new unified LeaderboardWidget with appropriate props
	return (
		<LeaderboardWidget
			variant="compact"
			timeframe="weekly"
			metric="xp"
			limit={5}
			showViewAll={true}
			animated={true}
			title="Weekly Leaderboard"
			className="text-[clamp(0.75rem,0.9vw,0.95rem)]"
		/>
	);
}
