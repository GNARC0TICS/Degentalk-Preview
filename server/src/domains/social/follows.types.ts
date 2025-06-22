export interface FollowNotificationSettings {
	notifyOnPosts: boolean;
	notifyOnThreads: boolean;
	notifyOnTrades: boolean;
	notifyOnLargeStakes: boolean;
	minStakeNotification: number;
}

export interface UserStats {
	id: string;
	username: string;
	avatarUrl?: string | null;
	activeAvatarUrl?: string | null;
	level?: number | null;
	role?: string | null;
	clout?: number | null;
	dgtBalance?: number | null;
	postCount?: number | null;
	followerCount?: number | null;
	followingCount?: number | null;
	isWhale?: boolean;
}

export interface FollowUser {
	id: string;
	username: string;
	avatarUrl?: string | null;
	activeAvatarUrl?: string | null;
	level?: number | null;
	role?: string | null;
	clout?: number | null;
	isFollowing?: boolean;
}

export interface FollowRelationship {
	id: number;
	followerId: string;
	followedId: string;
	followedAt: Date;
	notificationSettings: FollowNotificationSettings;
	user: FollowUser;
	notes?: string | null;
}

export interface FollowRequest {
	id: number;
	requesterId: string;
	targetId: string;
	message?: string | null;
	createdAt: Date;
	requester: FollowUser;
}

export interface FollowCounts {
	following: number;
	followers: number;
}

export interface FollowPreferences {
	allowAllFollows: boolean;
	onlyFriendsCanFollow: boolean;
	requireFollowApproval: boolean;
	hideFollowerCount: boolean;
	hideFollowingCount: boolean;
	hideFollowersList: boolean;
	hideFollowingList: boolean;
	notifyOnNewFollower: boolean;
	emailOnNewFollower: boolean;
}

export interface WhaleActivity {
	id: string;
	type: 'post' | 'thread' | 'trade' | 'stake';
	content: string;
	timestamp: Date;
	user: FollowUser;
	metadata?: {
		threadTitle?: string;
		forumName?: string;
		amount?: number;
		currency?: string;
	};
}

export interface FollowingActivityFeed {
	activities: WhaleActivity[];
	pagination: {
		page: number;
		limit: number;
		hasMore: boolean;
	};
}
