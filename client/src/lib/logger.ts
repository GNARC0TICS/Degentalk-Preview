/**
 * Client-side logger utility
 * Provides structured logging with different levels and environments
 */

import { reportError } from '@app/services/error.service';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
	[key: string]: any;
}

class ClientLogger {
	private isDevelopment = import.meta.env.DEV;
	private logLevel: LogLevel = this.isDevelopment ? 'debug' : 'warn';

	private shouldLog(level: LogLevel): boolean {
		const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
		const currentLevelIndex = levels.indexOf(this.logLevel);
		const messageLevelIndex = levels.indexOf(level);
		return messageLevelIndex >= currentLevelIndex;
	}

	private formatMessage(level: LogLevel, component: string, message: string, context?: LogContext): string {
		const timestamp = new Date().toISOString();
		const contextStr = context ? ` ${JSON.stringify(context)}` : '';
		return `[${timestamp}] [${level.toUpperCase()}] [${component}] ${message}${contextStr}`;
	}

	debug(component: string, message: string, context?: LogContext): void {
		if (this.shouldLog('debug')) {
			console.log(this.formatMessage('debug', component, message, context));
		}
	}

	info(component: string, message: string, context?: LogContext): void {
		if (this.shouldLog('info')) {
			console.info(this.formatMessage('info', component, message, context));
		}
	}

	warn(component: string, message: string, context?: LogContext): void {
		if (this.shouldLog('warn')) {
			console.warn(this.formatMessage('warn', component, message, context));
		}
	}

	error(component: string, message: string, context?: LogContext): void {
		const error = new Error(message);
		error.name = component;
		
		// Use unified error reporter
		reportError(error, {
			service: component,
			level: 'error',
			...context
		});
	}

	// Utility method for logging API errors
	apiError(component: string, endpoint: string, error: any): void {
		this.error(component, `API request failed: ${endpoint}`, {
			endpoint,
			message: error.message,
			status: error.status,
			response: error.response
		});
	}

	// Utility method for performance logging
	performance(component: string, operation: string, duration: number): void {
		if (this.isDevelopment) {
			this.debug(component, `Performance: ${operation}`, { duration: `${duration}ms` });
		}
	}
}

// Export singleton instance
export const logger = new ClientLogger();

// Export type for use in other files
export type { LogContext };