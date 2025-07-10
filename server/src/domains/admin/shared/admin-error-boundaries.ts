/* eslint-disable */

import type { Request, Response } from 'express';
import type { EntityId, RequestId, UserId } from '@shared/types/ids';
import { userService } from '@core/services/user.service';
import { logger } from '@core/logger';
import { AdminError, AdminErrorCodes } from '../admin.errors';

// Enhanced error types with context
export interface AdminErrorContext {
	operation: string;
	entityType?: string;
	entityId?: string | EntityId;
	userId?: UserId;
	timestamp: Date;
	requestId?: string;
	metadata?: Record<string, any>;
}

export interface AdminOperationResult<T = any> {
	success: boolean;
	data?: T;
	error?: AdminErrorDetails;
	context: AdminErrorContext;
}

export interface AdminErrorDetails {
	code: string;
	message: string;
	httpStatus: number;
	details?: any;
	recoverable: boolean;
	userMessage?: string;
}

/**
 * Typed error categories for better error handling
 */
export const ERROR_CATEGORIES = {
	VALIDATION: 'validation',
	AUTHORIZATION: 'authorization',
	NOT_FOUND: 'not_found',
	CONFLICT: 'conflict',
	RATE_LIMITED: 'rate_limited',
	EXTERNAL_SERVICE: 'external_service',
	DATABASE: 'database',
	BUSINESS_LOGIC: 'business_logic',
	SYSTEM: 'system'
} as const;

export type ErrorCategory = (typeof ERROR_CATEGORIES)[keyof typeof ERROR_CATEGORIES];

/**
 * Enhanced AdminError with category and recovery information
 */
export class TypedAdminError extends AdminError {
	public readonly category: ErrorCategory;
	public readonly recoverable: boolean;
	public readonly userMessage?: string;
	public readonly context?: AdminErrorContext;

	constructor(
		message: string,
		httpStatus: number = 500,
		code: string = AdminErrorCodes.INTERNAL_ERROR,
		details?: any,
		category: ErrorCategory = ERROR_CATEGORIES.SYSTEM,
		recoverable: boolean = false,
		userMessage?: string,
		context?: AdminErrorContext
	) {
		super(message, httpStatus, code, details);
		this.category = category;
		this.recoverable = recoverable;
		this.userMessage = userMessage;
		this.context = context;
	}

	toJSON() {
		return {
			...super.toJSON(),
			category: this.category,
			recoverable: this.recoverable,
			userMessage: this.userMessage,
			context: this.context
		};
	}
}

/**
 * Error factory for creating typed admin errors
 */
export class AdminErrorFactory {
	static validation(
		message: string,
		details?: any,
		userMessage?: string,
		context?: AdminErrorContext
	): TypedAdminError {
		return new TypedAdminError(
			message,
			400,
			AdminErrorCodes.VALIDATION_ERROR,
			details,
			ERROR_CATEGORIES.VALIDATION,
			true,
			userMessage || 'Please check your input and try again',
			context
		);
	}

	static notFound(
		entityType: string,
		entityId: string | EntityId,
		context?: AdminErrorContext
	): TypedAdminError {
		return new TypedAdminError(
			`${entityType} with ID ${entityId} not found`,
			404,
			AdminErrorCodes.NOT_FOUND,
			{ entityType, entityId },
			ERROR_CATEGORIES.NOT_FOUND,
			false,
			`The requested ${entityType.toLowerCase()} could not be found`,
			context
		);
	}

	static unauthorized(
		operation: string,
		requiredRole?: string,
		context?: AdminErrorContext
	): TypedAdminError {
		return new TypedAdminError(
			`Insufficient permissions for operation: ${operation}`,
			403,
			AdminErrorCodes.FORBIDDEN,
			{ operation, requiredRole },
			ERROR_CATEGORIES.AUTHORIZATION,
			false,
			'You do not have permission to perform this action',
			context
		);
	}

	static conflict(
		message: string,
		conflictType: string,
		details?: any,
		context?: AdminErrorContext
	): TypedAdminError {
		return new TypedAdminError(
			message,
			409,
			AdminErrorCodes.DUPLICATE_ENTRY,
			{ conflictType, ...details },
			ERROR_CATEGORIES.CONFLICT,
			true,
			'This operation conflicts with existing data',
			context
		);
	}

	static rateLimited(
		operation: string,
		resetTime?: Date,
		context?: AdminErrorContext
	): TypedAdminError {
		return new TypedAdminError(
			`Rate limit exceeded for operation: ${operation}`,
			429,
			AdminErrorCodes.RATE_LIMITED,
			{ operation, resetTime },
			ERROR_CATEGORIES.RATE_LIMITED,
			true,
			'Too many requests. Please try again later',
			context
		);
	}

	static database(
		operation: string,
		originalError?: Error,
		context?: AdminErrorContext
	): TypedAdminError {
		return new TypedAdminError(
			`Database error during operation: ${operation}`,
			500,
			AdminErrorCodes.DB_ERROR,
			{ operation, originalError: originalError?.message },
			ERROR_CATEGORIES.DATABASE,
			true,
			'A temporary issue occurred. Please try again',
			context
		);
	}

	static businessLogic(
		message: string,
		rule: string,
		details?: any,
		context?: AdminErrorContext
	): TypedAdminError {
		return new TypedAdminError(
			message,
			400,
			AdminErrorCodes.BUSINESS_RULE_VIOLATION,
			{ rule, ...details },
			ERROR_CATEGORIES.BUSINESS_LOGIC,
			true,
			message, // Business logic errors are usually user-facing
			context
		);
	}
}

/**
 * Admin operation wrapper with error boundaries
 */
export class AdminOperationBoundary {
	private context: AdminErrorContext;

	constructor(context: AdminErrorContext) {
		this.context = context;
	}

	/**
	 * Execute an admin operation with comprehensive error handling
	 */
	async execute<T>(
		operation: () => Promise<T>,
		options?: {
			retryAttempts?: number;
			retryDelay?: number;
			onRetry?: (attempt: number, error: Error) => void;
		}
	): Promise<AdminOperationResult<T>> {
		const { retryAttempts = 0, retryDelay = 1000, onRetry } = options || {};
		let lastError: Error | null = null;

		for (let attempt = 0; attempt <= retryAttempts; attempt++) {
			try {
				const result = await operation();

				// Log successful operation
				logger.info('AdminOperationBoundary', 'Operation completed successfully', {
					operation: this.context.operation,
					attempt: attempt + 1,
					entityType: this.context.entityType,
					userId: this.context.userId
				});

				return {
					success: true,
					data: result,
					context: this.context
				};
			} catch (error) {
				lastError = error;

				// Log the error
				logger.error('AdminOperationBoundary', `Operation failed (attempt ${attempt + 1})`, {
					operation: this.context.operation,
					error: error.message,
					attempt: attempt + 1,
					retryAttempts,
					entityType: this.context.entityType,
					userId: this.context.userId
				});

				// Check if error is retryable
				if (attempt < retryAttempts && this.isRetryableError(error)) {
					if (onRetry) {
						onRetry(attempt + 1, error);
					}

					// Wait before retry
					await new Promise((resolve) => setTimeout(resolve, retryDelay * (attempt + 1)));
					continue;
				}

				// Convert to typed error if needed
				const typedError = this.normalizeError(error);

				return {
					success: false,
					error: {
						code: typedError.code,
						message: typedError.message,
						httpStatus: typedError.httpStatus,
						details: typedError.details,
						recoverable: typedError instanceof TypedAdminError ? typedError.recoverable : false,
						userMessage: typedError instanceof TypedAdminError ? typedError.userMessage : undefined
					},
					context: this.context
				};
			}
		}

		// This shouldn't be reached, but TypeScript requires it
		throw lastError || new Error('Unknown error in operation boundary');
	}

	/**
	 * Check if an error is retryable
	 */
	private isRetryableError(error: Error): boolean {
		if (error instanceof TypedAdminError) {
			return (
				error.recoverable &&
				[
					ERROR_CATEGORIES.DATABASE,
					ERROR_CATEGORIES.EXTERNAL_SERVICE,
					ERROR_CATEGORIES.RATE_LIMITED
				].includes(error.category)
			);
		}

		if (error instanceof AdminError) {
			return [
				AdminErrorCodes.DB_ERROR,
				AdminErrorCodes.EXTERNAL_SERVICE_ERROR,
				AdminErrorCodes.RATE_LIMITED
			].includes(error.code);
		}

		// For unknown errors, assume they might be retryable
		return true;
	}

	/**
	 * Normalize any error to TypedAdminError
	 */
	private normalizeError(error: Error): TypedAdminError {
		if (error instanceof TypedAdminError) {
			return error;
		}

		if (error instanceof AdminError) {
			// Convert AdminError to TypedAdminError
			return new TypedAdminError(
				error.message,
				error.httpStatus,
				error.code,
				error.details,
				ERROR_CATEGORIES.SYSTEM,
				false,
				undefined,
				this.context
			);
		}

		// Convert generic error
		return new TypedAdminError(
			error.message || 'An unexpected error occurred',
			500,
			AdminErrorCodes.INTERNAL_ERROR,
			{ originalError: error.message },
			ERROR_CATEGORIES.SYSTEM,
			true,
			'A temporary issue occurred. Please try again',
			this.context
		);
	}
}

/**
 * Express middleware for admin error boundaries
 */
export function adminErrorBoundaryMiddleware(req: Request, res: Response, next: Function) {
	// Add error boundary helper to request
	req.adminBoundary = (operation: string, entityType?: string, entityId?: string | EntityId) => {
		const context: AdminErrorContext = {
			operation,
			entityType,
			entityId,
			userId: (userService.getUserFromRequest(req) as any)?.id,
			timestamp: new Date(),
			requestId: (req.headers['x-request-id'] as string) || generateRequestId(),
			metadata: {
				ip: req.ip,
				userAgent: req.headers['user-agent'],
				path: req.path,
				method: req.method
			}
		};

		return new AdminOperationBoundary(context);
	};

	next();
}

/**
 * Generate unique request ID for tracing
 */
function generateRequestId(): string {
	return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Error response formatter
 */
export function formatErrorResponse(
	result: AdminOperationResult,
	includeStack: boolean = false
): {
	success: false;
	error: AdminErrorDetails;
	requestId?: string;
	timestamp: string;
	stack?: string;
} {
	if (result.success || !result.error) {
		throw new Error('Cannot format error response for successful result');
	}

	return {
		success: false,
		error: result.error,
		requestId: result.context.requestId,
		timestamp: result.context.timestamp.toISOString(),
		...(includeStack && { stack: new Error().stack })
	};
}

// eslint-disable-next-line @typescript-eslint/no-namespace

// Extend Express Request type
declare global {
	namespace Express {
		interface Request {
			adminBoundary?: (
				operation: string,
				entityType?: string,
				entityId?: string | EntityId
			) => AdminOperationBoundary;
		}
	}
}
