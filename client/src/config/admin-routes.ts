// Define types for our navigation structure
export type AdminRoutePermission = 'admin' | 'moderator' | 'treasury_manager' | 'content_manager';

// Define enum-like object for permissions to use in Object.values()
export const AdminRoutePermission = {
	ADMIN: 'admin' as const,
	MODERATOR: 'moderator' as const,
	TREASURY_MANAGER: 'treasury_manager' as const,
	CONTENT_MANAGER: 'content_manager' as const
};

// Define icon types using string literals to avoid JSX in this file
export type AdminRouteIcon =
	| 'layout-dashboard'
	| 'users'
	| 'tag'
	| 'settings'
	| 'megaphone'
	| 'message-square'
	| 'bar-chart'
	| 'flag'
	| 'shopping-cart'
	| 'file-text'
	| 'image'
	| 'bell'
	| 'wallet'
	| 'dollar-sign'
	| 'database'
	| 'activity'
	| 'shield'
	| 'eye'
	| 'credit-card'
	| 'panel-left'
	| 'globe'
	| 'pie-chart'
	| 'lock'
	| 'smile'
	| 'trophy'
	| 'bar-chart-2'
	| 'award'
	| 'edit-3';

export interface AdminRoute {
	path: string;
	label: string;
	icon: AdminRouteIcon;
	permissions: AdminRoutePermission[];
	description?: string;
	badge?: string;
}

export interface AdminRouteGroup {
	id: string;
	label: string;
	icon: AdminRouteIcon;
	routes: AdminRoute[];
	permissions: AdminRoutePermission[];
}

// Define the admin route groups
export const adminRouteGroups: AdminRouteGroup[] = [
	{
		id: 'overview',
		label: 'Overview',
		icon: 'layout-dashboard',
		permissions: ['admin', 'moderator'],
		routes: [
			{
				path: '/admin',
				label: 'Dashboard',
				icon: 'layout-dashboard',
				permissions: ['admin', 'moderator'],
				description: 'Platform overview and analytics'
			},
			{
				path: '/admin/stats',
				label: 'Analytics',
				icon: 'bar-chart',
				permissions: ['admin'],
				description: 'Detailed platform statistics'
			},
			{
				path: '/admin/activity',
				label: 'Activity Log',
				icon: 'activity',
				permissions: ['admin', 'moderator'],
				description: 'Recent platform activity'
			}
		]
	},
	{
		id: 'community',
		label: 'Community',
		icon: 'users',
		permissions: ['admin', 'moderator'],
		routes: [
			{
				path: '/admin/users',
				label: 'Users',
				icon: 'users',
				permissions: ['admin', 'moderator'],
				description: 'Manage user accounts'
			},
			{
				path: '/admin/user-groups',
				label: 'User Groups',
				icon: 'shield',
				permissions: ['admin'],
				description: 'Manage user roles and permissions'
			},
			{
				path: '/admin/forum-management',
				label: 'Forum Structure',
				icon: 'globe',
				permissions: ['admin'],
				description: 'Manage zones, categories, and forums',
				badge: 'new'
			},
			{
				path: '/admin/categories',
				label: 'Categories',
				icon: 'tag',
				permissions: ['admin'],
				description: 'Manage forum categories'
			},
			{
				path: '/admin/prefixes',
				label: 'Prefixes',
				icon: 'flag',
				permissions: ['admin'],
				description: 'Manage thread prefixes'
			},
			{
				path: '/admin/threads',
				label: 'Content',
				icon: 'message-square',
				permissions: ['admin', 'moderator'],
				description: 'Manage forum threads and posts'
			},
			{
				path: '/admin/emojis',
				label: 'Emojis',
				icon: 'smile',
				permissions: ['admin'],
				description: 'Manage custom emojis'
			},
			{
				path: '/admin/announcements',
				label: 'Announcements',
				icon: 'megaphone',
				permissions: ['admin', 'moderator'],
				description: 'Manage platform announcements'
			},
			{
				path: '/admin/reports',
				label: 'Reports',
				icon: 'flag',
				permissions: ['admin', 'moderator'],
				description: 'Handle reported content',
				badge: 'new'
			}
		]
	},
	{
		id: 'economy',
		label: 'Economy',
		icon: 'dollar-sign',
		permissions: ['admin', 'treasury_manager'],
		routes: [
			{
				path: '/admin/treasury',
				label: 'Treasury',
				icon: 'wallet',
				permissions: ['admin', 'treasury_manager'],
				description: 'Manage platform treasury'
			},
			{
				path: '/admin/wallets',
				label: 'Wallets',
				icon: 'wallet',
				permissions: ['admin', 'treasury_manager'],
				description: 'Manage user wallets'
			},
			{
				path: '/admin/transactions',
				label: 'Transactions',
				icon: 'credit-card',
				permissions: ['admin', 'treasury_manager'],
				description: 'View transaction history'
			},
			{
				path: '/admin/store',
				label: 'Store',
				icon: 'shopping-cart',
				permissions: ['admin'],
				description: 'Manage store products'
			},
			{
				path: '/admin/orders',
				label: 'Orders',
				icon: 'shopping-cart',
				permissions: ['admin'],
				description: 'View and manage store orders'
			}
		]
	},
	{
		id: 'xp',
		label: 'XP System',
		icon: 'trophy',
		permissions: ['admin'],
		routes: [
			{
				path: '/admin/xp/settings',
				label: 'XP Settings',
				icon: 'settings',
				permissions: ['admin'],
				description: 'Configure XP system settings'
			},
			{
				path: '/admin/xp/levels',
				label: 'Levels',
				icon: 'bar-chart-2',
				permissions: ['admin'],
				description: 'Manage XP levels and rewards'
			},
			{
				path: '/admin/xp/badges',
				label: 'Badges',
				icon: 'award',
				permissions: ['admin'],
				description: 'Manage user badges'
			},
			{
				path: '/admin/xp/titles',
				label: 'Titles',
				icon: 'tag',
				permissions: ['admin'],
				description: 'Manage user titles'
			},
			{
				path: '/admin/xp/adjust',
				label: 'Adjust XP',
				icon: 'edit-3',
				permissions: ['admin'],
				description: 'Adjust user XP values'
			}
		]
	},
	{
		id: 'config',
		label: 'Config',
		icon: 'database',
		permissions: ['admin'],
		routes: [
			{
				path: '/admin/config/tags',
				label: 'Tag Config',
				icon: 'tag',
				permissions: ['admin'],
				description: 'Edit forum tag styles'
			},
			{
				path: '/admin/config/xp',
				label: 'XP Config',
				icon: 'trophy',
				permissions: ['admin'],
				description: 'Configure XP actions and titles'
			},
			{
				path: '/admin/config/zones',
				label: 'Forum Zones',
				icon: 'globe',
				permissions: ['admin'],
				description: 'Manage forum zone registry'
			}
		]
	},
	{
		id: 'system',
		label: 'System',
		icon: 'settings',
		permissions: ['admin'],
		routes: [
			{
				path: '/admin/platform-settings',
				label: 'Settings',
				icon: 'settings',
				permissions: ['admin'],
				description: 'Platform configuration'
			},
			{
				path: '/admin/database-config',
				label: 'Database Config',
				icon: 'database',
				permissions: ['admin'],
				description: 'Database configuration and migration management'
			},
			{
				path: '/admin/themes',
				label: 'Themes',
				icon: 'panel-left',
				permissions: ['admin'],
				description: 'Manage site appearance'
			},
			{
				path: '/admin/seo',
				label: 'SEO',
				icon: 'globe',
				permissions: ['admin'],
				description: 'Search engine optimization'
			},
			{
				path: '/admin/feature-flags',
				label: 'Feature Flags',
				icon: 'flag',
				permissions: ['admin'],
				description: 'Toggle platform features'
			},
			{
				path: '/admin/beta-features',
				label: 'Beta Features',
				icon: 'lock',
				permissions: ['admin'],
				description: 'Manage beta access features'
			},
			{
				path: '/admin/media',
				label: 'Media Library',
				icon: 'image',
				permissions: ['admin'],
				description: 'Manage uploaded media'
			}
		]
	}
];

// Extract all routes for flat navigation
export const allAdminRoutes: AdminRoute[] = adminRouteGroups.flatMap((group) => group.routes);

// Create a ROUTES object for direct reference
export const ROUTES = allAdminRoutes.reduce((acc: Record<string, string>, route) => {
	// Extract the last part of the path to use as the key
	const key = route.path.split('/').pop() || '';
	// If the key is empty (root admin path), use 'dashboard'
	const routeKey = key === '' ? 'dashboard' : key;
	acc[routeKey] = route.path;
	return acc;
}, {});

// Function to filter routes based on user permissions
export function getRoutesForPermissions(permissions: AdminRoutePermission[]): AdminRoute[] {
	return allAdminRoutes.filter((route) =>
		route.permissions.some((permission) => permissions.includes(permission))
	);
}

// Function to filter route groups based on user permissions
export function getRouteGroupsForPermissions(
	permissions: AdminRoutePermission[]
): AdminRouteGroup[] {
	return adminRouteGroups
		.filter((group) => group.permissions.some((permission) => permissions.includes(permission)))
		.map((group) => ({
			...group,
			routes: group.routes.filter((route) =>
				route.permissions.some((permission) => permissions.includes(permission))
			)
		}));
}

// Define specific routes for moderators
export const moderatorRouteGroups: AdminRouteGroup[] = [
	{
		id: 'overview',
		label: 'Overview',
		icon: 'layout-dashboard',
		permissions: ['moderator'],
		routes: [
			{
				path: '/admin',
				label: 'Dashboard',
				icon: 'layout-dashboard',
				permissions: ['moderator'],
				description: 'Moderation overview'
			},
			{
				path: '/admin/activity',
				label: 'Activity Log',
				icon: 'activity',
				permissions: ['moderator'],
				description: 'Recent platform activity'
			}
		]
	},
	{
		id: 'moderation',
		label: 'Moderation',
		icon: 'shield',
		permissions: ['moderator'],
		routes: [
			{
				path: '/admin/threads',
				label: 'Content',
				icon: 'message-square',
				permissions: ['moderator'],
				description: 'Moderate forum threads and posts'
			},
			{
				path: '/admin/reports',
				label: 'Reports',
				icon: 'flag',
				permissions: ['moderator'],
				description: 'Handle reported content'
			},
			{
				path: '/admin/users',
				label: 'Users',
				icon: 'users',
				permissions: ['moderator'],
				description: 'Limited user management'
			},
			{
				path: '/admin/announcements',
				label: 'Announcements',
				icon: 'megaphone',
				permissions: ['moderator'],
				description: 'Manage platform announcements'
			}
		]
	}
];
