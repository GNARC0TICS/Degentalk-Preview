import type { ThreadId, PostId, ForumId, UserId, StructureId, TagId } from './ids.js';
import type { BasicRole } from './index.js';
/**
 * Unified Thread Type
 *
 * This is the single source of truth for thread data across the platform.
 * Different views (public, authenticated, admin) show different subsets of these fields.
 *
 * Pre-launch consolidation: Replaces CanonicalThread, ThreadDisplay, and all other thread types.
 */
export interface ThreadUser {
    id: UserId;
    username: string;
    displayName?: string;
    avatarUrl?: string;
    activeAvatarUrl?: string;
    role: BasicRole;
    isOnline?: boolean;
    isVerified?: boolean;
    isBanned?: boolean;
    forumStats?: {
        level: number;
        xp: number;
        reputation: number;
        totalPosts: number;
        totalThreads: number;
        totalLikes: number;
        totalTips: number;
    };
    displayRole?: string;
    badgeColor?: string;
    lastSeenAt?: string;
    joinedAt?: string;
}
export interface ThreadFeaturedForum {
    id: ForumId;
    name: string;
    slug: string;
    colorTheme: string;
    icon?: string;
    bannerImage?: string;
    isPrimary?: boolean;
}
export interface ThreadPrefix {
    id?: string;
    name: string;
    color: string;
    backgroundColor?: string;
}
export interface ThreadTag {
    id: TagId;
    name: string;
    slug: string;
    color?: string;
    isOfficial?: boolean;
}
export interface ThreadPermissions {
    canEdit: boolean;
    canDelete: boolean;
    canReply: boolean;
    canMarkSolved: boolean;
    canModerate: boolean;
    canPin?: boolean;
    canLock?: boolean;
}
/**
 * Main Thread Type
 *
 * Fields are organized by usage context:
 * - Core fields: Always present
 * - Display fields: Added by frontend for UI
 * - User-specific fields: Added when user is authenticated
 * - Admin fields: Added for moderators/admins
 */
export interface Thread {
    id: ThreadId;
    title: string;
    slug: string;
    content?: string;
    createdAt: string;
    updatedAt: string;
    lastPostAt?: string;
    lastActivityAt?: string;
    isSticky: boolean;
    isLocked: boolean;
    isHidden: boolean;
    isSolved: boolean;
    isPinned?: boolean;
    viewCount: number;
    postCount: number;
    participantCount?: number;
    firstPostLikeCount: number;
    userId: UserId;
    user: ThreadUser;
    structureId: StructureId;
    solvingPostId?: PostId;
    structure: {
        id: StructureId;
        name: string;
        slug: string;
        type: 'forum' | 'subforum';
    };
    featuredForum: ThreadFeaturedForum;
    tags: ThreadTag[];
    prefix?: ThreadPrefix;
    relativeTime?: string;
    excerpt?: string;
    isHot?: boolean;
    hotScore?: number;
    lastPosterUsername?: string;
    hasNewReplies?: boolean;
    permissions?: ThreadPermissions;
    hasBookmarked?: boolean;
    hasLiked?: boolean;
    lastReadPostId?: PostId;
    totalTips?: number;
    uniqueTippers?: number;
    bookmarkCount?: number;
    shareCount?: number;
    engagement?: {
        tips?: number;
        replies?: number;
    };
    deletedAt?: string;
    deletedBy?: UserId;
    moderationNotes?: string;
    reportCount?: number;
    /** @deprecated Use featuredForum instead */
    category?: {
        id: string;
        name: string;
        slug: string;
    };
}
/**
 * Thread with Mention Context
 * Used when threads are displayed in mention notifications/feeds
 */
export interface MentionThread extends Thread {
    isRead?: boolean;
    metadata?: {
        mentionId?: number;
        mentionType?: 'thread' | 'post' | 'shoutbox' | 'whisper';
        originalThreadId?: string;
        originalPostId?: string;
    };
}
/**
 * Thread List Item
 * Lightweight version for lists and feeds
 */
export type ThreadListItem = Pick<Thread, 'id' | 'title' | 'slug' | 'createdAt' | 'lastPostAt' | 'isSticky' | 'isLocked' | 'isSolved' | 'isPinned' | 'viewCount' | 'postCount' | 'user' | 'featuredForum' | 'prefix' | 'excerpt' | 'relativeTime' | 'isHot' | 'hasNewReplies' | 'structure'>;
/**
 * Thread Creation Input
 */
export interface CreateThreadInput {
    title: string;
    content: string;
    structureId: StructureId;
    tagIds?: TagId[];
    prefixId?: string;
    isSticky?: boolean;
    isLocked?: boolean;
}
/**
 * Thread Update Input
 */
export interface UpdateThreadInput {
    title?: string;
    content?: string;
    tagIds?: TagId[];
    prefixId?: string;
    isSticky?: boolean;
    isLocked?: boolean;
    isSolved?: boolean;
    solvingPostId?: PostId;
}
/**
 * Thread Search/Filter Parameters
 */
export interface ThreadSearchParams {
    featuredForumId?: ForumId;
    forumId?: ForumId;
    structureId?: StructureId;
    search?: string;
    tagIds?: TagId[];
    userId?: UserId;
    isSticky?: boolean;
    isLocked?: boolean;
    isSolved?: boolean;
    isHot?: boolean;
    timeRange?: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all';
    dateFrom?: string;
    dateTo?: string;
    sortBy?: 'newest' | 'oldest' | 'trending' | 'mostReplies' | 'mostViews' | 'mostTips';
    page?: number;
    limit?: number;
    cursor?: string;
}
/**
 * Thread API Response
 */
export interface ThreadResponse {
    thread: Thread;
    posts?: any[];
    relatedThreads?: ThreadListItem[];
}
/**
 * Threads List API Response
 */
export interface ThreadsListResponse {
    threads: Thread[] | ThreadListItem[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
        cursor?: string;
    };
}
/**
 * Type Guards
 */
export declare function isThread(value: unknown): value is Thread;
export declare function hasThreadPermissions(thread: Thread): thread is Thread & Required<Pick<Thread, 'permissions'>>;
export declare function isThreadListItem(value: unknown): value is ThreadListItem;
