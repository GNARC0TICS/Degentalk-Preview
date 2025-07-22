/**
 * Sentry Server-Side Configuration
 * Error tracking and APM for Node.js backend
 */

// import * as Sentry from '@sentry/node';
// import * as Tracing from '@sentry/tracing';
import type { Express } from 'express';
import { logger } from '../core/logger';
import type { UserId } from '@shared/types/ids';

// Environment configuration
const SENTRY_DSN = process.env.SENTRY_DSN || '';
const ENVIRONMENT = process.env.NODE_ENV || 'development';
const RELEASE = process.env.APP_VERSION || 'unknown';

/**
 * Initialize Sentry for the Express application
 */
export function initSentry(app: Express) {
  logger.info('SENTRY', 'Sentry temporarily disabled - packages not installed');
  return;
  
  /*
  if (!SENTRY_DSN || ENVIRONMENT === 'development') {
    logger.info('SENTRY', 'Skipping Sentry initialization in development');
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: ENVIRONMENT,
    release: RELEASE,
    
    integrations: [
      // HTTP calls tracing
      new Sentry.Integrations.Http({ tracing: true }),
      
      // Express middleware tracing
      new Tracing.Integrations.Express({
        app,
        // Trace specific routes
        router: true,
        // Trace static file serving
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      }),
      
      // Postgres query tracing
      new Tracing.Integrations.Postgres({
        usePgNative: false,
      }),
      
      // Console breadcrumbs
      new Sentry.Integrations.Console({
        levels: ['warn', 'error'],
      }),
      
      // Linked errors
      new Sentry.Integrations.LinkedErrors({
        key: 'cause',
        limit: 5,
      }),
      
      // Context lines in stack traces
      new Sentry.Integrations.ContextLines(),
      
      // Module metadata
      new Sentry.Integrations.Modules(),
      
      // Extra error data
      new Sentry.Integrations.ExtraErrorData({
        depth: 5,
      }),
    ],
    
    // Performance monitoring
    tracesSampleRate: ENVIRONMENT === 'production' ? 0.1 : 1.0,
    
    // Profile sample rate (1% of traces in production)
    profilesSampleRate: ENVIRONMENT === 'production' ? 0.01 : 0.1,
    
    // Session tracking
    autoSessionTracking: true,
    
    // Filtering
    ignoreErrors: [
      // Client errors
      'Network request failed',
      'NetworkError',
      'Failed to fetch',
      // Rate limiting
      'Too many requests',
      'Rate limit exceeded',
      // Client cancellations
      'AbortError',
      'Request aborted',
      // Validation errors (handled properly)
      'ValidationError',
      'Bad Request',
    ],
    
    // Transaction filtering
    ignoreTransactions: [
      '/health',
      '/metrics',
      '/favicon.ico',
    ],
    
    // Before send hook
    beforeSend(event, hint) {
      // Filter out non-critical errors in production
      if (ENVIRONMENT === 'production' && event.level === 'warning') {
        const error = hint.originalException;
        if (error && error instanceof Error && error.message.includes('deprecat')) {
          return null; // Don't send deprecation warnings
        }
      }
      
      // Sanitize sensitive data
      if (event.request) {
        // Remove auth headers
        if (event.request.headers) {
          delete event.request.headers['authorization'];
          delete event.request.headers['cookie'];
          delete event.request.headers['x-api-key'];
        }
        
        // Remove sensitive body fields
        if (event.request.data) {
          const sensitive = ['password', 'token', 'secret', 'apiKey', 'privateKey'];
          sensitive.forEach(field => {
            if (event.request.data[field]) {
              event.request.data[field] = '[REDACTED]';
            }
          });
        }
      }
      
      // Add custom context
      event.contexts = {
        ...event.contexts,
        runtime: {
          name: 'node',
          version: process.version,
        },
        app: {
          start_time: new Date().toISOString(),
          memory_usage: process.memoryUsage(),
        },
      };
      
      return event;
    },
    
    // Breadcrumb filtering
    beforeBreadcrumb(breadcrumb) {
      // Filter out noisy breadcrumbs
      if (breadcrumb.category === 'console' && breadcrumb.level === 'debug') {
        return null;
      }
      
      // Enhance HTTP breadcrumbs
      if (breadcrumb.category === 'http') {
        const url = breadcrumb.data?.url;
        if (url && (url.includes('/health') || url.includes('/metrics'))) {
          return null; // Don't track health checks
        }
      }
      
      return breadcrumb;
    },
  });

  logger.info('SENTRY', 'Sentry initialized successfully', {
    environment: ENVIRONMENT,
    release: RELEASE,
  });
  */
}

/**
 * Set user context for error tracking
 */
export function setSentryUser(userId: UserId | null, userData?: {
  username?: string;
  email?: string;
  role?: string;
}) {
  // Temporarily disabled - Sentry packages not installed
  logger.debug('SENTRY', 'setSentryUser called', { userId, userData });
}

/**
 * Add custom context to errors
 */
export function setSentryContext(key: string, context: Record<string, any>) {
  // Temporarily disabled - Sentry packages not installed
  logger.debug('SENTRY', 'setSentryContext called', { key, context });
}

/**
 * Create a transaction for performance monitoring
 */
export function startTransaction(name: string, op: string = 'http.server') {
  // Temporarily disabled - Sentry packages not installed
  logger.debug('SENTRY', 'startTransaction called', { name, op });
  return {
    startChild: (options: any) => ({
      setStatus: (status: string) => logger.debug('SENTRY', 'Span status', status),
      finish: () => logger.debug('SENTRY', 'Span finished')
    }),
    setStatus: (status: string) => logger.debug('SENTRY', 'Transaction status', status),
    finish: () => logger.debug('SENTRY', 'Transaction finished')
  };
}

/**
 * Capture exception with additional context
 */
export function captureException(
  error: Error,
  context?: {
    level?: string;
    tags?: Record<string, string>;
    extra?: Record<string, any>;
    user?: UserId;
  }
) {
  logger.error('SENTRY', `Exception: ${error.message}`, {
    error: error.stack,
    context,
  });
}

/**
 * Capture message with context
 */
export function captureMessage(
  message: string,
  level: string = 'info',
  context?: Record<string, any>
) {
  logger.info('SENTRY', `Message: ${message}`, { level, context });
}

/**
 * Profile an async function
 */
export async function profileAsync<T>(
  name: string,
  fn: () => Promise<T>,
  op: string = 'function'
): Promise<T> {
  const transaction = startTransaction(name, op);
  const span = transaction.startChild({
    op: `${op}.execute`,
    description: name,
  });
  
  try {
    const result = await fn();
    span.setStatus('ok');
    return result;
  } catch (error) {
    span.setStatus('internal_error');
    throw error;
  } finally {
    span.finish();
    transaction.finish();
  }
}

/**
 * Add breadcrumb for important actions
 */
export function addBreadcrumb(
  message: string,
  category: string = 'custom',
  level: string = 'info',
  data?: Record<string, any>
) {
  // Temporarily disabled - Sentry packages not installed
  logger.debug('SENTRY', 'addBreadcrumb called', { message, category, level, data });
}

/**
 * Sentry Express error handler middleware
 */
export const sentryErrorHandler = (error: any, req: any, res: any, next: any) => {
  // Temporarily disabled - Sentry packages not installed
  logger.error('SENTRY', 'Error handler called', { error: error.message });
  next(error);
};

/**
 * Sentry request handler middleware
 */
export const sentryRequestHandler = (req: any, res: any, next: any) => {
  // Temporarily disabled - Sentry packages not installed
  next();
};

/**
 * Sentry tracing handler middleware
 */
export const sentryTracingHandler = (req: any, res: any, next: any) => {
  // Temporarily disabled - Sentry packages not installed
  next();
};