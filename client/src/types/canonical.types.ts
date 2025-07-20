import type {
	ForumId,
	ParentZoneId,
	ZoneId,
	UserId,
	ThreadId,
	StructureId,
	PostId,
	TagId
} from '@shared/types/ids';
import type { BasicRole } from '@shared/types/index';

/**
 * Canonical Forum Types
 *
 * ARCHITECTURAL ALIGNMENT: Single source of truth for all forum entities
 * Eliminates duplicate type definitions and establishes consistency across:
 * - Backend API responses
 * - Frontend component props
 * - Context providers
 * - Query hooks
 */

// =============================================================================
// CORE CANONICAL TYPES
// =============================================================================

/**
 * Canonical Zone - Top-level forum organization
 * Replaces: ZoneWithForums, MergedZone, etc.
 */
export interface CanonicalZone {
	id: ZoneId;
	name: string;
	slug: string;
	description?: string;
	isPrimary: boolean; // Primary zones show in carousel, general zones in list
	sortOrder: number;
	isVisible: boolean;
	colorTheme: string;
	bannerImage?: string;
	icon?: string;

	// Forum relationships
	forums: CanonicalForum[];

	// Computed stats
	stats: {
		totalForums: number;
		totalThreads: number;
		totalPosts: number;
		lastActivity?: {
			threadTitle: string;
			threadSlug: string;
			userName: string;
			timestamp: string;
		};
	};

	// Metadata
	createdAt: string;
	updatedAt: string;
}

/**
 * Canonical Forum - Mid-level forum organization
 * Replaces: ForumCategoryWithStats, MergedForum, etc.
 */
export interface CanonicalForum {
	id: ForumId;
	name: string;
	slug: string;
	description?: string;
	parentZoneId: ParentZoneId;
	parentZone?: Pick<CanonicalZone, 'id' | 'name' | 'slug' | 'colorTheme'>;
	sortOrder: number;
	isVisible: boolean;

	// Forum-specific settings
	colorTheme?: string; // Inherits from zone if not set
	icon?: string;
	rules?: {
		requiresAuth: boolean;
		minimumLevel: number;
		allowThreadCreation: boolean;
		allowPostReplies: boolean;
		tippingEnabled: boolean;
		xpMultiplier: number;
	};

	// Subforum relationships
	subforums: CanonicalSubforum[];

	// Thread relationships
	threads?: CanonicalThread[];

	// Computed stats
	stats: {
		totalSubforums: number;
		totalThreads: number;
		totalPosts: number;
		lastActivity?: {
			threadTitle: string;
			threadSlug: string;
			userName: string;
			timestamp: string;
		};
	};

	// Metadata
	createdAt: string;
	updatedAt: string;
}

/**
 * Canonical Subforum - Lowest-level forum organization
 * Replaces: various subforum representations
 */
export interface CanonicalSubforum {
	id: ForumId;
	name: string;
	slug: string;
	description?: string;
	parentForumId: ForumId;
	parentForum?: Pick<CanonicalForum, 'id' | 'name' | 'slug'>;
	sortOrder: number;
	isVisible: boolean;

	// Inherited settings (from parent forum/zone)
	colorTheme?: string;
	icon?: string;
	rules?: CanonicalForum['rules'];

	// Thread relationships
	threads?: CanonicalThread[];

	// Computed stats
	stats: {
		totalThreads: number;
		totalPosts: number;
		lastActivity?: {
			threadTitle: string;
			threadSlug: string;
			userName: string;
			timestamp: string;
		};
	};

	// Metadata
	createdAt: string;
	updatedAt: string;
}

/**
 * Canonical Thread - Forum discussion container
 * Replaces: ThreadWithUser, ThreadWithPostsAndUser, etc.
 */
export interface CanonicalThread {
	id: ThreadId;
	title: string;
	slug: string;
	content?: string; // First post content (optional for list views)
	structureId: StructureId;

	// Thread classification
	isSticky: boolean;
	isLocked: boolean;
	isHidden: boolean;
	isSolved: boolean;
	isPinned?: boolean; // Additional pin status
	solvingPostId?: PostId;
	participantCount?: number; // Number of unique participants

	// Content stats
	viewCount: number;
	postCount: number;
	firstPostLikeCount: number;

	// Timestamps
	createdAt: string;
	updatedAt: string;
	lastPostAt?: string;
	lastActivityAt?: string;

	// Author relationship
	userId: UserId;
	user: CanonicalUser;

	// Structure relationships
	structure: {
		id: StructureId;
		name: string;
		slug: string;
		type: 'forum' | 'subforum';
	};
	zone: Pick<CanonicalZone, 'id' | 'name' | 'slug' | 'colorTheme'>;

	// Post relationships (optional for different views)
	posts?: CanonicalPost[];

	// Tag relationships
	tags: CanonicalTag[];

	// User permissions for this thread
	permissions: {
		canEdit: boolean;
		canDelete: boolean;
		canReply: boolean;
		canMarkSolved: boolean;
		canModerate: boolean;
	};
}

/**
 * Canonical Post - Individual forum response
 * Replaces: PostWithUser, various post representations
 */
export interface CanonicalPost {
	id: PostId;
	content: string;
	threadId: ThreadId;
	userId: UserId;
	replyToPostId?: PostId;

	// Post status
	isHidden: boolean;
	isEdited: boolean;
	editCount: number;

	// Engagement stats
	likeCount: number;
	hasLiked?: boolean; // For current user
	tipAmount?: number;

	// Timestamps
	createdAt: string;
	updatedAt: string;
	lastEditedAt?: string;

	// Relationships
	user: CanonicalUser;
	thread?: Pick<CanonicalThread, 'id' | 'title' | 'slug'>;
	replyToPost?: Pick<CanonicalPost, 'id' | 'content' | 'user'>;

	// User permissions for this post
	permissions: {
		canEdit: boolean;
		canDelete: boolean;
		canReport: boolean;
		canTip: boolean;
		canMarkSolution: boolean;
	};
}

/**
 * Canonical User - Forum participant
 * Unified user representation across all forum contexts
 */
export interface CanonicalUser {
	id: UserId;
	username: string;
	displayName?: string;
	avatarUrl?: string;
	activeAvatarUrl?: string;
	role: BasicRole;

	// Forum-specific data
	forumStats: {
		level: number;
		xp: number;
		reputation: number;
		totalPosts: number;
		totalThreads: number;
		totalLikes: number;
		totalTips: number;
	};

	// Status indicators
	isOnline: boolean;
	lastSeenAt?: string;
	joinedAt: string;

	// Computed role helpers
	isAdmin: boolean;
	isModerator: boolean;
	isVerified?: boolean;
	isBanned?: boolean;
	
	// Convenience properties for component compatibility
	reputation?: number; // Alias for forumStats.reputation
}

/**
 * Canonical Tag - Thread categorization
 */
export interface CanonicalTag {
	id: TagId;
	name: string;
	slug: string;
	description?: string;
	color?: string;
	useCount: number;
	isOfficial: boolean;
	createdAt: string;
}

// =============================================================================
// API RESPONSE WRAPPERS
// =============================================================================

/**
 * Standard API Response Wrapper
 * Ensures consistent response format across all endpoints
 */
export interface StandardApiResponse<T> {
	success: boolean;
	data: T;
	meta?: {
		pagination?: {
			page: number;
			limit: number;
			total: number;
			totalPages: number;
			hasNext: boolean;
			hasPrev: boolean;
		};
		timestamp: string;
		requestId?: string;
	};
	error?: {
		code: string;
		message: string;
		details?: Record<string, any>;
	};
}

/**
 * Paginated Response for list endpoints
 */
export interface PaginatedResponse<T> {
	items: T[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
		hasNext: boolean;
		hasPrev: boolean;
	};
}

// =============================================================================
// QUERY & MUTATION PARAMETERS
// =============================================================================

/**
 * Thread Search Parameters
 * Unified parameters for all thread listing/searching
 */
export interface CanonicalThreadSearchParams {
	// Structure filtering
	zoneId?: ZoneId;
	forumId?: ForumId;
	subforumId?: ForumId;

	// Content filtering
	search?: string;
	tagIds?: TagId[];
	userId?: UserId;

	// Status filtering
	isSticky?: boolean;
	isLocked?: boolean;
	isSolved?: boolean;

	// Sorting
	sortBy?: 'newest' | 'oldest' | 'trending' | 'mostReplies' | 'mostViews';

	// Pagination
	page?: number;
	limit?: number;
}

/**
 * Thread Creation Parameters
 */
export interface CanonicalThreadCreateParams {
	title: string;
	content: string;
	structureId: StructureId;
	tagIds?: TagId[];
	isSticky?: boolean;
	isLocked?: boolean;
}

/**
 * Post Creation Parameters
 */
export interface CanonicalPostCreateParams {
	threadId: ThreadId;
	content: string;
	replyToPostId?: PostId;
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

/**
 * Forum Structure Hierarchy
 * For components that need to understand the complete structure
 */
export interface ForumStructureContext {
	zones: CanonicalZone[];
	forumsById: Record<StructureId, CanonicalForum>;
	subforumsById: Record<StructureId, CanonicalSubforum>;

	// Utility functions
	getZoneBySlug: (slug: string) => CanonicalZone | undefined;
	getForumBySlug: (slug: string) => CanonicalForum | undefined;
	getSubforumBySlug: (slug: string) => CanonicalSubforum | undefined;
	getStructureById: (id: StructureId) => CanonicalForum | CanonicalSubforum | undefined;
	getThreadContext: (structureId: StructureId) => {
		zone?: CanonicalZone;
		forum?: CanonicalForum;
		subforum?: CanonicalSubforum;
	};
}

/**
 * Navigation Context
 * For breadcrumbs and navigation components
 */
export interface NavigationBreadcrumb {
	label: string;
	href: string;
	icon?: React.ReactNode;
	isActive?: boolean;
}

/**
 * Theme Context
 * For applying zone/forum-specific styling
 */
export interface ForumThemeContext {
	colorTheme: string;
	bannerImage?: string;
	icon?: string;
	customCss?: string;
}

// =============================================================================
// LEGACY TYPE MAPPING
// =============================================================================

/**
 * @deprecated Use CanonicalZone instead
 */
export type MergedZone = CanonicalZone;

/**
 * @deprecated Use CanonicalForum instead
 */
export type MergedForum = CanonicalForum;

/**
 * @deprecated Use CanonicalThread instead
 */
export type ThreadWithUser = CanonicalThread;

/**
 * @deprecated Use CanonicalThread instead
 */
export type ThreadWithUserAndCategory = CanonicalThread;

/**
 * @deprecated Use CanonicalPost instead
 */
export type PostWithUser = CanonicalPost;
