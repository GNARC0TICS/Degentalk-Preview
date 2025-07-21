/**
 * Centralized Error Handling Service
 * Provides consistent error handling, logging, and user feedback
 */

import { toast } from 'sonner';
import { captureException, trackEvent } from '@/lib/sentry';

/**
 * Unified error reporter that logs locally and sends to Sentry
 */
export function reportError(error: unknown, context?: Record<string, any>) {
	// Always log locally
	const errorMessage = error instanceof Error ? error.message : String(error);
	const errorName = error instanceof Error ? error.name : 'UnknownError';
	
	console.error('[ErrorService]', errorMessage, context);
	
	// Send to Sentry in production
	if (process.env.NODE_ENV === 'production') {
		captureException(error as Error, { 
			extra: context,
			tags: {
				errorType: errorName,
				service: context?.service || 'unknown'
			}
		});
	}
}

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';
export type ErrorCategory =
	| 'network'
	| 'validation'
	| 'permission'
	| 'business'
	| 'system'
	| 'payment';

export interface AppError {
	id: string;
	message: string;
	category: ErrorCategory;
	severity: ErrorSeverity;
	code?: string;
	details?: Record<string, unknown>;
	timestamp: string;
	userId?: string;
	context?: string;
	stackTrace?: string;
}

export interface ErrorHandler {
	handle(error: Error | AppError, context?: string): void;
	log(error: AppError): void;
	notify(error: AppError): void;
	report(error: AppError): void;
}

class ErrorService implements ErrorHandler {
	private errors: AppError[] = [];
	private maxStoredErrors = 100;

	/**
	 * Main error handling entry point
	 */
	handle(error: Error | AppError, context?: string): void {
		const appError = this.normalizeError(error, context);

		// Store error
		this.storeError(appError);

		// Log error
		this.log(appError);

		// Notify user if appropriate
		this.notify(appError);

		// Report to external service if critical
		if (appError.severity === 'critical' || appError.severity === 'high') {
			this.report(appError);
		}
	}

	/**
	 * Convert any error to standardized AppError format
	 */
	private normalizeError(error: Error | AppError, context?: string): AppError {
		if ('id' in error && 'category' in error) {
			return error as AppError;
		}

		const baseError = error as Error;
		return {
			id: this.generateErrorId(),
			message: baseError.message || 'An unknown error occurred',
			category: this.categorizeError(baseError),
			severity: this.determineSeverity(baseError),
			timestamp: new Date().toISOString(),
			context,
			stackTrace: baseError.stack
		};
	}

	/**
	 * Generate unique error ID
	 */
	private generateErrorId(): string {
		return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	}

	/**
	 * Categorize error based on message and type
	 */
	private categorizeError(error: Error): ErrorCategory {
		const message = error.message.toLowerCase();

		if (
			message.includes('network') ||
			message.includes('fetch') ||
			message.includes('connection')
		) {
			return 'network';
		}
		if (
			message.includes('validation') ||
			message.includes('invalid') ||
			message.includes('required')
		) {
			return 'validation';
		}
		if (
			message.includes('permission') ||
			message.includes('unauthorized') ||
			message.includes('forbidden')
		) {
			return 'permission';
		}
		if (
			message.includes('payment') ||
			message.includes('ccpayment') ||
			message.includes('wallet')
		) {
			return 'payment';
		}
		if (error.name === 'TypeError' || error.name === 'ReferenceError') {
			return 'system';
		}

		return 'business';
	}

	/**
	 * Determine error severity
	 */
	private determineSeverity(error: Error): ErrorSeverity {
		const message = error.message.toLowerCase();

		// Critical errors
		if (
			message.includes('payment') ||
			message.includes('unauthorized') ||
			message.includes('security')
		) {
			return 'critical';
		}

		// High severity
		if (error.name === 'TypeError' || message.includes('database') || message.includes('server')) {
			return 'high';
		}

		// Medium severity
		if (message.includes('validation') || message.includes('network')) {
			return 'medium';
		}

		return 'low';
	}

	/**
	 * Store error in memory (implement persistent storage as needed)
	 */
	private storeError(error: AppError): void {
		this.errors.unshift(error);

		// Keep only recent errors
		if (this.errors.length > this.maxStoredErrors) {
			this.errors = this.errors.slice(0, this.maxStoredErrors);
		}
	}

	/**
	 * Log error to console with appropriate level
	 */
	log(error: AppError): void {
		const logData = {
			id: error.id,
			message: error.message,
			category: error.category,
			severity: error.severity,
			context: error.context,
			timestamp: error.timestamp,
			details: error.details,
			userId: error.userId
		};

		// Use reportError for all error logging
		const errorWithMetadata = new Error(error.message);
		errorWithMetadata.name = `${error.severity.toUpperCase()}_${error.category}`;
		if (error.stackTrace) {
			errorWithMetadata.stack = error.stackTrace;
		}

		reportError(errorWithMetadata, {
			service: 'ErrorService',
			severity: error.severity,
			category: error.category,
			errorId: error.id,
			...logData
		});

		// Additional development logging
		if (process.env.NODE_ENV === 'development' && error.stackTrace) {
			console.debug('Stack trace:', error.stackTrace);
		}
	}

	/**
	 * Show user-friendly notification
	 */
	notify(error: AppError): void {
		const shouldNotify = error.severity !== 'low' && !error.message.includes('AbortError');

		if (!shouldNotify) return;

		const userMessage = this.getUserFriendlyMessage(error);

		switch (error.severity) {
			case 'critical':
				toast.error(userMessage, {
					duration: 10000,
					action: {
						label: 'Report',
						onClick: () => this.openErrorReport(error)
					}
				});
				break;
			case 'high':
				toast.error(userMessage, { duration: 7000 });
				break;
			case 'medium':
				toast.warning(userMessage, { duration: 5000 });
				break;
		}
	}

	/**
	 * Convert technical error to user-friendly message
	 */
	private getUserFriendlyMessage(error: AppError): string {
		switch (error.category) {
			case 'network':
				return 'Connection issue. Please check your internet and try again.';
			case 'validation':
				return error.message || 'Please check your input and try again.';
			case 'permission':
				return "You don't have permission for this action. Contact support if needed.";
			case 'payment':
				return 'Payment processing error. Please try again or contact support.';
			case 'business':
				return error.message || 'An error occurred. Please try again.';
			case 'system':
				return 'A technical error occurred. Our team has been notified.';
			default:
				return 'Something went wrong. Please try again.';
		}
	}

	/**
	 * Report error to external monitoring service
	 */
	report(error: AppError): void {
		// Create proper error object
		const reportableError = new Error(error.message);
		reportableError.name = `AppError:${error.category}`;
		if (error.stackTrace) {
			reportableError.stack = error.stackTrace;
		}

		// Use unified reporter
		reportError(reportableError, {
			service: 'ErrorReport',
			errorId: error.id,
			category: error.category,
			severity: error.severity,
			code: error.code || 'unknown',
			details: error.details,
			context: error.context,
			timestamp: error.timestamp,
			userId: error.userId
		});

		// Track error occurrence for analytics
		if (process.env.NODE_ENV === 'production') {
			trackEvent('error_occurred', {
				category: error.category,
				severity: error.severity,
				context: error.context
			});
		}

		// For admin errors, also notify admin channels
		if (error.context?.includes('admin')) {
			this.notifyAdminChannel(error);
		}
	}

	/**
	 * Notify admin channel of critical errors
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	private notifyAdminChannel(_error: AppError): void {
		// TODO: send notification via Slack webhook
	}

	/**
	 * Open error report dialog/modal
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	private openErrorReport(_error: AppError): void {
		// TODO: open error reporting UI
	}

	/**
	 * Get recent errors for debugging
	 */
	getRecentErrors(limit = 10): AppError[] {
		return this.errors.slice(0, limit);
	}

	/**
	 * Clear stored errors
	 */
	clearErrors(): void {
		this.errors = [];
	}

	/**
	 * Get error statistics
	 */
	getErrorStats(): {
		total: number;
		byCategory: Record<ErrorCategory, number>;
		bySeverity: Record<ErrorSeverity, number>;
	} {
		const stats = {
			total: this.errors.length,
			byCategory: {} as Record<ErrorCategory, number>,
			bySeverity: {} as Record<ErrorSeverity, number>
		};

		this.errors.forEach((error) => {
			stats.byCategory[error.category] = (stats.byCategory[error.category] || 0) + 1;
			stats.bySeverity[error.severity] = (stats.bySeverity[error.severity] || 0) + 1;
		});

		return stats;
	}
}

// Export singleton instance
export const errorService = new ErrorService();

/**
 * React hook for error handling
 */
export function useErrorHandler() {
	return {
		handleError: (error: Error, context?: string) => errorService.handle(error, context),
		getRecentErrors: () => errorService.getRecentErrors(),
		clearErrors: () => errorService.clearErrors(),
		getStats: () => errorService.getErrorStats()
	};
}

/**
 * Async operation wrapper with error handling
 */
export async function withErrorHandling<T>(
	operation: () => Promise<T>,
	context?: string
): Promise<T> {
	try {
		return await operation();
	} catch (error) {
		errorService.handle(error as Error, context);
		throw error; // Re-throw to allow caller to handle if needed
	}
}
