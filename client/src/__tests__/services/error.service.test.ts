import { describe, it, expect, beforeEach, vi } from 'vitest';
import { errorService, useErrorHandler, withErrorHandling } from '@/services/error.service';
import type { AppError, ErrorCategory, ErrorSeverity } from '@/services/error.service';

// Mock console methods to avoid test output noise
const mockConsole = {
	error: vi.fn(),
	warn: vi.fn(),
	info: vi.fn(),
	group: vi.fn(),
	groupEnd: vi.fn()
};

vi.stubGlobal('console', mockConsole);

// Mock toast notifications
vi.mock('sonner', () => ({
	toast: {
		error: vi.fn(),
		warning: vi.fn(),
		info: vi.fn()
	}
}));

describe('ErrorService', () => {
	beforeEach(() => {
		errorService.clearErrors();
		vi.clearAllMocks();
	});

	describe('error normalization', () => {
		it('should normalize JavaScript Error to AppError', () => {
			const jsError = new Error('Test error message');

			errorService.handle(jsError, 'test-context');

			const recentErrors = errorService.getRecentErrors(1);
			expect(recentErrors).toHaveLength(1);

			const appError = recentErrors[0];
			expect(appError?.message).toBe('Test error message');
			expect(appError?.context).toBe('test-context');
			expect(appError.id).toMatch(/^err_\d+_[a-z0-9]+$/);
			expect(appError.timestamp).toBeDefined();
		});

		it('should handle AppError objects directly', () => {
			const appError: AppError = {
				id: 'custom-error-1',
				message: 'Custom error',
				category: 'business',
				severity: 'medium',
				timestamp: new Date().toISOString()
			};

			errorService.handle(appError);

			const recentErrors = errorService.getRecentErrors(1);
			expect(recentErrors[0].id).toBe('custom-error-1');
		});
	});

	describe('error categorization', () => {
		it('should categorize network errors correctly', () => {
			const networkError = new Error('Network request failed');

			errorService.handle(networkError);

			const recentErrors = errorService.getRecentErrors(1);
			expect(recentErrors[0].category).toBe('network');
		});

		it('should categorize validation errors correctly', () => {
			const validationError = new Error('Invalid email format');

			errorService.handle(validationError);

			const recentErrors = errorService.getRecentErrors(1);
			expect(recentErrors[0].category).toBe('validation');
		});

		it('should categorize permission errors correctly', () => {
			const permissionError = new Error('Unauthorized access');

			errorService.handle(permissionError);

			const recentErrors = errorService.getRecentErrors(1);
			expect(recentErrors[0].category).toBe('permission');
		});

		it('should categorize payment errors correctly', () => {
			const paymentError = new Error('Payment processing failed');

			errorService.handle(paymentError);

			const recentErrors = errorService.getRecentErrors(1);
			expect(recentErrors[0].category).toBe('payment');
		});

		it('should categorize system errors correctly', () => {
			const systemError = new TypeError('Cannot read property of undefined');

			errorService.handle(systemError);

			const recentErrors = errorService.getRecentErrors(1);
			expect(recentErrors[0].category).toBe('system');
		});

		it('should default to business category for unknown errors', () => {
			const unknownError = new Error('Some business logic error');

			errorService.handle(unknownError);

			const recentErrors = errorService.getRecentErrors(1);
			expect(recentErrors[0].category).toBe('business');
		});
	});

	describe('severity determination', () => {
		it('should assign critical severity to payment errors', () => {
			const paymentError = new Error('Payment gateway error');

			errorService.handle(paymentError);

			const recentErrors = errorService.getRecentErrors(1);
			expect(recentErrors[0].severity).toBe('critical');
		});

		it('should assign high severity to TypeErrors', () => {
			const typeError = new TypeError('Cannot access property');

			errorService.handle(typeError);

			const recentErrors = errorService.getRecentErrors(1);
			expect(recentErrors[0].severity).toBe('high');
		});

		it('should assign medium severity to validation errors', () => {
			const validationError = new Error('Validation failed');

			errorService.handle(validationError);

			const recentErrors = errorService.getRecentErrors(1);
			expect(recentErrors[0].severity).toBe('medium');
		});

		it('should assign low severity by default', () => {
			const generalError = new Error('Something happened');

			errorService.handle(generalError);

			const recentErrors = errorService.getRecentErrors(1);
			expect(recentErrors[0].severity).toBe('low');
		});
	});

	describe('error storage and retrieval', () => {
		it('should store errors and allow retrieval', () => {
			const error1 = new Error('First error');
			const error2 = new Error('Second error');

			errorService.handle(error1);
			errorService.handle(error2);

			const recentErrors = errorService.getRecentErrors();
			expect(recentErrors).toHaveLength(2);
			expect(recentErrors[0].message).toBe('Second error'); // Most recent first
			expect(recentErrors[1].message).toBe('First error');
		});

		it('should limit stored errors to maximum', () => {
			// Note: maxStoredErrors is private, so we test the behavior
			for (let i = 0; i < 150; i++) {
				errorService.handle(new Error(`Error ${i}`));
			}

			const recentErrors = errorService.getRecentErrors(150);
			expect(recentErrors.length).toBeLessThanOrEqual(100);
		});

		it('should clear errors when requested', () => {
			errorService.handle(new Error('Test error'));
			expect(errorService.getRecentErrors()).toHaveLength(1);

			errorService.clearErrors();
			expect(errorService.getRecentErrors()).toHaveLength(0);
		});
	});

	describe('error statistics', () => {
		it('should provide accurate error statistics', () => {
			// Add various types of errors
			errorService.handle(new Error('Network error'));
			errorService.handle(new Error('Validation failed'));
			errorService.handle(new Error('Payment error'));
			errorService.handle(new TypeError('System error'));

			const stats = errorService.getErrorStats();

			expect(stats.total).toBe(4);
			expect(stats.byCategory.network).toBe(1);
			expect(stats.byCategory.validation).toBe(1);
			expect(stats.byCategory.payment).toBe(1);
			expect(stats.byCategory.system).toBe(1);
			expect(stats.bySeverity.critical).toBe(1); // payment error
			expect(stats.bySeverity.high).toBe(1); // system error
			expect(stats.bySeverity.medium).toBe(1); // validation error
			expect(stats.bySeverity.low).toBe(1); // network error
		});
	});

	describe('logging behavior', () => {
		it('should log errors with appropriate console methods', () => {
			const criticalError = new Error('Payment failed');
			const highError = new TypeError('System failure');
			const mediumError = new Error('Validation error');
			const lowError = new Error('Minor issue');

			errorService.handle(criticalError);
			errorService.handle(highError);
			errorService.handle(mediumError);
			errorService.handle(lowError);

			expect(mockConsole.error).toHaveBeenCalledTimes(2); // critical + high
			expect(mockConsole.warn).toHaveBeenCalledTimes(1); // medium
			expect(mockConsole.info).toHaveBeenCalledTimes(1); // low
		});
	});
});

describe('useErrorHandler hook', () => {
	it('should provide error handling utilities', () => {
		const { handleError, getRecentErrors, clearErrors, getStats } = useErrorHandler();

		expect(typeof handleError).toBe('function');
		expect(typeof getRecentErrors).toBe('function');
		expect(typeof clearErrors).toBe('function');
		expect(typeof getStats).toBe('function');
	});

	it('should handle errors through the hook', () => {
		const { handleError, getRecentErrors } = useErrorHandler();

		const testError = new Error('Hook test error');
		handleError(testError, 'hook-context');

		const errors = getRecentErrors();
		expect(errors).toHaveLength(1);
		expect(errors[0].message).toBe('Hook test error');
		expect(errors[0].context).toBe('hook-context');
	});
});

describe('withErrorHandling wrapper', () => {
	it('should catch and handle errors from async operations', async () => {
		const failingOperation = async () => {
			throw new Error('Async operation failed');
		};

		await expect(withErrorHandling(failingOperation, 'async-context')).rejects.toThrow(
			'Async operation failed'
		);

		const recentErrors = errorService.getRecentErrors(1);
		expect(recentErrors).toHaveLength(1);
		expect(recentErrors[0].message).toBe('Async operation failed');
		expect(recentErrors[0].context).toBe('async-context');
	});

	it('should return results from successful operations', async () => {
		const successfulOperation = async () => {
			return { data: 'success' };
		};

		const result = await withErrorHandling(successfulOperation, 'success-context');

		expect(result).toEqual({ data: 'success' });
		expect(errorService.getRecentErrors()).toHaveLength(0);
	});
});
