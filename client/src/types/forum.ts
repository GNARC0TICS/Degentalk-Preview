import type { User } from '@schema/user/users';
import type { ForumCategory } from '@schema/forum/categories';
import type { ThreadPrefix, ForumTag as ThreadTag } from '@db_types/forum.types';

// Based on ThreadWithUserAndCategory and observed usage
export interface ThreadCardPropsData {
  id: number;
  title: string;
  slug: string;
  isSticky?: boolean;
  isLocked?: boolean;
  isHidden?: boolean;
  viewCount?: number;
  postCount?: number;
  lastPostAt?: string | Date | null;
  createdAt: string | Date;
  updatedAt?: string | Date | null;
  user: Partial<User> & { username: string; id: number; avatarUrl?: string | null; activeAvatarUrl?: string | null; role?: string | null }; // Simplified user
  category?: Partial<ForumCategory> & { name: string; slug: string; id: number }; // Simplified category
  tags?: Partial<ThreadTag>[];
  prefix?: Partial<ThreadPrefix> & { name: string; color?: string | null };
  hotScore?: number;
  isSolved?: boolean;
  solvingPostId?: number | null;
  firstPostLikeCount?: number; // from ApiThread
  // Fields that might be needed from other contexts (e.g. ApiThread in tags/[tagSlug].tsx)
  preview?: string | null; 
  isFeatured?: boolean; // for isAnnouncement
  hasBookmarked?: boolean;
  dgtStaked?: number; // Added from ThreadWithUserAndCategory
  // parentForumSlug?: string; // This was passed to ThreadCard in [thread_slug].tsx, but not part of thread object
}

// This will be the prop type for the ThreadCard component
export interface ThreadCardComponentProps {
  thread: ThreadCardPropsData;
  className?: string;
  linkAs?: 'wouter' | 'next'; // For choosing link component
  // forumSlug?: string; // This was passed to ThreadCard in [thread_slug].tsx
  // parentForumTheme?: string | null; // This was passed to ThreadCard in [thread_slug].tsx
  // tippingEnabled?: boolean; // This was passed to ThreadCard in [thread_slug].tsx
}

// Re-exporting Tag type if it's commonly used with ThreadCard or related components
export interface Tag {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  color?: string | null;
  icon?: string | null;
  tagGroupId?: number | null;
  isCategoryOnly?: boolean;
}
