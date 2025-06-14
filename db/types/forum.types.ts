import type { ForumCategory } from "../schema/forum/categories";
import type { Thread } from "../schema/forum/threads";
import type { Post } from "../schema/forum/posts";
import type { User } from "../schema/user/users";
import type { threadPrefixes } from "../schema"; // Import threadPrefixes schema

export interface ThreadWithUser extends Thread {
  user: User;
  postCount: number;
  lastPost?: Post;
}

export interface PostWithUser extends Post {
  user: User;
  hasLiked?: boolean; // Added
}

export interface ForumTag {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  createdAt: Date; // Assuming timestamp maps to Date
}

export interface ThreadWithUserAndCategory extends Thread {
  user: User;
  category: ForumCategory;
  hasBookmarked?: boolean; // Added
  postCount: number;
  lastPost?: Post;
  parentForumSlug: string; // Added
  tags?: ForumTag[]; // Added tags property
}

// Added PaginationInfo and ThreadWithPostsAndUser
export interface PaginationInfo {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface ThreadWithPostsAndUser {
  thread: ThreadWithUserAndCategory;
  posts: PostWithUser[];
  pagination: PaginationInfo;
}

export interface ForumCategoryWithStats extends ForumCategory {
  threadCount: number;
  postCount: number;
  lastThread?: ThreadWithUser;
  parentId: number | null;
  pluginData: Record<string, any>;
  minXp: number;
  type: string;
  colorTheme: string | null;
  icon: string;
  isHidden: boolean;
  canHaveThreads: boolean;
  childForums?: ForumCategoryWithStats[];
}

// Define and export ThreadPrefix type
export type ThreadPrefix = typeof threadPrefixes.$inferSelect;

export const __ensureModule = true;
