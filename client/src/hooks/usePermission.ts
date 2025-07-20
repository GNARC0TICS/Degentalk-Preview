import { useMemo } from 'react';
import { useAuth } from '@/hooks/use-auth';
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

		// 4. Check accessLevel from rules
		const accessLevel = forum.rules?.accessLevel || 'public';
		const userRole = user?.role ?? 'user';
		
		switch (accessLevel) {
			case 'public':
				// Anyone can post (if logged in)
				if (!user) {
					return { canPost: false, reason: 'Please log in to post.' };
				}
				break;
				
			case 'registered':
				// All authenticated users can post
				if (!user) {
					return { canPost: false, reason: 'Please log in to post.' };
				}
				break;
				
			case 'level_10+':
				// Check user level (calculated from XP)
				const userLevel = Math.floor((user?.xp || 0) / 1000); // 1000 XP per level
				if (userLevel < 10) {
					return { canPost: false, reason: 'Requires Level 10+ to post in this forum.' };
				}
				break;
				
			case 'vip':
				// Check VIP status or elevated role
				const hasVipAccess = userRole === 'mod' || userRole === 'admin' || user?.isVip;
				if (!hasVipAccess) {
					return { canPost: false, reason: 'VIP members only.' };
				}
				break;
				
			case 'mod':
				// Moderators and admins only
				if (userRole !== 'mod' && userRole !== 'admin') {
					return { canPost: false, reason: 'Moderators only.' };
				}
				break;
				
			case 'admin':
				// Admins only
				if (userRole !== 'admin') {
					return { canPost: false, reason: 'Administrators only.' };
				}
				break;
		}
		
		// 5. Legacy VIP flag check (for backward compatibility)
		if (forum.isVip && userRole !== 'mod' && userRole !== 'admin' && !user?.isVip) {
			return { canPost: false, reason: 'VIP forum – VIP members only.' };
		}

		return { canPost: true };
	}, [forum, user?.xp, user?.role]);
}
