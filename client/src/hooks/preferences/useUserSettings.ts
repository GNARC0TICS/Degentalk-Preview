import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api-request';
import type { UserId, BadgeId, FrameId, TitleId } from '@shared/types/ids';

/**
 * Type definitions for User Preferences data
 */
export interface UserSettingsData {
	profile: {
		id: UserId;
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
		activeTitleId: TitleId | null;
		activeBadgeId: BadgeId | null;
		activeFrameId: FrameId | null;
	};
	preferences: {
		userId: UserId;
		theme: string;
		language: string;
		timezone: string | null;
		sidebarState: Record<string, any>;
		shoutboxPosition: string;
		profileVisibility: string;
	};
	notifications: {
		userId: UserId;
		receiveEmailNotifications: boolean;
		notifyOnMentions: boolean;
		notifyOnNewReplies: boolean;
		notifyOnLevelUp: boolean;
		notifyOnMissionUpdates: boolean;
		notifyOnWalletTransactions: boolean;
	};
}

/**
 * Hook to fetch user preferences from the API
 *
 * @returns Query result containing user preferences data, loading state, and error state
 */
export function useUserSettings() {
	return useQuery<UserSettingsData>({
		queryKey: ['user-preferences'],
		queryFn: async (): Promise<UserSettingsData> => {
			return apiRequest<UserSettingsData>({
				url: '/api/users/me/preferences-all',
				method: 'GET'
			});
		},
		staleTime: 60 * 1000 // 1 minute
	});
}
