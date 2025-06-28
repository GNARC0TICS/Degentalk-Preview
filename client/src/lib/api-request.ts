/**
 * Utility for making API requests with proper error handling
 * Supports both object-based config and legacy string URL
 */

import { extractApiData, isStandardApiResponse } from './api-response';

export interface ApiError extends Error {
	status?: number;
	data?: any;
}

export interface ApiRequestConfig {
	url: string;
	method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
	data?: any;
	params?: Record<string, string>;
	headers?: Record<string, string>;
}

/**
 * Main API request function with object-based configuration
 * @param config Request configuration object
 * @returns The JSON response (automatically unwrapped from standard format)
 * @throws ApiError if the request fails
 */
export async function apiRequest<T = any>(config: ApiRequestConfig): Promise<T>;
export async function apiRequest<T = any>(url: string, options: RequestInit): Promise<T>;
export async function apiRequest<T = any>(
	configOrUrl: ApiRequestConfig | string,
	options: RequestInit = {}
): Promise<T> {
	// Handle both object config and legacy string URL
	const config: ApiRequestConfig =
		typeof configOrUrl === 'string' ? { url: configOrUrl, method: 'GET', ...options } : configOrUrl;

	// Build URL with query parameters
	let url = config.url;
	if (config.params) {
		const searchParams = new URLSearchParams(config.params);
		url += url.includes('?') ? '&' + searchParams.toString() : '?' + searchParams.toString();
	}

	// Build request options
	const requestOptions: RequestInit = {
		method: config.method,
		headers: {
			'Content-Type': 'application/json',
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
			const error = new Error(data.message || 'API request failed') as ApiError;
			error.status = response.status;
			error.data = data;
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
export async function apiPost<T = any, U = any>(
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
export async function apiPut<T = any, U = any>(
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
export async function apiPatch<T = any, U = any>(
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
export async function apiDelete<T = any>(
	url: string,
	options: Partial<ApiRequestConfig> = {}
): Promise<T> {
	return apiRequest<T>({
		url,
		method: 'DELETE',
		...options
	});
}
