import { useMemo } from 'react';
import { useAuth } from '@/hooks/use-auth.tsx';
import type { MergedForum } from '@/contexts/ForumStructureContext';

export interface PermissionResult {
	/** Can the current user create new threads in this forum? */
	canPost: boolean;
	/** Optional explanation shown in UI if canPost is false */
	reason?: string;
}

/**
 * Centralised permission helper for forum actions (Phase-1 subset).
 *
 * This looks at:
 * • Forum lock status
 * • Forum rule `allowPosting`
 * • Forum `minXp` requirement
 * • Basic role gating for mod/admin-only forums (accessLevel)
 *
 * NOTE: `MergedRules` in the current context doesn't yet expose `accessLevel`
 * directly.  We fallback to `forum.isVip` as a simple flag and assume VIP
 * requires at least `level_10+` (XP> 5000) or mod/admin.
 *
 * This helper can be expanded later with more granular rule evaluation
 * (prefix grants, tipping, custom rules, etc.) without touching calling code.
 */
export function usePermission(forum?: MergedForum | null): PermissionResult {
	const { user } = useAuth();

	return useMemo<PermissionResult>(() => {
		if (!forum) {
			return { canPost: false, reason: 'Forum not found' };
		}

		// 1. Hard lock flag from backend / admin panel
		if (forum.isLocked) {
			return { canPost: false, reason: 'Posting is disabled – forum is locked.' };
		}

		// 2. Rules.allowPosting flag (merged from pluginData)
		if (forum.rules && forum.rules.allowPosting === false) {
			return { canPost: false, reason: 'Posting is disabled by forum rules.' };
		}

		// 3. Minimum XP requirement (simple numeric check for now)
		if (typeof forum.minXp === 'number' && forum.minXp > 0) {
			const currentXp = user?.xp ?? 0;
			if (currentXp < forum.minXp) {
				return {
					canPost: false,
					reason: `You need at least ${forum.minXp} XP to post in this forum.`
				};
			}
		}

		// 4. Very coarse role gating – treat VIP forums as level_10+ or staff-only for now.
		if (forum.isVip) {
			const role = user?.role ?? 'user';
			const hasElevatedRole = role === 'mod' || role === 'admin';
			if (!hasElevatedRole) {
				return { canPost: false, reason: 'VIP forum – staff or VIP members only.' };
			}
		}

		return { canPost: true };
	}, [forum, user?.xp, user?.role]);
}
