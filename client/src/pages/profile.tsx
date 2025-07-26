import React from 'react';
import { ArrowLeft, MessageSquare, Calendar, Award, Zap, Loader2 } from 'lucide-react';
import { Button } from '@app/components/ui/button';
import { Card } from '@app/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { Wide } from '@app/layout/primitives';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@app/hooks/use-auth';
import { UserTitles } from '@app/components/profile/UserTitles';
import { formatRelativeTime } from '@app/utils/utils';
import { apiRequest } from '@app/lib/api';
import type { ProfileData } from '@app/types/profile';
import type { Thread } from '@shared/types/thread.types';

// Demo user profile data (fallback for dev)
const demoUser = {
  username: 'CryptoKing',
  displayName: 'CryptoKing',
  bio: '🚀 Trading crypto since 2017 | Technical Analysis Expert | Follow for daily market insights',
  avatarUrl: null,
  bannerUrl: null,
  isOnline: true,
  joinedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  stats: {
    posts: 1337,
    threads: 89,
    likes: 2456,
    reputation: 4200,
    level: 42,
    xp: 125000,
    nextLevelXp: 150000
  },
  badges: [
    { name: 'Early Adopter', icon: '🌟' },
    { name: 'Market Guru', icon: '📊' },
    { name: '1K Posts', icon: '💬' }
  ],
  recentThreads: [
    {
      title: '🚀 Bitcoin hitting $100k EOY - Here\'s why',
      slug: 'bitcoin-hitting-100k-eoy-heres-why',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      replyCount: 42
    },
    {
      title: 'ETH 2.0 Staking Guide for Beginners',
      slug: 'eth-staking-guide',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      replyCount: 67
    }
  ]
};

export default function ProfilePage() {
  const { username: routeUsername } = useParams<{ username?: string }>();
  const { user: currentUser } = useAuth();
  
  // Use route username if provided, otherwise current user
  const targetUsername = routeUsername || currentUser?.username;
  const isOwnProfile = !routeUsername || (currentUser?.username === routeUsername);
  
  // Fetch profile data
  const { data: profile, isLoading, error } = useQuery<ProfileData>({
    queryKey: ['profile', targetUsername],
    queryFn: async () => {
      if (!targetUsername) throw new Error('No username provided');
      
      try {
        const response = await apiRequest<ProfileData>({
          url: `/api/profile/${targetUsername}`,
          method: 'GET'
        });
        return response;
      } catch (err) {
        // Fallback to demo data in dev mode
        if (import.meta.env.DEV) {
          return {
            id: 1,
            username: targetUsername,
            displayName: targetUsername,
            bio: demoUser.bio,
            avatarUrl: null,
            activeAvatarUrl: null,
            bannerUrl: null,
            isOnline: true,
            joinedAt: demoUser.joinedAt.toISOString(),
            stats: demoUser.stats,
            titles: [],
            activeTitleId: null,
            badges: demoUser.badges.map((b, i) => ({ id: i, ...b })),
            forumStats: {
              totalPosts: demoUser.stats.posts,
              totalThreads: demoUser.stats.threads,
              totalLikes: demoUser.stats.likes,
              reputation: demoUser.stats.reputation
            },
            level: demoUser.stats.level,
            xp: demoUser.stats.xp,
            nextLevelXp: demoUser.stats.nextLevelXp
          } as ProfileData;
        }
        throw err;
      }
    },
    enabled: !!targetUsername
  });
  
  // Fetch recent threads
  const { data: recentThreads } = useQuery<Thread[]>({
    queryKey: ['user-threads', targetUsername],
    queryFn: async () => {
      if (!targetUsername) return [];
      
      try {
        const response = await apiRequest<{ threads: Thread[]; total: number }>({
          url: `/api/forum/threads?userId=${targetUsername}&limit=5&sortBy=newest`,
          method: 'GET'
        });
        return response.threads;
      } catch (err) {
        // Return demo threads in dev mode
        if (import.meta.env.DEV) {
          return demoUser.recentThreads.map((t, i) => ({
            id: i,
            title: t.title,
            slug: t.slug,
            createdAt: t.createdAt.toISOString(),
            postCount: t.replyCount,
            userId: 1,
            structureId: 1,
            viewCount: 0,
            lastPostAt: null,
            updatedAt: null,
            isLocked: false,
            isSticky: false,
            isSolved: false
          } as any));
        }
        return [];
      }
    },
    enabled: !!targetUsername
  });
  
  if (!targetUsername) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-black flex items-center justify-center">
        <p className="text-zinc-400">Please log in to view profiles</p>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-zinc-400 animate-spin" />
      </div>
    );
  }
  
  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-400 mb-4">Profile not found</p>
          <Link to="/">
            <Button variant="outline">Return Home</Button>
          </Link>
        </div>
      </div>
    );
  }
  
  // Use profile data with fallbacks
  const user = {
    ...demoUser,
    ...profile,
    stats: {
      posts: profile.forumStats?.totalPosts || 0,
      threads: profile.forumStats?.totalThreads || 0,
      likes: profile.forumStats?.totalLikes || 0,
      reputation: profile.forumStats?.reputation || 0,
      level: profile.level || 1,
      xp: profile.xp || 0,
      nextLevelXp: profile.nextLevelXp || 1000
    },
    joinedAt: new Date(profile.joinedAt),
    badges: profile.badges || demoUser.badges
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-black">
      {/* Profile Banner */}
      <div className="relative h-48 bg-gradient-to-r from-blue-600 to-purple-600">
        <Wide className="relative h-full">
          <Link to="/">
            <Button variant="ghost" size="sm" className="absolute top-4 left-0 text-white/80 hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </Wide>
      </div>

      <Wide className="relative -mt-16 pb-8">
        <div className="grid grid-cols-1 xl:grid-cols-[300px_1fr] gap-8">
          {/* Sidebar */}
          <div className="space-y-6">
            {/* User Card */}
            <Card className="p-6 bg-zinc-900/60 border-zinc-800">
              {/* Avatar */}
              <div className="flex justify-center -mt-20 mb-4">
                <div className="w-32 h-32 rounded-full border-4 border-zinc-900 relative overflow-hidden">
                  {user.activeAvatarUrl || user.avatarUrl ? (
                    <img 
                      src={user.activeAvatarUrl || user.avatarUrl} 
                      alt={user.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-500" />
                  )}
                  {user.isOnline && (
                    <span className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-zinc-900" />
                  )}
                </div>
              </div>

              {/* User Info */}
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-white mb-2">{user.displayName || user.username}</h1>
                <p className="text-zinc-400 mb-4">@{user.username}</p>
                {user.bio && <p className="text-sm text-zinc-300">{user.bio}</p>}
                {/* Active Title Display */}
                {profile.activeTitleId && profile.titles && profile.titles.length > 0 && (() => {
                  const activeTitle = profile.titles.find(t => t.id === profile.activeTitleId);
                  return activeTitle ? (
                    <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-zinc-800/50 rounded-full border border-zinc-700">
                      {activeTitle.iconUrl && (
                        <img src={activeTitle.iconUrl} alt="" className="w-4 h-4" />
                      )}
                      <span className="text-xs font-medium text-zinc-300">{activeTitle.name}</span>
                    </div>
                  ) : null;
                })()}
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{user.stats.posts.toLocaleString()}</div>
                  <div className="text-xs text-zinc-500">Posts</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{user.stats.threads.toLocaleString()}</div>
                  <div className="text-xs text-zinc-500">Threads</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{user.stats.likes.toLocaleString()}</div>
                  <div className="text-xs text-zinc-500">Likes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{user.stats.reputation.toLocaleString()}</div>
                  <div className="text-xs text-zinc-500">Reputation</div>
                </div>
              </div>

              {/* Action Buttons */}
              {isOwnProfile ? (
                <Button className="w-full bg-zinc-800 hover:bg-zinc-700">
                  Edit Profile
                </Button>
              ) : (
                <div className="space-y-2">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    Follow
                  </Button>
                  <Button variant="outline" className="w-full">
                    Send Message
                  </Button>
                </div>
              )}
            </Card>

            {/* Badges */}
            <Card className="p-4 bg-zinc-900/60 border-zinc-800">
              <h3 className="text-sm font-semibold text-zinc-400 mb-3">Badges</h3>
              <div className="space-y-2">
                {user.badges.length > 0 ? (
                  user.badges.map((badge, i) => (
                    <div key={badge.id || i} className="flex items-center gap-2">
                      <span className="text-xl">{badge.icon}</span>
                      <span className="text-sm text-zinc-300">{badge.name}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-zinc-500 italic">No badges earned yet</p>
                )}
              </div>
            </Card>
            
            {/* User Titles */}
            {profile.titles && profile.titles.length > 0 && (
              <Card className="p-4 bg-zinc-900/60 border-zinc-800">
                <h3 className="text-sm font-semibold text-zinc-400 mb-3">Titles</h3>
                <UserTitles
                  titles={profile.titles}
                  activeTitleId={profile.activeTitleId}
                  editable={false}
                />
              </Card>
            )}
          </div>

          {/* Main Content */}
          <div className="space-y-6">
            {/* Level Progress */}
            <Card className="p-6 bg-zinc-900/60 border-zinc-800">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-white">Level {user.stats.level}</h2>
                  <p className="text-sm text-zinc-400">{user.stats.xp.toLocaleString()} / {user.stats.nextLevelXp.toLocaleString()} XP</p>
                </div>
                <Zap className="w-8 h-8 text-yellow-500" />
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full"
                  style={{ width: `${(user.stats.xp / user.stats.nextLevelXp) * 100}%` }}
                />
              </div>
            </Card>

            {/* Recent Activity */}
            <Card className="p-6 bg-zinc-900/60 border-zinc-800">
              <h2 className="text-lg font-semibold text-white mb-4">Recent Threads</h2>
              <div className="space-y-3">
                {recentThreads && recentThreads.length > 0 ? (
                  recentThreads.map((thread) => (
                    <Link key={thread.id} to={`/thread/${thread.slug}`}>
                    <div className="p-3 rounded-lg hover:bg-zinc-800/50 transition-colors cursor-pointer">
                      <h3 className="text-white font-medium mb-1">{thread.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-zinc-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatRelativeTime(thread.createdAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-4 h-4" />
                          {thread.postCount} replies
                        </span>
                      </div>
                    </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-sm text-zinc-500 italic">No threads yet</p>
                )}
              </div>
            </Card>

            {/* Member Info */}
            <Card className="p-6 bg-zinc-900/60 border-zinc-800">
              <h2 className="text-lg font-semibold text-white mb-4">Member Information</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Joined</span>
                  <span className="text-white">
                    {formatDistanceToNow(user.joinedAt, { addSuffix: true })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Last Seen</span>
                  <span className="text-white">
                    {user.isOnline ? (
                      <span className="text-green-400">Online Now</span>
                    ) : (
                      'Recently'
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Forum Role</span>
                  <span className="text-white capitalize">{profile.role || 'Member'}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </Wide>
    </div>
  );
}
