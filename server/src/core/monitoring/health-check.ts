/**
 * Health Check Endpoints with Metrics
 *
 * Provides system health monitoring and metrics collection
 */

import { Router, Request, Response } from 'express';
import { db } from '@db';
import { sql } from 'drizzle-orm';
import { queryMonitor } from './query-performance';
import { logger } from '../logger';
import os from 'os';

const router = Router();

export interface HealthStatus {
	status: 'healthy' | 'degraded' | 'unhealthy';
	timestamp: string;
	uptime: number;
	version: string;
	services: {
		database: ServiceHealth;
		memory: ServiceHealth;
		disk: ServiceHealth;
	};
	metrics: SystemMetrics;
}

export interface ServiceHealth {
	status: 'healthy' | 'degraded' | 'unhealthy';
	responseTime?: number;
	message?: string;
	details?: any;
}

export interface SystemMetrics {
	requests: {
		total: number;
		errors: number;
		averageResponseTime: number;
	};
	database: {
		totalQueries: number;
		slowQueries: number;
		averageQueryTime: number;
		errorRate: number;
	};
	system: {
		memoryUsage: NodeJS.MemoryUsage;
		cpuUsage: number;
		loadAverage: number[];
		diskUsage?: number;
	};
}

class HealthMonitor {
	private startTime = Date.now();
	private requestCount = 0;
	private errorCount = 0;
	private responseTimes: number[] = [];

	/**
	 * Record request metrics
	 */
	recordRequest(responseTime: number, isError = false): void {
		this.requestCount++;
		if (isError) this.errorCount++;

		this.responseTimes.push(responseTime);

		// Keep only last 1000 response times
		if (this.responseTimes.length > 1000) {
			this.responseTimes = this.responseTimes.slice(-1000);
		}
	}

	/**
	 * Check database health
	 */
	async checkDatabaseHealth(): Promise<ServiceHealth> {
		const startTime = Date.now();

		try {
			await db.execute(sql`SELECT 1 as health_check`);
			const responseTime = Date.now() - startTime;

			return {
				status: responseTime < 1000 ? 'healthy' : 'degraded',
				responseTime,
				message: `Database responded in ${responseTime}ms`
			};
		} catch (error) {
			return {
				status: 'unhealthy',
				responseTime: Date.now() - startTime,
				message: `Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
			};
		}
	}

	/**
	 * Check memory health
	 */
	checkMemoryHealth(): ServiceHealth {
		const usage = process.memoryUsage();
		const totalMemory = os.totalmem();
		const freeMemory = os.freemem();
		const memoryUsagePercent = ((totalMemory - freeMemory) / totalMemory) * 100;

		let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
		if (memoryUsagePercent > 90) status = 'unhealthy';
		else if (memoryUsagePercent > 80) status = 'degraded';

		return {
			status,
			message: `Memory usage: ${memoryUsagePercent.toFixed(1)}%`,
			details: {
				heapUsed: Math.round(usage.heapUsed / 1024 / 1024),
				heapTotal: Math.round(usage.heapTotal / 1024 / 1024),
				external: Math.round(usage.external / 1024 / 1024),
				systemMemoryUsage: memoryUsagePercent.toFixed(1)
			}
		};
	}

	/**
	 * Check disk health
	 */
	checkDiskHealth(): ServiceHealth {
		try {
			const stats = os.freemem();
			// This is a simplified check - in production you'd check actual disk usage
			return {
				status: 'healthy',
				message: 'Disk space available'
			};
		} catch (error) {
			return {
				status: 'unhealthy',
				message: `Failed to check disk space: ${error instanceof Error ? error.message : 'Unknown error'}`
			};
		}
	}

	/**
	 * Get CPU usage
	 */
	getCpuUsage(): number {
		const cpus = os.cpus();
		let totalIdle = 0;
		let totalTick = 0;

		cpus.forEach((cpu) => {
			for (const type in cpu.times) {
				totalTick += cpu.times[type as keyof typeof cpu.times];
			}
			totalIdle += cpu.times.idle;
		});

		return 100 - (totalIdle / totalTick) * 100;
	}

	/**
	 * Get system metrics
	 */
	getSystemMetrics(): SystemMetrics {
		const dbStats = queryMonitor.getStats();
		const averageResponseTime =
			this.responseTimes.length > 0
				? this.responseTimes.reduce((sum, time) => sum + time, 0) / this.responseTimes.length
				: 0;

		return {
			requests: {
				total: this.requestCount,
				errors: this.errorCount,
				averageResponseTime
			},
			database: dbStats,
			system: {
				memoryUsage: process.memoryUsage(),
				cpuUsage: this.getCpuUsage(),
				loadAverage: os.loadavg()
			}
		};
	}

	/**
	 * Get comprehensive health status
	 */
	async getHealthStatus(): Promise<HealthStatus> {
		const [databaseHealth, memoryHealth, diskHealth] = await Promise.all([
			this.checkDatabaseHealth(),
			Promise.resolve(this.checkMemoryHealth()),
			Promise.resolve(this.checkDiskHealth())
		]);

		const services = {
			database: databaseHealth,
			memory: memoryHealth,
			disk: diskHealth
		};

		// Determine overall status
		const statuses = Object.values(services).map((s) => s.status);
		let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

		if (statuses.some((s) => s === 'unhealthy')) {
			overallStatus = 'unhealthy';
		} else if (statuses.some((s) => s === 'degraded')) {
			overallStatus = 'degraded';
		}

		return {
			status: overallStatus,
			timestamp: new Date().toISOString(),
			uptime: Date.now() - this.startTime,
			version: process.env.npm_package_version || '1.0.0',
			services,
			metrics: this.getSystemMetrics()
		};
	}
}

// Global health monitor instance
const healthMonitor = new HealthMonitor();

/**
 * Middleware to track request metrics
 */
export function requestMetricsMiddleware(req: Request, res: Response, next: Function) {
	const startTime = Date.now();

	res.on('finish', () => {
		const responseTime = Date.now() - startTime;
		const isError = res.statusCode >= 400;
		healthMonitor.recordRequest(responseTime, isError);
	});

	next();
}

/**
 * Basic health check endpoint
 */
router.get('/health', async (req: Request, res: Response) => {
	try {
		const health = await healthMonitor.getHealthStatus();
		const statusCode = health.status === 'healthy' ? 200 : 503;

		res.status(statusCode).json(health);
	} catch (error) {
		logger.error('HealthCheck', 'Health check failed', { error });

		res.status(503).json({
			status: 'unhealthy',
			timestamp: new Date().toISOString(),
			message: 'Health check failed',
			error: error instanceof Error ? error.message : 'Unknown error'
		});
	}
});

/**
 * Liveness probe - basic server responsiveness
 */
router.get('/health/live', (req: Request, res: Response) => {
	res.status(200).json({
		status: 'alive',
		timestamp: new Date().toISOString(),
		uptime: process.uptime()
	});
});

/**
 * Readiness probe - ready to serve traffic
 */
router.get('/health/ready', async (req: Request, res: Response) => {
	try {
		const dbHealth = await healthMonitor.checkDatabaseHealth();
		const isReady = dbHealth.status !== 'unhealthy';

		res.status(isReady ? 200 : 503).json({
			status: isReady ? 'ready' : 'not_ready',
			timestamp: new Date().toISOString(),
			database: dbHealth
		});
	} catch (error) {
		res.status(503).json({
			status: 'not_ready',
			timestamp: new Date().toISOString(),
			error: error instanceof Error ? error.message : 'Unknown error'
		});
	}
});

/**
 * Metrics endpoint (Prometheus-compatible format)
 */
router.get('/metrics', async (req: Request, res: Response) => {
	try {
		const metrics = healthMonitor.getSystemMetrics();
		const dbStats = queryMonitor.getStats();

		// Simple text format for metrics
		const metricsText = [
			`# HELP http_requests_total Total HTTP requests`,
			`# TYPE http_requests_total counter`,
			`http_requests_total ${metrics.requests.total}`,
			'',
			`# HELP http_request_errors_total Total HTTP request errors`,
			`# TYPE http_request_errors_total counter`,
			`http_request_errors_total ${metrics.requests.errors}`,
			'',
			`# HELP http_request_duration_ms Average HTTP request duration`,
			`# TYPE http_request_duration_ms gauge`,
			`http_request_duration_ms ${metrics.requests.averageResponseTime}`,
			'',
			`# HELP db_queries_total Total database queries`,
			`# TYPE db_queries_total counter`,
			`db_queries_total ${dbStats.totalQueries}`,
			'',
			`# HELP db_queries_slow_total Total slow database queries`,
			`# TYPE db_queries_slow_total counter`,
			`db_queries_slow_total ${dbStats.slowQueries}`,
			'',
			`# HELP db_query_duration_ms Average database query duration`,
			`# TYPE db_query_duration_ms gauge`,
			`db_query_duration_ms ${dbStats.averageQueryTime}`,
			'',
			`# HELP memory_heap_used_bytes Node.js heap memory used`,
			`# TYPE memory_heap_used_bytes gauge`,
			`memory_heap_used_bytes ${metrics.system.memoryUsage.heapUsed}`,
			'',
			`# HELP process_uptime_seconds Process uptime`,
			`# TYPE process_uptime_seconds gauge`,
			`process_uptime_seconds ${process.uptime()}`,
			''
		].join('\n');

		res.set('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
		res.send(metricsText);
	} catch (error) {
		logger.error('HealthCheck', 'Metrics collection failed', { error });
		res.status(500).send('# Metrics collection failed');
	}
});

export { healthMonitor };
export default router;
