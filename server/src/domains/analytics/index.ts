/**
 * Analytics Domain Public API
 * 
 * Exports public interfaces and services from the analytics domain
 */

// Export main analytics services
export { platformService } from './services/platform.service';
export { sessionTrackingService } from './services/session-tracking.service';

// Export admin analytics routes for admin domain
export { default as adminAnalyticsRoutes } from './admin/analytics.routes';

// Export controllers
export { analyticsController } from './controllers/analytics.controller';

// Export types
export type {
	RainEventAnalytics
} from './admin/rain-analytics.service';

// Re-export admin controllers if needed by other domains
export { adminAnalyticsController } from './admin/analytics.controller';
export { rainAnalyticsController } from './admin/rain-analytics.controller';
export { tippingAnalyticsController } from './admin/tipping-analytics.controller';
export { fraudDetectionController } from './admin/fraud-detection.controller';
export { systemAnalyticsController } from './admin/system-analytics.controller';