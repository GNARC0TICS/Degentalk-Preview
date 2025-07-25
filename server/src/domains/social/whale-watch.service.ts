import { db } from '@db';
import { userFollows, users } from '@schema';
import { eq, and, desc, count, sql as drizzleSql } from 'drizzle-orm';

export interface FollowUser {
	id: string;
	username: string;
	avatarUrl?: string | null;
	activeAvatarUrl?: string | null;
	level?: number | null;
	role?: string | null;
	reputation?: number | null;
	followedAt: string;
}

export interface FollowCounts {
	following: number;
	followers: number;
}

export class WhaleWatchService {
	/**
	 * Follow a user
	 */
	static async followUser(followerId: string, followeeId: string): Promise<void> {
		// Prevent self-follow
		if (followerId === followeeId) {
			throw new Error('Cannot follow yourself');
		}

		// Check if already following
		const existingFollow = await db
			.select()
			.from(userFollows)
			.where(and(eq(userFollows.followerId, followerId), eq(userFollows.followeeId, followeeId)))
			.limit(1);

		if (existingFollow.length > 0) {
			throw new Error('Already following this user');
		}

		// Verify the user to follow exists
		const userToFollow = await db
			.select({ id: users.id })
			.from(users)
			.where(eq(users.id, followeeId))
			.limit(1);

		if (userToFollow.length === 0) {
			throw new Error('User to follow not found');
		}

		// Create the follow relationship
		await db.insert(userFollows).values({
			followerId,
			followeeId
		});
	}

	/**
	 * Unfollow a user
	 */
	static async unfollowUser(followerId: string, followeeId: string): Promise<void> {
		const result = await db
			.delete(userFollows)
			.where(and(eq(userFollows.followerId, followerId), eq(userFollows.followeeId, followeeId)))
			.returning();

		if (result.length === 0) {
			throw new Error('Not following this user');
		}
	}

	/**
	 * Check if user A is following user B
	 */
	static async isFollowing(followerId: string, followeeId: string): Promise<boolean> {
		const result = await db
			.select({ id: userFollows.id })
			.from(userFollows)
			.where(and(eq(userFollows.followerId, followerId), eq(userFollows.followeeId, followeeId)))
			.limit(1);

		return result.length > 0;
	}

	/**
	 * Get users that a specific user is following (their Whale Watch list)
	 */
	static async getUserFollowing(userId: string, page = 1, limit = 20): Promise<FollowUser[]> {
		const offset = (page - 1) * limit;

		const following = await db
			.select({
				id: users.id,
				username: users.username,
				avatarUrl: users.avatarUrl,
				activeAvatarUrl: users.activeAvatarUrl,
				level: users.level,
				role: users.role,
				reputation: users.reputation,
				followedAt: userFollows.createdAt
			})
			.from(userFollows)
			.leftJoin(users, eq(userFollows.followeeId, users.id))
			.where(eq(userFollows.followerId, userId))
			.orderBy(desc(userFollows.createdAt))
			.limit(limit)
			.offset(offset);

		return following.map((follow) => ({
			id: follow.id!,
			username: follow.username!,
			avatarUrl: follow.avatarUrl,
			activeAvatarUrl: follow.activeAvatarUrl,
			level: follow.level,
			role: follow.role,
			reputation: follow.reputation,
			followedAt: follow.followedAt!.toISOString()
		}));
	}

	/**
	 * Get users who are following a specific user (their followers)
	 */
	static async getUserFollowers(userId: string, page = 1, limit = 20): Promise<FollowUser[]> {
		const offset = (page - 1) * limit;

		const followers = await db
			.select({
				id: users.id,
				username: users.username,
				avatarUrl: users.avatarUrl,
				activeAvatarUrl: users.activeAvatarUrl,
				level: users.level,
				role: users.role,
				reputation: users.reputation,
				followedAt: userFollows.createdAt
			})
			.from(userFollows)
			.leftJoin(users, eq(userFollows.followerId, users.id))
			.where(eq(userFollows.followeeId, userId))
			.orderBy(desc(userFollows.createdAt))
			.limit(limit)
			.offset(offset);

		return followers.map((follower) => ({
			id: follower.id!,
			username: follower.username!,
			avatarUrl: follower.avatarUrl,
			activeAvatarUrl: follower.activeAvatarUrl,
			level: follower.level,
			role: follower.role,
			reputation: follower.reputation,
			followedAt: follower.followedAt!.toISOString()
		}));
	}

	/**
	 * Get follow counts for a user
	 */
	static async getFollowCounts(userId: string): Promise<FollowCounts> {
		const [followingCount, followersCount] = await Promise.all([
			// Count users this user is following
			db.select({ count: count() }).from(userFollows).where(eq(userFollows.followerId, userId)),

			// Count users following this user
			db.select({ count: count() }).from(userFollows).where(eq(userFollows.followeeId, userId))
		]);

		return {
			following: followingCount[0]?.count || 0,
			followers: followersCount[0]?.count || 0
		};
	}

	/**
	 * Get whale candidates (users with high follower counts)
	 */
	static async getWhales(limit = 20): Promise<Array<FollowUser & { followerCount: number }>> {
		const whales = await db
			.select({
				id: users.id,
				username: users.username,
				avatarUrl: users.avatarUrl,
				activeAvatarUrl: users.activeAvatarUrl,
				level: users.level,
				role: users.role,
				reputation: users.reputation,
				followerCount: drizzleSql<number>`COUNT(${userFollows.id})`
			})
			.from(users)
			.leftJoin(userFollows, eq(users.id, userFollows.followeeId))
			.groupBy(
				users.id,
				users.username,
				users.avatarUrl,
				users.activeAvatarUrl,
				users.level,
				users.role,
				users.reputation
			)
			.having(drizzleSql`COUNT(${userFollows.id}) > 0`)
			.orderBy(drizzleSql`COUNT(${userFollows.id}) DESC`)
			.limit(limit);

		return whales.map((whale) => ({
			id: whale.id,
			username: whale.username,
			avatarUrl: whale.avatarUrl,
			activeAvatarUrl: whale.activeAvatarUrl,
			level: whale.level,
			role: whale.role,
			reputation: whale.reputation,
			followedAt: new Date().toISOString(), // Not applicable for whale list
			followerCount: whale.followerCount
		}));
	}

	/**
	 * Search users to follow
	 */
	static async searchUsers(
		query: string,
		currentUserId: string,
		limit = 10
	): Promise<Array<FollowUser & { isFollowing: boolean; followerCount: number }>> {
		if (query.length < 1) return [];

		const searchResults = await db
			.select({
				id: users.id,
				username: users.username,
				avatarUrl: users.avatarUrl,
				activeAvatarUrl: users.activeAvatarUrl,
				level: users.level,
				role: users.role,
				reputation: users.reputation,
				followerCount: drizzleSql<number>`COUNT(DISTINCT ${userFollows.id})`,
				isFollowing: drizzleSql<boolean>`EXISTS(
					SELECT 1 FROM ${userFollows} 
					WHERE ${userFollows.followerId} = ${currentUserId} 
					AND ${userFollows.followeeId} = ${users.id}
				)`
			})
			.from(users)
			.leftJoin(userFollows, eq(users.id, userFollows.followeeId))
			.where(
				and(
					drizzleSql`LOWER(${users.username}) LIKE LOWER(${`%${query}%`})`,
					drizzleSql`${users.id} != ${currentUserId}` // Exclude current user
				)
			)
			.groupBy(
				users.id,
				users.username,
				users.avatarUrl,
				users.activeAvatarUrl,
				users.level,
				users.role,
				users.reputation
			)
			.orderBy(users.username)
			.limit(limit);

		return searchResults.map((user) => ({
			id: user.id,
			username: user.username,
			avatarUrl: user.avatarUrl,
			activeAvatarUrl: user.activeAvatarUrl,
			level: user.level,
			role: user.role,
			reputation: user.reputation,
			followedAt: new Date().toISOString(), // Not applicable for search
			isFollowing: user.isFollowing,
			followerCount: user.followerCount
		}));
	}

	/**
	 * Check if a user qualifies as a "whale" based on follower count
	 */
	static async isWhale(userId: string): Promise<boolean> {
		const { followers } = await this.getFollowCounts(userId);

		// Configure whale threshold (could be made configurable via admin)
		const WHALE_THRESHOLD = 50; // Users with 50+ followers are whales

		return followers >= WHALE_THRESHOLD;
	}

	/**
	 * Get whale status with threshold info
	 */
	static async getWhaleStatus(
		userId: string
	): Promise<{ isWhale: boolean; followerCount: number; threshold: number }> {
		const { followers } = await this.getFollowCounts(userId);
		const WHALE_THRESHOLD = 50;

		return {
			isWhale: followers >= WHALE_THRESHOLD,
			followerCount: followers,
			threshold: WHALE_THRESHOLD
		};
	}
}
