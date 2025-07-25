import type { ForumId, ParentFeaturedForumId, FeaturedForumId, UserId, ThreadId, StructureId, PostId, TagId } from '@shared/types/ids';
import type { BasicRole } from '@shared/types/index';
import type { Thread } from '@shared/types/thread.types';
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
/**
 * Canonical Featured Forum - Top-level forum organization
 * Replaces: FeaturedForumWithForums, MergedFeaturedForum, etc.
 */
export interface CanonicalFeaturedForum {
    id: FeaturedForumId;
    name: string;
    slug: string;
    description?: string;
    isFeatured: boolean;
    sortOrder: number;
    isVisible: boolean;
    colorTheme: string;
    bannerImage?: string;
    icon?: string;
    forums: CanonicalForum[];
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
    parentForumId: ParentFeaturedForumId;
    parentForum?: Pick<CanonicalFeaturedForum, 'id' | 'name' | 'slug' | 'colorTheme'>;
    sortOrder: number;
    isVisible: boolean;
    colorTheme?: string;
    icon?: string;
    rules?: {
        requiresAuth: boolean;
        minimumLevel: number;
        allowThreadCreation: boolean;
        allowPostReplies: boolean;
        tippingEnabled: boolean;
        xpMultiplier: number;
    };
    subforums: CanonicalSubforum[];
    threads?: Thread[];
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
    colorTheme?: string;
    icon?: string;
    rules?: CanonicalForum['rules'];
    threads?: Thread[];
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
    createdAt: string;
    updatedAt: string;
}
// Thread type moved to @shared/types/thread.types.ts
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
    isHidden: boolean;
    isEdited: boolean;
    editCount: number;
    likeCount: number;
    hasLiked?: boolean;
    tipAmount?: number;
    createdAt: string;
    updatedAt: string;
    lastEditedAt?: string;
    user: CanonicalUser;
    thread?: Pick<Thread, 'id' | 'title' | 'slug'>;
    replyToPost?: Pick<CanonicalPost, 'id' | 'content' | 'user'>;
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
    forumStats: {
        level: number;
        xp: number;
        reputation: number;
        totalPosts: number;
        totalThreads: number;
        totalLikes: number;
        totalTips: number;
    };
    isOnline: boolean;
    lastSeenAt?: string;
    joinedAt: string;
    isAdmin: boolean;
    isModerator: boolean;
    isVerified?: boolean;
    isBanned?: boolean;
    reputation?: number;
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
// Thread search params moved to @shared/types/thread.types.ts
// Thread creation params moved to @shared/types/thread.types.ts
/**
 * Post Creation Parameters
 */
export interface CanonicalPostCreateParams {
    threadId: ThreadId;
    content: string;
    replyToPostId?: PostId;
}
/**
 * Forum Structure Hierarchy
 * For components that need to understand the complete structure
 */
export interface ForumStructureContext {
    featuredForums: CanonicalFeaturedForum[];
    forumsById: Record<StructureId, CanonicalForum>;
    subforumsById: Record<StructureId, CanonicalSubforum>;
    getFeaturedForumBySlug: (slug: string) => CanonicalFeaturedForum | undefined;
    getForumBySlug: (slug: string) => CanonicalForum | undefined;
    getSubforumBySlug: (slug: string) => CanonicalSubforum | undefined;
    getStructureById: (id: StructureId) => CanonicalForum | CanonicalSubforum | undefined;
    getThreadContext: (structureId: StructureId) => {
        featuredForum?: CanonicalFeaturedForum;
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
 * For applying featuredForum/forum-specific styling
 */
export interface ForumThemeContext {
    colorTheme: string;
    bannerImage?: string;
    icon?: string;
    customCss?: string;
}
// FeaturedForum/Forum types remain as-is for now - will consolidate separately
// Legacy thread type aliases removed - use Thread from @shared/types/thread.types.ts
/**
 * @deprecated Use CanonicalPost instead
 */
export type PostWithUser = CanonicalPost;
