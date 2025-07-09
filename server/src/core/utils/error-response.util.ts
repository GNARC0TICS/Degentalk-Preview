/**
 * Shared Error Response Utilities
 *
 * Standardizes error handling patterns across the application
 * Eliminates duplicate try/catch blocks and error formatting
 */

import type { Request, Response } from 'express';
import { ZodError } from 'zod';
import { userService } from '../services/user.service';
import { logger } from '../logger';

export interface ErrorResponse {
	success: false;
	error: string;
	details?: any;
	code?: string;
	timestamp?: string;
	requestId?: string;
}

export interface SuccessResponse<T = any> {
	success: true;
	data: T;
	meta?: {
		pagination?: {
			page: number;
			limit: number;
			total: number;
			totalPages: number;
		};
		timestamp?: string;
		requestId?: string;
	};
}

export type ApiResponse<T = any> = SuccessResponse<T> | ErrorResponse;

export class ResponseError extends Error {
	constructor(
		message: string,
		public statusCode: number = 500,
		public code?: string,
		public details?: any
	) {
		super(message);
		this.name = 'ResponseError';
	}
}

/**
 * Standard error response formatter
 */
export function formatErrorResponse(
	error: Error,
	statusCode: number = 500,
	code?: string,
	details?: any
): ErrorResponse {
	return {
		success: false,
		error: error.message,
		code,
		details,
		timestamp: new Date().toISOString()
	};
}

/**
 * Standard success response formatter
 */
export function formatSuccessResponse<T>(
	data: T,
	meta?: SuccessResponse<T>['meta']
): SuccessResponse<T> {
	return {
		success: true,
		data,
		meta: {
			...meta,
			timestamp: new Date().toISOString()
		}
	};
}

/**
 * Handle validation errors (Zod)
 */
export function handleValidationError(error: ZodError): ErrorResponse {
	return {
		success: false,
		error: 'Validation failed',
		code: 'VALIDATION_ERROR',
		details: error.errors.map((err) => ({
			field: err.path.join('.'),
			message: err.message,
			received: err.received
		})),
		timestamp: new Date().toISOString()
	};
}

/**
 * Express error handler middleware factory
 */
export function createErrorHandler(context: string) {
	return (error: Error, req: Request, res: Response, next: any) => {
		// Log the error
		const authUser = userService.getUserFromRequest(req);
		logger.error(context, 'Request error', {
			error: error.message,
			stack: error.stack,
			path: req.path,
			method: req.method,
			userId: authUser?.id,
			ip: req.ip
		});

		// Handle different error types
		if (error instanceof ZodError) {
			const response = handleValidationError(error);
			return res.status(400).json(response);
		}

		if (error instanceof ResponseError) {
			const response = formatErrorResponse(error, error.statusCode, error.code, error.details);
			return res.status(error.statusCode).json(response);
		}

		// Default error response
		const statusCode = (error as any).statusCode || 500;
		const response = formatErrorResponse(error, statusCode, (error as any).code);

		return res.status(statusCode).json(response);
	};
}

/**
 * Async route wrapper to catch errors automatically
 */
export function asyncHandler(fn: (req: Request, res: Response, next: any) => Promise<any>) {
	return (req: Request, res: Response, next: any) => {
		Promise.resolve(fn(req, res, next)).catch(next);
	};
}

/**
 * Try-catch wrapper for async operations
 */
export async function tryAsync<T>(
	operation: () => Promise<T>,
	context: string,
	fallback?: T
): Promise<T | null> {
	try {
		return await operation();
	} catch (error) {
		logger.error(context, 'Async operation failed', { error });
		return fallback || null;
	}
}

/**
 * Database operation wrapper with error handling
 */
export async function dbOperation<T>(
	operation: () => Promise<T>,
	context: string,
	errorMessage: string = 'Database operation failed'
): Promise<T> {
	try {
		return await operation();
	} catch (error) {
		logger.error(context, errorMessage, { error });
		throw new ResponseError(errorMessage, 500, 'DATABASE_ERROR', { originalError: error.message });
	}
}

/**
 * Service call wrapper with error handling
 */
export async function serviceCall<T>(
	operation: () => Promise<T>,
	context: string,
	serviceName: string
): Promise<T> {
	try {
		return await operation();
	} catch (error) {
		logger.error(context, `${serviceName} service call failed`, { error });
		throw new ResponseError(`${serviceName} service unavailable`, 503, 'SERVICE_ERROR', {
			service: serviceName,
			originalError: error.message
		});
	}
}

/**
 * Permission check wrapper
 */
export function requirePermission(
	check: () => boolean,
	message: string = 'Permission denied'
): void {
	if (!check()) {
		throw new ResponseError(message, 403, 'PERMISSION_DENIED');
	}
}

/**
 * Resource existence check wrapper
 */
export function requireResource<T>(
	resource: T | null | undefined,
	resourceType: string = 'Resource'
): T {
	if (!resource) {
		throw new ResponseError(`${resourceType} not found`, 404, 'NOT_FOUND');
	}
	return resource;
}

/**
 * Rate limit check wrapper
 */
export function checkRateLimit(isLimited: boolean, resetTime?: Date): void {
	if (isLimited) {
		throw new ResponseError('Rate limit exceeded', 429, 'RATE_LIMIT_EXCEEDED', { resetTime });
	}
}

/**
 * Pagination helper
 */
export function createPaginationMeta(page: number, limit: number, total: number) {
	return {
		pagination: {
			page,
			limit,
			total,
			totalPages: Math.ceil(total / limit)
		}
	};
}

/**
 * Standard controller method wrapper
 */
export function controllerMethod<T extends any[]>(
	fn: (...args: T) => Promise<any>,
	context: string
) {
	return asyncHandler(async (req: Request, res: Response) => {
		const result = await fn(req, res);

		// If result is already a response, don't double-wrap
		if (res.headersSent) {
			return;
		}

		// If result has success property, send as-is
		if (result && typeof result === 'object' && 'success' in result) {
			return res.status(200).json(result);
		}

		// Otherwise wrap in success response
		return res.status(200).json(formatSuccessResponse(result));
	});
}

/**
 * Health check response helper
 */
export function healthResponse(
	status: 'healthy' | 'degraded' | 'unhealthy',
	checks: Record<string, { status: string; message?: string; responseTime?: number }>
) {
	const statusCode = status === 'healthy' ? 200 : 503;

	return {
		status,
		timestamp: new Date().toISOString(),
		checks,
		uptime: process.uptime()
	};
}
