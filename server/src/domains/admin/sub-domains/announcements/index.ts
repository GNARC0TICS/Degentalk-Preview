// Export the announcement routes
export {
	registerAnnouncementRoutes,
	publicRouter as publicAnnouncementRoutes,
	adminRouter as adminAnnouncementRoutes,
	default as createAnnouncementRouter
} from './announcements.routes';

// Export services
export * from './announcements.service.js';

// Export controllers
export * from './announcements.controller';

// Mark the original file as deprecated
export const ORIGINAL_ANNOUNCEMENTS_DEPRECATED = true;
