import type { Request } from 'express';
import { userService } from '@server/src/core/services/user.service';
import { logger } from '@server/src/core/logger'; // Using central logger

/**
 * @deprecated Use userService.getUserFromRequest() instead
 * This utility is maintained for backward compatibility only.
 *
 * Retrieves the user ID from the request object using the centralized userService.
 *
 * @param req - The Express request object.
 * @returns The user ID as a number, or undefined if not found.
 */
export function getUserIdFromRequest(req: Request): number | undefined {
	const authUser = userService.getUserFromRequest(req);
	return authUser?.id;
}
