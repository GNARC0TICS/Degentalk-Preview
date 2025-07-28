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

// User information for thread/post authors
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
  
  // Forum-specific stats
  forumStats?: {
    level: number;
    xp: number;
    reputation: number;
    totalPosts: number;
    totalThreads: number;
    totalLikes: number;
    totalTips: number;
  };
  
  // Display helpers
  displayRole?: string; // "Admin", "Moderator", "Level 42 User"
  badgeColor?: string; // CSS color for role badge
  
  lastSeenAt?: string;
  joinedAt?: string;
}

// Featured forum information for theming and navigation
export interface ThreadFeaturedForum {
  id: ForumId;
  name: string;
  slug: string;
  colorTheme: string;
  icon?: string;
  bannerImage?: string;
  isPrimary?: boolean;
}

// Thread prefix for categorization
export interface ThreadPrefix {
  id?: string;
  name: string;
  color: string;
  backgroundColor?: string;
}

// Tag information
export interface ThreadTag {
  id: TagId;
  name: string;
  slug: string;
  color?: string;
  isOfficial?: boolean;
}

// Thread permissions (user-specific)
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
  // ========== Core Fields (always present) ==========
  id: ThreadId;
  title: string;
  slug: string;
  content?: string; // Thread body content
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  lastPostAt?: string;
  lastActivityAt?: string;
  
  // Status flags
  isSticky: boolean;
  isLocked: boolean;
  isHidden: boolean;
  isSolved: boolean;
  isPinned?: boolean;
  
  // Metrics
  viewCount: number;
  postCount: number;
  participantCount?: number;
  firstPostLikeCount: number;
  
  // Relationships
  userId: UserId;
  user: ThreadUser;
  structureId: StructureId;
  solvingPostId?: PostId;
  
  // Structure information
  structure: {
    id: StructureId;
    name: string;
    slug: string;
    type: 'forum' | 'subforum';
  };
  
  // Featured forum for theming
  featuredForum: ThreadFeaturedForum;
  
  // Tags and categorization
  tags: ThreadTag[];
  prefix?: ThreadPrefix;
  
  // ========== Display Fields (added by frontend) ==========
  relativeTime?: string; // "2 hours ago"
  excerpt?: string; // First 150 chars for previews
  isHot?: boolean; // High engagement indicator
  hotScore?: number; // Numeric score for sorting
  lastPosterUsername?: string;
  hasNewReplies?: boolean; // New replies since last visit
  
  // ========== User-Specific Fields (when authenticated) ==========
  permissions?: ThreadPermissions;
  hasBookmarked?: boolean;
  hasLiked?: boolean;
  lastReadPostId?: PostId;
  
  // ========== Engagement Metrics ==========
  totalTips?: number;
  uniqueTippers?: number;
  bookmarkCount?: number;
  shareCount?: number;
  
  // Temporary engagement object for backward compatibility
  engagement?: {
    tips?: number;
    replies?: number;
  };
  
  // ========== Admin/Moderation Fields ==========
  deletedAt?: string;
  deletedBy?: UserId;
  moderationNotes?: string;
  reportCount?: number;
  
  // ========== Legacy/Compatibility Fields ==========
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
export type ThreadListItem = Pick<Thread,
  | 'id' 
  | 'title' 
  | 'slug'
  | 'createdAt'
  | 'lastPostAt'
  | 'isSticky'
  | 'isLocked'
  | 'viewCount'
  | 'postCount'
  | 'user'
  | 'featuredForum'
  | 'prefix'
  | 'excerpt'
  | 'relativeTime'
  | 'isHot'
  | 'hasNewReplies'
>;

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
  // Location filters
  featuredForumId?: ForumId;
  forumId?: ForumId;
  structureId?: StructureId;
  
  // Content filters
  search?: string;
  tagIds?: TagId[];
  userId?: UserId;
  
  // Status filters
  isSticky?: boolean;
  isLocked?: boolean;
  isSolved?: boolean;
  isHot?: boolean;
  
  // Time filters
  timeRange?: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all';
  dateFrom?: string;
  dateTo?: string;
  
  // Sorting
  sortBy?: 'newest' | 'oldest' | 'trending' | 'mostReplies' | 'mostViews' | 'mostTips';
  
  // Pagination
  page?: number;
  limit?: number;
  cursor?: string; // For cursor-based pagination
}

/**
 * Thread API Response
 */
export interface ThreadResponse {
  thread: Thread;
  posts?: any[]; // Post type would be defined separately
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
export function isThread(value: unknown): value is Thread {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'title' in value &&
    'slug' in value &&
    'userId' in value &&
    'user' in value &&
    'featuredForum' in value &&
    typeof (value as Thread).viewCount === 'number' &&
    typeof (value as Thread).postCount === 'number'
  );
}

export function hasThreadPermissions(thread: Thread): thread is Thread & Required<Pick<Thread, 'permissions'>> {
  return thread.permissions !== undefined;
}

export function isThreadListItem(value: unknown): value is ThreadListItem {
  return isThread(value); // ThreadListItem is a subset of Thread
}