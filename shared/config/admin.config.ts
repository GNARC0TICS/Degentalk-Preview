import { lazy } from 'react';
import type { ComponentType, LazyExoticComponent } from 'react';

export interface ModuleSettings {
	[key: string]: any;
}

export interface AdminModule {
	id: string;
	name: string;
	description?: string;
	icon: string; // Lucide icon name
	route: string;
	component: LazyExoticComponent<ComponentType<any>>;
	permissions: string[];
	enabled: boolean;
	order: number;
	settings?: ModuleSettings;
	subModules?: AdminModule[];
}

export interface AdminConfig {
	modules: AdminModule[];
	defaultPermissions: {
		superAdmin: string[];
		admin: string[];
		moderator: string[];
	};
	features: {
		auditLog: boolean;
		bulkOperations: boolean;
		advancedAnalytics: boolean;
		emailTemplates: boolean;
		backup: boolean;
	};
}

// Define all available permissions
export const ADMIN_PERMISSIONS = {
	// User Management
	'admin.users.view': 'View users',
	'admin.users.manage': 'Manage users',
	'admin.users.delete': 'Delete users',
	'admin.users.bulk': 'Bulk user operations',

	// XP System
	'admin.xp.view': 'View XP configuration',
	'admin.xp.manage': 'Manage XP levels and rewards',
	'admin.xp.grant': 'Grant XP to users',

	// Shop Management
	'admin.shop.view': 'View shop products',
	'admin.shop.manage': 'Manage shop products',
	'admin.shop.categories': 'Manage shop categories',
	'admin.shop.inventory': 'Manage inventory',

	// Wallet & Economy
	'admin.wallet.view': 'View wallet information',
	'admin.wallet.manage': 'Manage DGT balances',
	'admin.wallet.transactions': 'View transactions',
	'admin.wallet.grant': 'Grant DGT tokens',

	// Forum Management
	'admin.forum.view': 'View forum structure',
	'admin.forum.manage': 'Manage forums and categories',
	'admin.forum.moderate': 'Moderate content',

	// Reports & Analytics
	'admin.reports.view': 'View reports',
	'admin.reports.manage': 'Manage reports',
	'admin.analytics.view': 'View analytics',
	'admin.analytics.export': 'Export analytics data',

	// System
	'admin.system.view': 'View system settings',
	'admin.system.manage': 'Manage system settings',
	'admin.system.backup': 'Manage backups',
	'admin.system.audit': 'View audit logs'
} as const;

export type AdminPermission = keyof typeof ADMIN_PERMISSIONS;

// Admin module definitions
export const adminConfig: AdminConfig = {
	modules: [
		{
			id: 'dashboard',
			name: 'Dashboard',
			description: 'Admin overview and statistics',
			icon: 'LayoutDashboard',
			route: '/admin',
			component: lazy(() => import('@/pages/admin/index')),
			permissions: ['admin.system.view'],
			enabled: true,
			order: 0
		},
		{
			id: 'users',
			name: 'User Management',
			description: 'Manage users, roles, and permissions',
			icon: 'Users',
			route: '/admin/users',
			component: lazy(() => import('@/pages/admin/users')),
			permissions: ['admin.users.view'],
			enabled: true,
			order: 1,
			settings: {
				enableBulkOperations: true,
				maxBulkSelection: 100
			},
			subModules: [
				{
					id: 'roles',
					name: 'Roles',
					icon: 'Shield',
					route: '/admin/roles',
					component: lazy(() => import('@/pages/admin/roles')),
					permissions: ['admin.users.manage'],
					enabled: true,
					order: 0
				},
				{
					id: 'permissions',
					name: 'Permissions',
					icon: 'Key',
					route: '/admin/permissions',
					component: lazy(() => import('@/pages/admin/permissions/index')),
					permissions: ['admin.users.manage'],
					enabled: true,
					order: 1
				}
			]
		},
		{
			id: 'xp-system',
			name: 'XP System',
			description: 'Configure experience points and levels',
			icon: 'TrendingUp',
			route: '/admin/xp-system',
			component: lazy(() => import('@/pages/admin/xp-system')),
			permissions: ['admin.xp.view'],
			enabled: true,
			order: 2,
			settings: {
				maxLevel: 100,
				xpMultiplier: 1.0,
				enableSeasonalEvents: true
			}
		},
		{
			id: 'wallets',
			name: 'Wallet Management',
			description: 'Manage DGT tokens and transactions',
			icon: 'Wallet',
			route: '/admin/wallets',
			component: lazy(() => import('@/pages/admin/wallets/index')),
			permissions: ['admin.wallet.view'],
			enabled: true,
			order: 3,
			subModules: [
				{
					id: 'treasury',
					name: 'Treasury',
					icon: 'Landmark',
					route: '/admin/treasury',
					component: lazy(() => import('@/pages/admin/treasury')),
					permissions: ['admin.wallet.manage'],
					enabled: true,
					order: 0
				},
				{
					id: 'dgt-packages',
					name: 'DGT Packages',
					icon: 'Package',
					route: '/admin/dgt-packages',
					component: lazy(() => import('@/pages/admin/dgt-packages')),
					permissions: ['admin.wallet.manage'],
					enabled: true,
					order: 1
				}
			]
		},
		{
			id: 'shop',
			name: 'Shop Management',
			description: 'Manage products and inventory',
			icon: 'ShoppingBag',
			route: '/admin/shop',
			component: lazy(() => import('@/pages/admin/shop/index')),
			permissions: ['admin.shop.view'],
			enabled: true,
			order: 4,
			settings: {
				enableInventoryTracking: true,
				lowStockThreshold: 10
			},
			subModules: [
				{
					id: 'shop-categories',
					name: 'Categories',
					icon: 'FolderTree',
					route: '/admin/shop/categories',
					component: lazy(() => import('@/pages/admin/shop/categories')),
					permissions: ['admin.shop.categories'],
					enabled: true,
					order: 0
				}
			]
		},
		{
			id: 'forum',
			name: 'Forum Structure',
			description: 'Manage forums and categories',
			icon: 'MessageSquare',
			route: '/admin/forum-structure',
			component: lazy(() => import('@/pages/admin/forum-structure')),
			permissions: ['admin.forum.view'],
			enabled: true,
			order: 5
		},
		{
			id: 'reports',
			name: 'Reports',
			description: 'User reports and moderation',
			icon: 'Flag',
			route: '/admin/reports',
			component: lazy(() => import('@/pages/admin/reports/index')),
			permissions: ['admin.reports.view'],
			enabled: true,
			order: 6
		},
		{
			id: 'analytics',
			name: 'Analytics',
			description: 'Platform analytics and insights',
			icon: 'BarChart3',
			route: '/admin/stats',
			component: lazy(() => import('@/pages/admin/stats/index')),
			permissions: ['admin.analytics.view'],
			enabled: true,
			order: 7,
			subModules: [
				{
					id: 'system-analytics',
					name: 'System Analytics',
					icon: 'Activity',
					route: '/admin/system-analytics',
					component: lazy(() => import('@/pages/admin/system-analytics')),
					permissions: ['admin.analytics.view'],
					enabled: true,
					order: 0
				}
			]
		},
		{
			id: 'cosmetics',
			name: 'Cosmetics',
			description: 'Manage avatar frames, stickers, and animations',
			icon: 'Sparkles',
			route: '/admin/avatar-frames',
			component: lazy(() => import('@/pages/admin/avatar-frames')),
			permissions: ['admin.shop.manage'],
			enabled: true,
			order: 8,
			subModules: [
				{
					id: 'stickers',
					name: 'Stickers',
					icon: 'Sticker',
					route: '/admin/stickers',
					component: lazy(() => import('@/pages/admin/stickers')),
					permissions: ['admin.shop.manage'],
					enabled: true,
					order: 0
				},
				{
					id: 'animations',
					name: 'Animations',
					icon: 'Zap',
					route: '/admin/ui/animations',
					component: lazy(() => import('@/pages/admin/ui/animations')),
					permissions: ['admin.shop.manage'],
					enabled: true,
					order: 1
				},
				{
					id: 'emojis',
					name: 'Emojis',
					icon: 'Smile',
					route: '/admin/emojis',
					component: lazy(() => import('@/pages/admin/emojis')),
					permissions: ['admin.shop.manage'],
					enabled: true,
					order: 2
				}
			]
		},
		{
			id: 'settings',
			name: 'Settings',
			description: 'Platform configuration',
			icon: 'Settings',
			route: '/admin/settings',
			component: lazy(() => import('@/pages/admin/social-config')),
			permissions: ['admin.system.view'],
			enabled: true,
			order: 9,
			subModules: [
				{
					id: 'feature-flags',
					name: 'Feature Flags',
					icon: 'ToggleLeft',
					route: '/admin/feature-flags',
					component: lazy(() => import('@/pages/admin/feature-flags')),
					permissions: ['admin.system.manage'],
					enabled: true,
					order: 0
				},
				{
					id: 'announcements',
					name: 'Announcements',
					icon: 'Megaphone',
					route: '/admin/announcements',
					component: lazy(() => import('@/pages/admin/announcements/index')),
					permissions: ['admin.system.manage'],
					enabled: true,
					order: 1
				}
			]
		}
	],

	defaultPermissions: {
		superAdmin: Object.keys(ADMIN_PERMISSIONS) as AdminPermission[],
		admin: [
			'admin.users.view',
			'admin.users.manage',
			'admin.xp.view',
			'admin.xp.manage',
			'admin.shop.view',
			'admin.shop.manage',
			'admin.wallet.view',
			'admin.forum.view',
			'admin.forum.manage',
			'admin.reports.view',
			'admin.reports.manage',
			'admin.analytics.view',
			'admin.system.view'
		] as AdminPermission[],
		moderator: [
			'admin.users.view',
			'admin.forum.view',
			'admin.forum.moderate',
			'admin.reports.view',
			'admin.reports.manage'
		] as AdminPermission[]
	},

	features: {
		auditLog: true,
		bulkOperations: true,
		advancedAnalytics: true,
		emailTemplates: true,
		backup: true
	}
};

// Helper function to get module by ID
export function getAdminModuleById(moduleId: string): AdminModule | undefined {
	function findModule(modules: AdminModule[]): AdminModule | undefined {
		for (const module of modules) {
			if (module.id === moduleId) return module;
			if (module.subModules) {
				const found = findModule(module.subModules);
				if (found) return found;
			}
		}
		return undefined;
	}

	return findModule(adminConfig.modules);
}

// Helper function to get all modules flattened
export function getAllAdminModules(): AdminModule[] {
	const allModules: AdminModule[] = [];

	function collectModules(modules: AdminModule[]) {
		for (const module of modules) {
			allModules.push(module);
			if (module.subModules) {
				collectModules(module.subModules);
			}
		}
	}

	collectModules(adminConfig.modules);
	return allModules;
}
