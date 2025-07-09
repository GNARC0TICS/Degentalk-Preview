/**
 * API Response Standardization
 *
 * Implements the StandardApiResponse<T> wrapper from canonical.types.ts
 * Ensures consistent response handling across all API endpoints
 */

import type { StandardApiResponse, PaginatedResponse } from '@/types/canonical.types';

/**
 * Type guard to check if response follows standard format
 */
export function isStandardApiResponse<T>(response: any): response is StandardApiResponse<T> {
	return (
		response &&
		typeof response === 'object' &&
		'success' in response &&
		typeof response.success === 'boolean'
	);
}

/**
 * Extract data from standard API response
 * Handles both wrapped and unwrapped responses for backward compatibility
 */
export function extractApiData<T>(response: any): T {
	// Standard wrapped response
	if (isStandardApiResponse<T>(response)) {
		if (response.success && response.data !== undefined) {
			return response.data;
		} else {
			throw new Error(response.error?.message || 'API request failed');
		}
	}

	// Direct data response (legacy)
	return response as T;
}

/**
 * Create a standard API response wrapper
 */
export function createStandardResponse<T>(
	data: T,
	options?: {
		meta?: StandardApiResponse<T>['meta'] | undefined;
		requestId?: string;
	} | undefined
): StandardApiResponse<T> {
	return {
		success: true,
		data,
		meta: {
			timestamp: new Date().toISOString(),
			requestId: options?.requestId || generateRequestId(),
			...options?.meta
		}
	};
}

/**
 * Create a standard error response
 */
export function createErrorResponse(
	error: {
		code: string;
		message: string;
		details?: Record<string, any> | undefined;
	},
	options?: {
		requestId?: string;
	} | undefined
): StandardApiResponse<null> {
	return {
		success: false,
		data: null,
		meta: {
			timestamp: new Date().toISOString(),
			requestId: options?.requestId || generateRequestId()
		},
		error
	};
}

/**
 * Create paginated response wrapper
 */
export function createPaginatedResponse<T>(
	items: T[],
	pagination: PaginatedResponse<T>['pagination']
): StandardApiResponse<PaginatedResponse<T>> {
	return createStandardResponse(
		{
			items,
			pagination: {
				...pagination,
				hasNext: pagination.page < pagination.totalPages,
				hasPrev: pagination.page > 1
			}
		},
		{
			meta: {
				pagination
			}
		}
	);
}

/**
 * Enhanced apiRequest wrapper that handles standard responses
 */
export async function standardApiRequest<T>(request: () => Promise<any>): Promise<T> {
	try {
		const response = await request();
		return extractApiData<T>(response);
	} catch (error: any) {
		// Re-throw with enhanced error information
		if (error?.response?.data && isStandardApiResponse(error.response.data)) {
			const apiError = error.response.data as StandardApiResponse<null>;
			throw new Error(apiError.error?.message || 'API request failed');
		}
		throw error;
	}
}

/**
 * Type-safe response handler for React Query
 */
export function createQueryFn<T>(apiCall: () => Promise<any>): () => Promise<T> {
	return async () => {
		return standardApiRequest<T>(apiCall);
	};
}

/**
 * Response transformer for legacy API endpoints
 * Converts various response formats to standard format
 */
export function transformLegacyResponse<T>(
	response: any,
	dataExtractor?: (raw: any) => T
): StandardApiResponse<T> {
	// Already standard format
	if (isStandardApiResponse<T>(response)) {
		return response;
	}

	// Extract data using custom extractor or default
	const data = dataExtractor ? dataExtractor(response) : (response as T);

	return createStandardResponse(data);
}

/**
 * Batch response handler for multiple API calls
 */
export async function batchApiRequests<T extends Record<string, any>>(requests: {
	[K in keyof T]: () => Promise<any>;
}): Promise<StandardApiResponse<T>> {
	try {
		const entries = Object.entries(requests) as [keyof T, () => Promise<any>][];
		const results = await Promise.all(
			entries.map(async ([key, request]) => [key, await standardApiRequest(request)])
		);

		const data = Object.fromEntries(results) as T;
		return createStandardResponse(data);
	} catch (error: any) {
		return createErrorResponse({
			code: 'BATCH_REQUEST_FAILED',
			message: error.message || 'Batch request failed',
			details: { error }
		});
	}
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

function generateRequestId(): string {
	return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Response timing middleware for performance monitoring
 */
export function withTiming<T>(
	request: () => Promise<T>
): Promise<T & { _timing?: { duration: number } }> {
	const start = performance.now();

	return request().then((result) => {
		const duration = performance.now() - start;

		// Add timing metadata if result is an object
		if (typeof result === 'object' && result !== null) {
			(result as any)._timing = { duration };
		}

		return result as T & { _timing?: { duration: number } };
	});
}

/**
 * Retry wrapper for failed API requests
 */
export async function withRetry<T>(
	request: () => Promise<T>,
	options: {
		retries?: number | undefined;
		delay?: number | undefined;
		backoff?: number | undefined;
	} = {}
): Promise<T> {
	const { retries = 3, delay = 1000, backoff = 2 } = options;

	let lastError: Error;

	for (let attempt = 0; attempt <= retries; attempt++) {
		try {
			return await request();
		} catch (error: any) {
			lastError = error;

			// Don't retry on client errors (4xx)
			if (error?.response?.status >= 400 && error?.response?.status < 500) {
				throw error;
			}

			// Wait before retrying (except on last attempt)
			if (attempt < retries) {
				await new Promise((resolve) => setTimeout(resolve, delay * Math.pow(backoff, attempt)));
			}
		}
	}

	throw lastError!;
}
