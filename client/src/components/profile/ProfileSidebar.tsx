import React, { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loader';
import { WhisperButton } from '@/components/messages/WhisperButton';
import { WhisperModal } from '@/components/messages/WhisperModal';
import { Settings, UserCheck, UserPlus } from 'lucide-react';
import { cn, formatNumber, formatCurrency, formatRelativeTime } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth.tsx';
import type { ProfileData } from '@/types/profile';
import { useIdentityDisplay } from '@/hooks/useIdentityDisplay';
import { AvatarFrame } from '@/components/identity/AvatarFrame';
import { UserName } from '@/components/identity/UserName';
import { LevelBadge } from '@/components/identity/LevelBadge';

interface Props {
  profile: ProfileData;
  isOwnProfile: boolean;
}

const ProfileSidebar: React.FC<Props> = ({ profile, isOwnProfile }) => {
  const { toast } = useToast();
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Get identity display information
  const identity = useIdentityDisplay(profile);

  // Check follow status
  const { data: followStatus } = useQuery({
    queryKey: ['/api/relationships/is-following', profile.id],
    queryFn: async () => {
      if (isOwnProfile) return { isFollowing: false };
      // Ensure user is defined before trying to fetch follow status
      if (!user) return { isFollowing: false }; 
      const res = await apiRequest<{ isFollowing: boolean }>({ url: `/api/relationships/is-following/${profile.id}` });
      return res;
    },
    enabled: !isOwnProfile && !!user, // Only run if not own profile and user is logged in
  });

  const isFollowing = followStatus?.isFollowing || false;

  useEffect(() => {
    // This effect is not strictly needed anymore as isFollowing is derived from followStatus directly
    // but keeping it in case of future direct manipulations of isFollowing state, though unlikely.
    if (followStatus) {
      // setIsFollowing(followStatus.isFollowing); // No longer have setIsFollowing state hook
    }
  }, [followStatus]);

  // Follow / Unfollow
  const followMutation = useMutation({
    mutationFn: () => apiRequest({ url: `/api/relationships/follow/${profile.id}`, method: 'POST' }),
    onSuccess: () => {
      toast({ title: 'Success', description: `You are now following ${profile.username}` });
      queryClient.invalidateQueries({ queryKey: ['/api/relationships/is-following', profile.id] });
      queryClient.invalidateQueries({ queryKey: ['profile', profile.username] }); // Invalidate profile to update follower count potentially
    },
    onError: (err: any) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  });

  const unfollowMutation = useMutation({
    mutationFn: () => apiRequest({ url: `/api/relationships/unfollow/${profile.id}`, method: 'DELETE' }),
    onSuccess: () => {
      toast({ title: 'Success', description: `You have unfollowed ${profile.username}` });
      queryClient.invalidateQueries({ queryKey: ['/api/relationships/is-following', profile.id] });
      queryClient.invalidateQueries({ queryKey: ['profile', profile.username] });
    },
    onError: (err: any) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  });

  return (
    <div
      className={cn(
        'bg-gradient-to-b from-zinc-800/80 to-zinc-900/85 backdrop-blur-sm rounded-lg overflow-hidden shadow-xl relative border',
        identity?.avatarFrame?.rarityColor ? 'border-transparent' : 'border-zinc-700/50' // Make border transparent if glow exists
      )}
      style={identity?.avatarFrame?.rarityColor ? { boxShadow: `0 0 15px -3px ${identity.avatarFrame.rarityColor}, 0 0 5px -2px ${identity.avatarFrame.rarityColor}` } : {}}
    >
      <div className="p-6 flex flex-col items-center">
        {/* Avatar */}
        <div className="relative mb-4">
          <AvatarFrame
            avatarUrl={profile.avatarUrl || ''} // Ensure fallback for avatarUrl
            frame={identity?.avatarFrame}
            username={profile.username}
            size="xl"
            className="mb-2"
          />
        </div>

        {/* Username, Title, Role, Level */}
        <UserName user={profile} className="text-2xl font-bold text-center mb-1" />

        {identity?.primaryRole && (
           <Badge className="mb-2 uppercase bg-gradient-to-r from-purple-600 to-violet-600 text-white border-0" style={{ backgroundColor: identity.primaryRole.color || undefined }}>
            {identity.primaryRole.name}
          </Badge>
        )}
        {identity?.level && <LevelBadge level={identity.level} className="mb-4 text-sm" />}

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