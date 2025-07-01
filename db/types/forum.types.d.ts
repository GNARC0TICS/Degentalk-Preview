import type { ForumStructureNode } from '../schema/forum/structure';
import type { threadPrefixes } from '../schema';
import type { CanonicalThread, CanonicalPost } from '@/client/src/types/canonical.types';
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
/** @deprecated – use CanonicalThread */
export type ThreadWithUser = CanonicalThread;
/** @deprecated – use CanonicalPost */
export type PostWithUser = CanonicalPost;
/** @deprecated – use CanonicalThread */
export type ThreadWithUserAndCategory = CanonicalThread;
/** Pagination info retained for server responses – keep for now */
export interface PaginationInfo {
	page: number;
	pageSize: number;
	totalItems: number;
	totalPages: number;
}
/** @deprecated – use CanonicalThread */
export interface ThreadWithUserAndStructure extends CanonicalThread {}
/** @deprecated – use CanonicalThread & CanonicalPost composite */
export interface ThreadWithPostsAndUser {
	thread: CanonicalThread;
	posts: CanonicalPost[];
	pagination: PaginationInfo;
}
/** @deprecated – consolidated under CanonicalThread */
export interface ThreadWithPostsAndUserStructure extends ThreadWithPostsAndUser {}
export interface ForumTag {
	id: number;
	name: string;
	slug: string;
	description?: string | null;
	createdAt: Date;
}
export interface ForumCategoryWithStats extends ForumStructureNode {
	threadCount: number;
	postCount: number;
	lastThread?: ThreadWithUser;
	parentId: number | null;
	pluginData: Record<string, unknown>;
	minXp: number;
	type: string;
	colorTheme: string | null;
	icon: string;
	isHidden: boolean;
	canHaveThreads: boolean;
	childForums?: ForumCategoryWithStats[];
	isZone?: boolean;
	canonical?: boolean;
	isPrimary?: boolean;
	features?: string[];
	customComponents?: string[];
	staffOnly?: boolean;
}
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
export type ThreadPrefix = typeof threadPrefixes.$inferSelect;
export declare const __ensureModule = true;
//# sourceMappingURL=forum.types.d.ts.map
