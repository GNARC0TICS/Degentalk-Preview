/**
 * Enhanced Authentication Hook with CanonicalUser
 * 
 * This is the enterprise-grade auth solution that returns fully-formed user profiles
 * with all forum stats, online status, and other canonical fields
 */

import { useAuth } from '@/hooks/use-auth';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/utils/api-request';
import type { CanonicalUser } from '@/types/canonical.types';
import type { User } from '@/types/user';
import { toCanonicalUser } from '@/utils/user-transformer';

interface UserProfileResponse {
  user: CanonicalUser;
  stats: {
    totalPosts: number;
    totalThreads: number;
    totalLikes: number;
    totalTips: number;
  };
  activity: {
    lastSeenAt: string;
    isOnline: boolean;
  };
}

/**
 * Fetch enhanced user profile with all canonical fields
 */
async function fetchUserProfile(userId: string): Promise<CanonicalUser> {
  try {
    // First try the enhanced endpoint (when it exists)
    const response = await apiRequest<UserProfileResponse>({
      url: `/api/users/${userId}/profile`,
      method: 'GET',
    });
    
    return response.user;
  } catch (error) {
    // Fallback: use basic auth data and transform
    // This allows gradual migration
    console.warn('Enhanced profile endpoint not available, using transformer', error);
    
    // Fetch basic user data
    const basicUser = await apiRequest<User>({
      url: '/api/auth/user',
      method: 'GET',
    });
    
    if (!basicUser) throw new Error('User not found');
    
    // Transform to canonical format
    return toCanonicalUser(basicUser);
  }
}

/**
 * Enhanced auth hook that returns CanonicalUser
 * Drop-in replacement for useAuth() that provides full user profiles
 */
export function useCanonicalAuth() {
  const basicAuth = useAuth();
  
  // Fetch enhanced profile when we have a user
  const { data: canonicalUser, isLoading: profileLoading } = useQuery({
    queryKey: ['canonicalUser', basicAuth.user?.id],
    queryFn: () => fetchUserProfile(basicAuth.user!.id),
    enabled: !!basicAuth.user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes (was cacheTime in v4)
  });
  
  // Return enhanced auth object
  return {
    ...basicAuth,
    user: canonicalUser || (basicAuth.user ? toCanonicalUser(basicAuth.user) : null),
    isLoading: basicAuth.isLoading || profileLoading,
    isCanonical: !!canonicalUser, // Flag to indicate if we have full profile
  };
}

/**
 * Hook to get current user as CanonicalUser
 * Convenience wrapper for components that only need the user
 */
export function useCurrentUser(): CanonicalUser | null {
  const { user } = useCanonicalAuth();
  return user;
}

/**
 * Type-safe permission check with canonical user
 */
export function useCanonicalPermission(permission: string): boolean {
  const { user } = useCanonicalAuth();
  
  if (!user) return false;
  
  // Admin/mod shortcuts
  if (user.isAdmin) return true;
  if (user.isModerator && permission.startsWith('forum.')) return true;
  
  // Check specific permissions (when implemented)
  // return user.permissions?.includes(permission) ?? false;
  
  return false;
}