/**
 * Forum Components
 *
 * This file exports all forum-related components for easy importing.
 * Follows the hierarchy: Zone > Forum > Thread > Reply
 */

// ==============================================================================
// PRIMARY NAVIGATION COMPONENTS
// ==============================================================================

// Primary navigation component (canonical)
export { default as HierarchicalZoneNav, HierarchicalForumNav } from './HierarchicalZoneNav';
export * from './HierarchicalZoneNav';

// Legacy navigation component (deprecated)
/**
 * @deprecated Use HierarchicalZoneNav instead for consistent forum navigation
 */
export * from './HierarchicalCategoryNav';

// ==============================================================================
// PRIMARY ZONE COMPONENTS
// ==============================================================================

export { default as CanonicalZoneGrid } from './CanonicalZoneGrid';
export { default as ZoneCard } from './ZoneCard';
export { default as ZoneGroup } from './ZoneGroup';

// ==============================================================================
// FORUM LISTING COMPONENTS
// ==============================================================================

export { ForumListItem } from './ForumListItem';
export * from './ForumListItem';

// ==============================================================================
// THREAD COMPONENTS
// ==============================================================================

export { default as ThreadCard } from './ThreadCard';
export { default as ThreadList } from './ThreadList';
export { CreateThreadButton } from './CreateThreadButton';
export * from './CreateThreadButton';
export * from './ThreadCard';
export * from './ThreadList';
export * from './CreateThreadForm';

// Thread page components
export * from './ThreadPost';

// ==============================================================================
// POST & REPLY COMPONENTS
// ==============================================================================

export { default as PostCard } from './PostCard';
export { default as PostList } from './PostList';
export { default as ReplyForm } from './ReplyForm';
export { default as CreatePostForm } from './CreatePostForm';
export * from './PostCard';
export * from './PostList';
export * from './PostReply';
export * from './ReplyForm';
export * from './CreatePostForm';

// ==============================================================================
// UTILITY & UI COMPONENTS
// ==============================================================================

// Tags and badges
export { default as TagList } from './TagList';
export { default as PrefixBadge } from './PrefixBadge';
export { default as SolvedBadge } from './SolvedBadge';
export { default as LevelBadge } from './LevelBadge';
export * from './TagList';
export * from './PrefixBadge';
export * from './SolveBadge';
export * from './LevelBadge';

// Navigation and search
export { default as ForumBreadcrumbs } from './ForumBreadcrumbs';
export { default as ForumFilters } from './ForumFilters';
export { default as ForumSearch } from './ForumSearch';
export { default as ForumGuidelines } from './ForumGuidelines';

// Content discovery
export { default as HotThreads } from './HotThreads';
export { default as LatestDiscussionItem } from './LatestDiscussionItem';
export * from './LatestDiscussionItem';
