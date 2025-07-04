/**
 * Achievement Controller
 *
 * HTTP endpoints for achievement management, admin operations,
 * and user achievement tracking.
 */

import type { Request, Response } from 'express';
import type { AchievementId } from '@shared/types';
import { AchievementProcessorService } from './achievement-processor.service';
import { AchievementAdminService } from './achievement-admin.service';
import { AchievementEventEmitter } from '../../../core/events/achievement-events.service';
import {
	getAllAchievementTemplates,
	getTemplateById,
	getTemplatesByTags,
	getTemplatesByCategory
} from './templates/achievement-templates';
import { logger } from '../../../core/logger';
import { db } from '@db';
import { eq, and, desc, count } from 'drizzle-orm';
import { achievements, userAchievements } from '@schema';
import type { AchievementEventType } from '@schema';

export class AchievementController {
	private processorService = new AchievementProcessorService();
	private adminService = new AchievementAdminService();

	/**
	 * Get user's achievements with progress
	 * GET /api/achievements/user/:userId
	 */
	async getUserAchievements(req: Request, res: Response): Promise<void> {
		try {
			const { userId } = req.params;
			const { completed, category, tier } = req.query;

			let whereConditions: any[] = [eq(userAchievements.userId, userId)];

			if (completed === 'true') {
				whereConditions.push(eq(userAchievements.isCompleted, true));
			} else if (completed === 'false') {
				whereConditions.push(eq(userAchievements.isCompleted, false));
			}

			const userAchievementsData = await db
				.select({
					id: userAchievements.id,
					achievementId: userAchievements.achievementId,
					currentProgress: userAchievements.currentProgress,
					progressPercentage: userAchievements.progressPercentage,
					isCompleted: userAchievements.isCompleted,
					completedAt: userAchievements.completedAt,
					achievement: {
						id: achievements.id,
						key: achievements.key,
						name: achievements.name,
						description: achievements.description,
						category: achievements.category,
						tier: achievements.tier,
						iconUrl: achievements.iconUrl,
						iconEmoji: achievements.iconEmoji,
						rewardXp: achievements.rewardXp,
						rewardDgt: achievements.rewardDgt,
						rewardClout: achievements.rewardClout,
						isSecret: achievements.isSecret,
						unlockMessage: achievements.unlockMessage
					}
				})
				.from(userAchievements)
				.innerJoin(achievements, eq(userAchievements.achievementId, achievements.id))
				.where(and(...whereConditions))
				.orderBy(desc(userAchievements.completedAt));

			res.json({
				success: true,
				data: userAchievementsData
			});
		} catch (error) {
			logger.error('ACHIEVEMENT_CONTROLLER', 'Failed to get user achievements', {
				userId: req.params.userId,
				error: error instanceof Error ? error.message : String(error)
			});
			res.status(500).json({
				success: false,
				error: 'Failed to get user achievements'
			});
		}
	}

	/**
	 * Get all available achievements
	 * GET /api/achievements
	 */
	async getAchievements(req: Request, res: Response): Promise<void> {
		try {
			const {
				category,
				tier,
				triggerType,
				isActive = 'true',
				isSecret,
				search,
				page = '1',
				limit = '50'
			} = req.query;

			const filters = {
				category: category as any,
				tier: tier as any,
				triggerType: triggerType as any,
				isActive: isActive === 'true',
				isSecret: isSecret === 'true' ? true : isSecret === 'false' ? false : undefined,
				search: search as string
			};

			const result = await this.adminService.getAchievements(
				filters,
				parseInt(page as string),
				parseInt(limit as string)
			);

			res.json({
				success: true,
				data: result.achievements,
				pagination: {
					page: parseInt(page as string),
					limit: parseInt(limit as string),
					total: result.total,
					pages: Math.ceil(result.total / parseInt(limit as string))
				}
			});
		} catch (error) {
			logger.error('ACHIEVEMENT_CONTROLLER', 'Failed to get achievements', {
				error: error instanceof Error ? error.message : String(error)
			});
			res.status(500).json({
				success: false,
				error: 'Failed to get achievements'
			});
		}
	}

	/**
	 * Get achievement statistics
	 * GET /api/achievements/stats
	 */
	async getAchievementStats(req: Request, res: Response): Promise<void> {
		try {
			const stats = await this.adminService.getAchievementStats();

			res.json({
				success: true,
				data: stats
			});
		} catch (error) {
			logger.error('ACHIEVEMENT_CONTROLLER', 'Failed to get achievement stats', {
				error: error instanceof Error ? error.message : String(error)
			});
			res.status(500).json({
				success: false,
				error: 'Failed to get achievement stats'
			});
		}
	}

	/**
	 * Get specific achievement details
	 * GET /api/achievements/:id
	 */
	async getAchievementById(req: Request, res: Response): Promise<void> {
		try {
			const { id } = req.params;
			const achievement = await this.adminService.getAchievementById(id as AchievementId);

			if (!achievement) {
				res.status(404).json({
					success: false,
					error: 'Achievement not found'
				});
				return;
			}

			res.json({
				success: true,
				data: achievement
			});
		} catch (error) {
			logger.error('ACHIEVEMENT_CONTROLLER', 'Failed to get achievement', {
				id: req.params.id,
				error: error instanceof Error ? error.message : String(error)
			});
			res.status(500).json({
				success: false,
				error: 'Failed to get achievement'
			});
		}
	}

	/**
	 * Create new achievement
	 * POST /api/achievements
	 */
	async createAchievement(req: Request, res: Response): Promise<void> {
		try {
			const achievement = await this.adminService.createAchievement(req.body);

			res.status(201).json({
				success: true,
				data: achievement
			});
		} catch (error) {
			logger.error('ACHIEVEMENT_CONTROLLER', 'Failed to create achievement', {
				body: req.body,
				error: error instanceof Error ? error.message : String(error)
			});
			res.status(400).json({
				success: false,
				error: error instanceof Error ? error.message : 'Failed to create achievement'
			});
		}
	}

	/**
	 * Update achievement
	 * PUT /api/achievements/:id
	 */
	async updateAchievement(req: Request, res: Response): Promise<void> {
		try {
			const { id } = req.params;
			const achievement = await this.adminService.updateAchievement(id as AchievementId, req.body);

			res.json({
				success: true,
				data: achievement
			});
		} catch (error) {
			logger.error('ACHIEVEMENT_CONTROLLER', 'Failed to update achievement', {
				id: req.params.id,
				body: req.body,
				error: error instanceof Error ? error.message : String(error)
			});
			res.status(400).json({
				success: false,
				error: error instanceof Error ? error.message : 'Failed to update achievement'
			});
		}
	}

	/**
	 * Delete achievement
	 * DELETE /api/achievements/:id
	 */
	async deleteAchievement(req: Request, res: Response): Promise<void> {
		try {
			const { id } = req.params;
			await this.adminService.deleteAchievement(id as AchievementId);

			res.json({
				success: true,
				message: 'Achievement deleted successfully'
			});
		} catch (error) {
			logger.error('ACHIEVEMENT_CONTROLLER', 'Failed to delete achievement', {
				id: req.params.id,
				error: error instanceof Error ? error.message : String(error)
			});
			res.status(400).json({
				success: false,
				error: error instanceof Error ? error.message : 'Failed to delete achievement'
			});
		}
	}

	/**
	 * Bulk update achievements
	 * PUT /api/achievements/bulk
	 */
	async bulkUpdateAchievements(req: Request, res: Response): Promise<void> {
		try {
			const { ids, updates } = req.body;
			const achievements = await this.adminService.bulkUpdateAchievements(ids, updates);

			res.json({
				success: true,
				data: achievements,
				message: `Updated ${achievements.length} achievements`
			});
		} catch (error) {
			logger.error('ACHIEVEMENT_CONTROLLER', 'Failed to bulk update achievements', {
				body: req.body,
				error: error instanceof Error ? error.message : String(error)
			});
			res.status(400).json({
				success: false,
				error: error instanceof Error ? error.message : 'Failed to bulk update achievements'
			});
		}
	}

	/**
	 * Get achievement completions
	 * GET /api/achievements/:id/completions
	 */
	async getAchievementCompletions(req: Request, res: Response): Promise<void> {
		try {
			const { id } = req.params;
			const { page = '1', limit = '50' } = req.query;

			const result = await this.adminService.getAchievementCompletions(
				id as AchievementId,
				parseInt(page as string),
				parseInt(limit as string)
			);

			res.json({
				success: true,
				data: result.completions,
				pagination: {
					page: parseInt(page as string),
					limit: parseInt(limit as string),
					total: result.total,
					pages: Math.ceil(result.total / parseInt(limit as string))
				}
			});
		} catch (error) {
			logger.error('ACHIEVEMENT_CONTROLLER', 'Failed to get achievement completions', {
				id: req.params.id,
				error: error instanceof Error ? error.message : String(error)
			});
			res.status(500).json({
				success: false,
				error: 'Failed to get achievement completions'
			});
		}
	}

	/**
	 * Manually award achievement
	 * POST /api/achievements/:id/award
	 */
	async manuallyAwardAchievement(req: Request, res: Response): Promise<void> {
		try {
			const { id } = req.params;
			const { userIds, reason } = req.body;

			await this.adminService.manuallyAwardAchievement(id as AchievementId, userIds, reason);

			res.json({
				success: true,
				message: `Achievement awarded to ${userIds.length} users`
			});
		} catch (error) {
			logger.error('ACHIEVEMENT_CONTROLLER', 'Failed to manually award achievement', {
				id: req.params.id,
				body: req.body,
				error: error instanceof Error ? error.message : String(error)
			});
			res.status(400).json({
				success: false,
				error: error instanceof Error ? error.message : 'Failed to award achievement'
			});
		}
	}

	/**
	 * Emit achievement event (for testing/debugging)
	 * POST /api/achievements/events/emit
	 */
	async emitAchievementEvent(req: Request, res: Response): Promise<void> {
		try {
			const { eventType, userId, eventData } = req.body;

			// Validate event type
			const validEventTypes: AchievementEventType[] = [
				'post_created',
				'thread_created',
				'user_login',
				'tip_sent',
				'tip_received',
				'shoutbox_message',
				'wallet_loss',
				'thread_necromancy',
				'like_given',
				'like_received',
				'thread_locked',
				'user_mentioned',
				'daily_streak',
				'crash_sentiment',
				'diamond_hands',
				'paper_hands',
				'market_prediction',
				'custom_event'
			];

			if (!validEventTypes.includes(eventType)) {
				res.status(400).json({
					success: false,
					error: 'Invalid event type'
				});
				return;
			}

			// Emit the event
			await AchievementEventEmitter.emitCustomEvent(eventType, userId, eventData);

			// Process the event
			await this.processorService.processEvent(eventType, userId, eventData);

			res.json({
				success: true,
				message: 'Event emitted and processed successfully'
			});
		} catch (error) {
			logger.error('ACHIEVEMENT_CONTROLLER', 'Failed to emit achievement event', {
				body: req.body,
				error: error instanceof Error ? error.message : String(error)
			});
			res.status(400).json({
				success: false,
				error: error instanceof Error ? error.message : 'Failed to emit event'
			});
		}
	}

	/**
	 * Get achievement templates
	 * GET /api/achievements/templates
	 */
	async getAchievementTemplates(req: Request, res: Response): Promise<void> {
		try {
			const { category, tags } = req.query;

			let templates;

			if (category) {
				templates = getTemplatesByCategory(category as string);
			} else if (tags) {
				const tagArray = (tags as string).split(',').map((tag) => tag.trim());
				templates = getTemplatesByTags(tagArray);
			} else {
				templates = getAllAchievementTemplates();
			}

			res.json({
				success: true,
				data: templates
			});
		} catch (error) {
			logger.error('ACHIEVEMENT_CONTROLLER', 'Failed to get achievement templates', {
				query: req.query,
				error: error instanceof Error ? error.message : String(error)
			});
			res.status(500).json({
				success: false,
				error: 'Failed to get achievement templates'
			});
		}
	}

	/**
	 * Create achievement from template
	 * POST /api/achievements/templates/:templateId/create
	 */
	async createFromTemplate(req: Request, res: Response): Promise<void> {
		try {
			const { templateId } = req.params;
			const template = getTemplateById(templateId);

			if (!template) {
				res.status(404).json({
					success: false,
					error: 'Template not found'
				});
				return;
			}

			// Extract achievement data from template (remove template-specific fields)
			const {
				templateId: _,
				templateName: __,
				templateDescription: ___,
				tags: ____,
				...achievementData
			} = template;

			// Create achievement with optional overrides from request body
			const finalData = {
				...achievementData,
				...req.body
			};

			const achievement = await this.adminService.createAchievement(finalData);

			res.status(201).json({
				success: true,
				data: achievement,
				message: `Achievement created from template: ${template.templateName}`
			});
		} catch (error) {
			logger.error('ACHIEVEMENT_CONTROLLER', 'Failed to create achievement from template', {
				templateId: req.params.templateId,
				body: req.body,
				error: error instanceof Error ? error.message : String(error)
			});
			res.status(400).json({
				success: false,
				error: error instanceof Error ? error.message : 'Failed to create achievement from template'
			});
		}
	}
}
