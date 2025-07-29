/**
 * Transformer utility helpers to reduce boilerplate
 */

import { logger } from '../logger';
import type { Response } from 'express';
import { sendSuccess, sendError, sendPaginated, errorResponses } from '@utils/api-responses';
import { ApiErrorCode } from '@shared/types/api.types';

// Transform a list of items using a transformer function
export function toPublicList<T, R>(items: T[], transformer: (item: T) => R): R[] {
	return items.map(transformer);
}

// Transform a list with error handling
export function safeTransformList<T, R>(items: T[], transformer: (item: T) => R, fallback: R): R[] {
	return items.map((item) => {
		try {
			return transformer(item);
		} catch (error) {
			logger.error('TRANSFORMER_HELPERS', 'Transform error', { error });
			return fallback;
		}
	});
}

// Create a paginated response with transformed items
export function toPaginatedResponse<T, R>(
	items: T[],
	total: number,
	page: number,
	limit: number,
	transformer: (item: T) => R
): PaginatedResponse<R> {
	return {
		items: items.map(transformer),
		total,
		page,
		limit,
		hasMore: page * limit < total,
		pages: Math.ceil(total / limit)
	};
}

// Type for paginated responses
export interface PaginatedResponse<T> {
	items: T[];
	total: number;
	page: number;
	limit: number;
	hasMore: boolean;
	pages: number;
}

// Transform with viewer context (for authenticated transformations)
export function transformWithViewer<T, R>(
	item: T,
	viewerId: string | null,
	publicTransform: (item: T) => R,
	authenticatedTransform: (item: T, viewerId: string) => R
): R {
	return viewerId ? authenticatedTransform(item, viewerId) : publicTransform(item);
}

// Batch transform with different methods based on viewer
export function batchTransformWithViewer<T, R>(
	items: T[],
	viewerId: string | null,
	publicTransform: (item: T) => R,
	authenticatedTransform: (item: T, viewerId: string) => R
): R[] {
	const transformer = viewerId
		? (item: T) => authenticatedTransform(item, viewerId)
		: publicTransform;

	return items.map(transformer);
}

// Helper to create a standard API response
export function createApiResponse<T>(data: T, message?: string): ApiResponse<T> {
	return {
		success: true,
		data,
		message
	};
}

// Type for API responses
export interface ApiResponse<T> {
	success: boolean;
	data: T;
	message?: string;
	error?: string;
}

// Response helpers to eliminate raw res.json() calls
// DEPRECATED: Use sendSuccess from @utils/api-responses instead
export function sendSuccessResponse<T>(res: Response, data: T, message?: string, status = 200): Response {
	return sendSuccess(res, data, message, status);
}

// DEPRECATED: Use sendError from @utils/api-responses instead
export function sendErrorResponse(res: Response, message: string, status = 400, details?: Record<string, unknown>): Response {
	// Map common HTTP status codes to error codes
	let errorCode: ApiErrorCode;
	switch (status) {
		case 401:
			errorCode = ApiErrorCode.UNAUTHORIZED;
			break;
		case 403:
			errorCode = ApiErrorCode.FORBIDDEN;
			break;
		case 404:
			errorCode = ApiErrorCode.NOT_FOUND;
			break;
		case 409:
			errorCode = ApiErrorCode.ALREADY_EXISTS;
			break;
		case 422:
		case 400:
			errorCode = ApiErrorCode.VALIDATION_ERROR;
			break;
		case 500:
		default:
			errorCode = ApiErrorCode.INTERNAL_ERROR;
			break;
	}
	return sendError(res, errorCode, message, status, details);
}

// DEPRECATED: Use sendTransformed from @utils/api-responses instead
export function sendTransformedResponse<T, R>(
	res: Response,
	data: T,
	transformer: (item: T) => R,
	message?: string
): Response {
	return sendSuccess(res, transformer(data), message);
}

// DEPRECATED: Use sendTransformedList from @utils/api-responses instead
export function sendTransformedListResponse<T, R>(
	res: Response,
	data: T[],
	transformer: (item: T) => R,
	message?: string
): Response {
	return sendSuccess(res, data.map(transformer), message);
}

// Re-export common response helpers
export { toPublicList as transformList }; // Alias for backward compatibility
