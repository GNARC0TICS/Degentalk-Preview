import React from 'react';
import type { EventLog } from '@/features/activity/types/activity.types';

interface ActivityItemProps {
	activity: EventLog;
	className?: string;
}

export const ActivityItem: React.FC<ActivityItemProps> = ({ activity, className = '' }) => {
	return (
		<div className={`p-4 border-b border-gray-200 ${className}`}>
			<div className="flex items-start justify-between">
				<div className="flex-1">
					<p className="text-sm font-medium text-gray-900">{activity.eventType}</p>
					<p className="text-xs text-gray-500">{new Date(activity.createdAt).toLocaleString()}</p>
					{activity.eventData && (
						<pre className="mt-2 text-xs text-gray-600 whitespace-pre-wrap">
							{JSON.stringify(activity.eventData, null, 2)}
						</pre>
					)}
				</div>
			</div>
		</div>
	);
};

export { ActivityFeed } from './ActivityFeed';
export { PaginatedActivityFeed } from './PaginatedActivityFeed';