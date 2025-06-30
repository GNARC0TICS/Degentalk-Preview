import React, { useState } from 'react';
import { useActivityFeed } from '@/features/activity/hooks/useActivityFeed';
import { EventLog, EventLogFilters } from '@/features/activity/services/activityApi';
import { format } from 'date-fns';

interface PaginatedActivityFeedProps {
	initialFilters?: EventLogFilters;
	className?: string;
}

/**
 * Renders a formatted activity item based on event type
 */
const ActivityItem: React.FC<{ event: EventLog }> = ({ event }) => {
	const formatDate = (dateString: string) => {
		return format(new Date(dateString), 'MMM d, yyyy h:mm a');
	};

	// Render different content based on event type
	const renderEventContent = () => {
		switch (event.eventType) {
			case 'thread_created':
				return (
					<div className="flex flex-col">
						<span className="font-medium">Created a new thread</span>
						<span className="text-sm text-gray-600">{event.meta.threadTitle || 'New thread'}</span>
					</div>
				);

			case 'post_created':
				return (
					<div className="flex flex-col">
						<span className="font-medium">Posted a reply</span>
						<span className="text-sm text-gray-600">
							{event.meta.threadTitle ? `in ${event.meta.threadTitle}` : ''}
						</span>
					</div>
				);

			case 'level_up':
				return (
					<div className="flex flex-col">
						<span className="font-medium">Leveled up!</span>
						<span className="text-sm text-gray-600">
							Level {event.meta.oldLevel} → Level {event.meta.newLevel}
						</span>
					</div>
				);

			case 'badge_earned':
				return (
					<div className="flex flex-col">
						<span className="font-medium">Earned a badge</span>
						<span className="text-sm text-gray-600">{event.meta.badgeName || 'New badge'}</span>
					</div>
				);

			case 'tip_sent':
				return (
					<div className="flex flex-col">
						<span className="font-medium">Sent a tip</span>
						<span className="text-sm text-gray-600">
							{event.meta.amount} DGT to {event.meta.recipientName || 'another user'}
						</span>
					</div>
				);

			case 'tip_received':
				return (
					<div className="flex flex-col">
						<span className="font-medium">Received a tip</span>
						<span className="text-sm text-gray-600">
							{event.meta.amount} DGT from {event.meta.senderName || 'another user'}
						</span>
					</div>
				);

			case 'rain_claimed':
				return (
					<div className="flex flex-col">
						<span className="font-medium">Claimed rain</span>
						<span className="text-sm text-gray-600">{event.meta.amount} DGT</span>
					</div>
				);

			case 'cosmetic_unlocked':
				return (
					<div className="flex flex-col">
						<span className="font-medium">Unlocked a cosmetic item</span>
						<span className="text-sm text-gray-600">
							{event.meta.cosmeticName || event.meta.cosmeticType || 'New item'}
						</span>
					</div>
				);

			case 'xp_earned':
				return (
					<div className="flex flex-col">
						<span className="font-medium">Earned XP</span>
						<span className="text-sm text-gray-600">
							+{event.meta.amount} XP from {event.meta.source || 'activity'}
						</span>
					</div>
				);

			case 'referral_completed':
				return (
					<div className="flex flex-col">
						<span className="font-medium">Referral completed</span>
						<span className="text-sm text-gray-600">
							{event.meta.referredUsername
								? `${event.meta.referredUsername} joined`
								: 'New user joined'}
						</span>
					</div>
				);

			case 'product_purchased':
				return (
					<div className="flex flex-col">
						<span className="font-medium">Purchased an item</span>
						<span className="text-sm text-gray-600">
							{event.meta.productName || 'Item'} for {event.meta.price} DGT
						</span>
					</div>
				);

			case 'mission_completed':
				return (
					<div className="flex flex-col">
						<span className="font-medium">Completed a mission</span>
						<span className="text-sm text-gray-600">{event.meta.missionName || 'Mission'}</span>
					</div>
				);

			case 'airdrop_claimed':
				return (
					<div className="flex flex-col">
						<span className="font-medium">Claimed an airdrop</span>
						<span className="text-sm text-gray-600">{event.meta.amount} DGT</span>
					</div>
				);

			default:
				return (
					<div className="flex flex-col">
						<span className="font-medium">Activity recorded</span>
						<span className="text-sm text-gray-600">{event.eventType.replace(/_/g, ' ')}</span>
					</div>
				);
		}
	};

	// Get appropriate icon based on event type
	const getEventIcon = () => {
		switch (event.eventType) {
			case 'thread_created':
			case 'post_created':
				return '💬';
			case 'level_up':
				return '⭐';
			case 'badge_earned':
				return '🏆';
			case 'tip_sent':
			case 'tip_received':
				return '💰';
			case 'rain_claimed':
				return '🌧️';
			case 'cosmetic_unlocked':
				return '🎁';
			case 'xp_earned':
				return '✨';
			case 'referral_completed':
				return '👥';
			case 'product_purchased':
				return '🛒';
			case 'mission_completed':
				return '🎯';
			case 'airdrop_claimed':
				return '🪂';
			default:
				return '📝';
		}
	};

	return (
		<div className="flex items-start space-x-4 p-4 border-b border-gray-200 hover:bg-gray-50">
			<div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-xl">
				{getEventIcon()}
			</div>
			<div className="flex-1 min-w-0">
				{renderEventContent()}
				<div className="text-xs text-gray-500 mt-1">{formatDate(event.createdAt)}</div>
			</div>
		</div>
	);
};

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

	if (!activityFeed || activityFeed.items.length === 0) {
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
				{activityFeed.items.map((event) => (
					<ActivityItem key={event.id} event={event} />
				))}
			</div>
			{activityFeed.totalPages > 1 && (
				<div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex justify-between items-center">
					<button
						onClick={() => handlePageChange(Math.max(1, (filters.page || 1) - 1))}
						disabled={(filters.page || 1) <= 1}
						className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
					>
						Previous
					</button>
					<span className="text-sm text-gray-700">
						Page {filters.page || 1} of {activityFeed.totalPages}
					</span>
					<button
						onClick={() =>
							handlePageChange(Math.min(activityFeed.totalPages, (filters.page || 1) + 1))
						}
						disabled={(filters.page || 1) >= activityFeed.totalPages}
						className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
					>
						Next
					</button>
				</div>
			)}
		</div>
	);
};
