// Admin Announcements Domain
// Global site-wide announcements managed by admins/moderators

export * from './announcements.controller';
export * from './announcements.service';
export { 
  registerAnnouncementRoutes,
  publicRouter,
  adminRouter,
  default
} from './announcements.routes';