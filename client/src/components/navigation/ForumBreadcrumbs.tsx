import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ChevronRight, Map, Layers } from 'lucide-react';
import { getForumSpacing } from '@/utils/spacing-constants';

export interface BreadcrumbItem {
	label: string;
	href: string;
	icon?: React.ReactNode;
}

interface ForumBreadcrumbsProps {
	items: BreadcrumbItem[];
	className?: string;
}

// Utility – strip leading emojis or non-word symbols (e.g. "🔥 ") from names
const stripLeadingEmoji = (label: string): string => label.replace(/^[^\p{L}\p{N}]+\s*/u, '');

/**
 * Standardized breadcrumb component for forum pages
 * Ensures consistent navigation experience across all forum sections
 */
export const ForumBreadcrumbs: React.FC<ForumBreadcrumbsProps> = ({ items, className = '' }) => {
	return (
		<nav
			className={`flex items-center space-x-2 text-sm text-zinc-400 ${getForumSpacing('headerMargin')} ${className}`}
		>
			{items.map((item, index) => (
				<React.Fragment key={item.href}>
					{index === items.length - 1 ? (
						// Last item - not clickable
						<span className="text-white font-medium flex items-center">
							{item.icon && <span className="mr-1">{item.icon}</span>}
							{item.label}
						</span>
					) : (
						// Clickable items
						<Link
							to={item.href}
							className="flex items-center hover:text-white transition-colors"
							aria-label={typeof item.label === 'string' ? item.label : undefined}
						>
							{item.icon && <span className="mr-1">{item.icon}</span>}
							{item.label}
						</Link>
					)}
					{index < items.length - 1 && <ChevronRight className="w-4 h-4" />}
				</React.Fragment>
			))}
		</nav>
	);
};

/**
 * Helper function to create common breadcrumb patterns
 */
export const createForumBreadcrumbs = {
	/**
	 * Home only
	 */
	home: (): BreadcrumbItem[] => [{ label: 'Home', href: '/', icon: <Home className="w-4 h-4" /> }],

	/**
	 * Home > Forums
	 */
	forums: (): BreadcrumbItem[] => [
		{ label: 'Home', href: '/', icon: <Home className="w-4 h-4" /> },
		{ label: 'Forums', href: '/forums' }
	],

	/**
	 * Home > Featured Forum (simplified)
	 */
	featuredForum: (forumName: string, forumSlug: string): BreadcrumbItem[] => [
		{ label: 'Home', href: '/', icon: <Home className="w-4 h-4" /> },
		{ label: 'Forums', href: '/forums' },
		{ label: `🌟 ${stripLeadingEmoji(forumName)}`, href: `/forums/${forumSlug}` }
	],

	/**
	 * Home > Forum (simplified)
	 */
	forum: (forumName: string, forumSlug: string, isFeatured: boolean = false): BreadcrumbItem[] => [
		{ label: 'Home', href: '/', icon: <Home className="w-4 h-4" /> },
		{ label: 'Forums', href: '/forums' },
		{ label: isFeatured ? `🌟 ${forumName}` : forumName, href: `/forums/${forumSlug}` }
	],

	/**
	 * Home > Thread (for direct thread access)
	 */
	thread: (threadTitle: string, threadSlug: string): BreadcrumbItem[] => [
		{ label: 'Home', href: '/', icon: <Home className="w-4 h-4" /> },
		{ label: threadTitle, href: `/threads/${threadSlug}` }
	],

	/**
	 * Custom breadcrumb chain
	 */
	custom: (items: BreadcrumbItem[]): BreadcrumbItem[] => items,

	/**
	 * Smart breadcrumb generation - clean /forums/ structure:
	 * - Forums: Home > Forums > Forum Name
	 * - Subforums: Home > Forums > Forum Name > Subforum Name
	 */
	smartForum: (
		forum?: { name: string; slug: string; isFeatured?: boolean } | null,
		subforum?: { name: string; slug: string } | null
	): BreadcrumbItem[] => {
		// If no forum, fallback to generic Forums list
		if (!forum) {
			return [
				{ label: 'Home', href: '/', icon: <Home className="w-4 h-4" /> },
				{ label: 'Forums', href: '/forums' }
			];
		}

		const forumLabel = forum.isFeatured ? `🌟 ${forum.name}` : forum.name;

		// If we have both forum and subforum: Home > Forums > Forum > Subforum
		if (subforum) {
			return [
				{ label: 'Home', href: '/', icon: <Home className="w-4 h-4" /> },
				{ label: 'Forums', href: '/forums' },
				{ label: forumLabel, href: `/forums/${forum.slug}` },
				{ label: subforum.name, href: `/forums/${forum.slug}/${subforum.slug}` }
			];
		}

		// If only forum: Home > Forums > Forum
		return [
			{ label: 'Home', href: '/', icon: <Home className="w-4 h-4" /> },
			{ label: 'Forums', href: '/forums' },
			{ label: forumLabel, href: `/forums/${forum.slug}` }
		];
	},

	/**
	 * Smart thread breadcrumb generation - clean /forums/ structure:
	 * - Threads: Home > Forums > Forum > Thread
	 * - Subforum Threads: Home > Forums > Forum > Subforum > Thread
	 */
	threadInForum: (
		forum?: { name: string; slug: string; isFeatured?: boolean } | null,
		subforum?: { name: string; slug: string } | null,
		threadTitle?: string | null
	): BreadcrumbItem[] => {
		if (!threadTitle) {
			threadTitle = 'Thread';
		}

		// If forum, subforum, and thread exist: Home > Forums > Forum > Subforum > Thread
		if (forum && subforum) {
			const forumLabel = forum.isFeatured ? `🌟 ${forum.name}` : forum.name;
			return [
				{ label: 'Home', href: '/', icon: <Home className="w-4 h-4" /> },
				{ label: 'Forums', href: '/forums' },
				{ label: forumLabel, href: `/forums/${forum.slug}` },
				{ label: subforum.name, href: `/forums/${forum.slug}/${subforum.slug}` },
				{ label: threadTitle, href: '#' }
			];
		}

		// If only forum and thread exist: Home > Forums > Forum > Thread
		if (forum) {
			const forumLabel = forum.isFeatured ? `🌟 ${forum.name}` : forum.name;
			return [
				{ label: 'Home', href: '/', icon: <Home className="w-4 h-4" /> },
				{ label: 'Forums', href: '/forums' },
				{ label: forumLabel, href: `/forums/${forum.slug}` },
				{ label: threadTitle, href: '#' }
			];
		}

		// Fallback: Home > Thread
		return [
			{ label: 'Home', href: '/', icon: <Home className="w-4 h-4" /> },
			{ label: threadTitle, href: '#' }
		];
	}
};
