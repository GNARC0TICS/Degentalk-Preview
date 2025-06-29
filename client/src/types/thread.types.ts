/**
 * Thread Display Types
 *
 * ENFORCED AS OF 2025-01-27 - ALL AGENTS MUST FOLLOW
 * Implements the canonical thread architecture mandated in CLAUDE.md
 * ALL frontend thread views MUST use ThreadDisplay type
 */

import type { CanonicalThread, CanonicalUser, CanonicalZone } from './canonical.types';

// Canonical zone with optional isPrimary flag for frontend helpers
export type ResolvedZone = CanonicalZone & { isPrimary?: boolean };

// User type for thread author
export interface ThreadUser {
	id: string;
	username: string;
	avatarUrl?: string | null;
	activeAvatarUrl?: string | null;
	reputation?: number;
	isVerified?: boolean;
	role?: 'user' | 'mod' | 'admin' | null;
}

// Zone information for theming and navigation
export interface ThreadZone {
	id?: number;
	name: string;
	slug: string;
	colorTheme: string;
}

// Category/Forum information
export interface ThreadCategory {
	id: number;
	name: string;
	slug: string;
}

// Tag information
export interface ThreadTag {
	id: number;
	name: string;
	slug?: string;
	color?: string;
}

// Thread prefix for categorization
export interface ThreadPrefix {
	id?: number;
	name: string;
	color: string;
}

// Engagement metrics
export interface ThreadEngagement {
	totalTips: number;
	uniqueTippers: number;
	bookmarks: number;
	momentum: 'bullish' | 'bearish' | 'neutral';
	reputationScore?: number;
	qualityScore?: number;
	hotScore?: number;
}

// Reaction data
export interface ThreadReaction {
	id: string;
	type: string;
	emoji: string;
	label: string;
	count: number;
	hasReacted: boolean;
	color: string;
	bgColor: string;
	borderColor: string;
}

/**
 * ThreadDisplay - The ONLY type for frontend thread views
 * ALL frontend thread components MUST use this type
 * Backend provides zone data automatically - DO NOT manually enrich thread data
 */
export interface ThreadDisplay extends CanonicalThread {
	// Additional display-specific fields
	relativeTime?: string; // "2 hours ago", "3 days ago"
	excerpt?: string; // First 150 chars of content for previews

	// Enhanced zone data (automatically provided by backend)
	zone: ResolvedZone;

	// Enhanced user data for display
	user: CanonicalUser & {
		displayRole?: string; // "Admin", "Moderator", "Level 42 User"
		badgeColor?: string; // CSS color for role badge
	};

	// Legacy compatibility fields (DEPRECATED - migrate away)
	/** @deprecated Use zone instead */
	category?: ThreadCategory;
	/** @deprecated Use engagement metrics from CanonicalThread */
	engagement?: ThreadEngagement;
	/** @deprecated Use reactions from future extension */
	reactions?: ThreadReaction[];
	/** @deprecated Use permissions from CanonicalThread */
	canEdit?: boolean;
	/** @deprecated Use permissions from CanonicalThread */
	canDelete?: boolean;
	/** @deprecated Use bookmarking system */
	hasBookmarked?: boolean;
}

/**
 * API Response Types
 */
export interface ThreadsApiResponse {
	threads: ThreadDisplay[];
	pagination: {
		page: number;
		limit: number;
		totalThreads: number;
		totalPages: number;
	};
}

/**
 * Thread List Props
 */
export interface ThreadListProps {
	threads: ThreadDisplay[];
	isLoading?: boolean;
	error?: Error | null;
	onTip?: (threadId: string, amount: number) => void;
	onBookmark?: (threadId: string) => void;
	layout?: 'list' | 'grid' | 'compact';
}
