import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorDisplay } from '@/components/ui/error-display';
import type { ProfileData } from '@/types/profile';

interface Props {
  profile: ProfileData;
}

type UserLite = { id: string; username: string; avatarUrl: string | null };

const FriendsTab: React.FC<Props> = ({ profile }) => {
  const [activeTab, setActiveTab] = useState<'friends' | 'followers' | 'following'>('friends');

  const fetchList = (type: 'followers' | 'following') => async (): Promise<UserLite[]> => {
    const res = await fetch(`/api/relationships/${profile.id}/${type}`);
    if (!res.ok) throw new Error('Failed to fetch');
    return res.json();
  };

  const {
    data: followers,
    isLoading: loadingFollowers,
    error: followersError,
    refetch: refetchFollowers,
  } = useQuery({
    queryKey: ['followers', profile.id],
    queryFn: fetchList('followers'),
    enabled: activeTab === 'followers',
  });

  const {
    data: following,
    isLoading: loadingFollowing,
    error: followingError,
    refetch: refetchFollowing,
  } = useQuery({
    queryKey: ['following', profile.id],
    queryFn: fetchList('following'),
    enabled: activeTab === 'following',
  });

  const renderCards = (users?: UserLite[], loading = false, error?: Error | null, retry?: () => void) => {
    if (loading) {
      return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-slate-900">
              <Skeleton className="w-12 h-12 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (error) return <ErrorDisplay title="Could not load list" error={error} onRetry={retry} variant="inline" />;

    if (!users || users.length === 0) {
      const msg =
        activeTab === 'friends' ? 'No friends added yet' : activeTab === 'followers' ? 'No followers yet' : 'Not following anyone yet';
      return <div className="text-slate-500 italic">{msg}</div>;
    }

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {users.map((u) => (
          <a key={u.id} href={`/profile/${u.username}`} className="flex items-center gap-3 p-3 rounded-lg bg-slate-900 hover:bg-slate-800">
            <div className="w-12 h-12 rounded-full bg-slate-700 overflow-hidden">
              {u.avatarUrl ? <img src={u.avatarUrl} alt={u.username} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-300 font-bold">{u.username.slice(0, 2).toUpperCase()}</div>}
            </div>
            <div className="truncate">
              <div className="text-slate-200 font-medium truncate">{u.username}</div>
            </div>
          </a>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-slate-200">Social Network</h3>

      <div className="border-b border-slate-700">
        <div className="flex space-x-8">
          {(['friends', 'followers', 'following'] as const).map((tab) => (
            <button
              key={tab}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-300'
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="pt-2">
        {activeTab === 'friends' && renderCards(profile.relationships.friends)}
        {activeTab === 'followers' && renderCards(followers, loadingFollowers, followersError, refetchFollowers)}
        {activeTab === 'following' && renderCards(following, loadingFollowing, followingError, refetchFollowing)}
      </div>
    </div>
  );
};

export default FriendsTab; 