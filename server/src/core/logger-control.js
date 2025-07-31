/**
 * Runtime Logger Control
 *
 * Allows dynamic control of logging without restarting the server
 */
import { logger } from './logger';
class LoggerControl {
    static instance;
    overrides = {};
    constructor() { }
    static getInstance() {
        if (!LoggerControl.instance) {
            LoggerControl.instance = new LoggerControl();
        }
        return LoggerControl.instance;
    }
    /**
     * Temporarily suppress specific log categories
     */
    suppress(...categories) {
        this.overrides.suppressCategories = [
            ...(this.overrides.suppressCategories || []),
            ...categories
        ];
        logger.info('LoggerControl', `Suppressed categories: ${categories.join(', ')}`);
    }
    /**
     * Remove category suppression
     */
    unsuppress(...categories) {
        if (!this.overrides.suppressCategories)
            return;
        this.overrides.suppressCategories = this.overrides.suppressCategories.filter(cat => !categories.includes(cat));
        logger.info('LoggerControl', `Unsuppressed categories: ${categories.join(', ')}`);
    }
    /**
     * Only show specific categories
     */
    showOnly(...categories) {
        this.overrides.onlyShowCategories = categories;
        logger.info('LoggerControl', `Showing only: ${categories.join(', ')}`);
    }
    /**
     * Show all categories
     */
    showAll() {
        this.overrides.onlyShowCategories = undefined;
        logger.info('LoggerControl', 'Showing all categories');
    }
    /**
     * Set minimum log level
     */
    setMinLevel(level) {
        this.overrides.minLevel = level;
        logger.info('LoggerControl', `Set minimum log level to: ${level}`);
    }
    /**
     * Reset all overrides
     */
    reset() {
        this.overrides = {};
        logger.info('LoggerControl', 'Reset all logging overrides');
    }
    /**
     * Get current overrides
     */
    getOverrides() {
        return this.overrides;
    }
    /**
     * Apply overrides to logger config
     */
    applyToConfig(baseConfig) {
        return {
            ...baseConfig,
            ...this.overrides,
            suppressCategories: [
                ...(baseConfig.suppressCategories || []),
                ...(this.overrides.suppressCategories || [])
            ]
        };
    }
}
// Export singleton instance
export const loggerControl = LoggerControl.getInstance();
// Make it available globally in development
if (process.env.NODE_ENV !== 'production') {
    global.loggerControl = loggerControl;
}
