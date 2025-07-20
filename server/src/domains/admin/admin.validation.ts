/**
 * Admin Validation Utilities
 *
 * Common validation helpers for admin controllers
 */

import { z } from 'zod';
import type { Request, Response } from 'express';
import { sendErrorResponse } from '@core/utils/transformer.helpers';

/**
 * Validate request body against a Zod schema
 */
export function validateRequestBody<T>(
	req: Request,
	res: Response,
	schema: z.ZodType<T>
): T | null {
	const validation = schema.safeParse(req.body);

	if (!validation.success) {
		sendErrorResponse(res, 'Invalid request data', 400);
		return null;
	}

	return validation.data;
}

/**
 * Validate and convert URL parameter to number
 */
export function validateNumberParam(req: Request, res: Response, paramName: string): number | null {
	const value = req.params[paramName];
	const numValue = Number(value);

	if (isNaN(numValue) || !isFinite(numValue)) {
		sendErrorResponse(res, `Invalid ${paramName}: must be a valid number`, 400);
		return null;
	}

	return numValue;
}

/**
 * Validate query parameters against a Zod schema
 */
export function validateQueryParams<T>(
	req: Request,
	res: Response,
	schema: z.ZodType<T>
): T | null {
	const validation = schema.safeParse(req.query);

	if (!validation.success) {
		sendErrorResponse(res, 'Invalid query parameters', 400);
		return null;
	}

	return validation.data;
}

/**
 * Common validation schemas
 */
export const CommonValidation = {
	// Standard pagination schema
	Pagination: z.object({
		page: z.coerce.number().min(1).default(1),
		limit: z.coerce.number().min(1).max(100).default(10),
		search: z.string().optional()
	}),

	// ID parameter validation
	IdParam: z.object({
		id: z.coerce.number().positive()
	}),

	// Basic text input
	TextInput: z.object({
		text: z.string().min(1).max(1000).trim()
	}),

	// Role validation
	Role: z.enum(['user', 'moderator', 'admin']),

	// Amount validation (for DGT, XP, etc.)
	Amount: z.number().min(0).max(1000000)
};
