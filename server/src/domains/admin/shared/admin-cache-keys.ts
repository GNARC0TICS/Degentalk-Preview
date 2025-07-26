/**
 * Admin Cache Keys
 * 
 * Centralized cache key constants for admin domain
 */

export const AdminCacheKeys = {
  // Settings
  SETTINGS_ALL: 'admin:settings:all',
  SETTINGS_BY_KEY: (key: string) => `admin:settings:${key}`,
  FEATURE_FLAGS: 'admin:feature-flags:all',
  
  // Users
  ADMIN_USERS: 'admin:users:admins',
  MOD_USERS: 'admin:users:mods',
  
  // Stats
  ADMIN_STATS: 'admin:stats:overview',
  
  // TTLs
  TTL_SHORT: 60, // 1 minute
  TTL_MEDIUM: 300, // 5 minutes
  TTL_LONG: 3600, // 1 hour
} as const;