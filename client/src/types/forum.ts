import type { ThreadPrefix, ForumTag as ThreadTag } from '@/types/compat/forum';
import type { GroupId, UserId, ThreadId, ForumId, PostId } from '@shared/types/ids';

// Local fallback interfaces to avoid cross-boundary imports
// These are intentionally minimal and should be replaced with canonical types once the backend API stabilises.
export interface ForumUserLite {
	id: UserId;
	username: string;
	avatarUrl?: string | null | undefined;
	activeAvatarUrl?: string | null | undefined;
	role?: string | null | undefined;
}

export interface ForumCategoryLite {
	id: ForumId;
	name: string;
	slug: string;
}

// Based on ThreadWithUserAndCategory and observed usage
export interface ThreadCardPropsData {
	id: ThreadId;
	title: string;
	slug: string;
	isSticky?: boolean | undefined;
	isLocked?: boolean | undefined;
	isHidden?: boolean | undefined;
	viewCount?: number | undefined;
	postCount?: number | undefined;
	lastPostAt?: string | Date | null | undefined;
	createdAt: string | Date;
	updatedAt?: string | Date | null | undefined;
	user: ForumUserLite;
	category?: ForumCategoryLite | undefined; // Simplified category
	tags?: Partial<ThreadTag>[] | undefined;
	prefix?:
		| (Partial<ThreadPrefix> & { name: string; color?: string | null | undefined })
		| undefined;
	hotScore?: number | undefined;
	isSolved?: boolean | undefined;
	solvingPostId?: string | null | undefined;
	firstPostLikeCount?: number | undefined; // from ApiThread
	// Fields that might be needed from other contexts (e.g. ApiThread in tags/[tagSlug].tsx)
	preview?: string | null | undefined;
	isFeatured?: boolean | undefined; // for isAnnouncement
	hasBookmarked?: boolean | undefined;
	dgtStaked?: number | undefined; // Added from ThreadWithUserAndCategory
	// parentForumSlug?: string; // This was passed to ThreadCard in [thread_slug].tsx, but not part of thread object
}

// This will be the prop type for the ThreadCard component
export interface ThreadCardComponentProps {
	thread: ThreadCardPropsData;
	className?: string;
	linkAs?: 'react-router' | 'next' | undefined; // For choosing link component
	forumSlug?: string;
	parentForumTheme?: string | null | undefined;
	tippingEnabled?: boolean | undefined;
}

// Re-exporting Tag type if it's commonly used with ThreadCard or related components
export interface Tag {
	id: string;
	name: string;
	slug: string;
	description?: string | null | undefined;
	color?: string | null | undefined;
	icon?: string | null | undefined;
	tagGroupId?: GroupId | null | undefined;
	isCategoryOnly?: boolean | undefined;
}
