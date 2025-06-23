/**
 * Base Controller with Type-Safe Response Handling
 *
 * QUALITY IMPROVEMENT: Eliminates inconsistent response patterns
 * Provides type-safe API responses across all controllers
 */

import type { Response } from 'express';
import type {
	ApiResponse,
	ApiSuccess,
	ApiError,
	ApiErrorCode,
	PaginationMeta,
	FilterMeta,
	TypedResponse
} from '@shared/types/api.types';
import { logger } from './logger';

export abstract class BaseController {
	/**
	 * Send a successful response
	 */
	protected success<T>(
		res: Response,
		data: T,
		message?: string,
		meta?: PaginationMeta | FilterMeta
	): TypedResponse<T> {
		const response: ApiSuccess<T> = {
			success: true,
			data,
			message,
			timestamp: new Date().toISOString(),
			...(meta && { meta })
		};

		return res.status(200).json(response);
	}

	/**
	 * Send a created response (201)
	 */
	protected created<T>(res: Response, data: T, message?: string): TypedResponse<T> {
		const response: ApiSuccess<T> = {
			success: true,
			data,
			message: message || 'Resource created successfully',
			timestamp: new Date().toISOString()
		};

		return res.status(201).json(response);
	}

	/**
	 * Send an error response
	 */
	protected error(
		res: Response,
		code: ApiErrorCode | string,
		message: string,
		statusCode: number = 400,
		details?: Record<string, unknown>,
		field?: string
	): TypedResponse<never> {
		const response: ApiError = {
			success: false,
			error: {
				code,
				message,
				...(details && { details }),
				...(field && { field })
			},
			timestamp: new Date().toISOString()
		};

		// Log error for monitoring
		logger.error('API_ERROR', message, {
			code,
			statusCode,
			details,
			field
		});

		return res.status(statusCode).json(response);
	}

	/**
	 * Send a not found error (404)
	 */
	protected notFound(res: Response, resource: string = 'Resource'): TypedResponse<never> {
		return this.error(res, ApiErrorCode.NOT_FOUND, `${resource} not found`, 404);
	}

	/**
	 * Send an unauthorized error (401)
	 */
	protected unauthorized(
		res: Response,
		message: string = 'Authentication required'
	): TypedResponse<never> {
		return this.error(res, ApiErrorCode.UNAUTHORIZED, message, 401);
	}

	/**
	 * Send a forbidden error (403)
	 */
	protected forbidden(res: Response, message: string = 'Access forbidden'): TypedResponse<never> {
		return this.error(res, ApiErrorCode.FORBIDDEN, message, 403);
	}

	/**
	 * Send a validation error (400)
	 */
	protected validationError(
		res: Response,
		message: string,
		field?: string,
		details?: Record<string, unknown>
	): TypedResponse<never> {
		return this.error(res, ApiErrorCode.VALIDATION_ERROR, message, 400, details, field);
	}

	/**
	 * Send an internal server error (500)
	 */
	protected internalError(
		res: Response,
		message: string = 'Internal server error',
		details?: Record<string, unknown>
	): TypedResponse<never> {
		return this.error(res, ApiErrorCode.INTERNAL_ERROR, message, 500, details);
	}

	/**
	 * Handle async controller methods with error catching
	 */
	protected async handleAsync<T>(
		res: Response,
		operation: () => Promise<T>,
		successMessage?: string
	): Promise<TypedResponse<T> | TypedResponse<never>> {
		try {
			const result = await operation();
			return this.success(res, result, successMessage);
		} catch (error) {
			logger.error('ASYNC_OPERATION_ERROR', 'Async operation failed', { error });

			if (error instanceof ValidationError) {
				return this.validationError(res, error.message, error.field, error.details);
			}

			if (error instanceof NotFoundError) {
				return this.notFound(res, error.resource);
			}

			if (error instanceof UnauthorizedError) {
				return this.unauthorized(res, error.message);
			}

			if (error instanceof ForbiddenError) {
				return this.forbidden(res, error.message);
			}

			return this.internalError(res, 'An unexpected error occurred', {
				originalError: error instanceof Error ? error.message : String(error)
			});
		}
	}

	/**
	 * Create paginated response
	 */
	protected paginated<T>(
		res: Response,
		data: T[],
		pagination: PaginationMeta,
		message?: string
	): TypedResponse<T[]> {
		const response: ApiSuccess<T[]> = {
			success: true,
			data,
			message,
			timestamp: new Date().toISOString(),
			meta: pagination
		};

		return res.status(200).json(response);
	}

	/**
	 * Extract user ID from request with type safety
	 */
	protected getUserId(req: any): number {
		const userId = req.user?.id;
		if (typeof userId !== 'number') {
			throw new UnauthorizedError('User not authenticated');
		}
		return userId;
	}

	/**
	 * Extract user role from request with type safety
	 */
	protected getUserRole(req: any): string {
		const role = req.user?.role;
		if (typeof role !== 'string') {
			throw new UnauthorizedError('User role not available');
		}
		return role;
	}

	/**
	 * Check if user has required role
	 */
	protected requireRole(req: any, requiredRole: string | string[]): void {
		const userRole = this.getUserRole(req);
		const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

		if (!allowedRoles.includes(userRole)) {
			throw new ForbiddenError(`Required role: ${allowedRoles.join(' or ')}`);
		}
	}
}

// Custom error classes for better error handling
export class ValidationError extends Error {
	constructor(
		message: string,
		public field?: string,
		public details?: Record<string, unknown>
	) {
		super(message);
		this.name = 'ValidationError';
	}
}

export class NotFoundError extends Error {
	constructor(public resource: string = 'Resource') {
		super(`${resource} not found`);
		this.name = 'NotFoundError';
	}
}

export class UnauthorizedError extends Error {
	constructor(message: string = 'Authentication required') {
		super(message);
		this.name = 'UnauthorizedError';
	}
}

export class ForbiddenError extends Error {
	constructor(message: string = 'Access forbidden') {
		super(message);
		this.name = 'ForbiddenError';
	}
}
