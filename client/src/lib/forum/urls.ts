import { ROUTES } from '@/constants/routes';

/**
 * Forum URL generation utilities for the clean /forums/ structure
 */

export interface ForumContext {
	id: string;
	slug: string;
	name: string;
	isPrimary?: boolean; // Featured Forum flag
}

/**
 * Generates the correct URL for a forum based on its context
 */
export function generateForumUrl(forum: ForumContext, parentForum?: ForumContext): string {
	if (parentForum) {
		// This is a subforum
		return ROUTES.SUBFORUM(parentForum.slug, forum.slug);
	} else {
		// This is a direct forum
		return ROUTES.FORUM(forum.slug);
	}
}

/**
 * Generates the create thread URL for a forum
 */
export function generateCreateThreadUrl(forum: ForumContext, parentForum?: ForumContext): string {
	if (parentForum) {
		// Create thread in subforum
		return ROUTES.CREATE_THREAD_IN_SUBFORUM(parentForum.slug, forum.slug);
	} else {
		// Create thread in direct forum
		return ROUTES.CREATE_THREAD_IN_FORUM(forum.slug);
	}
}

/**
 * Generates forums index URL (Featured + General Forums)
 */
export function generateForumsIndexUrl(): string {
	return ROUTES.FORUMS;
}

/**
 * Parses a clean forum URL to extract forum and subforum
 */
export function parseForumUrl(pathname: string): {
	forumSlug?: string;
	subforumSlug?: string;
	isCreateThread?: boolean;
	isLegacy?: boolean;
	legacyZoneSlug?: string;
} {
	// Match current /forums/ patterns:
	// /forums
	// /forums/{forum}
	// /forums/{forum}/{subforum}
	// /forums/{forum}/create
	// /forums/{forum}/{subforum}/create

	const forumMatch = pathname.match(/^\/forums\/([^\/]+)(?:\/(.+))?$/);
	if (forumMatch) {
		const forumSlug = forumMatch[1];
		const remainder = forumMatch[2];

		if (!remainder) {
			// Just /forums/{forum}
			return { forumSlug };
		}

		if (remainder === 'create') {
			// /forums/{forum}/create
			return { forumSlug, isCreateThread: true };
		}

		const parts = remainder.split('/');

		if (parts.length === 1) {
			// /forums/{forum}/{subforum}
			return { forumSlug, subforumSlug: parts[0] };
		}

		if (parts.length === 2 && parts[1] === 'create') {
			// /forums/{forum}/{subforum}/create
			return {
				forumSlug,
				subforumSlug: parts[0],
				isCreateThread: true
			};
		}
	}

	// Handle legacy /zones/ patterns for redirects
	const zoneMatch = pathname.match(/^\/zones\/([^\/]+)(?:\/(.+))?$/);
	if (zoneMatch) {
		const legacyZoneSlug = zoneMatch[1];
		const remainder = zoneMatch[2];

		if (!remainder) {
			// Just /zones/{zone}
			return { isLegacy: true, legacyZoneSlug };
		}

		const parts = remainder.split('/');

		if (parts.length === 1) {
			// /zones/{zone}/{forum}
			return { isLegacy: true, legacyZoneSlug, forumSlug: parts[0] };
		}

		if (parts.length === 2) {
			if (parts[1] === 'create') {
				// /zones/{zone}/{forum}/create
				return { isLegacy: true, legacyZoneSlug, forumSlug: parts[0], isCreateThread: true };
			} else {
				// /zones/{zone}/{forum}/{subforum}
				return { isLegacy: true, legacyZoneSlug, forumSlug: parts[0], subforumSlug: parts[1] };
			}
		}

		if (parts.length === 3 && parts[2] === 'create') {
			// /zones/{zone}/{forum}/{subforum}/create
			return {
				isLegacy: true,
				legacyZoneSlug,
				forumSlug: parts[0],
				subforumSlug: parts[1],
				isCreateThread: true
			};
		}
	}

	// Fallback for unrecognized patterns
	return {};
}

/**
 * Determines if a URL represents a legacy forum URL that needs redirecting
 */
export function isLegacyForumUrl(pathname: string): boolean {
	return pathname.startsWith('/zones/') || pathname.startsWith('/forum/');
}

/**
 * Extracts the forum slug from a legacy URL
 */
export function extractLegacyForumSlug(pathname: string): string | null {
	// Handle /zones/ legacy URLs
	const zoneMatch = pathname.match(/^\/zones\/[^\/]+\/([^\/]+)/);
	if (zoneMatch) return zoneMatch[1];

	// Handle /forum/ (singular) legacy URLs
	const forumMatch = pathname.match(/^\/forum\/([^\/]+)/);
	return forumMatch ? forumMatch[1] : null;
}
