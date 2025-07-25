/**
 * Analytics Bridge Routes
 * 
 * This file forwards to the analytics domain's admin routes
 * to maintain backward compatibility with existing admin panel structure
 */

// Import and re-export the analytics admin routes from the analytics domain
export { adminAnalyticsRoutes as default } from '@domains/analytics';

// Note: All analytics functionality has been moved to the analytics domain
// at server/src/domains/analytics/admin/
// This file exists only for backward compatibility