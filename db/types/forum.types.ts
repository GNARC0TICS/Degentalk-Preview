import type { ForumStructureNode } from '../schema/forum/structure';
import type { threadPrefixes } from '../schema'; // Import threadPrefixes schema
import type { TagId } from '@shared/types/ids';

// Import from shared types to avoid cross-workspace violations
import type { Thread } from '@shared/types/thread.types';
import type { Post } from '@shared/types/post.types';

// Temporary aliases for backward compatibility
export type CanonicalThread = Thread;
export type CanonicalPost = Post;

/**
 * ---------------------------------------------------------------------------
 *  DEPRECATION NOTICE
 *  This file previously contained parallel "hydrated" thread/post interfaces.
 *  All consumers should migrate to CanonicalThread / CanonicalPost (see
 *  client/src/types/canonical.types.ts). The legacy names below are kept as
 *  type aliases for a single release cycle to avoid breaking builds. They will
 *  be removed in Q4 2025. DO NOT ADD NEW USAGES.
 * ---------------------------------------------------------------------------
 */

/** @deprecated – use Thread from @shared/types/thread.types */
export type ThreadWithUser = Thread;

/** @deprecated – use Post from @shared/types/post.types */
export type PostWithUser = Post;

/** @deprecated – use Thread from @shared/types/thread.types */
export type ThreadWithUserAndCategory = Thread;

/** Pagination info retained for server responses – keep for now */
export interface PaginationInfo {
	page: number;
	pageSize: number;
	totalItems: number;
	totalPages: number;
}

/** @deprecated – use Thread from @shared/types/thread.types */
export interface ThreadWithUserAndStructure extends Thread {}

/** @deprecated – use Thread & Post composite */
export interface ThreadWithPostsAndUser {
	thread: Thread;
	posts: Post[];
	pagination: PaginationInfo;
}

/** @deprecated – consolidated under Thread */
export interface ThreadWithPostsAndUserStructure extends ThreadWithPostsAndUser {}

// Non-thread structures (still used in admin analytics). Keep for now
export interface ForumTag {
	id: TagId;
	name: string;
	slug: string;
	description?: string | null;
	createdAt: Date; // Assuming timestamp maps to Date
}

export interface ForumCategoryWithStats extends ForumStructureNode {
	threadCount: number;
	postCount: number;
	lastThread?: ThreadWithUser;
	parentId: string | null;
	pluginData: Record<string, unknown>;
	minXp: number;
	type: string;
	colorTheme: string | null;
	icon: string;
	isHidden: boolean;
	canHaveThreads: boolean;
	childForums?: ForumCategoryWithStats[];
	isZone?: boolean; // Added to reflect usage in routes
	canonical?: boolean; // Added to reflect usage in routes
	// Fields added by forumService.getForumStructure for zones
	isPrimary?: boolean;
	features?: string[];
	customComponents?: string[];
	staffOnly?: boolean;
}

// New interface using forum structure
export interface ForumStructureWithStats extends ForumStructureNode {
	threadCount: number;
	postCount: number;
	lastThread?: ThreadWithUser;
	canHaveThreads: boolean;
	childStructures?: ForumStructureWithStats[];
	isZone?: boolean;
	canonical?: boolean;
	isPrimary?: boolean;
	features?: string[];
	customComponents?: string[];
	staffOnly?: boolean;
}

// Define and export ThreadPrefix type
export type ThreadPrefix = typeof threadPrefixes.$inferSelect;

export const __ensureModule = true;
