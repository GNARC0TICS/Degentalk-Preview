import type { UserId } from '@shared/types/ids';
// Centralized route constants for use in <Link> and router calls
// Usage: import { ROUTES } from '@/constants/routes';

export const ROUTES = {
	HOME: '/',
	FORUM: '/forums',
	SHOP: '/shop',
	SHOP_DGT_PURCHASE: '/shop/dgt-purchase',
	ADMIN: '/admin',
	ADMIN_USERS: '/admin/users',
	ADMIN_USER_EDIT: (id: UserId) => `/admin/users/${id}`,
	ADMIN_USER_GROUPS: '/admin/user-groups',
	ADMIN_CATEGORIES: '/admin/categories',
	ADMIN_PREFIXES: '/admin/prefixes',
	ADMIN_THREADS: '/admin/threads'
	// ...add more as needed
};
