import { lazy } from 'react';
import type { ComponentType, LazyExoticComponent } from 'react';

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

	// Wallet & Economy (New granular permissions)
	'admin.wallet.view': 'View wallet information',
	'admin.wallet.manage': 'Manage DGT balances',
	'admin.wallet.transactions': 'View transactions',
	'admin.wallet.grant': 'Grant DGT tokens',
	'admin.wallet.user-wallets.view': 'View individual user wallets',
	'admin.wallet.user-wallets.manage': 'Manage individual user wallets (credit/debit crypto/DGT)',
	'admin.wallet.treasury.view': 'View platform treasury balances',
	'admin.wallet.treasury.manage': 'Manage platform treasury (manual transfers)',

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
	'admin.system.audit': 'View audit logs',

	// Database Editor
	'admin.database.view': 'View database tables',
	'admin.database.edit': 'Edit database records',
	'admin.database.export': 'Export database data'
} as const;

export type AdminPermission = keyof typeof ADMIN_PERMISSIONS;

export interface AdminModuleV2 {
	slug: string; // unique slug, used as key
	label: string;
	icon: string; // lucide icon name (e.g., 'layout-dashboard', 'users')
	permission: AdminPermission; // e.g. 'admin:users:view'
	component: LazyExoticComponent<ComponentType<any>>;
	path: string; // URL path for React-Router (absolute)
	children?: AdminModuleV2[];
	disabled?: boolean; // Optional: to temporarily disable a module
	
	// Additional properties for backward compatibility
	id?: string; // Can be same as slug
	name?: string; // Can be same as label
	enabled?: boolean; // Inverse of disabled
	settings?: {
		status?: string;
		maintenance?: boolean;
		beta?: boolean;
	};
	order?: number; // Display order
	route?: string; // Can be same as path
	description?: string; // Module description
}

// Core admin modules. This is the source of truth for admin navigation and permissions.
export const adminModulesV2: AdminModuleV2[] = [
	{
		slug: 'dashboard',
		label: 'Dashboard',
		icon: 'layout-dashboard',
		permission: 'admin.system.view',
		path: '/admin',
		component: lazy(() => import('@/features/admin/dashboard/AdminDashboard'))
	},
	{
		slug: 'users',
		label: 'Users',
		icon: 'users',
		permission: 'admin.users.view',
		path: '/admin/users',
		component: lazy(() => import('@/features/admin/users/UserManagement')),
		children: [
			{
				slug: 'roles',
				label: 'Roles',
				icon: 'shield',
				permission: 'admin.users.manage',
				path: '/admin/users/roles',
				component: lazy(() => import('@/features/admin/users/Roles'))
			},
			{
				slug: 'permissions',
				label: 'Permissions',
				icon: 'key',
				permission: 'admin.users.manage',
				path: '/admin/users/permissions',
				component: lazy(() => import('@/features/admin/users/permissions/index'))
			}
		]
	},
	{
		slug: 'economy',
		label: 'Economy',
		icon: 'dollar-sign',
		permission: 'admin.wallet.view',
		path: '/admin/economy', // Top-level path for economy section
		component: lazy(() => import('@/features/admin/wallet/EconomyDashboard')), // New dashboard for economy overview
		children: [
			{
				slug: 'user-wallets',
				label: 'User Wallets',
				icon: 'wallet',
				permission: 'admin.wallet.user-wallets.view',
				path: '/admin/economy/user-wallets',
				component: lazy(() => import('@/features/admin/wallet/UserWalletManager'))
			},
			{
				slug: 'platform-treasury',
				label: 'Platform Treasury',
				icon: 'landmark',
				permission: 'admin.wallet.treasury.view',
				path: '/admin/economy/platform-treasury',
				component: lazy(() => import('@/features/admin/wallet/PlatformTreasury'))
			},
			{
				slug: 'dgt-packages',
				label: 'DGT Packages',
				icon: 'package',
				permission: 'admin.wallet.manage',
				path: '/admin/economy/dgt-packages',
				component: lazy(() => import('@/features/admin/economy/DgtPackages')) // Assuming this will be moved under economy views
			}
		]
	},
	{
		slug: 'xp',
		label: 'XP System',
		icon: 'trophy',
		permission: 'admin.xp.view',
		path: '/admin/xp-system',
		component: lazy(() => import('@/features/admin/xp/XpSystem'))
	},
	{
		slug: 'shop',
		label: 'Shop Management',
		icon: 'shopping-bag',
		permission: 'admin.shop.view',
		path: '/admin/shop',
		component: lazy(() => import('@/features/admin/shop/ShopManagement/index')),
		children: [
			{
				slug: 'shop-categories',
				label: 'Categories',
				icon: 'folder-tree',
				permission: 'admin.shop.categories',
				path: '/admin/shop/categories',
				component: lazy(() => import('@/features/admin/shop/ShopCategories'))
			}
		]
	},
	{
		slug: 'forum',
		label: 'Forum Structure',
		icon: 'message-square',
		permission: 'admin.forum.view',
		path: '/admin/forum-structure',
		component: lazy(() => import('@/features/admin/forum/ForumStructure'))
	},
	{
		slug: 'reports',
		label: 'Reports',
		icon: 'flag',
		permission: 'admin.reports.view',
		path: '/admin/reports',
		component: lazy(() => import('@/features/admin/reports/Reports/index'))
	},
	{
		slug: 'analytics',
		label: 'Analytics',
		icon: 'bar-chart-3',
		permission: 'admin.analytics.view',
		path: '/admin/analytics',
		component: lazy(() => import('@/features/admin/analytics/AnalyticsDashboard/index')),
		children: [
			{
				slug: 'system-analytics',
				label: 'System Analytics',
				icon: 'activity',
				permission: 'admin.analytics.view',
				path: '/admin/analytics/system',
				component: lazy(() => import('@/features/admin/analytics/SystemAnalytics'))
			}
		]
	},
	{
		slug: 'cosmetics',
		label: 'Cosmetics',
		icon: 'sparkles',
		permission: 'admin.shop.manage',
		path: '/admin/cosmetics',
		component: lazy(() => import('@/features/admin/cosmetics/CosmeticsDashboard')),
		children: [
			{
				slug: 'stickers',
				label: 'Stickers',
				icon: 'sticker',
				permission: 'admin.shop.manage',
				path: '/admin/cosmetics/stickers',
				component: lazy(() => import('@/features/admin/cosmetics/Stickers'))
			},
			{
				slug: 'animations',
				label: 'Animations',
				icon: 'zap',
				permission: 'admin.shop.manage',
				path: '/admin/cosmetics/animations',
				component: lazy(() => import('@/features/admin/cosmetics/Animations'))
			},
			{
				slug: 'emojis',
				label: 'Emojis',
				icon: 'smile',
				permission: 'admin.shop.manage',
				path: '/admin/cosmetics/emojis',
				component: lazy(() => import('@/features/admin/cosmetics/Emojis'))
			}
		]
	},
	{
		slug: 'settings',
		label: 'Settings',
		icon: 'settings',
		permission: 'admin.system.view',
		path: '/admin/settings',
		component: lazy(() => import('@/features/admin/components/ModularAdminLayout')),
		children: [
			{
				slug: 'feature-flags',
				label: 'Feature Flags',
				icon: 'toggle-left',
				permission: 'admin.system.manage',
				path: '/admin/settings/feature-flags',
				component: lazy(() => import('@/pages/admin/feature-flags'))
			},
			{
				slug: 'announcements',
				label: 'Announcements',
				icon: 'megaphone',
				permission: 'admin.system.manage',
				path: '/admin/settings/announcements',
				component: lazy(() => import('@/pages/admin/announcements/index'))
			}
		]
	},
	{
		slug: 'brand-config',
		label: 'Brand Configuration',
		icon: 'palette',
		permission: 'admin.system.manage',
		path: '/admin/brand-config',
		component: lazy(() => import('@/pages/admin/brand-config'))
	},
	{
		slug: 'ui-config',
		label: 'UI Configuration',
		icon: 'quote',
		permission: 'admin.system.manage',
		path: '/admin/ui-config',
		component: lazy(() => import('@/pages/admin/ui-config'))
	},
	{
		slug: 'live-database',
		label: 'Live Database Editor',
		icon: 'database',
		permission: 'admin.database.view',
		path: '/admin/live-database',
		component: lazy(() => import('@/pages/admin/live-database')),
		disabled: false, // Set to true to disable this module
		children: []
	}
];

// Helper utilities (flatten, generateSidebarLinks, generateAdminRouteGroups, permissionToModuleMap)
// These remain largely the same, but will now operate on adminModulesV2

function flatten(mods: AdminModuleV2[]): AdminModuleV2[] {
	const result: AdminModuleV2[] = [];
	for (const m of mods) {
		result.push(m);
		if (m.children) result.push(...flatten(m.children));
	}
	return result;
}

/**
 * Generate sidebar links in the old `adminLinks` shape ({ label, href, children? })
 */
export function generateSidebarLinks() {
	return adminModulesV2.map((m) => {
		if (m.children && m.children.length) {
			return {
				label: m.label,
				children: m.children.map((c) => ({ label: c.label, href: c.path }))
			};
		}
		return { label: m.label, href: m.path };
	});
}

/**
 * Generate route groups compatible with legacy `adminRouteGroups` typing so we don't break pages while migrating.
 */
export function generateAdminRouteGroups() {
	return adminModulesV2.map((m) => ({
		id: m.slug,
		label: m.label,
		icon: (m.icon as any) ?? 'layout-dashboard',
		permissions: [m.permission.split(':')[0] as any], // Simplified for legacy compatibility
		routes: [
			{
				path: m.path,
				label: m.label,
				icon: (m.icon as any) ?? 'layout-dashboard',
				permissions: [m.permission.split(':')[0] as any]
			},
			...(m.children
				? m.children.map((c) => ({
						path: c.path,
						label: c.label,
						icon: (c.icon as any) ?? 'dot',
						permissions: [c.permission.split(':')[0] as any]
					}))
				: [])
		]
	}));
}

/** Map of permission -> module for quick RBAC checks */
export const permissionToModuleMap: Record<string, AdminModuleV2> = {};
for (const m of flatten(adminModulesV2)) {
	permissionToModuleMap[m.permission] = m;
}
