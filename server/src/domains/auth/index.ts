// Export routes
export { default as authRoutes } from './auth.routes';

// Import Lucia middleware
import { luciaAuth } from '@middleware/lucia-auth.middleware';

// Export middleware - now from Lucia middleware
export { luciaAuth as authMiddleware, luciaAuth };

// Export specific middleware functions for backward compatibility
export const isAuthenticated = luciaAuth.require;
export const isAuthenticatedOptional = luciaAuth.optional;
export const isAdmin = luciaAuth.requireAdmin;
export const isModerator = luciaAuth.requireModerator;
export const isAdminOrModerator = luciaAuth.requireAdminOrModerator;

// Export services
export * from './services/auth.service';
export { luciaAuthService } from './services/lucia-auth.service';

// Export auth setup function (no longer needed with Lucia)
export function setupAuthPassport(app: any) {
	// No-op for backward compatibility
	// Lucia doesn't need passport setup
	console.log('setupAuthPassport called - using Lucia now, no setup needed');
}

// Auth domain migrated to Lucia