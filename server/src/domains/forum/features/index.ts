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

// Announcements domain properly migrated to new structure
