/**
 * UUID ID Utilities for UUID Migration
 * 
 * Provides type-safe ID conversion and validation utilities for the migration
 * from numeric IDs to UUID-based branded types.
 */

import type { Id } from '@db/types';

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

/**
 * TEMPORARY: Bridge function to convert numeric IDs to string during migration
 * This will be removed once migration is complete
 * 
 * @deprecated Use UUIDs directly instead of converting from numbers
 */
export function toInt(value: unknown): number {
	if (typeof value === 'number') return value;
	if (typeof value === 'string') {
		const num = parseInt(value, 10);
		if (!isNaN(num)) return num;
	}
	throw new Error(`Cannot convert to integer: ${value}`);
}

/**
 * Generate a new UUID v4
 */
export function generateId<T extends string>(): Id<T> {
	// Use crypto.randomUUID if available (Node 14.17+, modern browsers)
	if (typeof crypto !== 'undefined' && crypto.randomUUID) {
		return crypto.randomUUID() as Id<T>;
	}
	
	// Fallback implementation
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		const r = Math.random() * 16 | 0;
		const v = c == 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	}) as Id<T>;
}

/**
 * Check if two IDs are equal (type-safe comparison)
 */
export function idsEqual<T extends string>(a: Id<T> | null | undefined, b: Id<T> | null | undefined): boolean {
	return a === b;
}

/**
 * Filter out null/undefined IDs from an array
 */
export function filterValidIds<T extends string>(ids: (Id<T> | null | undefined)[]): Id<T>[] {
	return ids.filter((id): id is Id<T> => id != null && isValidId(id));
}