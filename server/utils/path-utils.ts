import { getPathForCategory, xpRewards } from '@shared/path-config';
import { CategoryId } from "@shared/types/ids";

export interface UserPaths {
	paths?: Record<string, number>;
	pathMultipliers?: Record<string, number>;
}

// XP threshold for earning a multiplier - sync with path-config.ts
const MULTIPLIER_THRESHOLD = 1000;

// Multiplier value earned upon reaching threshold
const MULTIPLIER_VALUE = 1.2;

/**
 * Awards XP to a user's path based on the category of interaction
 *
 * @param pluginData The user's current plugin data
 * @param categoryId The category ID where the interaction occurred
 * @param actionType The type of action ('newThread' or 'newPost')
 * @returns Updated plugin data with modified paths
 */
export function awardPathXp(
	pluginData: Record<string, any> | null,
	categoryId: CategoryId,
	actionType: 'newThread' | 'newPost'
): Record<string, any> {
	// Initialize plugin data if not exists
	const data = pluginData || {};

	// Initialize paths object if not exists
	if (!data.paths) {
		data.paths = {};
	}

	// Initialize path multipliers if not exists
	if (!data.pathMultipliers) {
		data.pathMultipliers = {};
	}

	// Get the path for this category
	const pathId = getPathForCategory(categoryId);

	// If we have a valid path mapping, award XP
	if (pathId) {
		// Initialize path XP if not exists
		if (!data.paths[pathId]) {
			data.paths[pathId] = 0;
		}

		// Get multiplier for this path, if any
		const multiplier = data.pathMultipliers[pathId] || 1.0;

		// Calculate base XP award
		const baseXp = actionType === 'newThread' ? xpRewards.newThread : xpRewards.newPost;

		// Apply multiplier and add to path XP
		const xpAward = Math.round(baseXp * multiplier);
		data.paths[pathId] += xpAward;

		// Check if user has reached the multiplier threshold
		if (data.paths[pathId] >= MULTIPLIER_THRESHOLD && !data.pathMultipliers[pathId]) {
			data.pathMultipliers[pathId] = MULTIPLIER_VALUE;
		}
	}

	return data;
}

/**
 * Gets all user paths with their XP values
 *
 * @param pluginData The user's plugin data
 * @returns Object containing path IDs and XP values
 */
export function getUserPaths(pluginData: Record<string, any> | null): Record<string, number> {
	if (!pluginData || !pluginData.paths) {
		return {};
	}

	return pluginData.paths;
}

/**
 * Adds a new path to a user's paths with 0 XP
 *
 * @param pluginData The user's current plugin data
 * @param pathId The path ID to add
 * @returns Updated plugin data with the new path
 */
export function addPathToUser(
	pluginData: Record<string, any> | null,
	pathId: string
): Record<string, any> {
	// Initialize plugin data if not exists
	const data = pluginData || {};

	// Initialize paths object if not exists
	if (!data.paths) {
		data.paths = {};
	}

	// Only add if path doesn't exist yet
	if (!data.paths[pathId]) {
		data.paths[pathId] = 0;
	}

	return data;
}

/**
 * Removes a path from a user's paths
 *
 * @param pluginData The user's current plugin data
 * @param pathId The path ID to remove
 * @returns Updated plugin data with the path removed
 */
export function removePathFromUser(
	pluginData: Record<string, any> | null,
	pathId: string
): Record<string, any> {
	// If no plugin data or paths, nothing to remove
	if (!pluginData || !pluginData.paths) {
		return pluginData || {};
	}

	// Create a copy of the paths without the removed path
	const updatedPaths = { ...pluginData.paths };
	delete updatedPaths[pathId];

	// Return updated plugin data
	return {
		...pluginData,
		paths: updatedPaths
	};
}

/**
 * Manually sets XP for a specific path
 *
 * @param pluginData The user's current plugin data
 * @param pathId The path ID to modify
 * @param xp The new XP value
 * @returns Updated plugin data with modified path XP
 */
export function setPathXp(
	pluginData: Record<string, any> | null,
	pathId: string,
	xp: number
): Record<string, any> {
	// Initialize plugin data if not exists
	const data = pluginData || {};

	// Initialize paths object if not exists
	if (!data.paths) {
		data.paths = {};
	}

	// Initialize path multipliers if not exists
	if (!data.pathMultipliers) {
		data.pathMultipliers = {};
	}

	// Set the XP value
	data.paths[pathId] = Math.max(0, xp); // Ensure XP is not negative

	// Check if the new XP value should trigger a multiplier
	if (data.paths[pathId] >= MULTIPLIER_THRESHOLD && !data.pathMultipliers[pathId]) {
		data.pathMultipliers[pathId] = MULTIPLIER_VALUE;
	}

	return data;
}

/**
 * Gets all user path multipliers
 *
 * @param pluginData The user's plugin data
 * @returns Object containing path IDs and their multipliers
 */
export function getPathMultipliers(pluginData: Record<string, any> | null): Record<string, number> {
	if (!pluginData || !pluginData.pathMultipliers) {
		return {};
	}

	return pluginData.pathMultipliers;
}

/**
 * Gets a specific path multiplier
 *
 * @param pluginData The user's plugin data
 * @param pathId The path ID to check
 * @returns The multiplier value (default: 1.0)
 */
export function getPathMultiplier(pluginData: Record<string, any> | null, pathId: string): number {
	if (!pluginData || !pluginData.pathMultipliers || !pluginData.pathMultipliers[pathId]) {
		return 1.0;
	}

	return pluginData.pathMultipliers[pathId];
}
