/**
 * Comprehensive Error Handling Middleware
 * Integrates logging, Sentry reporting, and user-friendly responses
 */

import type { Request, Response, NextFunction } from 'express';
import { logger, LogLevel, LogAction } from '../core/logger';
import { captureException } from '../lib/sentry-server';
import { getAuthenticatedUser } from '../utils/auth-helpers';
import type { UserId } from '@shared/types/ids';

// Error types
export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
    public value?: any
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends Error {
  constructor(message: string = 'Authentication required') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends Error {
  constructor(message: string = 'Insufficient permissions') {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends Error {
  constructor(
    message: string = 'Resource not found',
    public resource?: string,
    public id?: string
  ) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class RateLimitError extends Error {
  constructor(
    message: string = 'Rate limit exceeded',
    public retryAfter?: number
  ) {
    super(message);
    this.name = 'RateLimitError';
  }
}

export class ConflictError extends Error {
  constructor(
    message: string = 'Resource conflict',
    public conflictingField?: string
  ) {
    super(message);
    this.name = 'ConflictError';
  }
}

export class PaymentError extends Error {
  constructor(
    message: string = 'Payment processing error',
    public code?: string
  ) {
    super(message);
    this.name = 'PaymentError';
  }
}

export class ExternalServiceError extends Error {
  constructor(
    message: string = 'External service error',
    public service?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'ExternalServiceError';
  }
}

// Error response interface
interface ErrorResponse {
  error: {
    message: string;
    code?: string;
    field?: string;
    details?: any;
  };
  requestId: string;
  timestamp: string;
}

/**
 * Map error types to HTTP status codes
 */
function getStatusCode(error: any): number {
  if (error.status) return error.status;
  if (error.statusCode) return error.statusCode;
  
  switch (error.constructor) {
    case ValidationError:
      return 400;
    case AuthenticationError:
      return 401;
    case AuthorizationError:
      return 403;
    case NotFoundError:
      return 404;
    case ConflictError:
      return 409;
    case RateLimitError:
      return 429;
    case PaymentError:
      return 402;
    case ExternalServiceError:
      return 502;
    default:
      return 500;
  }
}

/**
 * Get appropriate log level based on error
 */
function getLogLevel(statusCode: number): LogLevel {
  if (statusCode >= 500) return LogLevel.ERROR;
  if (statusCode >= 400) return LogLevel.WARN;
  return LogLevel.INFO;
}

/**
 * Get log action based on error type
 */
function getLogAction(error: any, req: Request): LogAction {
  if (error instanceof AuthenticationError) return LogAction.USER_LOGIN;
  if (error instanceof PaymentError) return LogAction.WALLET_TRANSACTION;
  if (req.originalUrl.includes('/api/')) return LogAction.API_ERROR;
  return LogAction.CUSTOM;
}

/**
 * Create user-friendly error message
 */
function getUserMessage(error: any): string {
  // Don't expose internal errors to users
  const statusCode = getStatusCode(error);
  if (statusCode >= 500 && process.env.NODE_ENV === 'production') {
    return 'An internal error occurred. Please try again later.';
  }
  
  // Use custom error messages
  if (error.message) {
    // Sanitize technical details in production
    if (process.env.NODE_ENV === 'production') {
      return error.message.replace(/\b(SELECT|INSERT|UPDATE|DELETE|FROM|WHERE)\b/gi, '[QUERY]');
    }
    return error.message;
  }
  
  return 'An error occurred processing your request.';
}

/**
 * Main error handling middleware
 */
export async function errorHandler(
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  // Get request ID for tracking
  const requestId = req.id || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Get user info if available
  let userId: UserId | null = null;
  try {
    const user = await getAuthenticatedUser(req);
    userId = user?.id || null;
  } catch {
    // Ignore auth errors in error handler
  }
  
  // Determine error details
  const statusCode = getStatusCode(error);
  const logLevel = getLogLevel(statusCode);
  const logAction = getLogAction(error, req);
  const userMessage = getUserMessage(error);
  
  // Log the error with full context
  logger.log({
    level: logLevel,
    action: logAction,
    namespace: 'ERROR_HANDLER',
    message: `${req.method} ${req.originalUrl} - ${error.name}: ${error.message}`,
    data: {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
        code: error.code,
        statusCode,
      },
      request: {
        id: requestId,
        method: req.method,
        url: req.originalUrl,
        headers: {
          'user-agent': req.headers['user-agent'],
          'x-forwarded-for': req.headers['x-forwarded-for'],
        },
        query: req.query,
        body: process.env.NODE_ENV === 'development' ? req.body : '[REDACTED]',
        ip: req.ip,
      },
      user: userId ? { id: userId } : null,
      timestamp: new Date().toISOString(),
    },
  });
  
  // Report to Sentry for serious errors
  if (statusCode >= 500 || (statusCode === 402 && error instanceof PaymentError)) {
    captureException(error, {
      level: statusCode >= 500 ? 'error' : 'warning',
      tags: {
        requestId,
        statusCode: String(statusCode),
        errorType: error.name,
        endpoint: req.originalUrl,
        method: req.method,
      },
      extra: {
        query: req.query,
        headers: req.headers,
        user: userId,
      },
      user: userId || undefined,
    });
  }
  
  // Special handling for specific errors
  if (error instanceof RateLimitError && error.retryAfter) {
    res.setHeader('Retry-After', String(error.retryAfter));
    res.setHeader('X-RateLimit-Limit', '100');
    res.setHeader('X-RateLimit-Remaining', '0');
    res.setHeader('X-RateLimit-Reset', String(Date.now() + error.retryAfter * 1000));
  }
  
  // Build error response
  const errorResponse: ErrorResponse = {
    error: {
      message: userMessage,
      code: error.code || error.name,
    },
    requestId,
    timestamp: new Date().toISOString(),
  };
  
  // Add additional error details in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error.details = {
      name: error.name,
      stack: error.stack,
      originalMessage: error.message,
    };
    
    if (error instanceof ValidationError) {
      errorResponse.error.field = error.field;
    }
    
    if (error instanceof NotFoundError) {
      errorResponse.error.details.resource = error.resource;
      errorResponse.error.details.id = error.id;
    }
  }
  
  // Send error response
  res.status(statusCode).json(errorResponse);
}

/**
 * Not found handler for undefined routes
 */
export function notFoundHandler(req: Request, res: Response, next: NextFunction): void {
  const error = new NotFoundError(
    `Route ${req.method} ${req.originalUrl} not found`,
    'route',
    req.originalUrl
  );
  next(error);
}

/**
 * Async route wrapper to catch errors
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}