import type { PostId, ThreadId, UserId } from './ids.js';

/**
 * Post Type
 * Unified post representation across the platform
 * 
 * This matches the Post interface from core/forum.types.ts but with
 * user population for display purposes.
 */

// Post author information
export interface PostAuthor {
  id: UserId;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  activeAvatarUrl?: string;
  role: 'user' | 'moderator' | 'admin' | 'owner';
  isOnline?: boolean;
  isVerified?: boolean;
  isBanned?: boolean;
  
  // Convenience properties
  isAdmin?: boolean;
  isModerator?: boolean;
  signature?: string;
  
  // Forum-specific stats
  forumStats?: {
    level: number;
    xp: number;
    reputation: number;
    totalPosts: number;
    totalThreads: number;
  };
  
  lastSeenAt?: string;
  joinedAt?: string;
}

/**
 * Main Post Type
 * 
 * This is the display-ready version with populated user data.
 * For the base database type, see core/forum.types.ts
 */
export interface Post {
  // Core fields
  id: PostId;
  content: string;
  threadId: ThreadId;
  userId: UserId;
  
  // Relations
  user: PostAuthor;
  
  // Reply chain
  replyToPostId?: PostId;
  replyToPost?: Pick<Post, 'id' | 'content' | 'user'>;
  
  // Status
  isHidden: boolean;
  isEdited: boolean;
  isDeleted?: boolean;
  
  // Metrics
  editCount: number;
  likeCount: number;
  tipAmount?: number;
  postNumber?: number; // Position in thread
  
  // User-specific fields
  hasLiked?: boolean;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  lastEditedAt?: string;
  
  // Thread context (optional)
  thread?: {
    id: ThreadId;
    title: string;
    slug: string;
  };
  
  // Permissions (user-specific)
  permissions?: {
    canEdit: boolean;
    canDelete: boolean;
    canReport: boolean;
    canTip: boolean;
    canMarkSolution: boolean;
  };
}

/**
 * Post creation input
 */
export interface CreatePostInput {
  threadId: ThreadId;
  content: string;
  replyToPostId?: PostId;
}

/**
 * Post update input
 */
export interface UpdatePostInput {
  content: string;
  editReason?: string;
}

/**
 * Type guards
 */
export function isPost(value: unknown): value is Post {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'content' in value &&
    'threadId' in value &&
    'userId' in value &&
    'user' in value &&
    typeof (value as Post).isHidden === 'boolean' &&
    typeof (value as Post).likeCount === 'number'
  );
}