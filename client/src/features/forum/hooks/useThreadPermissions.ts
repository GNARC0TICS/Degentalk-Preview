/**
 * Thread Permissions Hook
 *
 * Determines what actions a user can perform on threads and posts
 * based on forum rules, user role, and ownership.
 */

import { useAuth } from '@app/hooks/use-auth';
import { useForumStructure, type MergedForum } from '@app/features/forum/contexts/ForumStructureContext';
import type { Thread } from '@shared/types/thread.types';
import type { ResolvedZone } from '@app/types/thread.types';
import type { User } from '@shared/types/user.types';
import { toId } from '@shared/utils/id';
import type { ThreadId, UserId, ZoneId } from '@shared/types/ids';

interface PermissionResult {
	allowed: boolean;
	reason?: string;
}

// Updated interface to match expected return shape (6 boolean permissions)
interface ThreadPermissions {
	canEdit: boolean;
	canDelete: boolean;
	canMarkSolution: boolean;
	canModerate: boolean;
	canTip: boolean;
	canReport: boolean;
}

// Type-safe mock data matching actual project types
export const MOCK_THREAD: Thread = {
	id: toId<'ThreadId'>(crypto.randomUUID()),
	title: 'Test Thread',
	slug: 'test-thread',
	content: 'Test content',
	userId: toId<'UserId'>('test-user-123'),
	viewCount: 0,
	postCount: 0,
	createdAt: new Date().toISOString(),
	user: {
		id: toId<'UserId'>('test-user-123'),
		username: 'testuser',
		displayRole: 'Member',
		badgeColor: '#666'
	} as User & { displayRole?: string; badgeColor?: string },
	category: {
		id: crypto.randomUUID(),
		name: 'Test Category',
		slug: 'test-category'
	},
	zone: {
		id: toId<'ZoneId'>(crypto.randomUUID()),
		name: 'Test Zone',
		slug: 'test-zone',
		colorTheme: 'blue',
		type: 'topic' as const,
		description: 'Test zone',
		rules: {
			allowPosting: true,
			minLevel: 1,
			requiresVerification: false
		},
		forums: [],
		icon: null,
		isSystem: false,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
		isPrimary: false
	} as ResolvedZone
};

export const MOCK_POST = {
	id: crypto.randomUUID(),
	userId: 'test-user-123',
	content: 'Test post content',
	createdAt: new Date().toISOString()
};

/**
 * Hook to determine user permissions for thread/post actions
 */
export const useThreadPermissions = (
	thread: Thread | null,
	forumSlug: string | null
): ThreadPermissions => {
	const { user } = useAuth();
	const { getForum } = useForumStructure();

	const forum = forumSlug ? getForum(forumSlug) : null;
	const isAuthenticated = !!user;
	const userXP = user?.forumStats?.xp || 0;
	const userRole = user?.role || 'user';
	const userId = user?.id;

	// Helper to check if user is moderator or admin
	const isModerator = userRole === 'moderator' || userRole === 'admin';
	const isAdmin = userRole === 'admin';

	// Helper to check forum-level permissions
	const checkForumPermissions = (action: 'post' | 'moderate'): PermissionResult => {
		if (!forum) {
			return { allowed: false, reason: 'Forum not found' };
		}

		// Check if forum is locked
		if (forum.isLocked && !isModerator) {
			return { allowed: false, reason: 'This forum is locked' };
		}

		// Check minimum XP requirement
		if (forum.minXp && userXP < forum.minXp) {
			return {
				allowed: false,
				reason: `You need at least ${forum.minXp} XP to ${action} in this forum`
			};
		}

		// Check if posting is allowed
		if (!forum.rules?.allowPosting && action === 'post' && !isModerator) {
			return { allowed: false, reason: 'Posting is disabled in this forum' };
		}

		return { allowed: true };
	};

	// Helper function to check basic permissions
	const checkBasicPermissions = (): PermissionResult => {
		if (!isAuthenticated) {
			return { allowed: false, reason: 'You must be logged in' };
		}

		if (thread?.isLocked && !isModerator) {
			return { allowed: false, reason: 'This thread is locked' };
		}

		const forumCheck = checkForumPermissions('post');
		if (!forumCheck.allowed) {
			return forumCheck;
		}

		return { allowed: true };
	};

	// Can edit thread/post (thread author or moderator)
	const canEdit = (() => {
		if (!isAuthenticated) return false;
		if (isModerator) return true;
		if (thread && userId && thread.userId === String(userId)) return true;
		return false;
	})();

	// Can delete thread/post (thread author or moderator, with time limits for non-mods)
	const canDelete = (() => {
		if (!isAuthenticated) return false;
		if (isModerator) return true;
		if (thread && userId && thread.userId === String(userId)) {
			// Non-moderators have time limits (e.g., 5 minutes)
			const threadDate = new Date(thread.createdAt);
			const now = new Date();
			const minutesSinceCreation = (now.getTime() - threadDate.getTime()) / (1000 * 60);
			return minutesSinceCreation <= 5;
		}
		return false;
	})();

	// Can mark thread as solved (thread author or moderator)
	const canMarkSolution = (() => {
		if (!isAuthenticated) return false;
		if (isModerator) return true;
		if (thread && userId && thread.userId === String(userId) && !thread.isSolved) return true;
		return false;
	})();

	// Can moderate (moderator or admin only)
	const canModerate = isModerator;

	// Can tip posts (authenticated users, not own posts)
	const canTip = (() => {
		if (!isAuthenticated) return false;
		if (thread && userId && thread.userId === String(userId)) return false; // Can't tip own content
		return true;
	})();

	// Can report posts (authenticated users)
	const canReport = isAuthenticated;

	return {
		canEdit,
		canDelete,
		canMarkSolution,
		canModerate,
		canTip,
		canReport
	};
};
