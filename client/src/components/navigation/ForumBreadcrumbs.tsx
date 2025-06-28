import React from 'react';
import { Link } from 'wouter';
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
							href={item.href}
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
	 * Home > Zone (simplified)
	 */
	zone: (zoneName: string, zoneSlug: string): BreadcrumbItem[] => [
		{ label: 'Home', href: '/', icon: <Home className="w-4 h-4" /> },
		{ label: stripLeadingEmoji(zoneName), href: `/zones/${zoneSlug}` }
	],

	/**
	 * Home > Zone > Forum (simplified)
	 */
	forum: (zoneName: string, zoneSlug: string, forumName: string): BreadcrumbItem[] => [
		{ label: 'Home', href: '/', icon: <Home className="w-4 h-4" /> },
		{ label: stripLeadingEmoji(zoneName), href: `/zones/${zoneSlug}` },
		{ label: forumName, href: '#' } // Current page, no link
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
	 * Smart breadcrumb generation - simplified and direct:
	 * - Zones: Home > Zone Name
	 * - Forums: Home > Zone Name > Forum Name
	 * - Subforums: Home > Zone Name > Forum Name > Subforum Name
	 */
	forumInZone: (
		zone?: { name: string; slug: string; isPrimary?: boolean } | null,
		forum?: { name: string; slug: string } | null
	): BreadcrumbItem[] => {
		// If no forum, fallback to generic Forums list
		if (!forum) {
			return [
				{ label: 'Home', href: '/', icon: <Home className="w-4 h-4" /> },
				{ label: 'Forums', href: '/forums' }
			];
		}

		// If we have both zone and forum: Home > Zone > Forum
		if (zone) {
			return [
				{ label: 'Home', href: '/', icon: <Home className="w-4 h-4" /> },
				{ label: stripLeadingEmoji(zone.name), href: `/zones/${zone.slug}` },
				{ label: forum.name, href: `/forums/${forum.slug}` }
			];
		}

		// If only forum (shouldn't happen based on rules): Home > Forum
		return [
			{ label: 'Home', href: '/', icon: <Home className="w-4 h-4" /> },
			{ label: forum.name, href: `/forums/${forum.slug}` }
		];
	},

	/**
	 * Smart thread breadcrumb generation - simplified and direct:
	 * - Threads: Home > Zone > Forum > Thread
	 * - Follows hierarchical structure without intermediate "Zones/Forums" labels
	 */
	threadInForum: (
		zone?: { name: string; slug: string; isPrimary?: boolean } | null,
		forum?: { name: string; slug: string } | null,
		threadTitle?: string | null
	): BreadcrumbItem[] => {
		if (!threadTitle) {
			threadTitle = 'Thread';
		}

		// If both zone and forum exist: Home > Zone > Forum > Thread
		if (zone && forum) {
			return [
				{ label: 'Home', href: '/', icon: <Home className="w-4 h-4" /> },
				{ label: stripLeadingEmoji(zone.name), href: `/zones/${zone.slug}` },
				{ label: forum.name, href: `/forums/${forum.slug}` },
				{ label: threadTitle, href: '#' }
			];
		}

		// If only forum exists: Home > Forum > Thread
		if (forum) {
			return [
				{ label: 'Home', href: '/', icon: <Home className="w-4 h-4" /> },
				{ label: forum.name, href: `/forums/${forum.slug}` },
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
