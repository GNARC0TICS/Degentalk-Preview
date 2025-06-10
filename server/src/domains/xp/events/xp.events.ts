/**
 * XP Event Handlers
 *
 * Centralized event handlers for XP-related actions in the system.
 * This separates event logic from service logic for better modularity.
 */

import { db } from '@db';
import {
	users,
	levels,
	badges,
	titles,
	userBadges,
	userTitles,
	notifications,
	xpAdjustmentLogs
} from '@schema';
import { eq, desc } from 'drizzle-orm';
import { logger } from '../../../core/logger';
import { dgtService } from '../../wallet/dgt.service';
import { PgTransaction } from 'drizzle-orm/pg-core';

// Re-export event types from the main events file
import { XpGainEvent, XpLossEvent, LevelUpEvent } from '../xp.events';
export { XpGainEvent, XpLossEvent, LevelUpEvent };

/**
 * Handle XP award event
 * Central function to process XP gain and trigger appropriate side effects
 */
export async function handleXpAward(
	userId: number,
	amount: number,
	source: string,
	reason?: string
): Promise<{
	oldXp: number;
	newXp: number;
	oldLevel: number;
	newLevel: number;
	leveledUp: boolean;
}> {
	logger.info('XP_EVENTS', `Awarding ${amount} XP to user ${userId} for ${source}`);

	try {
		// Start transaction for atomic operations
		return await db.transaction(async (tx: PgTransaction<any, any, any>) => {
			// Get current user state
			const userResult = await tx
				.select({
					id: users.id,
					xp: users.xp,
					level: users.level,
					username: users.username
				})
				.from(users)
				.where(eq(users.id, userId))
				.limit(1);

			if (userResult.length === 0) {
				throw new Error(`User ${userId} not found`);
			}

			const user = userResult[0];
			const oldXp = user.xp;
			const oldLevel = user.level;
			const newXp = oldXp + amount;

			// Update user's XP
			await tx
				.update(users)
				.set({
					xp: newXp,
					lastXpGainDate: new Date(),
					dailyXpGained: db.sql`COALESCE(daily_xp_gained, 0) + ${amount}`
				})
				.where(eq(users.id, userId));

			// Log the XP adjustment
			await tx.insert(xpAdjustmentLogs).values({
				userId,
				adminId: 1, // System user ID
				adjustmentType: 'add',
				amount,
				reason: `${reason || source} (${source})`,
				oldXp,
				newXp
			});

			// Calculate new level based on XP
			const levelsData = await tx
				.select()
				.from(levels)
				.where(db.sql`min_xp <= ${newXp}`)
				.orderBy(desc(levels.level))
				.limit(1);

			// If no levels data found, use default level 1
			const newLevel = levelsData.length > 0 ? levelsData[0].level : 1;
			const leveledUp = newLevel > oldLevel;

			// If level up occurred, handle it
			if (leveledUp) {
				await handleLevelUp(tx, userId, oldLevel, newLevel, user.username);
			}

			// Create an XP gain event (for event listeners)
			const xpEvent = new XpGainEvent(userId, amount, source);

			// Return the results
			return {
				oldXp,
				newXp,
				oldLevel,
				newLevel,
				leveledUp
			};
		});
	} catch (error) {
		logger.error(
			'XP_EVENTS',
			'Error handling XP award:',
			error instanceof Error ? error.message : String(error)
		);
		throw error;
	}
}

/**
 * Handle user level up
 * Process rewards and notifications when a user levels up
 */
export async function handleLevelUp(
	tx: any, // Transaction context
	userId: number,
	oldLevel: number,
	newLevel: number,
	username?: string
): Promise<{
	rewards: {
		dgt?: number;
		title?: string;
		badge?: string;
	};
}> {
	logger.info('XP_EVENTS', `User ${userId} leveled up from ${oldLevel} to ${newLevel}`);

	try {
		// Update user's level
		await tx.update(users).set({ level: newLevel }).where(eq(users.id, userId));

		// Get level data for rewards
		const levelData = await tx.select().from(levels).where(eq(levels.level, newLevel)).limit(1);

		if (levelData.length === 0) {
			throw new Error(`Level ${newLevel} not found`);
		}

		const rewards: { dgt?: number; title?: string; badge?: string } = {};

		// Process DGT reward
		if (levelData[0].rewardDgt && levelData[0].rewardDgt > 0) {
			rewards.dgt = levelData[0].rewardDgt;

			// Award DGT to user wallet using dgtService
			await dgtService.addDgt(
				userId,
				BigInt(levelData[0].rewardDgt), // Ensure amount is BigInt
				'REWARD', // DgtTransactionType
				{
					reason: 'level_up_reward',
					source: `level:${newLevel}`,
					levelAchieved: newLevel
				}
			);
		}

		// Process title reward
		if (levelData[0].rewardTitleId) {
			const titleResult = await tx
				.select()
				.from(titles)
				.where(eq(titles.id, levelData[0].rewardTitleId as number))
				.limit(1);

			if (titleResult.length > 0) {
				const title = titleResult[0];

				// Check if user already has this title
				const existingTitle = await tx
					.select()
					.from(userTitles)
					.where(eq(userTitles.userId, userId), eq(userTitles.titleId, title.id))
					.limit(1);

				// Award title if user doesn't have it
				if (existingTitle.length === 0) {
					await tx.insert(userTitles).values({
						userId,
						titleId: title.id,
						awardedAt: new Date()
					});

					rewards.title = title.name;
				}
			}
		}

		// Process badge reward
		if (levelData[0].rewardBadgeId) {
			const badgeResult = await tx
				.select()
				.from(badges)
				.where(eq(badges.id, levelData[0].rewardBadgeId as number))
				.limit(1);

			if (badgeResult.length > 0) {
				const badge = badgeResult[0];

				// Check if user already has this badge
				const existingBadge = await tx
					.select()
					.from(userBadges)
					.where(eq(userBadges.userId, userId), eq(userBadges.badgeId, badge.id))
					.limit(1);

				// Award badge if user doesn't have it
				if (existingBadge.length === 0) {
					await tx.insert(userBadges).values({
						userId,
						badgeId: badge.id,
						awardedAt: new Date()
					});

					rewards.badge = badge.name;
				}
			}
		}

		// Create notification for user
		const rewardText = [
			rewards.dgt ? `${rewards.dgt} DGT` : '',
			rewards.title ? `"${rewards.title}" title` : '',
			rewards.badge ? `"${rewards.badge}" badge` : ''
		]
			.filter(Boolean)
			.join(', ');

		const notificationMessage = rewardText
			? `Congratulations! You've reached level ${newLevel} and received ${rewardText}!`
			: `Congratulations! You've reached level ${newLevel}!`;

		await tx.insert(notifications).values({
			userId,
			type: 'achievement',
			title: 'Level Up!',
			body: notificationMessage,
			data: {
				oldLevel,
				newLevel,
				rewards
			}
		});

		// Create a LevelUp event (for event listeners)
		const levelUpEvent = new LevelUpEvent(userId, oldLevel, newLevel, 0);

		return { rewards };
	} catch (error) {
		logger.error(
			'XP_EVENTS',
			`Error handling level up for user ${userId}:`,
			error instanceof Error ? error.message : String(error)
		);
		throw error;
	}
}

/**
 * Handle XP loss
 * Process logic when a user loses XP (admin adjustment, penalty, etc.)
 */
export async function handleXpLoss(
	userId: number,
	amount: number,
	reason: string
): Promise<{
	oldXp: number;
	newXp: number;
	levelChanged: boolean;
	newLevel: number;
}> {
	logger.info('XP_EVENTS', `Removing ${amount} XP from user ${userId} for ${reason}`);

	try {
		return await db.transaction(async (tx: PgTransaction<any, any, any>) => {
			// Get current user state
			const userResult = await tx
				.select({
					id: users.id,
					xp: users.xp,
					level: users.level
				})
				.from(users)
				.where(eq(users.id, userId))
				.limit(1);

			if (userResult.length === 0) {
				throw new Error(`User ${userId} not found`);
			}

			const user = userResult[0];
			const oldXp = user.xp;
			const oldLevel = user.level;

			// Ensure XP doesn't go negative
			const amountToRemove = Math.min(amount, oldXp);
			const newXp = oldXp - amountToRemove;

			// Update user's XP
			await tx
				.update(users)
				.set({
					xp: newXp
				})
				.where(eq(users.id, userId));

			// Log the XP adjustment
			await tx.insert(xpAdjustmentLogs).values({
				userId,
				adminId: 1, // System user ID
				adjustmentType: 'subtract',
				amount: amountToRemove,
				reason,
				oldXp,
				newXp
			});

			// Calculate new level based on XP
			const levelsData = await tx
				.select()
				.from(levels)
				.where(db.sql`min_xp <= ${newXp}`)
				.orderBy(desc(levels.level))
				.limit(1);

			// If no levels data found, use default level 1
			const newLevel = levelsData.length > 0 ? levelsData[0].level : 1;
			const levelChanged = newLevel < oldLevel;

			// If level changed, update user's level
			if (levelChanged) {
				await tx.update(users).set({ level: newLevel }).where(eq(users.id, userId));

				// Create notification for level change
				await tx.insert(notifications).values({
					userId,
					type: 'info',
					title: 'Level Changed',
					body: `Your level has changed from ${oldLevel} to ${newLevel} due to an XP adjustment.`,
					data: {
						oldLevel,
						newLevel,
						reason
					}
				});
			}

			// Create an XP loss event (for event listeners)
			const xpEvent = new XpLossEvent(userId, amountToRemove, reason);

			return {
				oldXp,
				newXp,
				levelChanged,
				newLevel
			};
		});
	} catch (error) {
		logger.error(
			'XP_EVENTS',
			'Error handling XP loss:',
			error instanceof Error ? error.message : String(error)
		);
		throw error;
	}
}
