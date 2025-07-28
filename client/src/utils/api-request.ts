/**
 * Utility for making API requests with proper error handling
 * Supports both object-based config and legacy string URL
 */

import { extractApiData } from './api-response';
import { getAuthToken } from './auth-token';
import type { ApiError as SharedApiError, ApiErrorCode } from '@shared/types/api.types';

export interface ApiError extends Error {
	status?: number | undefined;
	code?: ApiErrorCode;
	details?: Record<string, unknown>;
}

export interface ApiRequestConfig<TData = unknown> {
	url: string;
	method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
	data?: TData | undefined;
	params?: Record<string, string | number | boolean | undefined | string[]> | undefined;
	headers?: Record<string, string> | undefined;
}

/**
 * Main API request function with object-based configuration
 * @param config Request configuration object
 * @returns The JSON response (automatically unwrapped from standard format)
 * @throws ApiError if the request fails
 */
export async function apiRequest<T = unknown, TData = unknown>(config: ApiRequestConfig<TData>): Promise<T>;
export async function apiRequest<T = unknown>(url: string, options: RequestInit): Promise<T>;
export async function apiRequest<T = unknown, TData = unknown>(
	configOrUrl: ApiRequestConfig<TData> | string,
	options: RequestInit = {}
): Promise<T> {
	// Handle both object config and legacy string URL
	const config: ApiRequestConfig =
		typeof configOrUrl === 'string' 
			? { 
				url: configOrUrl, 
				method: (options.method as ApiRequestConfig['method']) || 'GET',
				...(options.body ? { data: options.body } : {}),
				headers: options.headers as Record<string, string> | undefined
			} 
			: configOrUrl;

	// Build URL with query parameters
	let url = config.url;
	if (config.params) {
		const searchParams = new URLSearchParams();
		Object.entries(config.params).forEach(([key, value]) => {
			if (value !== undefined && value !== null) {
				if (Array.isArray(value)) {
					// Handle array values (e.g., tags[])
					value.forEach(v => searchParams.append(key, String(v)));
				} else {
					searchParams.append(key, String(value));
				}
			}
		});
		const queryString = searchParams.toString();
		if (queryString) {
			url += url.includes('?') ? '&' + queryString : '?' + queryString;
		}
	}

	// Get JWT token for API requests
	const token = getAuthToken();
	
	// Build request options
	const requestOptions: RequestInit = {
		method: config.method,
		headers: {
			'Content-Type': 'application/json',
			...(token ? { Authorization: `Bearer ${token}` } : {}),
			...config.headers
		},
		credentials: 'include'
	};

	// Add body for non-GET requests
	if (config.data && config.method !== 'GET') {
		requestOptions.body = JSON.stringify(config.data);
	}

	try {
		const response = await fetch(url, requestOptions);
		const data = await response.json();

		if (!response.ok) {
			const error = new Error(data.message || data.error?.message || 'API request failed') as ApiError;
			error.status = response.status;
			error.code = data.error?.code;
			error.details = data.error?.details;
			throw error;
		}

		// Automatically unwrap standard API responses
		return extractApiData<T>(data);
	} catch (error) {
		if ((error as ApiError).status) {
			throw error;
		}

		const newError = new Error((error as Error).message || 'Network error') as ApiError;
		throw newError;
	}
}

/**
 * Make a POST request to the API
 * @param url The URL to fetch
 * @param body The request body
 * @param options Optional additional options
 * @returns The JSON response
 * @throws ApiError if the request fails
 */
export async function apiPost<T = unknown, U = unknown>(
	url: string,
	body: U,
	options: Partial<ApiRequestConfig> = {}
): Promise<T> {
	return apiRequest<T>({
		url,
		method: 'POST',
		data: body,
		...options
	});
}

/**
 * Make a PUT request to the API
 * @param url The URL to fetch
 * @param body The request body
 * @param options Optional additional options
 * @returns The JSON response
 * @throws ApiError if the request fails
 */
export async function apiPut<T = unknown, U = unknown>(
	url: string,
	body: U,
	options: Partial<ApiRequestConfig> = {}
): Promise<T> {
	return apiRequest<T>({
		url,
		method: 'PUT',
		data: body,
		...options
	});
}

/**
 * Make a PATCH request to the API
 * @param url The URL to fetch
 * @param body The request body
 * @param options Optional additional options
 * @returns The JSON response
 * @throws ApiError if the request fails
 */
export async function apiPatch<T = unknown, U = unknown>(
	url: string,
	body: U,
	options: Partial<ApiRequestConfig> = {}
): Promise<T> {
	return apiRequest<T>({
		url,
		method: 'PATCH',
		data: body,
		...options
	});
}

/**
 * Make a DELETE request to the API
 * @param url The URL to fetch
 * @param options Optional additional options
 * @returns The JSON response
 * @throws ApiError if the request fails
 */
export async function apiDelete<T = unknown>(
	url: string,
	options: Partial<ApiRequestConfig> = {}
): Promise<T> {
	return apiRequest<T>({
		url,
		method: 'DELETE',
		...options
	});
}
