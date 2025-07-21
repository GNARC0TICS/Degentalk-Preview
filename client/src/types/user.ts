import type { UserId } from '@shared/types/ids';
import type { BasicRole } from '@shared/types/index';

/**
 * Base User interface for authentication and general use
 */
export interface User {
	id: string | UserId;
	username: string;
	email?: string;
	role: string | BasicRole;
	permissions?: string[] | undefined;
	status?: 'active' | 'suspended' | 'banned';
	
	// Optional extended properties from CanonicalUser
	displayName?: string;
	avatarUrl?: string;
	activeAvatarUrl?: string;
	
	// Forum-specific data (optional for base user)
	forumStats?: {
		level: number;
		xp: number;
		reputation: number;
		totalPosts: number;
		totalThreads: number;
		totalLikes: number;
		totalTips: number;
	};
	
	// Status indicators (optional for base user)
	isOnline?: boolean;
	lastSeenAt?: string;
	joinedAt?: string;
	
	// Computed role helpers (optional for base user)
	isAdmin?: boolean;
	isModerator?: boolean;
	isVerified?: boolean;
	isBanned?: boolean;
}