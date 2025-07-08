/**
 * Development Routes
 *
 * Provides development-specific endpoints for debugging and monitoring.
 * Only available in development mode.
 */

import { Router } from 'express';
import { cacheService } from '@server/src/core/cache.service';
import { logger } from '@server/src/core/logger';
import { isDevMode } from '@server/src/utils/environment';
import { devSecurity } from '@server/src/middleware/dev-security.middleware';
import { 
	sendSuccessResponse,
	sendErrorResponse 
} from '@server/src/core/utils/transformer.helpers';

const router = Router();

// Ensure dev mode for all routes
router.use((req, res, next) => {
	if (!isDevMode()) {
		return sendErrorResponse(res, 'Not found', 404);
	}
	next();
});

/**
 * API Health Check with Performance Stats
 * GET /api/dev/health
 */
router.get('/health', async (req, res) => {
	try {
		const startTime = Date.now();

		// Test database connection
		const { db } = await import('@db');
		await db.execute({ sql: 'SELECT 1', args: [] });
		const dbLatency = Date.now() - startTime;

		// Get cache stats
		const cacheStats = cacheService.getStats();

		// Memory usage
		const memUsage = process.memoryUsage();

		sendSuccessResponse(res, {
			status: 'healthy',
			timestamp: new Date().toISOString(),
			environment: {
				mode: 'development',
				nodeEnv: process.env.NODE_ENV,
				nodeVersion: process.version
			},
			performance: {
				dbLatency: `${dbLatency}ms`,
				uptime: `${Math.round(process.uptime())}s`,
				memory: {
					used: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
					total: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
					rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`
				}
			},
			cache: cacheStats,
			features: {
				redis: cacheStats.type === 'redis',
				devSecurity: true,
				hotReload: true
			}
		});
	} catch (error) {
		logger.error('DevRoutes', 'Health check failed', { error });
		sendErrorResponse(res, error instanceof Error ? error.message : 'Unknown error', 500);
	}
});

/**
 * Clear all caches
 * POST /api/dev/clear-cache
 */
router.post('/clear-cache', devSecurity.ipAllowlist, async (req, res) => {
	try {
		await cacheService.clear();

		logger.info('DevRoutes', 'Cache cleared via dev endpoint');

		sendSuccessResponse(res, {
			success: true,
			message: 'All caches cleared',
			timestamp: new Date().toISOString()
		});
	} catch (error) {
		logger.error('DevRoutes', 'Failed to clear cache', { error });
		sendErrorResponse(res, error instanceof Error ? error.message : 'Unknown error', 500);
	}
});

/**
 * Log levels configuration
 * GET /api/dev/logs/levels
 * POST /api/dev/logs/levels { level: 'debug' | 'info' | 'warn' | 'error' }
 */
router.get('/logs/levels', (req, res) => {
	sendSuccessResponse(res, {
		current: process.env.LOG_LEVEL || 'info',
		available: ['debug', 'info', 'warn', 'error'],
		description: {
			debug: 'Verbose logging for development',
			info: 'General information messages',
			warn: 'Warning messages only',
			error: 'Error messages only'
		}
	});
});

router.post('/logs/levels', devSecurity.ipAllowlist, (req, res) => {
	const { level } = req.body;

	if (!['debug', 'info', 'warn', 'error'].includes(level)) {
		return sendErrorResponse(res, 'Invalid log level', 400);
	}

	process.env.LOG_LEVEL = level;

	logger.info('DevRoutes', 'Log level changed', { newLevel: level });

	sendSuccessResponse(res, {
		success: true,
		oldLevel: process.env.LOG_LEVEL,
		newLevel: level,
		message: `Log level set to ${level}`
	});
});

/**
 * Quick database query test
 * GET /api/dev/db/test
 */
router.get('/db/test', devSecurity.ipAllowlist, async (req, res) => {
	try {
		const { db } = await import('@db');
		const { sql } = await import('drizzle-orm');

		const startTime = Date.now();

		// Test basic query
		const result = await db.execute(sql`
      SELECT 
        'Database connection OK' as status,
        NOW() as server_time,
        version() as pg_version
    `);

		const queryTime = Date.now() - startTime;

		sendSuccessResponse(res, {
			success: true,
			queryTime: `${queryTime}ms`,
			result: result[0],
			timestamp: new Date().toISOString()
		});
	} catch (error) {
		logger.error('DevRoutes', 'Database test failed', { error });
		sendErrorResponse(res, error instanceof Error ? error.message : 'Unknown error', 500);
	}
});

export default router;
