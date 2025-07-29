/**
 * Runtime Logger Control
 *
 * Allows dynamic control of logging without restarting the server
 */
import { LogLevel } from './logger';
declare class LoggerControl {
    private static instance;
    private overrides;
    private constructor();
    static getInstance(): LoggerControl;
    /**
     * Temporarily suppress specific log categories
     */
    suppress(...categories: string[]): void;
    /**
     * Remove category suppression
     */
    unsuppress(...categories: string[]): void;
    /**
     * Only show specific categories
     */
    showOnly(...categories: string[]): void;
    /**
     * Show all categories
     */
    showAll(): void;
    /**
     * Set minimum log level
     */
    setMinLevel(level: LogLevel): void;
    /**
     * Reset all overrides
     */
    reset(): void;
    /**
     * Get current overrides
     */
    getOverrides(): {
        suppressCategories?: string[];
        onlyShowCategories?: string[];
        minLevel?: LogLevel;
    };
    /**
     * Apply overrides to logger config
     */
    applyToConfig(baseConfig: any): any;
}
export declare const loggerControl: LoggerControl;
export {};
