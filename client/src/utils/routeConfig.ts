import type { Role } from './roles';

export interface RouteConfig {
	path: string;
	component?: string;
	requireAuth?: boolean;
	minRole?: Role;
	exactRole?: Role;
	redirectTo?: string;
	title?: string;
	description?: string;
	children?: RouteConfig[];
}

// Centralized route protection configuration
export const routeConfig: RouteConfig[] = [
	// Public routes
	{
		path: '/',
		requireAuth: false,
		title: 'Home'
	},
	{
		path: '/auth',
		requireAuth: false,
		title: 'Authentication'
	},
	{
		path: '/auth/login',
		requireAuth: false,
		title: 'Login'
	},
	{
		path: '/auth/register',
		requireAuth: false,
		title: 'Register'
	},

	// Authenticated user routes
	{
		path: '/profile',
		requireAuth: true,
		title: 'Profile',
		children: [
			{
				path: '/profile/:username',
				requireAuth: false,
				title: 'User Profile'
			},
			{
				path: '/profile/settings',
				requireAuth: true,
				title: 'Profile Settings'
			}
		]
	},
	{
		path: '/wallet',
		requireAuth: true,
		title: 'Wallet'
	},
	{
		path: '/shop',
		requireAuth: true,
		title: 'Shop'
	},

	// Forum routes (mostly public with some auth requirements)
	{
		path: '/forum',
		requireAuth: false,
		title: 'Forum',
		children: [
			{
				path: '/forum/create',
				requireAuth: true,
				title: 'Create Thread'
			},
			{
				path: '/forum/:zone/:forum/create',
				requireAuth: true,
				title: 'Create Thread'
			}
		]
	},

	// Moderation routes
	{
		path: '/mod',
		minRole: 'moderator',
		title: 'Moderation Panel',
		redirectTo: '/',
		children: [
			{
				path: '/mod/reports',
				minRole: 'moderator',
				title: 'Content Reports'
			},
			{
				path: '/mod/users',
				minRole: 'moderator',
				title: 'User Management'
			},
			{
				path: '/mod/shoutbox',
				minRole: 'shoutbox_mod',
				title: 'Shoutbox Moderation'
			}
		]
	},

	// Admin routes
	{
		path: '/admin',
		minRole: 'admin',
		title: 'Admin Panel',
		redirectTo: '/',
		children: [
			{
				path: '/admin/users',
				minRole: 'admin',
				title: 'User Management'
			},
			{
				path: '/admin/forum',
				minRole: 'admin',
				title: 'Forum Management'
			},
			{
				path: '/admin/economy',
				minRole: 'admin',
				title: 'Economy Settings'
			},
			{
				path: '/admin/shop',
				minRole: 'admin',
				title: 'Shop Management'
			},
			// Super admin only routes
			{
				path: '/admin/system',
				exactRole: 'super_admin',
				title: 'System Settings',
				redirectTo: '/admin'
			},
			{
				path: '/admin/database',
				exactRole: 'super_admin',
				title: 'Database Management',
				redirectTo: '/admin'
			},
			{
				path: '/admin/roles',
				exactRole: 'super_admin',
				title: 'Role Management',
				redirectTo: '/admin'
			}
		]
	},

	// Development routes
	{
		path: '/dev',
		minRole: 'dev',
		title: 'Developer Tools',
		redirectTo: '/',
		children: [
			{
				path: '/dev/api',
				minRole: 'dev',
				title: 'API Testing'
			},
			{
				path: '/dev/components',
				minRole: 'dev',
				title: 'Component Library'
			}
		]
	}
];

// Helper function to find route config by path
export function findRouteConfig(path: string): RouteConfig | null {
	function searchRoutes(routes: RouteConfig[], targetPath: string): RouteConfig | null {
		for (const route of routes) {
			// Exact match
			if (route.path === targetPath) {
				return route;
			}

			// Dynamic route match (basic pattern matching)
			const routePattern = route.path.replace(/:[^/]+/g, '[^/]+');
			const routeRegex = new RegExp(`^${routePattern}$`);
			if (routeRegex.test(targetPath)) {
				return route;
			}

			// Search children
			if (route.children) {
				const found = searchRoutes(route.children, targetPath);
				if (found) return found;
			}
		}
		return null;
	}

	return searchRoutes(routeConfig, path);
}

// Get protection requirements for a route
export function getRouteProtection(path: string) {
	const config = findRouteConfig(path);
	if (!config) {
		return {
			requireAuth: false,
			minRole: undefined,
			exactRole: undefined,
			redirectTo: '/'
		};
	}

	return {
		requireAuth: config.requireAuth ?? false,
		minRole: config.minRole,
		exactRole: config.exactRole,
		redirectTo: config.redirectTo ?? '/'
	};
}
