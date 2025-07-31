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
		const requestedLevelIndex = levels.indexOf(level);
		return requestedLevelIndex >= currentLevelIndex;
	}

	private formatMessage(component: string, message: string, context?: LogContext): string {
		const timestamp = new Date().toISOString();
		let formatted = `[${timestamp}] [${component}] ${message}`;
		
		if (context && Object.keys(context).length > 0) {
			formatted += ' | Context: ' + JSON.stringify(context);
		}
		
		return formatted;
	}

	debug(component: string, message: string, context?: LogContext): void {
		if (this.shouldLog('debug')) {
			console.debug(this.formatMessage(component, message, context));
		}
	}

	info(component: string, message: string, context?: LogContext): void {
		if (this.shouldLog('info')) {
			console.info(this.formatMessage(component, message, context));
		}
	}

	warn(component: string, message: string, context?: LogContext): void {
		if (this.shouldLog('warn')) {
			console.warn(this.formatMessage(component, message, context));
		}
	}

	error(component: string, message: string, context?: LogContext | Error): void {
		if (this.shouldLog('error')) {
			const errorContext = context instanceof Error ? 
				{ message: context.message, stack: context.stack } : 
				context;
			
			console.error(this.formatMessage(component, message, errorContext));
		}
	}

	setLogLevel(level: LogLevel): void {
		this.logLevel = level;
	}
}

export const logger = new ClientLogger();