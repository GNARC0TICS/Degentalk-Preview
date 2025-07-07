import type { ProfileData } from '@/types/profile';
import { type BadgeId, type FrameId, type TitleId } from "@shared/types";

/**
 * Generates mock `ProfileData` for local development.
 * This file is tree-shaken from production builds (via `import.meta.env.DEV`).
 */
export function generateMockProfile(username: string): ProfileData {
	return {
		id: 'mock-user',
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
