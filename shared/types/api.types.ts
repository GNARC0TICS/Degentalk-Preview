import type { UserId } from './ids.js';

/**
 * Type-Safe API Response Interfaces
 *
 * QUALITY IMPROVEMENT: Standardized API response types
 * Eliminates 'any' types in API layer. Uses branded ID types for type safety.
 */

export interface ApiSuccess<T = unknown> {
	success: true;
	data: T;
	message?: string;
	timestamp: string;
	meta?: PaginationMeta | FilterMeta;
}

export interface ApiError {
	success: false;
	error: {
		code: string;
		message: string;
		details?: Record<string, unknown>;
		field?: string; // For validation errors
	};
	timestamp: string;
}

export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError;

// Pagination metadata
export interface PaginationMeta {
	page: number;
	limit: number;
	total: number;
	totalPages: number;
	hasNext: boolean;
	hasPrev: boolean;
}

// Filter metadata
export interface FilterMeta {
	appliedFilters: Record<string, unknown>;
	availableFilters: string[];
	resultCount: number;
}

// Request interfaces
export interface PaginatedRequest {
	page?: number;
	limit?: number;
	sortBy?: string;
	sortOrder?: 'asc' | 'desc';
}

export interface FilteredRequest {
	filters?: Record<string, unknown>;
	search?: string;
}

export type PaginatedFilteredRequest = PaginatedRequest & FilteredRequest;

// Common error codes
export enum ApiErrorCode {
	// Authentication & Authorization
	UNAUTHORIZED = 'UNAUTHORIZED',
	FORBIDDEN = 'FORBIDDEN',
	TOKEN_EXPIRED = 'TOKEN_EXPIRED',

	// Validation
	VALIDATION_ERROR = 'VALIDATION_ERROR',
	INVALID_REQUEST = 'INVALID_REQUEST',
	MISSING_FIELD = 'MISSING_FIELD',

	// Resources
	NOT_FOUND = 'NOT_FOUND',
	ALREADY_EXISTS = 'ALREADY_EXISTS',

	// Operations
	OPERATION_FAILED = 'OPERATION_FAILED',
	RATE_LIMITED = 'RATE_LIMITED',

	// System
	INTERNAL_ERROR = 'INTERNAL_ERROR',
	SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',

	// Domain-specific
	INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
	INVALID_PERMISSIONS = 'INVALID_PERMISSIONS'
}

// Type helpers for controllers
export type ControllerResponse<T = unknown> = Promise<ApiResponse<T>>;

export interface TypedRequest<TBody = unknown, TQuery = unknown, TParams = unknown> {
	body: TBody;
	query: TQuery;
	params: TParams;
	user?: {
		id: UserId;
		role: string;
		username: string;
		level: number;
	};
}

export interface TypedResponse<T = unknown> {
	status(code: number): TypedResponse<T>;
	json(data: ApiResponse<T>): TypedResponse<T>;
}

// Utility type for extracting data from API response
export type ExtractApiData<T> = T extends ApiSuccess<infer U> ? U : never;
