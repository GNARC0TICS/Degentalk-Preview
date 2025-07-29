/**
 * Environment Configuration with Security Validation
 *
 * Validates required environment variables and provides type-safe access
 * Prevents application startup with missing or invalid configuration
 */

import { z } from 'zod';
import { logger } from '../logger';

// Environment validation schema
const envSchema = z.object({
	// Application Environment
	NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
	APP_ENV: z.enum(['development', 'staging', 'production']).default('development'),
	PORT: z.string().transform(Number).default('5001'),

	// Database Configuration (Required)
	DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
	DATABASE_PROVIDER: z.enum(['postgresql']).default('postgresql'),

	// Session Security (Required in production)
	SESSION_SECRET: z.string().min(32, 'SESSION_SECRET must be at least 32 characters'),

	// Development Authentication (Only in development)
	DEV_FORCE_AUTH: z.string().transform(Boolean).default('false'),
	DEV_BYPASS_PASSWORD: z.string().transform(Boolean).default('false'),

	// External Services
	STRIPE_SECRET_KEY: z.string().optional(),
	STRIPE_PUBLISHABLE_KEY: z.string().optional(),
	CCPAYMENT_APP_ID: z.string().optional(),
	CCPAYMENT_APP_SECRET: z.string().optional(),

	// Redis Configuration
	REDIS_URL: z.string().optional(),

	// Rate Limiting
	RATE_LIMIT_ENABLED: z.string().transform(Boolean).default('true'),
	RATE_LIMIT_REDIS_URL: z.string().optional(),
	API_RATE_LIMIT: z.string().transform(Number).default('100'),
	API_RATE_WINDOW: z.string().transform(Number).default('900000'), // 15 minutes

	// CORS Configuration
	ALLOWED_ORIGINS: z.string().optional(),

	// Monitoring
	LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
	SENTRY_DSN: z.string().optional(),

	// Feature Flags
	FEATURE_WALLET: z.string().transform(Boolean).default('true')
});

export type EnvironmentConfig = z.infer<typeof envSchema>;

/**
 * Validate and parse environment variables
 */
function validateEnvironment(): EnvironmentConfig {
	try {
		const parsed = envSchema.parse(process.env);

		// Additional security validations
		validateSecurityRequirements(parsed);

		return parsed;
	} catch (error) {
		logger.error('Environment', 'Validation failed:', error);
		process.exit(1);
	}
}

/**
 * Security-specific validations
 */
function validateSecurityRequirements(config: EnvironmentConfig): void {
	// Production security requirements
	if (config.NODE_ENV === 'production') {
		// Ensure authentication bypass is disabled in production
		if (config.DEV_FORCE_AUTH || config.DEV_BYPASS_PASSWORD) {
			throw new Error('Development authentication features must be disabled in production');
		}

		// Require proper session secret in production
		if (config.SESSION_SECRET.length < 64) {
			throw new Error('SESSION_SECRET must be at least 64 characters in production');
		}

		// Validate Redis is configured for production rate limiting
		if (config.RATE_LIMIT_ENABLED && !config.REDIS_URL) {
			logger.warn('Environment',
				'Redis not configured - using in-memory rate limiting (not recommended for production)'
			);
		}

		// Ensure CORS is configured
		if (!config.ALLOWED_ORIGINS) {
			throw new Error('ALLOWED_ORIGINS must be configured in production');
		}
	}

	// Development warnings
	if (config.NODE_ENV === 'development') {
		if (config.SESSION_SECRET === 'sonnet-forum-secret') {
			logger.warn('Environment', 'Using default session secret in development - consider setting SESSION_SECRET');
		}

		if (config.DEV_BYPASS_PASSWORD) {
			logger.warn('Environment', 'Password bypass is enabled - development only!');
		}
	}

	// Database URL validation
	if (config.DATABASE_URL.includes('localhost') && config.NODE_ENV === 'production') {
		logger.warn('Environment', 'Using localhost database in production environment');
	}
}

/**
 * Get validated environment configuration
 */
export const env = validateEnvironment();

/**
 * Check if environment is production
 */
export const isProduction = () => env.NODE_ENV === 'production';

/**
 * Check if environment is development
 */
export const isDevelopment = () => env.NODE_ENV === 'development';

/**
 * Check if environment is test
 */
export const isTest = () => env.NODE_ENV === 'test';

/**
 * Get database configuration
 */
export const getDatabaseConfig = () => ({
	url: env.DATABASE_URL,
	provider: env.DATABASE_PROVIDER
});

/**
 * Get session configuration
 */
export const getSessionConfig = () => ({
	secret: env.SESSION_SECRET,
	secure: isProduction(),
	httpOnly: true,
	maxAge: 24 * 60 * 60 * 1000, // 24 hours
	sameSite: 'strict' as const
});

/**
 * Get CORS configuration
 */
export const getCorsConfig = () => {
	const origins = env.ALLOWED_ORIGINS?.split(',').map((origin) => origin.trim()) || [];

	if (isDevelopment()) {
		// Allow common development origins
		origins.push('http://localhost:3000', 'http://localhost:5173', 'http://localhost:5001');
	}

	return {
		origin: origins.length > 0 ? origins : false,
		credentials: true,
		methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
		allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
	};
};

/**
 * Get rate limiting configuration
 */
export const getRateLimitConfig = () => ({
	enabled: env.RATE_LIMIT_ENABLED,
	redis: env.RATE_LIMIT_REDIS_URL || env.REDIS_URL,
	limit: env.API_RATE_LIMIT,
	window: env.API_RATE_WINDOW
});

// Log configuration on startup (without secrets)
logger.info('Environment', 'Configuration loaded:', {
	NODE_ENV: env.NODE_ENV,
	APP_ENV: env.APP_ENV,
	PORT: env.PORT,
	DATABASE_PROVIDER: env.DATABASE_PROVIDER,
	RATE_LIMIT_ENABLED: env.RATE_LIMIT_ENABLED,
	FEATURE_WALLET: env.FEATURE_WALLET,
	hasRedis: !!env.REDIS_URL,
	hasSessionSecret: !!env.SESSION_SECRET
});
