/**
 * Forum Types
 * 
 * This file contains TypeScript type definitions for the forum system components.
 * These types are used on the client side to ensure proper typing when interacting
 * with forum-related data.
 */

// TODO: @syncSchema Update based on recent changes in schema.ts: ForumCategory now has 'color' and 'icon' fields.

// Basic forum category
export interface ForumCategory {
  id: number;
  name: string;
  description: string | null;
  slug: string;
  position: number;
  parentId: number | null;
  isVip: boolean;
  isLocked: boolean;
  minXp: number | null;
  createdAt: string;
  updatedAt: string;
}

// Forum category with stats and last activity information
export interface ForumCategoryWithStats extends ForumCategory {
  threadCount: number;
  postCount: number;
  lastActivity?: {
    thread: {
      id: number;
      title: string;
      slug: string;
      createdAt: string;
    };
    user: {
      id: number;
      username: string;
      avatarUrl: string | null;
    };
    post: {
      id: number;
      createdAt: string;
    };
  } | null;
  forums?: ForumCategoryWithStats[]; // Child forums (nested structure)
}

// Thread prefix (e.g., "Hot", "Pinned", "Solved")
export interface ThreadPrefix {
  id: number;
  name: string;
  color: string;
  position: number;
  isActive: boolean;
  categoryId: number | null; // If null, global prefix
  createdAt: string;
}

// Forum tag (e.g., "NFT", "ETH", "Trading")
export type Tag = {
  id: number;
  name: string;
  slug: string;
  // description: string | null; // Keeping description for now, can be removed if not used
  // createdAt: string; // Keeping createdAt for now, can be removed if not used
};

// Basic user information
export interface ForumUser {
  id: number;
  username: string;
  avatarUrl: string | null;
  role: string;
  title: string | null;
  signatureHtml: string | null;
  level: number;
  xp: number;
  isBanned: boolean;
  isAdmin: boolean;
  isModerator: boolean;
  createdAt: string;
}

// Thread information
export interface Thread {
  id: number;
  title: string;
  slug: string;
  categoryId: number;
  userId: number;
  prefixId: number | null;
  viewCount: number;
  postCount: number;
  isSticky: boolean;
  isLocked: boolean;
  isHidden: boolean;
  isSolved: boolean;
  solvingPostId: number | null;
  lastPostAt: string | null;
  lastPostUserId: number | null;
  createdAt: string;
  updatedAt: string;
}

// Thread with user and additional metadata
export interface ThreadWithUser extends Thread {
  user: ForumUser;
  prefix?: ThreadPrefix | null;
  category?: {
    id: number;
    name: string;
    slug: string;
  };
  tags?: Tag[];
  hasBookmarked?: boolean;
  lastPostUser?: ForumUser | null;
  firstPostId?: number;
}

// Thread post
export interface Post {
  id: number;
  threadId: number;
  userId: number;
  content: string;
  contentHtml: string;
  isEdited: boolean;
  isDeleted: boolean;
  isHidden: boolean;
  editorJson: any | null; // For rich text editors that store JSON state
  likesCount: number;
  replyCount: number;
  replyToId: number | null;
  createdAt: string;
  updatedAt: string;
}

// Post with user information
export interface PostWithUser extends Post {
  user: ForumUser;
  hasLiked?: boolean;
  isSolution?: boolean;
  replies?: PostWithUser[];
}

// Forum statistics
export interface ForumStatistics {
  totalThreads: number;
  totalPosts: number;
  totalUsers: number;
  totalCategories: number;
  mostActiveCategory: {
    id: number;
    name: string;
    slug: string;
    postCount: number;
  } | null;
  newestUser: ForumUser | null;
  mostActiveUsers: {
    user: ForumUser;
    postCount: number;
  }[];
}

// Thread search/filter parameters
export interface ThreadSearchParams {
  categoryId?: number;
  prefixId?: number;
  tagIds?: number[];
  userId?: number;
  sortBy?: 'latest' | 'hot' | 'staked' | 'popular' | 'recent' | 'solved' | 'unsolved';
  page?: number;
  limit?: number;
  search?: string;
}

// Forum rule
export interface ForumRule {
  id: number;
  title: string;
  content: string;
  contentHtml: string;
  position: number;
  isActive: boolean;
  requiresExplicitAgreement: boolean;
  createdAt: string;
  updatedAt: string;
}

// User rule agreement
export interface RuleAgreement {
  userId: number;
  ruleId: number;
  agreedAt: string;
}

// Bookmark
export interface Bookmark {
  id: number;
  userId: number;
  threadId: number;
  createdAt: string;
  thread?: ThreadWithUser;
}

// Thread reaction
export interface ThreadReaction {
  id: number;
  threadId: number;
  userId: number;
  type: string;
  createdAt: string;
}

// Post reaction (like, etc.)
export interface PostReaction {
  id: number;
  postId: number;
  userId: number;
  type: string;
  createdAt: string;
}

// Post tip
export interface PostTip {
  id: number;
  postId: number;
  userId: number;
  amount: number;
  createdAt: string;
} 