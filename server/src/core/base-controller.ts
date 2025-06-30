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
import { userService } from './services/user.service';
import { ForbiddenError, NotFoundError, UnauthorizedError, ValidationError } from './errors';

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
		const authUser = userService.getUserFromRequest(req);
		if (!authUser || typeof authUser.id !== 'number') {
			throw new UnauthorizedError('User not authenticated');
		}
		return authUser.id;
	}

	/**
	 * Extract user role from request with type safety
	 */
	protected getUserRole(req: any): string {
		const authUser = userService.getUserFromRequest(req);
		if (!authUser || typeof authUser.role !== 'string') {
			throw new UnauthorizedError('User role not available');
		}
		return authUser.role;
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
