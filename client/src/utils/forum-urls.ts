/**
 * Forum URL Utilities - Hybrid Navigation System
 *
 * Supports both direct forum access and hierarchical zone-based navigation:
 * - /forums - All forums index
 * - /forums/{slug} - Direct forum access
 * - /zones - Zone-organized view
 * - /zones/{zone}/{forum} - Hierarchical access
 * - /zones/{zone}/{forum}/{subforum} - Nested forum access
 */

export interface ForumEntity {
	slug: string;
	name: string;
	type?: 'zone' | 'forum' | 'subforum';
	parentSlug?: string;
	zoneSlug?: string;
}

export interface ThreadEntity {
	slug: string;
	id: number;
}

/**
 * URL Generation Functions
 */

// Direct forum URLs (legacy/power user pattern)
export function getForumUrl(forumSlug: string): string {
	return `/forums/${forumSlug}`;
}

// Hierarchical zone-based URLs
export function getZoneUrl(zoneSlug: string): string {
	return `/zones/${zoneSlug}`;
}

export function getZoneForumUrl(zoneSlug: string, forumSlug: string): string {
	return `/zones/${zoneSlug}/${forumSlug}`;
}

export function getZoneSubforumUrl(
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
export function getCreateThreadUrl(forumSlug: string, zoneSlug?: string): string {
	if (zoneSlug) {
		return `/zones/${zoneSlug}/${forumSlug}/create`;
	}
	return `/forums/${forumSlug}/create`;
}

/**
 * URL Parsing Functions
 */

export interface ParsedForumUrl {
	type:
		| 'forum-direct'
		| 'zone-forum'
		| 'zone-subforum'
		| 'zone-overview'
		| 'forums-index'
		| 'zones-index';
	zoneSlug?: string;
	forumSlug?: string;
	subforumSlug?: string;
}

export function parseForumUrl(pathname: string): ParsedForumUrl {
	const segments = pathname.split('/').filter(Boolean);

	if (pathname === '/forums') {
		return { type: 'forums-index' };
	}

	if (pathname === '/zones') {
		return { type: 'zones-index' };
	}

	if (segments[0] === 'forums' && segments.length === 2) {
		return {
			type: 'forum-direct',
			forumSlug: segments[1]
		};
	}

	if (segments[0] === 'zones') {
		if (segments.length === 2) {
			return {
				type: 'zone-overview',
				zoneSlug: segments[1]
			};
		}

		if (segments.length === 3) {
			return {
				type: 'zone-forum',
				zoneSlug: segments[1],
				forumSlug: segments[2]
			};
		}

		if (segments.length === 4) {
			return {
				type: 'zone-subforum',
				zoneSlug: segments[1],
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
	// If we have zone context, use hierarchical URL
	if (forum.zoneSlug) {
		if (forum.parentSlug && forum.type === 'subforum') {
			return getZoneSubforumUrl(forum.zoneSlug, forum.parentSlug, forum.slug);
		}
		return getZoneForumUrl(forum.zoneSlug, forum.slug);
	}

	// Fallback to direct URL
	return getForumUrl(forum.slug);
}

/**
 * Navigation Helpers
 */

export function isForumActive(forumSlug: string, currentPath: string): boolean {
	const parsed = parseForumUrl(currentPath);
	return parsed.forumSlug === forumSlug || parsed.subforumSlug === forumSlug;
}

export function isZoneActive(zoneSlug: string, currentPath: string): boolean {
	const parsed = parseForumUrl(currentPath);
	return parsed.zoneSlug === zoneSlug;
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
		zone?: { name: string; slug: string };
		forum?: { name: string; slug: string };
		subforum?: { name: string; slug: string };
		thread?: { title: string; slug: string };
	}
): BreadcrumbItem[] {
	const breadcrumbs: BreadcrumbItem[] = [{ label: 'Home', href: '/' }];

	switch (parsed.type) {
		case 'forums-index':
			breadcrumbs.push({ label: 'Forums', href: '/forums' });
			break;

		case 'zones-index':
			breadcrumbs.push({ label: 'Zones', href: '/zones' });
			break;

		case 'forum-direct':
			breadcrumbs.push({ label: 'Forums', href: '/forums' });
			if (entities.forum) {
				breadcrumbs.push({
					label: entities.forum.name,
					href: getForumUrl(entities.forum.slug)
				});
			}
			break;

		case 'zone-overview':
			breadcrumbs.push({ label: 'Zones', href: '/zones' });
			if (entities.zone) {
				breadcrumbs.push({
					label: entities.zone.name,
					href: getZoneUrl(entities.zone.slug)
				});
			}
			break;

		case 'zone-forum':
			breadcrumbs.push({ label: 'Zones', href: '/zones' });
			if (entities.zone) {
				breadcrumbs.push({
					label: entities.zone.name,
					href: getZoneUrl(entities.zone.slug)
				});
			}
			if (entities.forum && entities.zone) {
				breadcrumbs.push({
					label: entities.forum.name,
					href: getZoneForumUrl(entities.zone.slug, entities.forum.slug)
				});
			}
			break;

		case 'zone-subforum':
			breadcrumbs.push({ label: 'Zones', href: '/zones' });
			if (entities.zone) {
				breadcrumbs.push({
					label: entities.zone.name,
					href: getZoneUrl(entities.zone.slug)
				});
			}
			if (entities.forum && entities.zone) {
				breadcrumbs.push({
					label: entities.forum.name,
					href: getZoneForumUrl(entities.zone.slug, entities.forum.slug)
				});
			}
			if (entities.subforum && entities.zone && entities.forum) {
				breadcrumbs.push({
					label: entities.subforum.name,
					href: getZoneSubforumUrl(entities.zone.slug, entities.forum.slug, entities.subforum.slug)
				});
			}
			break;
	}

	return breadcrumbs;
}

/**
 * URL Constants for consistent patterns
 */
export const URL_PATTERNS = {
	FORUMS_INDEX: '/forums',
	ZONES_INDEX: '/zones',
	FORUM_DIRECT: '/forums/:forumSlug',
	FORUM_CREATE_DIRECT: '/forums/:forumSlug/create',
	ZONE_OVERVIEW: '/zones/:zoneSlug',
	ZONE_FORUM: '/zones/:zoneSlug/:forumSlug',
	ZONE_SUBFORUM: '/zones/:zoneSlug/:forumSlug/:subforumSlug',
	ZONE_FORUM_CREATE: '/zones/:zoneSlug/:forumSlug/create',
	THREAD: '/threads/:threadSlug'
} as const;
