/**
 * Redis-Based Rate Limiting Service
 *
 * Production-grade rate limiting with Redis backend
 * Falls back to in-memory for development
 */

import Redis from 'ioredis';
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import type { Request, Response } from 'express';
import { userService } from './user.service';
import { env, getRateLimitConfig, isDevelopment } from '../config/environment';
import { logger } from '../logger';

/**
 * Redis connection for rate limiting
 */
let redisClient: Redis | null = null;

/**
 * Initialize Redis connection for rate limiting
 */
function initializeRedis(): Redis | null {
	const config = getRateLimitConfig();

	if (!config.redis) {
		logger.warn('RateLimit', 'Redis not configured - using memory store');
		return null;
	}

	try {
		const redis = new Redis(config.redis, {
			retryDelayOnFailover: 100,
			maxRetriesPerRequest: 3,
			lazyConnect: true,
			connectionName: 'rate-limiter',
			// Redis options for production stability
			keepAlive: 30000,
			connectTimeout: 10000,
			commandTimeout: 5000
		});

		redis.on('connect', () => {
			logger.info('RateLimit', 'Connected to Redis');
		});

		redis.on('error', (error) => {
			logger.error('RateLimit', 'Redis connection error:', error);
		});

		return redis;
	} catch (error) {
		logger.error('RateLimit', 'Failed to initialize Redis:', error);
		return null;
	}
}

// Track if we've already logged the warning
let memoryStoreWarningLogged = false;

/**
 * Create rate limiter with Redis or memory store
 */
function createRateLimiter(config: any) {
	const baseConfig = {
		windowMs: config.windowMs || 15 * 60 * 1000,
		max: config.max || 100,
		message: config.message || { error: 'Too many requests' },
		standardHeaders: true,
		legacyHeaders: false,
		// Custom key generator for better tracking
		keyGenerator: (req: Request) => {
			const authUser = userService.getUserFromRequest(req);
			const ip = req.ip || req.connection.remoteAddress;
			// Use user ID if authenticated, otherwise IP
			return authUser ? `user:${authUser.id}` : `ip:${ip}`;
		},
		// Skip successful requests to reduce Redis load
		skipSuccessfulRequests: false,
		skipFailedRequests: false
	};

	// Use Redis store if available
	if (redisClient && env.RATE_LIMIT_ENABLED) {
		return rateLimit({
			...baseConfig,
			store: new RedisStore({
				sendCommand: (...args: string[]) => redisClient!.call(...args),
				prefix: 'rate_limit:'
			})
		});
	}

	// Fallback to memory store with warning (only log once)
	if (env.RATE_LIMIT_ENABLED && !memoryStoreWarningLogged) {
		logger.warn('RateLimit', 'Using memory store - not recommended for production');
		memoryStoreWarningLogged = true;
	}

	return rateLimit(baseConfig);
}

/**
 * Rate limit configurations for different endpoint types
 */
export const rateLimiters = {
	// General API endpoints
	general: createRateLimiter({
		windowMs: 15 * 60 * 1000, // 15 minutes
		max: isDevelopment() ? 1000 : 100,
		message: {
			error: 'Too many requests',
			retryAfter: '15 minutes',
			type: 'RATE_LIMIT_GENERAL'
		}
	}),

	// Authentication endpoints
	auth: createRateLimiter({
		windowMs: 15 * 60 * 1000, // 15 minutes
		max: isDevelopment() ? 50 : 5,
		message: {
			error: 'Too many authentication attempts',
			retryAfter: '15 minutes',
			type: 'RATE_LIMIT_AUTH'
		}
	}),

	// Password reset (very strict)
	passwordReset: createRateLimiter({
		windowMs: 60 * 60 * 1000, // 1 hour
		max: 3,
		message: {
			error: 'Too many password reset attempts',
			retryAfter: '1 hour',
			type: 'RATE_LIMIT_PASSWORD_RESET'
		}
	}),

	// Admin endpoints
	admin: createRateLimiter({
		windowMs: 60 * 60 * 1000, // 1 hour
		max: isDevelopment() ? 500 : 50,
		message: {
			error: 'Too many admin requests',
			retryAfter: '1 hour',
			type: 'RATE_LIMIT_ADMIN'
		}
	}),

	// Financial operations
	financial: createRateLimiter({
		windowMs: 60 * 60 * 1000, // 1 hour
		max: isDevelopment() ? 100 : 10,
		message: {
			error: 'Too many financial operations',
			retryAfter: '1 hour',
			type: 'RATE_LIMIT_FINANCIAL'
		}
	}),

	// Forum posting
	posting: createRateLimiter({
		windowMs: 5 * 60 * 1000, // 5 minutes
		max: isDevelopment() ? 100 : 10,
		message: {
			error: 'Too many posts created',
			retryAfter: '5 minutes',
			type: 'RATE_LIMIT_POSTING'
		}
	}),

	// File uploads
	upload: createRateLimiter({
		windowMs: 15 * 60 * 1000, // 15 minutes
		max: isDevelopment() ? 50 : 5,
		message: {
			error: 'Too many file uploads',
			retryAfter: '15 minutes',
			type: 'RATE_LIMIT_UPLOAD'
		}
	})
};

/**
 * Custom rate limiter for specific needs
 */
export function createCustomRateLimiter(options: {
	windowMs: number;
	max: number;
	message?: any;
	keyGenerator?: (req: Request) => string;
}) {
	return createRateLimiter(options);
}

/**
 * Rate limit bypass for development
 */
export function bypassRateLimit(req: Request, res: Response, next: Function) {
	if (isDevelopment() && req.headers['x-bypass-rate-limit']) {
		logger.debug('RateLimit', 'Bypassing rate limit in development');
		return next();
	}
	next();
}

/**
 * Get rate limit statistics
 */
export async function getRateLimitStats(key: string): Promise<any> {
	if (!redisClient) {
		return { error: 'Redis not available' };
	}

	try {
		const current = await redisClient.get(`rate_limit:${key}`);
		const ttl = await redisClient.ttl(`rate_limit:${key}`);

		return {
			current: current ? parseInt(current) : 0,
			remaining: ttl,
			resetTime: new Date(Date.now() + ttl * 1000)
		};
	} catch (error) {
		logger.error('RateLimit', 'Failed to get stats:', error);
		return { error: 'Failed to get rate limit stats' };
	}
}

/**
 * Clear rate limit for a specific key (admin operation)
 */
export async function clearRateLimit(key: string): Promise<boolean> {
	if (!redisClient) {
		logger.warn('RateLimit', 'Cannot clear rate limit - Redis not available');
		return false;
	}

	try {
		await redisClient.del(`rate_limit:${key}`);
		logger.info('RateLimit', 'Cleared rate limit', { key });
		return true;
	} catch (error) {
		logger.error('RateLimit', 'Failed to clear rate limit:', error);
		return false;
	}
}

/**
 * Health check for rate limiting service
 */
export async function rateLimitHealthCheck(): Promise<{
	status: 'healthy' | 'degraded' | 'unhealthy';
	redis: boolean;
	store: 'redis' | 'memory';
}> {
	if (!env.RATE_LIMIT_ENABLED) {
		return {
			status: 'healthy',
			redis: false,
			store: 'memory'
		};
	}

	if (!redisClient) {
		return {
			status: 'degraded',
			redis: false,
			store: 'memory'
		};
	}

	try {
		await redisClient.ping();
		return {
			status: 'healthy',
			redis: true,
			store: 'redis'
		};
	} catch (error) {
		return {
			status: 'unhealthy',
			redis: false,
			store: 'memory'
		};
	}
}

// Initialize Redis connection
if (env.RATE_LIMIT_ENABLED) {
	redisClient = initializeRedis();
}

// Graceful shutdown
process.on('SIGTERM', () => {
	if (redisClient) {
		redisClient.disconnect();
		logger.info('RateLimit', 'Redis connection closed');
	}
});

export { redisClient };
