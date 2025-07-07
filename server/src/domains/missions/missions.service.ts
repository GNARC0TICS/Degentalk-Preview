import { db } from '@db';
import type { UserId, MissionId } from '@shared/types';
import { eq, and, gte, lte, SQL, isNull, inArray } from 'drizzle-orm';
import {
	missions,
	userMissionProgress,
	// MissionType, // Assuming MissionType is defined locally or this import is not strictly needed from schema
	type Mission,
	type UserMissionProgress,
	type InsertMission
} from '@schema';
import { logger } from '../../core/logger';
import { addDays, startOfDay, endOfDay, isBefore, format, parse, addWeeks } from 'date-fns';
import { MissionId } from "@shared/types";

interface MissionProgressUpdate {
	userId: UserId;
	actionType: MissionType;
	metadata?: Record<string, any>;
}

/**
 * Service for managing daily/weekly missions and user progress
 */
export class MissionsService {
	/**
	 * Get all missions (for admin)
	 */
	async getAllMissions(): Promise<Mission[]> {
		try {
			return await db.select().from(missions).orderBy(missions.sortOrder);
		} catch (error: any) {
			logger.error(
				'Error getting all missions:',
				error instanceof Error ? error.message : String(error)
			);
			throw error;
		}
	}

	/**
	 * Get active missions
	 */
	async getActiveMissions(userLevel?: number): Promise<Mission[]> {
		try {
			let query = db
				.select()
				.from(missions)
				.where(
					and(
						eq(missions.isActive, true),
						isNull(missions.expiresAt).or(gte(missions.expiresAt, new Date()))
					)
				)
				.orderBy(missions.sortOrder);

			// If userLevel is provided, filter by level requirement
			if (userLevel !== undefined) {
				query = query.where(lte(missions.minLevel, userLevel));
			}

			return await query;
		} catch (error: any) {
			logger.error(
				'Error getting active missions:',
				error instanceof Error ? error.message : String(error)
			);
			throw error;
		}
	}

	/**
	 * Get a mission by ID
	 */
	async getMission(id: MissionId): Promise<Mission | null> {
		try {
			const result = await db.select().from(missions).where(eq(missions.id, id)).limit(1);

			return result.length > 0 ? result[0] : null;
		} catch (error: any) {
			logger.error(
				'Error getting mission:',
				error instanceof Error ? error.message : String(error)
			);
			throw error;
		}
	}

	/**
	 * Create a new mission
	 */
	async createMission(data: InsertMission): Promise<Mission> {
		try {
			// Set expiration for daily/weekly missions
			let expiresAt = data.expiresAt;

			if (!expiresAt) {
				if (data.isDaily) {
					expiresAt = endOfDay(addDays(new Date(), 1));
				} else if (data.isWeekly) {
					expiresAt = endOfDay(addWeeks(new Date(), 1));
				}
			}

			const result = await db
				.insert(missions)
				.values({
					...data,
					expiresAt
				})
				.returning();

			return result[0];
		} catch (error: any) {
			logger.error(
				'Error creating mission:',
				error instanceof Error ? error.message : String(error)
			);
			throw error;
		}
	}

	/**
	 * Update a mission
	 */
	async updateMission(id: MissionId, data: Partial<Mission>): Promise<Mission | null> {
		try {
			const result = await db.update(missions).set(data).where(eq(missions.id, id)).returning();

			return result.length > 0 ? result[0] : null;
		} catch (error: any) {
			logger.error(
				'Error updating mission:',
				error instanceof Error ? error.message : String(error)
			);
			throw error;
		}
	}

	/**
	 * Get user's mission progress
	 */
	async getUserMissionProgress(
		userId: UserId
	): Promise<(UserMissionProgress & { mission: Mission })[]> {
		try {
			// Get all active missions
			const activeMissions = await this.getActiveMissions();

			// Get user's progress for active missions
			const progress = await db
				.select({
					progress: userMissionProgress,
					mission: missions
				})
				.from(userMissionProgress)
				.innerJoin(missions, eq(userMissionProgress.missionId, missions.id))
				.where(and(eq(userMissionProgress.userId, userId), eq(missions.isActive, true)));

			// If user doesn't have progress entries for some active missions, initialize them
			const existingMissionIds = progress.map((p) => p.mission.id);
			const missingMissions = activeMissions.filter((m) => !existingMissionIds.includes(m.id));

			if (missingMissions.length > 0) {
				// Initialize progress for missing missions
				await this.initializeMissionsForUser(userId, missingMissions);

				// Fetch the updated progress
				return this.getUserMissionProgress(userId);
			}

			// Map the result to the expected format
			return progress.map((p: any) => ({
				...p.progress,
				mission: p.mission
			}));
		} catch (error: any) {
			logger.error(
				'Error getting user mission progress:',
				error instanceof Error ? error.message : String(error)
			);
			throw error;
		}
	}

	/**
	 * Initialize mission progress records for a user
	 * Called when a user accesses missions for the first time or when new missions are added
	 */
	private async initializeMissionsForUser(
		userId: UserId,
		missionsToInit: Mission[]
	): Promise<void> {
		try {
			if (missionsToInit.length === 0) return;

			const values = missionsToInit.map((mission) => ({
				userId,
				missionId: mission.id,
				currentCount: 0,
				isCompleted: false,
				isRewardClaimed: false
			}));

			await db.insert(userMissionProgress).values(values);
		} catch (error: any) {
			logger.error(
				'Error initializing missions for user:',
				error instanceof Error ? error.message : String(error)
			);
			throw error;
		}
	}

	/**
	 * Reset expired daily missions
	 * This should be called by a cron job daily
	 */
	async resetDailyMissions(): Promise<void> {
		try {
			// Get expired daily missions
			const expiredMissions = await db
				.select()
				.from(missions)
				.where(
					and(
						eq(missions.isDaily, true),
						eq(missions.isActive, true),
						lte(missions.expiresAt as SQL, new Date())
					)
				);

			if (expiredMissions.length === 0) return;

			const today = new Date();
			const tomorrow = endOfDay(addDays(today, 1));

			// Update expired missions with new expiration date
			await db.update(missions).set({ expiresAt: tomorrow }).where(eq(missions.isDaily, true));

			// Reset user progress for these missions
			await db
				.update(userMissionProgress)
				.set({
					currentCount: 0,
					isCompleted: false,
					isRewardClaimed: false,
					updatedAt: new Date(),
					completedAt: null,
					claimedAt: null
				})
				.where(
					inArray(
						missions.id,
						expiredMissions.map((m: Mission) => m.id)
					)
				);
		} catch (error: any) {
			logger.error(
				'Error resetting daily missions:',
				error instanceof Error ? error.message : String(error)
			);
			throw error;
		}
	}

	/**
	 * Reset expired weekly missions
	 * This should be called by a cron job weekly
	 */
	async resetWeeklyMissions(): Promise<void> {
		try {
			// Get expired weekly missions
			const expiredMissions = await db
				.select()
				.from(missions)
				.where(
					and(
						eq(missions.isWeekly, true),
						eq(missions.isActive, true),
						lte(missions.expiresAt as SQL, new Date())
					)
				);

			if (expiredMissions.length === 0) return;

			const today = new Date();
			const nextWeek = endOfDay(addWeeks(today, 1));

			// Update expired missions with new expiration date
			const updateWeeklyMissionsQuery = db
				.update(missions)
				.set({ expiresAt: nextWeek })
				.where(eq(missions.isWeekly, true));
			logger.info(
				'MISSION_RESET',
				`Update Weekly Missions Query: ${updateWeeklyMissionsQuery.getQuery()}`
			);
			await updateWeeklyMissionsQuery;

			// Reset user progress for these missions
			await db
				.update(userMissionProgress)
				.set({
					currentCount: 0,
					isCompleted: false,
					isRewardClaimed: false,
					updatedAt: new Date(),
					completedAt: null,
					claimedAt: null
				})
				.where(
					inArray(
						missions.id,
						expiredMissions.map((m: Mission) => m.id)
					)
				);
		} catch (error: any) {
			logger.error(
				'Error resetting weekly missions:',
				error instanceof Error ? error.message : String(error)
			);
			throw error;
		}
	}

	/**
	 * Update mission progress based on user actions
	 * This is called whenever a user performs an action that might progress a mission
	 */
	async updateMissionProgress({
		userId,
		actionType,
		metadata = {}
	}: MissionProgressUpdate): Promise<UserMissionProgress[]> {
		try {
			// Find active missions matching this action type
			const activeMissions = await db
				.select()
				.from(missions)
				.where(
					and(
						eq(missions.isActive, true),
						eq(missions.type, actionType),
						isNull(missions.expiresAt).or(gte(missions.expiresAt, new Date()))
					)
				);

			if (activeMissions.length === 0) return [];

			// Get current progress for these missions
			const userProgress = await db
				.select()
				.from(userMissionProgress)
				.where(
					and(
						eq(userMissionProgress.userId, userId),
						userMissionProgress.missionId.in(activeMissions.map((m) => m.id))
					)
				);

			// Initialize progress if it doesn't exist
			if (userProgress.length < activeMissions.length) {
				const existingMissionIds = userProgress.map((p) => p.missionId);
				const missingMissions = activeMissions.filter((m) => !existingMissionIds.includes(m.id));
				await this.initializeMissionsForUser(userId, missingMissions);
			}

			// Update progress for each matching mission
			const updatedProgress: UserMissionProgress[] = [];

			for (const mission of activeMissions) {
				// Skip if mission is already completed
				let progress = userProgress.find((p) => p.missionId === mission.id);

				if (progress?.isCompleted) continue;

				// Progress not found means it was just initialized
				if (!progress) {
					const freshProgress = await db
						.select()
						.from(userMissionProgress)
						.where(
							and(
								eq(userMissionProgress.userId, userId),
								eq(userMissionProgress.missionId, mission.id)
							)
						)
						.limit(1);

					if (freshProgress.length === 0) continue; // Should never happen
					progress = freshProgress[0];
				}

				// Update progress count
				const newCount = progress.currentCount + 1;
				const isCompleted = newCount >= mission.requiredCount;

				const updated = await db
					.update(userMissionProgress)
					.set({
						currentCount: newCount,
						isCompleted,
						updatedAt: new Date(),
						completedAt: isCompleted ? new Date() : null
					})
					.where(
						and(eq(userMissionProgress.id, progress.id), eq(userMissionProgress.isCompleted, false))
					)
					.returning();

				if (updated.length > 0) {
					updatedProgress.push(updated[0]);
				}
			}

			return updatedProgress;
		} catch (error) {
			logger.error('Error updating mission progress:', error);
			throw error;
		}
	}

	/**
	 * Claim rewards for a completed mission
	 */
	async claimMissionReward(
		userId: UserId,
		missionId: MissionId
	): Promise<{
		success: boolean;
		rewards?: {
			xp?: number;
			dgt?: number;
			badge?: string;
		};
		message?: string;
	}> {
		try {
			// Get mission and progress
			const missionResult = await db
				.select({
					mission: missions,
					progress: userMissionProgress
				})
				.from(missions)
				.innerJoin(
					userMissionProgress,
					and(
						eq(userMissionProgress.missionId, missions.id),
						eq(userMissionProgress.userId, userId)
					)
				)
				.where(eq(missions.id, missionId))
				.limit(1);

			if (missionResult.length === 0) {
				return { success: false, message: 'Mission not found' };
			}

			const { mission, progress } = missionResult[0];

			// Check if mission is completed and not already claimed
			if (!progress.isCompleted) {
				return { success: false, message: 'Mission not completed' };
			}

			if (progress.isRewardClaimed) {
				return { success: false, message: 'Reward already claimed' };
			}

			// Update mission progress to claimed
			await db
				.update(userMissionProgress)
				.set({
					isRewardClaimed: true,
					claimedAt: new Date()
				})
				.where(eq(userMissionProgress.id, progress.id));

			// Collect rewards to return
			const rewards: { xp?: number; dgt?: number; badge?: string } = {};

			// Process XP reward
			if (mission.xpReward > 0) {
				rewards.xp = mission.xpReward;
				// XP reward needs to be handled by the XP service
				// which should be injected or called from the controller
			}

			// Process DGT reward
			if (mission.dgtReward && mission.dgtReward > 0) {
				rewards.dgt = mission.dgtReward;
				// DGT reward needs to be handled by the Wallet service
				// which should be injected or called from the controller
			}

			// Process badge reward
			if (mission.badgeReward) {
				rewards.badge = mission.badgeReward;
				// Badge reward needs to be handled by the Badge service
				// which should be injected or called from the controller
			}

			return {
				success: true,
				rewards
			};
		} catch (error) {
			logger.error('Error claiming mission reward:', error);
			throw error;
		}
	}

	/**
	 * Create default missions (for initial setup)
	 */
	async createDefaultMissions(): Promise<void> {
		const defaultMissions: InsertMission[] = [
			{
				title: 'Daily Login',
				description: 'Log in to the forum today',
				type: 'LOGIN',
				requiredAction: 'login',
				requiredCount: 1,
				xpReward: 10,
				isDaily: true,
				isActive: true,
				icon: 'log-in'
			},
			{
				title: 'Create a Post',
				description: 'Create a new post today',
				type: 'POST_CREATE',
				requiredAction: 'create_post',
				requiredCount: 1,
				xpReward: 15,
				isDaily: true,
				isActive: true,
				icon: 'message-square-plus'
			},
			{
				title: 'Serial Liker',
				description: 'Like 5 posts today',
				type: 'POST_LIKE',
				requiredAction: 'like_post',
				requiredCount: 5,
				xpReward: 20,
				isDaily: true,
				isActive: true,
				icon: 'thumbs-up'
			},
			{
				title: 'Start a Conversation',
				description: 'Reply to 10 threads this week',
				type: 'THREAD_CREATE',
				requiredAction: 'create_thread',
				requiredCount: 1,
				xpReward: 30,
				dgtReward: 5,
				isWeekly: true,
				isDaily: false,
				isActive: true,
				icon: 'plus-circle'
			},
			{
				title: 'Active Commenter',
				description: 'Reply to 10 threads this week',
				type: 'THREAD_REPLY',
				requiredAction: 'reply_thread',
				requiredCount: 10,
				xpReward: 50,
				dgtReward: 10,
				isWeekly: true,
				isDaily: false,
				isActive: true,
				icon: 'reply'
			},
			{
				title: 'Support the Community',
				description: 'Tip 3 posts with DGT this week',
				type: 'DGT_TIP',
				requiredAction: 'tip_post',
				requiredCount: 3,
				xpReward: 100,
				badgeReward: 'Generous Tipper',
				isWeekly: true,
				isDaily: false,
				isActive: true,
				minLevel: 5,
				icon: 'gift'
			},
			{
				title: 'Support the Community',
				description: 'Tip 3 posts with DGT this week',
				type: 'DGT_TIP',
				requiredAction: 'tip_post',
				requiredCount: 3,
				xpReward: 100,
				badgeReward: 'Generous Tipper',
				isWeekly: true,
				isDaily: false,
				isActive: true,
				minLevel: 5,
				icon: 'gift'
			}
		];

		// Set expiration dates
		const today = new Date();
		const tomorrow = endOfDay(addDays(today, 1));
		const nextWeek = endOfDay(addWeeks(today, 1));

		// Insert missions
		for (const missionData of defaultMissions) {
			// Skip if a similar mission already exists
			const existing = await db
				.select()
				.from(missions)
				.where(and(eq(missions.title, missionData.title), eq(missions.type, missionData.type)))
				.limit(1);

			if (existing.length > 0) continue;

			// Set expiration
			if (missionData.isDaily) {
				missionData.expiresAt = tomorrow;
			} else if (missionData.isWeekly) {
				missionData.expiresAt = nextWeek;
			}

			await db.insert(missions).values(missionData);
		}
	}
}

// Export a singleton instance
export const missionsService = new MissionsService();
