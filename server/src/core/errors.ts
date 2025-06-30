/**
 * Production Error System
 *
 * Centralized error handling with structured logging, error codes,
 * and consistent API responses. Optimized for debugging and monitoring.
 */

import type { Request, Response, NextFunction } from 'express';
import { logger } from './logger';

// Error severity for monitoring & alerting
export enum ErrorSeverity {
	LOW = 'low',
	MEDIUM = 'medium',
	HIGH = 'high',
	CRITICAL = 'critical'
}

// Structured error codes with categories
export enum ErrorCodes {
	// HTTP Standard (400-499)
	BAD_REQUEST = 'BAD_REQUEST',
	UNAUTHORIZED = 'UNAUTHORIZED',
	FORBIDDEN = 'FORBIDDEN',
	NOT_FOUND = 'NOT_FOUND',
	CONFLICT = 'CONFLICT',
	VALIDATION_FAILED = 'VALIDATION_FAILED',
	RATE_LIMITED = 'RATE_LIMITED',

	// Business Logic (1000-1999)
	INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
	RESOURCE_LOCKED = 'RESOURCE_LOCKED',
	OPERATION_NOT_ALLOWED = 'OPERATION_NOT_ALLOWED',
	BUSINESS_RULE_VIOLATION = 'BUSINESS_RULE_VIOLATION',

	// Authentication (2000-2099)
	INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
	TOKEN_EXPIRED = 'TOKEN_EXPIRED',
	TOKEN_INVALID = 'TOKEN_INVALID',
	SESSION_EXPIRED = 'SESSION_EXPIRED',

	// Database (3000-3099)
	DB_CONNECTION_FAILED = 'DB_CONNECTION_FAILED',
	DB_QUERY_FAILED = 'DB_QUERY_FAILED',
	DB_CONSTRAINT_VIOLATION = 'DB_CONSTRAINT_VIOLATION',
	DB_TRANSACTION_FAILED = 'DB_TRANSACTION_FAILED',

	// External Services (4000-4099)
	EXTERNAL_API_ERROR = 'EXTERNAL_API_ERROR',
	PAYMENT_PROVIDER_ERROR = 'PAYMENT_PROVIDER_ERROR',
	EMAIL_SERVICE_ERROR = 'EMAIL_SERVICE_ERROR',

	// System (5000-5099)
	SERVER_ERROR = 'SERVER_ERROR',
	SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
	TIMEOUT = 'TIMEOUT',
	MEMORY_LIMIT = 'MEMORY_LIMIT',

	// Domain Specific
	WALLET_INSUFFICIENT_FUNDS = 'WALLET_INSUFFICIENT_FUNDS',
	WALLET_TRANSACTION_FAILED = 'WALLET_TRANSACTION_FAILED',
	THREAD_LOCKED = 'THREAD_LOCKED',
	USER_BANNED = 'USER_BANNED'
}

// Error context for debugging
export interface ErrorContext {
	userId?: string;
	requestId?: string;
	userAgent?: string;
	ip?: string;
	path?: string;
	method?: string;
	timestamp?: string;
	stack?: string;
}

// Structured error response
export interface ErrorResponse {
	success: false;
	error: {
		code: ErrorCodes;
		message: string;
		details?: unknown;
		requestId?: string;
		timestamp: string;
	};
}

/**
 * Enhanced base error class with monitoring integration
 */
export class AppError extends Error {
	public readonly timestamp: string;
	public readonly requestId?: string;

	constructor(
		message: string,
		public readonly httpStatus: number = 500,
		public readonly code: ErrorCodes = ErrorCodes.SERVER_ERROR,
		public readonly severity: ErrorSeverity = ErrorSeverity.MEDIUM,
		public readonly details?: unknown,
		public readonly context?: ErrorContext
	) {
		super(message);
		this.name = 'AppError';
		this.timestamp = new Date().toISOString();
		this.requestId = context?.requestId;

		// Maintain stack trace
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, AppError);
		}
	}

	toJSON(): ErrorResponse {
		return {
			success: false,
			error: {
				code: this.code,
				message: this.message,
				details: this.details,
				requestId: this.requestId,
				timestamp: this.timestamp
			}
		};
	}
}

// HTTP Standard Errors
export class BadRequestError extends AppError {
	constructor(message = 'Bad request', details?: unknown, context?: ErrorContext) {
		super(message, 400, ErrorCodes.BAD_REQUEST, ErrorSeverity.LOW, details, context);
	}
}

export class UnauthorizedError extends AppError {
	constructor(message = 'Authentication required', context?: ErrorContext) {
		super(message, 401, ErrorCodes.UNAUTHORIZED, ErrorSeverity.MEDIUM, undefined, context);
	}
}

export class ForbiddenError extends AppError {
	constructor(message = 'Access forbidden', context?: ErrorContext) {
		super(message, 403, ErrorCodes.FORBIDDEN, ErrorSeverity.MEDIUM, undefined, context);
	}
}

export class NotFoundError extends AppError {
	constructor(resource = 'Resource', context?: ErrorContext) {
		super(
			`${resource} not found`,
			404,
			ErrorCodes.NOT_FOUND,
			ErrorSeverity.LOW,
			undefined,
			context
		);
	}
}

export class ConflictError extends AppError {
	constructor(message = 'Resource conflict', details?: unknown, context?: ErrorContext) {
		super(message, 409, ErrorCodes.CONFLICT, ErrorSeverity.MEDIUM, details, context);
	}
}

export class ValidationError extends AppError {
	constructor(
		message = 'Validation failed',
		field?: string,
		errors?: unknown,
		context?: ErrorContext
	) {
		super(
			message,
			400,
			ErrorCodes.VALIDATION_FAILED,
			ErrorSeverity.LOW,
			{ field, errors },
			context
		);
	}
}

export class RateLimitError extends AppError {
	constructor(message = 'Rate limit exceeded', retryAfter?: number, context?: ErrorContext) {
		super(message, 429, ErrorCodes.RATE_LIMITED, ErrorSeverity.MEDIUM, { retryAfter }, context);
	}
}

// Business Logic Errors
export class InsufficientPermissionsError extends AppError {
	constructor(required: string, current?: string, context?: ErrorContext) {
		super(
			`Insufficient permissions. Required: ${required}${current ? `, Current: ${current}` : ''}`,
			403,
			ErrorCodes.INSUFFICIENT_PERMISSIONS,
			ErrorSeverity.MEDIUM,
			{ required, current },
			context
		);
	}
}

export class BusinessRuleViolationError extends AppError {
	constructor(rule: string, details?: unknown, context?: ErrorContext) {
		super(
			`Business rule violation: ${rule}`,
			400,
			ErrorCodes.BUSINESS_RULE_VIOLATION,
			ErrorSeverity.MEDIUM,
			details,
			context
		);
	}
}

// Database Errors
export class DatabaseError extends AppError {
	constructor(operation: string, originalError?: Error, context?: ErrorContext) {
		super(
			`Database operation failed: ${operation}`,
			500,
			ErrorCodes.DB_QUERY_FAILED,
			ErrorSeverity.HIGH,
			{ operation, originalError: originalError?.message },
			context
		);
	}
}

// Domain Specific Errors
export class WalletError extends AppError {
	constructor(message: string, code: ErrorCodes, details?: unknown, context?: ErrorContext) {
		super(message, 400, code, ErrorSeverity.MEDIUM, details, context);
	}
}

export class InsufficientFundsError extends WalletError {
	constructor(required: number, available: number, context?: ErrorContext) {
		super(
			`Insufficient funds. Required: ${required}, Available: ${available}`,
			ErrorCodes.WALLET_INSUFFICIENT_FUNDS,
			{ required, available },
			context
		);
	}
}

// Error utilities
export function createErrorContext(req: Request): ErrorContext {
	return {
		userId: (req.user as any)?.id,
		requestId: req.headers['x-request-id'] as string,
		userAgent: req.headers['user-agent'],
		ip: req.ip || req.connection.remoteAddress,
		path: req.path,
		method: req.method,
		timestamp: new Date().toISOString()
	};
}

// Enhanced async handler with context
export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
	const context = createErrorContext(req);
	Promise.resolve(fn(req, res, next)).catch((error) => {
		if (error instanceof AppError) {
			// Error already has context
			next(error);
		} else {
			// Wrap unknown errors with context
			next(
				new AppError(
					error.message || 'Unknown error',
					500,
					ErrorCodes.SERVER_ERROR,
					ErrorSeverity.HIGH,
					{ originalError: error.name },
					context
				)
			);
		}
	});
};

/**
 * Production-ready global error handler with monitoring integration
 */
export function globalErrorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
	const context = createErrorContext(req);
	let appError: AppError;

	// Convert to AppError if needed
	if (err instanceof AppError) {
		appError = err;
	} else {
		// Handle specific error types
		if (err.name === 'ValidationError') {
			appError = new ValidationError(err.message, undefined, undefined, context);
		} else if (err.name === 'CastError') {
			appError = new BadRequestError('Invalid ID format', { field: (err as any).path }, context);
		} else if (err.name === 'SyntaxError') {
			appError = new BadRequestError('Invalid JSON syntax', undefined, context);
		} else {
			appError = new AppError(
				process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
				500,
				ErrorCodes.SERVER_ERROR,
				ErrorSeverity.HIGH,
				process.env.NODE_ENV === 'production' ? undefined : { stack: err.stack },
				context
			);
		}
	}

	// Structured logging with severity-based levels
	const logLevel =
		{
			[ErrorSeverity.LOW]: 'info',
			[ErrorSeverity.MEDIUM]: 'warn',
			[ErrorSeverity.HIGH]: 'error',
			[ErrorSeverity.CRITICAL]: 'error'
		}[appError.severity] || 'error';

	logger[logLevel]('REQUEST_ERROR', {
		code: appError.code,
		message: appError.message,
		severity: appError.severity,
		httpStatus: appError.httpStatus,
		context: appError.context,
		details: appError.details,
		stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined
	});

	// Alert for critical errors (integrate with monitoring service)
	if (appError.severity === ErrorSeverity.CRITICAL) {
		// TODO: Integrate with alerting service (PagerDuty, Slack, etc.)
		logger.error('CRITICAL_ERROR_ALERT', {
			code: appError.code,
			message: appError.message,
			context: appError.context
		});
	}

	// Send structured response
	res.status(appError.httpStatus).json(appError.toJSON());
}

// Error factory functions for common scenarios
export const ErrorFactory = {
	notFound: (resource: string, req?: Request) =>
		new NotFoundError(resource, req ? createErrorContext(req) : undefined),

	unauthorized: (message?: string, req?: Request) =>
		new UnauthorizedError(message, req ? createErrorContext(req) : undefined),

	forbidden: (required: string, current?: string, req?: Request) =>
		new InsufficientPermissionsError(required, current, req ? createErrorContext(req) : undefined),

	validation: (field: string, errors: unknown, req?: Request) =>
		new ValidationError(
			`Validation failed for ${field}`,
			field,
			errors,
			req ? createErrorContext(req) : undefined
		),

	insufficientFunds: (required: number, available: number, req?: Request) =>
		new InsufficientFundsError(required, available, req ? createErrorContext(req) : undefined),

	database: (operation: string, originalError?: Error, req?: Request) =>
		new DatabaseError(operation, originalError, req ? createErrorContext(req) : undefined)
};
