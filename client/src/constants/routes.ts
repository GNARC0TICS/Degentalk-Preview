// Centralized route constants for use in <Link> and router calls
// Usage: import { ROUTES } from '@/constants/routes';

export const ROUTES = {
  HOME: '/',
  // Main Forum routes with clear hierarchy
  FORUMS: '/forums',                                       // List all forums
  FORUM_DETAIL: (slug: string) => `/forums/${slug}`,       // View a specific forum and its topics
  THREAD_DETAIL: (slug: string) => `/threads/${slug}`,     // View a specific thread and its posts
  
  // Legacy routes - marked for deprecation but kept for backward compatibility
  FORUM: '/forum',                                         // Old forum index
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
  ADMIN_FORUM_CATEGORIES_CREATE_OR_LIST: '/admin/forums/manage',
  // ...add more as needed
};
