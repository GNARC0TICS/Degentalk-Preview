// Stub types for static landing page

export type User = {
  id: string;
  username: string;
  avatar?: string;
  level?: number;
  xp?: number;
  title?: string;
};

export type Forum = {
  id: string;
  title: string;
  description: string;
  slug: string;
  postCount?: number;
  threadCount?: number;
  icon?: string;
  isHot?: boolean;
  isFeatured?: boolean;
};

export type Thread = {
  id: string;
  title: string;
  slug: string;
  authorUsername: string;
  createdAt: string;
  lastPostAt: string;
  postCount: number;
  viewCount: number;
  isPinned?: boolean;
  isLocked?: boolean;
  prefix?: string;
};

export type Post = {
  id: string;
  content: string;
  authorUsername: string;
  createdAt: string;
  likes?: number;
};

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

// Mock ID types
export type UserId = string & { __brand: 'UserId' };
export type ForumId = string & { __brand: 'ForumId' };
export type ThreadId = string & { __brand: 'ThreadId' };
export type PostId = string & { __brand: 'PostId' };