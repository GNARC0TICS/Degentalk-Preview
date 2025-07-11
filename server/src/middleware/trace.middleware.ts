import type { Request, Response, NextFunction } from 'express';
import { logger } from '../core/logger'; // Assuming logger is in core
import { v4 as uuidv4 } from 'uuid';

export function traceMiddleware(req: Request, res: Response, next: NextFunction) {
	const requestId = uuidv4();
	const start = process.hrtime();

	// Attach requestId to request object for downstream use if needed
	// Express doesn't have a standard way, so using a custom property
	(req as any).requestId = requestId;

	// Only log in production or when VERBOSE_LOGGING is enabled
	if (process.env.NODE_ENV === 'production' || process.env.VERBOSE_LOGGING === 'true') {
		logger.info('RequestStart', `--> ${req.method} ${req.originalUrl}`, {
			requestId,
			method: req.method,
			url: req.originalUrl,
			ip: req.ip,
			userAgent: req.headers['user-agent']
		});
	}

	res.on('finish', () => {
		const diff = process.hrtime(start);
		const durationMs = diff[0] * 1e3 + diff[1] * 1e-6; // Convert to milliseconds

		// Only log in production or when VERBOSE_LOGGING is enabled
		if (process.env.NODE_ENV === 'production' || process.env.VERBOSE_LOGGING === 'true') {
			logger.info(
				'RequestEnd',
				`<-- ${req.method} ${req.originalUrl} ${res.statusCode} ${durationMs.toFixed(3)}ms`,
				{
					requestId,
					method: req.method,
					url: req.originalUrl,
					statusCode: res.statusCode,
				durationMs: parseFloat(durationMs.toFixed(3))
			}
		);
	});

	next();
}
