import React from 'react';
import { FollowingList } from '@/components/social/FollowingList';
import type { ProfileData } from '@/types/profile';

interface WhaleWatchTabProps {
	profile: ProfileData;
	isOwnProfile: boolean;
}

export default function WhaleWatchTab({ profile, isOwnProfile }: WhaleWatchTabProps) {
	return (
		<div className="space-y-4">
			<FollowingList userId={profile.id} isCurrentUser={isOwnProfile} />
		</div>
	);
}
