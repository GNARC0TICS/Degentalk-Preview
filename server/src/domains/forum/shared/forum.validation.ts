/**
 * Forum Validation Utilities
 *
 * Domain-specific validation helpers for forum controllers
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