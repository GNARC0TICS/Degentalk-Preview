import { db } from '@degentalk/db';
import { eq, and, desc } from 'drizzle-orm';
import { threads, posts, contentModerationActions } from '@schema';
import { logger } from '@core/logger';
import type { AdminId, ModeratorId, EntityId } from '@shared/types/ids';

export type VisibilityStatus =
	| 'draft'
	| 'published'
	| 'hidden'
	| 'shadowbanned'
	| 'archived'
	| 'deleted';

interface ApplyModerationActionParams {
	moderatorId: ModeratorId;
	targetType: 'thread' | 'post';
	targetId: EntityId;
	newVisibility: VisibilityStatus;
	reason: string;
}

/**
 * Server-side service for moderation actions
 */
export class ModerationActionService {
	/**
	 * Applies a moderation action by updating the visibility of the target content
	 * and logging the action to `admin.content_moderation_actions`.
	 *
	 * This service should be used by all moderation endpoints to ensure
	 * audit trails remain consistent.
	 */
	static async applyModerationAction({
		moderatorId,
		targetType,
		targetId,
		newVisibility,
		reason
	}: ApplyModerationActionParams): Promise<void> {
		try {
			logger.info('MODERATION_ACTION', 'Applying moderation action', {
				moderatorId,
				targetType,
				targetId,
				newVisibility,
				reason
			});

			// 1) Update inline visibility + reason
			if (targetType === 'thread') {
				await db
					.update(threads)
					.set({
						visibilityStatus: newVisibility,
						moderationReason: reason
					})
					.where(eq(threads.id, targetId));
			} else {
				await db
					.update(posts)
					.set({
						visibilityStatus: newVisibility,
						moderationReason: reason
					})
					.where(eq(posts.id, targetId));
			}

			// 2) Insert audit log
			await db.insert(contentModerationActions).values({
				moderatorId,
				contentType: targetType,
				contentId: targetId,
				actionType: 'visibility_change',
				reason,
				additionalData: { newVisibility }
			});

			logger.info('MODERATION_ACTION', 'Successfully applied moderation action', {
				moderatorId,
				targetType,
				targetId,
				newVisibility
			});
		} catch (error) {
			logger.error('MODERATION_ACTION', 'Error applying moderation action', {
				error,
				moderatorId,
				targetType,
				targetId,
				newVisibility,
				reason
			});
			throw error;
		}
	}

	/**
	 * Get moderation history for a piece of content
	 */
	static async getModerationHistory(targetType: 'thread' | 'post', targetId: EntityId) {
		try {
			const history = await db
				.select()
				.from(contentModerationActions)
				.where(
					and(
						eq(contentModerationActions.contentType, targetType),
						eq(contentModerationActions.contentId, targetId)
					)
				)
				.orderBy(desc(contentModerationActions.createdAt));

			return history;
		} catch (error) {
			logger.error('MODERATION_ACTION', 'Error getting moderation history', {
				error,
				targetType,
				targetId
			});
			return [];
		}
	}

	/**
	 * Get recent moderation actions by a specific moderator
	 */
	static async getModeratorActions(moderatorId: ModeratorId, limit = 50) {
		try {
			const actions = await db
				.select()
				.from(contentModerationActions)
				.where(eq(contentModerationActions.moderatorId, moderatorId))
				.orderBy(desc(contentModerationActions.createdAt))
				.limit(limit);

			return actions;
		} catch (error) {
			logger.error('MODERATION_ACTION', 'Error getting moderator actions', {
				error,
				moderatorId
			});
			return [];
		}
	}

	/**
	 * Bulk moderation action for multiple pieces of content
	 */
	static async bulkModerationAction({
		moderatorId,
		targets,
		newVisibility,
		reason
	}: {
		moderatorId: ModeratorId;
		targets: Array<{ type: 'thread' | 'post'; id: EntityId }>;
		newVisibility: VisibilityStatus;
		reason: string;
	}): Promise<{ success: number; failed: number }> {
		let success = 0;
		let failed = 0;

		for (const target of targets) {
			try {
				await this.applyModerationAction({
					moderatorId,
					targetType: target.type,
					targetId: target.id,
					newVisibility,
					reason
				});
				success++;
			} catch (error) {
				logger.error('MODERATION_ACTION', 'Failed bulk moderation action', {
					error,
					target,
					moderatorId
				});
				failed++;
			}
		}

		logger.info('MODERATION_ACTION', 'Bulk moderation action completed', {
			moderatorId,
			success,
			failed,
			total: targets.length
		});

		return { success, failed };
	}
}