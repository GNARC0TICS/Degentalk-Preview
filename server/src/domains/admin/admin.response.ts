/**
 * Admin Response Utilities
 *
 * Standardized response formats for admin API endpoints
 */

import type { Response } from 'express';

export interface StandardResponse<T = any> {
	success: boolean;
	data?: T;
	error?: string;
	message?: string;
	code?: string;
	details?: any;
}

/**
 * Send a successful response with data
 */
export function sendSuccess<T>(
	res: Response,
	data: T,
	message?: string,
	statusCode: number = 200
): Response {
	return res.status(statusCode).json({
		success: true,
		data,
		...(message && { message })
	});
}

/**
 * Send an error response
 */
export function sendError(
	res: Response,
	error: string,
	statusCode: number = 500,
	code?: string,
	details?: any
): Response {
	return res.status(statusCode).json({
		success: false,
		error,
		...(code && { code }),
		...(details && { details })
	});
}

/**
 * Send validation error response
 */
export function sendValidationError(res: Response, error: string, details?: any): Response {
	return sendError(res, error, 400, 'VALIDATION_ERROR', details);
}

/**
 * Handle admin error response (for AdminError instances)
 */
export function handleAdminError(res: Response, error: any): Response {
	if (error.httpStatus && error.code) {
		return sendError(res, error.message, error.httpStatus, error.code);
	}
	return sendError(res, error.message || 'Internal server error', 500);
}
