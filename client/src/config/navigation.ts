import React from 'react';
import {
	Home,
	MessageSquare,
	Target,
	ShoppingCart,
	Trophy,
	User,
	Shield,
	Settings,
	Link2,
	Wallet,
	LogOut
} from 'lucide-react';

// Navigation item configuration interface
export interface NavItemConfig {
	label: string;
	href: string;
	icon: React.ReactElement;
	requiresAuth?: boolean;
	roles?: Array<'admin' | 'mod' | 'user'>;
	mobileOnly?: boolean;
	prefetch?: boolean;
	analyticsLabel?: string;
}

// User menu item configuration
export interface UserMenuItemConfig {
	label: string;
	href?: string;
	icon: React.ReactElement;
	onClick?: () => void;
	requiresAuth?: boolean;
	roles?: Array<'admin' | 'mod' | 'user'>;
	separator?: boolean;
}

// Primary navigation configuration
export const primaryNavigation: NavItemConfig[] = [
	{
		label: 'Home',
		href: '/',
		icon: React.createElement(Home, { className: 'h-4 w-4' }),
		prefetch: true,
		analyticsLabel: 'nav_home'
	},
	{
		label: 'Forum',
		href: '/forums',
		icon: React.createElement(MessageSquare, { className: 'h-4 w-4' }),
		prefetch: true,
		analyticsLabel: 'nav_forum'
	},
	{
		label: 'Missions',
		href: '/missions',
		icon: React.createElement(Target, { className: 'h-4 w-4' }),
		requiresAuth: true,
		analyticsLabel: 'nav_missions'
	},
	{
		label: 'Shop',
		href: '/shop',
		icon: React.createElement(ShoppingCart, { className: 'h-4 w-4' }),
		analyticsLabel: 'nav_shop'
	},
	{
		label: 'Leaderboard',
		href: '/leaderboard',
		icon: React.createElement(Trophy, { className: 'h-4 w-4' }),
		analyticsLabel: 'nav_leaderboard'
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
		href: `/profile/${username}`,
		icon: React.createElement(User, { className: 'mr-2 h-4 w-4' }),
		requiresAuth: true
	},
	{
		label: 'Wallet',
		icon: React.createElement(Wallet, { className: 'mr-2 h-4 w-4' }),
		onClick: onWalletClick,
		requiresAuth: true
	},
	{
		label: 'Whispers (DMs)',
		href: '/whispers',
		icon: React.createElement(MessageSquare, { className: 'mr-2 h-4 w-4' }),
		requiresAuth: true
	},
	{
		label: 'Settings',
		href: '/preferences',
		icon: React.createElement(Settings, { className: 'mr-2 h-4 w-4' }),
		requiresAuth: true
	},
	{
		label: 'Referrals',
		href: '/preferences?tab=referrals',
		icon: React.createElement(Link2, { className: 'mr-2 h-4 w-4' }),
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
					icon: React.createElement(Shield, { className: 'mr-2 h-4 w-4' }),
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
					icon: React.createElement(Shield, { className: 'mr-2 h-4 w-4' }),
					roles: ['mod' as const],
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
		icon: React.createElement(LogOut, { className: 'mr-2 h-4 w-4' }),
		onClick: onLogout,
		requiresAuth: true
	}
];

// Filter navigation items based on auth and role requirements
export const filterNavItems = (
	items: NavItemConfig[],
	isAuthenticated: boolean,
	userRoles: Array<'admin' | 'mod' | 'user'> = ['user']
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
