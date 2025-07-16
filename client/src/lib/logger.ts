/**
 * Client-side logger utility
 * Provides structured logging with different levels and environments
 */

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
		if (this.shouldLog('error')) {
			console.error(this.formatMessage('error', component, message, context));
		}

		// In production, you might want to send errors to a monitoring service
		if (!this.isDevelopment && typeof window !== 'undefined') {
			// Example: Send to error tracking service
			// window.errorTracker?.captureException(new Error(message), { extra: context });
		}
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