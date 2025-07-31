/**
 * Type Validation Utilities
 *
 * Runtime type validation helpers and guards.
 * Ensures type safety at API boundaries and data ingestion points.
 */

import type { UserId } from './ids.js';

// UUID validation
export function isValidUuid(value: unknown): value is string {
	if (typeof value !== 'string') return false;
	const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
	return uuidRegex.test(value);
}

// Branded ID validation
export function isValidUserId(value: unknown): value is UserId {
	return isValidUuid(value);
}

// Generic ID validator factory
export function createIdValidator<T extends string>(_brand: string) {
	return (value: unknown): value is T => isValidUuid(value);
}

// Date validation
export function isValidDate(value: unknown): value is Date {
	return value instanceof Date && !isNaN(value.getTime());
}

export function isValidDateString(value: unknown): value is string {
	if (typeof value !== 'string') return false;
	const date = new Date(value);
	return isValidDate(date);
}

// Number validation
export function isPositiveNumber(value: unknown): value is number {
	return typeof value === 'number' && value > 0 && !isNaN(value);
}

export function isNonNegativeNumber(value: unknown): value is number {
	return typeof value === 'number' && value >= 0 && !isNaN(value);
}

export function isValidAmount(value: unknown, decimals: number = 8): value is number {
	if (!isNonNegativeNumber(value)) return false;
	const factor = Math.pow(10, decimals);
	return Math.round(value * factor) === value * factor;
}

// String validation
export function isNonEmptyString(value: unknown): value is string {
	return typeof value === 'string' && value.trim().length > 0;
}

export function isValidEmail(value: unknown): value is string {
	if (!isNonEmptyString(value)) return false;
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(value);
}

export function isValidUsername(value: unknown): value is string {
	if (!isNonEmptyString(value)) return false;
	const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
	return usernameRegex.test(value);
}

// Array validation
export function isNonEmptyArray<T>(value: unknown): value is T[] {
	return Array.isArray(value) && value.length > 0;
}

export function isArrayOf<T>(
	value: unknown,
	validator: (item: unknown) => item is T
): value is T[] {
	return Array.isArray(value) && value.every(validator);
}

// Object validation
export function hasProperty<K extends string>(obj: unknown, prop: K): obj is Record<K, unknown> {
	return typeof obj === 'object' && obj !== null && prop in obj;
}

export function hasProperties<K extends string>(
	obj: unknown,
	props: K[]
): obj is Record<K, unknown> {
	return props.every((prop) => hasProperty(obj, prop));
}

// API validation helpers
export function validateApiInput<T>(value: unknown, validator: (input: unknown) => input is T): T {
	if (!validator(value)) {
		throw new Error('Invalid input format');
	}
	return value;
}

export function validateOptionalInput<T>(
	value: unknown,
	validator: (input: unknown) => input is T
): T | undefined {
	if (value === undefined || value === null) {
		return undefined;
	}
	return validateApiInput(value, validator);
}

// Enum validation
export function isEnumValue<T extends Record<string, string | number>>(
	enumObject: T,
	value: unknown
): value is T[keyof T] {
	return Object.values(enumObject).includes(value as string | number);
}

// Complex validation helpers
export function validatePaginationParams(value: unknown): {
	page: number;
	limit: number;
} {
	if (typeof value !== 'object' || value === null) {
		return { page: 1, limit: 20 };
	}

	const obj = value as Record<string, unknown>;

	const page = typeof obj.page === 'number' && obj.page > 0 ? obj.page : 1;
	const limit = typeof obj.limit === 'number' && obj.limit > 0 && obj.limit <= 100 ? obj.limit : 20;

	return { page, limit };
}

export function validateSortParams(value: unknown): {
	sortBy?: string;
	sortOrder?: 'asc' | 'desc';
} {
	if (typeof value !== 'object' || value === null) {
		return {};
	}

	const obj = value as Record<string, unknown>;

	const result: { sortBy?: string; sortOrder?: 'asc' | 'desc' } = {};

	if (isNonEmptyString(obj.sortBy)) {
		result.sortBy = obj.sortBy;
	}

	if (obj.sortOrder === 'asc' || obj.sortOrder === 'desc') {
		result.sortOrder = obj.sortOrder;
	}

	return result;
}

// Error handling
export class ValidationError extends Error {
	constructor(
		message: string,
		public field?: string,
		public code?: string
	) {
		super(message);
		this.name = 'ValidationError';
	}
}

export function createValidationError(
	message: string,
	field?: string,
	code?: string
): ValidationError {
	return new ValidationError(message, field, code);
}
