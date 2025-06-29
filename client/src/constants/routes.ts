// Centralized route constants for use in <Link> and router calls
// Usage: import { ROUTES } from '@/constants/routes';

export const ROUTES = {
	HOME: '/',

	// Hierarchical Forum Structure
	ZONES: '/zones', // List all zones
	ZONE: (slug: string) => `/zones/${slug}`, // View a specific zone
	FORUM: (zoneSlug: string, forumSlug: string) => `/zones/${zoneSlug}/${forumSlug}`, // Forum within zone
	SUBFORUM: (zoneSlug: string, forumSlug: string, subforumSlug: string) =>
		`/zones/${zoneSlug}/${forumSlug}/${subforumSlug}`, // Subforum
	THREAD: (slug: string) => `/threads/${slug}`, // Individual thread (global)

	// Thread Creation
	CREATE_THREAD: '/threads/create', // Generic thread creation
	CREATE_THREAD_IN_FORUM: (zoneSlug: string, forumSlug: string) =>
		`/zones/${zoneSlug}/${forumSlug}/create`,
	CREATE_THREAD_IN_SUBFORUM: (zoneSlug: string, forumSlug: string, subforumSlug: string) =>
		`/zones/${zoneSlug}/${forumSlug}/${subforumSlug}/create`,

	// Search
	SEARCH_FORUMS: '/search/forums',

	// Legacy routes (deprecated - use hierarchical ones above)
	FORUMS: '/forums', // Redirects to /zones
	FORUM_DETAIL: (slug: string) => `/forums/${slug}`, // Legacy - redirects to new structure
	FORUM_CATEGORY: (slug: string) => `/categories/${slug}`, // Old category view

	// Shop routes
	SHOP: '/shop',
	SHOP_DGT_PURCHASE: '/shop/dgt-purchase',

	// Admin routes
	ADMIN: '/admin',
	ADMIN_USERS: '/admin/users',
	ADMIN_USER_EDIT: (id: string | number) => `/admin/users/${id}`,
	ADMIN_USER_GROUPS: '/admin/user-groups',
	ADMIN_CATEGORIES: '/admin/categories',
	ADMIN_PREFIXES: '/admin/prefixes',
	ADMIN_THREADS: '/admin/threads',
	ADMIN_FORUM_CATEGORIES_CREATE_OR_LIST: '/admin/forums/manage'
	// ...add more as needed
};
