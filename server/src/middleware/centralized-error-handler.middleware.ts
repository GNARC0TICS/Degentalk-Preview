/**
 * Centralized Error Handler Middleware
 * Production-grade error handling with Sentry integration
 */

import type { Request, Response, NextFunction } from 'express';
import { reportErrorServer, type ErrorContext } from '@server/lib/report-error';
import { sendErrorResponse } from '../core/utils/transformer.helpers';
import { logger, LogAction } from '../core/logger';
import type { UserId } from '@shared/types/ids';

// Extended error interface for custom properties
interface ExtendedError extends Error {
  status?: number;
  statusCode?: number;
  code?: string;
  field?: string;
  value?: any;
  resource?: string;
  id?: string;
  service?: string;
  operation?: string;
  retryAfter?: number;
  isOperational?: boolean;
}

/**
 * Main centralized error handler middleware
 */
export async function centralizedErrorHandler(
  err: ExtendedError,
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  // Prevent double responses
  if (res.headersSent) {
    return next(err);
  }

  // Extract error details
  const statusCode = err.status || err.statusCode || 500;
  const errorCode = err.code || err.name || 'UNKNOWN_ERROR';
  const isOperational = err.isOperational ?? (statusCode < 500);
  
  // Build comprehensive error context
  const errorContext: ErrorContext = {
    route: req.originalUrl || req.url,
    method: req.method,
    request: req,
    statusCode,
    errorCode,
    service: err.service || 'api',
    operation: err.operation || 'request',
    action: determineLogAction(err, req),
    data: {
      field: err.field,
      value: err.value,
      resource: err.resource,
      resourceId: err.id,
      isOperational,
      requestId: req.id || generateRequestId(),
      timestamp: new Date().toISOString(),
    },
  };

  // Report error to logging and Sentry
  await reportErrorServer(err, errorContext);

  // Set additional headers for specific error types
  if (err.name === 'RateLimitError' && err.retryAfter) {
    res.setHeader('Retry-After', String(err.retryAfter));
    res.setHeader('X-RateLimit-Limit', '100');
    res.setHeader('X-RateLimit-Remaining', '0');
    res.setHeader('X-RateLimit-Reset', String(Date.now() + err.retryAfter * 1000));
  }

  // Build user-friendly error message
  const userMessage = getUserFriendlyMessage(err, statusCode);
  
  // Send standardized error response
  sendErrorResponse(res, userMessage, statusCode, {
    code: errorCode,
    ...(process.env.NODE_ENV === 'development' && {
      debug: {
        name: err.name,
        message: err.message,
        stack: err.stack,
        field: err.field,
        resource: err.resource,
        resourceId: err.id,
      },
    }),
  });
}

/**
 * Determine appropriate log action based on error and request
 */
function determineLogAction(err: ExtendedError, req: Request): LogAction {
  const path = req.originalUrl || req.url || '';
  
  if (err.name === 'AuthenticationError' || path.includes('/auth')) {
    return LogAction.USER_LOGIN;
  }
  
  if (err.name === 'PaymentError' || path.includes('/wallet') || path.includes('/payment')) {
    return LogAction.WALLET_TRANSACTION;
  }
  
  if (path.includes('/admin')) {
    return LogAction.ADMIN_ACTION;
  }
  
  if (path.includes('/api/')) {
    return LogAction.API_ERROR;
  }
  
  return LogAction.CUSTOM;
}

/**
 * Create user-friendly error message based on error type
 */
function getUserFriendlyMessage(err: ExtendedError, statusCode: number): string {
  // In production, don't expose internal errors
  if (process.env.NODE_ENV === 'production' && statusCode >= 500) {
    return 'An internal error occurred. Please try again later.';
  }
  
  // Map specific error types to friendly messages
  const errorMessageMap: Record<string, string> = {
    ValidationError: err.message || 'The provided data is invalid. Please check your input.',
    AuthenticationError: 'Authentication required. Please log in to continue.',
    AuthorizationError: 'You do not have permission to perform this action.',
    NotFoundError: err.message || 'The requested resource was not found.',
    ConflictError: 'This operation conflicts with existing data.',
    RateLimitError: 'Too many requests. Please slow down and try again later.',
    PaymentError: 'Payment processing error. Please try again or contact support.',
    DatabaseError: 'Database operation failed. Please try again later.',
    ExternalServiceError: 'External service is unavailable. Please try again later.',
  };
  
  const friendlyMessage = errorMessageMap[err.name];
  if (friendlyMessage) {
    return friendlyMessage;
  }
  
  // Sanitize technical details from error messages in production
  if (process.env.NODE_ENV === 'production' && err.message) {
    return err.message
      .replace(/\b(SELECT|INSERT|UPDATE|DELETE|FROM|WHERE|JOIN)\b/gi, '[QUERY]')
      .replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, '[IP]')
      .replace(/\/[\w\/]+\.(js|ts|jsx|tsx)/g, '[FILE]');
  }
  
  return err.message || 'An error occurred processing your request.';
}

/**
 * Generate a unique request ID if not present
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Not found (404) handler middleware
 */
export function notFoundHandler(req: Request, res: Response, next: NextFunction): void {
  const error = new Error(`Route ${req.method} ${req.originalUrl} not found`) as ExtendedError;
  error.name = 'NotFoundError';
  error.status = 404;
  error.resource = 'route';
  error.id = req.originalUrl;
  next(error);
}

/**
 * Create custom error classes for better error handling
 */
export class AppError extends Error implements ExtendedError {
  public readonly isOperational = true;
  
  constructor(
    message: string,
    public readonly status: number = 500,
    public readonly code?: string,
    public readonly service?: string,
    public readonly operation?: string
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public field?: string, public value?: any) {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found', public resource?: string, public id?: string) {
    super(message, 404, 'NOT_FOUND');
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict', public field?: string) {
    super(message, 409, 'CONFLICT');
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded', public retryAfter?: number) {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, originalError?: Error) {
    super(message, 500, 'DATABASE_ERROR');
    if (originalError) {
      this.stack = originalError.stack;
    }
  }
}

export class ExternalServiceError extends AppError {
  constructor(message: string, public serviceName?: string, public serviceStatus?: number) {
    super(message, 502, 'EXTERNAL_SERVICE_ERROR');
  }
}