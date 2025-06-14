import type { Request } from 'express';
import { logger } from '@server/src/core/logger'; // Using central logger

/**
 * Retrieves the user ID from the request object.
 * Prefers `req.user.id`, falls back to `req.user.user_id`.
 * Logs an error if the ID cannot be determined reliably.
 * 
 * @param req - The Express request object.
 * @returns The user ID as a number, or undefined if not found.
 *          Consider throwing an error or returning a more specific type
 *          if a user ID is strictly required by the caller.
 */
export function getUserIdFromRequest(req: Request): number | undefined {
	if (req.user) {
		const user = req.user as any; // Cast to any to access potential id properties
		if (typeof user.id === 'number') {
			return user.id;
		}
		// Fallback for potential alternative user_id property
		if (typeof user.user_id === 'number') {
			logger.warn('AuthUtil', 'User ID accessed via fallback req.user.user_id', { userIdSource: 'user_id_fallback' });
			return user.user_id;
		}
	}
	logger.error('AuthUtil', 'User ID not found or not a number in req.user', { userObject: req.user });
	return undefined; // Return undefined if no valid ID is found
}
