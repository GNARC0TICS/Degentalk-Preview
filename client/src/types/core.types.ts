/**
 * Core Type Definitions
 * Foundation types used across the entire application
 */

// Base error handling types
export interface ApiErrorResponse {
	message: string;
	code?: string;
	details?: Record<string, unknown> | undefined;
	status?: number | undefined;
	timestamp?: string;
}

export interface ApiErrorData {
	message: string;
	code?: string;
	details?: Record<string, unknown> | undefined;
	field?: string;
}

// Timing and performance metadata
export interface TimingMetadata {
	_timing?:
		| {
				duration: number;
				requestId?: string;
				cacheHit?: boolean | undefined;
		  }
		| undefined;
}

// Standardized API response wrapper
export interface StandardApiResponse<T> {
	data: T;
	success: boolean;
	message?: string;
	errors?: ApiErrorData[] | undefined;
	meta?:
		| ({
				timestamp: string;
				requestId?: string;
				pagination?:
					| {
							page: number;
							limit: number;
							total: number;
							totalPages: number;
					  }
					| undefined;
		  } & TimingMetadata)
		| undefined;
}

// Test utilities
export interface TestUser {
	id: string;
	username: string;
	email: string;
	role: 'admin' | 'moderator' | 'user' | 'super_admin';
	permissions?: string[] | undefined;
	status?: 'active' | 'suspended' | 'banned' | undefined;
}

export interface MockComponentProps {
	[key: string]: unknown;
}

// Generic unknown data containers for third-party integration
export interface UnknownApiData {
	[key: string]: unknown;
}

export interface UnknownEventData {
	type: string;
	payload: Record<string, unknown>;
	timestamp: string;
}

// File upload and media types
export interface UploadedFile {
	id: string;
	name: string;
	url: string;
	type: string;
	size: number;
	uploadedAt: string;
}

// Form and input types
export interface FormValidationError {
	field: string;
	message: string;
	code?: string;
}

export interface SelectOption<T = string> {
	label: string;
	value: T;
	disabled?: boolean | undefined;
	metadata?: Record<string, unknown> | undefined;
}

// Pagination types
export interface PaginationParams {
	page?: number | undefined;
	limit?: number | undefined;
	sortBy?: string;
	sortOrder?: 'asc' | 'desc' | undefined;
}

export interface PaginatedResponse<T> {
	items: T[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
		hasNext: boolean;
		hasPrev: boolean;
	};
}

// Search and filtering
export interface SearchParams {
	query?: string;
	filters?: Record<string, unknown> | undefined;
	categories?: string[] | undefined;
}

// Date range utilities
export interface DateRange {
	start: string; // ISO string
	end: string; // ISO string
}

// Generic entity reference
export interface EntityReference {
	id: string;
	type: string;
	name?: string;
}
