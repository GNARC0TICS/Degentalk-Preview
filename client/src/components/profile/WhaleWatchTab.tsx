import React from 'react';
import { WhaleWatchDisplay } from '@/components/social/WhaleWatchDisplay';
import type { ProfileData } from '@/types/profile';

interface WhaleWatchTabProps {
	profile: ProfileData;
	isOwnProfile: boolean;
}

export default function WhaleWatchTab({ profile, isOwnProfile }: WhaleWatchTabProps) {
	return (
		<div className="space-y-6">
			<WhaleWatchDisplay 
				userId={profile.id}
				username={profile.username}
				isCurrentUser={isOwnProfile}
				compact={false}
			/>
		</div>
	);
}