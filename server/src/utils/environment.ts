/**
 * Environment detection utilities
 *
 * Provides consistent methods to check environment settings across the codebase.
 */

/**
 * Checks if the application is running in development mode
 */
export const isDevMode = (): boolean => {
	return process.env.NODE_ENV === 'development' || process.env.APP_ENV === 'development';
};

/**
 * Checks if the application is running in production mode
 */
export const isProdMode = (): boolean => {
	return process.env.NODE_ENV === 'production';
};

/**
 * Checks if authentication should be bypassed (based on dev mode and specific env flags)
 * SECURITY: This MUST return false in production to prevent auth bypass vulnerabilities
 */
export const shouldBypassAuth = (): boolean => {
	// CRITICAL: Never bypass auth in production
	if (isProdMode()) return false;

	// Additional safety check for production deployment
	if (process.env.NODE_ENV === 'production') return false;

	// In development, we can have an additional flag to force auth
	return isDevMode() && process.env.DEV_FORCE_AUTH !== 'true';
};

/**
 * Get the current environment name
 */
export const getEnvironment = (): string => {
	return process.env.NODE_ENV || 'development';
};
