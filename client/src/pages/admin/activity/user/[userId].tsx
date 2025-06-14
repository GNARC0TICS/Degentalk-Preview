import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useUserActivityFeed } from '@/features/activity/hooks/useActivityFeed';
import { EventLogFilters } from '@/features/activity/services/activityApi';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

/**
 * Admin page for viewing a specific user's activities
 */
const UserActivityPage: React.FC = () => {
  const router = useRouter();
  const { userId } = router.query;
  const { user } = useAuth();
  
  const [filters, setFilters] = useState<EventLogFilters>({
    limit: 20,
    page: 1
  });
  
  const [selectedEventType, setSelectedEventType] = useState<string>('all');
  
  const { activityFeed, isLoading, isError, refetch } = useUserActivityFeed(
    userId as string,
    {
      ...filters,
      eventType: selectedEventType !== 'all' ? selectedEventType.split(',') : undefined
    }
  );
  
  // Redirect if not admin
  if (user?.role !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center p-8 bg-red-100 rounded-lg">
          <h2 className="text-xl font-semibold mb-2 text-red-800">Access Denied</h2>
          <p className="text-red-600">You do not have permission to view this page.</p>
        </div>
      </div>
    );
  }
  
  // Handle if userId is not provided or invalid
  if (!userId || Array.isArray(userId)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center p-8 bg-yellow-100 rounded-lg">
          <h2 className="text-xl font-semibold mb-2 text-yellow-800">Invalid User ID</h2>
          <p className="text-yellow-600">Please provide a valid user ID.</p>
          <Link href="/admin/activity" className="mt-4 inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Back to All Activities
          </Link>
        </div>
      </div>
    );
  }
  
  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
  };
  
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedEventType(e.target.value);
    setFilters(prev => ({
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
  
  const username = activityFeed?.items[0]?.user?.username || 'User';
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Link href="/admin/activity" className="text-blue-500 hover:underline mb-2 inline-block">
            ← Back to All Activities
          </Link>
          <h1 className="text-2xl font-bold">
            Activity Logs: {activityFeed?.items[0]?.user?.displayName || username}
          </h1>
        </div>
        
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
      ) : !activityFeed || activityFeed.items.length === 0 ? (
        <div className="text-center p-8 bg-gray-100 rounded-lg">
          <p className="text-gray-600">No activity found for this user.</p>
        </div>
      ) : (
        <>
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {activityFeed.items.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-xl mr-2">{getEventIcon(event.eventType)}</span>
                        <span className="text-sm text-gray-900">{event.eventType.replace(/_/g, ' ')}</span>
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
          
          {activityFeed.totalPages > 1 && (
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
                onClick={() => handlePageChange(Math.min(activityFeed.totalPages, (filters.page || 1) + 1))}
                disabled={(filters.page || 1) >= activityFeed.totalPages}
                className="px-4 py-2 border border-gray-300 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UserActivityPage; 