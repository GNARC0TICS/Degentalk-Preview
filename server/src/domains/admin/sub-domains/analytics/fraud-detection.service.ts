/**
 * Fraud Detection Service
 *
 * Provides fraud detection and suspicious activity monitoring for the platform
 */

import { eq, desc, count, avg, sum, sql, and, gte, lte, gt, lt, inArray } from 'drizzle-orm';
import { db } from '@db';
import { adminCacheService } from '../../shared/admin-cache.service';
import {
	users,
	transactions,
	posts,
	threads,
	shoutboxMessages,
	userBans,
	auditLogs,
	analyticsEvents,
	xpLogs,
	postTips,
	rainEvents,
	userReferrals,
	referralSources
} from '@schema';
import type { UserId } from '@shared/types/ids';
import { logger } from '@core/logger';

export interface FraudAlert {
	id: string;
	type: 'suspicious_transactions' | 'unusual_activity' | 'potential_bot' | 'xp_manipulation' | 'referral_fraud' | 'multi_account';
	severity: 'low' | 'medium' | 'high' | 'critical';
	userId: UserId;
	username: string;
	description: string;
	evidence: Record<string, any>;
	score: number; // 0-100 fraud confidence score
	createdAt: Date;
	status: 'active' | 'investigating' | 'resolved' | 'false_positive';
	resolvedAt?: Date;
	resolvedBy?: UserId;
	notes?: string;
}

export interface FraudMetrics {
	activeAlerts: number;
	resolvedAlerts: number;
	falsePositives: number;
	averageResolutionTime: number;
	topFraudTypes: Array<{
		type: string;
		count: number;
		percentage: number;
	}>;
	riskDistribution: {
		low: number;
		medium: number;
		high: number;
		critical: number;
	};
}

export interface SuspiciousActivity {
	userId: UserId;
	username: string;
	activities: Array<{
		type: string;
		count: number;
		timeframe: string;
		threshold: number;
		risk: 'low' | 'medium' | 'high';
	}>;
	riskScore: number;
	lastActivity: Date;
}

export interface FraudDetectionSettings {
	transactionVelocityThreshold: number;
	multipleAccountThreshold: number;
	xpGainThreshold: number;
	referralFraudThreshold: number;
	enableAutoSuspension: boolean;
	autoSuspensionThreshold: number;
}

export class FraudDetectionService {
	private readonly CACHE_KEY_PREFIX = 'fraud_detection';
	private readonly DEFAULT_TTL = 300; // 5 minutes
	private readonly FRAUD_SCORE_THRESHOLD = 75;

	private settings: FraudDetectionSettings = {
		transactionVelocityThreshold: 50,
		multipleAccountThreshold: 3,
		xpGainThreshold: 1000,
		referralFraudThreshold: 5,
		enableAutoSuspension: true,
		autoSuspensionThreshold: 85
	};

	/**
	 * Get all active fraud alerts
	 */
	async getFraudAlerts(status?: 'active' | 'investigating' | 'resolved' | 'false_positive'): Promise<FraudAlert[]> {
		const cacheKey = `${this.CACHE_KEY_PREFIX}:alerts:${status || 'all'}`;

		return adminCacheService.getOrSet(
			cacheKey,
			async () => {
				// For now, return mock data - in production, this would query a fraud_alerts table
				const mockAlerts: FraudAlert[] = [
					{
						id: 'alert_001',
						type: 'suspicious_transactions',
						severity: 'high',
						userId: 'user_123' as UserId,
						username: 'suspicious_user',
						description: 'Unusual transaction pattern detected: 15 DGT transfers in 5 minutes',
						evidence: {
							transactionCount: 15,
							timeframe: '5 minutes',
							totalAmount: 5000,
							averageAmount: 333.33,
							recipientCount: 8
						},
						score: 82,
						createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
						status: 'active'
					},
					{
						id: 'alert_002',
						type: 'potential_bot',
						severity: 'medium',
						userId: 'user_456' as UserId,
						username: 'rapid_poster',
						description: 'Automated posting pattern detected: 50 posts in 1 hour',
						evidence: {
							postCount: 50,
							timeframe: '1 hour',
							averageInterval: 72, // seconds
							duplicateContent: 3,
							threadCount: 25
						},
						score: 68,
						createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
						status: 'investigating'
					},
					{
						id: 'alert_003',
						type: 'xp_manipulation',
						severity: 'critical',
						userId: 'user_789' as UserId,
						username: 'xp_farmer',
						description: 'Suspicious XP gain pattern: 2000 XP in 30 minutes',
						evidence: {
							xpGained: 2000,
							timeframe: '30 minutes',
							actions: ['post_create', 'thread_create', 'reaction_give'],
							actionCounts: { post_create: 40, thread_create: 20, reaction_give: 100 }
						},
						score: 95,
						createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
						status: 'active'
					}
				];

				return status ? mockAlerts.filter(alert => alert.status === status) : mockAlerts;
			},
			this.DEFAULT_TTL
		);
	}

	/**
	 * Get fraud detection metrics
	 */
	async getFraudMetrics(): Promise<FraudMetrics> {
		const cacheKey = `${this.CACHE_KEY_PREFIX}:metrics`;

		return adminCacheService.getOrSet(
			cacheKey,
			async () => {
				// Mock metrics - in production, calculate from actual data
				return {
					activeAlerts: 3,
					resolvedAlerts: 15,
					falsePositives: 2,
					averageResolutionTime: 4.2, // hours
					topFraudTypes: [
						{ type: 'suspicious_transactions', count: 8, percentage: 40 },
						{ type: 'potential_bot', count: 5, percentage: 25 },
						{ type: 'xp_manipulation', count: 4, percentage: 20 },
						{ type: 'referral_fraud', count: 3, percentage: 15 }
					],
					riskDistribution: {
						low: 2,
						medium: 6,
						high: 8,
						critical: 4
					}
				};
			},
			this.DEFAULT_TTL
		);
	}

	/**
	 * Analyze user for suspicious activity
	 */
	async analyzeUser(userId: UserId): Promise<SuspiciousActivity | null> {
		const cacheKey = `${this.CACHE_KEY_PREFIX}:user_analysis:${userId}`;

		return adminCacheService.getOrSet(
			cacheKey,
			async () => {
				const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
				const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

				// Get user info
				const [user] = await db
					.select({ id: users.id, username: users.username })
					.from(users)
					.where(eq(users.id, userId));

				if (!user) return null;

				// Analyze various activities
				const [
					recentTransactions,
					recentPosts,
					recentThreads,
					recentXpGains,
					recentTips
				] = await Promise.all([
					// Recent transactions
					db.select({ count: count() })
						.from(transactions)
						.where(and(
							eq(transactions.fromUserId, userId),
							gte(transactions.createdAt, oneHourAgo)
						)),
					
					// Recent posts
					db.select({ count: count() })
						.from(posts)
						.where(and(
							eq(posts.userId, userId),
							gte(posts.createdAt, oneHourAgo)
						)),
					
					// Recent threads
					db.select({ count: count() })
						.from(threads)
						.where(and(
							eq(threads.userId, userId),
							gte(threads.createdAt, oneHourAgo)
						)),
					
					// Recent XP gains
					db.select({ totalXp: sum(xpLogs.xpChange) })
						.from(xpLogs)
						.where(and(
							eq(xpLogs.userId, userId),
							gte(xpLogs.createdAt, oneHourAgo),
							gt(xpLogs.xpChange, 0)
						)),
					
					// Recent tips
					db.select({ count: count() })
						.from(postTips)
						.where(and(
							eq(postTips.fromUserId, userId),
							gte(postTips.createdAt, oneHourAgo)
						))
				]);

				const activities = [];
				let riskScore = 0;

				// Check transaction velocity
				const transactionCount = recentTransactions[0]?.count || 0;
				if (transactionCount > this.settings.transactionVelocityThreshold) {
					activities.push({
						type: 'high_transaction_velocity',
						count: transactionCount,
						timeframe: '1 hour',
						threshold: this.settings.transactionVelocityThreshold,
						risk: 'high' as const
					});
					riskScore += 25;
				}

				// Check posting activity
				const postCount = recentPosts[0]?.count || 0;
				if (postCount > 30) {
					activities.push({
						type: 'rapid_posting',
						count: postCount,
						timeframe: '1 hour',
						threshold: 30,
						risk: postCount > 50 ? 'high' : 'medium' as const
					});
					riskScore += postCount > 50 ? 20 : 10;
				}

				// Check thread creation
				const threadCount = recentThreads[0]?.count || 0;
				if (threadCount > 10) {
					activities.push({
						type: 'rapid_thread_creation',
						count: threadCount,
						timeframe: '1 hour',
						threshold: 10,
						risk: threadCount > 20 ? 'high' : 'medium' as const
					});
					riskScore += threadCount > 20 ? 15 : 8;
				}

				// Check XP farming
				const xpGained = Number(recentXpGains[0]?.totalXp || 0);
				if (xpGained > this.settings.xpGainThreshold) {
					activities.push({
						type: 'xp_farming',
						count: xpGained,
						timeframe: '1 hour',
						threshold: this.settings.xpGainThreshold,
						risk: xpGained > 2000 ? 'high' : 'medium' as const
					});
					riskScore += xpGained > 2000 ? 30 : 15;
				}

				// Check excessive tipping
				const tipCount = recentTips[0]?.count || 0;
				if (tipCount > 20) {
					activities.push({
						type: 'excessive_tipping',
						count: tipCount,
						timeframe: '1 hour',
						threshold: 20,
						risk: 'medium' as const
					});
					riskScore += 12;
				}

				return activities.length > 0 ? {
					userId,
					username: user.username,
					activities,
					riskScore: Math.min(riskScore, 100),
					lastActivity: new Date()
				} : null;
			},
			60 // 1 minute TTL for user analysis
		);
	}

	/**
	 * Run fraud detection scan
	 */
	async runFraudDetectionScan(): Promise<{
		newAlerts: number;
		usersScanned: number;
		highRiskUsers: number;
		autoSuspensions: number;
	}> {
		const cacheKey = `${this.CACHE_KEY_PREFIX}:scan_results`;

		return adminCacheService.getOrSet(
			cacheKey,
			async () => {
				const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
				
				// Get recently active users
				const activeUsers = await db
					.select({ userId: analyticsEvents.userId })
					.from(analyticsEvents)
					.where(gte(analyticsEvents.createdAt, oneHourAgo))
					.groupBy(analyticsEvents.userId)
					.limit(1000);

				let newAlerts = 0;
				let highRiskUsers = 0;
				let autoSuspensions = 0;

				// Analyze each user
				for (const { userId } of activeUsers) {
					if (!userId) continue;

					const analysis = await this.analyzeUser(userId);
					if (analysis && analysis.riskScore > this.FRAUD_SCORE_THRESHOLD) {
						newAlerts++;
						
						if (analysis.riskScore > 85) {
							highRiskUsers++;
						}

						// Auto-suspension if enabled and score is very high
						if (this.settings.enableAutoSuspension && 
							analysis.riskScore >= this.settings.autoSuspensionThreshold) {
							
							try {
								await this.autoSuspendUser(userId, analysis);
								autoSuspensions++;
							} catch (error) {
								logger.error('Auto-suspension failed:', error);
							}
						}
					}
				}

				return {
					newAlerts,
					usersScanned: activeUsers.length,
					highRiskUsers,
					autoSuspensions
				};
			},
			300 // 5 minute TTL
		);
	}

	/**
	 * Auto-suspend user based on fraud score
	 */
	private async autoSuspendUser(userId: UserId, analysis: SuspiciousActivity): Promise<void> {
		// Check if user is already banned
		const [user] = await db
			.select({ isBanned: users.isBanned })
			.from(users)
			.where(eq(users.id, userId));

		if (user?.isBanned) {
			return; // Already banned
		}

		// Create ban record
		await db.insert(userBans).values({
			userId,
			bannedBy: 'system' as UserId, // System ban
			reason: `Automatic fraud detection suspension. Risk score: ${analysis.riskScore}`,
			banType: 'automatic',
			createdAt: new Date(),
			isActive: true,
			isPermanent: false,
			expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hour suspension
		});

		// Update user status
		await db.update(users)
			.set({ isBanned: true })
			.where(eq(users.id, userId));

		// Log audit trail
		await db.insert(auditLogs).values({
			adminId: 'system' as UserId,
			action: 'AUTO_FRAUD_SUSPENSION',
			entityType: 'user',
			entityId: userId,
			details: {
				riskScore: analysis.riskScore,
				activities: analysis.activities,
				autoSuspension: true
			},
			timestamp: new Date()
		});

		logger.warn(`User ${userId} auto-suspended for fraud detection. Risk score: ${analysis.riskScore}`);
	}

	/**
	 * Resolve fraud alert
	 */
	async resolveAlert(
		alertId: string,
		status: 'resolved' | 'false_positive',
		adminId: UserId,
		notes?: string
	): Promise<boolean> {
		// In production, this would update the fraud_alerts table
		logger.info(`Fraud alert ${alertId} resolved by ${adminId} with status: ${status}`);
		
		// Clear cache to force refresh
		adminCacheService.deletePattern(`${this.CACHE_KEY_PREFIX}:alerts:*`);
		
		return true;
	}

	/**
	 * Get fraud detection settings
	 */
	async getSettings(): Promise<FraudDetectionSettings> {
		return this.settings;
	}

	/**
	 * Update fraud detection settings
	 */
	async updateSettings(settings: Partial<FraudDetectionSettings>): Promise<FraudDetectionSettings> {
		this.settings = { ...this.settings, ...settings };
		
		// In production, persist to database
		logger.info('Fraud detection settings updated:', settings);
		
		// Clear cache
		adminCacheService.deletePattern(`${this.CACHE_KEY_PREFIX}:*`);
		
		return this.settings;
	}

	/**
	 * Get suspicious users report
	 */
	async getSuspiciousUsersReport(limit: number = 50): Promise<SuspiciousActivity[]> {
		const cacheKey = `${this.CACHE_KEY_PREFIX}:suspicious_users:${limit}`;

		return adminCacheService.getOrSet(
			cacheKey,
			async () => {
				// Get recently active users
				const activeUsers = await db
					.select({ 
						userId: analyticsEvents.userId,
						username: users.username 
					})
					.from(analyticsEvents)
					.innerJoin(users, eq(analyticsEvents.userId, users.id))
					.where(gte(analyticsEvents.createdAt, new Date(Date.now() - 24 * 60 * 60 * 1000)))
					.groupBy(analyticsEvents.userId, users.username)
					.limit(limit * 2); // Get more to filter

				const suspiciousUsers: SuspiciousActivity[] = [];

				for (const { userId, username } of activeUsers) {
					if (!userId) continue;

					const analysis = await this.analyzeUser(userId);
					if (analysis && analysis.riskScore > 30) { // Lower threshold for report
						suspiciousUsers.push(analysis);
					}

					if (suspiciousUsers.length >= limit) break;
				}

				return suspiciousUsers.sort((a, b) => b.riskScore - a.riskScore);
			},
			180 // 3 minute TTL
		);
	}
}

// Export service instance
export const fraudDetectionService = new FraudDetectionService();