import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import type { UserId } from '@shared/types/ids';

export interface FriendUserLite {
	id: string;
	username: string;
	avatarUrl: string | null;
	activeAvatarUrl?: string | null;
	level?: number | null;
	role?: string | null;
}

interface FriendsApiResponse {
	friends: { friend: FriendUserLite }[]; // shape from backend (see FriendsService getUserFriends)
}

interface UseFriendsResult {
	mutual: FriendUserLite[];
	all?: FriendUserLite[]; // only when viewing own profile
	isLoading: boolean;
	error: Error | null;
}

export function useFriends(profileUserId: string | undefined): UseFriendsResult {
	const { user: currentUser } = useAuth();
	const viewingOwnProfile = currentUser && profileUserId === currentUser.id;

	// Fetch accepted friends list for profile user
	const {
		data: profileFriends,
		isLoading: loadingProfile,
		error: profileError
	} = useQuery<FriendsApiResponse | undefined, Error>({
		queryKey: ['friends-profile', profileUserId],
		queryFn: async () => {
			if (!profileUserId) return undefined;
			return apiRequest({ url: `/api/social/friends?user=${profileUserId}&status=accepted` });
		},
		enabled: Boolean(profileUserId)
	});

	// If not same user, fetch current viewer friends to compute mutual
	const { data: viewerFriends, isLoading: loadingViewer } = useQuery<
		FriendsApiResponse | undefined,
		Error
	>({
		queryKey: ['friends-viewer'],
		queryFn: async () => {
			if (!currentUser || viewingOwnProfile) return undefined;
			return apiRequest({ url: `/api/social/friends?user=${currentUser.id}&status=accepted` });
		},
		enabled: Boolean(currentUser) && !viewingOwnProfile
	});

	const profileList = profileFriends?.friends?.map((f) => f.friend) ?? [];
	const viewerList = viewerFriends?.friends?.map((f) => f.friend) ?? [];

	let mutual: FriendUserLite[] = [];
	if (viewingOwnProfile) {
		mutual = profileList; // mutual == all for own view
	} else {
		const viewerSet = new Set(viewerList.map((u) => u.id));
		mutual = profileList.filter((u) => viewerSet.has(u.id));
	}

	return {
		mutual,
		all: viewingOwnProfile ? profileList : undefined,
		isLoading: loadingProfile || loadingViewer,
		error: profileError ?? null
	};
}
