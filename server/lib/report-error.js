/**
 * Error reporting stub
 * TODO: Implement proper error reporting (e.g., Sentry integration)
 */
import { logger } from '@core/logger';
export function reportErrorServer(error, context) {
    logger.error('Error reported', {
        error: error.message,
        stack: error.stack,
        ...context
    });
}
export function reportError(error, context) {
    reportErrorServer(error, context);
}
export function createServiceReporter(serviceName) {
    return (error, context) => {
        reportErrorServer(error, { ...context, service: serviceName });
    };
}
export function asyncHandlerWithReporting(fn) {
    return async (req, res, next) => {
        try {
            await fn(req, res, next);
        }
        catch (error) {
            reportErrorServer(error, {
                action: 'async-handler',
                metadata: { path: req.path, method: req.method }
            });
            next(error);
        }
    };
}
