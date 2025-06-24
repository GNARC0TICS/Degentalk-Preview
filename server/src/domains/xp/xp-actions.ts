/**
 * XP Actions Registry
 *
 * This module defines all actions that can award XP in the system.
 * These actions are used by the XP service to grant XP to users.
 */

import { xpActionSettings, users } from '@schema';
import { eq, and, sql } from 'drizzle-orm';
import { db } from '@db';
// Removed unused imports from xp-actions-schema
import { logger } from '../../core/logger';

/**
 * Enum of all possible XP-granting actions in the system
 */
export enum XP_ACTION {
	POST_CREATED = 'post_created',
	THREAD_CREATED = 'thread_created',
	RECEIVED_LIKE = 'received_like',
	DAILY_LOGIN = 'daily_login',
	USER_MENTIONED = 'user_mentioned',
	REPLY_RECEIVED = 'reply_received',
	PROFILE_COMPLETED = 'profile_completed',
	FRAME_EQUIPPED = 'frame_equipped'
}

/**
 * Configuration for an XP action
 */
export interface XpActionConfig {
	key: XP_ACTION | string;
	baseValue: number;
	description: string;
	maxPerDay?: number;
	cooldownSeconds?: number;
	enabled?: boolean;
}

/**
 * Default XP action configurations
 *
 * These are used as fallbacks if database values aren't available
 * They're also used to seed the database initially
 */
export const DEFAULT_XP_ACTIONS: Record<XP_ACTION, XpActionConfig> = {
	[XP_ACTION.POST_CREATED]: {
		key: XP_ACTION.POST_CREATED,
		baseValue: 10,
		description: 'Created a post',
		maxPerDay: 100
	},
	[XP_ACTION.THREAD_CREATED]: {
		key: XP_ACTION.THREAD_CREATED,
		baseValue: 30,
		description: 'Started a thread'
	},
	[XP_ACTION.RECEIVED_LIKE]: {
		key: XP_ACTION.RECEIVED_LIKE,
		baseValue: 5,
		description: 'Received a like',
		maxPerDay: 50
	},
	[XP_ACTION.DAILY_LOGIN]: {
		key: XP_ACTION.DAILY_LOGIN,
		baseValue: 5,
		description: 'Daily login bonus',
		cooldownSeconds: 86400 // 24 hours
	},
	[XP_ACTION.USER_MENTIONED]: {
		key: XP_ACTION.USER_MENTIONED,
		baseValue: 2,
		description: 'Mentioned another user',
		maxPerDay: 20
	},
	[XP_ACTION.REPLY_RECEIVED]: {
		key: XP_ACTION.REPLY_RECEIVED,
		baseValue: 3,
		description: 'Received a reply to post',
		maxPerDay: 50
	},
	[XP_ACTION.PROFILE_COMPLETED]: {
		key: XP_ACTION.PROFILE_COMPLETED,
		baseValue: 50,
		description: 'Completed user profile',
		cooldownSeconds: 604800 // One-time bonus (1 week cooldown as safety)
	},
	[XP_ACTION.FRAME_EQUIPPED]: {
		key: XP_ACTION.FRAME_EQUIPPED,
		baseValue: 5,
		description: 'Equipped an avatar frame'
	}
};

// Cache for XP actions
let xpActionsCache: Record<string, XpActionConfig> | null = null;
let cacheLastUpdated: number = 0;
const CACHE_TTL = 60 * 1000; // 1 minute

/**
 * Load XP action configurations from the database
 * Includes caching to reduce database queries
 */
export async function loadXpActionsFromDb(
	forceRefresh = false
): Promise<Record<string, XpActionConfig>> {
	const now = Date.now();

	// Return from cache if it's still valid and no force refresh requested
	if (xpActionsCache && !forceRefresh && now - cacheLastUpdated < CACHE_TTL) {
		return xpActionsCache;
	}

	try {
		// Get all enabled XP actions from database
		const actions = await db
			.select()
			.from(xpActionSettings)
			.where(eq(xpActionSettings.enabled, true));

		// If no actions found in database, use defaults
		if (!actions || actions.length === 0) {
			logger.warn('XP_ACTIONS', 'No XP actions found in database, using defaults');
			xpActionsCache = DEFAULT_XP_ACTIONS;
			cacheLastUpdated = now;
			return DEFAULT_XP_ACTIONS;
		}

		// Convert to the expected format
		const map: Record<string, XpActionConfig> = {};
		actions.forEach((action) => {
			map[action.action] = {
				key: action.action,
				baseValue: action.baseValue,
				description: action.description,
				maxPerDay: action.maxPerDay || undefined,
				cooldownSeconds: action.cooldownSec || undefined,
				enabled: true
			};
		});

		// Update cache
		xpActionsCache = map;
		cacheLastUpdated = now;

		return map;
	} catch (error) {
		// On error, log and fall back to defaults
		logger.error(
			'XP_ACTIONS',
			'Error loading XP actions from database:',
			error instanceof Error ? error.message : String(error)
		);
		return DEFAULT_XP_ACTIONS;
	}
}

/**
 * Get all configured XP actions
 */
export async function getXpActions(): Promise<Record<string, XpActionConfig>> {
	return loadXpActionsFromDb();
}

/**
 * Get an XP action configuration
 */
export async function getXpAction(key: XP_ACTION | string): Promise<XpActionConfig | null> {
	const actions = await loadXpActionsFromDb();
	const action = actions[key];

	if (!action) {
		logger.warn('XP_ACTIONS', `Unknown XP action requested: ${key}`);
		return null;
	}

	return action;
}

/**
 * Get the base XP value for an action
 */
export async function getXpValueForAction(key: XP_ACTION | string): Promise<number> {
	const action = await getXpAction(key);
	return action ? action.baseValue : 0;
}

/**
 * Legacy synchronous functions for backward compatibility
 * These will be deprecated in favor of the async versions above
 */

// Backwards compatibility for code not yet updated to async
export const XP_ACTIONS = DEFAULT_XP_ACTIONS;

// Legacy sync methods - to be deprecated
export function getXpActionSync(key: XP_ACTION): XpActionConfig | null {
	const action = XP_ACTIONS[key];
	if (!action) {
		logger.warn('XP_ACTIONS', `Unknown XP action requested (sync): ${key}`);
		return null;
	}
	return action;
}

export function getXpValueForActionSync(key: XP_ACTION): number {
	const action = getXpActionSync(key);
	return action ? action.baseValue : 0;
}
