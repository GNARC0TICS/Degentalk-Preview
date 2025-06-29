import type { BreadcrumbItem } from '@/components/navigation/ForumBreadcrumbs';
import {
	getZoneUrl,
	getForumUrl,
	getZoneForumUrl,
	getZoneSubforumUrl,
	getThreadUrl
} from '@/utils/forum-urls';

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
		zone: ZoneContext | undefined,
		forum: ForumContext | undefined,
		threadTitle: string,
		threadSlug: string,
		parentForum?: ForumContext | undefined
	): BreadcrumbItem[] {
		if (!zone || !forum) {
			return [
				{ label: 'Home', href: '/' },
				{ label: 'Zones', href: '/zones' },
				{ label: threadTitle, href: getThreadUrl(threadSlug) }
			];
		}

		const breadcrumbs: BreadcrumbItem[] = [
			{ label: 'Home', href: '/' },
			{ label: zone.name, href: getZoneUrl(zone.slug) }
		];

		// If this is a subforum, add parent forum to breadcrumbs
		if (parentForum) {
			breadcrumbs.push({
				label: parentForum.name,
				href: getZoneForumUrl(zone.slug, parentForum.slug)
			});
			breadcrumbs.push({
				label: forum.name,
				href: getZoneSubforumUrl(zone.slug, parentForum.slug, forum.slug)
			});
		} else {
			breadcrumbs.push({ label: forum.name, href: getZoneForumUrl(zone.slug, forum.slug) });
		}

		breadcrumbs.push({ label: threadTitle, href: `/threads/${threadSlug}` });
		return breadcrumbs;
	},

	/**
	 * Creates breadcrumbs for a forum page
	 * Format: Home > Zone > Forum (> Subforum)
	 */
	forumInZone(
		zone: ZoneContext,
		forum: ForumContext,
		parentForum?: ForumContext
	): BreadcrumbItem[] {
		const breadcrumbs: BreadcrumbItem[] = [
			{ label: 'Home', href: '/' },
			{ label: zone.name, href: getZoneUrl(zone.slug) }
		];

		// If this is a subforum, add parent forum to breadcrumbs
		if (parentForum) {
			breadcrumbs.push({
				label: parentForum.name,
				href: getZoneForumUrl(zone.slug, parentForum.slug)
			});
			breadcrumbs.push({
				label: forum.name,
				href: getZoneSubforumUrl(zone.slug, parentForum.slug, forum.slug)
			});
		} else {
			breadcrumbs.push({ label: forum.name, href: getZoneForumUrl(zone.slug, forum.slug) });
		}

		return breadcrumbs;
	},

	/**
	 * Creates breadcrumbs for a zone page
	 * Format: Home > Zone
	 */
	zone(zone: ZoneContext): BreadcrumbItem[] {
		return [
			{ label: 'Home', href: '/' },
			{ label: zone.name, href: getZoneUrl(zone.slug) }
		];
	}
};
