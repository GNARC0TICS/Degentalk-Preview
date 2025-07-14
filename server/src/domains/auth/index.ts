// Export routes
export { default as authRoutes } from './auth.routes';
export {
	setupAuthPassport,
	isAuthenticated,
	isAuthenticatedOptional,
	isAdmin,
	isModerator,
	isAdminOrModerator
} from './auth.routes';

// Export services
export * from './services/auth.service';

// Auth domain properly migrated to new structure
