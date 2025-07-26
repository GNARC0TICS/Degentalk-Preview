/**
 * Error reporting stub
 * TODO: Implement proper error reporting (e.g., Sentry integration)
 */

import { logger } from '@core/logger';

export interface ErrorContext {
  userId?: string;
  action?: string;
  metadata?: Record<string, any>;
}

export function reportErrorServer(error: Error, context?: ErrorContext): void {
  logger.error('Error reported', { 
    error: error.message, 
    stack: error.stack,
    ...context 
  });
}

export function reportError(error: Error, context?: ErrorContext): void {
  reportErrorServer(error, context);
}

export function createServiceReporter(serviceName: string) {
  return (error: Error, context?: ErrorContext) => {
    reportErrorServer(error, { ...context, service: serviceName });
  };
}

export function asyncHandlerWithReporting(fn: (req: any, res: any, next: any) => Promise<void>) {
  return async (req: any, res: any, next: any) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      reportErrorServer(error as Error, { 
        action: 'async-handler',
        metadata: { path: req.path, method: req.method }
      });
      next(error);
    }
  };
}