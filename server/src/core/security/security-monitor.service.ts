/**
 * Security Monitoring Service
 * 
 * Centralized security event tracking, metrics, and alerting for production monitoring.
 * Provides comprehensive logging for security incidents and potential threats.
 */

import { logger } from '@core/logger';
import type { Request } from 'express';
import type { UserId } from '@shared/types/ids';

export interface SecurityEvent {
	type: SecurityEventType;
	severity: 'low' | 'medium' | 'high' | 'critical';
	userId?: UserId;
	ip: string;
	userAgent: string;
	route: string;
	method: string;
	details: Record<string, any>;
	timestamp: Date;
}

export enum SecurityEventType {
	INVALID_ID_ATTEMPT = 'invalid_id_attempt',
	MALFORMED_UUID = 'malformed_uuid',
	AUTH_FAILURE = 'auth_failure',
	RATE_LIMIT_HIT = 'rate_limit_hit',
	SUSPICIOUS_ACTIVITY = 'suspicious_activity',
	PRIVILEGE_ESCALATION = 'privilege_escalation',
	DATA_ACCESS_VIOLATION = 'data_access_violation',
	WEBHOOK_VALIDATION_FAILURE = 'webhook_validation_failure',
	SQL_INJECTION_ATTEMPT = 'sql_injection_attempt',
	XSS_ATTEMPT = 'xss_attempt'
}

class SecurityMonitorService {
	private alertThresholds = {
		[SecurityEventType.INVALID_ID_ATTEMPT]: { count: 10, window: 60000 }, // 10 in 1 minute
		[SecurityEventType.AUTH_FAILURE]: { count: 5, window: 300000 }, // 5 in 5 minutes
		[SecurityEventType.RATE_LIMIT_HIT]: { count: 3, window: 60000 }, // 3 in 1 minute
		[SecurityEventType.MALFORMED_UUID]: { count: 20, window: 300000 }, // 20 in 5 minutes
		[SecurityEventType.SUSPICIOUS_ACTIVITY]: { count: 1, window: 0 }, // Immediate alert
	};

	private eventCounts = new Map<string, { count: number; firstSeen: Date }>();

	/**
	 * Log a security event with automatic alerting based on thresholds
	 */
	logSecurityEvent(event: Omit<SecurityEvent, 'timestamp'>): void {
		const fullEvent: SecurityEvent = {
			...event,
			timestamp: new Date()
		};

		// Log the event
		this.logEvent(fullEvent);

		// Check for alerting thresholds
		this.checkAlertThresholds(fullEvent);

		// Track metrics for dashboard
		this.updateMetrics(fullEvent);
	}

	/**
	 * Log invalid ID attempts with detailed context
	 */
	logInvalidIdAttempt(req: Request, paramName: string, paramValue: string, resourceType: string): void {
		this.logSecurityEvent({
			type: SecurityEventType.INVALID_ID_ATTEMPT,
			severity: 'medium',
			userId: (req as any).user?.id,
			ip: req.ip || 'unknown',
			userAgent: req.get('user-agent') || 'unknown',
			route: req.originalUrl,
			method: req.method,
			details: {
				paramName,
				paramValue: this.sanitizeValue(paramValue),
				resourceType,
				route: req.route?.path,
				malformed: this.isMalformedUUID(paramValue),
				potentialAttack: this.isPotentialAttack(paramValue)
			}
		});
	}

	/**
	 * Log authentication failures
	 */
	logAuthFailure(req: Request, reason: string, attemptedUsername?: string): void {
		this.logSecurityEvent({
			type: SecurityEventType.AUTH_FAILURE,
			severity: 'high',
			ip: req.ip || 'unknown',
			userAgent: req.get('user-agent') || 'unknown',
			route: req.originalUrl,
			method: req.method,
			details: {
				reason,
				attemptedUsername: attemptedUsername ? this.sanitizeValue(attemptedUsername) : undefined,
				timestamp: new Date().toISOString()
			}
		});
	}

	/**
	 * Log webhook validation failures
	 */
	logWebhookFailure(req: Request, provider: string, reason: string): void {
		this.logSecurityEvent({
			type: SecurityEventType.WEBHOOK_VALIDATION_FAILURE,
			severity: 'high',
			ip: req.ip || 'unknown',
			userAgent: req.get('user-agent') || 'unknown',
			route: req.originalUrl,
			method: req.method,
			details: {
				provider,
				reason,
				headers: this.sanitizeHeaders(req.headers),
				bodySize: req.body ? JSON.stringify(req.body).length : 0
			}
		});
	}

	/**
	 * Log suspicious activity patterns
	 */
	logSuspiciousActivity(req: Request, pattern: string, confidence: number): void {
		this.logSecurityEvent({
			type: SecurityEventType.SUSPICIOUS_ACTIVITY,
			severity: confidence > 0.8 ? 'critical' : confidence > 0.6 ? 'high' : 'medium',
			userId: (req as any).user?.id,
			ip: req.ip || 'unknown',
			userAgent: req.get('user-agent') || 'unknown',
			route: req.originalUrl,
			method: req.method,
			details: {
				pattern,
				confidence,
				analysis: this.analyzeRequest(req)
			}
		});
	}

	/**
	 * Get security metrics for monitoring dashboard
	 */
	getSecurityMetrics(timeWindow: number = 3600000): SecurityMetrics {
		const now = new Date();
		const events = this.getRecentEvents(timeWindow);

		return {
			totalEvents: events.length,
			eventsByType: this.groupEventsByType(events),
			eventsBySeverity: this.groupEventsBySeverity(events),
			topSourceIPs: this.getTopSourceIPs(events),
			timeWindow,
			generatedAt: now
		};
	}

	private logEvent(event: SecurityEvent): void {
		const logData = {
			securityEvent: event.type,
			severity: event.severity,
			userId: event.userId,
			ip: event.ip,
			userAgent: event.userAgent,
			route: event.route,
			method: event.method,
			details: event.details,
			timestamp: event.timestamp.toISOString()
		};

		switch (event.severity) {
			case 'critical':
				logger.error('[SECURITY CRITICAL]', logData);
				break;
			case 'high':
				logger.error('[SECURITY HIGH]', logData);
				break;
			case 'medium':
				logger.warn('[SECURITY MEDIUM]', logData);
				break;
			case 'low':
				logger.info('[SECURITY LOW]', logData);
				break;
		}
	}

	private checkAlertThresholds(event: SecurityEvent): void {
		const threshold = this.alertThresholds[event.type];
		if (!threshold) return;

		const key = `${event.type}:${event.ip}`;
		const now = new Date();
		
		const existing = this.eventCounts.get(key);
		if (!existing) {
			this.eventCounts.set(key, { count: 1, firstSeen: now });
			return;
		}

		// Check if we're within the time window
		if (now.getTime() - existing.firstSeen.getTime() <= threshold.window) {
			existing.count++;
			
			// Threshold breached - send alert
			if (existing.count >= threshold.count) {
				this.sendSecurityAlert(event, existing.count, threshold);
				// Reset counter after alert
				this.eventCounts.delete(key);
			}
		} else {
			// Reset counter if outside window
			this.eventCounts.set(key, { count: 1, firstSeen: now });
		}
	}

	private sendSecurityAlert(event: SecurityEvent, count: number, threshold: any): void {
		logger.error('[SECURITY ALERT TRIGGERED]', {
			alertType: event.type,
			severity: 'critical',
			triggerCount: count,
			threshold: threshold.count,
			timeWindow: threshold.window,
			sourceIP: event.ip,
			route: event.route,
			details: event.details,
			timestamp: new Date().toISOString()
		});

		// In production, this would trigger external alerts (Slack, PagerDuty, etc.)
		// For now, we ensure it's prominently logged
	}

	private updateMetrics(event: SecurityEvent): void {
		// Store metrics for monitoring dashboard
		// In production, this might update Redis or a metrics database
	}

	private sanitizeValue(value: string): string {
		// Truncate and sanitize potentially malicious input for logging
		return value.substring(0, 100).replace(/[^\w\-._]/g, '[FILTERED]');
	}

	private sanitizeHeaders(headers: any): Record<string, string> {
		const safe: Record<string, string> = {};
		const allowedHeaders = ['content-type', 'content-length', 'user-agent', 'x-forwarded-for'];
		
		for (const header of allowedHeaders) {
			if (headers[header]) {
				safe[header] = String(headers[header]).substring(0, 200);
			}
		}
		
		return safe;
	}

	private isMalformedUUID(value: string): boolean {
		// Check if it looks like a UUID attempt but is malformed
		return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}/.test(value) && 
			   !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
	}

	private isPotentialAttack(value: string): boolean {
		// Check for common attack patterns
		const attackPatterns = [
			/['";]/,              // SQL injection attempts
			/<script/i,           // XSS attempts
			/\.\./,               // Path traversal
			/union.*select/i,     // SQL union attacks
			/javascript:/i,       // JavaScript protocol
			/data:/i,             // Data protocol
		];

		return attackPatterns.some(pattern => pattern.test(value));
	}

	private analyzeRequest(req: Request): any {
		return {
			hasAuthHeader: !!req.headers.authorization,
			bodySize: req.body ? JSON.stringify(req.body).length : 0,
			queryParamCount: Object.keys(req.query).length,
			suspiciousHeaders: this.findSuspiciousHeaders(req.headers)
		};
	}

	private findSuspiciousHeaders(headers: any): string[] {
		const suspicious = [];
		
		if (headers['x-forwarded-for'] && headers['x-forwarded-for'].split(',').length > 5) {
			suspicious.push('excessive_forwarded_ips');
		}
		
		if (headers['user-agent'] && headers['user-agent'].length < 10) {
			suspicious.push('short_user_agent');
		}
		
		return suspicious;
	}

	private getRecentEvents(timeWindow: number): SecurityEvent[] {
		// In production, this would query from persistent storage
		// For now, return empty array as this is just the interface
		return [];
	}

	private groupEventsByType(events: SecurityEvent[]): Record<string, number> {
		return events.reduce((acc, event) => {
			acc[event.type] = (acc[event.type] || 0) + 1;
			return acc;
		}, {} as Record<string, number>);
	}

	private groupEventsBySeverity(events: SecurityEvent[]): Record<string, number> {
		return events.reduce((acc, event) => {
			acc[event.severity] = (acc[event.severity] || 0) + 1;
			return acc;
		}, {} as Record<string, number>);
	}

	private getTopSourceIPs(events: SecurityEvent[]): Array<{ ip: string; count: number }> {
		const ipCounts = events.reduce((acc, event) => {
			acc[event.ip] = (acc[event.ip] || 0) + 1;
			return acc;
		}, {} as Record<string, number>);

		return Object.entries(ipCounts)
			.map(([ip, count]) => ({ ip, count }))
			.sort((a, b) => b.count - a.count)
			.slice(0, 10);
	}
}

export interface SecurityMetrics {
	totalEvents: number;
	eventsByType: Record<string, number>;
	eventsBySeverity: Record<string, number>;
	topSourceIPs: Array<{ ip: string; count: number }>;
	timeWindow: number;
	generatedAt: Date;
}

// Export singleton instance
export const securityMonitor = new SecurityMonitorService();