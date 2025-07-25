import { db } from '@db';
import { reputationAchievements, userReputationLog } from '@schema';
import { users } from '@schema';
import { eq, and } from 'drizzle-orm';
import { logger } from '@core/logger';
import type { UserId, AchievementId } from '@shared/types/ids';

export class ReputationService {
	constructor(private drizzle = db) {}

	/**
	 * Evaluate and award any new reputation achievements for the user based on a trigger.
	 * For MVP we only support simple criteria types mapped to numeric user stats.
	 *
	 * @param userId UUID of the user
	 * @param triggerType Trigger identifier (e.g., 'likes_received', 'thread_likes', 'shop_purchase')
	 * @param triggerValue Optional numeric value representing the latest stat count (if already computed)
	 * @returns List of achievement keys awarded this call
	 */
	async checkAchievements(
		userId: UserId,
		triggerType: string,
		triggerValue?: number
	): Promise<string[]> {
		// 1. Fetch all enabled achievements matching the trigger type
		const available = await this.drizzle
			.select()
			.from(reputationAchievements)
			.where(
				and(eq(reputationAchievements.enabled, true), eq(reputationAchievements.criteriaType, triggerType))
			);

		if (!available.length) return [];

		// 2. Fetch already earned achievements for this user
		const earnedRows = await this.drizzle
			.select({ achievementId: userReputationLog.achievementId })
			.from(userReputationLog)
			.where(and(eq(userReputationLog.userId, userId), userReputationLog.achievementId.isNotNull()));

		const earnedIds = new Set(earnedRows.map((r) => r.achievementId));

		const newlyAwarded: string[] = [];

		// 3. Determine metric value for user (naively query users table or use triggerValue)
		// NOTE: In MVP we only support total likes received and thread_likes.
		let metricValue = triggerValue;
		if (metricValue === undefined) {
			// placeholder: fetch from users table pluginData or aggregated stats table
			// For now, default to 0 to skip awarding if not provided
			metricValue = 0;
		}

		for (const ach of available) {
			if (earnedIds.has(ach.id)) continue; // Already have it
			if (ach.criteriaValue === null || ach.criteriaValue === undefined) continue; // Skip undefined criteria

			if (metricValue >= ach.criteriaValue) {
				// Award reputation
				await this.grantReputation(userId, ach.reputationReward, `Achievement:${ach.achievementKey}`, ach.id);
				newlyAwarded.push(ach.achievementKey);
			}
		}

		if (newlyAwarded.length > 0) {
			logger.info(
				'ReputationService',
				`Awarded achievements ${newlyAwarded.join(', ')} to user ${userId}`
			);
		}

		return newlyAwarded;
	}

	/**
	 * Directly grant reputation to a user (admin grants, shop purchases, achievements).
	 */
	async grantReputation(userId: UserId, amount: number, reason: string, achievementId?: AchievementId) {
		if (amount <= 0) return;

		await this.drizzle.transaction(async (tx) => {
			// 1. Update user's reputation total
			await tx
				.update(users)
				.set({ reputation: users.reputation + amount })
				.where(eq(users.id, userId));

			// 2. Insert log entry
			await tx.insert(userReputationLog).values({
				userId,
				achievementId,
				reputationEarned: amount,
				reason
			});
		});
	}
}
