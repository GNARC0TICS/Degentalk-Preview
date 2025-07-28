/**
 * Forum Data Transformer - Security-First Implementation
 *
 * Transforms raw database forum records into role-appropriate
 * response objects with GDPR compliance and audit trail.
 */

import type { UserId } from '@shared/types/ids';
import type {
	PublicThread,
	SlimThread,
	AuthenticatedThread,
	ModerationThread,
	PublicPost,
	AuthenticatedPost,
	ModerationPost,
	PublicForumStructure,
	AuthenticatedForumStructure,
	ModerationForumStructure
} from '../types';
import type { ThreadId, PostId, UserId, ForumId, ZoneId } from '@shared/types/ids';
// import { UserTransformer } from '../../users/transformers/user.transformer'; // TODO: Add when available
import { createHash } from 'crypto';

export class ForumTransformer {
	/**
	 * Transform thread data for public consumption
	 * Strips all moderation flags, system tags, and sensitive data
	 */
	static toPublicThread(dbThread: any): PublicThread {
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

			// User data (via UserTransformer)
			user: {
				id: dbThread.user?.id as UserId,
				username: dbThread.user?.username || '[deleted]',
				avatarUrl: dbThread.user?.avatarUrl || undefined,
				role: dbThread.user?.role || 'user'
			},

			// Zone/Category data (safe fields only)
			zone: {
				id: dbThread.zone?.id as ZoneId,
				name: dbThread.zone?.name || 'General',
				slug: dbThread.zone?.slug || 'general',
				colorTheme: dbThread.zone?.colorTheme || undefined
			},

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
	static toSlimThread(dbThread: any): SlimThread {
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

			// Minimal zone data
			zone: {
				name: dbThread.zone?.name || 'General',
				slug: dbThread.zone?.slug || 'general',
				colorTheme: dbThread.zone?.colorTheme || undefined
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
	static toAuthenticatedThread(dbThread: any, requestingUser: any): AuthenticatedThread {
		const publicData = this.toPublicThread(dbThread);

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
	static toModerationThread(dbThread: any): ModerationThread {
		const authenticatedData = this.toAuthenticatedThread(dbThread, { role: 'admin' });

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
	 * Transform post data for public consumption
	 * Strips all moderation and system data
	 */
	static toPublicPost(dbPost: any): PublicPost {
		if (!dbPost) {
			throw new Error('Invalid post data provided to transformer');
		}

		return {
			id: dbPost.id as PostId,
			content: dbPost.content,
			createdAt: dbPost.createdAt,
			updatedAt: dbPost.updatedAt,
			likeCount: dbPost.likeCount || 0,
			isEdited: dbPost.isEdited || false,
			editedAt: dbPost.editedAt || undefined,
			threadId: dbPost.threadId as ThreadId,
			replyToPostId: (dbPost.replyToPostId as PostId) || undefined,

			// User data (transformed)
			user: {
				id: dbPost.user?.id as UserId,
				username: dbPost.user?.username || '[deleted]',
				avatarUrl: dbPost.user?.avatarUrl || undefined,
				role: dbPost.user?.role || 'user'
			}
		};
	}

	/**
	 * Transform post data for authenticated users
	 * Includes permissions and user-specific data
	 */
	static toAuthenticatedPost(dbPost: any, requestingUser: any): AuthenticatedPost {
		const publicData = this.toPublicPost(dbPost);

		return {
			...publicData,
			hasLiked: this.hasUserLiked(dbPost, requestingUser),
			tipAmount: this.getUserTipAmount(dbPost, requestingUser),

			// Permissions
			permissions: this.calculatePostPermissions(dbPost, requestingUser),

			// Enhanced user data (derived calculations)
			user: {
				...publicData.user,
				forumStats: dbPost.user
					? {
							level: this.calculateLevel(dbPost.user.xp || 0), // Derived from XP
							xp: dbPost.user.xp || 0,
							reputation: dbPost.user.reputation || 0
						}
					: undefined
			}
		};
	}

	/**
	 * Transform post data for moderation view
	 * Includes all data for admin/moderator consumption
	 */
	static toModerationPost(dbPost: any): ModerationPost {
		const authenticatedData = this.toAuthenticatedPost(dbPost, { role: 'admin' });

		return {
			...authenticatedData,
			isHidden: dbPost.isHidden || false,
			deletedAt: dbPost.deletedAt || undefined,
			deletedBy: (dbPost.deletedBy as UserId) || undefined,
			moderationReason: dbPost.moderationReason || undefined,
			editorState: dbPost.editorState || undefined,
			pluginData: dbPost.pluginData || undefined,
			ipHash: dbPost.ipAddress ? this.hashIP(dbPost.ipAddress) : undefined
		};
	}

	/**
	 * Transform forum structure for public consumption
	 */
	static toPublicForumStructure(dbForum: any): PublicForumStructure {
		if (!dbForum) {
			throw new Error('Invalid forum data provided to transformer');
		}

		return {
			id: dbForum.id as ForumId,
			name: dbForum.name,
			slug: dbForum.slug,
			description: dbForum.description || undefined,
			type: dbForum.type || 'forum',
			position: dbForum.position || 0,
			color: dbForum.color || undefined,
			icon: dbForum.icon || undefined,
			colorTheme: dbForum.colorTheme || undefined,
			isFeatured: dbForum.isFeatured || false,
			themePreset: dbForum.themePreset || undefined,
			threadCount: dbForum.threadCount || 0,
			postCount: dbForum.postCount || 0,
			lastPostAt: dbForum.lastPostAt || undefined,
			isVip: dbForum.isVip || false,
			minXp: dbForum.minXp || 0,
			tippingEnabled: dbForum.tippingEnabled || false,

			// Child forums/zones (recursively transformed)
			children: dbForum.childStructures
				? dbForum.childStructures.map((child: any) => this.toPublicForumStructure(child))
				: undefined
		};
	}

	/**
	 * Transform forum structure for authenticated users
	 */
	static toAuthenticatedForumStructure(
		dbForum: any,
		requestingUser: any
	): AuthenticatedForumStructure {
		const publicData = this.toPublicForumStructure(dbForum);

		return {
			...publicData,
			permissions: this.calculateForumPermissions(dbForum, requestingUser),
			hasNewPosts: this.hasNewPosts(dbForum, requestingUser),
			lastVisitAt: this.getLastVisitTime(dbForum, requestingUser)
		};
	}

	/**
	 * Transform forum structure for moderation view
	 */
	static toModerationForumStructure(dbForum: any): ModerationForumStructure {
		const authenticatedData = this.toAuthenticatedForumStructure(dbForum, { role: 'admin' });

		return {
			...authenticatedData,
			isHidden: dbForum.isHidden || false,
			minGroupIdRequired: dbForum.minGroupIdRequired || undefined,
			pluginData: dbForum.pluginData || undefined,
			rewardRules: dbForum.rewardRules || undefined,
			moderationSettings: dbForum.moderationSettings || undefined
		};
	}

	/**
	 * Batch transform threads based on user permissions
	 */
	static toThreadList(
		dbThreads: any[],
		requestingUser: any,
		view: 'public' | 'slim' | 'authenticated' | 'moderation' = 'public'
	): (PublicThread | SlimThread | AuthenticatedThread | ModerationThread)[] {
		return dbThreads.map((thread) => {
			switch (view) {
				case 'slim':
					return this.toSlimThread(thread);
				case 'authenticated':
					return this.toAuthenticatedThread(thread, requestingUser);
				case 'moderation':
					return this.toModerationThread(thread);
				default:
					return this.toPublicThread(thread);
			}
		});
	}

	/**
	 * Batch transform posts based on user permissions
	 */
	static toPostList(
		dbPosts: any[],
		requestingUser: any,
		view: 'public' | 'authenticated' | 'moderation' = 'public'
	): (PublicPost | AuthenticatedPost | ModerationPost)[] {
		return dbPosts.map((post) => {
			switch (view) {
				case 'authenticated':
					return this.toAuthenticatedPost(post, requestingUser);
				case 'moderation':
					return this.toModerationPost(post);
				default:
					return this.toPublicPost(post);
			}
		});
	}

	static toPublicUser(user: { id: string; username: string; avatar: string | null }) {
		return {
			id: user.id,
			username: user.username,
			avatar: user.avatar
		};
	}

	static toPublicPrefix(prefix: {
		id: string;
		name: string;
		slug: string;
		color: string | null;
		icon: string | null;
	}) {
		return {
			id: prefix.id,
			name: prefix.name,
			slug: prefix.slug,
			color: prefix.color,
			icon: prefix.icon
		};
	}

	static toPublicTag(tag: { id: string; name: string; slug: string }) {
		return {
			id: tag.id,
			name: tag.name,
			slug: tag.slug
		};
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

	private static hasUserLiked(dbPost: any, user: any): boolean {
		if (!user || !dbPost.likes) return false;
		return dbPost.likes.some((like: any) => like.userId === user.id);
	}

	private static getUserTipAmount(dbPost: any, user: any): number | undefined {
		if (!user || !dbPost.tips) return undefined;
		const userTip = dbPost.tips.find((tip: any) => tip.userId === user.id);
		return userTip?.amount || undefined;
	}

	/**
	 * Calculate total DGT tips for a thread/post
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

	/**
	 * Check if user can tip based on XP requirements and other factors
	 */
	private static canUserTip(user: any, target: any, forum: any): boolean {
		if (!user || !target) return false;
		if (user.id === target.userId) return false; // Can't tip yourself

		// Check minimum XP requirement for tipping
		const minimumXpForTipping = forum?.minimumXpForTipping || 50;
		const userXp = user.forumStats?.xp || 0;

		return userXp >= minimumXpForTipping;
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

	private static calculatePostPermissions(dbPost: any, user: any) {
		const isOwner = dbPost.userId === user?.id;
		const isModerator = this.isModerator(user);
		const isAdmin = this.isAdmin(user);

		return {
			canEdit: isOwner || isModerator || isAdmin,
			canDelete: isOwner || isModerator || isAdmin,
			canTip: this.canUserTip(user, dbPost, dbPost.forum), // Enhanced tipping logic
			canReport: user && user.id !== dbPost.userId,
			canReply: !dbPost.thread?.isLocked || isModerator || isAdmin
		};
	}

	private static calculateForumPermissions(dbForum: any, user: any) {
		const hasAccess = this.hasForumAccess(dbForum, user);
		const isModerator = this.isModerator(user);
		const isAdmin = this.isAdmin(user);

		return {
			canRead: hasAccess,
			canPost: hasAccess && (!dbForum.minXp || user?.xp >= dbForum.minXp),
			canCreateThreads: hasAccess && (!dbForum.minXp || user?.xp >= dbForum.minXp),
			canModerate: isModerator || isAdmin
		};
	}

	private static hasForumAccess(dbForum: any, user: any): boolean {
		// VIP forums require authentication
		if (dbForum.isVip && !user) return false;

		// Check minimum XP requirement
		if (dbForum.minXp && (!user || user.xp < dbForum.minXp)) return false;

		// Check if forum is hidden
		if (dbForum.isHidden && !this.isModerator(user)) return false;

		return true;
	}

	private static hasNewPosts(dbForum: any, user: any): boolean {
		if (!user || !dbForum.lastPostAt) return false;
		const lastVisit = user.forumVisits?.[dbForum.id];
		return !lastVisit || new Date(dbForum.lastPostAt) > new Date(lastVisit);
	}

	private static getLastVisitTime(dbForum: any, user: any): Date | undefined {
		if (!user || !user.forumVisits) return undefined;
		return user.forumVisits[dbForum.id] || undefined;
	}

	private static hashIP(ip: string): string {
		if (!ip) return '';
		return createHash('sha256')
			.update(ip + process.env.IP_SALT || 'default-salt')
			.digest('hex');
	}

	private static isModerator(user: any): boolean {
		return user && (user.role === 'moderator' || user.role === 'admin' || user.role === 'owner');
	}

	private static isAdmin(user: any): boolean {
		return user && (user.role === 'admin' || user.role === 'owner');
	}
}

// Export convenience methods for backward compatibility
export const {
	toPublicThread,
	toSlimThread,
	toAuthenticatedThread,
	toModerationThread,
	toPublicPost,
	toAuthenticatedPost,
	toModerationPost
} = ForumTransformer;

// Re-export new transformers for easier imports
export { ThreadTransformer } from './thread.transformer';
export { PostTransformer } from './post.transformer';
