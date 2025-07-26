import { db } from '@db';
import {
	users,
	userStats,
	userRelationships,
	subscriptions,
	roles,
	transactions
} from '@schema';
import { eq, sql, and, desc, count } from 'drizzle-orm';
import { logger } from '@core/logger';

export interface ExtendedProfileStats {
	// Core profile data
	id: string;
	username: string;
	avatarUrl: string | null;
	bio: string | null;
	level: number;
	xp: number;
	nextLevelXp: number;
	joinedAt: string;

	// Reputation & trust
	reputation: number;
	reputation: number;
	dailyXpGained: number;
	lastXpGainDate: string | null;

	// Activity metrics
	totalPosts: number;
	totalThreads: number;
	totalLikes: number;
	totalTips: number;
	threadViewCount: number;
	posterRank: number | null;
	tipperRank: number | null;
	likerRank: number | null;

	// Wallet & economy
	dgtBalance: number;
	walletBalanceUSDT: number;
	walletPendingWithdrawals: number;
	dgtPoints: number;

	// Social graph
	followersCount: number;
	followingCount: number;
	friendsCount: number;
	friendRequestsSent: number;
	friendRequestsReceived: number;

	// Subscriptions & roles
	activeSubscription: {
		type: string;
		status: string;
		endDate: string | null;
		pricePaid: Id<'pricePaid'>;
	} | null;
	primaryRole: {
		name: string;
		badgeImage: string | null;
		textColor: string | null;
		xpMultiplier: number;
	} | null;
	isStaff: boolean;
	isModerator: boolean;
	isAdmin: boolean;

	// Referrals & progression
	referralLevel: number;
	referralsCount: number;

	// Path XP removed - using linear XP system only

	// Account security
	lastSeenAt: string | null;
	lastLogin: string | null;
}

export class ProfileStatsService {
	/**
	 * Get comprehensive profile statistics for enhanced profile widgets
	 * Optimized with joins to minimize database queries
	 */
	static async getExtendedProfileStats(username: string): Promise<ExtendedProfileStats | null> {
		try {
			// Main user query with joins
			const userQuery = await db
				.select({
					// Core user data
					id: users.id,
					username: users.username,
					avatarUrl: users.avatarUrl,
					bio: users.bio,
					level: users.level,
					xp: users.xp,
					nextLevelXp: users.nextLevelXp,
					joinedAt: users.joinedAt,

					// Reputation & trust
					reputation: users.reputation,
					reputation: users.reputation,
					dailyXpGained: users.dailyXpGained,
					lastXpGainDate: users.lastXpGainDate,

					// Activity metrics
					totalPosts: users.totalPosts,
					totalThreads: users.totalThreads,
					totalLikes: users.totalLikes,
					totalTips: users.totalTips,

					// Wallet data
					dgtBalance: users.dgtBalance,
					walletBalanceUSDT: users.walletBalanceUSDT,
					walletPendingWithdrawals: users.walletPendingWithdrawals,
					dgtPoints: users.dgtPoints,

					// Referrals
					referralLevel: users.referralLevel,

					// Path XP columns exist but deprecated

					// Security
					lastSeenAt: users.lastSeenAt,
					lastLogin: users.lastLogin,

					// Role flags
					isStaff: users.isStaff,
					isModerator: users.isModerator,
					isAdmin: users.isAdmin,

					// Stats from user_stats table
					threadViewCount: userStats.threadViewCount,
					posterRank: userStats.posterRank,
					tipperRank: userStats.tipperRank,
					likerRank: userStats.likerRank
				})
				.from(users)
				.leftJoin(userStats, eq(users.id, userStats.userId))
				.where(eq(users.username, username))
				.limit(1);

			if (userQuery.length === 0) {
				return null;
			}

			const user = userQuery[0];

			// Parallel queries for social data and subscriptions
			const [socialCounts, activeSubscription, primaryRole, referralsCount] = await Promise.all([
				this.getSocialGraphCounts(user.id),
				this.getActiveSubscription(user.id),
				this.getPrimaryRole(user.id),
				this.getReferralsCount(user.id)
			]);

			// Calculate next level XP if not set
			const nextLevelXp = user.nextLevelXp || this.calculateNextLevelXp(user.level);

			return {
				// Core profile data
				id: user.id,
				username: user.username,
				avatarUrl: user.avatarUrl,
				bio: user.bio,
				level: user.level,
				xp: user.xp,
				nextLevelXp,
				joinedAt: user.joinedAt?.toISOString() || new Date().toISOString(),

				// Reputation & trust
				reputation: user.reputation || 0,
				reputation: user.reputation || 0,
				dailyXpGained: user.dailyXpGained || 0,
				lastXpGainDate: user.lastXpGainDate?.toISOString() || null,

				// Activity metrics
				totalPosts: user.totalPosts || 0,
				totalThreads: user.totalThreads || 0,
				totalLikes: user.totalLikes || 0,
				totalTips: user.totalTips || 0,
				threadViewCount: user.threadViewCount || 0,
				posterRank: user.posterRank,
				tipperRank: user.tipperRank,
				likerRank: user.likerRank,

				// Wallet & economy
				dgtBalance: user.dgtBalance || 0,
				walletBalanceUSDT: user.walletBalanceUSDT || 0,
				walletPendingWithdrawals: user.walletPendingWithdrawals || 0,
				dgtPoints: user.dgtPoints || 0,

				// Social graph
				followersCount: socialCounts.followersCount,
				followingCount: socialCounts.followingCount,
				friendsCount: socialCounts.friendsCount,
				friendRequestsSent: socialCounts.friendRequestsSent,
				friendRequestsReceived: socialCounts.friendRequestsReceived,

				// Subscriptions & roles
				activeSubscription,
				primaryRole,
				isStaff: user.isStaff || false,
				isModerator: user.isModerator || false,
				isAdmin: user.isAdmin || false,

				// Referrals & progression
				referralLevel: user.referralLevel || 0,
				referralsCount,

				// Path XP removed - using linear XP system only

				// Account security
				lastSeenAt: user.lastSeenAt?.toISOString() || null,
				lastLogin: user.lastLogin?.toISOString() || null
			};
		} catch (error) {
			logger.error('Error fetching extended profile stats:', error);
			throw new Error('Failed to fetch profile statistics');
		}
	}

	/**
	 * Get social graph counts with optimized queries
	 */
	private static async getSocialGraphCounts(userId: string) {
		const [
			followersResult,
			followingResult,
			friendsResult,
			sentRequestsResult,
			receivedRequestsResult
		] = await Promise.all([
			// Followers count
			db
				.select({ count: count() })
				.from(userRelationships)
				.where(
					and(eq(userRelationships.targetUserId, userId), eq(userRelationships.type, 'follow'))
				),

			// Following count
			db
				.select({ count: count() })
				.from(userRelationships)
				.where(and(eq(userRelationships.userId, userId), eq(userRelationships.type, 'follow'))),

			// Friends count (mutual follows or explicit friends)
			db
				.select({ count: count() })
				.from(userRelationships)
				.where(
					and(
						eq(userRelationships.userId, userId),
						eq(userRelationships.type, 'friend'),
						eq(userRelationships.status, 'accepted')
					)
				),

			// Friend requests sent
			db
				.select({ count: count() })
				.from(userRelationships)
				.where(
					and(
						eq(userRelationships.userId, userId),
						eq(userRelationships.type, 'friend'),
						eq(userRelationships.status, 'pending')
					)
				),

			// Friend requests received
			db
				.select({ count: count() })
				.from(userRelationships)
				.where(
					and(
						eq(userRelationships.targetUserId, userId),
						eq(userRelationships.type, 'friend'),
						eq(userRelationships.status, 'pending')
					)
				)
		]);

		return {
			followersCount: followersResult[0]?.count || 0,
			followingCount: followingResult[0]?.count || 0,
			friendsCount: friendsResult[0]?.count || 0,
			friendRequestsSent: sentRequestsResult[0]?.count || 0,
			friendRequestsReceived: receivedRequestsResult[0]?.count || 0
		};
	}

	/**
	 * Get active subscription details
	 */
	private static async getActiveSubscription(userId: string) {
		const subscription = await db
			.select({
				type: subscriptions.type,
				status: subscriptions.status,
				endDate: subscriptions.endDate,
				pricePaid: subscriptions.pricePaid
			})
			.from(subscriptions)
			.where(and(eq(subscriptions.userId, userId), eq(subscriptions.status, 'active')))
			.orderBy(desc(subscriptions.endDate))
			.limit(1);

		return subscription[0]
			? {
					type: subscription[0].type,
					status: subscription[0].status,
					endDate: subscription[0].endDate?.toISOString() || null,
					pricePaid: subscription[0].pricePaid || 0
				}
			: null;
	}

	/**
	 * Get primary role information
	 */
	private static async getPrimaryRole(userId: string) {
		const role = await db
			.select({
				name: roles.name,
				badgeImage: roles.badgeImage,
				textColor: roles.textColor,
				xpMultiplier: roles.xpMultiplier
			})
			.from(roles)
			.innerJoin(users, eq(users.primaryRoleId, roles.id))
			.where(eq(users.id, userId))
			.limit(1);

		return role[0]
			? {
					name: role[0].name,
					badgeImage: role[0].badgeImage,
					textColor: role[0].textColor,
					xpMultiplier: role[0].xpMultiplier || 1
				}
			: null;
	}

	/**
	 * Get referrals count for user
	 */
	private static async getReferralsCount(userId: string): Promise<number> {
		// Assuming there's a referrals tracking mechanism
		const result = await db
			.select({ count: count() })
			.from(users)
			.where(eq(users.referrerId, userId));

		return result[0]?.count || 0;
	}

	/**
	 * Calculate next level XP requirement
	 */
	private static calculateNextLevelXp(currentLevel: number): number {
		// Standard XP progression: level^2 * 100
		return Math.pow(currentLevel + 1, 2) * 100;
	}

	/**
	 * Update user's last seen timestamp
	 */
	static async updateLastSeen(userId: string): Promise<void> {
		await db.update(users).set({ lastSeenAt: new Date() }).where(eq(users.id, userId));
	}
}
