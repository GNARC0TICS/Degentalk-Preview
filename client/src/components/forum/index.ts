/**
 * Forum Components - Comprehensive Barrel Exports
 * 
 * Organized exports for all forum-related components with correct export patterns
 */

// =================== CORE COMPONENTS (default exports) ===================
export { default as ThreadCard } from './ThreadCard';
export { default as ZoneCard } from './ZoneCard';
export { default as ForumPage } from './ForumPage';
export { default as ForumErrorBoundary } from './ForumErrorBoundary';

// =================== COMPONENTS (named exports) ===================
export { ThreadFilters } from './ThreadFilters';
export { ThreadStats } from './ThreadStats';
export { ThreadAuthor } from './ThreadAuthor';
export { ThreadSidebar } from './ThreadSidebar';
export { ThreadPagination } from './ThreadPagination';
export { ReactionBar } from './ReactionBar';
export { ModeratorActions } from './ModeratorActions';
export { ConfigurableZoneCard } from './ConfigurableZoneCard';
export { CreateThreadButton } from './CreateThreadButton';
export { QuickStats } from './QuickStats';
export { HotTopics } from './HotTopics';
export { RecentActivity } from './RecentActivity';
export { ProfileCard } from './ProfileCard';
export { UserLevelDisplay } from './UserLevelDisplay';
export { SignatureRenderer } from './SignatureRenderer';
export { MyBBBreadcrumb } from './MyBBBreadcrumb';
export { MyBBForumList } from './MyBBForumList';
export { MyBBStats } from './MyBBStats';
export { MyBBThreadList } from './MyBBThreadList';

// =================== COMPONENTS (default exports) ===================
export { default as CanonicalZoneGrid } from './CanonicalZoneGrid';
export { default as QuickReplyInput } from './QuickReplyInput';
export { default as ShareButton } from './ShareButton';
export { default as SolveBadge } from './SolveBadge';
export { default as OriginForumPill } from './OriginForumPill';
export { default as ShopCard } from './ShopCard';
export { default as StickyBackButton } from './StickyBackButton';
export { default as XpBoostBadge } from './XpBoostBadge';

// =================== FORUM STRUCTURE ===================
export { ZoneStats } from './ZoneStats';
export { ForumCard } from './forum-card';
export { ForumCategoryCard } from './forum-category-card';
export { CategoryCard } from './category-card';
export { ZoneGroup } from './zone-group';

// =================== NAVIGATION & UI ===================
export { BreadcrumbNav } from './breadcrumb-nav';
export { ForumFilters } from './forum-filters';
export { TagInput } from './tag-input';
export { PrefixBadge } from './prefix-badge';

// =================== CONTENT & STATS ===================
export { ForumGuidelines } from './forum-guidelines';

// =================== SUB-MODULES ===================
// Layout Components
export * from './layouts';

// Sidebar Components  
export * from './sidebar';

// Enhanced Components
export { default as MobileForumNavigation } from './enhanced/MobileForumNavigation';
export { default as QuickReactions } from './enhanced/QuickReactions';
export { default as CryptoEngagementBar } from './enhanced/CryptoEngagementBar';

// =================== TYPE EXPORTS ===================
// Re-export important types that might be needed
export type { ThreadCardComponentProps } from '@/types/forum';