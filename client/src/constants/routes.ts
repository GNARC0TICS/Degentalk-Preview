import type { UserId } from '@shared/types/ids';

// Centralized route constants for use in <Link> and router calls
// Usage: import { ROUTES } from '@app/constants/routes';

export const ROUTES = {
	HOME: '/',

	// Clean Forum Structure (Featured + General Forums)
	FORUMS: '/forums', // List all forums (Featured + General)
	FORUM: (forumSlug: string) => `/forums/${forumSlug}`, // Direct forum access
	SUBFORUM: (forumSlug: string, subforumSlug: string) => `/forums/${forumSlug}/${subforumSlug}`, // Subforum
	THREAD: (slug: string) => `/threads/${slug}`, // Individual thread (global)

	// Thread Creation
	CREATE_THREAD: '/threads/create', // Generic thread creation
	CREATE_THREAD_IN_FORUM: (forumSlug: string) => `/forums/${forumSlug}/create`,
	CREATE_THREAD_IN_SUBFORUM: (forumSlug: string, subforumSlug: string) =>
		`/forums/${forumSlug}/${subforumSlug}/create`,

	// Search
	SEARCH_FORUMS: '/search/forums',

	// Legacy routes (deprecated - use clean /forums/ structure above)
	LEGACY_ZONES: '/zones', // Redirects to /forums
	LEGACY_ZONE: (slug: string) => `/zones/${slug}`, // Redirects to new structure
	LEGACY_ZONE_FORUM: (zoneSlug: string, forumSlug: string) => `/zones/${zoneSlug}/${forumSlug}`, // Redirects
	LEGACY_ZONE_SUBFORUM: (zoneSlug: string, forumSlug: string, subforumSlug: string) =>
		`/zones/${zoneSlug}/${forumSlug}/${subforumSlug}`, // Redirects
	FORUM_DETAIL: (slug: string) => `/forums/${slug}`, // Direct forum access (no longer legacy)
	FORUM_CATEGORY: (slug: string) => `/categories/${slug}`, // Old category view

	// Shop routes
	SHOP: '/shop',
	SHOP_DGT_PURCHASE: '/shop/dgt-purchase',

	// Admin routes
	ADMIN: '/admin',
	ADMIN_USERS: '/admin/users',
	ADMIN_USER_EDIT: (id: UserId) => `/admin/users/${id}`,
	ADMIN_USER_GROUPS: '/admin/user-groups',
	ADMIN_CATEGORIES: '/admin/categories',
	ADMIN_PREFIXES: '/admin/prefixes',
	ADMIN_THREADS: '/admin/threads',
	ADMIN_FORUM_CATEGORIES_CREATE_OR_LIST: '/admin/forums/manage'
	// ...add more as needed
};
