/**
 * Platform Statistics Service
 *
 * Provides methods to calculate and update platform statistics
 */

import { db } from '@db';
import { platformStatistics, users, threads, posts, postReactions } from '@schema';
import { eq, sql, count, countDistinct } from 'drizzle-orm';

/**
 * Service class for platform statistics
 */
export class PlatformStatsService {
	/**
	 * Updates total users count
	 */
	async updateTotalUsers(): Promise<number> {
		const [result] = await db
			.select({ count: count() })
			.from(users)
			.where(eq(users.isDeleted, false));

		const totalUsers = Number(result?.count || 0);

		await this.updateStatistic('totalUsers', totalUsers);

		return totalUsers;
	}

	/**
	 * Updates daily active users count
	 */
	async updateDailyActiveUsers(): Promise<number> {
		const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

		const [result] = await db
			.select({ count: countDistinct(users.id) })
			.from(users)
			.where(sql`${users.lastSeenAt} > ${oneDayAgo}`);

		const dailyActiveUsers = Number(result?.count || 0);

		await this.updateStatistic('dailyActiveUsers', dailyActiveUsers);

		return dailyActiveUsers;
	}

	/**
	 * Updates total posts count
	 */
	async updateTotalPosts(): Promise<number> {
		const [result] = await db
			.select({ count: count() })
			.from(posts)
			.where(eq(posts.isDeleted, false));

		const totalPosts = Number(result?.count || 0);

		await this.updateStatistic('totalPosts', totalPosts);

		return totalPosts;
	}

	/**
	 * Updates total threads count
	 */
	async updateTotalThreads(): Promise<number> {
		const [result] = await db
			.select({ count: count() })
			.from(threads)
			.where(eq(threads.isDeleted, false));

		const totalThreads = Number(result?.count || 0);

		await this.updateStatistic('totalThreads', totalThreads);

		return totalThreads;
	}

	/**
	 * Updates total reactions count
	 */
	async updateTotalReactions(): Promise<number> {
		const [result] = await db.select({ count: count() }).from(postReactions);

		const totalReactions = Number(result?.count || 0);

		await this.updateStatistic('totalReactions', totalReactions);

		return totalReactions;
	}

	/**
	 * Updates new users count for the last 24 hours
	 */
	async updateNewUsers24h(): Promise<number> {
		const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

		const [result] = await db
			.select({ count: count() })
			.from(users)
			.where(sql`${users.createdAt} > ${oneDayAgo}`);

		const newUsers = Number(result?.count || 0);

		await this.updateStatistic('newUsers24h', newUsers);

		return newUsers;
	}

	/**
	 * Updates posts created in the last 24 hours
	 */
	async updateNewPosts24h(): Promise<number> {
		const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

		const [result] = await db
			.select({ count: count() })
			.from(posts)
			.where(sql`${posts.createdAt} > ${oneDayAgo}`);

		const newPosts = Number(result?.count || 0);

		await this.updateStatistic('newPosts24h', newPosts);

		return newPosts;
	}

	/**
	 * Updates a statistic value in the platformStatistics table
	 */
	private async updateStatistic(key: string, value: number): Promise<void> {
		const now = new Date();

		// Check if the statistic already exists
		const [existingStat] = await db
			.select()
			.from(platformStatistics)
			.where(eq(platformStatistics.statKey, key));

		if (existingStat) {
			// Update the existing statistic
			await db
				.update(platformStatistics)
				.set({
					statValue: BigInt(value),
					lastUpdatedAt: now
				})
				.where(eq(platformStatistics.statKey, key));
		} else {
			// Insert a new statistic
			await db.insert(platformStatistics).values({
				statKey: key,
				statValue: BigInt(value),
				lastUpdatedAt: now
			});
		}
	}

	/**
	 * Updates all platform statistics
	 */
	async updateAllStats(): Promise<Record<string, number>> {
		const totalUsers = await this.updateTotalUsers();
		const dailyActiveUsers = await this.updateDailyActiveUsers();
		const totalPosts = await this.updateTotalPosts();
		const totalThreads = await this.updateTotalThreads();
		const totalReactions = await this.updateTotalReactions();
		const newUsers24h = await this.updateNewUsers24h();
		const newPosts24h = await this.updateNewPosts24h();

		return {
			totalUsers,
			dailyActiveUsers,
			totalPosts,
			totalThreads,
			totalReactions,
			newUsers24h,
			newPosts24h
		};
	}
}

export const platformStatsService = new PlatformStatsService();
