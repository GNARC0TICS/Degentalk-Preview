/**
 * Core XP Service
 *
 * Central service for managing user XP, levels, and related functionality.
 * This service is used by both admin and public-facing features.
 */

import {
	users,
	levels,
	titles,
	badges,
	userBadges,
	userTitles,
	xpAdjustmentLogs,
	userRoles,
	roles as rolesTable,
	forumStructure
} from '@schema';
import type { UserId } from '@shared/types';
import { eq, sql, and, desc, gte, lt, asc, gt, count } from 'drizzle-orm';
import { db } from '@db';
import { MissionsService } from '../missions/missions.service';
import { logger } from '../../core/logger';
import { getXpAction, XP_ACTION } from './xp-actions';
import { LevelUpEvent, XpGainEvent, XpLossEvent } from './xp.events';
import { xpActionLogs, xpActionLimits } from './xp-actions-schema';
// Import the centralized event handlers
import { handleXpAward, handleXpLoss, handleLevelUp } from './events/xp.events';
import { economyConfig, sanitizeMultiplier } from '@shared/economy/economy.config';
import type { AdminId, ForumId, UserId } from '@shared/types';

const { MAX_XP_PER_DAY, MAX_TIP_XP_PER_DAY } = economyConfig;

export class XpService {
	/**
	 * Update a user's XP and handle level recalculation
	 *
	 * @param userId - User ID to update
	 * @param amount - Amount to add, subtract, or set
	 * @param adjustmentType - How to modify XP ('add', 'subtract', or 'set')
	 * @param options - Additional options
	 * @returns Object with old and new XP values and level information
	 */
	async updateUserXp(
		userId: UserId,
		amount: number,
		adjustmentType: 'add' | 'subtract' | 'set' = 'add',
		options: {
			reason?: string;
			adminId?: AdminId;
			logAdjustment?: boolean;
			skipLevelCheck?: boolean;
			skipTriggers?: boolean;
		} = {}
	) {
		logger.info('Updating user XP', { userId, amount, adjustmentType, options });

		const {
			reason = 'System adjustment',
			adminId,
			logAdjustment = true,
			skipLevelCheck = false,
			skipTriggers = false
		} = options;

		// Use the dedicated handlers based on adjustment type
		try {
			let result;

			switch (adjustmentType) {
				case 'add':
					// Use handleXpAward for 'add' operations
					result = await handleXpAward(userId, amount, 'ADMIN_ADJUSTMENT', reason);
					break;
				case 'subtract':
					// Use handleXpLoss for 'subtract' operations
					result = await handleXpLoss(userId, amount, reason);
					break;
				case 'set':
					// For 'set' operations, we need to:
					// 1. Get current XP
					const userArray = await db
						.select({
							id: users.id,
							xp: users.xp,
							level: users.level
						})
						.from(users)
						.where(eq(users.id, userId))
						.limit(1);

					if (userArray.length === 0) {
						throw new Error(`User with ID ${userId} not found.`);
					}

					const user = userArray[0];
					const oldXp = user.xp;

					// 2. Determine if we should add or subtract
					if (amount > oldXp) {
						const addAmount = amount - oldXp;
						result = await handleXpAward(userId, addAmount, 'ADMIN_ADJUSTMENT', `Set to ${amount}`);
					} else if (amount < oldXp) {
						const subtractAmount = oldXp - amount;
						result = await handleXpLoss(userId, subtractAmount, `Set to ${amount}`);
					} else {
						// No change needed
						result = {
							oldXp,
							newXp: oldXp,
							oldLevel: user.level,
							newLevel: user.level,
							leveledUp: false,
							levelChanged: false
						};
					}
					break;
				default:
					throw new Error(`Invalid adjustment type: ${adjustmentType}`);
			}

			// If we have an admin ID and need to log separately
			if (logAdjustment && adminId) {
				await this.logXpAdjustment(
					userId,
					adminId,
					adjustmentType,
					amount,
					reason,
					result.oldXp,
					result.newXp
				);
			}

			return {
				userId,
				oldXp: result.oldXp,
				newXp: result.newXp,
				xpChange: result.newXp - result.oldXp,
				oldLevel: result.oldLevel,
				newLevel: result.newLevel,
				levelChanged: result.leveledUp
			};
		} catch (error) {
			logger.error('XP_SERVICE', 'Error in updateUserXp:', error);
			throw error;
		}
	}

	/**
	 * Log an XP adjustment for auditing purposes
	 */
	private async logXpAdjustment(
		userId: UserId,
		adminId: AdminId,
		adjustmentType: string,
		amount: number,
		reason: string,
		oldXp: number,
		newXp: number
	) {
		try {
			await db.insert(xpAdjustmentLogs).values({
				userId,
				adminId,
				adjustmentType,
				amount,
				reason,
				oldXp,
				newXp,
				createdAt: new Date()
			});

			logger.info('XP_SERVICE', 'XP adjustment logged successfully', {
				userId,
				adminId,
				adjustmentType,
				amount
			});
		} catch (error) {
			logger.error('XP_SERVICE', 'Error logging XP adjustment:', error);
			// Don't throw - just log the error and continue
		}
	}

	/**
	 * Get level information for a specific level
	 */
	async getLevel(levelNumber: number) {
		const levelData = await db.select().from(levels).where(eq(levels.level, levelNumber)).limit(1);

		return levelData[0] || null;
	}

	/**
	 * Get all levels in ascending order
	 */
	async getAllLevels() {
		return db.select().from(levels).orderBy(asc(levels.level));
	}

	/**
	 * Get user XP information
	 */
	async getUserXpInfo(userId: UserId) {
		const userArray = await db
			.select({
				id: users.id,
				xp: users.xp,
				level: users.level,
				username: users.username
			})
			.from(users)
			.where(eq(users.id, userId))
			.limit(1);

		if (userArray.length === 0) {
			throw new Error(`User with ID ${userId} not found.`);
		}

		const user = userArray[0];

		// Get current level details
		const currentLevelData = await this.getLevel(user.level);

		// Get next level details
		const nextLevelData = await db
			.select()
			.from(levels)
			.where(gt(levels.level, user.level))
			.orderBy(asc(levels.level))
			.limit(1);

		const nextLevel = nextLevelData.length > 0 ? nextLevelData[0] : null;

		// Calculate XP needed for next level
		const xpForNextLevel = nextLevel ? nextLevel.minXp - user.xp : 0;

		return {
			userId: user.id,
			username: user.username,
			currentXp: user.xp,
			currentLevel: user.level,
			currentLevelData,
			nextLevel: nextLevel?.level || null,
			nextLevelData: nextLevel || null,
			xpForNextLevel,
			progress: nextLevel
				? (user.xp - currentLevelData.minXp) / (nextLevel.minXp - currentLevelData.minXp)
				: 1
		};
	}

	/**
	 * Award XP to a user for completing an action
	 *
	 * @param userId User ID to award XP to
	 * @param action The action that grants XP
	 * @param metadata Optional metadata about the action
	 * @returns Result of the XP update operation
	 */
	async awardXp(userId: UserId, action: XP_ACTION, metadata?: any) {
		return this.awardXpWithContext(userId, action, metadata);
	}

	/**
	 * Award XP to a user for completing an action with forum context
	 *
	 * @param userId User ID to award XP to
	 * @param action The action that grants XP
	 * @param metadata Optional metadata about the action
	 * @param forumId Optional forum ID for forum-specific multipliers
	 * @returns Result of the XP update operation
	 */
	async awardXpWithContext(userId: UserId, action: XP_ACTION, metadata?: any, forumId?: ForumId) {
		try {
			const canReceive = await this.checkActionLimits(userId, action);

			if (!canReceive) {
				logger.info('XP_SERVICE', `XP not awarded due to limits: ${action}`, { userId, action });
				return; // Do not award XP if limits are hit
			}

			const actionConfig = await getXpAction(action);

			if (!actionConfig || !actionConfig.enabled) {
				logger.warn('XP_SERVICE', `Unknown or disabled XP action attempted: ${action}`, {
					userId,
					action
				});
				return; // Do not award for unknown or disabled actions
			}

			// Get multipliers
			const roleMultiplier = await this.getUserRoleMultiplier(userId);
			const forumMultiplier = forumId ? await this.getForumMultiplier(forumId) : 1.0;

			// Apply multiplier protection
			const multiplierResult = sanitizeMultiplier(roleMultiplier, forumMultiplier, {
				userId,
				forumId,
				action
			});

			// Calculate final XP amount
			const baseXp = actionConfig.baseValue;
			const finalXp = Math.floor(baseXp * multiplierResult.finalMultiplier);

			// Log multiplier violations if any
			if (multiplierResult.wasCapped) {
				logger.warn('XP_SERVICE', 'XP multiplier was capped', {
					userId,
					forumId,
					action,
					baseXp,
					originalMultiplier: multiplierResult.originalMultiplier,
					finalMultiplier: multiplierResult.finalMultiplier,
					violations: multiplierResult.violations
				});
			}

			// Log the action with final XP amount
			await this.logXpAction(userId, action, finalXp, {
				...metadata,
				baseXp,
				roleMultiplier,
				forumMultiplier,
				finalMultiplier: multiplierResult.finalMultiplier,
				wasCapped: multiplierResult.wasCapped
			});

			// Update user XP
			const result = await this.updateUserXp(userId, finalXp, 'add', {
				reason: `Action: ${action} (${finalXp}XP = ${baseXp} * ${multiplierResult.finalMultiplier.toFixed(2)})`,
				skipLevelCheck: false,
				skipTriggers: false
			});

			// Update action limits after successful award
			await this.updateActionLimits(userId, action);

			logger.info('XP_SERVICE', `Awarding XP for action: ${action}`, {
				userId,
				action,
				baseXp,
				finalXp,
				multiplierUsed: multiplierResult.finalMultiplier,
				forumId,
				metadata
			});

			return result;
		} catch (error) {
			logger.error('XP_SERVICE', `Error awarding XP for action ${action}:`, error);
			throw error;
		}
	}

	/**
	 * Check if a user can receive XP for a given action based on limits (daily max, cooldown)
	 */
	private async checkActionLimits(userId: UserId, action: XP_ACTION): Promise<boolean> {
		try {
			const actionConfig = await getXpAction(action);

			if (!actionConfig || !actionConfig.enabled) {
				// If action is not configured or disabled, no limits apply (or maybe always allow?)
				// For now, assuming if it's not configured, limits don't block
				return true;
			}

			const now = new Date();

			// Check daily max limit
			if (actionConfig.maxPerDay !== undefined) {
				const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
				const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

				const [dailyCountResult] = await db
					.select({ count: count() })
					.from(xpActionLogs)
					.where(
						and(
							eq(xpActionLogs.userId, userId),
							eq(xpActionLogs.action, action),
							gte(xpActionLogs.createdAt, startOfDay),
							lt(xpActionLogs.createdAt, endOfDay)
						)
					);

				if (dailyCountResult && dailyCountResult.count >= actionConfig.maxPerDay) {
					logger.warn(
						'XP_SERVICE',
						`Daily limit reached for XP action ${action} for user ${userId}`
					);
					return false; // Daily limit reached
				}
			}

			// Check cooldown
			if (actionConfig.cooldownSeconds !== undefined && actionConfig.cooldownSeconds > 0) {
				const [lastAction] = await db
					.select()
					.from(xpActionLogs)
					.where(and(eq(xpActionLogs.userId, userId), eq(xpActionLogs.action, action)))
					.orderBy(desc(xpActionLogs.createdAt))
					.limit(1);

				if (lastAction) {
					const timeSinceLastAward =
						(now.getTime() - new Date(lastAction.createdAt).getTime()) / 1000;
					if (timeSinceLastAward < actionConfig.cooldownSeconds) {
						logger.warn('XP_SERVICE', `Cooldown active for XP action ${action} for user ${userId}`);
						return false; // Cooldown active
					}
				}
			}

			return true; // No limits hit
		} catch (error) {
			logger.error('XP_SERVICE', `Error checking action limits for action ${action}:`, error);
			return false; // Assume limits block on error
		}
	}

	/**
	 * Update action limits for a user after an XP award
	 */
	private async updateActionLimits(userId: UserId, action: XP_ACTION): Promise<void> {
		// This method is a placeholder and currently does nothing as limits are log-based.
		// private async updateActionLimits(userId: UserId, action: XP_ACTION): Promise<void> {
		//   const actionConfig = await getXpAction(action); // Use getXpAction
		//
		//   if (!actionConfig || !actionConfig.enabled) {
		//     return; // No limits to update if action is not configured or disabled
		//   }
		//
		//   // Currently, limits are based on logs, so no explicit update is needed here.
		//   // This method is a placeholder for future limit mechanisms (e.g., per-action counters).
		// }
	}

	/**
	 * Log an XP action for auditing and limit tracking
	 */
	private async logXpAction(
		userId: UserId,
		action: XP_ACTION,
		amount: number,
		metadata?: any
	): Promise<void> {
		try {
			await db.insert(xpActionLogs).values({
				userId,
				action,
				amount,
				metadata,
				createdAt: new Date()
			});

			logger.info('XP_SERVICE', `XP Action Logged: ${action}`, { userId, action, amount });
		} catch (error) {
			logger.error('XP_SERVICE', 'Error logging XP action:', error);
			// Don't throw - just log the error and continue
		}
	}

	/**
	 * Get action limits for a user
	 *
	 * @param userId User ID
	 * @param action The action key
	 * @returns Object with limit information or null if no limits
	 */
	async getActionLimitsForUser(
		userId: UserId,
		action: XP_ACTION
	): Promise<{
		dailyLimit: number | null;
		dailyCount: number;
		isOnCooldown: boolean;
		cooldownSeconds: number | null;
		cooldownRemaining: number;
		timeSinceLastAward: number | null;
		canReceive: boolean;
	} | null> {
		try {
			const actionConfig = await getXpAction(action);

			if (!actionConfig || !actionConfig.enabled) {
				return null; // No limits defined for this action
			}

			const now = new Date();
			let dailyCount = 0;
			let timeSinceLastAward = -1; // Use -1 to indicate no previous award
			let onCooldown = false;
			let cooldownRemaining = 0;

			// Check daily count
			if (actionConfig.maxPerDay !== undefined) {
				const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
				const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

				const [dailyCountResult] = await db
					.select({ count: count() })
					.from(xpActionLogs)
					.where(
						and(
							eq(xpActionLogs.userId, userId),
							eq(xpActionLogs.action, action),
							gte(xpActionLogs.createdAt, startOfDay),
							lt(xpActionLogs.createdAt, endOfDay)
						)
					);

				dailyCount = dailyCountResult?.count || 0;
			}

			// Check cooldown
			if (actionConfig.cooldownSeconds !== undefined && actionConfig.cooldownSeconds > 0) {
				const [lastAction] = await db
					.select()
					.from(xpActionLogs)
					.where(and(eq(xpActionLogs.userId, userId), eq(xpActionLogs.action, action)))
					.orderBy(desc(xpActionLogs.createdAt))
					.limit(1);

				if (lastAction) {
					timeSinceLastAward = (now.getTime() - new Date(lastAction.createdAt).getTime()) / 1000;
					onCooldown = timeSinceLastAward < actionConfig.cooldownSeconds;
					cooldownRemaining = onCooldown
						? Math.ceil(actionConfig.cooldownSeconds - timeSinceLastAward)
						: 0;
				}
			}

			return {
				dailyLimit: actionConfig.maxPerDay || null,
				dailyCount,
				isOnCooldown: onCooldown,
				cooldownSeconds: actionConfig.cooldownSeconds || null,
				cooldownRemaining,
				timeSinceLastAward: timeSinceLastAward >= 0 ? timeSinceLastAward : null,
				canReceive:
					!onCooldown &&
					(actionConfig.maxPerDay === undefined || dailyCount < actionConfig.maxPerDay)
			};
		} catch (error) {
			logger.error(
				'XP_SERVICE',
				`Error getting action limits for user ${userId} action ${action}:`,
				error
			);
			return null; // Return null on error
		}
	}

	/**
	 * Get the effective XP multiplier for a user based on their roles.
	 * If the user has multiple roles, the highest multiplier is applied.
	 * If the user has no roles with a multiplier > 0, a default of 1 is returned.
	 */
	private async getUserRoleMultiplier(userId: UserId): Promise<number> {
		try {
			const roleMultipliers = await db
				.select({ multiplier: rolesTable.xpMultiplier })
				.from(userRoles)
				.innerJoin(rolesTable, eq(userRoles.roleId, rolesTable.id))
				.where(eq(userRoles.userId, userId));

			if (roleMultipliers.length === 0) return 1;

			// Return the highest multiplier the user has
			const maxMultiplier = Math.max(...roleMultipliers.map((r) => r.multiplier ?? 1));
			return maxMultiplier > 0 ? maxMultiplier : 1;
		} catch (error) {
			logger.error('XP_SERVICE', `Error fetching role XP multiplier for user ${userId}:`, error);
			return 1;
		}
	}

	/**
	 * Get the XP multiplier for a specific forum
	 */
	private async getForumMultiplier(forumId: ForumId): Promise<number> {
		try {
			const [forum] = await db
				.select({ xpMultiplier: forumStructure.xpMultiplier })
				.from(forumStructure)
				.where(eq(forumStructure.id, forumId))
				.limit(1);

			return forum?.xpMultiplier ?? 1.0;
		} catch (error) {
			logger.error('XP_SERVICE', `Error fetching forum XP multiplier for forum ${forumId}:`, error);
			return 1.0;
		}
	}
}

export const xpService = new XpService();
