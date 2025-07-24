// Compat shim mapping deprecated @db_types/forum.types usages to canonical frontend types
// This file lives entirely in client/ space, satisfying import-boundary rules.

import type { CanonicalThread, CanonicalPost } from '@app/types/canonical.types';

// -----------------------------------------------------------------------------
// Legacy Thread / Post aliases (read-only, will be removed Q4-2025)
// -----------------------------------------------------------------------------
export type Thread = CanonicalThread;
export type ThreadWithUser = CanonicalThread;
export type ThreadWithUserAndCategory = CanonicalThread;
export type ThreadWithUserAndStructure = CanonicalThread;
export type PostWithUser = CanonicalPost;

// Composite thread-plus-posts shapes retained for API compatibility
export interface ThreadWithPostsAndUser {
	thread: CanonicalThread;
	posts: CanonicalPost[];
}
export interface ThreadWithPostsAndUserStructure extends ThreadWithPostsAndUser {}

// ThreadPrefix & ForumTag already live in thread.types
export { ThreadPrefix, ThreadTag as ForumTag } from '@app/types/thread.types';
