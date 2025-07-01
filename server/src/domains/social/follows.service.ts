import { db } from '@db';
import { userFollows, userFollowPreferences, followRequests, users } from '@schema';
import { eq, and, desc, sql, count, inArray } from 'drizzle-orm';
import type { FollowNotificationSettings, UserStats } from './follows.types';
import type { RequestId } from '@/db/types';

export class FollowsService {
	/**
	 * Follow a user
	 */
	static async followUser({
		followerId,
		followedId,
		notificationSettings = {}
	}: {
		followerId: string;
		followedId: string;
		notificationSettings?: Partial<FollowNotificationSettings>;
	}) {
		// Prevent self-following
		if (followerId === followedId) {
			throw new Error('Cannot follow yourself');
		}

		// Check if already following
		const existingFollow = await db
			.select()
			.from(userFollows)
			.where(and(eq(userFollows.followerId, followerId), eq(userFollows.followedId, followedId)))
			.limit(1);

		if (existingFollow.length > 0) {
			throw new Error('Already following this user');
		}

		// Check if follow approval is required
		const followedUserPrefs = await this.getUserFollowPreferences(followedId);

		if (followedUserPrefs.requireFollowApproval) {
			// Create follow request instead of direct follow
			const request = await db
				.insert(followRequests)
				.values({
					requesterId: followerId,
					targetId: followedId,
					message: '', // Could be extended to include a message
					isPending: true,
					isApproved: false,
					isRejected: false
				})
				.returning();

			return { type: 'request', data: request[0] };
		}

		// Create direct follow
		const follow = await db
			.insert(userFollows)
			.values({
				followerId,
				followedId,
				notifyOnPosts: notificationSettings.notifyOnPosts ?? true,
				notifyOnThreads: notificationSettings.notifyOnThreads ?? true,
				notifyOnTrades: notificationSettings.notifyOnTrades ?? false,
				notifyOnLargeStakes: notificationSettings.notifyOnLargeStakes ?? true,
				minStakeNotification: notificationSettings.minStakeNotification ?? 1000
			})
			.returning();

		return { type: 'follow', data: follow[0] };
	}

	/**
	 * Unfollow a user
	 */
	static async unfollowUser(followerId: string, followedId: string) {
		const result = await db
			.delete(userFollows)
			.where(and(eq(userFollows.followerId, followerId), eq(userFollows.followedId, followedId)))
			.returning();

		if (result.length === 0) {
			throw new Error('Follow relationship not found');
		}

		return result[0];
	}

	/**
	 * Check if user A is following user B
	 */
	static async isFollowing(followerId: string, followedId: string): Promise<boolean> {
		const result = await db
			.select({ id: userFollows.id })
			.from(userFollows)
			.where(and(eq(userFollows.followerId, followerId), eq(userFollows.followedId, followedId)))
			.limit(1);

		return result.length > 0;
	}

	/**
	 * Get user's following list
	 */
	static async getUserFollowing(userId: string, page = 1, limit = 20) {
		const offset = (page - 1) * limit;

		const following = await db
			.select({
				id: userFollows.id,
				followedAt: userFollows.createdAt,
				notificationSettings: {
					notifyOnPosts: userFollows.notifyOnPosts,
					notifyOnThreads: userFollows.notifyOnThreads,
					notifyOnTrades: userFollows.notifyOnTrades,
					notifyOnLargeStakes: userFollows.notifyOnLargeStakes,
					minStakeNotification: userFollows.minStakeNotification
				},
				user: {
					id: users.id,
					username: users.username,
					avatarUrl: users.avatarUrl,
					activeAvatarUrl: users.activeAvatarUrl,
					level: users.level,
					role: users.role,
					clout: users.clout
				}
			})
			.from(userFollows)
			.leftJoin(users, eq(userFollows.followedId, users.id))
			.where(eq(userFollows.followerId, userId))
			.orderBy(desc(userFollows.createdAt))
			.limit(limit)
			.offset(offset);

		return following;
	}

	/**
	 * Get user's followers list
	 */
	static async getUserFollowers(userId: string, page = 1, limit = 20) {
		const offset = (page - 1) * limit;

		const followers = await db
			.select({
				id: userFollows.id,
				followedAt: userFollows.createdAt,
				user: {
					id: users.id,
					username: users.username,
					avatarUrl: users.avatarUrl,
					activeAvatarUrl: users.activeAvatarUrl,
					level: users.level,
					role: users.role,
					clout: users.clout
				}
			})
			.from(userFollows)
			.leftJoin(users, eq(userFollows.followerId, users.id))
			.where(eq(userFollows.followedId, userId))
			.orderBy(desc(userFollows.createdAt))
			.limit(limit)
			.offset(offset);

		return followers;
	}

	/**
	 * Get user follow counts
	 */
	static async getUserFollowCounts(userId: string) {
		const followingCount = await db
			.select({ count: count() })
			.from(userFollows)
			.where(eq(userFollows.followerId, userId));

		const followersCount = await db
			.select({ count: count() })
			.from(userFollows)
			.where(eq(userFollows.followedId, userId));

		return {
			following: followingCount[0]?.count || 0,
			followers: followersCount[0]?.count || 0
		};
	}

	/**
	 * Get user's follow preferences
	 */
	static async getUserFollowPreferences(userId: string) {
		const preferences = await db
			.select()
			.from(userFollowPreferences)
			.where(eq(userFollowPreferences.userId, userId))
			.limit(1);

		// Return default preferences if none exist
		if (preferences.length === 0) {
			return {
				allowAllFollows: true,
				onlyFriendsCanFollow: false,
				requireFollowApproval: false,
				hideFollowerCount: false,
				hideFollowingCount: false,
				hideFollowersList: false,
				hideFollowingList: false,
				notifyOnNewFollower: true,
				emailOnNewFollower: false
			};
		}

		return preferences[0];
	}

	/**
	 * Update user's follow preferences
	 */
	static async updateUserFollowPreferences(userId: string, preferences: Partial<any>) {
		const existingPrefs = await db
			.select()
			.from(userFollowPreferences)
			.where(eq(userFollowPreferences.userId, userId))
			.limit(1);

		if (existingPrefs.length === 0) {
			// Create new preferences
			return await db
				.insert(userFollowPreferences)
				.values({
					userId,
					...preferences
				})
				.returning();
		} else {
			// Update existing preferences
			return await db
				.update(userFollowPreferences)
				.set({
					...preferences,
					updatedAt: sql`NOW()`
				})
				.where(eq(userFollowPreferences.userId, userId))
				.returning();
		}
	}

	/**
	 * Get follow requests for a user
	 */
	static async getFollowRequests(targetUserId: string) {
		const requests = await db
			.select({
				id: followRequests.id,
				message: followRequests.message,
				createdAt: followRequests.createdAt,
				requester: {
					id: users.id,
					username: users.username,
					avatarUrl: users.avatarUrl,
					activeAvatarUrl: users.activeAvatarUrl,
					level: users.level,
					role: users.role
				}
			})
			.from(followRequests)
			.leftJoin(users, eq(followRequests.requesterId, users.id))
			.where(and(eq(followRequests.targetId, targetUserId), eq(followRequests.isPending, true)))
			.orderBy(desc(followRequests.createdAt));

		return requests;
	}

	/**
	 * Respond to a follow request
	 */
	static async respondToFollowRequest(requestId: RequestId, approve: boolean) {
		// Get the request details
		const request = await db
			.select()
			.from(followRequests)
			.where(eq(followRequests.id, requestId))
			.limit(1);

		if (request.length === 0) {
			throw new Error('Follow request not found');
		}

		const requestData = request[0];

		if (!requestData.isPending) {
			throw new Error('Follow request already responded to');
		}

		// Update the request
		await db
			.update(followRequests)
			.set({
				isPending: false,
				isApproved: approve,
				isRejected: !approve,
				respondedAt: sql`NOW()`
			})
			.where(eq(followRequests.id, requestId));

		// If approved, create the follow relationship
		if (approve) {
			await db.insert(userFollows).values({
				followerId: requestData.requesterId,
				followedId: requestData.targetId,
				notifyOnPosts: true,
				notifyOnThreads: true,
				notifyOnTrades: false,
				notifyOnLargeStakes: true,
				minStakeNotification: 1000
			});
		}

		return { approved: approve, requestData };
	}

	/**
	 * Get whale candidates (users with high stats)
	 */
	static async getWhaleCandidates(limit = 20) {
		// This would typically include complex logic to identify "whales"
		// For now, we'll use level and clout as indicators
		const whales = await db
			.select({
				id: users.id,
				username: users.username,
				avatarUrl: users.avatarUrl,
				activeAvatarUrl: users.activeAvatarUrl,
				level: users.level,
				clout: users.clout,
				role: users.role,
				createdAt: users.createdAt
			})
			.from(users)
			.where(sql`${users.level} >= 25 OR ${users.clout} >= 10000`)
			.orderBy(desc(users.clout), desc(users.level))
			.limit(limit);

		return whales;
	}

	/**
	 * Get activity feed for followed users
	 */
	static async getFollowingActivity(userId: string, page = 1, limit = 20) {
		// This would integrate with other systems to show activity from followed users
		// For now, return a placeholder structure
		return {
			activities: [],
			pagination: { page, limit, hasMore: false }
		};
	}

	/**
	 * Search users for following
	 */
	static async searchUsersToFollow(query: string, currentUserId: string, limit = 10) {
		if (query.length < 1) return [];

		const searchResults = await db
			.select({
				id: users.id,
				username: users.username,
				avatarUrl: users.avatarUrl,
				activeAvatarUrl: users.activeAvatarUrl,
				level: users.level,
				role: users.role,
				clout: users.clout,
				isFollowing: sql<boolean>`EXISTS(
					SELECT 1 FROM ${userFollows} 
					WHERE ${userFollows.followerId} = ${currentUserId} 
					AND ${userFollows.followedId} = ${users.id}
				)`.as('isFollowing')
			})
			.from(users)
			.where(
				and(
					sql`LOWER(${users.username}) LIKE LOWER(${`%${query}%`})`,
					sql`${users.id} != ${currentUserId}` // Exclude current user
				)
			)
			.orderBy(desc(users.level), users.username)
			.limit(limit);

		return searchResults;
	}

	/**
	 * Update follow notification preferences
	 */
	static async updateFollowNotificationSettings(
		followerId: string,
		followedId: string,
		settings: Partial<FollowNotificationSettings>
	) {
		const result = await db
			.update(userFollows)
			.set({
				...settings,
				updatedAt: sql`NOW()`
			})
			.where(and(eq(userFollows.followerId, followerId), eq(userFollows.followedId, followedId)))
			.returning();

		if (result.length === 0) {
			throw new Error('Follow relationship not found');
		}

		return result[0];
	}
}
