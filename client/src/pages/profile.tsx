import React from 'react';
import { ArrowLeft, MessageSquare, Calendar, Award, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { Wide } from '@/layout/primitives';
import { Link } from 'react-router-dom';

// Demo user profile data
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
  const isOwnProfile = true; // For demo, assume viewing own profile
  
  // For demo purposes, show as CryptoKing regardless of auth status

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
                <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full border-4 border-zinc-900 relative">
                  {demoUser.isOnline && (
                    <span className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-zinc-900" />
                  )}
                </div>
              </div>

              {/* User Info */}
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-white mb-2">{demoUser.displayName}</h1>
                <p className="text-zinc-400 mb-4">@{demoUser.username}</p>
                <p className="text-sm text-zinc-300">{demoUser.bio}</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{demoUser.stats.posts}</div>
                  <div className="text-xs text-zinc-500">Posts</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{demoUser.stats.threads}</div>
                  <div className="text-xs text-zinc-500">Threads</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{demoUser.stats.likes}</div>
                  <div className="text-xs text-zinc-500">Likes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{demoUser.stats.reputation}</div>
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
                {demoUser.badges.map((badge, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-xl">{badge.icon}</span>
                    <span className="text-sm text-zinc-300">{badge.name}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="space-y-6">
            {/* Level Progress */}
            <Card className="p-6 bg-zinc-900/60 border-zinc-800">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-white">Level {demoUser.stats.level}</h2>
                  <p className="text-sm text-zinc-400">{demoUser.stats.xp.toLocaleString()} / {demoUser.stats.nextLevelXp.toLocaleString()} XP</p>
                </div>
                <Zap className="w-8 h-8 text-yellow-500" />
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full"
                  style={{ width: `${(demoUser.stats.xp / demoUser.stats.nextLevelXp) * 100}%` }}
                />
              </div>
            </Card>

            {/* Recent Activity */}
            <Card className="p-6 bg-zinc-900/60 border-zinc-800">
              <h2 className="text-lg font-semibold text-white mb-4">Recent Threads</h2>
              <div className="space-y-3">
                {demoUser.recentThreads.map((thread, i) => (
                  <Link key={i} to={`/threads/${thread.slug}`}>
                    <div className="p-3 rounded-lg hover:bg-zinc-800/50 transition-colors cursor-pointer">
                      <h3 className="text-white font-medium mb-1">{thread.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-zinc-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDistanceToNow(thread.createdAt, { addSuffix: true })}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-4 h-4" />
                          {thread.replyCount} replies
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </Card>

            {/* Member Info */}
            <Card className="p-6 bg-zinc-900/60 border-zinc-800">
              <h2 className="text-lg font-semibold text-white mb-4">Member Information</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Joined</span>
                  <span className="text-white">
                    {formatDistanceToNow(demoUser.joinedAt, { addSuffix: true })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Last Seen</span>
                  <span className="text-white">
                    {demoUser.isOnline ? (
                      <span className="text-green-400">Online Now</span>
                    ) : (
                      'Recently'
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Forum Role</span>
                  <span className="text-white">Member</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </Wide>
    </div>
  );
}
