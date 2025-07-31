/**
 * Production Error System
 *
 * Centralized error handling with structured logging, error codes,
 * and consistent API responses. Optimized for debugging and monitoring.
 */
import { logger } from './logger';
import { getUser } from '@core/utils/auth.helpers';
// Error severity for monitoring and alerting
export var ErrorSeverity;
(function (ErrorSeverity) {
    ErrorSeverity["LOW"] = "low";
    ErrorSeverity["MEDIUM"] = "medium";
    ErrorSeverity["HIGH"] = "high";
    ErrorSeverity["CRITICAL"] = "critical";
})(ErrorSeverity || (ErrorSeverity = {}));
// Structured error codes with categories
export var ErrorCodes;
(function (ErrorCodes) {
    // HTTP Standard (400-499)
    ErrorCodes["BAD_REQUEST"] = "BAD_REQUEST";
    ErrorCodes["UNAUTHORIZED"] = "UNAUTHORIZED";
    ErrorCodes["FORBIDDEN"] = "FORBIDDEN";
    ErrorCodes["NOT_FOUND"] = "NOT_FOUND";
    ErrorCodes["CONFLICT"] = "CONFLICT";
    ErrorCodes["VALIDATION_FAILED"] = "VALIDATION_FAILED";
    ErrorCodes["RATE_LIMITED"] = "RATE_LIMITED";
    ErrorCodes["INVALID_REQUEST"] = "INVALID_REQUEST";
    // Business Logic (1000-1999)
    ErrorCodes["INSUFFICIENT_PERMISSIONS"] = "INSUFFICIENT_PERMISSIONS";
    ErrorCodes["RESOURCE_LOCKED"] = "RESOURCE_LOCKED";
    ErrorCodes["OPERATION_NOT_ALLOWED"] = "OPERATION_NOT_ALLOWED";
    ErrorCodes["BUSINESS_RULE_VIOLATION"] = "BUSINESS_RULE_VIOLATION";
    ErrorCodes["VALIDATION_ERROR"] = "VALIDATION_ERROR";
    ErrorCodes["DUPLICATE_ENTRY"] = "DUPLICATE_ENTRY";
    // Authentication (2000-2099)
    ErrorCodes["INVALID_CREDENTIALS"] = "INVALID_CREDENTIALS";
    ErrorCodes["TOKEN_EXPIRED"] = "TOKEN_EXPIRED";
    ErrorCodes["TOKEN_INVALID"] = "TOKEN_INVALID";
    ErrorCodes["SESSION_EXPIRED"] = "SESSION_EXPIRED";
    ErrorCodes["USER_NOT_FOUND"] = "USER_NOT_FOUND";
    // Database (3000-3099)
    ErrorCodes["DB_CONNECTION_FAILED"] = "DB_CONNECTION_FAILED";
    ErrorCodes["DB_QUERY_FAILED"] = "DB_QUERY_FAILED";
    ErrorCodes["DB_CONSTRAINT_VIOLATION"] = "DB_CONSTRAINT_VIOLATION";
    ErrorCodes["DB_TRANSACTION_FAILED"] = "DB_TRANSACTION_FAILED";
    ErrorCodes["DB_ERROR"] = "DB_ERROR";
    // External Services (4000-4099)
    ErrorCodes["EXTERNAL_API_ERROR"] = "EXTERNAL_API_ERROR";
    ErrorCodes["PAYMENT_PROVIDER_ERROR"] = "PAYMENT_PROVIDER_ERROR";
    ErrorCodes["EMAIL_SERVICE_ERROR"] = "EMAIL_SERVICE_ERROR";
    ErrorCodes["EXTERNAL_SERVICE_ERROR"] = "EXTERNAL_SERVICE_ERROR";
    // System (5000-5099)
    ErrorCodes["SERVER_ERROR"] = "SERVER_ERROR";
    ErrorCodes["SERVICE_UNAVAILABLE"] = "SERVICE_UNAVAILABLE";
    ErrorCodes["TIMEOUT"] = "TIMEOUT";
    ErrorCodes["MEMORY_LIMIT"] = "MEMORY_LIMIT";
    ErrorCodes["INTERNAL_ERROR"] = "INTERNAL_ERROR";
    // Domain Specific
    ErrorCodes["WALLET_INSUFFICIENT_FUNDS"] = "WALLET_INSUFFICIENT_FUNDS";
    ErrorCodes["WALLET_TRANSACTION_FAILED"] = "WALLET_TRANSACTION_FAILED";
    ErrorCodes["THREAD_LOCKED"] = "THREAD_LOCKED";
    ErrorCodes["USER_BANNED"] = "USER_BANNED";
})(ErrorCodes || (ErrorCodes = {}));
/**
 * Enhanced base error class with monitoring integration
 */
export class AppError extends Error {
    httpStatus;
    code;
    severity;
    details;
    context;
    timestamp;
    requestId;
    constructor(message, httpStatus = 500, code = ErrorCodes.SERVER_ERROR, severity = ErrorSeverity.MEDIUM, details, context) {
        super(message);
        this.httpStatus = httpStatus;
        this.code = code;
        this.severity = severity;
        this.details = details;
        this.context = context;
        this.name = 'AppError';
        this.timestamp = new Date().toISOString();
        this.requestId = context?.requestId;
        // Maintain stack trace
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, AppError);
        }
    }
    toJSON() {
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
    constructor(message = 'Bad request', details, context) {
        super(message, 400, ErrorCodes.BAD_REQUEST, ErrorSeverity.LOW, details, context);
    }
}
export class UnauthorizedError extends AppError {
    constructor(message = 'Authentication required', context) {
        super(message, 401, ErrorCodes.UNAUTHORIZED, ErrorSeverity.MEDIUM, undefined, context);
    }
}
export class ForbiddenError extends AppError {
    constructor(message = 'Access forbidden', context) {
        super(message, 403, ErrorCodes.FORBIDDEN, ErrorSeverity.MEDIUM, undefined, context);
    }
}
export class NotFoundError extends AppError {
    constructor(resource = 'Resource', context) {
        super(`${resource} not found`, 404, ErrorCodes.NOT_FOUND, ErrorSeverity.LOW, undefined, context);
    }
}
export class ConflictError extends AppError {
    constructor(message = 'Resource conflict', details, context) {
        super(message, 409, ErrorCodes.CONFLICT, ErrorSeverity.MEDIUM, details, context);
    }
}
export class ValidationError extends AppError {
    constructor(message = 'Validation failed', field, errors, context) {
        super(message, 400, ErrorCodes.VALIDATION_FAILED, ErrorSeverity.LOW, { field, errors }, context);
    }
}
export class RateLimitError extends AppError {
    constructor(message = 'Rate limit exceeded', retryAfter, context) {
        super(message, 429, ErrorCodes.RATE_LIMITED, ErrorSeverity.MEDIUM, { retryAfter }, context);
    }
}
// Business Logic Errors
export class InsufficientPermissionsError extends AppError {
    constructor(required, current, context) {
        super(`Insufficient permissions. Required: ${required}${current ? `, Current: ${current}` : ''}`, 403, ErrorCodes.INSUFFICIENT_PERMISSIONS, ErrorSeverity.MEDIUM, { required, current }, context);
    }
}
export class BusinessRuleViolationError extends AppError {
    constructor(rule, details, context) {
        super(`Business rule violation: ${rule}`, 400, ErrorCodes.BUSINESS_RULE_VIOLATION, ErrorSeverity.MEDIUM, details, context);
    }
}
// Database Errors
export class DatabaseError extends AppError {
    constructor(operation, originalError, context) {
        super(`Database operation failed: ${operation}`, 500, ErrorCodes.DB_QUERY_FAILED, ErrorSeverity.HIGH, { operation, originalError: originalError?.message }, context);
    }
}
// Domain Specific Errors
export class WalletError extends AppError {
    constructor(message, code, details, context) {
        super(message, 400, code, ErrorSeverity.MEDIUM, details, context);
    }
}
export class InsufficientFundsError extends WalletError {
    constructor(required, available, context) {
        super(`Insufficient funds. Required: ${required}, Available: ${available}`, ErrorCodes.WALLET_INSUFFICIENT_FUNDS, { required, available }, context);
    }
}
// Error utilities
export function createErrorContext(req) {
    return {
        userId: getUser(req)?.id,
        requestId: req.headers['x-request-id'],
        userAgent: req.headers['user-agent'],
        ip: req.ip || req.connection.remoteAddress,
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString()
    };
}
// Enhanced async handler with context
export const asyncHandler = (fn) => (req, res, next) => {
    const context = createErrorContext(req);
    Promise.resolve(fn(req, res, next)).catch((error) => {
        if (error instanceof AppError) {
            // Error already has context
            next(error);
        }
        else {
            // Wrap unknown errors with context
            next(new AppError(error.message || 'Unknown error', 500, ErrorCodes.SERVER_ERROR, ErrorSeverity.HIGH, { originalError: error.name }, context));
        }
    });
};
/**
 * Production-ready global error handler with monitoring integration
 */
export function globalErrorHandler(err, req, res, next) {
    const context = createErrorContext(req);
    let appError;
    // Convert to AppError if needed
    if (err instanceof AppError) {
        appError = err;
    }
    else {
        // Handle specific error types
        if (err.name === 'ValidationError') {
            appError = new ValidationError(err.message, undefined, undefined, context);
        }
        else if (err.name === 'CastError') {
            appError = new BadRequestError('Invalid ID format', { field: err.path }, context);
        }
        else if (err.name === 'SyntaxError') {
            appError = new BadRequestError('Invalid JSON syntax', undefined, context);
        }
        else {
            appError = new AppError(process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message, 500, ErrorCodes.SERVER_ERROR, ErrorSeverity.HIGH, process.env.NODE_ENV === 'production' ? undefined : { stack: err.stack }, context);
        }
    }
    // Structured logging with severity-based levels
    const logLevel = {
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
        logger.error('CRITICAL_ERROR_ALERT', `Critical error: ${appError.message}`, {
            code: appError.code,
            context: appError.context
        });
    }
    // Send structured response
    res.status(appError.httpStatus).json(appError.toJSON());
}
// Error factory functions for common scenarios
export const ErrorFactory = {
    notFound: (resource, req) => new NotFoundError(resource, req ? createErrorContext(req) : undefined),
    unauthorized: (message, req) => new UnauthorizedError(message, req ? createErrorContext(req) : undefined),
    forbidden: (required, current, req) => new InsufficientPermissionsError(required, current, req ? createErrorContext(req) : undefined),
    validation: (field, errors, req) => new ValidationError(`Validation failed for ${field}`, field, errors, req ? createErrorContext(req) : undefined),
    insufficientFunds: (required, available, req) => new InsufficientFundsError(required, available, req ? createErrorContext(req) : undefined),
    database: (operation, originalError, req) => new DatabaseError(operation, originalError, req ? createErrorContext(req) : undefined)
};
