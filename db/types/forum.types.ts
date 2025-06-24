import type { ForumStructureNode } from '../schema/forum/structure';
import type { Thread } from '../schema/forum/threads';
import type { Post } from '../schema/forum/posts';
import type { User } from '../schema/user/users';
import type { threadPrefixes } from '../schema'; // Import threadPrefixes schema

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
	category: ForumStructureNode; // Updated to use forum structure
	hasBookmarked?: boolean; // Added
	postCount: number;
	lastPost?: Post;
	parentForumSlug: string | null; // Corrected to allow null, and it's the immediate parent forum's slug
	zoneSlug?: string | null; // ADDED: Slug of the top-level zone
	tags?: ForumTag[]; // Added tags property
}

// New interface using forum structure instead of categories
export interface ThreadWithUserAndStructure extends Thread {
	user: User;
	structure: ForumStructureNode;
	hasBookmarked?: boolean;
	postCount: number;
	lastPost?: Post;
	parentForumSlug: string | null;
	zoneSlug?: string | null;
	tags?: ForumTag[];
}

// Added PaginationInfo and ThreadWithPostsAndUser
export interface PaginationInfo {
	page: number;
	pageSize: number;
	totalItems: number;
	totalPages: number;
}

export interface ThreadWithPostsAndUser {
	thread: ThreadWithUserAndCategory; // This will now include zoneSlug
	posts: PostWithUser[];
	pagination: PaginationInfo;
}

// New interface using forum structure
export interface ThreadWithPostsAndUserStructure {
	thread: ThreadWithUserAndStructure;
	posts: PostWithUser[];
	pagination: PaginationInfo;
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
