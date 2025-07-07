import type { ThreadId, PostId, ForumId, UserId, PrefixId } from '../ids';
import type { ThreadStatus, PostStatus } from '@db/schema/core/enums';

/**
 * Forum Domain Types
 * 
 * Types for forums, threads, posts, and related forum functionality.
 * Ensures type safety across all forum operations.
 */

export interface Forum {
  id: ForumId;
  name: string;
  slug: string;
  description: string;
  parentId: ForumId | null;
  displayOrder: number;
  isActive: boolean;
  isPrivate: boolean;
  requiredLevel: number;
  requiredRole: string | null;
  settings: ForumSettings;
  stats: ForumStats;
  createdAt: Date;
  updatedAt: Date;
}

export interface ForumSettings {
  allowThreads: boolean;
  allowReplies: boolean;
  allowVoting: boolean;
  allowTags: boolean;
  moderationLevel: 'none' | 'low' | 'medium' | 'high';
  prefixes: ForumPrefix[];
  rules: ForumRule[];
  xpMultiplier: number;
  dgtMultiplier: number;
}

export interface ForumPrefix {
  id: PrefixId;
  text: string;
  color: string;
  backgroundColor: string;
  requiredLevel: number;
  requiredRole: string | null;
  displayOrder: number;
}

export interface ForumRule {
  id: string;
  title: string;
  description: string;
  displayOrder: number;
  severity: 'info' | 'warning' | 'critical';
}

export interface ForumStats {
  threadCount: number;
  postCount: number;
  uniquePosters: number;
  lastPostAt: Date | null;
  lastThreadAt: Date | null;
  todayPosts: number;
  todayThreads: number;
}

export interface Thread {
  id: ThreadId;
  forumId: ForumId;
  authorId: UserId;
  title: string;
  content: string;
  status: ThreadStatus;
  isPinned: boolean;
  isLocked: boolean;
  isHot: boolean;
  viewCount: number;
  replyCount: number;
  lastReplyAt: Date | null;
  lastReplyBy: UserId | null;
  tags: string[];
  prefix: ForumPrefix | null;
  metadata: ThreadMetadata;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface ThreadMetadata {
  edited: boolean;
  editedAt: Date | null;
  editedBy: UserId | null;
  editReason: string | null;
  upvotes: number;
  downvotes: number;
  score: number;
  mentionedUsers: UserId[];
}

export interface Post {
  id: PostId;
  threadId: ThreadId;
  authorId: UserId;
  parentId: PostId | null;
  content: string;
  status: PostStatus;
  isDeleted: boolean;
  metadata: PostMetadata;
  reactions: PostReaction[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface PostMetadata {
  edited: boolean;
  editedAt: Date | null;
  editedBy: UserId | null;
  editReason: string | null;
  upvotes: number;
  downvotes: number;
  tipCount: number;
  tipTotal: number;
  mentionedUsers: UserId[];
  quotedPost: PostId | null;
}

export interface PostReaction {
  userId: UserId;
  emoji: string;
  createdAt: Date;
}

export interface ThreadView {
  threadId: ThreadId;
  userId: UserId;
  viewedAt: Date;
  lastReadPostId: PostId | null;
}

export interface ThreadSubscription {
  threadId: ThreadId;
  userId: UserId;
  notifyOnReply: boolean;
  notifyOnMention: boolean;
  subscribedAt: Date;
}

// Request/Response types
export interface CreateThreadRequest {
  forumId: ForumId;
  title: string;
  content: string;
  tags?: string[];
  prefixId?: PrefixId;
  isDraft?: boolean;
}

export interface UpdateThreadRequest {
  title?: string;
  content?: string;
  tags?: string[];
  prefixId?: PrefixId | null;
  status?: ThreadStatus;
}

export interface CreatePostRequest {
  threadId: ThreadId;
  content: string;
  parentId?: PostId;
  quotedPostId?: PostId;
  isDraft?: boolean;
}

export interface UpdatePostRequest {
  content: string;
  editReason?: string;
}

export interface ThreadSearchParams {
  query?: string;
  forumId?: ForumId;
  authorId?: UserId;
  tags?: string[];
  prefixId?: PrefixId;
  status?: ThreadStatus;
  isPinned?: boolean;
  isHot?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
  sortBy?: 'createdAt' | 'lastReplyAt' | 'viewCount' | 'replyCount' | 'score';
  sortOrder?: 'asc' | 'desc';
}

export interface PostSearchParams {
  query?: string;
  threadId?: ThreadId;
  authorId?: UserId;
  parentId?: PostId;
  hasReactions?: boolean;
  hasTips?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
  sortBy?: 'createdAt' | 'score' | 'tipTotal';
  sortOrder?: 'asc' | 'desc';
}

// Type guards
export function isForum(value: unknown): value is Forum {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'name' in value &&
    'slug' in value &&
    'settings' in value &&
    'stats' in value &&
    typeof (value as Forum).displayOrder === 'number' &&
    typeof (value as Forum).isActive === 'boolean'
  );
}

export function isThread(value: unknown): value is Thread {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'forumId' in value &&
    'authorId' in value &&
    'title' in value &&
    'content' in value &&
    'status' in value &&
    'metadata' in value &&
    typeof (value as Thread).viewCount === 'number' &&
    typeof (value as Thread).replyCount === 'number'
  );
}

export function isPost(value: unknown): value is Post {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'threadId' in value &&
    'authorId' in value &&
    'content' in value &&
    'status' in value &&
    'metadata' in value &&
    typeof (value as Post).isDeleted === 'boolean' &&
    Array.isArray((value as Post).reactions)
  );
}

export function isThreadSubscription(value: unknown): value is ThreadSubscription {
  return (
    typeof value === 'object' &&
    value !== null &&
    'threadId' in value &&
    'userId' in value &&
    'subscribedAt' in value &&
    typeof (value as ThreadSubscription).notifyOnReply === 'boolean' &&
    typeof (value as ThreadSubscription).notifyOnMention === 'boolean'
  );
}

export function isThreadView(value: unknown): value is ThreadView {
  return (
    typeof value === 'object' &&
    value !== null &&
    'threadId' in value &&
    'userId' in value &&
    'viewedAt' in value
  );
}

export function isPostReaction(value: unknown): value is PostReaction {
  return (
    typeof value === 'object' &&
    value !== null &&
    'userId' in value &&
    'emoji' in value &&
    'createdAt' in value &&
    typeof (value as PostReaction).emoji === 'string'
  );
}

// Utility types
export type ThreadWithAuthor = Thread & { author: { id: UserId; username: string; level: number } };
export type PostWithAuthor = Post & { author: { id: UserId; username: string; level: number } };
export type ThreadSummary = Pick<Thread, 'id' | 'title' | 'replyCount' | 'viewCount' | 'lastReplyAt'>;
export type ForumHierarchy = Forum & { children: ForumHierarchy[] };
export type ThreadPreview = Pick<Thread, 'id' | 'title' | 'authorId' | 'createdAt'> & {
  preview: string;
  author: { username: string; level: number };
};