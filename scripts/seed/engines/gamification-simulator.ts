import { db } from '@db';
import { logger } from '@server/core/logger';
import * as schema from '@schema';
import { eq, and, gte, lte, sql } from 'drizzle-orm';
import type { UserId } from '@shared/types/ids';
import { economyConfig } from '@shared/economy/economy.config';
import { getSeedConfig } from '../config/seed.config';
import { personas } from '../config/personas.config';
import chalk from 'chalk';

export interface XPAction {
	action: string;
	baseXp: number;
	dailyLimit?: number;
	cooldownSeconds?: number;
}

export interface Achievement {
	id: string;
	name: string;
	description: string;
	xpReward: number;
	category: string;
	prerequisiteId?: string;
}

export interface Mission {
	id: string;
	name: string;
	description: string;
	targetCount: number;
	xpReward: number;
	dgtReward?: number;
}

export class GamificationSimulator {
	private config = getSeedConfig();
	private xpActions: Map<string, XPAction> = new Map();
	private achievements: Map<string, Achievement> = new Map();
	private userXPTracking: Map<string, {
		dailyXP: number;
		lastReset: Date;
		cooldowns: Map<string, Date>;
	}> = new Map();

	private log(message: string, type: 'info' | 'success' | 'error' | 'warn' = 'info') {
		const prefix = {
			info: chalk.cyan('ℹ️'),
			success: chalk.green('✅'),
			error: chalk.red('❌'),
			warn: chalk.yellow('⚠️')
		}[type];
		
		console.log(`${prefix} [GamificationSim] ${message}`);
	}

	/**
	 * Initialize the gamification system
	 */
	async initialize(): Promise<void> {
		this.log('Initializing gamification simulator...', 'info');
		
		// Load XP actions from database
		const xpActions = await db.select().from(schema.xpActionSettings).where(eq(schema.xpActionSettings.isActive, true));
		xpActions.forEach(action => {
			this.xpActions.set(action.action, {
				action: action.action,
				baseXp: action.baseXp,
				dailyLimit: action.dailyLimit || undefined,
				cooldownSeconds: action.cooldownSeconds || 0
			});
		});
		
		// Load achievements
		const achievements = await db.select().from(schema.achievements);
		achievements.forEach(achievement => {
			this.achievements.set(achievement.id, {
				id: achievement.id,
				name: achievement.name,
				description: achievement.description || '',
				xpReward: achievement.xpReward,
				category: achievement.category,
				prerequisiteId: achievement.prerequisiteAchievementId || undefined
			});
		});
		
		this.log(`Loaded ${this.xpActions.size} XP actions and ${this.achievements.size} achievements`, 'success');
	}

	/**
	 * Simulate XP actions for a user
	 */
	async simulateXPActions(userId: UserId, personaId: string, dayNumber: number): Promise<number> {
		const persona = personas[personaId];
		if (!persona) return 0;

		let totalXPGained = 0;
		const userTracking = this.getUserTracking(userId);

		// Reset daily limits if new day
		const today = new Date();
		if (userTracking.lastReset.toDateString() !== today.toDateString()) {
			userTracking.dailyXP = 0;
			userTracking.lastReset = today;
			userTracking.cooldowns.clear();
		}

		// Determine actions based on persona behavior
		const actionsToSimulate = this.getActionsForPersona(persona, dayNumber);

		for (const actionName of actionsToSimulate) {
			const action = this.xpActions.get(actionName);
			if (!action) continue;

			// Check cooldown
			if (this.isOnCooldown(userId, actionName)) {
				continue;
			}

			// Check daily limit
			if (action.dailyLimit && userTracking.dailyXP >= action.dailyLimit) {
				if (persona.behavior.exploitsXPLoops) {
					// Exploiter tries to bypass limits
					this.log(`${persona.username} attempting to exploit XP limits`, 'warn');
					await this.recordXPExploit(userId, actionName);
				}
				continue;
			}

			// Apply XP with multipliers
			const xpGained = await this.awardXP(userId, action, dayNumber);
			totalXPGained += xpGained;
			userTracking.dailyXP += xpGained;

			// Set cooldown
			if (action.cooldownSeconds > 0) {
				userTracking.cooldowns.set(actionName, new Date(Date.now() + action.cooldownSeconds * 1000));
			}
		}

		// Check for level ups
		await this.checkLevelUp(userId);

		return totalXPGained;
	}

	/**
	 * Simulate achievement progress
	 */
	async simulateAchievements(userId: UserId, personaId: string): Promise<void> {
		const persona = personas[personaId];
		if (!persona) return;

		// Get user's current achievements
		const userAchievements = await db
			.select()
			.from(schema.userAchievements)
			.where(eq(schema.userAchievements.userId, userId));

		const unlockedIds = new Set(userAchievements.map(ua => ua.achievementId));

		// Determine which achievements to progress
		for (const [achievementId, achievement] of this.achievements) {
			if (unlockedIds.has(achievementId)) continue;

			// Check prerequisites
			if (achievement.prerequisiteId && !unlockedIds.has(achievement.prerequisiteId)) {
				continue;
			}

			// Simulate progress based on category and persona
			const shouldUnlock = this.shouldUnlockAchievement(achievement, persona);

			if (shouldUnlock) {
				await this.unlockAchievement(userId, achievementId);
				unlockedIds.add(achievementId);
				
				this.log(`${persona.username} unlocked achievement: ${achievement.name}`, 'success');

				// Award XP for achievement
				await this.awardAchievementXP(userId, achievement.xpReward);
			}
		}
	}

	/**
	 * Simulate mission progress
	 */
	async simulateMissions(userId: UserId, personaId: string, dayNumber: number): Promise<void> {
		const persona = personas[personaId];
		if (!persona) return;

		// Get active missions for user
		const userMissions = await db
			.select()
			.from(schema.userMissionProgress)
			.where(and(
				eq(schema.userMissionProgress.userId, userId),
				eq(schema.userMissionProgress.status, 'active')
			));

		// Progress missions based on persona behavior
		for (const mission of userMissions) {
			const progressRate = this.getMissionProgressRate(persona, mission.missionId);
			const newProgress = Math.min(
				mission.progress + Math.floor(progressRate * 10),
				mission.targetCount
			);

			await db
				.update(schema.userMissionProgress)
				.set({
					progress: newProgress,
					status: newProgress >= mission.targetCount ? 'completed' : 'active',
					completedAt: newProgress >= mission.targetCount ? new Date() : null,
					updatedAt: new Date()
				})
				.where(and(
					eq(schema.userMissionProgress.userId, userId),
					eq(schema.userMissionProgress.missionId, mission.missionId)
				));

			if (newProgress >= mission.targetCount) {
				this.log(`${persona.username} completed mission: ${mission.missionId}`, 'success');
			}
		}

		// Simulate streak maintenance
		if (persona.behavior.completionist) {
			await this.maintainStreaks(userId);
		}
	}

	/**
	 * Helper: Get actions for persona based on behavior
	 */
	private getActionsForPersona(persona: Persona, dayNumber: number): string[] {
		const actions: string[] = [];
		const frequency = persona.behavior.postFrequency;

		// Base actions everyone does
		if (dayNumber === 1 || Math.random() < 0.9) {
			actions.push('login');
		}

		// Posting behavior
		const postCount = {
			low: Math.floor(Math.random() * 2),
			medium: 2 + Math.floor(Math.random() * 3),
			high: 5 + Math.floor(Math.random() * 5),
			burst: Math.random() < 0.3 ? 10 + Math.floor(Math.random() * 10) : 0
		}[frequency];

		for (let i = 0; i < postCount; i++) {
			actions.push('create_post');
			if (Math.random() < 0.3) actions.push('receive_like');
		}

		// Tipping behavior
		if (persona.behavior.tipGenerosity !== 'stingy' && Math.random() < 0.2) {
			actions.push('tip_sent');
		}

		// Completionist behavior
		if (persona.behavior.completionist) {
			actions.push('complete_profile', 'verify_email', 'set_avatar');
		}

		// XP farming behavior
		if (persona.behavior.exploitsXPLoops) {
			// Try to maximize XP gain
			const farmingActions = ['create_post', 'like_post', 'view_thread'];
			for (let i = 0; i < 20; i++) {
				actions.push(farmingActions[Math.floor(Math.random() * farmingActions.length)]);
			}
		}

		return actions;
	}

	/**
	 * Helper: Award XP with multipliers
	 */
	private async awardXP(userId: UserId, action: XPAction, dayNumber: number): Promise<number> {
		let xp = action.baseXp;

		// Apply multipliers
		if (this.config.gamification.xpActions.multipliers) {
			// Weekend multiplier
			const isWeekend = dayNumber % 7 === 0 || dayNumber % 7 === 6;
			if (isWeekend) {
				xp *= this.config.temporal.weekendMultiplier;
			}

			// Early adopter bonus (first week)
			if (dayNumber <= 7) {
				xp *= 1.5;
			}
		}

		// Record XP gain
		await db.insert(schema.xpLogs).values({
			userId,
			action: action.action,
			xpAwarded: Math.floor(xp),
			multiplier: xp / action.baseXp,
			awardedAt: new Date()
		});

		// Update user XP
		await db
			.update(schema.users)
			.set({
				xp: sql`${schema.users.xp} + ${Math.floor(xp)}`
			})
			.where(eq(schema.users.id, userId));

		return Math.floor(xp);
	}

	/**
	 * Helper: Check and handle level ups
	 */
	private async checkLevelUp(userId: UserId): Promise<void> {
		const [user] = await db
			.select({ xp: schema.users.xp, level: schema.users.level })
			.from(schema.users)
			.where(eq(schema.users.id, userId))
			.limit(1);

		if (!user) return;

		// Get level thresholds
		const levels = await db
			.select()
			.from(schema.levels)
			.where(lte(schema.levels.xpRequired, user.xp))
			.orderBy(sql`${schema.levels.level} DESC`)
			.limit(1);

		if (levels.length > 0 && levels[0].level > user.level) {
			await db
				.update(schema.users)
				.set({ level: levels[0].level })
				.where(eq(schema.users.id, userId));

			this.log(`User ${userId} leveled up to ${levels[0].level}!`, 'success');

			// Create notification
			await db.insert(schema.notifications).values({
				userId,
				type: 'level_up',
				title: `Level Up! You reached level ${levels[0].level}`,
				message: `Congratulations! You've earned ${levels[0].rewards?.dgt || 0} DGT`,
				data: { newLevel: levels[0].level, rewards: levels[0].rewards },
				read: false
			});
		}
	}

	/**
	 * Helper: Should unlock achievement based on persona
	 */
	private shouldUnlockAchievement(achievement: Achievement, persona: Persona): boolean {
		// Completionists have higher unlock rate
		if (persona.behavior.completionist) {
			return Math.random() < 0.8;
		}

		// Category-based logic
		switch (achievement.category) {
			case 'social':
				return persona.behavior.helpfulness > 0.5 && Math.random() < 0.4;
			case 'economy':
				return persona.behavior.tipGenerosity !== 'stingy' && Math.random() < 0.3;
			case 'content':
				return persona.behavior.postFrequency !== 'low' && Math.random() < 0.5;
			case 'veteran':
				return persona.stats.level > 20 && Math.random() < 0.6;
			default:
				return Math.random() < this.config.gamification.achievements.unlockPercentage;
		}
	}

	/**
	 * Helper: Get user tracking data
	 */
	private getUserTracking(userId: UserId) {
		if (!this.userXPTracking.has(userId)) {
			this.userXPTracking.set(userId, {
				dailyXP: 0,
				lastReset: new Date(),
				cooldowns: new Map()
			});
		}
		return this.userXPTracking.get(userId)!;
	}

	/**
	 * Helper: Check if action is on cooldown
	 */
	private isOnCooldown(userId: UserId, action: string): boolean {
		const tracking = this.getUserTracking(userId);
		const cooldownEnd = tracking.cooldowns.get(action);
		return cooldownEnd ? cooldownEnd > new Date() : false;
	}

	/**
	 * Helper: Record XP exploit attempt
	 */
	private async recordXPExploit(userId: UserId, action: string): Promise<void> {
		await db.insert(schema.userAbuseFlags).values({
			userId,
			flagType: 'xp_exploit',
			severity: 'medium',
			description: `Attempted to bypass XP limits for action: ${action}`,
			evidence: { action, timestamp: new Date() },
			flaggedBy: null,
			status: 'pending'
		});
	}

	/**
	 * Helper: Unlock achievement
	 */
	private async unlockAchievement(userId: UserId, achievementId: string): Promise<void> {
		await db.insert(schema.userAchievements).values({
			userId,
			achievementId,
			unlockedAt: new Date()
		});

		// Fire achievement event
		await db.insert(schema.achievementEvents).values({
			achievementId,
			userId,
			eventType: 'unlocked',
			eventData: {},
			createdAt: new Date()
		});
	}

	/**
	 * Helper: Award achievement XP
	 */
	private async awardAchievementXP(userId: UserId, xpAmount: number): Promise<void> {
		await db
			.update(schema.users)
			.set({
				xp: sql`${schema.users.xp} + ${xpAmount}`
			})
			.where(eq(schema.users.id, userId));

		await db.insert(schema.xpLogs).values({
			userId,
			action: 'achievement_unlock',
			xpAwarded: xpAmount,
			multiplier: 1,
			awardedAt: new Date()
		});
	}

	/**
	 * Helper: Get mission progress rate
	 */
	private getMissionProgressRate(persona: Persona, missionId: string): number {
		// Base rate on persona traits
		if (persona.behavior.completionist) {
			return 0.9; // Almost always completes
		}

		// Random progress based on activity
		const baseRate = {
			low: 0.1,
			medium: 0.3,
			high: 0.5,
			burst: 0.7
		}[persona.behavior.postFrequency];

		return baseRate + (Math.random() * 0.2);
	}

	/**
	 * Helper: Maintain streaks for completionist users
	 */
	private async maintainStreaks(userId: UserId): Promise<void> {
		// Update login streak
		await db
			.update(schema.users)
			.set({
				lastSeenAt: new Date()
			})
			.where(eq(schema.users.id, userId));

		// Could track more complex streaks here
	}

	/**
	 * Simulate gamification for all users over time
	 */
	async simulateForAllUsers(users: Array<{ id: UserId; personaId: string }>, days: number): Promise<void> {
		this.log(`Starting gamification simulation for ${users.length} users over ${days} days`, 'info');

		for (let day = 1; day <= days; day++) {
			this.log(`Simulating day ${day}/${days}`, 'info');

			for (const user of users) {
				// Simulate XP actions
				const xpGained = await this.simulateXPActions(user.id, user.personaId, day);

				// Simulate achievements every few days
				if (day % 3 === 0) {
					await this.simulateAchievements(user.id, user.personaId);
				}

				// Simulate missions
				if (this.config.gamification.missions.activePerUser > 0) {
					await this.simulateMissions(user.id, user.personaId, day);
				}
			}

			// Decay activity (simulate natural drop-off)
			if (this.config.temporal.decayRates.userActivity < 1) {
				const dropoffCount = Math.floor(users.length * (1 - this.config.temporal.decayRates.userActivity) * (day / days));
				users.splice(users.length - dropoffCount, dropoffCount);
			}
		}

		this.log('Gamification simulation complete!', 'success');
	}
}