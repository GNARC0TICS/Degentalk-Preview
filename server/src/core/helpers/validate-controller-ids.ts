/**
 * Controller ID Validation Helper
 * 
 * SECURITY: This helper provides centralized ID validation for all controllers.
 * It ensures that all IDs from request parameters are properly validated as UUIDs
 * before being used in business logic or database queries.
 * 
 * This prevents:
 * - SQL injection via malformed IDs
 * - Path traversal attacks
 * - Invalid ID formats causing runtime errors
 * - Unauthorized access via ID manipulation
 */

import { toId, isValidId } from '@shared/utils/id';
import type { Id } from '@shared/types/ids';
import { logger } from '@core/logger';

/**
 * Validates and converts a string ID to a branded ID type.
 * Returns null if the ID is invalid, allowing controllers to handle the error appropriately.
 * 
 * @param id - The string ID to validate (typically from req.params)
 * @param type - The branded ID type to convert to (e.g., 'User', 'Thread', 'Forum')
 * @returns The validated and branded ID, or null if invalid
 * 
 * @example
 * const userId = validateAndConvertId(req.params.id, 'User');
 * if (!userId) {
 *   return sendErrorResponse(res, 'Invalid user ID format', 400);
 * }
 */
export function validateAndConvertId<T extends string>(
	id: string | undefined,
	type: T
): Id<T> | null {
	if (!id) {
		logger.warn('ID validation failed: undefined or empty ID', `Type: ${type}`);
		return null;
	}

	if (!isValidId(id)) {
		logger.warn('ID validation failed: invalid UUID format', `ID: ${id}, Type: ${type}, Expected UUID v4 format`);
		return null;
	}

	try {
		return toId<T>(id);
	} catch (error) {
		logger.error('ID conversion failed after validation', `ID: ${id}, Type: ${type}, Error: ${error}`);
		return null;
	}
}

/**
 * Validates multiple IDs at once, useful for batch operations.
 * Returns an array of validated IDs or null if any ID is invalid.
 * 
 * @param ids - Array of string IDs to validate
 * @param type - The branded ID type to convert to
 * @returns Array of validated branded IDs, or null if any ID is invalid
 */
export function validateAndConvertIds<T extends string>(
	ids: (string | undefined)[],
	type: T
): Id<T>[] | null {
	const validatedIds: Id<T>[] = [];

	for (const id of ids) {
		const validatedId = validateAndConvertId(id, type);
		if (!validatedId) {
			return null; // Fail fast if any ID is invalid
		}
		validatedIds.push(validatedId);
	}

	return validatedIds;
}

/**
 * Express middleware for automatic ID validation on common route patterns.
 * Can be used on routes like /users/:id, /threads/:threadId, etc.
 * 
 * @example
 * router.get('/:id', validateIdParam('User'), async (req, res) => {
 *   const userId = req.validatedId as UserId; // Type-safe access
 * });
 */
export function validateIdParam(type: string) {
	return (req: any, res: any, next: any) => {
		// Find the ID parameter (could be :id, :userId, :threadId, etc.)
		const idParam = req.params.id || req.params[`${type.toLowerCase()}Id`];
		
		if (!idParam) {
			return res.status(400).json({ 
				error: `Missing ${type} ID parameter` 
			});
		}

		const validatedId = validateAndConvertId(idParam, type);
		if (!validatedId) {
			return res.status(400).json({ 
				error: `Invalid ${type} ID format. Expected UUID.` 
			});
		}

		// Attach the validated ID to the request for type-safe access
		req.validatedId = validatedId;
		next();
	};
}

/**
 * Extracts and validates an ID from various request sources (params, body, query).
 * Useful for flexible ID validation across different endpoint patterns.
 * 
 * @param req - Express request object
 * @param fieldName - The field name to look for (e.g., 'userId', 'targetId')
 * @param type - The branded ID type to convert to
 * @returns The validated branded ID or null if not found/invalid
 */
export function extractAndValidateId<T extends string>(
	req: any,
	fieldName: string,
	type: T
): Id<T> | null {
	const id = req.params[fieldName] || req.body?.[fieldName] || req.query?.[fieldName];
	return validateAndConvertId(id, type);
}

/**
 * Security logging helper for tracking invalid ID attempts.
 * Use this to monitor potential attacks or scanning attempts.
 */
export function logInvalidIdAttempt(
	req: any,
	attemptedId: string,
	type: string,
	context?: Record<string, any>
): void {
	logger.warn('Invalid ID attempt detected', 
		`Attempted ID: ${attemptedId}, Type: ${type}, Method: ${req.method}, Path: ${req.path}, IP: ${req.ip}, UserAgent: ${req.get('user-agent')}, AuthUser: ${req.user?.id}`
	);
}