import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

/**
 * Type definitions for User Settings data
 */
export interface UserSettingsData {
  profile: {
    id: number;
    username: string;
    email: string;
    bio: string | null;
    signature: string | null;
    avatarUrl: string | null;
    profileBannerUrl: string | null;
    discordHandle: string | null;
    twitterHandle: string | null;
    website: string | null;
    telegramHandle: string | null;
    activeTitleId: number | null;
    activeBadgeId: number | null;
    activeFrameId: number | null;
  };
  settings: {
    userId: number;
    theme: string;
    language: string;
    timezone: string | null;
    sidebarState: Record<string, any>;
    shoutboxPosition: string;
    profileVisibility: string;
  };
  notifications: {
    userId: number;
    receiveEmailNotifications: boolean;
    notifyOnMentions: boolean;
    notifyOnNewReplies: boolean;
    notifyOnLevelUp: boolean;
    notifyOnMissionUpdates: boolean;
    notifyOnWalletTransactions: boolean;
  };
}

/**
 * Hook to fetch user settings from the API
 * 
 * @returns Query result containing user settings data, loading state, and error state
 */
export function useUserSettings() {
  return useQuery<UserSettingsData>({
    queryKey: ['user-settings'],
    queryFn: async () => {
      return apiRequest({
        url: '/api/users/me/settings-all',
        method: 'GET'
      });
    },
    staleTime: 60 * 1000, // 1 minute
  });
} 