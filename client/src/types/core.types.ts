/**
 * Core Type Definitions
 * Foundation types used across the entire application
 */

// Base error handling types
export interface ApiErrorResponse {
	message: string;
	code?: string;
	details?: Record<string, unknown>;
	status?: number;
	timestamp?: string;
}

export interface ApiErrorData {
	message: string;
	code?: string;
	details?: Record<string, unknown>;
	field?: string;
}

// Timing and performance metadata
export interface TimingMetadata {
	_timing?: {
		duration: number;
		requestId?: string;
		cacheHit?: boolean;
	};
}

// Standardized API response wrapper
export interface StandardApiResponse<T> {
	data: T;
	success: boolean;
	message?: string;
	errors?: ApiErrorData[];
	meta?: {
		timestamp: string;
		requestId?: string;
		pagination?: {
			page: number;
			limit: number;
			total: number;
			totalPages: number;
		};
	} & TimingMetadata;
}

// Test utilities
export interface TestUser {
	id: string;
	username: string;
	email: string;
	role: 'admin' | 'moderator' | 'user' | 'super_admin';
	permissions?: string[];
	status?: 'active' | 'suspended' | 'banned';
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
	disabled?: boolean;
	metadata?: Record<string, unknown>;
}

// Pagination types
export interface PaginationParams {
	page?: number;
	limit?: number;
	sortBy?: string;
	sortOrder?: 'asc' | 'desc';
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
	filters?: Record<string, unknown>;
	categories?: string[];
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
