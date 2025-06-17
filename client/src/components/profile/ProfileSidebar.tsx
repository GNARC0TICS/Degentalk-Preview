import React, { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loader';
import { FramedAvatar } from '@/components/users/framed-avatar';
import { WhisperButton } from '@/components/messages/WhisperButton';
import { WhisperModal } from '@/components/messages/WhisperModal';
import { Settings, UserCheck, UserPlus } from 'lucide-react';
import { cn, formatNumber, formatCurrency, formatRelativeTime } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth.tsx';
import { getRarityBorderClass } from './rarityUtils';
import type { ProfileData } from '@/types/profile';

interface Props {
  profile: ProfileData;
  isOwnProfile: boolean;
}

const ProfileSidebar: React.FC<Props> = ({ profile, isOwnProfile }) => {
  const { toast } = useToast();
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Check follow status
  const { data: followStatus } = useQuery({
    queryKey: ['/api/relationships/is-following', profile.id],
    queryFn: async () => {
      if (isOwnProfile) return { isFollowing: false };
      const res = await fetch(`/api/relationships/is-following/${profile.id}`);
      if (!res.ok) throw new Error('Failed to fetch follow status');
      return res.json() as Promise<{ isFollowing: boolean }>;
    },
    enabled: !isOwnProfile,
  });

  useEffect(() => {
    if (followStatus) setIsFollowing(followStatus.isFollowing);
  }, [followStatus]);

  // Follow / Unfollow
  const followMutation = useMutation({
    mutationFn: () => apiRequest({ url: `/api/relationships/follow/${profile.id}`, method: 'POST' }),
    onSuccess: () => {
      setIsFollowing(true);
      toast({ title: 'Success', description: `You are now following ${profile.username}` });
      queryClient.invalidateQueries({ queryKey: ['/api/relationships/is-following', profile.id] });
    },
    onError: (err: any) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  });

  const unfollowMutation = useMutation({
    mutationFn: () => apiRequest({ url: `/api/relationships/unfollow/${profile.id}`, method: 'DELETE' }),
    onSuccess: () => {
      setIsFollowing(false);
      toast({ title: 'Success', description: `You have unfollowed ${profile.username}` });
      queryClient.invalidateQueries({ queryKey: ['/api/relationships/is-following', profile.id] });
    },
    onError: (err: any) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  });

  const frameRarityClass = profile.activeFrame ? getRarityBorderClass(profile.activeFrame.rarity) : '';
  const isPro = profile.level >= 10;

  return (
    <div
      className={cn(
        'bg-gradient-to-b from-zinc-800/80 to-zinc-900/85 backdrop-blur-sm rounded-lg overflow-hidden shadow-xl relative border',
        frameRarityClass || 'border-zinc-700/50'
      )}
    >
      <div className="p-6 flex flex-col items-center">
        {/* Avatar */}
        <div className="relative mb-4">
          <FramedAvatar
            avatarUrl={profile.avatarUrl}
            frameUrl={profile.activeFrame?.imageUrl || null}
            username={profile.username}
            size="xl"
            shape="circle"
            className="mb-2"
          />
        </div>

        {/* Username & Title */}
        <h1 className="text-2xl font-bold text-center text-white mb-1">{profile.username}</h1>
        {profile.activeTitle && (
          <div className="text-sm font-medium mb-2 px-3 py-0.5 rounded-full text-center bg-slate-800 text-white">
            {profile.activeTitle.name}
          </div>
        )}
        <Badge className="mb-4 uppercase bg-gradient-to-r from-purple-600 to-violet-600 text-white border-0">
          {profile.role || 'User'}
        </Badge>

        {/* Actions */}
        <div className="flex gap-2 w-full mb-6">
          {isOwnProfile ? (
            <Link href="/preferences">
              <Button className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 text-white">
                <Settings className="mr-2 h-4 w-4" />
                Preferences
              </Button>
            </Link>
          ) : (
            <>
              <Button
                className={`flex-1 ${
                  isFollowing
                    ? 'bg-gradient-to-r from-zinc-600 to-zinc-700'
                    : 'bg-gradient-to-r from-emerald-600 to-green-600'
                } text-white`}
                onClick={() => (isFollowing ? unfollowMutation.mutate() : followMutation.mutate())}
                disabled={followMutation.isPending || unfollowMutation.isPending}
              >
                {followMutation.isPending || unfollowMutation.isPending ? (
                  <LoadingSpinner size="sm" color="zinc" className="mr-2" />
                ) : isFollowing ? (
                  <UserCheck className="mr-2 h-4 w-4" />
                ) : (
                  <UserPlus className="mr-2 h-4 w-4" />
                )}
                {isFollowing ? 'Unfollow' : 'Follow'}
              </Button>
              <WhisperButton onClick={() => setIsMessageModalOpen(true)} className="flex-1" />
            </>
          )}
        </div>

        {isMessageModalOpen && (
          <WhisperModal
            isOpen={isMessageModalOpen}
            onClose={() => setIsMessageModalOpen(false)}
            initialUser={{ id: profile.id, username: profile.username, avatarUrl: profile.avatarUrl || undefined }}
          />
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 w-full text-center mb-6 bg-gradient-to-r from-zinc-800/40 to-zinc-900/40 p-4 rounded-lg border border-zinc-700/30 backdrop-blur-sm">
          <div className="flex flex-col">
            <span className="text-xl font-bold text-zinc-200">{formatNumber(profile.totalThreads)}</span>
            <span className="text-sm text-zinc-400">Threads</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold text-zinc-200">{formatNumber(profile.totalPosts)}</span>
            <span className="text-sm text-zinc-400">Posts</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold text-zinc-200">{formatNumber(profile.totalLikes)}</span>
            <span className="text-sm text-zinc-400">Likes</span>
          </div>
        </div>

        {/* About */}
        <div className="w-full bg-zinc-800/20 p-4 rounded-lg border border-zinc-700/30 mb-4">
          <h3 className="text-md font-semibold text-zinc-200 mb-2">About</h3>
          {profile.bio ? (
            <p className="text-zinc-300 text-sm">{profile.bio}</p>
          ) : (
            <p className="text-zinc-500 italic text-sm">No bio provided</p>
          )}
        </div>

        {/* XP, Balance & Clout */}
        <div className="text-xs text-zinc-400 w-full bg-zinc-800/20 p-3 rounded-lg">
          <div>Member since {new Date(profile.joinedAt).toLocaleDateString()}</div>
          {profile.lastActiveAt && (
            <div className="mt-1">Last active {formatRelativeTime(profile.lastActiveAt)}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileSidebar; 