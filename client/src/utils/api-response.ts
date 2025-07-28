/**
 * API Response Standardization
 *
 * Implements consistent response handling using shared API types
 * Ensures consistent response handling across all API endpoints
 */

import type { ApiResponse, ApiSuccess, ApiError, PaginationMeta } from '@shared/types/api.types';

/**
 * Type guard to check if response is an API success response
 */
export function isApiSuccessResponse<T>(response: unknown): response is ApiSuccess<T> {
	return (
		response !== null &&
		typeof response === 'object' &&
		'success' in response &&
		(response as Record<string, unknown>).success === true &&
		'data' in response
	);
}


/**
 * Extract data from standard API response
 * Handles both wrapped and unwrapped responses for backward compatibility
 */
export function extractApiData<T>(response: unknown): T {
	// Standard wrapped response
	if (isApiSuccessResponse<T>(response)) {
		return response.data;
	}
	
	// Check for error response
	if (response && typeof response === 'object' && 'success' in response && 
		(response as Record<string, unknown>).success === false) {
		const errorResponse = response as ApiError;
		throw new Error(errorResponse.error.message);
	}

	// Direct data response (legacy)
	return response as T;
}

/**
 * Create a standard API response wrapper
 */
export function createStandardResponse<T>(
	data: T,
	options?:
		| {
				message?: string;
				meta?: PaginationMeta;
		  }
		| undefined
): ApiSuccess<T> {
	return {
		success: true,
		data,
		...(options?.message && { message: options.message }),
		timestamp: new Date().toISOString(),
		...(options?.meta && { meta: options.meta })
	} as ApiSuccess<T>;
}

/**
 * Create a standard error response
 */
export function createErrorResponse(
	error: {
		code: string;
		message: string;
		details?: Record<string, unknown> | undefined;
	},
	options?:
		| {
				requestId?: string;
		  }
		| undefined
): ApiError {
	return {
		success: false,
		error,
		timestamp: new Date().toISOString()
	} as ApiError;
}

/**
 * Create paginated response wrapper
 */
export function createPaginatedResponse<T>(
	items: T[],
	pagination: PaginationMeta
): ApiSuccess<{ items: T[]; pagination: PaginationMeta }> {
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
			meta: pagination
		}
	);
}

/**
 * Enhanced apiRequest wrapper that handles standard responses
 */
export async function standardApiRequest<T>(request: () => Promise<unknown>): Promise<T> {
	try {
		const response = await request();
		return extractApiData<T>(response);
	} catch (error) {
		// Re-throw with enhanced error information
		if (error && typeof error === 'object' && 'response' in error) {
			const errorResponse = (error as { response?: { data?: unknown } }).response;
			if (errorResponse?.data && typeof errorResponse.data === 'object' && 
				'success' in errorResponse.data && 
				(errorResponse.data as Record<string, unknown>).success === false) {
				const apiError = errorResponse.data as ApiError;
				throw new Error(apiError.error.message);
			}
		}
		throw error;
	}
}

/**
 * Type-safe response handler for React Query
 */
export function createQueryFn<T>(apiCall: () => Promise<unknown>): () => Promise<T> {
	return async () => {
		return standardApiRequest<T>(apiCall);
	};
}

/**
 * Response transformer for legacy API endpoints
 * Converts various response formats to standard format
 */
export function transformLegacyResponse<T>(
	response: unknown,
	dataExtractor?: (raw: unknown) => T
): ApiSuccess<T> {
	// Already standard format
	if (isApiSuccessResponse<T>(response)) {
		return response;
	}

	// Extract data using custom extractor or default
	const data = dataExtractor ? dataExtractor(response) : (response as T);

	return createStandardResponse(data);
}

/**
 * Batch response handler for multiple API calls
 */
export async function batchApiRequests<T extends Record<string, unknown>>(requests: {
	[K in keyof T]: () => Promise<unknown>;
}): Promise<ApiSuccess<T>> {
	const entries = Object.entries(requests) as [keyof T, () => Promise<unknown>][];
	const results = await Promise.all(
		entries.map(async ([key, request]) => [key, await standardApiRequest(request)])
	);

	const data = Object.fromEntries(results) as T;
	return createStandardResponse(data);
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
			(result as T & { _timing?: { duration: number } })._timing = { duration };
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
		} catch (error) {
			lastError = error instanceof Error ? error : new Error(String(error));

			// Don't retry on client errors (4xx)
			if (error && typeof error === 'object' && 'response' in error) {
				const status = (error as { response?: { status?: number } }).response?.status;
				if (status !== undefined && status >= 400 && status < 500) {
					throw error;
				}
			}

			// Wait before retrying (except on last attempt)
			if (attempt < retries) {
				await new Promise((resolve) => setTimeout(resolve, delay * Math.pow(backoff, attempt)));
			}
		}
	}

	throw lastError!;
}
