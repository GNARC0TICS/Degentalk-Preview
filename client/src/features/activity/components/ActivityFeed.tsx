import React from 'react';
import { useActivityFeed } from '@/features/activity/hooks/useActivityFeed';
import { ActivityItem } from './index';

interface ActivityFeedProps {
	limit?: number;
	eventTypes?: string[];
	className?: string;
}
/**
 * Activity feed component that displays user activity
 */
export const ActivityFeed: React.FC<ActivityFeedProps> = ({
	limit = 10,
	eventTypes,
	className = ''
}) => {
	const { activityFeed, isLoading, isError } = useActivityFeed({
		limit,
		eventType: eventTypes,
		page: 1
	});

	if (isLoading) {
		return (
			<div className={`rounded-lg border border-gray-200 ${className}`}>
				<div className="p-4 text-center text-gray-500">Loading activity...</div>
			</div>
		);
	}

	if (isError) {
		return (
			<div className={`rounded-lg border border-gray-200 ${className}`}>
				<div className="p-4 text-center text-red-500">Failed to load activity feed</div>
			</div>
		);
	}

	const items = activityFeed?.data || activityFeed?.items || [];
	
	if (!activityFeed || items.length === 0) {
		return (
			<div className={`rounded-lg border border-gray-200 ${className}`}>
				<div className="p-4 text-center text-gray-500">No activity found</div>
			</div>
		);
	}

	return (
		<div className={`rounded-lg border border-gray-200 overflow-hidden ${className}`}>
			<div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
				<h3 className="text-lg font-medium text-gray-900">Activity Feed</h3>
			</div>
			<div className="divide-y divide-gray-200">
				{items.map((event) => (
					<ActivityItem key={event.id} activity={event} />
				))}
			</div>
			{(activityFeed?.pagination?.totalPages || activityFeed?.pagination?.pages || 1) > 1 && (
				<div className="bg-gray-50 px-4 py-3 border-t border-gray-200 text-sm text-center text-gray-500">
					Showing {items.length} of {activityFeed?.pagination?.totalItems || activityFeed?.pagination?.total || items.length} activities
				</div>
			)}
		</div>
	);
};
