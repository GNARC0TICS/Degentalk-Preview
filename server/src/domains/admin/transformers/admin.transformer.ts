/**
 * Admin Data Transformer - Security-First Implementation
 *
 * Transforms admin dashboard data, audit logs, and administrative operations
 * into role-appropriate response objects with proper security controls.
 */

import type { AdminId, UserId, DgtAmount } from '@shared/types/ids';
import { createHash } from 'crypto';
import { logger } from '@core/logger';

// Admin Dashboard Interfaces
export interface AdminDashboardStats {
	platform: {
		totalUsers: number;
		activeUsers: number;
		bannedUsers: number;
		newUsers24h: number;
		totalThreads?: number;
		totalPosts?: number;
		totalTransactions?: number;
	};
	security: {
		pendingReports: number;
		recentBans: number;
		suspiciousActivity: number;
		riskScore: 'low' | 'medium' | 'high';
	};
	engagement: {
		dailyActiveUsers: number;
		weeklyActiveUsers: number;
		averageSessionTime: number;
		totalRevenue?: DgtAmount;
	};
	lastUpdated: string;
}

export interface SuperAdminDashboardStats extends AdminDashboardStats {
	system: {
		serverHealth: 'healthy' | 'warning' | 'critical';
		databaseSize: number;
		errorRate: number;
		responseTime: number;
		uptime: number;
	};
	financial: {
		totalRevenue: DgtAmount;
		monthlyRevenue: DgtAmount;
		pendingPayouts: DgtAmount;
		walletBalance: DgtAmount;
	};
	analytics: {
		conversionRate: number;
		churnRate: number;
		lifetimeValue: number;
	};
}

// Admin Action Log Interfaces
export interface AdminActionLog {
	id: string;
	adminId: AdminId;
	adminUsername: string;
	action: string;
	entityType: string;
	entityId: string;
	timestamp: string;
	summary: string;
	severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface DetailedAdminActionLog extends AdminActionLog {
	details: Record<string, any>;
	ipAddress?: string; // Hashed for privacy
	userAgent?: string; // Sanitized
	duration?: number;
	affectedUsers?: number;
	reverseAction?: string;
}

// Admin Operation Interfaces
export interface AdminOperationResult {
	success: boolean;
	message: string;
	operation: string;
	entityType: string;
	entityId: string;
	timestamp: string;
	adminId: AdminId;
	affectedCount?: number;
	warnings?: string[];
}

export interface AdminUserView {
	id: UserId;
	username: string;
	email?: string; // Only for high-level admins
	role: string;
	status: 'active' | 'banned' | 'suspended' | 'pending';
	joinedAt: string;
	lastActiveAt?: string;
	flags: string[];
	riskScore: number;
	totalActions: number;
	totalReports: number;
	walletBalance?: DgtAmount;
	ipAddress?: string; // Hashed
	metadata: {
		loginCount: number;
		failedLogins: number;
		lastIpChange: string;
		deviceCount: number;
	};
}

export class AdminTransformer {
	/**
	 * Transform dashboard statistics for admin view
	 */
	static toAdminDashboard(
		rawStats: any,
		requestingAdmin: any,
		securityMetrics?: any
	): AdminDashboardStats {
		if (!rawStats) {
			throw new Error('Invalid dashboard stats provided to transformer');
		}

		return {
			platform: {
				totalUsers: rawStats.users?.total || 0,
				activeUsers: rawStats.users?.active || 0,
				bannedUsers: rawStats.users?.banned || 0,
				newUsers24h: rawStats.users?.new24h || 0,
				totalThreads: rawStats.content?.threads || 0,
				totalPosts: rawStats.content?.posts || 0,
				totalTransactions: rawStats.wallet?.transactions || 0
			},
			security: {
				pendingReports: securityMetrics?.pendingReports || 0,
				recentBans: securityMetrics?.recentBans || 0,
				suspiciousActivity: securityMetrics?.suspiciousActivity || 0,
				riskScore: this.calculatePlatformRisk(securityMetrics)
			},
			engagement: {
				dailyActiveUsers: rawStats.engagement?.dau || 0,
				weeklyActiveUsers: rawStats.engagement?.wau || 0,
				averageSessionTime: rawStats.engagement?.avgSession || 0,
				totalRevenue: this.sanitizeDgtAmount(rawStats.financial?.totalRevenue)
			},
			lastUpdated: new Date().toISOString()
		};
	}

	/**
	 * Transform dashboard statistics for super admin view
	 */
	static toSuperAdminDashboard(
		rawStats: any,
		requestingAdmin: any,
		systemMetrics?: any
	): SuperAdminDashboardStats {
		const baseStats = this.toAdminDashboard(rawStats, requestingAdmin);

		return {
			...baseStats,
			system: {
				serverHealth: this.determineSystemHealth(systemMetrics),
				databaseSize: systemMetrics?.dbSize || 0,
				errorRate: systemMetrics?.errorRate || 0,
				responseTime: systemMetrics?.responseTime || 0,
				uptime: systemMetrics?.uptime || 0
			},
			financial: {
				totalRevenue: this.sanitizeDgtAmount(rawStats.financial?.totalRevenue),
				monthlyRevenue: this.sanitizeDgtAmount(rawStats.financial?.monthlyRevenue),
				pendingPayouts: this.sanitizeDgtAmount(rawStats.financial?.pendingPayouts),
				walletBalance: this.sanitizeDgtAmount(rawStats.financial?.walletBalance)
			},
			analytics: {
				conversionRate: rawStats.analytics?.conversionRate || 0,
				churnRate: rawStats.analytics?.churnRate || 0,
				lifetimeValue: rawStats.analytics?.lifetimeValue || 0
			}
		};
	}

	/**
	 * Transform admin action log for display
	 */
	static toAdminActionLog(
		rawAction: any,
		requestingAdmin: any,
		includeDetails: boolean = false
	): AdminActionLog | DetailedAdminActionLog {
		if (!rawAction) {
			throw new Error('Invalid action log provided to transformer');
		}

		const baseLog: AdminActionLog = {
			id: rawAction.id,
			adminId: rawAction.userId as AdminId,
			adminUsername: rawAction.username || 'Unknown Admin',
			action: rawAction.action,
			entityType: rawAction.entityType,
			entityId: rawAction.entityId,
			timestamp: rawAction.createdAt || new Date().toISOString(),
			summary: this.generateActionSummary(rawAction),
			severity: this.calculateActionSeverity(rawAction.action, rawAction.entityType)
		};

		if (includeDetails && this.canViewFullDetails(requestingAdmin)) {
			return {
				...baseLog,
				details: this.sanitizeActionDetails(rawAction.details),
				ipAddress: this.hashIpAddress(rawAction.ipAddress),
				userAgent: this.sanitizeUserAgent(rawAction.userAgent),
				duration: rawAction.duration,
				affectedUsers: rawAction.affectedUsers || 0,
				reverseAction: this.determineReverseAction(rawAction.action, rawAction.entityType)
			};
		}

		return baseLog;
	}

	/**
	 * Transform admin operation result
	 */
	static toAdminOperationResult(
		operation: string,
		success: boolean,
		message: string,
		entityType: string,
		entityId: string,
		adminId: AdminId,
		metadata?: any
	): AdminOperationResult {
		return {
			success,
			message,
			operation,
			entityType,
			entityId,
			timestamp: new Date().toISOString(),
			adminId,
			affectedCount: metadata?.affectedCount || 0,
			warnings: metadata?.warnings || []
		};
	}

	/**
	 * Transform user data for admin view
	 */
	static toAdminUserView(rawUser: any, requestingAdmin: any, userMetrics?: any): AdminUserView {
		if (!rawUser) {
			throw new Error('Invalid user data provided to transformer');
		}

		const canViewSensitiveData = this.canViewSensitiveUserData(requestingAdmin);

		return {
			id: rawUser.id as UserId,
			username: rawUser.username,
			email: canViewSensitiveData ? rawUser.email : undefined,
			role: rawUser.role,
			status: this.determineUserStatus(rawUser),
			joinedAt: rawUser.createdAt || rawUser.joinedAt,
			lastActiveAt: rawUser.lastSeenAt || rawUser.lastActiveAt,
			flags: rawUser.flags || [],
			riskScore: this.calculateUserRiskScore(rawUser, userMetrics),
			totalActions: userMetrics?.totalActions || 0,
			totalReports: userMetrics?.totalReports || 0,
			walletBalance: canViewSensitiveData ? this.sanitizeDgtAmount(rawUser.dgtBalance) : undefined,
			ipAddress: canViewSensitiveData ? this.hashIpAddress(rawUser.lastIpAddress) : undefined,
			metadata: {
				loginCount: userMetrics?.loginCount || 0,
				failedLogins: userMetrics?.failedLogins || 0,
				lastIpChange: userMetrics?.lastIpChange || '',
				deviceCount: userMetrics?.deviceCount || 0
			}
		};
	}

	/**
	 * Transform multiple action logs for list view
	 */
	static toAdminActionLogList(
		rawActions: any[],
		requestingAdmin: any,
		includeDetails: boolean = false
	): (AdminActionLog | DetailedAdminActionLog)[] {
		return rawActions.map((action) =>
			this.toAdminActionLog(action, requestingAdmin, includeDetails)
		);
	}

	/**
	 * Transform multiple users for admin list view
	 */
	static toAdminUserList(
		rawUsers: any[],
		requestingAdmin: any,
		userMetrics?: Record<string, any>
	): AdminUserView[] {
		return rawUsers.map((user) =>
			this.toAdminUserView(user, requestingAdmin, userMetrics?.[user.id])
		);
	}

	// Private helper methods
	private static sanitizeDgtAmount(amount: any): DgtAmount {
		const num = Number(amount);
		return Math.max(0, isNaN(num) ? 0 : num) as DgtAmount;
	}

	private static calculatePlatformRisk(metrics: any): 'low' | 'medium' | 'high' {
		const riskFactors = [
			(metrics?.suspiciousActivity || 0) > 10,
			(metrics?.recentBans || 0) > 5,
			(metrics?.errorRate || 0) > 0.05
		];

		const riskCount = riskFactors.filter(Boolean).length;
		return riskCount >= 2 ? 'high' : riskCount === 1 ? 'medium' : 'low';
	}

	private static determineSystemHealth(metrics: any): 'healthy' | 'warning' | 'critical' {
		if (!metrics) return 'healthy';

		const criticalThresholds = [
			metrics.errorRate > 0.1,
			metrics.responseTime > 5000,
			metrics.uptime < 0.95
		];

		const warningThresholds = [
			metrics.errorRate > 0.05,
			metrics.responseTime > 2000,
			metrics.uptime < 0.98
		];

		if (criticalThresholds.some(Boolean)) return 'critical';
		if (warningThresholds.some(Boolean)) return 'warning';
		return 'healthy';
	}

	private static generateActionSummary(action: any): string {
		const actionMap: Record<string, string> = {
			'user.ban': `Banned user`,
			'user.unban': `Unbanned user`,
			'user.suspend': `Suspended user`,
			'post.delete': `Deleted post`,
			'thread.lock': `Locked thread`,
			'wallet.adjust': `Adjusted wallet balance`,
			'role.change': `Changed user role`
		};

		return actionMap[action.action] || `Performed ${action.action}`;
	}

	private static calculateActionSeverity(
		action: string,
		entityType: string
	): 'low' | 'medium' | 'high' | 'critical' {
		const criticalActions = ['user.ban', 'user.delete', 'wallet.adjust', 'system.shutdown'];
		const highActions = ['user.suspend', 'role.change', 'thread.delete'];
		const mediumActions = ['post.delete', 'thread.lock', 'user.warn'];

		if (criticalActions.includes(action)) return 'critical';
		if (highActions.includes(action)) return 'high';
		if (mediumActions.includes(action)) return 'medium';
		return 'low';
	}

	private static canViewFullDetails(admin: any): boolean {
		const highLevelRoles = ['super_admin', 'admin'];
		return highLevelRoles.includes(admin?.role?.toLowerCase());
	}

	private static canViewSensitiveUserData(admin: any): boolean {
		const sensitiveRoles = ['super_admin', 'admin'];
		return sensitiveRoles.includes(admin?.role?.toLowerCase());
	}

	private static sanitizeActionDetails(details: any): Record<string, any> {
		if (!details) return {};

		// Remove sensitive information from action details
		const sanitized = { ...details };

		// Remove potential passwords, tokens, etc.
		const sensitiveKeys = ['password', 'token', 'secret', 'key', 'private'];
		sensitiveKeys.forEach((key) => {
			if (sanitized[key]) {
				sanitized[key] = '[REDACTED]';
			}
		});

		return sanitized;
	}

	private static hashIpAddress(ipAddress: string): string {
		if (!ipAddress) return '';
		return createHash('sha256').update(ipAddress).digest('hex').substring(0, 8);
	}

	private static sanitizeUserAgent(userAgent: string): string {
		if (!userAgent) return '';
		// Remove potentially identifying information while keeping useful browser info
		return userAgent
			.replace(/\([^)]*\)/g, '')
			.trim()
			.substring(0, 100);
	}

	private static determineReverseAction(action: string, entityType: string): string {
		const reverseMap: Record<string, string> = {
			'user.ban': 'user.unban',
			'user.unban': 'user.ban',
			'user.suspend': 'user.unsuspend',
			'thread.lock': 'thread.unlock',
			'post.delete': 'post.restore'
		};

		return reverseMap[action] || '';
	}

	private static determineUserStatus(user: any): 'active' | 'banned' | 'suspended' | 'pending' {
		if (user.isBanned) return 'banned';
		if (user.isSuspended) return 'suspended';
		if (!user.isActive) return 'pending';
		return 'active';
	}

	private static calculateUserRiskScore(user: any, metrics: any): number {
		// Simple risk scoring algorithm
		let score = 0;

		if (user.flags?.length > 0) score += user.flags.length * 10;
		if (metrics?.totalReports > 0) score += metrics.totalReports * 5;
		if (metrics?.failedLogins > 5) score += 20;
		if (
			user.createdAt &&
			new Date(user.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
		) {
			score += 10; // New account
		}

		return Math.min(100, score);
	}

	/**
	 * Transform admin error responses (security-conscious)
	 */
	static toAdminError(error: string, operation: string, entityType?: string) {
		// Sanitize error messages to prevent information disclosure
		const safeErrors: Record<string, string> = {
			user_not_found: 'User not found',
			insufficient_permissions: 'Insufficient permissions for this operation',
			operation_failed: 'Operation failed',
			invalid_request: 'Invalid request parameters',
			database_error: 'Database operation failed',
			rate_limited: 'Too many requests'
		};

		return {
			success: false,
			message: safeErrors[error] || 'Operation failed',
			operation,
			entityType: entityType || 'unknown',
			timestamp: new Date().toISOString()
			// Never expose: stack traces, internal errors, database details, etc.
		};
	}
}
