/**
 * Forum Domain Types - Secure & Performance-Optimized
 *
 * Clean, permission-aware forum types with proper separation
 * between public, authenticated, and moderation data.
 */
import type { UserId, ThreadId, PostId, ForumId, ZoneId } from '@shared/types/ids';
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
    user: {
        id: UserId;
        username: string;
        avatarUrl?: string;
        role: string;
    };
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
    tags?: string[];
}
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
    user: {
        id: UserId;
        username: string;
        role: string;
    };
    zone: {
        name: string;
        slug: string;
        colorTheme?: string;
    };
    engagement?: {
        momentum: 'bullish' | 'bearish' | 'neutral';
        totalTips?: number;
    };
}
export interface AuthenticatedThread extends PublicThread {
    excerpt?: string;
    hasBookmarked: boolean;
    permissions: {
        canEdit: boolean;
        canDelete: boolean;
        canReply: boolean;
        canMarkSolved: boolean;
        canSticky: boolean;
        canLock: boolean;
    };
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
    engagement?: {
        totalTips: number;
        uniqueTippers: number;
        momentum: 'bullish' | 'bearish' | 'neutral';
        hotScore?: number;
    };
}
export interface ModerationThread extends AuthenticatedThread {
    isHidden: boolean;
    deletedAt?: Date;
    deletedBy?: UserId;
    moderationReason?: string;
    visibilityStatus: 'public' | 'hidden' | 'quarantined';
    uuid?: string;
    pluginData?: Record<string, any>;
    rewardRules?: any;
    xpMultiplier?: number;
    featuredBy?: UserId;
    featuredExpiresAt?: Date;
    quarantineData?: any;
}
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
    user: {
        id: UserId;
        username: string;
        avatarUrl?: string;
        role: string;
    };
}
export interface AuthenticatedPost extends PublicPost {
    hasLiked: boolean;
    tipAmount?: number;
    permissions: {
        canEdit: boolean;
        canDelete: boolean;
        canTip: boolean;
        canReport: boolean;
        canReply: boolean;
    };
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
export interface ModerationPost extends AuthenticatedPost {
    isHidden: boolean;
    deletedAt?: Date;
    deletedBy?: UserId;
    moderationReason?: string;
    editorState?: any;
    pluginData?: Record<string, any>;
    ipHash?: string;
}
export interface PublicForumStructure {
    id: ForumId;
    name: string;
    slug: string;
    description?: string;
    type: 'zone' | 'category' | 'forum' | 'subforum' | string;
    position: number;
    color?: string;
    icon?: string;
    colorTheme?: string;
    isFeatured?: boolean;
    themePreset?: string;
    threadCount: number;
    postCount: number;
    lastPostAt?: Date;
    lastThread?: any;
    isVip: boolean;
    isLocked?: boolean;
    isHidden?: boolean;
    minXp: number;
    minGroupIdRequired?: number | null;
    tippingEnabled: boolean;
    xpMultiplier?: number;
    parentId?: string | null;
    parentForumSlug?: string | null;
    children?: PublicForumStructure[];
    childStructures?: PublicForumStructure[];
    pluginData?: any;
    createdAt?: Date;
    updatedAt?: Date;
    canHaveThreads?: boolean;
    isZone?: boolean;
    canonical?: boolean;
    isPrimary?: boolean;
    features?: any[];
    customComponents?: any[];
    staffOnly?: boolean;
}
export interface AuthenticatedForumStructure extends PublicForumStructure {
    permissions: {
        canRead: boolean;
        canPost: boolean;
        canCreateThreads: boolean;
        canModerate: boolean;
    };
    hasNewPosts?: boolean;
    lastVisitAt?: Date;
}
export interface ModerationForumStructure extends AuthenticatedForumStructure {
    isHidden: boolean;
    minGroupIdRequired?: number;
    pluginData?: Record<string, any>;
    rewardRules?: any;
    moderationSettings?: any;
}
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
export interface ForumPaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}
export declare const isPublicThreadSafe: (data: any) => data is PublicThread;
export declare const isForumModerator: (user: any, forumId: string) => boolean;
