/**
 * Comprehensive Audit Logging System
 *
 * Records security-relevant events, user actions, and system changes
 */

import { logger } from '../logger';
import type { UserId, Id } from '@shared/types/ids';
import { userService } from '../services/user.service';
import fs from 'fs/promises';
import path from 'path';

export type AuditEventType =
	| 'auth.login'
	| 'auth.logout'
	| 'auth.failed_login'
	| 'auth.password_change'
	| 'auth.account_created'
	| 'auth.account_deleted'
	| 'forum.thread_created'
	| 'forum.thread_deleted'
	| 'forum.post_created'
	| 'forum.post_edited'
	| 'forum.post_deleted'
	| 'forum.moderation_action'
	| 'admin.user_role_changed'
	| 'admin.system_config_changed'
	| 'admin.data_export'
	| 'security.permission_denied'
	| 'security.rate_limit_exceeded'
	| 'security.suspicious_activity'
	| 'wallet.transaction'
	| 'wallet.deposit'
	| 'wallet.withdrawal'
	| 'system.startup'
	| 'system.shutdown'
	| 'system.error';

export type AuditSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface AuditEvent {
	id: string;
	timestamp: string;
	type: AuditEventType;
	severity: AuditSeverity;
	actor: {
		userId?: UserId;
		username?: string;
		ipAddress: string;
		userAgent?: string;
		sessionId?: string;
	};
	target?: {
		type: 'user' | 'thread' | 'post' | 'forum' | 'system';
		id?: Id<'id'> | string;
		name?: string;
	};
	action: string;
	details: {
		description: string;
		metadata?: Record<string, any>;
		changes?: {
			before?: any;
			after?: any;
		};
	};
	context: {
		path?: string;
		method?: string;
		statusCode?: number;
		responseTime?: number;
	};
}

class AuditLogger {
	private auditDir: string;
	private events: AuditEvent[] = [];
	private readonly MAX_MEMORY_EVENTS = 1000;
	private readonly FLUSH_INTERVAL = 60000; // 1 minute

	constructor() {
		this.auditDir = path.join(process.cwd(), '.claude', 'audit');
		this.ensureAuditDirectory();

		// Periodic flush to disk
		setInterval(() => this.flushToDisk(), this.FLUSH_INTERVAL);

		// Graceful shutdown handling
		process.on('SIGTERM', () => this.flushToDisk());
		process.on('SIGINT', () => this.flushToDisk());
	}

	/**
	 * Log an audit event
	 */
	async log(
		type: AuditEventType,
		action: string,
		actor: Partial<AuditEvent['actor']>,
		options: {
			severity?: AuditSeverity;
			target?: AuditEvent['target'];
			description: string;
			metadata?: Record<string, any>;
			changes?: { before?: any; after?: any };
			context?: AuditEvent['context'];
		}
	): Promise<void> {
		const event: AuditEvent = {
			id: this.generateEventId(),
			timestamp: new Date().toISOString(),
			type,
			severity: options.severity || this.determineSeverity(type),
			actor: {
				ipAddress: actor.ipAddress || 'unknown',
				userId: actor.userId,
				username: actor.username,
				userAgent: actor.userAgent,
				sessionId: actor.sessionId
			},
			target: options.target,
			action,
			details: {
				description: options.description,
				metadata: options.metadata,
				changes: options.changes
			},
			context: options.context || {}
		};

		// Add to memory buffer
		this.events.push(event);

		// Log to application logger as well
		const logLevel = this.getLogLevel(event.severity);
		logger[logLevel]('Audit', `${event.type}: ${event.action}`, {
			eventId: event.id,
			userId: event.actor.userId,
			ipAddress: event.actor.ipAddress,
			target: event.target,
			details: event.details
		});

		// Flush if buffer is full or critical event
		if (this.events.length >= this.MAX_MEMORY_EVENTS || event.severity === 'critical') {
			await this.flushToDisk();
		}
	}

	/**
	 * Log authentication events
	 */
	async logAuth(
		type: Extract<
			AuditEventType,
			'auth.login' | 'auth.logout' | 'auth.failed_login' | 'auth.password_change'
		>,
		userId: UserId | undefined,
		username: string | undefined,
		ipAddress: string,
		userAgent?: string,
		metadata?: Record<string, any>
	): Promise<void> {
		await this.log(
			type,
			type.replace('auth.', ''),
			{ userId, username, ipAddress, userAgent },
			{
				severity: type === 'auth.failed_login' ? 'medium' : 'low',
				description: `User ${type.replace('auth.', '').replace('_', ' ')}`,
				metadata
			}
		);
	}

	/**
	 * Log forum events
	 */
	async logForum(
		type: Extract<
			AuditEventType,
			| 'forum.thread_created'
			| 'forum.thread_deleted'
			| 'forum.post_created'
			| 'forum.post_edited'
			| 'forum.post_deleted'
			| 'forum.moderation_action'
		>,
		action: string,
		userId: UserId,
		username: string,
		ipAddress: string,
		target: AuditEvent['target'],
		metadata?: Record<string, any>,
		changes?: { before?: any; after?: any }
	): Promise<void> {
		await this.log(
			type,
			action,
			{ userId, username, ipAddress },
			{
				severity: type === 'forum.moderation_action' ? 'medium' : 'low',
				target,
				description: `Forum ${action} by ${username}`,
				metadata,
				changes
			}
		);
	}

	/**
	 * Log admin events
	 */
	async logAdmin(
		type: Extract<
			AuditEventType,
			'admin.user_role_changed' | 'admin.system_config_changed' | 'admin.data_export'
		>,
		action: string,
		userId: UserId,
		username: string,
		ipAddress: string,
		target?: AuditEvent['target'],
		changes?: { before?: any; after?: any },
		metadata?: Record<string, any>
	): Promise<void> {
		await this.log(
			type,
			action,
			{ userId, username, ipAddress },
			{
				severity: 'high',
				target,
				description: `Admin ${action} by ${username}`,
				metadata,
				changes
			}
		);
	}

	/**
	 * Log security events
	 */
	async logSecurity(
		type: Extract<
			AuditEventType,
			'security.permission_denied' | 'security.rate_limit_exceeded' | 'security.suspicious_activity'
		>,
		action: string,
		ipAddress: string,
		userId?: UserId,
		username?: string,
		context?: AuditEvent['context'],
		metadata?: Record<string, any>
	): Promise<void> {
		await this.log(
			type,
			action,
			{ userId, username, ipAddress },
			{
				severity: type === 'security.suspicious_activity' ? 'critical' : 'medium',
				description: `Security event: ${action}`,
				context,
				metadata
			}
		);
	}

	/**
	 * Log wallet/financial events
	 */
	async logWallet(
		type: Extract<AuditEventType, 'wallet.transaction' | 'wallet.deposit' | 'wallet.withdrawal'>,
		action: string,
		userId: UserId,
		username: string,
		ipAddress: string,
		amount: number,
		currency: string,
		metadata?: Record<string, any>
	): Promise<void> {
		await this.log(
			type,
			action,
			{ userId, username, ipAddress },
			{
				severity: 'high',
				target: { type: 'user', id: userId, name: username },
				description: `${action} of ${amount} ${currency}`,
				metadata: {
					...metadata,
					amount,
					currency
				}
			}
		);
	}

	/**
	 * Search audit events
	 */
	async searchEvents(filters: {
		type?: AuditEventType;
		userId?: UserId;
		ipAddress?: string;
		severity?: AuditSeverity;
		startDate?: Date;
		endDate?: Date;
		limit?: number;
	}): Promise<AuditEvent[]> {
		const allEvents = await this.loadAllEvents();

		return allEvents
			.filter((event) => {
				if (filters.type && event.type !== filters.type) return false;
				if (filters.userId && event.actor.userId !== filters.userId) return false;
				if (filters.ipAddress && event.actor.ipAddress !== filters.ipAddress) return false;
				if (filters.severity && event.severity !== filters.severity) return false;
				if (filters.startDate && new Date(event.timestamp) < filters.startDate) return false;
				if (filters.endDate && new Date(event.timestamp) > filters.endDate) return false;
				return true;
			})
			.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
			.slice(0, filters.limit || 100);
	}

	/**
	 * Get audit summary
	 */
	async getAuditSummary(days = 7): Promise<{
		totalEvents: number;
		eventsByType: Record<AuditEventType, number>;
		eventsBySeverity: Record<AuditSeverity, number>;
		uniqueUsers: number;
		uniqueIPs: number;
	}> {
		const startDate = new Date();
		startDate.setDate(startDate.getDate() - days);

		const events = await this.searchEvents({ startDate });

		const eventsByType = events.reduce(
			(acc, event) => {
				acc[event.type] = (acc[event.type] || 0) + 1;
				return acc;
			},
			{} as Record<AuditEventType, number>
		);

		const eventsBySeverity = events.reduce(
			(acc, event) => {
				acc[event.severity] = (acc[event.severity] || 0) + 1;
				return acc;
			},
			{} as Record<AuditSeverity, number>
		);

		const uniqueUsers = new Set(events.map((e) => e.actor.userId).filter(Boolean)).size;
		const uniqueIPs = new Set(events.map((e) => e.actor.ipAddress)).size;

		return {
			totalEvents: events.length,
			eventsByType,
			eventsBySeverity,
			uniqueUsers,
			uniqueIPs
		};
	}

	/**
	 * Flush events to disk
	 */
	private async flushToDisk(): Promise<void> {
		if (this.events.length === 0) return;

		try {
			const today = new Date().toISOString().split('T')[0];
			const filename = path.join(this.auditDir, `${today}.jsonl`);

			const lines = this.events.map((event) => JSON.stringify(event)).join('\n') + '\n';
			await fs.appendFile(filename, lines, 'utf8');

			this.events = [];
		} catch (error) {
			logger.error('AuditLogger', 'Failed to flush audit events to disk', { error });
		}
	}

	/**
	 * Load all events from disk and memory
	 */
	private async loadAllEvents(): Promise<AuditEvent[]> {
		const allEvents = [...this.events];

		try {
			const files = await fs.readdir(this.auditDir);
			const jsonlFiles = files.filter((f) => f.endsWith('.jsonl'));

			for (const file of jsonlFiles) {
				const content = await fs.readFile(path.join(this.auditDir, file), 'utf8');
				const lines = content.trim().split('\n').filter(Boolean);

				for (const line of lines) {
					try {
						const event = JSON.parse(line) as AuditEvent;
						allEvents.push(event);
					} catch (parseError) {
						// Skip invalid lines
					}
				}
			}
		} catch (error) {
			logger.error('AuditLogger', 'Failed to load audit events from disk', { error });
		}

		return allEvents.sort(
			(a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
		);
	}

	/**
	 * Ensure audit directory exists
	 */
	private async ensureAuditDirectory(): Promise<void> {
		try {
			await fs.mkdir(this.auditDir, { recursive: true });
		} catch (error) {
			logger.error('AuditLogger', 'Failed to create audit directory', { error });
		}
	}

	/**
	 * Generate unique event ID
	 */
	private generateEventId(): string {
		return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	}

	/**
	 * Determine severity based on event type
	 */
	private determineSeverity(type: AuditEventType): AuditSeverity {
		const severityMap: Record<AuditEventType, AuditSeverity> = {
			'auth.login': 'low',
			'auth.logout': 'low',
			'auth.failed_login': 'medium',
			'auth.password_change': 'medium',
			'auth.account_created': 'low',
			'auth.account_deleted': 'high',
			'forum.thread_created': 'low',
			'forum.thread_deleted': 'medium',
			'forum.post_created': 'low',
			'forum.post_edited': 'low',
			'forum.post_deleted': 'medium',
			'forum.moderation_action': 'medium',
			'admin.user_role_changed': 'high',
			'admin.system_config_changed': 'high',
			'admin.data_export': 'high',
			'security.permission_denied': 'medium',
			'security.rate_limit_exceeded': 'medium',
			'security.suspicious_activity': 'critical',
			'wallet.transaction': 'high',
			'wallet.deposit': 'high',
			'wallet.withdrawal': 'high',
			'system.startup': 'low',
			'system.shutdown': 'low',
			'system.error': 'medium'
		};

		return severityMap[type] || 'low';
	}

	/**
	 * Get log level from severity
	 */
	private getLogLevel(severity: AuditSeverity): 'info' | 'warn' | 'error' {
		switch (severity) {
			case 'critical':
			case 'high':
				return 'error';
			case 'medium':
				return 'warn';
			default:
				return 'info';
		}
	}
}

// Global audit logger instance
export const auditLogger = new AuditLogger();

/**
 * Express middleware to automatically log HTTP requests
 */
export function auditMiddleware(req: any, res: any, next: any) {
	const startTime = Date.now();

	// Get user info if available
	const user = userService.getUserFromRequest(req);
	const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
	const userAgent = req.get('User-Agent');

	res.on('finish', async () => {
		const responseTime = Date.now() - startTime;

		// Only audit significant events or errors
		if (res.statusCode >= 400 || req.method !== 'GET') {
			await auditLogger.log(
				'security.permission_denied',
				`${req.method} ${req.path}`,
				{
					userId: user?.id,
					username: user?.username,
					ipAddress,
					userAgent,
					sessionId: req.sessionID
				},
				{
					severity: res.statusCode >= 500 ? 'high' : 'medium',
					description: `HTTP ${req.method} ${req.path} - ${res.statusCode}`,
					context: {
						path: req.path,
						method: req.method,
						statusCode: res.statusCode,
						responseTime
					},
					metadata: {
						query: req.query,
						body: req.method !== 'GET' ? req.body : undefined
					}
				}
			);
		}
	});

	next();
}
