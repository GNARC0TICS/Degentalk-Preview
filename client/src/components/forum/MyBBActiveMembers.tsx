import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Clock, Circle } from 'lucide-react';
import { createWidgetQueryKey } from '@/hooks/widgetData';
import type { UserId } from '@shared/types/ids';
import { OnlineUsersDisplay } from './OnlineUsersDisplay';

export interface ActiveUser {
  id: UserId | string;
  name: string;
  avatar: string | null;
  lastActive: string;
}

export interface MyBBActiveMembersProps {
  title?: string;
  limit?: number;
}

export function MyBBActiveMembers({ 
  title = "Who's Online", 
  limit = 8 
}: MyBBActiveMembersProps) {
  const { data: response, isLoading } = useQuery<ActiveUser[] | { error: string }>({
    queryKey: createWidgetQueryKey('active-members'),
    queryFn: async () => {
      const res = await fetch('/api/forum/active-members');
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch active members');
      }
      return data;
    },
    staleTime: 30_000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
  });

  // Safely handle response - check if it's an array
  const users = Array.isArray(response) ? response : [];
  const displayedUsers = users.slice(0, limit);

  return (
    <div className="mybb-forum-category mb-4">
      <div className="mybb-category-header mybb-category-blue">
        <div className="mybb-category-title">{title}</div>
      </div>
      
      <div className="mybb-stats-content">
        {isLoading ? (
          <div className="text-center py-4">
            <span className="text-zinc-500 text-xs">Loading...</span>
          </div>
        ) : displayedUsers.length > 0 ? (
          <>
            {/* Online count */}
            <div className="mb-3">
              <span className="text-xs text-zinc-400">
                <strong className="mybb-online-count">{users.length}</strong> user{users.length !== 1 ? 's' : ''} active
              </span>
            </div>

            {/* Online Users Display */}
            <OnlineUsersDisplay
              users={displayedUsers.map(u => u.name)}
              theme="classic"
              title=""
              maxAvatars={8}
            />

            {/* View all link */}
            <div className="mt-4 pt-3 border-t border-zinc-800 text-center">
              <Link 
                to="/degen-index" 
                className="text-xs text-emerald-400 hover:text-emerald-300 hover:underline"
              >
                [Complete List]
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center py-4">
            <span className="text-zinc-500 text-xs italic">No active members</span>
          </div>
        )}
      </div>
    </div>
  );
}