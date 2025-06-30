/**
 * Forum URL Utilities - Clean /forums/ Structure
 *
 * Unified forum navigation with Featured Forums (isPrimary: true) and General Forums:
 * - /forums - All forums index (Featured + General)
 * - /forums/{slug} - Direct forum access
 * - /forums/{forum}/{subforum} - Nested forum access
 * - Legacy /zones/ URLs redirect to /forums/
 */

export interface ForumEntity {
	slug: string;
	name: string;
	type?: 'forum' | 'subforum';
	parentSlug?: string;
	isPrimary?: boolean; // Featured Forum flag
}

export interface ThreadEntity {
	slug: string;
	id: number;
}

/**
 * URL Generation Functions
 */

// Clean forum URLs
export function getForumUrl(forumSlug: string): string {
	return `/forums/${forumSlug}`;
}

export function getSubforumUrl(forumSlug: string, subforumSlug: string): string {
	return `/forums/${forumSlug}/${subforumSlug}`;
}

// Legacy zone-based URLs (for redirects only)
export function getLegacyZoneUrl(zoneSlug: string): string {
	return `/zones/${zoneSlug}`;
}

export function getLegacyZoneForumUrl(zoneSlug: string, forumSlug: string): string {
	return `/zones/${zoneSlug}/${forumSlug}`;
}

export function getLegacyZoneSubforumUrl(
	zoneSlug: string,
	forumSlug: string,
	subforumSlug: string
): string {
	return `/zones/${zoneSlug}/${forumSlug}/${subforumSlug}`;
}

// Thread URLs (always flat)
export function getThreadUrl(threadSlug: string): string {
	return `/threads/${threadSlug}`;
}

export function getThreadUrlById(threadId: number): string {
	return `/threads/${threadId}`;
}

// Thread creation URLs
export function getCreateThreadUrl(forumSlug: string, subforumSlug?: string): string {
	if (subforumSlug) {
		return `/forums/${forumSlug}/${subforumSlug}/create`;
	}
	return `/forums/${forumSlug}/create`;
}

/**
 * URL Parsing Functions
 */

export interface ParsedForumUrl {
	type:
		| 'forum-direct'
		| 'subforum'
		| 'forums-index'
		| 'legacy-zone-overview'
		| 'legacy-zone-forum'
		| 'legacy-zone-subforum'
		| 'legacy-zones-index';
	forumSlug?: string;
	subforumSlug?: string;
	legacyZoneSlug?: string; // For legacy URLs only
}

export function parseForumUrl(pathname: string): ParsedForumUrl {
	const segments = pathname.split('/').filter(Boolean);

	if (pathname === '/forums') {
		return { type: 'forums-index' };
	}

	// Handle current /forums/ structure
	if (segments[0] === 'forums') {
		if (segments.length === 2) {
			return {
				type: 'forum-direct',
				forumSlug: segments[1]
			};
		}

		if (segments.length === 3) {
			return {
				type: 'subforum',
				forumSlug: segments[1],
				subforumSlug: segments[2]
			};
		}
	}

	// Handle legacy /zones/ URLs
	if (pathname === '/zones') {
		return { type: 'legacy-zones-index' };
	}

	if (segments[0] === 'zones') {
		if (segments.length === 2) {
			return {
				type: 'legacy-zone-overview',
				legacyZoneSlug: segments[1]
			};
		}

		if (segments.length === 3) {
			return {
				type: 'legacy-zone-forum',
				legacyZoneSlug: segments[1],
				forumSlug: segments[2]
			};
		}

		if (segments.length === 4) {
			return {
				type: 'legacy-zone-subforum',
				legacyZoneSlug: segments[1],
				forumSlug: segments[2],
				subforumSlug: segments[3]
			};
		}
	}

	return { type: 'forums-index' }; // fallback
}

/**
 * Smart URL Generation - Choose best pattern based on context
 */

export function getSmartForumUrl(forum: ForumEntity): string {
	// Use clean /forums/ structure
	if (forum.parentSlug && forum.type === 'subforum') {
		return getSubforumUrl(forum.parentSlug, forum.slug);
	}

	// Direct forum URL
	return getForumUrl(forum.slug);
}

/**
 * Navigation Helpers
 */

export function isForumActive(forumSlug: string, currentPath: string): boolean {
	const parsed = parseForumUrl(currentPath);
	return parsed.forumSlug === forumSlug || parsed.subforumSlug === forumSlug;
}

export function isLegacyZoneActive(zoneSlug: string, currentPath: string): boolean {
	const parsed = parseForumUrl(currentPath);
	return parsed.legacyZoneSlug === zoneSlug;
}

/**
 * Breadcrumb Generation
 */

export interface BreadcrumbItem {
	label: string;
	href: string;
}

export function generateBreadcrumbs(
	parsed: ParsedForumUrl,
	entities: {
		forum?: { name: string; slug: string; isPrimary?: boolean };
		subforum?: { name: string; slug: string };
		thread?: { title: string; slug: string };
	}
): BreadcrumbItem[] {
	const breadcrumbs: BreadcrumbItem[] = [{ label: 'Home', href: '/' }];

	switch (parsed.type) {
		case 'forums-index':
			breadcrumbs.push({ label: 'Forums', href: '/forums' });
			break;

		case 'forum-direct':
			breadcrumbs.push({ label: 'Forums', href: '/forums' });
			if (entities.forum) {
				const forumLabel = entities.forum.isPrimary
					? `🌟 ${entities.forum.name}`
					: entities.forum.name;
				breadcrumbs.push({
					label: forumLabel,
					href: getForumUrl(entities.forum.slug)
				});
			}
			break;

		case 'subforum':
			breadcrumbs.push({ label: 'Forums', href: '/forums' });
			if (entities.forum) {
				const forumLabel = entities.forum.isPrimary
					? `🌟 ${entities.forum.name}`
					: entities.forum.name;
				breadcrumbs.push({
					label: forumLabel,
					href: getForumUrl(entities.forum.slug)
				});
			}
			if (entities.subforum && entities.forum) {
				breadcrumbs.push({
					label: entities.subforum.name,
					href: getSubforumUrl(entities.forum.slug, entities.subforum.slug)
				});
			}
			break;

		// Legacy breadcrumbs (redirect to new structure)
		case 'legacy-zones-index':
		case 'legacy-zone-overview':
		case 'legacy-zone-forum':
		case 'legacy-zone-subforum':
			breadcrumbs.push({ label: 'Forums', href: '/forums' });
			break;
	}

	return breadcrumbs;
}

/**
 * URL Constants for consistent patterns
 */
export const URL_PATTERNS = {
	FORUMS_INDEX: '/forums',
	FORUM_DIRECT: '/forums/:forumSlug',
	SUBFORUM: '/forums/:forumSlug/:subforumSlug',
	FORUM_CREATE: '/forums/:forumSlug/create',
	SUBFORUM_CREATE: '/forums/:forumSlug/:subforumSlug/create',
	THREAD: '/threads/:threadSlug',

	// Legacy patterns (for redirects)
	LEGACY_ZONES_INDEX: '/zones',
	LEGACY_ZONE_OVERVIEW: '/zones/:zoneSlug',
	LEGACY_ZONE_FORUM: '/zones/:zoneSlug/:forumSlug',
	LEGACY_ZONE_SUBFORUM: '/zones/:zoneSlug/:forumSlug/:subforumSlug'
} as const;
