/**
 * Post Data Transformer - Security-First Implementation
 *
 * Transforms raw database post records into role-appropriate
 * response objects with GDPR compliance and tier-based data visibility.
 */

import type { UserId, PostId, ThreadId, DgtAmount } from '@shared/types/ids';
import type {
	PublicPost,
	AuthenticatedPost,
	ModerationPost
} from '../types';
import { createHash } from 'crypto';

export class PostTransformer {
	/**
	 * Transform post data for public consumption
	 * Strips all moderation and system data
	 */
	static toPublic(dbPost: any): PublicPost {
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

			// User data (safe fields only)
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
	static toAuthenticated(dbPost: any, requestingUser: any): AuthenticatedPost {
		const publicData = this.toPublic(dbPost);

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
	static toAdmin(dbPost: any): ModerationPost {
		const authenticatedData = this.toAuthenticated(dbPost, { role: 'admin' });

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
	 * Batch transform posts based on user permissions
	 */
	static toList(
		dbPosts: any[],
		requestingUser: any,
		view: 'public' | 'authenticated' | 'admin' = 'public'
	): (PublicPost | AuthenticatedPost | ModerationPost)[] {
		return dbPosts.map((post) => {
			switch (view) {
				case 'authenticated':
					return this.toAuthenticated(post, requestingUser);
				case 'admin':
					return this.toAdmin(post);
				default:
					return this.toPublic(post);
			}
		});
	}

	// Private utility methods

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

// Export convenience methods
export const {
	toPublic: toPublicPost,
	toAuthenticated: toAuthenticatedPost,
	toAdmin: toModerationPost
} = PostTransformer;