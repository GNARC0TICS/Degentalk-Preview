/**
 * Reputation Transformer - Security-First Implementation
 *
 * Transforms raw database reputation records into role-appropriate
 * response objects with GDPR compliance and admin data protection.
 */

import type { UserId, AchievementId, ReputationAmount } from '@shared/types/ids';
// import { UserTransformer } from '../../users/transformers/user.transformer'; // TODO: Add when available

// Public reputation data (leaderboards, etc.)
export interface PublicReputationAchievement {
	id: AchievementId;
	name: string;
	description?: string;
	iconUrl?: string;
	reputationReward: ReputationAmount;
	isEnabled: boolean;
}

// Authenticated user viewing achievements
export interface AuthenticatedReputationAchievement extends PublicReputationAchievement {
	// User progress tracking
	userProgress?: {
		isCompleted: boolean;
		progress: number;
		maxProgress: number;
		completedAt?: string;
	};

	// Display criteria (sanitized)
	criteria: {
		type: string;
		description: string;
		target: number;
	};
}

// Admin view with full management data
export interface AdminReputationAchievement extends AuthenticatedReputationAchievement {
	// System fields
	achievementKey: string;
	criteriaType?: string;
	criteriaValue?: number;

	// Admin metadata
	createdAt: string;
	adminNotes?: string;

	// Usage statistics
	stats: {
		totalCompletions: number;
		completionRate: number;
		avgTimeToComplete?: number;
		lastAwarded?: string;
	};
}

// Reputation log entries for different views
export interface PublicReputationLog {
	id: string;
	amount: ReputationAmount;
	reason: string;
	timestamp: string;

	// Public user info (if enabled by user)
	user?: {
		id: UserId;
		username: string;
		avatarUrl?: string;
		level: number;
	};
}

export interface AuthenticatedReputationLog extends PublicReputationLog {
	// Enhanced context for own logs
	source: 'achievement' | 'admin_grant' | 'event' | 'system';
	achievement?: {
		id: AchievementId;
		name: string;
		iconUrl?: string;
	};
}

export interface AdminReputationLog extends AuthenticatedReputationLog {
	// Full admin data
	systemData: {
		userId: UserId;
		achievementId?: AchievementId;
		adminId?: UserId;
		ipHash?: string; // Anonymized
	};

	// Admin metadata
	reviewedBy?: UserId;
	flagged: boolean;
	flagReason?: string;
}

export class ReputationTransformer {
	/**
	 * Transform achievement for public consumption
	 * Only shows basic achievement info for leaderboards/public displays
	 */
	static toPublicAchievement(dbAchievement: any): PublicReputationAchievement {
		if (!dbAchievement) {
			throw new Error('Invalid achievement data provided to transformer');
		}

		return {
			id: dbAchievement.id as AchievementId,
			name: dbAchievement.name,
			description: this.sanitizeDescription(dbAchievement.description),
			iconUrl: dbAchievement.iconUrl || undefined,
			reputationReward: this.sanitizeReputationAmount(dbAchievement.reputationReward),
			isEnabled: dbAchievement.enabled === true
		};
	}

	/**
	 * Transform achievement for authenticated users
	 * Includes user progress and sanitized criteria
	 */
	static toAuthenticatedAchievement(
		dbAchievement: any,
		requestingUser: any,
		userProgress?: any
	): AuthenticatedReputationAchievement {
		const publicData = this.toPublicAchievement(dbAchievement);

		return {
			...publicData,

			// User progress (if available)
			userProgress: userProgress
				? {
						isCompleted: userProgress.isCompleted === true,
						progress: userProgress.progress || 0,
						maxProgress: userProgress.maxProgress || dbAchievement.criteriaValue || 1,
						completedAt: userProgress.completedAt?.toISOString()
					}
				: undefined,

			// Sanitized criteria
			criteria: {
				type: this.normalizeCriteriaType(dbAchievement.criteriaType),
				description: this.generateCriteriaDescription(dbAchievement),
				target: dbAchievement.criteriaValue || 0
			}
		};
	}

	/**
	 * Transform achievement for admin view
	 * Includes all system data and usage statistics
	 */
	static toAdminAchievement(dbAchievement: any, stats?: any): AdminReputationAchievement {
		// Get authenticated data with admin permissions
		const authenticatedData = this.toAuthenticatedAchievement(dbAchievement, { role: 'admin' });

		return {
			...authenticatedData,

			// System fields
			achievementKey: dbAchievement.achievementKey,
			criteriaType: dbAchievement.criteriaType,
			criteriaValue: dbAchievement.criteriaValue,

			// Admin metadata
			createdAt: dbAchievement.createdAt.toISOString(),
			adminNotes: dbAchievement.adminNotes,

			// Usage statistics
			stats: {
				totalCompletions: stats?.totalCompletions || 0,
				completionRate: this.calculateCompletionRate(stats),
				avgTimeToComplete: stats?.avgTimeToComplete,
				lastAwarded: stats?.lastAwarded?.toISOString()
			}
		};
	}

	/**
	 * Transform reputation log for public consumption
	 * Only shows basic info for public activity feeds
	 */
	static toPublicReputationLog(dbLog: any): PublicReputationLog {
		return {
			id: dbLog.id,
			amount: this.sanitizeReputationAmount(dbLog.reputationEarned),
			reason: this.sanitizeReason(dbLog.reason, 'public'),
			timestamp: dbLog.createdAt.toISOString(),

			// Public user info (if enabled)
			user: dbLog.user
				? {
						id: dbLog.user.id as UserId,
						username: dbLog.user.username || '[deleted]',
						avatarUrl: dbLog.user.avatarUrl,
						level: this.calculateLevel(dbLog.user.xp || 0)
					}
				: undefined
		};
	}

	/**
	 * Transform reputation log for authenticated users viewing their own logs
	 */
	static toAuthenticatedReputationLog(dbLog: any, requestingUser: any): AuthenticatedReputationLog {
		const publicData = this.toPublicReputationLog(dbLog);

		return {
			...publicData,

			// Enhanced source identification
			source: this.identifyLogSource(dbLog),

			// Achievement context (if applicable)
			achievement: dbLog.achievement
				? {
						id: dbLog.achievement.id as AchievementId,
						name: dbLog.achievement.name,
						iconUrl: dbLog.achievement.iconUrl
					}
				: undefined
		};
	}

	/**
	 * Transform reputation log for admin view
	 * Includes all system data and moderation info
	 */
	static toAdminReputationLog(dbLog: any): AdminReputationLog {
		// Get authenticated data with admin permissions
		const authenticatedData = this.toAuthenticatedReputationLog(dbLog, { role: 'admin' });

		return {
			...authenticatedData,

			// System tracking
			systemData: {
				userId: dbLog.userId as UserId,
				achievementId: dbLog.achievementId as AchievementId,
				adminId: dbLog.adminId as UserId,
				ipHash: this.anonymizeIP(dbLog.ipAddress)
			},

			// Admin metadata
			reviewedBy: dbLog.reviewedBy as UserId,
			flagged: dbLog.flagged === true,
			flagReason: dbLog.flagReason
		};
	}

	/**
	 * Transform multiple achievements for list views
	 */
	static toAchievementList(
		achievements: any[],
		requestingUser: any,
		viewType: 'public' | 'authenticated' | 'admin' = 'public'
	) {
		switch (viewType) {
			case 'admin':
				return achievements.map((achievement) => this.toAdminAchievement(achievement));
			case 'authenticated':
				return achievements.map((achievement) =>
					this.toAuthenticatedAchievement(achievement, requestingUser)
				);
			default:
				return achievements.map((achievement) => this.toPublicAchievement(achievement));
		}
	}

	/**
	 * Transform reputation logs with pagination and summary
	 */
	static toReputationLogHistory(
		logs: any[],
		requestingUser: any,
		viewType: 'public' | 'authenticated' | 'admin' = 'public'
	) {
		let transformedLogs;

		switch (viewType) {
			case 'admin':
				transformedLogs = logs.map((log) => this.toAdminReputationLog(log));
				break;
			case 'authenticated':
				transformedLogs = logs.map((log) => this.toAuthenticatedReputationLog(log, requestingUser));
				break;
			default:
				transformedLogs = logs.map((log) => this.toPublicReputationLog(log));
		}

		return {
			logs: transformedLogs,
			summary: this.calculateLogSummary(logs, requestingUser)
		};
	}

	// ==========================================
	// PRIVATE UTILITY METHODS
	// ==========================================

	private static sanitizeReputationAmount(amount: any): ReputationAmount {
		const parsed = parseInt(amount?.toString() || '0', 10);
		return (isNaN(parsed) ? 0 : Math.max(0, parsed)) as ReputationAmount;
	}

	private static sanitizeDescription(description: string): string {
		if (!description) return '';
		return description.trim().substring(0, 200); // Limit length for security
	}

	private static sanitizeReason(reason: string, level: 'public' | 'authenticated'): string {
		if (!reason) return 'Achievement earned';

		if (level === 'public') {
			// More aggressive sanitization for public view
			return reason.replace(/admin|internal|system/gi, '').trim() || 'Achievement earned';
		}

		return reason.trim();
	}

	private static normalizeCriteriaType(criteriaType: string): string {
		const typeMap: Record<string, string> = {
			posts_created: 'Create Posts',
			likes_received: 'Receive Likes',
			threads_created: 'Create Threads',
			days_active: 'Active Days',
			dgt_earned: 'Earn DGT',
			tips_given: 'Give Tips'
		};

		return typeMap[criteriaType] || 'Complete Action';
	}

	private static generateCriteriaDescription(achievement: any): string {
		const { criteriaType, criteriaValue } = achievement;

		switch (criteriaType) {
			case 'posts_created':
				return `Create ${criteriaValue} posts`;
			case 'likes_received':
				return `Receive ${criteriaValue} likes`;
			case 'threads_created':
				return `Start ${criteriaValue} threads`;
			case 'days_active':
				return `Be active for ${criteriaValue} days`;
			case 'dgt_earned':
				return `Earn ${criteriaValue} DGT`;
			case 'tips_given':
				return `Give ${criteriaValue} tips`;
			default:
				return achievement.description || 'Complete the required action';
		}
	}

	private static identifyLogSource(dbLog: any): 'achievement' | 'admin_grant' | 'event' | 'system' {
		if (dbLog.achievementId) return 'achievement';
		if (dbLog.reason?.includes('Admin')) return 'admin_grant';
		if (dbLog.reason?.includes('Event') || dbLog.reason?.includes('Rain')) return 'event';
		return 'system';
	}

	private static calculateLevel(xp: number): number {
		// Basic level calculation - replace with actual level system
		return Math.floor(Math.sqrt(xp / 100)) + 1;
	}

	private static calculateCompletionRate(stats: any): number {
		if (!stats || !stats.totalUsers) return 0;
		return Math.round((stats.totalCompletions / stats.totalUsers) * 100);
	}

	private static calculateLogSummary(logs: any[], user: any) {
		const totalReputation = logs.reduce((sum, log) => sum + (log.reputationEarned || 0), 0);
		const achievementLogs = logs.filter((log) => log.achievementId);
		const adminLogs = logs.filter((log) => log.reason?.includes('Admin'));

		return {
			totalReputation,
			totalEntries: logs.length,
			fromAchievements: achievementLogs.length,
			fromAdminGrants: adminLogs.length,
			fromEvents: logs.length - achievementLogs.length - adminLogs.length
		};
	}

	private static anonymizeIP(ip?: string): string {
		if (!ip) return 'unknown';

		if (ip.includes(':')) {
			// IPv6
			const parts = ip.split(':');
			return parts.slice(0, 4).join(':') + '::***';
		} else {
			// IPv4
			const parts = ip.split('.');
			return parts.slice(0, 3).join('.') + '.***';
		}
	}
}
