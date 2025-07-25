/**
 * Thread Data Transformer - Security-First Implementation
 *
 * Transforms raw database thread records into role-appropriate
 * response objects with GDPR compliance and audit trail.
 */

import type { UserId, ThreadId, ForumId } from '@shared/types/ids';
import type {
	PublicThread,
	SlimThread,
	AuthenticatedThread,
	ModerationThread
} from '../types';
import { createHash } from 'crypto';

export class ThreadTransformer {
	/**
	 * Transform thread data for public consumption
	 * Strips all moderation flags, system tags, and sensitive data
	 */
	static toPublic(dbThread: any): PublicThread {
		if (!dbThread) {
			throw new Error('Invalid thread data provided to transformer');
		}

		return {
			id: dbThread.id as ThreadId,
			title: dbThread.title,
			slug: dbThread.slug,
			createdAt: dbThread.createdAt,
			updatedAt: dbThread.updatedAt,
			lastPostAt: dbThread.lastPostAt,
			viewCount: dbThread.viewCount || 0,
			postCount: dbThread.postCount || 0,
			isSticky: dbThread.isSticky || false,
			isLocked: dbThread.isLocked || false,
			isSolved: dbThread.isSolved || false,

			// User data (safe fields only)
			user: {
				id: dbThread.user?.id as UserId,
				username: dbThread.user?.username || '[deleted]',
				avatarUrl: dbThread.user?.avatarUrl || undefined,
				role: dbThread.user?.role || 'user'
			},

			// Forum data (safe fields only)
			forum: dbThread.forum || dbThread.zone
				? {
						id: (dbThread.forum?.id || dbThread.zone?.id) as ForumId,
						name: dbThread.forum?.name || dbThread.zone?.name || 'General',
						slug: dbThread.forum?.slug || dbThread.zone?.slug || 'general',
						colorTheme: dbThread.forum?.colorTheme || dbThread.zone?.colorTheme || undefined
					}
				: undefined,

			category: dbThread.category
				? {
						id: dbThread.category.id,
						name: dbThread.category.name,
						slug: dbThread.category.slug
					}
				: undefined,

			// Tags (public only - filter out system tags)
			tags: this.filterPublicTags(dbThread.tags)
		};
	}

	/**
	 * Transform thread data for list views and cards
	 * Lightweight version with minimal data
	 */
	static toSlim(dbThread: any): SlimThread {
		if (!dbThread) {
			throw new Error('Invalid thread data provided to transformer');
		}

		return {
			id: dbThread.id as ThreadId,
			title: dbThread.title,
			slug: dbThread.slug,
			createdAt: dbThread.createdAt,
			viewCount: dbThread.viewCount || 0,
			postCount: dbThread.postCount || 0,
			isSticky: dbThread.isSticky || false,
			isLocked: dbThread.isLocked || false,
			isSolved: dbThread.isSolved || false,

			// Minimal user data
			user: {
				id: dbThread.user?.id as UserId,
				username: dbThread.user?.username || '[deleted]',
				role: dbThread.user?.role || 'user'
			},

			// Minimal forum data
			forum: {
				name: dbThread.forum?.name || dbThread.zone?.name || 'General',
				slug: dbThread.forum?.slug || dbThread.zone?.slug || 'general',
				colorTheme: dbThread.forum?.colorTheme || dbThread.zone?.colorTheme || undefined
			},

			// Optional engagement for homepage
			engagement: dbThread.engagement
				? {
						momentum: this.calculateMomentum(dbThread.engagement),
						totalTips: dbThread.engagement.totalTips || 0
					}
				: undefined
		};
	}

	/**
	 * Transform thread data for authenticated users
	 * Includes permissions and user-specific data
	 */
	static toAuthenticated(dbThread: any, requestingUser: any): AuthenticatedThread {
		const publicData = this.toPublic(dbThread);

		return {
			...publicData,
			excerpt: dbThread.excerpt || undefined,
			hasBookmarked: this.hasUserBookmarked(dbThread, requestingUser),

			// User permissions
			permissions: this.calculateThreadPermissions(dbThread, requestingUser),

			// Enhanced user data with forum stats (derived calculations)
			user: {
				...publicData.user,
				forumStats: dbThread.user
					? {
							level: this.calculateLevel(dbThread.user.xp || 0), // Derived from XP
							xp: dbThread.user.xp || 0,
							reputation: dbThread.user.reputation || 0,
							totalPosts: dbThread.user.postCount || 0
						}
					: undefined
			},

			// Engagement metrics (derived from tip data)
			engagement:
				dbThread.tips || dbThread.engagement
					? {
							totalTips: this.calculateTotalTips(dbThread.tips),
							uniqueTippers: this.calculateUniqueTippers(dbThread.tips),
							momentum: this.calculateMomentum(dbThread.engagement || {}),
							hotScore: this.calculateHotScore(dbThread)
						}
					: undefined
		};
	}

	/**
	 * Transform thread data for moderation view
	 * Includes all data for admin/moderator consumption
	 */
	static toAdmin(dbThread: any): ModerationThread {
		const authenticatedData = this.toAuthenticated(dbThread, { role: 'admin' });

		return {
			...authenticatedData,
			// Moderation fields
			isHidden: dbThread.isHidden || false,
			deletedAt: dbThread.deletedAt || undefined,
			deletedBy: (dbThread.deletedBy as UserId) || undefined,
			moderationReason: dbThread.moderationReason || undefined,
			visibilityStatus: dbThread.visibilityStatus || 'public',

			// System fields
			uuid: dbThread.uuid || undefined,
			pluginData: dbThread.pluginData || undefined,
			rewardRules: dbThread.rewardRules || undefined,
			xpMultiplier: dbThread.xpMultiplier || 1,

			// Advanced stats
			featuredBy: (dbThread.featuredBy as UserId) || undefined,
			featuredExpiresAt: dbThread.featuredExpiresAt || undefined,
			quarantineData: dbThread.quarantineData || undefined
		};
	}

	/**
	 * Batch transform threads based on user permissions
	 */
	static toList(
		dbThreads: any[],
		requestingUser: any,
		view: 'public' | 'slim' | 'authenticated' | 'admin' = 'public'
	): (PublicThread | SlimThread | AuthenticatedThread | ModerationThread)[] {
		return dbThreads.map((thread) => {
			switch (view) {
				case 'slim':
					return this.toSlim(thread);
				case 'authenticated':
					return this.toAuthenticated(thread, requestingUser);
				case 'admin':
					return this.toAdmin(thread);
				default:
					return this.toPublic(thread);
			}
		});
	}

	// Private utility methods

	private static filterPublicTags(tags: any[]): string[] {
		if (!tags || !Array.isArray(tags)) return [];

		return tags
			.filter((tag) => !tag.isSystem && !tag.isHidden)
			.map((tag) => tag.name)
			.filter(Boolean);
	}

	private static calculateMomentum(engagement: any): 'bullish' | 'bearish' | 'neutral' {
		if (!engagement) return 'neutral';

		const recentActivity = engagement.recentActivity || 0;
		const trendingScore = engagement.trendingScore || 0;

		if (recentActivity > 10 && trendingScore > 0.5) return 'bullish';
		if (recentActivity < 3 && trendingScore < -0.5) return 'bearish';
		return 'neutral';
	}

	private static hasUserBookmarked(dbThread: any, user: any): boolean {
		if (!user || !dbThread.bookmarks) return false;
		return dbThread.bookmarks.some((bookmark: any) => bookmark.userId === user.id);
	}

	/**
	 * Calculate total DGT tips for a thread
	 * Aggregates all tip amounts for display in engagement metrics
	 */
	private static calculateTotalTips(tipData: any[]): number {
		if (!tipData || !Array.isArray(tipData)) return 0;
		return tipData.reduce((total, tip) => total + (tip.amount || 0), 0);
	}

	/**
	 * Calculate unique tippers count for engagement metrics
	 */
	private static calculateUniqueTippers(tipData: any[]): number {
		if (!tipData || !Array.isArray(tipData)) return 0;
		const uniqueUserIds = new Set(tipData.map((tip) => tip.userId).filter(Boolean));
		return uniqueUserIds.size;
	}

	/**
	 * Calculate user's forum level from XP
	 * Clear derivation: XP -> Level conversion
	 */
	private static calculateLevel(xp: number): number {
		if (xp < 0) return 1;
		// Simple level calculation: Level = floor(XP / 100) + 1
		// This makes the XP->Level relationship transparent
		return Math.floor(xp / 100) + 1;
	}

	/**
	 * Calculate hot score based on views, tips, and recency
	 * Transparent algorithm for ranking trending content
	 */
	private static calculateHotScore(dbThread: any): number {
		const now = Date.now();
		const createdAt = new Date(dbThread.createdAt).getTime();
		const hoursOld = (now - createdAt) / (1000 * 60 * 60);

		const viewCount = dbThread.viewCount || 0;
		const postCount = dbThread.postCount || 0;
		const tipCount = this.calculateTotalTips(dbThread.tips);

		// Hot score formula: (engagement / time_decay)
		// Higher engagement (views + posts + tips) with recent bias
		const engagementScore = viewCount + postCount * 5 + tipCount * 10;
		const timeDecay = Math.max(1, hoursOld / 24); // Decay over days

		return Math.round(engagementScore / timeDecay);
	}

	private static calculateThreadPermissions(dbThread: any, user: any) {
		const isOwner = dbThread.userId === user?.id;
		const isModerator = this.isModerator(user);
		const isAdmin = this.isAdmin(user);

		return {
			canEdit: isOwner || isModerator || isAdmin,
			canDelete: isOwner || isModerator || isAdmin,
			canReply: !dbThread.isLocked || isModerator || isAdmin,
			canMarkSolved: isOwner || isModerator || isAdmin,
			canSticky: isModerator || isAdmin,
			canLock: isModerator || isAdmin
		};
	}

	private static isModerator(user: any): boolean {
		return user && (user.role === 'moderator' || user.role === 'admin' || user.role === 'owner');
	}

	private static isAdmin(user: any): boolean {
		return user && (user.role === 'admin' || user.role === 'owner');
	}
}

// Export convenience methods
export const {
	toPublic: toPublicThread,
	toSlim: toSlimThread,
	toAuthenticated: toAuthenticatedThread,
	toAdmin: toModerationThread
} = ThreadTransformer;