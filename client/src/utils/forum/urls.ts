import { ROUTES } from '@app/constants/routes';

/**
 * Forum URL generation utilities for the clean /forums/ structure
 * 
 * Unified navigation with Featured Forums (isPrimary: true) and General Forums:
 * - /forums - All forums index (Featured + General)
 * - /forums/{slug} - Direct forum access
 * - /forums/{forum}/{subforum} - Nested forum access
 */

export interface ForumContext {
	id: string;
	slug: string;
	name: string;
	isPrimary?: boolean; // Featured Forum flag
}

/**
 * Clean forum URL generation
 */
export function getForumUrl(forumSlug: string): string {
	return ROUTES.FORUM(forumSlug);
}

export function getSubforumUrl(forumSlug: string, subforumSlug: string): string {
	return ROUTES.SUBFORUM(forumSlug, subforumSlug);
}

export function getThreadUrl(threadSlug: string): string {
	return `/threads/${threadSlug}`;
}

export function getCreateThreadUrl(forumSlug: string, subforumSlug?: string): string {
	if (subforumSlug) {
		return ROUTES.CREATE_THREAD_IN_SUBFORUM(forumSlug, subforumSlug);
	}
	return ROUTES.CREATE_THREAD_IN_FORUM(forumSlug);
}

/**
 * Generates the correct URL for a forum based on its context
 */
export function generateForumUrl(forum: ForumContext, parentForum?: ForumContext): string {
	if (parentForum) {
		return getSubforumUrl(parentForum.slug, forum.slug);
	}
	return getForumUrl(forum.slug);
}

/**
 * Generates the create thread URL for a forum
 */
export function generateCreateThreadUrl(forum: ForumContext, parentForum?: ForumContext): string {
	if (parentForum) {
		return getCreateThreadUrl(parentForum.slug, forum.slug);
	}
	return getCreateThreadUrl(forum.slug);
}

/**
 * Generates forums index URL (Featured + General Forums)
 */
export function generateForumsIndexUrl(): string {
	return ROUTES.FORUMS;
}

/**
 * URL Parsing
 */
export interface ParsedForumUrl {
	forumSlug?: string;
	subforumSlug?: string;
	isCreateThread?: boolean;
	isLegacy?: boolean;
	legacyZoneSlug?: string;
}

/**
 * Parses a clean forum URL to extract forum and subforum
 */
export function parseForumUrl(pathname: string): ParsedForumUrl {
	// Match current /forums/ patterns
	const forumMatch = pathname.match(/^\/forums\/([^\/]+)(?:\/(.+))?$/);
	if (forumMatch) {
		const forumSlug = forumMatch[1];
		const remainder = forumMatch[2];

		if (!remainder) {
			return { forumSlug };
		}

		if (remainder === 'create') {
			return { forumSlug, isCreateThread: true };
		}

		const parts = remainder.split('/');

		if (parts.length === 1) {
			return { forumSlug, subforumSlug: parts[0] };
		}

		if (parts.length === 2 && parts[1] === 'create') {
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
			return { isLegacy: true, legacyZoneSlug };
		}

		const parts = remainder.split('/');

		if (parts.length === 1) {
			return { isLegacy: true, legacyZoneSlug, forumSlug: parts[0] };
		}

		if (parts.length === 2) {
			if (parts[1] === 'create') {
				return { isLegacy: true, legacyZoneSlug, forumSlug: parts[0], isCreateThread: true };
			} else {
				return { isLegacy: true, legacyZoneSlug, forumSlug: parts[0], subforumSlug: parts[1] };
			}
		}

		if (parts.length === 3 && parts[2] === 'create') {
			return {
				isLegacy: true,
				legacyZoneSlug,
				forumSlug: parts[0],
				subforumSlug: parts[1],
				isCreateThread: true
			};
		}
	}

	return {};
}

/**
 * Navigation Helpers
 */
export function isForumActive(forumSlug: string, currentPath: string): boolean {
	const parsed = parseForumUrl(currentPath);
	return parsed.forumSlug === forumSlug || parsed.subforumSlug === forumSlug;
}

/**
 * Legacy URL Helpers
 */
export function isLegacyForumUrl(pathname: string): boolean {
	return pathname.startsWith('/zones/') || pathname.startsWith('/forum/');
}

export function extractLegacyForumSlug(pathname: string): string | null {
	// Handle /zones/ legacy URLs
	const zoneMatch = pathname.match(/^\/zones\/[^\/]+\/([^\/]+)/);
	if (zoneMatch) return zoneMatch[1];

	// Handle /forum/ (singular) legacy URLs
	const forumMatch = pathname.match(/^\/forum\/([^\/]+)/);
	return forumMatch ? forumMatch[1] : null;
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
	const breadcrumbs: BreadcrumbItem[] = [
		{ label: 'Home', href: '/' },
		{ label: 'Forums', href: ROUTES.FORUMS }
	];

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

	if (entities.thread) {
		breadcrumbs.push({
			label: entities.thread.title,
			href: getThreadUrl(entities.thread.slug)
		});
	}

	return breadcrumbs;
}