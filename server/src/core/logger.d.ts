/**
 * ForumFusion - Consolidated Logging System
 *
 * This is the centralized logging utility for the entire application.
 * It handles different log levels, formats, and outputs (console, file).
 */
import { LogLevel, LogAction } from './logger-types';
export { LogLevel, LogAction } from './logger-types';
/**
 * Initialize the logger with custom configuration
 */
export declare function initLogger(customConfig?: {}): void;
/**
 * Main logging function
 */
export declare function log(options: {
    level: LogLevel;
    action?: LogAction;
    namespace?: string;
    message: string;
    data?: any;
}): void;
/**
 * Debug level logger
 */
export declare function debug(namespace: string, message: string, data?: any): void;
/**
 * Info level logger
 */
export declare function info(namespace: string, message: string, data?: any): void;
/**
 * Warning level logger
 */
export declare function warn(namespace: string, message: string, data?: any): void;
/**
 * Error level logger
 */
export declare function error(namespace: string, message: string, data?: any): void;
/**
 * Critical error level logger
 */
export declare function critical(namespace: string, message: string, data?: any): void;
export declare const logger: {
    debug: typeof debug;
    info: typeof info;
    warn: typeof warn;
    error: typeof error;
    critical: typeof critical;
    init: typeof initLogger;
};
