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

// ==============================================================================
// PRIMARY ZONE COMPONENTS
// ==============================================================================

// Primary Zone Components (if files missing, ensure paths correct)
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
export { default as CreateThreadButton } from '@/components/forum/CreateThreadButton';
export * from './ThreadCard';
export * from './ThreadList';
export * from './CreateThreadForm';

// ==============================================================================
// POST & REPLY COMPONENTS
// ==============================================================================

export { default as PostCard } from './PostCard';
export { default as PostList } from './PostList';
export { default as ReplyForm } from './ReplyForm';
export { default as CreatePostForm } from './CreatePostForm';
export * from './PostCard';
export * from './PostList';
export * from './ReplyForm';
export * from './CreatePostForm';

// ==============================================================================
// UTILITY & UI COMPONENTS
// ==============================================================================

// Tags and badges
export { PrefixBadge } from '@/components/forum/prefix-badge';
export { LevelBadge } from '@/components/identity/LevelBadge';
export { SolveBadge } from '@/components/forum/SolveBadge';
export * from '@/components/forum/prefix-badge';
export * from '@/components/forum/SolveBadge';

// Navigation and search
export { default as ForumBreadcrumbs } from './ForumBreadcrumbs';
export { default as ForumFilters } from './ForumFilters';
export { default as ForumSearch } from './ForumSearch';
export { default as ForumGuidelines } from './ForumGuidelines';

// Content discovery
export { default as HotThreads } from './HotThreads';
export { default as LatestDiscussionItem } from './LatestDiscussionItem';
export * from './LatestDiscussionItem';
