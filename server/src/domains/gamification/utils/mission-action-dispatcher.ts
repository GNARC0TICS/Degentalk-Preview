/**
 * Mission Action Dispatcher
 * 
 * Centralized utility for logging mission-related actions
 * Routes actions to appropriate mission tracking
 */

import { missionService } from '../services/mission.service';
import { logger } from '@core/logger';
import type { UserId } from '@shared/types/ids';

// Action type definitions with metadata requirements
const ACTION_DEFINITIONS = {
	// Content creation
	create_thread: { aliases: ['thread_created'], requiresMetadata: ['threadId', 'forumId'] },
	create_reply: { aliases: ['post_created'], requiresMetadata: ['postId'] },
	create_post: { aliases: ['post_created'], requiresMetadata: ['postId'] },
	
	// Engagement
	tip_sent: { aliases: ['tip_amount'], requiresMetadata: ['amount', 'recipientId'] },
	reaction_given: { aliases: ['reaction_added'], requiresMetadata: ['postId', 'reactionType'] },
	reaction_received: { aliases: [], requiresMetadata: ['postId', 'fromUserId'] },
	
	// Progression
	level_reached: { aliases: ['level_up'], requiresMetadata: ['level'] },
	daily_login: { aliases: ['login'], requiresMetadata: [] },
	solution_accepted: { aliases: ['solution_marked'], requiresMetadata: ['postId'] },
	
	// Future extensible actions
	read_thread: { aliases: ['thread_viewed'], requiresMetadata: ['threadId', 'duration'] },
	visit_site: { aliases: ['page_view'], requiresMetadata: ['page', 'duration'] },
	profile_updated: { aliases: ['profile_complete'], requiresMetadata: ['fields'] },
	badge_earned: { aliases: ['achievement_unlocked'], requiresMetadata: ['badgeId'] },
	message_sent: { aliases: ['dm_sent'], requiresMetadata: ['recipientId'] },
	shoutbox_activity: { aliases: ['shoutbox_message'], requiresMetadata: ['roomId'] }
};

/**
 * Log a mission action for a user
 * 
 * @param userId - The user performing the action
 * @param action - The action type (e.g., 'create_thread', 'tip_sent')
 * @param metadata - Additional context for the action
 * @returns Promise<void>
 * 
 * @example
 * // From thread creation
 * await logMissionAction(userId, 'create_thread', { 
 *   threadId: thread.id, 
 *   forumId: thread.forumId 
 * });
 * 
 * // From tip service
 * await logMissionAction(senderId, 'tip_sent', { 
 *   amount: 100, 
 *   recipientId, 
 *   postId 
 * });
 */
export async function logMissionAction(
	userId: UserId,
	action: string,
	metadata?: Record<string, any>
): Promise<void> {
	try {
		// Normalize action name
		const normalizedAction = action.toLowerCase().replace(/-/g, '_');
		
		// Find action definition
		const actionDef = ACTION_DEFINITIONS[normalizedAction as keyof typeof ACTION_DEFINITIONS];
		
		if (!actionDef) {
			logger.debug({ action: normalizedAction }, 'Unknown mission action');
			// Still try to track it - missions might use custom actions
			await missionService.trackAction(userId, normalizedAction, metadata);
			return;
		}
		
		// Validate required metadata
		if (actionDef.requiresMetadata.length > 0 && metadata) {
			const missingFields = actionDef.requiresMetadata.filter(field => !metadata[field]);
			if (missingFields.length > 0) {
				logger.warn({ 
					action: normalizedAction, 
					missingFields,
					providedMetadata: Object.keys(metadata || {})
				}, 'Mission action missing required metadata');
			}
		}
		
		// Track the action
		await missionService.trackAction(userId, normalizedAction, metadata);
		
		// Also track any aliases (for backward compatibility)
		for (const alias of actionDef.aliases) {
			await missionService.trackAction(userId, alias, metadata);
		}
		
		logger.debug({ userId, action: normalizedAction }, 'Mission action logged');
	} catch (error) {
		// Don't throw - mission tracking should not break core functionality
		logger.error({ error, userId, action }, 'Failed to log mission action');
	}
}

/**
 * Batch log multiple mission actions
 * 
 * @param actions - Array of actions to log
 * @returns Promise<void>
 */
export async function logMissionActionBatch(
	actions: Array<{
		userId: UserId;
		action: string;
		metadata?: Record<string, any>;
	}>
): Promise<void> {
	const results = await Promise.allSettled(
		actions.map(({ userId, action, metadata }) =>
			logMissionAction(userId, action, metadata)
		)
	);
	
	const failures = results.filter(r => r.status === 'rejected');
	if (failures.length > 0) {
		logger.warn({ 
			failures: failures.length, 
			total: actions.length 
		}, 'Some mission actions failed to log');
	}
}

/**
 * Get action requirements for documentation
 * 
 * @returns Action definitions with metadata requirements
 */
export function getMissionActionDefinitions() {
	return Object.entries(ACTION_DEFINITIONS).map(([action, def]) => ({
		action,
		aliases: def.aliases,
		requiredMetadata: def.requiresMetadata,
		example: generateActionExample(action, def.requiresMetadata)
	}));
}

/**
 * Generate example usage for an action
 */
function generateActionExample(action: string, requiredFields: string[]): string {
	const examples: Record<string, any> = {
		threadId: 'thread_123',
		forumId: 'forum_456',
		postId: 'post_789',
		amount: 100,
		recipientId: 'user_abc',
		reactionType: '🔥',
		level: 10,
		duration: 30,
		page: '/forums',
		fields: ['bio', 'avatar'],
		badgeId: 'first_post',
		roomId: 'general'
	};
	
	const metadata = requiredFields.reduce((acc, field) => {
		acc[field] = examples[field] || `${field}_value`;
		return acc;
	}, {} as Record<string, any>);
	
	return `logMissionAction(userId, '${action}', ${JSON.stringify(metadata, null, 2)})`;
}

// Export for use in other services
export { logMissionAction as trackMissionProgress }; // Alias for backward compatibility