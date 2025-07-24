import React from 'react';
import { PaginatedActivityFeed } from '@app/features/activity/components/PaginatedActivityFeed';
import { useAuth } from '@app/hooks/use-auth';

/**
 * User profile activity page
 */
const ProfileActivityPage: React.FC = () => {
	const { user } = useAuth();

	if (!user) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="text-center p-8 bg-gray-100 rounded-lg">
					<h2 className="text-xl font-semibold mb-2">Sign in required</h2>
					<p className="text-gray-600">Please sign in to view your activity feed.</p>
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto px-4 py-8">
			<h1 className="text-2xl font-bold mb-6">My Activity</h1>

			<div className="mb-6">
				<p className="text-gray-600 mb-4">
					View your recent activity across the platform. This includes threads, posts, level ups,
					badges, tips, and more.
				</p>
			</div>

			<PaginatedActivityFeed initialFilters={{ limit: 15, page: 1 }} className="mb-8" />
		</div>
	);
};

export default ProfileActivityPage;
