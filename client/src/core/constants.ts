/**
 * Environment constants used throughout the app
 * This provides consistent environment detection
 */

// Check if we're in production mode (whether standard production or preview environment)
export const IS_PRODUCTION = import.meta.env.PROD;

// Check if we're in development mode (the opposite of production)
export const IS_DEVELOPMENT = !IS_PRODUCTION;

// The application's basename (useful for constructing URLs)
export const BASE_URL = import.meta.env.BASE_URL || '';

// Base URL for API calls
export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// The application's mode (development, production, etc.)
export const MODE = import.meta.env.MODE || 'development';

// Development mode flag
// Log the environment for easier debugging
// DEV_MODE logging (optional, keep for debugging if needed)
if (import.meta.env.DEV) {
	// console.log('🔧 Running in development mode');
} else {
	// console.log('🚀 Running in production mode');
}

// Default page size for pagination
export const DEFAULT_PAGE_SIZE = 10;
