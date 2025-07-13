/**
 * UUID ID Utilities for UUID Migration
 *
 * Provides type-safe ID conversion and validation utilities for the migration
 * from numeric IDs to UUID-based branded types.
 */

import type { Id } from '@shared/types/ids';

/**
 * Type-safe ID constructor that ensures proper branding
 */
export function toId<T extends string>(value: string): Id<T> {
	if (!isValidId(value)) {
		throw new Error(`Invalid ID format: ${value}. Expected UUID format.`);
	}
	return value as Id<T>;
}

/**
 * Validates if a string is a valid UUID format
 */
export function isValidId(value: unknown): value is string {
	if (typeof value !== 'string') return false;

	// UUID v4 regex pattern
	const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
	return uuidRegex.test(value);
}

/**
 * Strict UUID validation (throws on invalid)
 */
export function validateUuid(value: unknown): string {
	if (!isValidId(value)) {
		throw new Error(`Invalid UUID: ${value}`);
	}
	return value;
}

/**
 * Safe ID parsing that returns null on failure
 */
export function parseId<T extends string>(value: unknown): Id<T> | null {
	try {
		if (typeof value === 'string' && isValidId(value)) {
			return value as Id<T>;
		}
		return null;
	} catch {
		return null;
	}
}

// Legacy toInt function removed - use UUID-based branded types instead

/**
 * Generate a new UUID v4
 */
export function generateId<T extends string>(): Id<T> {
	// Use crypto.randomUUID if available (Node 14.17+, modern browsers)
	if (typeof crypto !== 'undefined' && crypto.randomUUID) {
		return crypto.randomUUID() as Id<T>;
	}

	// Fallback implementation
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
		const r = (Math.random() * 16) | 0;
		const v = c == 'x' ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	}) as Id<T>;
}

/**
 * Check if two IDs are equal (type-safe comparison)
 */
export function idsEqual<T extends string>(
	a: Id<T> | null | undefined,
	b: Id<T> | null | undefined
): boolean {
	return a === b;
}

/**
 * Filter out null/undefined IDs from an array
 */
export function filterValidIds<T extends string>(ids: (Id<T> | null | undefined)[]): Id<T>[] {
	return ids.filter((id): id is Id<T> => id != null && isValidId(id));
}

/**
 * Convert route parameter to typed ID
 * Replaces parseInt() patterns for ID parameters
 */
export function parseIdParam<T extends string>(param: string | undefined): Id<T> | null {
	if (!param || !isValidId(param)) {
		return null;
	}
	return param as Id<T>;
}

/**
 * Validate and assert ID is valid UUID
 * Throws error for better debugging
 */
export function assertValidId(
	id: string | undefined,
	paramName: string = 'id'
): asserts id is string {
	if (!id || !isValidId(id)) {
		throw new Error(`Invalid ${paramName}: must be a valid UUID`);
	}
}

/**
 * Legacy support for numeric validation during migration
 * Use this for entities that haven't been migrated to UUIDs yet
 */
export function isValidNumericId(id: string | number | undefined | null): boolean {
	if (!id) return false;

	const num = Number(id);
	return !isNaN(num) && num > 0 && Number.isInteger(num);
}

/**
 * Convert route parameter to entity ID (supports both numeric and UUID)
 * For gradual migration scenarios
 */
export function parseEntityIdParam(param: string | undefined): string | number | null {
	if (!param) return null;

	// Try UUID first
	if (isValidId(param)) {
		return param;
	}

	// Fall back to numeric for legacy support
	const num = parseInt(param);
	if (!isNaN(num) && num > 0) {
		return num;
	}

	return null;
}
