// Enhanced Forum Components (with both Enhanced and clean names for migration)
export { default as EnhancedThreadCard } from './EnhancedThreadCard';
export { default as EnhancedZoneCard } from './EnhancedZoneCard';
export { default as CryptoEngagementBar } from './CryptoEngagementBar';
export { default as QuickReactions } from './QuickReactions';
export { default as MobileForumNavigation } from './MobileForumNavigation';
export { default as EnhancedForumPage } from './EnhancedForumPage';

// Clean names (final target exports)
export { default as ThreadCardPure } from './EnhancedThreadCard';
export { default as ZoneCardPure } from './EnhancedZoneCard';
export { default as ForumPage } from './EnhancedForumPage';

// Export types
export type { EnhancedThreadCardProps } from './EnhancedThreadCard';
export type { EnhancedZoneCardProps } from './EnhancedZoneCard';
export type { CryptoEngagementBarProps } from './CryptoEngagementBar';
export type { QuickReactionsProps, Reaction } from './QuickReactions';
export type { MobileForumNavigationProps } from './MobileForumNavigation';
export type { EnhancedForumPageProps } from './EnhancedForumPage';

// Clean type aliases
export type { EnhancedThreadCardProps as ThreadCardPureProps } from './EnhancedThreadCard';
export type { EnhancedZoneCardProps as ZoneCardPureProps } from './EnhancedZoneCard';
export type { EnhancedForumPageProps as ForumPageProps } from './EnhancedForumPage';
