/**
 * Forum Domain Types - Secure & Performance-Optimized
 *
 * Clean, permission-aware forum types with proper separation
 * between public, authenticated, and moderation data.
 */

import type { UserId, ThreadId, PostId, ForumId, ZoneId, TagId } from '@shared/types/ids';

// Base thread data safe for public consumption
export interface PublicThread {
	id: ThreadId;
	title: string;
	slug: string;
	createdAt: Date;
	updatedAt: Date;
	lastPostAt: Date;
	viewCount: number;
	postCount: number;
	isSticky: boolean;
	isLocked: boolean;
	isSolved: boolean;

	// User data (via UserTransformer)
	user: {
		id: UserId;
		username: string;
		avatarUrl?: string;
		role: string;
	};

	// Zone/Category data
	zone: {
		id: ZoneId;
		name: string;
		slug: string;
		colorTheme?: string;
	};

	category?: {
		id: string;
		name: string;
		slug: string;
	};

	// Tags (public only)
	tags?: string[];
}

// Lightweight thread data for list views and cards
export interface SlimThread {
	id: ThreadId;
	title: string;
	slug: string;
	createdAt: Date;
	viewCount: number;
	postCount: number;
	isSticky: boolean;
	isLocked: boolean;
	isSolved: boolean;

	// Minimal user data
	user: {
		id: UserId;
		username: string;
		role: string;
	};

	// Minimal zone data
	zone: {
		name: string;
		slug: string;
		colorTheme?: string;
	};

	// Optional engagement for homepage
	engagement?: {
		momentum: 'bullish' | 'bearish' | 'neutral';
		totalTips?: number;
	};
}

// Full thread data for authenticated users
export interface AuthenticatedThread extends PublicThread {
	excerpt?: string;
	hasBookmarked: boolean;

	// User permissions
	permissions: {
		canEdit: boolean;
		canDelete: boolean;
		canReply: boolean;
		canMarkSolved: boolean;
		canSticky: boolean;
		canLock: boolean;
	};

	// Enhanced user data with forum stats
	user: {
		id: UserId;
		username: string;
		avatarUrl?: string;
		role: string;
		forumStats?: {
			level: number;
			xp: number;
			reputation: number;
			totalPosts: number;
		};
	};

	// Engagement metrics
	engagement?: {
		totalTips: number;
		uniqueTippers: number;
		momentum: 'bullish' | 'bearish' | 'neutral';
		hotScore?: number;
	};
}

// Moderation view with all data
export interface ModerationThread extends AuthenticatedThread {
	// Moderation fields
	isHidden: boolean;
	deletedAt?: Date;
	deletedBy?: UserId;
	moderationReason?: string;
	visibilityStatus: 'public' | 'hidden' | 'quarantined';

	// System fields
	uuid?: string;
	pluginData?: Record<string, any>;
	rewardRules?: any;
	xpMultiplier?: number;

	// Advanced stats
	featuredBy?: UserId;
	featuredExpiresAt?: Date;
	quarantineData?: any;
}

// Post types following same pattern
export interface PublicPost {
	id: PostId;
	content: string;
	createdAt: Date;
	updatedAt: Date;
	likeCount: number;
	isEdited: boolean;
	editedAt?: Date;
	threadId: ThreadId;
	replyToPostId?: PostId;

	// User data (transformed)
	user: {
		id: UserId;
		username: string;
		avatarUrl?: string;
		role: string;
	};
}

// Full post for authenticated users
export interface AuthenticatedPost extends PublicPost {
	hasLiked: boolean;
	tipAmount?: number;

	// Permissions
	permissions: {
		canEdit: boolean;
		canDelete: boolean;
		canTip: boolean;
		canReport: boolean;
		canReply: boolean;
	};

	// Enhanced user data
	user: {
		id: UserId;
		username: string;
		avatarUrl?: string;
		role: string;
		forumStats?: {
			level: number;
			xp: number;
			reputation: number;
		};
	};
}

// Moderation post view
export interface ModerationPost extends AuthenticatedPost {
	isHidden: boolean;
	deletedAt?: Date;
	deletedBy?: UserId;
	moderationReason?: string;
	editorState?: any;
	pluginData?: Record<string, any>;
	ipHash?: string; // Anonymized IP
}

// Forum structure types
export interface PublicForumStructure {
	id: ForumId;
	name: string;
	slug: string;
	description?: string;
	type: 'zone' | 'forum' | 'subforum';
	position: number;
	color?: string;
	icon?: string;
	colorTheme?: string;
	threadCount: number;
	postCount: number;
	lastPostAt?: Date;
	isVip: boolean;
	minXp: number;
	tippingEnabled: boolean;

	// Child forums/zones
	children?: PublicForumStructure[];
}

// Authenticated forum structure with permissions
export interface AuthenticatedForumStructure extends PublicForumStructure {
	permissions: {
		canRead: boolean;
		canPost: boolean;
		canCreateThreads: boolean;
		canModerate: boolean;
	};

	// User-specific data
	hasNewPosts?: boolean;
	lastVisitAt?: Date;
}

// Moderation forum structure
export interface ModerationForumStructure extends AuthenticatedForumStructure {
	isHidden: boolean;
	minGroupIdRequired?: number;
	pluginData?: Record<string, any>;
	rewardRules?: any;
	moderationSettings?: any;
}

// Engagement and performance types
export interface ThreadEngagement {
	totalTips: number;
	uniqueTippers: number;
	momentum: 'bullish' | 'bearish' | 'neutral';
	hotScore: number;
	reactionCounts?: Record<string, number>;
}

export interface UserForumStats {
	level: number;
	xp: number;
	reputation: number;
	totalPosts: number;
	totalThreads: number;
	totalLikes: number;
	totalTips: number;
	joinedAt: Date;
}

// Request/Response types
export interface CreateThreadRequest {
	title: string;
	content: string;
	forumId: ForumId;
	tags?: string[];
	isSticky?: boolean;
	rewardRules?: any;
}

export interface UpdateThreadRequest {
	title?: string;
	content?: string;
	tags?: string[];
	isSticky?: boolean;
	isLocked?: boolean;
	isSolved?: boolean;
}

export interface CreatePostRequest {
	threadId: ThreadId;
	content: string;
	replyToPostId?: PostId;
}

export interface UpdatePostRequest {
	content: string;
}

// Search and filtering types
export interface ThreadSearchParams {
	q?: string;
	forumId?: ForumId;
	userId?: UserId;
	tags?: string[];
	sortBy?: 'newest' | 'oldest' | 'popular' | 'hot' | 'solved';
	isSticky?: boolean;
	isLocked?: boolean;
	isSolved?: boolean;
	page?: number;
	limit?: number;
	view?: 'slim' | 'full';
}

export interface PostSearchParams {
	threadId?: ThreadId;
	userId?: UserId;
	page?: number;
	limit?: number;
	sortBy?: 'newest' | 'oldest' | 'likes';
}

// Response metadata
export interface ForumPaginationMeta {
	page: number;
	limit: number;
	total: number;
	totalPages: number;
	hasNext: boolean;
	hasPrev: boolean;
}

// Type guards
export const isPublicThreadSafe = (data: any): data is PublicThread => {
	return (
		data &&
		typeof data.id === 'string' &&
		typeof data.title === 'string' &&
		!data.moderationReason && // No moderation data
		!data.pluginData && // No system data
		!data.uuid
	); // No internal IDs
};

export const isForumModerator = (user: any, forumId: string): boolean => {
	return (
		user &&
		(user.role === 'admin' ||
			user.role === 'owner' ||
			(user.permissions && user.permissions.includes(`forum.moderate.${forumId}`)))
	);
};
