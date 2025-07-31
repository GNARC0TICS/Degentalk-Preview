/**
 * Logger Configuration for Development
 *
 * Controls which log categories are enabled/disabled in development mode
 * to reduce console noise while maintaining useful debugging information.
 */
import { LoggerConfig } from './logger-types';
export declare const devLoggerConfig: LoggerConfig;
export declare const prodLoggerConfig: LoggerConfig;
export declare function getLoggerConfig(): LoggerConfig;
