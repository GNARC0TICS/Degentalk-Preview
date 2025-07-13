import { db } from '@db';
import { missions, userMissionProgress } from '@schema';
import { eq, and, or, sql, lte, gte, isNull } from 'drizzle-orm';
import { logger } from '@core/logger';
import type { UserId } from '@shared/types/ids';
import { xpService } from '../../xp/xp.service';
import { dgtService } from '../../wallet/services/dgtService';
import { eventLogService } from '../../activity/services/event-log.service';
import { achievementService } from './achievement.service';
import { users } from '@schema';
import { missionConfig } from '../../../../../config/missions.config';

interface MissionConditions {
	forumId?: string;
	timeWindow?: { start: number; end: number };
	minWordCount?: number;
	requiresMission?: string;
	requiresRole?: string;
	requiresBadge?: string;
	dayOfWeek?: number[];
	minUserLevel?: number;
	maxUserLevel?: number;
}

export class MissionService {
	async getActiveMissions() {
		const now = new Date();
		return db
			.select()
			.from(missions)
			.where(
				and(
					eq(missions.isActive, true),
					or(isNull(missions.expiresAt), gte(missions.expiresAt, now))
				)
			)
			.orderBy(missions.sortOrder);
	}

	async getDailyMissions(userId: UserId) {
		const activeMissions = await this.getActiveMissions();
		const dailyMissions = activeMissions.filter((m) => m.isDaily);

		return this.enrichMissionsWithProgress(userId, dailyMissions);
	}

	async getWeeklyMissions(userId: UserId) {
		const activeMissions = await this.getActiveMissions();
		const weeklyMissions = activeMissions.filter((m) => m.isWeekly);

		return this.enrichMissionsWithProgress(userId, weeklyMissions);
	}

	async getUserMissionProgress(userId: UserId, missionId: string) {
		const [progress] = await db
			.select()
			.from(userMissionProgress)
			.where(
				and(
					eq(userMissionProgress.userId, userId),
					eq(userMissionProgress.missionId, missionId as any) // Fix after schema migration
				)
			)
			.limit(1);

		return progress;
	}

	async updateProgress(userId: UserId, missionId: string, increment: number = 1) {
		const [mission] = await db
			.select()
			.from(missions)
			.where(eq(missions.id, missionId))
			.limit(1);

		if (!mission || !mission.isActive) {
			throw new Error('Mission not found or inactive');
		}

		const progress = await this.getUserMissionProgress(userId, missionId);

		if (progress?.isCompleted) {
			return progress; // Already completed
		}

		return db.transaction(async (tx) => {
			if (!progress) {
				// Create new progress
				const [newProgress] = await tx
					.insert(userMissionProgress)
					.values({
						userId,
						missionId: missionId as any, // Fix after schema migration
						currentCount: Math.min(increment, mission.requiredCount),
						isCompleted: increment >= mission.requiredCount,
						completedAt: increment >= mission.requiredCount ? new Date() : null
					})
					.returning();

				if (newProgress.isCompleted) {
					await this.logMissionComplete(userId, missionId);
				}

				return newProgress;
			}

			// Update existing progress
			const newCount = progress.currentCount + increment;
			const isNowComplete = newCount >= mission.requiredCount;

			const [updated] = await tx
				.update(userMissionProgress)
				.set({
					currentCount: Math.min(newCount, mission.requiredCount),
					isCompleted: isNowComplete,
					completedAt: isNowComplete && !progress.isCompleted ? new Date() : progress.completedAt,
					updatedAt: new Date()
				})
				.where(
					and(
						eq(userMissionProgress.userId, userId),
						eq(userMissionProgress.missionId, missionId as any)
					)
				)
				.returning();

			if (isNowComplete && !progress.isCompleted) {
				await this.logMissionComplete(userId, missionId);
			}

			return updated;
		});
	}

	async claimReward(userId: UserId, missionId: string) {
		const progress = await this.getUserMissionProgress(userId, missionId);

		if (!progress) {
			throw new Error('No progress found for this mission');
		}

		if (!progress.isCompleted) {
			throw new Error('Mission not completed');
		}

		if (progress.isRewardClaimed) {
			throw new Error('Reward already claimed');
		}

		const [mission] = await db
			.select()
			.from(missions)
			.where(eq(missions.id, missionId))
			.limit(1);

		if (!mission) {
			throw new Error('Mission not found');
		}

		return db.transaction(async (tx) => {
			// Mark as claimed
			await tx
				.update(userMissionProgress)
				.set({
					isRewardClaimed: true,
					claimedAt: new Date()
				})
				.where(
					and(
						eq(userMissionProgress.userId, userId),
						eq(userMissionProgress.missionId, missionId as any)
					)
				);

			// Award XP
			if (mission.xpReward > 0) {
				await xpService.awardXp(userId, mission.xpReward, 'MISSION_COMPLETE', {
					missionId,
					missionTitle: mission.title
				});
			}

			// Award DGT
			if (mission.dgtReward && mission.dgtReward > 0) {
				await dgtService.processReward(userId, mission.dgtReward, 'mission_complete', {
					missionId,
					missionTitle: mission.title
				});
			}

			// Award badge/achievement
			if (mission.badgeReward) {
				await achievementService.checkAndAwardAchievements(userId, 'mission_complete', {
					missionId,
					badgeId: mission.badgeReward
				});
			}

			// Log event
			await eventLogService.logEvent({
				userId,
				eventType: 'mission_reward_claimed',
				eventData: {
					missionId,
					rewards: {
						xp: mission.xpReward,
						dgt: mission.dgtReward,
						badge: mission.badgeReward
					}
				}
			});

			logger.info({ userId, missionId }, 'Mission reward claimed');

			return { success: true };
		});
	}

	async resetDailyMissions() {
		const startOfDay = new Date();
		startOfDay.setHours(0, 0, 0, 0);

		const dailyMissionIds = await db
			.select({ id: missions.id })
			.from(missions)
			.where(eq(missions.isDaily, true));

		if (dailyMissionIds.length === 0) return;

		const ids = dailyMissionIds.map((m) => m.id);

		const result = await db
			.update(userMissionProgress)
			.set({
				currentCount: 0,
				isCompleted: false,
				isRewardClaimed: false,
				completedAt: null,
				claimedAt: null,
				updatedAt: new Date()
			})
			.where(
				and(
					sql`${userMissionProgress.missionId} = ANY(${ids})`,
					lte(userMissionProgress.updatedAt, startOfDay)
				)
			);

		logger.info({ count: result.rowCount }, 'Daily missions reset');
	}

	async resetWeeklyMissions() {
		const startOfWeek = new Date();
		const day = startOfWeek.getDay();
		const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Monday
		startOfWeek.setDate(diff);
		startOfWeek.setHours(0, 0, 0, 0);

		const weeklyMissionIds = await db
			.select({ id: missions.id })
			.from(missions)
			.where(eq(missions.isWeekly, true));

		if (weeklyMissionIds.length === 0) return;

		const ids = weeklyMissionIds.map((m) => m.id);

		const result = await db
			.update(userMissionProgress)
			.set({
				currentCount: 0,
				isCompleted: false,
				isRewardClaimed: false,
				completedAt: null,
				claimedAt: null,
				updatedAt: new Date()
			})
			.where(
				and(
					sql`${userMissionProgress.missionId} = ANY(${ids})`,
					lte(userMissionProgress.updatedAt, startOfWeek)
				)
			);

		logger.info({ count: result.rowCount }, 'Weekly missions reset');
	}

	async trackAction(userId: UserId, action: string, metadata?: Record<string, any>) {
		// Find missions that require this action
		const relevantMissions = await db
			.select()
			.from(missions)
			.where(
				and(
					eq(missions.requiredAction, action),
					eq(missions.isActive, true)
				)
			);

		// Check user level for mission eligibility
		const user = await db.select({ level: users.level }).from(users).where(eq(users.id, userId)).limit(1);
		const userLevel = user[0]?.level || 1;

		for (const mission of relevantMissions) {
			try {
				// Skip if user doesn't meet level requirement
				if (mission.minLevel > userLevel) continue;

				// Check custom conditions if any (when conditions column is added to schema)
				// TODO: Add 'conditions' TEXT column to missions table
				// if (mission.conditions && !await this.checkCustomConditions(userId, mission, metadata)) {
				// 	continue;
				// }

				// Calculate progress increment (may vary based on metadata)
				const increment = this.calculateProgressIncrement(mission, metadata);
				
				await this.updateProgress(userId, mission.id, increment);
			} catch (error) {
				logger.error({ error, userId, missionId: mission.id }, 'Failed to update mission progress');
			}
		}
	}

	private calculateProgressIncrement(mission: any, metadata?: Record<string, any>): number {
		// Default increment
		let increment = 1;

		// Custom increment logic based on mission type and metadata
		switch (mission.requiredAction) {
			case 'post_word_count':
				increment = metadata?.wordCount || 0;
				break;
			case 'tip_amount':
				increment = metadata?.tipAmount || 0;
				break;
			case 'thread_views':
				increment = metadata?.viewCount || 1;
				break;
			case 'reaction_received':
				// Different reactions might count differently
				if (metadata?.reactionType === '🔥') increment = 2;
				break;
			case 'consecutive_days':
				// This would be handled by a separate consecutive day tracker
				increment = metadata?.consecutiveDays || 1;
				break;
		}

		return increment;
	}

	private async checkCustomConditions(userId: UserId, mission: any, metadata?: Record<string, any>): Promise<boolean> {
		if (!mission.conditions) return true;

		try {
			const conditions = JSON.parse(mission.conditions);

			// Forum-specific missions
			if (conditions.forumId && metadata?.forumId !== conditions.forumId) {
				return false;
			}

			// Time-based missions
			if (conditions.timeWindow) {
				const hour = new Date().getHours();
				const { start, end } = conditions.timeWindow;
				if (hour < start || hour > end) return false;
			}

			// Minimum quality requirements
			if (conditions.minWordCount && (metadata?.wordCount || 0) < conditions.minWordCount) {
				return false;
			}

			// Chain missions (require previous mission completion)
			if (conditions.requiresMission) {
				const prevProgress = await this.getUserMissionProgress(userId, conditions.requiresMission);
				if (!prevProgress?.isCompleted) return false;
			}

			// User attribute requirements
			if (conditions.requiresRole || conditions.requiresBadge) {
				// Would check user roles/badges here
				return true; // Placeholder
			}

			return true;
		} catch (error) {
			logger.error({ error, missionId: mission.id }, 'Failed to parse mission conditions');
			return true; // Default to allowing if conditions are malformed
		}
	}

	private async enrichMissionsWithProgress(userId: UserId, missionList: any[]) {
		const missionIds = missionList.map((m) => m.id);

		const progressRecords = await db
			.select()
			.from(userMissionProgress)
			.where(
				and(
					eq(userMissionProgress.userId, userId),
					sql`${userMissionProgress.missionId} = ANY(${missionIds})`
				)
			);

		const progressMap = new Map(progressRecords.map((p) => [p.missionId, p]));

		return missionList.map((mission) => ({
			...mission,
			progress: progressMap.get(mission.id) || {
				currentCount: 0,
				isCompleted: false,
				isRewardClaimed: false
			}
		}));
	}

	private async logMissionComplete(userId: UserId, missionId: string) {
		await eventLogService.logEvent({
			userId,
			eventType: 'mission_completed',
			eventData: { missionId }
		});
	}

	// Dynamic mission creation for events
	async createEventMission(config: {
		title: string;
		description: string;
		action: string;
		target: number;
		rewards: { xp?: number; dgt?: number; badge?: string };
		duration: { hours?: number; days?: number };
		conditions?: MissionConditions;
		icon?: string;
	}) {
		const expiresAt = new Date();
		if (config.duration.hours) {
			expiresAt.setHours(expiresAt.getHours() + config.duration.hours);
		} else if (config.duration.days) {
			expiresAt.setDate(expiresAt.getDate() + config.duration.days);
		}

		const [mission] = await db.insert(missions).values({
			title: config.title,
			description: config.description,
			type: 'event',
			requiredAction: config.action,
			requiredCount: config.target,
			xpReward: config.rewards.xp || 0,
			dgtReward: config.rewards.dgt || null,
			badgeReward: config.rewards.badge || null,
			icon: config.icon || '🎯',
			isDaily: false,
			isWeekly: false,
			expiresAt,
			isActive: true,
			minLevel: config.conditions?.minUserLevel || 1,
			// conditions: config.conditions ? JSON.stringify(config.conditions) : null // TODO: Add column
		}).returning();

		logger.info({ missionId: mission.id, title: mission.title }, 'Event mission created');
		return mission;
	}

	// Get mission templates for admin UI
	static getMissionTemplates() {
		return [
			{
				id: 'daily_poster',
				name: 'Daily Contributor',
				type: 'daily',
				defaults: {
					requiredAction: 'post_created',
					requiredCount: 3,
					xpReward: 50,
					dgtReward: 10
				}
			},
			{
				id: 'quality_contributor',
				name: 'Quality Contributor',
				type: 'daily',
				defaults: {
					requiredAction: 'post_word_count',
					requiredCount: 500,
					xpReward: 100,
					conditions: { minWordCount: 100 }
				}
			},
			{
				id: 'engagement_master',
				name: 'Engagement Master',
				type: 'weekly',
				defaults: {
					requiredAction: 'reaction_received',
					requiredCount: 50,
					xpReward: 300,
					badgeReward: 'engagement_badge'
				}
			},
			{
				id: 'night_owl',
				name: 'Night Owl',
				type: 'daily',
				defaults: {
					requiredAction: 'post_created',
					requiredCount: 2,
					xpReward: 75,
					conditions: { timeWindow: { start: 22, end: 4 } }
				}
			},
			{
				id: 'generous_tipper',
				name: 'Generous Tipper',
				type: 'weekly',
				defaults: {
					requiredAction: 'tip_amount',
					requiredCount: 100, // 100 DGT total
					xpReward: 200,
					dgtReward: 25
				}
			},
			{
				id: 'thread_starter',
				name: 'Conversation Starter',
				type: 'weekly',
				defaults: {
					requiredAction: 'thread_created',
					requiredCount: 5,
					xpReward: 250,
					dgtReward: 50
				}
			}
		];
	}

	// Batch create missions from templates
	async createMissionsFromTemplates(templateIds: string[]) {
		const templates = MissionService.getMissionTemplates();
		const results = [];

		for (const templateId of templateIds) {
			const template = templates.find(t => t.id === templateId);
			if (!template) continue;

			const [mission] = await db.insert(missions).values({
				title: template.name,
				description: `Complete the ${template.name} mission`,
				type: template.type,
				...template.defaults,
				isDaily: template.type === 'daily',
				isWeekly: template.type === 'weekly',
				isActive: true,
				// conditions: template.defaults.conditions ? JSON.stringify(template.defaults.conditions) : null // TODO: Add column
			}).returning();

			results.push(mission);
		}

		return results;
	}

	// Handle stacking missions
	async checkStackingMissionProgress(userId: UserId, missionId: string) {
		const [mission] = await db
			.select()
			.from(missions)
			.where(eq(missions.id, missionId))
			.limit(1);

		if (!mission || mission.type !== 'stacking' || !mission.stages) {
			return null;
		}

		const progress = await this.getUserMissionProgress(userId, missionId);
		if (!progress) return null;

		const stages = JSON.parse(mission.stages as string) as Array<{
			count: number;
			reward: { xp?: number; dgt?: number; badge?: string };
		}>;

		// Find current stage
		let currentStage = null;
		let stageIndex = -1;

		for (let i = 0; i < stages.length; i++) {
			if (progress.currentCount >= stages[i].count) {
				currentStage = stages[i];
				stageIndex = i;
			}
		}

		const metadata = progress.metadata || {};
		const claimedStages = metadata.claimedStages || [];

		return {
			currentCount: progress.currentCount,
			currentStage: stageIndex + 1,
			totalStages: stages.length,
			nextStageAt: stages[stageIndex + 1]?.count || null,
			canClaimStage: currentStage && !claimedStages.includes(stageIndex),
			claimedStages
		};
	}

	// Claim stacking mission stage reward
	async claimStackingReward(userId: UserId, missionId: string, stageIndex: number) {
		const [mission] = await db
			.select()
			.from(missions)
			.where(eq(missions.id, missionId))
			.limit(1);

		if (!mission || mission.type !== 'stacking' || !mission.stages) {
			throw new Error('Not a stacking mission');
		}

		const stages = JSON.parse(mission.stages as string);
		const stage = stages[stageIndex];

		if (!stage) {
			throw new Error('Invalid stage');
		}

		const progress = await this.getUserMissionProgress(userId, missionId);
		if (!progress || progress.currentCount < stage.count) {
			throw new Error('Stage not reached');
		}

		return db.transaction(async (tx) => {
			// Get current metadata
			const currentMetadata = progress.metadata || {};
			const claimedStages = currentMetadata.claimedStages || [];
			
			if (claimedStages.includes(stageIndex)) {
				throw new Error('Stage already claimed');
			}

			// Award stage rewards
			if (stage.reward.xp) {
				await xpService.awardXp(userId, stage.reward.xp, 'MISSION_STAGE_COMPLETE', {
					missionId,
					missionTitle: mission.title,
					stage: stageIndex + 1,
					totalStages: stages.length
				});
			}

			if (stage.reward.dgt) {
				await dgtService.processReward(userId, stage.reward.dgt, 'mission_stage_complete', {
					missionId,
					missionTitle: mission.title,
					stage: stageIndex + 1
				});
			}

			if (stage.reward.badge) {
				await achievementService.checkAndAwardAchievements(userId, 'mission_stage_complete', {
					missionId,
					stage: stageIndex + 1,
					badgeId: stage.reward.badge
				});
			}

			// Update metadata with claimed stage
			const updatedMetadata = {
				...currentMetadata,
				claimedStages: [...claimedStages, stageIndex],
				lastClaimedAt: new Date().toISOString()
			};

			// Mark stage as claimed in metadata
			await tx
				.update(userMissionProgress)
				.set({
					metadata: updatedMetadata,
					updatedAt: new Date()
				})
				.where(
					and(
						eq(userMissionProgress.userId, userId),
						eq(userMissionProgress.missionId, missionId as any)
					)
				);

			// Log event
			await eventLogService.logEvent({
				userId,
				eventType: 'mission_stage_claimed',
				eventData: {
					missionId,
					stage: stageIndex + 1,
					rewards: stage.reward
				}
			});

			logger.info({ userId, missionId, stage: stageIndex + 1 }, 'Mission stage claimed');
			return { success: true, stage: stageIndex + 1 };
		});
	}

	// Get mission pool for daily/weekly selection
	async getMissionPool(type: 'daily' | 'weekly') {
		return db
			.select()
			.from(missions)
			.where(
				and(
					eq(missions.type, type),
					eq(missions.isActive, true)
				)
			)
			.orderBy(missions.sortOrder);
	}

	// Assign random missions from pool
	async assignDailyMissions(userId: UserId, count: number = 3) {
		const pool = await this.getMissionPool('daily');
		if (pool.length === 0) return [];

		// Shuffle and pick random missions
		const shuffled = pool.sort(() => Math.random() - 0.5);
		const selected = shuffled.slice(0, Math.min(count, pool.length));

		// Create progress entries for selected missions
		const assigned = [];
		for (const mission of selected) {
			const existing = await this.getUserMissionProgress(userId, mission.id);
			if (!existing) {
				await db.insert(userMissionProgress).values({
					userId,
					missionId: mission.id as any,
					currentCount: 0,
					isCompleted: false,
					isRewardClaimed: false,
					metadata: {}
				});
				assigned.push(mission);
			}
		}

		return assigned;
	}

	// Check and assign daily missions on demand (lazy assignment)
	async ensureDailyMissions(userId: UserId): Promise<void> {
		// Check if user has any daily missions assigned today
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		const dailyMissions = await this.getDailyMissions(userId);
		
		// If no daily missions or all are from previous days, assign new ones
		const hasCurrentMissions = dailyMissions.some(m => {
			const progress = m.progress;
			if (!progress || !progress.updatedAt) return false;
			const updateDate = new Date(progress.updatedAt);
			return updateDate >= today;
		});

		if (!hasCurrentMissions) {
			logger.info({ userId }, 'No daily missions found, assigning new ones');
			await this.assignDailyMissions(userId, missionConfig.daily.poolSize);
		}
	}

	// Get user's active missions summary
	async getUserMissionSummary(userId: UserId) {
		// Ensure daily missions are assigned
		await this.ensureDailyMissions(userId);

		const [dailyMissions, weeklyMissions, milestoneMissions] = await Promise.all([
			this.getDailyMissions(userId),
			this.getWeeklyMissions(userId),
			db.select()
				.from(missions)
				.where(
					and(
						eq(missions.type, 'milestone'),
						eq(missions.isActive, true)
					)
				)
				.then(ms => this.enrichMissionsWithProgress(userId, ms))
		]);

		return {
			daily: {
				active: dailyMissions.filter(m => !m.progress?.isCompleted),
				completed: dailyMissions.filter(m => m.progress?.isCompleted),
				total: dailyMissions.length
			},
			weekly: {
				active: weeklyMissions.filter(m => !m.progress?.isCompleted),
				completed: weeklyMissions.filter(m => m.progress?.isCompleted),
				total: weeklyMissions.length
			},
			milestone: {
				active: milestoneMissions.filter(m => !m.progress?.isCompleted),
				completed: milestoneMissions.filter(m => m.progress?.isCompleted),
				total: milestoneMissions.length
			}
		};
	}
}

export const missionService = new MissionService();