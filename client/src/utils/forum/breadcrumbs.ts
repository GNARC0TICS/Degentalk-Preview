import type { BreadcrumbItem } from '@/components/navigation/ForumBreadcrumbs';
import { getForumUrl, getSubforumUrl, getThreadUrl } from './urls';

export interface ForumContext {
	id: string;
	name: string;
	slug: string;
	isPrimary?: boolean;
}

/**
 * Creates breadcrumb navigation items for forum pages using clean /forums/ structure
 */
export const createForumBreadcrumbs = {
	/**
	 * Creates breadcrumbs for a thread within a forum
	 * Format: Home > Forums > Forum > Thread (or Home > Forums > Forum > Subforum > Thread)
	 */
	threadInForum(
		forum: ForumContext | undefined,
		threadTitle: string,
		threadSlug: string,
		parentForum?: ForumContext | undefined
	): BreadcrumbItem[] {
		if (!forum) {
			return [
				{ label: 'Home', href: '/' },
				{ label: 'Forums', href: '/forums' },
				{ label: threadTitle, href: getThreadUrl(threadSlug) }
			];
		}

		const breadcrumbs: BreadcrumbItem[] = [
			{ label: 'Home', href: '/' },
			{ label: 'Forums', href: '/forums' }
		];

		// If this is a subforum, add parent forum to breadcrumbs
		if (parentForum) {
			const parentLabel = parentForum.isPrimary ? `🌟 ${parentForum.name}` : parentForum.name;
			breadcrumbs.push({
				label: parentLabel,
				href: getForumUrl(parentForum.slug)
			});
			breadcrumbs.push({
				label: forum.name,
				href: getSubforumUrl(parentForum.slug, forum.slug)
			});
		} else {
			const forumLabel = forum.isPrimary ? `🌟 ${forum.name}` : forum.name;
			breadcrumbs.push({ label: forumLabel, href: getForumUrl(forum.slug) });
		}

		breadcrumbs.push({ label: threadTitle, href: `/threads/${threadSlug}` });
		return breadcrumbs;
	},

	/**
	 * Creates breadcrumbs for a forum page
	 * Format: Home > Forums > Forum (or Home > Forums > Forum > Subforum)
	 */
	forumPage(forum: ForumContext, parentForum?: ForumContext): BreadcrumbItem[] {
		const breadcrumbs: BreadcrumbItem[] = [
			{ label: 'Home', href: '/' },
			{ label: 'Forums', href: '/forums' }
		];

		// If this is a subforum, add parent forum to breadcrumbs
		if (parentForum) {
			const parentLabel = parentForum.isPrimary ? `🌟 ${parentForum.name}` : parentForum.name;
			breadcrumbs.push({
				label: parentLabel,
				href: getForumUrl(parentForum.slug)
			});
			breadcrumbs.push({
				label: forum.name,
				href: getSubforumUrl(parentForum.slug, forum.slug)
			});
		} else {
			const forumLabel = forum.isPrimary ? `🌟 ${forum.name}` : forum.name;
			breadcrumbs.push({ label: forumLabel, href: getForumUrl(forum.slug) });
		}

		return breadcrumbs;
	},

	/**
	 * Creates breadcrumbs for forums listing page
	 * Format: Home > Forums
	 */
	forumsIndex(): BreadcrumbItem[] {
		return [
			{ label: 'Home', href: '/' },
			{ label: 'Forums', href: '/forums' }
		];
	}
};
