import React from 'react';
import { Link } from 'wouter';
import { Home, ChevronRight } from 'lucide-react';
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
						<Link href={item.href}>
							<a className="flex items-center hover:text-white transition-colors">
								{item.icon && <span className="mr-1">{item.icon}</span>}
								{item.label}
							</a>
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
	 * Home > Forums > Zone
	 */
	zone: (zoneName: string, zoneSlug: string): BreadcrumbItem[] => [
		{ label: 'Home', href: '/', icon: <Home className="w-4 h-4" /> },
		{ label: 'Forums', href: '/forums' },
		{ label: zoneName, href: `/zones/${zoneSlug}` }
	],

	/**
	 * Home > Forums > Zone > Forum
	 */
	forum: (zoneName: string, zoneSlug: string, forumName: string): BreadcrumbItem[] => [
		{ label: 'Home', href: '/', icon: <Home className="w-4 h-4" /> },
		{ label: 'Forums', href: '/forums' },
		{ label: zoneName, href: `/zones/${zoneSlug}` },
		{ label: forumName, href: '#' } // Current page, no link
	],

	/**
	 * Home > Forums > Thread
	 */
	thread: (threadTitle: string, threadSlug: string): BreadcrumbItem[] => [
		{ label: 'Home', href: '/', icon: <Home className="w-4 h-4" /> },
		{ label: 'Forums', href: '/forums' },
		{ label: threadTitle, href: `/threads/${threadSlug}` }
	],

	/**
	 * Custom breadcrumb chain
	 */
	custom: (items: BreadcrumbItem[]): BreadcrumbItem[] => items
};
