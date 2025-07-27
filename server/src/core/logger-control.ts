/**
 * Runtime Logger Control
 * 
 * Allows dynamic control of logging without restarting the server
 */

import { logger, LogLevel } from './logger';
import { getLoggerConfig } from './logger-config';

class LoggerControl {
  private static instance: LoggerControl;
  private overrides: {
    suppressCategories?: string[];
    onlyShowCategories?: string[];
    minLevel?: LogLevel;
  } = {};

  private constructor() {}

  static getInstance(): LoggerControl {
    if (!LoggerControl.instance) {
      LoggerControl.instance = new LoggerControl();
    }
    return LoggerControl.instance;
  }

  /**
   * Temporarily suppress specific log categories
   */
  suppress(...categories: string[]) {
    this.overrides.suppressCategories = [
      ...(this.overrides.suppressCategories || []),
      ...categories
    ];
    logger.info('LoggerControl', `Suppressed categories: ${categories.join(', ')}`);
  }

  /**
   * Remove category suppression
   */
  unsuppress(...categories: string[]) {
    if (!this.overrides.suppressCategories) return;
    
    this.overrides.suppressCategories = this.overrides.suppressCategories.filter(
      cat => !categories.includes(cat)
    );
    logger.info('LoggerControl', `Unsuppressed categories: ${categories.join(', ')}`);
  }

  /**
   * Only show specific categories
   */
  showOnly(...categories: string[]) {
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
  setMinLevel(level: LogLevel) {
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
  applyToConfig(baseConfig: any) {
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
  (global as any).loggerControl = loggerControl;
}