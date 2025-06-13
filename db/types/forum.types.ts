import { ForumCategory } from '@schema/forum/categories';
import { Thread } from '@schema/forum/threads';
import { Post } from '@schema/forum/posts';
import { User } from '@schema/user/users';

export interface ThreadWithUser extends Thread {
  user: User;
  postCount: number;
  lastPost?: Post;
}

export interface PostWithUser extends Post {
  user: User;
}

export interface ThreadWithUserAndCategory extends Thread {
  user: User;
  category: ForumCategory;
  postCount: number;
  lastPost?: Post;
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

export const __ensureModule = true; 