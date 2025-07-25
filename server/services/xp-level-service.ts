import { db } from '@db';
import {
	users,
	levels,
	economySettings,
	userTitles,
	userBadges,
	titles,
	badges,
	userOwnedFrames,
	avatarFrames,
	xpCloutSettings,
	userRoles,
	roles as rolesTable,
	forumStructure
} from '@schema';
import type { UserId } from '@shared/types/ids';
import { eq, sql, lte, desc, and, isNull } from 'drizzle-orm';
import { logger } from '../src/core/logger';
import { getLevelForXp, getXpForLevel } from '@shared/economy/reward-calculator';
import { sanitizeMultiplier } from '@shared/config/economy.config';
import type { TitleId, BadgeId, FrameId, ForumId } from '../shared/types/ids';

/**
 * XP Action types used in economySettings
 */
export const XP_ACTIONS = {
	POST_CREATED: 'POST_CREATED',
	REPLY_CREATED: 'REPLY_CREATED',
	HELPFUL_REACTION_RECEIVED: 'HELPFUL_REACTION_RECEIVED',
	LIKE_REACTION_RECEIVED: 'LIKE_REACTION_RECEIVED',
	TIP_RECEIVED: 'TIP_RECEIVED',
	MOD_MARK_RECEIVED: 'MOD_MARK_RECEIVED',
	DAILY_XP_CAP: 'DAILY_XP_CAP',
	TIP_XP_PER_UNIT: 'TIP_XP_PER_UNIT',
	TIP_XP_MAX_PER_EVENT: 'TIP_XP_MAX_PER_EVENT',
	// Dictionary feature actions
	DICTIONARY_ENTRY_SUBMITTED: 'DICTIONARY_ENTRY_SUBMITTED',
	DICTIONARY_ENTRY_APPROVED: 'DICTIONARY_ENTRY_APPROVED',
	DICTIONARY_ENTRY_UPVOTED: 'DICTIONARY_ENTRY_UPVOTED',
	DICTIONARY_ENTRY_APPROVAL: 'DICTIONARY_ENTRY_APPROVAL'
};

/**
 * Service for handling XP and level progression
 */
export class XpLevelService {
	private db;
	// private walletService; // Placeholder for wallet service integration

	constructor(drizzleInstance = db) {
		this.db = drizzleInstance;
	}

	/**
	 * Award XP to a user for a specific action
	 * @param userId The user ID to award XP to
	 * @param actionKey The action key from XP_ACTIONS
	 * @param metadata Optional metadata (e.g., tip amount for TIP_RECEIVED)
	 * @returns Object containing success info and XP awarded
	 */
	async awardXp(
		userId: UserId,
		actionKey: string,
		metadata?: { amount?: number }
	): Promise<{
		success: boolean;
		xpAwarded: number;
		newTotal: number;
		levelUp: boolean;
		newLevel?: number;
	}> {
		try {
			// Get base XP value for the action
			let baseXp = await this.getXpValue(actionKey);

			// Special handling for tips (if applicable)
			if (actionKey === XP_ACTIONS.TIP_RECEIVED && metadata?.amount) {
				const xpPerUnit = (await this.getXpValue(XP_ACTIONS.TIP_XP_PER_UNIT)) || 0;
				const maxTipXp = (await this.getXpValue(XP_ACTIONS.TIP_XP_MAX_PER_EVENT)) || 0;

				baseXp = Math.floor(metadata.amount * xpPerUnit);

				// Cap to maximum if defined
				if (maxTipXp > 0) {
					baseXp = Math.min(baseXp, maxTipXp);
				}
			}

			// Apply role-based XP multiplier with protection
			const xpMultiplier = await this.getUserXpMultiplier(userId);
			baseXp = Math.floor(baseXp * xpMultiplier);

			// If no XP to award, return early
			if (baseXp <= 0) {
				logger.info('XpLevelService', `No XP to award for action ${actionKey} to user ${userId}`);
				return { success: false, xpAwarded: 0, newTotal: 0, levelUp: false };
			}

			// Check daily XP cap
			const { allowedXp, newDailyTotal } = await this.checkDailyXpCap(userId, baseXp);

			// If no XP allowed (hit cap), return early
			if (allowedXp <= 0) {
				logger.info('XpLevelService', `User ${userId} has hit daily XP cap, no XP awarded`);
				return { success: false, xpAwarded: 0, newTotal: 0, levelUp: false };
			}

			// Use a transaction to ensure data consistency
			return await this.db.transaction(async (tx) => {
				// Get current user level for comparison later
				const userResult = await tx
					.select({
						currentXp: users.xp,
						currentLevel: users.level
					})
					.from(users)
					.where(eq(users.id, userId))
					.limit(1);

				if (userResult.length === 0) {
					logger.warn('XpLevelService', `User ${userId} not found`);
					return { success: false, xpAwarded: 0, newTotal: 0, levelUp: false };
				}

				const { currentXp, currentLevel } = userResult[0];
				const newXp = currentXp + allowedXp;

				// Update user XP and daily tracking
				await tx
					.update(users)
					.set({
						xp: sql`${users.xp} + ${allowedXp}`,
						dailyXpGained: newDailyTotal,
						lastXpGainDate: new Date()
					})
					.where(eq(users.id, userId));

				// Calculate if user has leveled up
				const targetLevelData = await tx
					.select({
						level: levels.level
					})
					.from(levels)
					.where(lte(levels.minXp, newXp))
					.orderBy(desc(levels.level))
					.limit(1);

				const newLevel = targetLevelData.length > 0 ? targetLevelData[0].level : 1;
				const levelUp = newLevel > currentLevel;

				// If leveled up, update user's level and distribute rewards
				if (levelUp) {
					await this.handleLevelUp(tx, userId, currentLevel, newLevel);

					logger.info(
						'XpLevelService',
						`User ${userId} leveled up from ${currentLevel} to ${newLevel}`
					);
				}

				logger.info(
					'XpLevelService',
					`Awarded ${allowedXp} XP to user ${userId} for action ${actionKey}. New total: ${newXp}`
				);

				return {
					success: true,
					xpAwarded: allowedXp,
					newTotal: newXp,
					levelUp,
					newLevel: levelUp ? newLevel : undefined
				};
			});
		} catch (error) {
			logger.error(
				'XpLevelService',
				`Error awarding XP for action ${actionKey} to user ${userId}:`,
				error
			);
			return { success: false, xpAwarded: 0, newTotal: 0, levelUp: false };
		}
	}

	/**
	 * Fetch the XP value for a specific action from economySettings
	 * @param actionKey The action key from XP_ACTIONS
	 * @returns The XP value for the action, or 0 if not found
	 */
	private async getXpValue(actionKey: string): Promise<number> {
		try {
			// First try the economySettings table
			const economySetting = await this.db
				.select({
					value: economySettings.value
				})
				.from(economySettings)
				.where(eq(economySettings.key, actionKey))
				.limit(1);

			if (economySetting.length > 0) {
				return economySetting[0].value;
			}

			// If not found in economySettings, try xpCloutSettings
			const xpCloutSetting = await this.db
				.select({
					xpValue: xpCloutSettings.xpValue
				})
				.from(xpCloutSettings)
				.where(eq(xpCloutSettings.actionKey, actionKey))
				.limit(1);

			if (xpCloutSetting.length > 0) {
				return xpCloutSetting[0].xpValue;
			}

			logger.warn('XpLevelService', `No XP value found for action key ${actionKey}`);
			return 0;
		} catch (error) {
			logger.error('XpLevelService', `Error getting XP value for action ${actionKey}:`, error);
			return 0;
		}
	}

	/**
	 * Check if the user has hit their daily XP cap and calculate allowed XP
	 * @param userId The user ID to check
	 * @param xpToAward The amount of XP to award
	 * @returns Object containing allowed XP and new daily total
	 */
	private async checkDailyXpCap(
		userId: UserId,
		xpToAward: number
	): Promise<{ allowedXp: number; newDailyTotal: number }> {
		try {
			// Get the daily XP cap from settings
			const dailyCapSetting = await this.getXpValue(XP_ACTIONS.DAILY_XP_CAP);

			// If no cap is set or it's 0, no limit applies
			if (!dailyCapSetting || dailyCapSetting <= 0) {
				return { allowedXp: xpToAward, newDailyTotal: xpToAward };
			}

			// Get user's current daily XP gained and last gain date
			const userResult = await this.db
				.select({
					dailyXpGained: users.dailyXpGained,
					lastXpGainDate: users.lastXpGainDate
				})
				.from(users)
				.where(eq(users.id, userId))
				.limit(1);

			if (userResult.length === 0) {
				logger.warn('XpLevelService', `User ${userId} not found when checking daily cap`);
				return { allowedXp: 0, newDailyTotal: 0 };
			}

			const { dailyXpGained, lastXpGainDate } = userResult[0];

			// Reset daily XP if it's a new day or first gain ever
			const today = new Date();
			today.setHours(0, 0, 0, 0); // Start of today

			let currentDailyXp = dailyXpGained || 0;
			if (!lastXpGainDate || new Date(lastXpGainDate) < today) {
				currentDailyXp = 0; // Reset if last gain was before today or never gained before
			}

			// Calculate how much XP can be awarded within the cap
			const remainingCap = Math.max(0, dailyCapSetting - currentDailyXp);
			const allowedXp = Math.min(xpToAward, remainingCap);
			const newDailyTotal = currentDailyXp + allowedXp;

			if (allowedXp < xpToAward) {
				logger.info(
					'XpLevelService',
					`User ${userId} hit daily XP cap. Awarded ${allowedXp}/${xpToAward} XP`
				);
			}

			return { allowedXp, newDailyTotal };
		} catch (error) {
			logger.error('XpLevelService', `Error checking daily XP cap for user ${userId}:`, error);
			return { allowedXp: 0, newDailyTotal: 0 };
		}
	}

	/**
	 * Handle the level up process - update user level and distribute rewards
	 * @param tx The transaction object
	 * @param userId The user ID that leveled up
	 * @param currentLevel The user's current level
	 * @param newLevel The user's new level
	 */
	private async handleLevelUp(
		tx: any,
		userId: UserId,
		currentLevel: number,
		newLevel: number
	): Promise<void> {
		try {
			// Update the user's level
			await tx.update(users).set({ level: newLevel }).where(eq(users.id, userId));

			// Distribute rewards for each level gained
			for (let level = currentLevel + 1; level <= newLevel; level++) {
				await this.distributeRewards(tx, userId, level);
			}

			// In a real implementation, we might want to add a notification here
			// or trigger some other celebration event
		} catch (error) {
			logger.error(
				'XpLevelService',
				`Error handling level up for user ${userId} from ${currentLevel} to ${newLevel}:`,
				error
			);
			throw error; // Re-throw to be caught by the transaction
		}
	}

	/**
	 * Distribute rewards (DGT, Titles, Badges) for a specific level
	 * @param tx The transaction object
	 * @param userId The user ID to reward
	 * @param level The level to distribute rewards for
	 */
	private async distributeRewards(tx: any, userId: UserId, level: number): Promise<void> {
		try {
			// Get the level data to check for rewards
			const levelData = await tx
				.select({
					rewardDgt: levels.rewardDgt,
					rewardTitleId: levels.rewardTitleId,
					rewardBadgeId: levels.rewardBadgeId,
					unlocks: levels.unlocks
				})
				.from(levels)
				.where(eq(levels.level, level))
				.limit(1);

			if (levelData.length === 0) {
				logger.warn('XpLevelService', `No level data found for level ${level}`);
				return;
			}

			const { rewardDgt, rewardTitleId, rewardBadgeId, unlocks } = levelData[0];

			// Award DGT if specified (would need a wallet service integration)
			if (rewardDgt && rewardDgt > 0) {
				// In real implementation, we'd call the wallet service here
				// await this.walletService.creditUser(userId, rewardDgt, `Level ${level} reward`);

				logger.info(
					'XpLevelService',
					`DGT reward of ${rewardDgt} for level ${level} to user ${userId} (not implemented yet)`
				);
			}

			// Award Title if specified
			if (rewardTitleId) {
				// Add the title to the user's unlocked titles
				await tx
					.insert(userTitles)
					.values({
						userId,
						titleId: rewardTitleId,
						awardedAt: new Date()
					})
					.onConflictDoNothing();

				// Optionally set as active title if user doesn't have one set
				const userResult = await tx
					.select({
						activeTitleId: users.activeTitleId
					})
					.from(users)
					.where(eq(users.id, userId))
					.limit(1);

				if (userResult.length > 0 && !userResult[0].activeTitleId) {
					await tx.update(users).set({ activeTitleId: rewardTitleId }).where(eq(users.id, userId));
				}

				logger.info(
					'XpLevelService',
					`Title ID ${rewardTitleId} awarded to user ${userId} for reaching level ${level}`
				);
			}

			// Award Badge if specified
			if (rewardBadgeId) {
				await tx
					.insert(userBadges)
					.values({
						userId,
						badgeId: rewardBadgeId,
						awardedAt: new Date()
					})
					.onConflictDoNothing();

				logger.info(
					'XpLevelService',
					`Badge ID ${rewardBadgeId} awarded to user ${userId} for reaching level ${level}`
				);
			}

			// ──────────── New Unlocks JSON Handling ────────────
			try {
				if (unlocks && typeof unlocks === 'object') {
					// Titles array
					if (Array.isArray(unlocks.titles) && unlocks.titles.length > 0) {
						await tx
							.insert(userTitles)
							.values(
								unlocks.titles.map((titleId: TitleId) => ({
									userId,
									titleId,
									awardedAt: new Date()
								}))
							)
							.onConflictDoNothing();
					}

					// Badges array
					if (Array.isArray(unlocks.badges) && unlocks.badges.length > 0) {
						await tx
							.insert(userBadges)
							.values(
								unlocks.badges.map((badgeId: BadgeId) => ({
									userId,
									badgeId,
									awardedAt: new Date()
								}))
							)
							.onConflictDoNothing();
					}

					// Frames array – verify frame IDs exist
					if (Array.isArray(unlocks.frames) && unlocks.frames.length > 0) {
						await tx
							.insert(userOwnedFrames)
							.values(
								unlocks.frames.map((frameId: FrameId) => ({
									userId,
									frameId,
									source: 'level'
								}))
							)
							.onConflictDoNothing();
					}
				}
			} catch (unlockErr) {
				logger.error(
					'XpLevelService',
					`Error applying unlocks for level ${level} to user ${userId}:`,
					unlockErr
				);
			}
		} catch (error) {
			logger.error(
				'XpLevelService',
				`Error distributing rewards for level ${level} to user ${userId}:`,
				error
			);
			throw error; // Re-throw to be caught by the transaction
		}
	}

	/**
	 * Get a user's XP, level, and progress to next level
	 * @param userId The user ID to get info for
	 * @returns Object with current XP, level, next level XP, and progress percentage
	 */
	async getUserXpInfo(userId: UserId): Promise<{
		currentXp: number;
		currentLevel: number;
		nextLevelXp: number | null;
		progressPercent: number;
		needXp: number | null;
	}> {
		try {
			// Get user's current XP and level
			const userResult = await this.db
				.select({
					xp: users.xp,
					level: users.level
				})
				.from(users)
				.where(eq(users.id, userId))
				.limit(1);

			if (userResult.length === 0) {
				throw new Error(`User ${userId} not found`);
			}

			const { xp: currentXp, level: currentLevel } = userResult[0];

			// Get current level XP threshold
			const currentLevelData = await this.db
				.select({
					minXp: levels.minXp
				})
				.from(levels)
				.where(eq(levels.level, currentLevel))
				.limit(1);

			// Get next level XP threshold
			const nextLevelData = await this.db
				.select({
					minXp: levels.minXp
				})
				.from(levels)
				.where(eq(levels.level, currentLevel + 1))
				.limit(1);

			// If no next level defined, user is at max level
			if (nextLevelData.length === 0) {
				return {
					currentXp,
					currentLevel,
					nextLevelXp: null,
					progressPercent: 100,
					needXp: null
				};
			}

			const currentLevelXp = currentLevelData.length > 0 ? currentLevelData[0].minXp : 0;
			const nextLevelXp = nextLevelData[0].minXp;
			const xpNeeded = nextLevelXp - currentLevelXp;
			const xpProgress = currentXp - currentLevelXp;

			// Calculate progress percentage (0-100)
			const progressPercent = Math.min(Math.floor((xpProgress / xpNeeded) * 100), 100);
			const needXp = nextLevelXp - currentXp;

			return {
				currentXp,
				currentLevel,
				nextLevelXp,
				progressPercent,
				needXp
			};
		} catch (error) {
			logger.error('XpLevelService', `Error getting XP info for user ${userId}:`, error);
			throw error;
		}
	}

	/**
	 * Get the effective XP multiplier for a user based on their roles.
	 * If the user has multiple roles, the highest multiplier is applied.
	 * If the user has no roles with a multiplier > 0, a default of 1 is returned.
	 * Now includes forum multiplier protection against stacking exploits.
	 */
	private async getUserXpMultiplier(userId: UserId, forumId?: ForumId): Promise<number> {
		try {
			// Get role multiplier
			const roleMultipliers = await this.db
				.select({ multiplier: rolesTable.xpMultiplier })
				.from(userRoles)
				.innerJoin(rolesTable, eq(userRoles.roleId, rolesTable.id))
				.where(eq(userRoles.userId, userId));

			const roleMultiplier =
				roleMultipliers.length === 0
					? 1
					: Math.max(...roleMultipliers.map((r) => r.multiplier ?? 1));

			// Get forum multiplier if forumId provided
			let forumMultiplier = 1;
			if (forumId) {
				const [forum] = await this.db
					.select({ xpMultiplier: forumStructure.xpMultiplier })
					.from(forumStructure)
					.where(eq(forumStructure.id, forumId))
					.limit(1);

				forumMultiplier = forum?.xpMultiplier ?? 1.0;
			}

			// Apply multiplier protection
			const result = sanitizeMultiplier(roleMultiplier, forumMultiplier, {
				userId,
				forumId
			});

			if (result.wasCapped) {
				logger.warn('XpLevelService', 'XP multiplier was capped for user', {
					userId,
					forumId,
					roleMultiplier,
					forumMultiplier,
					originalMultiplier: result.originalMultiplier,
					finalMultiplier: result.finalMultiplier,
					violations: result.violations
				});
			}

			return result.finalMultiplier;
		} catch (error) {
			logger.error('XpLevelService', `Error fetching XP multiplier for user ${userId}:`, error);
			return 1;
		}
	}
}

// Export a singleton instance
export const xpLevelService = new XpLevelService();
