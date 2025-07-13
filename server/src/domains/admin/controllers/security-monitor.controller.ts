/**
 * Security Monitoring Controller
 * 
 * Admin-only endpoints for monitoring security events and metrics
 */

import type { Request, Response, NextFunction } from 'express';
import { securityMonitor } from '@core/security/security-monitor.service';
import { sendSuccessResponse, sendErrorResponse } from '@core/utils/transformer.helpers';
import { logger } from '@core/logger';

/**
 * Get security metrics for the admin dashboard
 */
export const getSecurityMetrics = async (req: Request, res: Response, next: NextFunction) => {
	try {
		// Default to last hour, max 24 hours
		const timeWindow = Math.min(
			parseInt(req.query.timeWindow as string) || 3600000, // 1 hour default
			86400000 // 24 hours max
		);

		const metrics = securityMonitor.getSecurityMetrics(timeWindow);
		
		sendSuccessResponse(res, {
			metrics,
			timeWindowHours: timeWindow / 3600000,
			generatedAt: new Date().toISOString()
		});
	} catch (error) {
		logger.error('Error getting security metrics:', error);
		next(error);
	}
};

/**
 * Get recent security events (admin only)
 */
export const getRecentSecurityEvents = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const limit = Math.min(parseInt(req.query.limit as string) || 50, 1000);
		const severity = req.query.severity as string;
		const eventType = req.query.eventType as string;

		// In production, this would query from persistent storage
		// For now, return mock data structure
		const events = {
			events: [],
			totalCount: 0,
			filters: {
				severity,
				eventType,
				limit
			},
			notice: 'Security event storage not implemented - events are currently logged to structured logs'
		};

		sendSuccessResponse(res, events);
	} catch (error) {
		logger.error('Error getting security events:', error);
		next(error);
	}
};

/**
 * Trigger a test security event (dev/staging only)
 */
export const triggerTestSecurityEvent = async (req: Request, res: Response, next: NextFunction) => {
	try {
		if (process.env.NODE_ENV === 'production') {
			return sendErrorResponse(res, 'Test endpoints not available in production', 403);
		}

		const { eventType, severity } = req.body;
		
		// Log test security event
		securityMonitor.logSuspiciousActivity(
			req,
			`Test security event: ${eventType}`,
			0.5
		);

		sendSuccessResponse(res, {
			message: 'Test security event logged',
			eventType,
			severity,
			timestamp: new Date().toISOString()
		});
	} catch (error) {
		logger.error('Error triggering test security event:', error);
		next(error);
	}
};