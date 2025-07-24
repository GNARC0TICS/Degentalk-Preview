import type { ProfileData } from '@app/types/profile';
import type { BadgeId, FrameId, TitleId } from '@shared/types/ids';
import { toUserId } from '@shared/utils/id';

/**
 * Generates mock `ProfileData` for local development.
 * This file is tree-shaken from production builds (via `import.meta.env.DEV`).
 */
export function generateMockProfile(username: string): ProfileData {
	return {
		id: toUserId('550e8400-e29b-41d4-a716-446655440000'),
		username,
		avatarUrl: 'https://i.pravatar.cc/300',
		role: 'Developer',
		bio: 'Mock user bio',
		signature: 'Mock signature',
		joinedAt: new Date().toISOString(),
		lastActiveAt: new Date().toISOString(),
		dgtBalance: 0,
		totalPosts: 0,
		totalThreads: 0,
		totalLikes: 0,
		totalTips: 0,
		clout: 0,
		level: 1,
		xp: 0,
		nextLevelXp: 100,
		bannerUrl: null,
		email: null,
		discordHandle: null,
		twitterHandle: null,
		telegramHandle: null,
		website: null,
		activeFrameId: null,
		activeFrame: null,
		activeTitleId: null,
		activeTitle: null,
		activeBadgeId: null,
		activeBadge: null,
		badges: [],
		titles: [],
		inventory: [],
		relationships: {
			friends: [],
			friendRequestsSent: 0,
			friendRequestsReceived: 0
		},
		stats: {
			threadViewCount: 0,
			posterRank: null,
			tipperRank: null,
			likerRank: null
		}
	};
}
