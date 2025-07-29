/**
 * Error reporting stub
 * TODO: Implement proper error reporting (e.g., Sentry integration)
 */
export interface ErrorContext {
    userId?: string;
    action?: string;
    metadata?: Record<string, any>;
}
export declare function reportErrorServer(error: Error, context?: ErrorContext): void;
export declare function reportError(error: Error, context?: ErrorContext): void;
export declare function createServiceReporter(serviceName: string): (error: Error, context?: ErrorContext) => void;
export declare function asyncHandlerWithReporting(fn: (req: any, res: any, next: any) => Promise<void>): (req: any, res: any, next: any) => Promise<void>;
