import React from 'react';
import { IconRenderer } from '@/components/icons/iconRenderer';

// Navigation item configuration interface
export interface NavItemConfig {
	label: string;
	href: string;
	icon: React.ReactElement;
	requiresAuth?: boolean;
	roles?: Array<'admin' | 'moderator' | 'user'>;
	mobileOnly?: boolean;
	prefetch?: boolean;
	analyticsLabel?: string;
	comingSoon?: boolean;
}

// User menu item configuration
export interface UserMenuItemConfig {
	label: string;
	href?: string;
	icon: React.ReactElement;
	onClick?: () => void;
	requiresAuth?: boolean;
	roles?: Array<'admin' | 'moderator' | 'user'>;
	separator?: boolean;
}

// Extend the Window interface for Google Analytics
declare global {
	interface Window {
		gtag?: (
			command: 'event',
			action: string,
			params: {
				event_category: string;
				event_label: string;
				page_path: string;
			}
		) => void;
	}
}

// Primary navigation configuration
export const primaryNavigation: NavItemConfig[] = [
	{
		label: 'Home',
		href: '/',
		icon: React.createElement(IconRenderer, { icon: 'home', size: 16, className: 'h-4 w-4' }),
		prefetch: true,
		analyticsLabel: 'nav_home'
	},
	{
		label: 'About',
		href: '/about',
		icon: React.createElement(IconRenderer, { icon: 'document', size: 16, className: 'h-4 w-4' }),
		analyticsLabel: 'nav_about'
	},
	{
		label: 'Forum',
		href: '/forums',
		icon: React.createElement(IconRenderer, { icon: 'forum', size: 16, className: 'h-4 w-4' }),
		prefetch: true,
		analyticsLabel: 'nav_forum',
		comingSoon: true
	},
	{
		label: 'Shop',
		href: '/shop',
		icon: React.createElement(IconRenderer, { icon: 'cart', size: 16, className: 'h-4 w-4' }),
		analyticsLabel: 'nav_shop',
		comingSoon: true
	},
	{
		label: 'Leaderboard',
		href: '/leaderboard',
		icon: React.createElement(IconRenderer, {
			icon: 'leaderboard',
			size: 16,
			className: 'h-4 w-4'
		}),
		analyticsLabel: 'nav_leaderboard',
		comingSoon: true
	}
];

// User dropdown menu configuration
export const createUserMenuItems = (
	username: string,
	isAdmin: boolean = false,
	isModerator: boolean = false,
	onWalletClick?: () => void,
	onLogout?: () => void
): UserMenuItemConfig[] => [
	{
		label: 'Profile',
		href: '/profile', // Using static profile page for demo
		icon: React.createElement(IconRenderer, {
			icon: 'profile',
			size: 16,
			className: 'mr-2 h-4 w-4'
		}),
		requiresAuth: true
	},
	{
		label: 'About',
		href: '/about',
		icon: React.createElement(IconRenderer, {
			icon: 'document',
			size: 16,
			className: 'mr-2 h-4 w-4'
		}),
		requiresAuth: true
	},
	{
		label: 'Progress',
		href: '/progress',
		icon: React.createElement(IconRenderer, {
			icon: 'leaderboard',
			size: 16,
			className: 'mr-2 h-4 w-4'
		}),
		requiresAuth: true
	},
	{
		label: 'Wallet',
		icon: React.createElement(IconRenderer, {
			icon: 'wallet',
			size: 16,
			className: 'mr-2 h-4 w-4'
		}),
		...(onWalletClick && { onClick: onWalletClick }),
		requiresAuth: true
	},
	{
		label: 'Whispers (DMs)',
		href: '/whispers',
		icon: React.createElement(IconRenderer, {
			icon: 'message',
			size: 16,
			className: 'mr-2 h-4 w-4'
		}),
		requiresAuth: true
	},
	{
		label: 'Settings',
		href: '/preferences',
		icon: React.createElement(IconRenderer, {
			icon: 'settings',
			size: 16,
			className: 'mr-2 h-4 w-4'
		}),
		requiresAuth: true
	},
	{
		label: 'Referrals',
		href: '/preferences?tab=referrals',
		icon: React.createElement(IconRenderer, { icon: 'link', size: 16, className: 'mr-2 h-4 w-4' }),
		requiresAuth: true
	},
	{
		label: 'separator',
		separator: true,
		icon: React.createElement('div'),
		requiresAuth: true
	},
	...(isAdmin
		? [
				{
					label: 'Admin Panel',
					href: '/admin',
					icon: React.createElement(IconRenderer, {
						icon: 'admin',
						size: 16,
						className: 'mr-2 h-4 w-4'
					}),
					roles: ['admin' as const],
					requiresAuth: true
				}
			]
		: []),
	...(isModerator && !isAdmin
		? [
				{
					label: 'Moderator Panel',
					href: '/mod',
					icon: React.createElement(IconRenderer, {
						icon: 'admin',
						size: 16,
						className: 'mr-2 h-4 w-4'
					}),
					roles: ['moderator' as const],
					requiresAuth: true
				}
			]
		: []),
	{
		label: 'separator2',
		separator: true,
		icon: React.createElement('div'),
		requiresAuth: true
	},
	{
		label: 'Log out',
		icon: React.createElement(IconRenderer, {
			icon: 'logout',
			size: 16,
			className: 'mr-2 h-4 w-4'
		}),
		...(onLogout && { onClick: onLogout }),
		requiresAuth: true
	}
];

// Filter navigation items based on auth and role requirements
export const filterNavItems = (
	items: NavItemConfig[],
	isAuthenticated: boolean,
	userRoles: Array<'admin' | 'moderator' | 'user'> = ['user']
): NavItemConfig[] => {
	return items.filter((item) => {
		// Check auth requirement
		if (item.requiresAuth && !isAuthenticated) {
			return false;
		}

		// Check role requirement
		if (item.roles && item.roles.length > 0) {
			return item.roles.some((role) => userRoles.includes(role));
		}

		return true;
	});
};

// Analytics helpers
export const trackNavigation = (analyticsLabel: string, href: string) => {
	if (typeof window !== 'undefined' && window.gtag) {
		window.gtag('event', 'navigation_click', {
			event_category: 'navigation',
			event_label: analyticsLabel,
			page_path: href
		});
	}
};
