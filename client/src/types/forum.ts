import type { ThreadPrefix, ForumTag as ThreadTag } from '@/types/compat/forum';
import type { GroupId } from '@/db/types';

// Local fallback interfaces to avoid cross-boundary imports
// These are intentionally minimal and should be replaced with canonical types once the backend API stabilises.
export interface ForumUserLite {
	id: number;
	username: string;
	avatarUrl?: string | null;
	activeAvatarUrl?: string | null;
	role?: string | null;
}

export interface ForumCategoryLite {
	id: number;
	name: string;
	slug: string;
}

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
	user: ForumUserLite;
	category?: ForumCategoryLite; // Simplified category
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
	forumSlug?: string;
	parentForumTheme?: string | null;
	tippingEnabled?: boolean;
}

// Re-exporting Tag type if it's commonly used with ThreadCard or related components
export interface Tag {
	id: number;
	name: string;
	slug: string;
	description?: string | null;
	color?: string | null;
	icon?: string | null;
	tagGroupId?: GroupId | null;
	isCategoryOnly?: boolean;
}
