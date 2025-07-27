import React, { useState } from 'react';
import { useActivityFeed } from '@/features/activity/hooks/useActivityFeed';
import type { EventLogFilters } from '@/features/activity/types/activity.types';
import { ActivityItem } from './index';

interface PaginatedActivityFeedProps {
	initialFilters?: EventLogFilters;
	className?: string;
}

/**
 * Event type filter options
 */
const EVENT_TYPE_OPTIONS = [
	{ value: 'all', label: 'All Activities' },
	{ value: 'thread_created', label: 'Threads Created' },
	{ value: 'post_created', label: 'Posts Created' },
	{ value: 'level_up', label: 'Level Ups' },
	{ value: 'badge_earned', label: 'Badges Earned' },
	{ value: 'tip_sent,tip_received', label: 'Tips' },
	{ value: 'rain_claimed,airdrop_claimed', label: 'Claims' },
	{ value: 'xp_earned', label: 'XP Earned' },
	{ value: 'cosmetic_unlocked,product_purchased', label: 'Items' },
	{ value: 'mission_completed', label: 'Missions' },
	{ value: 'referral_completed', label: 'Referrals' }
];

/**
 * Paginated activity feed component with filters
 */
export const PaginatedActivityFeed: React.FC<PaginatedActivityFeedProps> = ({
	initialFilters = { limit: 10, page: 1 },
	className = ''
}) => {
	const [filters, setFilters] = useState<EventLogFilters>(initialFilters);
	const [selectedFilter, setSelectedFilter] = useState<string>('all');

	const { activityFeed, isLoading, isError, refetch } = useActivityFeed({
		...filters,
		eventType: selectedFilter !== 'all' ? selectedFilter.split(',') : undefined
	});

	const handlePageChange = (newPage: number) => {
		setFilters((prev) => ({
			...prev,
			page: newPage
		}));
	};

	const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const newFilter = e.target.value;
		setSelectedFilter(newFilter);
		setFilters((prev) => ({
			...prev,
			page: 1 // Reset to first page when changing filters
		}));
	};

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
				<div className="p-4 text-center">
					<button
						onClick={() => refetch()}
						className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
					>
						Try Again
					</button>
				</div>
			</div>
		);
	}

	const items = activityFeed?.data || activityFeed?.items || [];
	
	if (!activityFeed || items.length === 0) {
		return (
			<div className={`rounded-lg border border-gray-200 ${className}`}>
				<div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
					<h3 className="text-lg font-medium text-gray-900">Activity Feed</h3>
					<select
						value={selectedFilter}
						onChange={handleFilterChange}
						className="border border-gray-300 rounded px-3 py-1 text-sm"
					>
						{EVENT_TYPE_OPTIONS.map((option) => (
							<option key={option.value} value={option.value}>
								{option.label}
							</option>
						))}
					</select>
				</div>
				<div className="p-8 text-center text-gray-500">
					No activity found for the selected filter
				</div>
			</div>
		);
	}

	return (
		<div className={`rounded-lg border border-gray-200 overflow-hidden ${className}`}>
			<div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
				<h3 className="text-lg font-medium text-gray-900">Activity Feed</h3>
				<select
					value={selectedFilter}
					onChange={handleFilterChange}
					className="border border-gray-300 rounded px-3 py-1 text-sm"
				>
					{EVENT_TYPE_OPTIONS.map((option) => (
						<option key={option.value} value={option.value}>
							{option.label}
						</option>
					))}
				</select>
			</div>
			<div className="divide-y divide-gray-200">
				{items.map((event) => (
					<ActivityItem key={event.id} activity={event} />
				))}
			</div>
			{(activityFeed?.pagination?.totalPages || activityFeed?.pagination?.pages || 1) > 1 && (
				<div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex justify-between items-center">
					<button
						onClick={() => handlePageChange(Math.max(1, (filters.page || 1) - 1))}
						disabled={(filters.page || 1) <= 1}
						className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
					>
						Previous
					</button>
					<span className="text-sm text-gray-700">
						Page {filters.page || 1} of {activityFeed?.pagination?.totalPages || activityFeed?.pagination?.pages || 1}
					</span>
					<button
						onClick={() =>
							handlePageChange(Math.min(activityFeed?.pagination?.totalPages || activityFeed?.pagination?.pages || 1, (filters.page || 1) + 1))
						}
						disabled={(filters.page || 1) >= (activityFeed?.pagination?.totalPages || activityFeed?.pagination?.pages || 1)}
						className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
					>
						Next
					</button>
				</div>
			)}
		</div>
	);
};
