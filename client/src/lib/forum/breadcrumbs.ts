import type { BreadcrumbItem } from '@/components/navigation/ForumBreadcrumbs';

export interface ZoneContext {
	id: number;
	name: string;
	slug: string;
}

export interface ForumContext {
	id: number;
	name: string;
	slug: string;
}

/**
 * Creates breadcrumb navigation items for forum pages
 */
export const createForumBreadcrumbs = {
	/**
	 * Creates breadcrumbs for a thread within a forum
	 * Format: Home > Zone > Forum > Thread
	 */
	threadInForum(
		zone: ZoneContext,
		forum: ForumContext,
		threadTitle: string,
		threadSlug: string
	): BreadcrumbItem[] {
		return [
			{ label: 'Home', href: '/' },
			{ label: zone.name, href: `/zones/${zone.slug}` },
			{ label: forum.name, href: `/zones/${zone.slug}/${forum.slug}` },
			{ label: threadTitle, href: `/threads/${threadSlug}` }
		];
	},

	/**
	 * Creates breadcrumbs for a forum page
	 * Format: Home > Zone > Forum
	 */
	forumInZone(zone: ZoneContext, forum: ForumContext): BreadcrumbItem[] {
		return [
			{ label: 'Home', href: '/' },
			{ label: zone.name, href: `/zones/${zone.slug}` },
			{ label: forum.name, href: `/zones/${zone.slug}/${forum.slug}` }
		];
	},

	/**
	 * Creates breadcrumbs for a zone page
	 * Format: Home > Zone
	 */
	zone(zone: ZoneContext): BreadcrumbItem[] {
		return [
			{ label: 'Home', href: '/' },
			{ label: zone.name, href: `/zones/${zone.slug}` }
		];
	}
};
