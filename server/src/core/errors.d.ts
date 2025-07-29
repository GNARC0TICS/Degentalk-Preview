/**
 * Production Error System
 *
 * Centralized error handling with structured logging, error codes,
 * and consistent API responses. Optimized for debugging and monitoring.
 */
import type { Request, Response, NextFunction } from 'express';
export declare enum ErrorSeverity {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    CRITICAL = "critical"
}
export declare enum ErrorCodes {
    BAD_REQUEST = "BAD_REQUEST",
    UNAUTHORIZED = "UNAUTHORIZED",
    FORBIDDEN = "FORBIDDEN",
    NOT_FOUND = "NOT_FOUND",
    CONFLICT = "CONFLICT",
    VALIDATION_FAILED = "VALIDATION_FAILED",
    RATE_LIMITED = "RATE_LIMITED",
    INSUFFICIENT_PERMISSIONS = "INSUFFICIENT_PERMISSIONS",
    RESOURCE_LOCKED = "RESOURCE_LOCKED",
    OPERATION_NOT_ALLOWED = "OPERATION_NOT_ALLOWED",
    BUSINESS_RULE_VIOLATION = "BUSINESS_RULE_VIOLATION",
    INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
    TOKEN_EXPIRED = "TOKEN_EXPIRED",
    TOKEN_INVALID = "TOKEN_INVALID",
    SESSION_EXPIRED = "SESSION_EXPIRED",
    DB_CONNECTION_FAILED = "DB_CONNECTION_FAILED",
    DB_QUERY_FAILED = "DB_QUERY_FAILED",
    DB_CONSTRAINT_VIOLATION = "DB_CONSTRAINT_VIOLATION",
    DB_TRANSACTION_FAILED = "DB_TRANSACTION_FAILED",
    EXTERNAL_API_ERROR = "EXTERNAL_API_ERROR",
    PAYMENT_PROVIDER_ERROR = "PAYMENT_PROVIDER_ERROR",
    EMAIL_SERVICE_ERROR = "EMAIL_SERVICE_ERROR",
    SERVER_ERROR = "SERVER_ERROR",
    SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",
    TIMEOUT = "TIMEOUT",
    MEMORY_LIMIT = "MEMORY_LIMIT",
    WALLET_INSUFFICIENT_FUNDS = "WALLET_INSUFFICIENT_FUNDS",
    WALLET_TRANSACTION_FAILED = "WALLET_TRANSACTION_FAILED",
    THREAD_LOCKED = "THREAD_LOCKED",
    USER_BANNED = "USER_BANNED"
}
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
export declare class AppError extends Error {
    readonly httpStatus: number;
    readonly code: ErrorCodes;
    readonly severity: ErrorSeverity;
    readonly details?: unknown;
    readonly context?: ErrorContext | undefined;
    readonly timestamp: string;
    readonly requestId?: string;
    constructor(message: string, httpStatus?: number, code?: ErrorCodes, severity?: ErrorSeverity, details?: unknown, context?: ErrorContext | undefined);
    toJSON(): ErrorResponse;
}
export declare class BadRequestError extends AppError {
    constructor(message?: string, details?: unknown, context?: ErrorContext);
}
export declare class UnauthorizedError extends AppError {
    constructor(message?: string, context?: ErrorContext);
}
export declare class ForbiddenError extends AppError {
    constructor(message?: string, context?: ErrorContext);
}
export declare class NotFoundError extends AppError {
    constructor(resource?: string, context?: ErrorContext);
}
export declare class ConflictError extends AppError {
    constructor(message?: string, details?: unknown, context?: ErrorContext);
}
export declare class ValidationError extends AppError {
    constructor(message?: string, field?: string, errors?: unknown, context?: ErrorContext);
}
export declare class RateLimitError extends AppError {
    constructor(message?: string, retryAfter?: number, context?: ErrorContext);
}
export declare class InsufficientPermissionsError extends AppError {
    constructor(required: string, current?: string, context?: ErrorContext);
}
export declare class BusinessRuleViolationError extends AppError {
    constructor(rule: string, details?: unknown, context?: ErrorContext);
}
export declare class DatabaseError extends AppError {
    constructor(operation: string, originalError?: Error, context?: ErrorContext);
}
export declare class WalletError extends AppError {
    constructor(message: string, code: ErrorCodes, details?: unknown, context?: ErrorContext);
}
export declare class InsufficientFundsError extends WalletError {
    constructor(required: number, available: number, context?: ErrorContext);
}
export declare function createErrorContext(req: Request): ErrorContext;
export declare const asyncHandler: (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => (req: Request, res: Response, next: NextFunction) => void;
/**
 * Production-ready global error handler with monitoring integration
 */
export declare function globalErrorHandler(err: Error, req: Request, res: Response, next: NextFunction): void;
export declare const ErrorFactory: {
    notFound: (resource: string, req?: Request) => NotFoundError;
    unauthorized: (message?: string, req?: Request) => UnauthorizedError;
    forbidden: (required: string, current?: string, req?: Request) => InsufficientPermissionsError;
    validation: (field: string, errors: unknown, req?: Request) => ValidationError;
    insufficientFunds: (required: number, available: number, req?: Request) => InsufficientFundsError;
    database: (operation: string, originalError?: Error, req?: Request) => DatabaseError;
};
