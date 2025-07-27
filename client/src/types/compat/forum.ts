// Compat shim mapping deprecated @db_types/forum.types usages to canonical frontend types
// This file lives entirely in client/ space, satisfying import-boundary rules.

import type { Thread } from '@shared/types/thread.types';
import type { CanonicalPost } from '@/types/canonical.types';

// -----------------------------------------------------------------------------
// Legacy Thread / Post aliases (read-only, will be removed Q4-2025)
// -----------------------------------------------------------------------------
export type { Thread };
export type ThreadWithUser = Thread;
export type ThreadWithUserAndCategory = Thread;
export type ThreadWithUserAndStructure = Thread;
export type PostWithUser = CanonicalPost;

// Composite thread-plus-posts shapes retained for API compatibility
export interface ThreadWithPostsAndUser {
	thread: Thread;
	posts: CanonicalPost[];
}
export interface ThreadWithPostsAndUserStructure extends ThreadWithPostsAndUser {}

// ThreadPrefix & ForumTag already live in thread.types
export { ThreadPrefix, ThreadTag as ForumTag } from '@/types/thread.types';
