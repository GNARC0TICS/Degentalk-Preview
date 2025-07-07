import { userService } from '@server/src/core/services/user.service';
import type { Request, Response } from 'express';
import { ProfileStatsService } from './profile-stats.service';
import { handleControllerError } from '../../lib/error-handler';
import { z } from 'zod';
import { logger } from "../../core/logger";

// Request validation schemas
const GetProfileStatsSchema = z.object({
	username: z.string().min(1).max(50)
});

const ProfileEngagementSchema = z.object({
	profileUsername: z.string().min(1).max(50),
	metrics: z.object({
		timeSpent: z.number().min(0),
		tabSwitches: z.number().min(0),
		actionsPerformed: z.number().min(0),
		scrollDepth: z.number().min(0).max(1),
		engagementScore: z.number().min(0).max(100)
	}),
	eventCount: z.number().min(0),
	sessionDuration: z.number().min(0),
	timestamp: z.number()
});

export class ProfileStatsController {
	/**
	 * GET /api/profile/:username/stats
	 * Get comprehensive profile statistics for enhanced widgets
	 */
	static async getExtendedProfileStats(req: Request, res: Response) {
		try {
			const { username } = GetProfileStatsSchema.parse(req.params);

			// Optional: Track profile view for analytics
			if (userService.getUserFromRequest(req)?.id) {
				await ProfileStatsService.updateLastSeen(userService.getUserFromRequest(req).id);
			}

			const stats = await ProfileStatsService.getExtendedProfileStats(username);

			if (!stats) {
				return res.status(404).json({
					success: false,
					error: 'Profile not found'
				});
			}

			// Remove sensitive data if not own profile
			const sanitizedStats = this.sanitizeProfileStats(
				stats,
				userService.getUserFromRequest(req)?.id === stats.id
			);

			res.json({
				success: true,
				data: sanitizedStats,
				cached: false,
				timestamp: new Date().toISOString()
			});
		} catch (error) {
			handleControllerError(error, res, 'Failed to fetch profile statistics');
		}
	}

	/**
	 * POST /api/analytics/profile-engagement
	 * Track profile engagement analytics
	 */
	static async trackProfileEngagement(req: Request, res: Response) {
		try {
			const engagementData = ProfileEngagementSchema.parse(req.body);

			// Store engagement analytics (implement based on your analytics system)
			await this.storeEngagementAnalytics({
				...engagementData,
				viewerId: userService.getUserFromRequest(req)?.id || null,
				userAgent: req.headers['user-agent'] || null,
				ip: req.ip,
				timestamp: new Date()
			});

			res.json({
				success: true,
				message: 'Engagement data recorded'
			});
		} catch (error) {
			handleControllerError(error, res, 'Failed to record engagement analytics');
		}
	}

	/**
	 * GET /api/profile/:username/quick-stats
	 * Get minimal stats for quick profile previews
	 */
	static async getQuickProfileStats(req: Request, res: Response) {
		try {
			const { username } = GetProfileStatsSchema.parse(req.params);

			const stats = await ProfileStatsService.getExtendedProfileStats(username);

			if (!stats) {
				return res.status(404).json({
					success: false,
					error: 'Profile not found'
				});
			}

			// Return only essential stats for quick previews
			const quickStats = {
				id: stats.id,
				username: stats.username,
				avatarUrl: stats.avatarUrl,
				level: stats.level,
				reputation: stats.reputation,
				isOnline: this.isRecentlyActive(stats.lastSeenAt),
				trustLevel: this.calculateTrustLevel(stats.reputation, stats.level),
				primaryActivity: this.getPrimaryActivity(stats)
			};

			res.json({
				success: true,
				data: quickStats,
				cached: true,
				timestamp: new Date().toISOString()
			});
		} catch (error) {
			handleControllerError(error, res, 'Failed to fetch quick profile stats');
		}
	}

	/**
	 * Sanitize profile stats based on privacy settings and viewer relationship
	 */
	private static sanitizeProfileStats(stats: any, isOwnProfile: boolean) {
		if (isOwnProfile) {
			return stats; // Return all data for own profile
		}

		// Remove sensitive financial data for non-own profiles
		const sanitized = { ...stats };

		// Only show approximate wallet data
		if (sanitized.dgtBalance > 10000) {
			sanitized.dgtBalance = Math.round(sanitized.dgtBalance / 1000) * 1000; // Round to nearest thousand
		}

		// Hide exact USDT and pending withdrawals
		delete sanitized.walletBalanceUSDT;
		delete sanitized.walletPendingWithdrawals;
		delete sanitized.dgtPoints;

		// Hide detailed security info
		delete sanitized.lastLogin;

		return sanitized;
	}

	/**
	 * Store engagement analytics (implement based on your analytics infrastructure)
	 */
	private static async storeEngagementAnalytics(data: any) {
		// Example implementation - replace with your analytics service
		logger.info('Profile Engagement Analytics:', {
        			profileUsername: data.profileUsername,
        			viewerId: data.viewerId,
        			engagementScore: data.metrics.engagementScore,
        			sessionDuration: data.sessionDuration,
        			timestamp: data.timestamp
        		});

		// TODO: Implement actual analytics storage
		// - Send to analytics service (Mixpanel, Amplitude, etc.)
		// - Store in analytics database table
		// - Update user engagement metrics
		// - Trigger behavioral insights
	}

	/**
	 * Check if user was recently active (within 5 minutes)
	 */
	private static isRecentlyActive(lastSeenAt: string | null): boolean {
		if (!lastSeenAt) return false;

		const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
		return new Date(lastSeenAt).getTime() > fiveMinutesAgo;
	}

	/**
	 * Calculate trust level based on reputation and level
	 */
	private static calculateTrustLevel(reputation: number, level: number): string {
		if (reputation >= 10000 || level >= 50) return 'Elite';
		if (reputation >= 5000 || level >= 25) return 'Veteran';
		if (reputation >= 1000 || level >= 10) return 'Trusted';
		if (reputation >= 100 || level >= 5) return 'Member';
		return 'Newcomer';
	}

	/**
	 * Determine user's primary activity type
	 */
	private static getPrimaryActivity(stats: any): string {
		const { totalPosts, totalThreads, totalTips, posterRank } = stats;

		if (totalTips > totalPosts && totalTips > 1000) return 'Generous Tipper';
		if (posterRank && posterRank <= 100) return 'Top Contributor';
		if (totalThreads > totalPosts * 0.3) return 'Discussion Starter';
		if (totalPosts > 1000) return 'Active Member';
		if (totalPosts > 100) return 'Regular Poster';
		return 'Community Member';
	}
}
