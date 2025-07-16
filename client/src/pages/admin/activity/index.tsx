import React, { useState } from 'react';
import { useAdminActivityFeed } from '@/features/activity/hooks/useActivityFeed';
import type { EventLog, EventLogFilters } from '@/features/activity/services/activityApi';
import { format } from 'date-fns';
// TODO: Replace with actual auth hook when available
// import { useAuth } from '@/hooks/use-auth';
import { AdminPageShell } from '@/features/admin/layout/layout/AdminPageShell';
import { Wide } from '@/layout/primitives';

/**
 * Admin page for viewing all user activities
 */
const AdminActivityPage: React.FC = () => {
	// TODO: Replace with actual auth hook when available
	// const { user } = useAuth();
	const user = null; // Temporary placeholder
	const [filters, setFilters] = useState<EventLogFilters>({
		limit: 20,
		page: 1
	});

	const [selectedEventType, setSelectedEventType] = useState<string>('all');

	const { activityFeed, isLoading, isError, refetch } = useAdminActivityFeed({
		...filters,
		eventType: selectedEventType !== 'all' ? selectedEventType.split(',') : undefined
	});

	// Redirect if not admin
	if (user?.role !== 'admin') {
		return (
			<Wide className="px-4 py-8">
				<div className="text-center p-8 bg-red-100 rounded-lg">
					<h2 className="text-xl font-semibold mb-2 text-red-800">Access Denied</h2>
					<p className="text-red-600">You do not have permission to view this page.</p>
				</div>
			</Wide>
		);
	}

	const handlePageChange = (newPage: number) => {
		setFilters((prev) => ({
			...prev,
			page: newPage
		}));
	};

	const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		setSelectedEventType(e.target.value);
		setFilters((prev) => ({
			...prev,
			page: 1 // Reset to first page
		}));
	};

	const formatDate = (dateString: string) => {
		return format(new Date(dateString), 'MMM d, yyyy h:mm:ss a');
	};

	// Get appropriate icon based on event type
	const getEventIcon = (eventType: string) => {
		switch (eventType) {
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
		<AdminPageShell title="Activity Logs">
			<div className="mb-6 flex justify-between items-center">
				<p className="text-gray-600">View all user activities across the platform.</p>

				<div className="flex space-x-4">
					<select
						value={selectedEventType}
						onChange={handleFilterChange}
						className="border border-gray-300 rounded px-3 py-2"
					>
						<option value="all">All Activities</option>
						<option value="thread_created">Threads Created</option>
						<option value="post_created">Posts Created</option>
						<option value="level_up">Level Ups</option>
						<option value="badge_earned">Badges Earned</option>
						<option value="tip_sent,tip_received">Tips</option>
						<option value="rain_claimed,airdrop_claimed">Claims</option>
						<option value="xp_earned">XP Earned</option>
						<option value="cosmetic_unlocked,product_purchased">Items</option>
						<option value="mission_completed">Missions</option>
						<option value="referral_completed">Referrals</option>
					</select>

					<button
						onClick={() => refetch()}
						className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
					>
						Refresh
					</button>
				</div>
			</div>
			{isLoading ? (
				<div className="text-center p-8">
					<p className="text-gray-600">Loading activity logs...</p>
				</div>
			) : isError ? (
				<div className="text-center p-8 bg-red-100 rounded-lg">
					<p className="text-red-600">Failed to load activity logs.</p>
					<button
						onClick={() => refetch()}
						className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
					>
						Try Again
					</button>
				</div>
			) : (
				<>
					<div className="bg-white shadow-md rounded-lg overflow-hidden">
						<table className="min-w-full divide-y divide-gray-200">
							<thead className="bg-gray-50">
								<tr>
									<th
										scope="col"
										className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
									>
										Type
									</th>
									<th
										scope="col"
										className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
									>
										User
									</th>
									<th
										scope="col"
										className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
									>
										Details
									</th>
									<th
										scope="col"
										className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
									>
										Date
									</th>
								</tr>
							</thead>
							<tbody className="bg-white divide-y divide-gray-200">
								{activityFeed?.items.map((event: EventLog) => (
									<tr key={event.id} className="hover:bg-gray-50">
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="flex items-center">
												<span className="text-xl mr-2">{getEventIcon(event.eventType)}</span>
												<span className="text-sm text-gray-900">
													{event.eventType.replace(/_/g, ' ')}
												</span>
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="flex items-center">
												{event.user.avatarUrl && (
													<img
														src={event.user.avatarUrl}
														alt={event.user.username}
														className="w-8 h-8 rounded-full mr-2"
													/>
												)}
												<div>
													<div className="text-sm font-medium text-gray-900">
														{event.user.displayName}
													</div>
													<div className="text-sm text-gray-500">@{event.user.username}</div>
												</div>
											</div>
										</td>
										<td className="px-6 py-4">
											<div className="text-sm text-gray-900">
												{Object.entries(event.meta).map(([key, value]) => (
													<div key={key} className="mb-1">
														<span className="font-medium">{key}:</span> {JSON.stringify(value)}
													</div>
												))}
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
											{formatDate(event.createdAt)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>

					{activityFeed && activityFeed.totalPages > 1 && (
						<div className="mt-4 flex justify-between items-center">
							<button
								onClick={() => handlePageChange(Math.max(1, (filters.page || 1) - 1))}
								disabled={(filters.page || 1) <= 1}
								className="px-4 py-2 border border-gray-300 rounded disabled:opacity-50"
							>
								Previous
							</button>
							<span className="text-gray-700">
								Page {filters.page || 1} of {activityFeed.totalPages}
							</span>
							<button
								onClick={() =>
									handlePageChange(Math.min(activityFeed.totalPages, (filters.page || 1) + 1))
								}
								disabled={(filters.page || 1) >= activityFeed.totalPages}
								className="px-4 py-2 border border-gray-300 rounded disabled:opacity-50"
							>
								Next
							</button>
						</div>
					)}
				</>
			)}
		</AdminPageShell>
	);
};

export default AdminActivityPage;
