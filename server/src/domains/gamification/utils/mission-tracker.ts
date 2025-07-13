/**
 * Mission Progress Tracker
 * 
 * Utility for tracking mission progress from various parts of the application
 * Integrates with event system for automatic mission progress updates
 */

import { missionService } from '../services/mission.service';
import { eventEmitter } from '@core/events';
import { logger } from '@core/logger';
import type { UserId } from '@shared/types/ids';

// Mission action mappings to event types
const eventToActionMap: Record<string, string> = {
	'post_created': 'post_created',
	'thread_created': 'thread_created',
	'reaction_added': 'reaction_given',
	'reaction_received': 'reaction_received',
	'tip_sent': 'tip_amount',
	'solution_marked': 'solution_accepted',
	'level_up': 'level_reached',
	'login': 'daily_login',
	'message_sent': 'message_sent',
	'shoutbox_message': 'shoutbox_activity'
};

// Initialize mission tracking listeners
export function initializeMissionTracking() {
	// Track post creation
	eventEmitter.on('post:created', async (data: { userId: UserId; postId: string; wordCount?: number; forumId?: string }) => {
		try {
			await missionService.trackAction(data.userId, 'post_created', {
				postId: data.postId,
				forumId: data.forumId
			});

			// Track word count missions
			if (data.wordCount) {
				await missionService.trackAction(data.userId, 'post_word_count', {
					wordCount: data.wordCount,
					postId: data.postId
				});
			}
		} catch (error) {
			logger.error({ error, userId: data.userId }, 'Failed to track post mission progress');
		}
	});

	// Track thread creation
	eventEmitter.on('thread:created', async (data: { userId: UserId; threadId: string; forumId: string }) => {
		try {
			await missionService.trackAction(data.userId, 'thread_created', {
				threadId: data.threadId,
				forumId: data.forumId
			});

			// Track unique forum posting
			await missionService.trackAction(data.userId, 'unique_forums_posted', {
				forumId: data.forumId
			});
		} catch (error) {
			logger.error({ error, userId: data.userId }, 'Failed to track thread mission progress');
		}
	});

	// Track reactions
	eventEmitter.on('reaction:added', async (data: { userId: UserId; targetUserId: UserId; postId: string; reactionType: string }) => {
		try {
			// Giver progress
			await missionService.trackAction(data.userId, 'reaction_given', {
				postId: data.postId,
				reactionType: data.reactionType
			});

			// Receiver progress
			await missionService.trackAction(data.targetUserId, 'reaction_received', {
				postId: data.postId,
				reactionType: data.reactionType,
				fromUserId: data.userId
			});
		} catch (error) {
			logger.error({ error }, 'Failed to track reaction mission progress');
		}
	});

	// Track tips
	eventEmitter.on('tip:sent', async (data: { senderId: UserId; recipientId: UserId; amount: number; postId?: string }) => {
		try {
			await missionService.trackAction(data.senderId, 'tip_amount', {
				amount: data.amount,
				recipientId: data.recipientId,
				postId: data.postId
			});
		} catch (error) {
			logger.error({ error }, 'Failed to track tip mission progress');
		}
	});

	// Track solutions
	eventEmitter.on('solution:marked', async (data: { postId: string; authorId: UserId; markedBy: UserId }) => {
		try {
			await missionService.trackAction(data.authorId, 'solution_accepted', {
				postId: data.postId,
				markedBy: data.markedBy
			});
		} catch (error) {
			logger.error({ error }, 'Failed to track solution mission progress');
		}
	});

	// Track level ups
	eventEmitter.on('user:levelup', async (data: { userId: UserId; newLevel: number; oldLevel: number }) => {
		try {
			await missionService.trackAction(data.userId, 'level_reached', {
				level: data.newLevel,
				previousLevel: data.oldLevel
			});
		} catch (error) {
			logger.error({ error }, 'Failed to track level mission progress');
		}
	});

	// Track daily login
	eventEmitter.on('user:login', async (data: { userId: UserId }) => {
		try {
			await missionService.trackAction(data.userId, 'daily_login', {
				timestamp: new Date()
			});
		} catch (error) {
			logger.error({ error }, 'Failed to track login mission progress');
		}
	});

	logger.info('Mission tracking listeners initialized');
}

// Manual mission progress tracking (for custom actions)
export async function trackMissionProgress(
	userId: UserId,
	action: string,
	metadata?: Record<string, any>
): Promise<void> {
	try {
		await missionService.trackAction(userId, action, metadata);
	} catch (error) {
		logger.error({ error, userId, action }, 'Manual mission tracking failed');
		throw error;
	}
}

// Batch mission progress tracking
export async function trackBatchMissionProgress(
	updates: Array<{
		userId: UserId;
		action: string;
		metadata?: Record<string, any>;
	}>
): Promise<void> {
	const results = await Promise.allSettled(
		updates.map(update =>
			missionService.trackAction(update.userId, update.action, update.metadata)
		)
	);

	const failures = results.filter(r => r.status === 'rejected');
	if (failures.length > 0) {
		logger.warn({ failures: failures.length, total: updates.length }, 'Some mission updates failed');
	}
}