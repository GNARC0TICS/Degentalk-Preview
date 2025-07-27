import { useAuth } from '@/hooks/use-auth';
import type { CanonicalUser } from '@/types/canonical.types';
import type { User } from '@shared/types/user.types';

/**
 * Maps a regular User to a CanonicalUser for forum contexts
 */
function toCanonicalUser(user: User | null): CanonicalUser | null {
  if (!user) return null;

  return {
    id: user.id,
    username: user.username,
    displayName: user.username, // Use username as displayName fallback
    avatarUrl: user.avatarUrl || undefined,
    activeAvatarUrl: user.avatarUrl || undefined,
    role: user.role,
    forumStats: {
      level: user.level || 0,
      xp: user.xp || 0,
      reputation: user.reputation || 0,
      totalPosts: 0, // These would come from forum-specific API
      totalThreads: 0,
      totalLikes: 0,
      totalTips: 0,
    },
    isOnline: true, // User is online if authenticated
    lastSeenAt: user.lastActiveAt || undefined,
    joinedAt: user.createdAt,
    isAdmin: user.isAdmin || false,
    isModerator: user.isModerator || false,
    isVerified: user.isVerified || false,
    isBanned: user.isBanned || false,
    reputation: user.reputation || 0,
  };
}

/**
 * Hook that provides CanonicalUser interface for forum components
 * This is a compatibility layer while transitioning to the new user model
 */
export function useCanonicalAuth() {
  const authContext = useAuth();
  
  return {
    ...authContext,
    user: toCanonicalUser(authContext.user),
  };
}