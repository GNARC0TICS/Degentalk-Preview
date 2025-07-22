/**
 * Unified Server Error Reporting
 * Centralizes error logging and Sentry reporting for the server
 */

import { logger, LogLevel, LogAction } from '../core/logger';
import { captureException as sentryCaptureException } from './sentry-server';
import type { Request, Response, NextFunction } from 'express';
import { getAuthenticatedUser } from '../core/utils/auth.helpers';
import type { UserId } from '@shared/types/ids';

export interface ErrorContext {
  route?: string;
  userId?: UserId;
  method?: string;
  action?: LogAction;
  service?: string;
  operation?: string;
  data?: Record<string, any>;
  request?: Request;
  // Additional metadata
  statusCode?: number;
  errorCode?: string;
  stack?: string;
  headers?: Record<string, string | string[] | undefined>;
  body?: any;
  query?: any;
  params?: any;
  ip?: string;
  userAgent?: string;
}

/**
 * Unified error reporter that logs locally and sends to Sentry
 * This is the server-side equivalent of the client reportError function
 */
export async function reportErrorServer(
  error: unknown,
  context?: ErrorContext
): Promise<void> {
  // Extract error details
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorName = error instanceof Error ? error.name : 'UnknownError';
  const errorStack = error instanceof Error ? error.stack : context?.stack;
  const errorCode = context?.errorCode || (error as any)?.code || 'UNKNOWN_ERROR';
  const statusCode = context?.statusCode || (error as any)?.status || (error as any)?.statusCode || 500;
  
  // Extract user ID from request if available
  let userId: UserId | null = context?.userId || null;
  if (!userId && context?.request) {
    try {
      const user = getAuthenticatedUser(context.request);
      userId = user?.id || null;
    } catch {
      // Ignore auth errors in error reporter
    }
  }
  
  // Extract request metadata if available
  const requestMetadata = context?.request ? {
    url: context.request.originalUrl || context.request.url,
    method: context.request.method,
    ip: context.request.ip || context.request.connection?.remoteAddress,
    userAgent: context.request.headers['user-agent'],
    referer: context.request.headers['referer'],
    headers: sanitizeHeaders(context.request.headers),
    body: sanitizeBody(context.request.body),
    query: context.request.query,
    params: context.request.params,
    sessionId: context.request.sessionID,
  } : {};
  
  // Determine log level based on error type and status code
  const logLevel = determineLogLevel(error, statusCode);
  const logAction = context?.action || LogAction.API_ERROR;
  
  // Build comprehensive error data
  const errorData = {
    error: {
      name: errorName,
      message: errorMessage,
      code: errorCode,
      stack: errorStack,
      statusCode,
    },
    context: {
      service: context?.service || 'unknown',
      operation: context?.operation || 'unknown',
      route: context?.route || requestMetadata.url || 'unknown',
      method: context?.method || requestMetadata.method || 'unknown',
      userId,
      ip: context?.ip || requestMetadata.ip,
      userAgent: context?.userAgent || requestMetadata.userAgent,
      ...requestMetadata,
      ...context?.data,
    },
    timestamp: new Date().toISOString(),
  };
  
  // Log locally with structured data
  try {
    // Use the logger's API correctly
    if (typeof logger.error === 'function' && logLevel === LogLevel.ERROR) {
      logger.error(`[${errorData.context.service}] ${errorData.context.method} ${errorData.context.route} - ${errorName}: ${errorMessage}`, errorData);
    } else if (typeof logger.warn === 'function' && logLevel === LogLevel.WARN) {
      logger.warn(`[${errorData.context.service}] ${errorData.context.method} ${errorData.context.route} - ${errorName}: ${errorMessage}`, errorData);
    } else if (typeof logger.info === 'function' && logLevel === LogLevel.INFO) {
      logger.info(`[${errorData.context.service}] ${errorData.context.method} ${errorData.context.route} - ${errorName}: ${errorMessage}`, errorData);
    } else if (typeof logger.log === 'function') {
      // Fallback if specific methods don't exist
      logger.log(logLevel, `[${errorData.context.service}] ${errorData.context.method} ${errorData.context.route} - ${errorName}: ${errorMessage}`, errorData);
    } else {
      // Last resort
      console.error('[FALLBACK] Logger methods not available', errorData);
    }
  } catch (loggingError) {
    // Prevent logger failures from crashing the server
    // Always fall back to console so you don't lose the original error
    console.error('[LOGGER ERROR] Failed to report server error:', loggingError);
    console.error('[ORIGINAL ERROR]', error);
    console.error('[ERROR DATA]', errorData);
  }
  
  // Send to Sentry (always in production, selectively in other environments)
  if (process.env.NODE_ENV === 'production' || shouldReportError(error, statusCode)) {
    sentryCaptureException(error as Error, {
      level: mapLogLevelToSentry(logLevel),
      tags: {
        errorType: errorName,
        errorCode,
        statusCode: String(statusCode),
        route: errorData.context.route,
        method: errorData.context.method,
        service: errorData.context.service,
        operation: errorData.context.operation,
      },
      extra: errorData,
      user: userId || undefined,
    });
  }
}

/**
 * Sanitize headers to remove sensitive information
 */
function sanitizeHeaders(headers: any): Record<string, string | string[] | undefined> {
  const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key', 'x-auth-token'];
  const sanitized: Record<string, string | string[] | undefined> = {};
  
  for (const [key, value] of Object.entries(headers)) {
    if (sensitiveHeaders.includes(key.toLowerCase())) {
      sanitized[key] = '[REDACTED]';
    } else {
      sanitized[key] = value as string | string[] | undefined;
    }
  }
  
  return sanitized;
}

/**
 * Sanitize request body to remove sensitive information
 */
function sanitizeBody(body: any): any {
  if (!body || typeof body !== 'object') return body;
  
  const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'privateKey', 'creditCard', 'ssn'];
  const sanitized = { ...body };
  
  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = '[REDACTED]';
    }
  }
  
  return sanitized;
}

/**
 * Determine appropriate log level based on error type and status code
 */
function determineLogLevel(error: unknown, statusCode?: number): LogLevel {
  // Use status code if available
  if (statusCode) {
    if (statusCode >= 500) return LogLevel.ERROR;
    if (statusCode >= 400) return LogLevel.WARN;
    return LogLevel.INFO;
  }
  
  if (!(error instanceof Error)) return LogLevel.ERROR;
  
  const errorName = error.name;
  const errorMessage = error.message.toLowerCase();
  
  // Critical errors
  if (
    errorMessage.includes('database') ||
    errorMessage.includes('connection') ||
    errorName === 'TypeError' ||
    errorName === 'ReferenceError'
  ) {
    return LogLevel.ERROR;
  }
  
  // Warnings
  if (
    errorName === 'ValidationError' ||
    errorName === 'AuthenticationError' ||
    errorMessage.includes('unauthorized') ||
    errorMessage.includes('forbidden')
  ) {
    return LogLevel.WARN;
  }
  
  // Info level for expected errors
  if (
    errorName === 'NotFoundError' ||
    errorMessage.includes('not found')
  ) {
    return LogLevel.INFO;
  }
  
  return LogLevel.ERROR;
}

/**
 * Determine if error should be reported to Sentry
 */
function shouldReportError(error: unknown, statusCode?: number): boolean {
  // Always report in production
  if (process.env.NODE_ENV === 'production') return true;
  
  // In development, only report server errors
  if (statusCode && statusCode >= 500) return true;
  
  if (!(error instanceof Error)) return true;
  
  const errorName = error.name;
  const errorMessage = error.message.toLowerCase();
  
  // Don't report client errors in development
  if (
    errorName === 'ValidationError' ||
    errorName === 'NotFoundError' ||
    errorName === 'BadRequestError' ||
    errorMessage.includes('invalid input') ||
    errorMessage.includes('bad request') ||
    statusCode && statusCode < 500
  ) {
    return false;
  }
  
  // Always report critical errors
  if (
    errorName === 'TypeError' ||
    errorName === 'ReferenceError' ||
    errorMessage.includes('database') ||
    errorMessage.includes('connection') ||
    errorMessage.includes('fatal') ||
    errorMessage.includes('critical')
  ) {
    return true;
  }
  
  return false;
}

/**
 * Map internal log levels to Sentry severity levels
 */
function mapLogLevelToSentry(level: LogLevel): 'fatal' | 'error' | 'warning' | 'info' {
  switch (level) {
    case LogLevel.ERROR:
      return 'error';
    case LogLevel.WARN:
      return 'warning';
    case LogLevel.INFO:
      return 'info';
    default:
      return 'info';
  }
}

/**
 * Wrap async route handlers to automatically report errors
 */
export function asyncHandlerWithReporting(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>,
  options?: {
    service?: string;
    operation?: string;
    action?: LogAction;
  }
): (req: Request, res: Response, next: NextFunction) => Promise<void> {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const startTime = Date.now();
    
    try {
      await fn(req, res, next);
    } catch (error) {
      const duration = Date.now() - startTime;
      
      // Extract additional context from the error
      const statusCode = (error as any)?.status || (error as any)?.statusCode || 500;
      
      await reportErrorServer(error, {
        route: req.originalUrl || req.url,
        method: req.method,
        request: req,
        service: options?.service || 'api',
        operation: options?.operation || fn.name || 'unknown',
        action: options?.action,
        statusCode,
        data: {
          duration: `${duration}ms`,
          timestamp: new Date().toISOString(),
        },
      });
      
      // Pass error to Express error handler
      next(error);
    }
  };
}

/**
 * Create a service-specific error reporter
 */
export function createServiceReporter(serviceName: string) {
  return async function reportServiceError(
    error: unknown,
    operation: string,
    context?: Omit<ErrorContext, 'service' | 'operation'>
  ): Promise<void> {
    await reportErrorServer(error, {
      ...context,
      service: serviceName,
      operation,
    });
  };
}