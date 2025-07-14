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
export declare function toId<T extends string>(value: string): Id<T>;
/**
 * Validates if a string is a valid UUID format
 */
export declare function isValidId(value: unknown): value is string;
/**
 * Strict UUID validation (throws on invalid)
 */
export declare function validateUuid(value: unknown): string;
/**
 * Safe ID parsing that returns null on failure
 */
export declare function parseId<T extends string>(value: unknown): Id<T> | null;
/**
 * Generate a new UUID v4
 */
export declare function generateId<T extends string>(): Id<T>;
/**
 * Check if two IDs are equal (type-safe comparison)
 */
export declare function idsEqual<T extends string>(a: Id<T> | null | undefined, b: Id<T> | null | undefined): boolean;
/**
 * Filter out null/undefined IDs from an array
 */
export declare function filterValidIds<T extends string>(ids: (Id<T> | null | undefined)[]): Id<T>[];
/**
 * Convert route parameter to typed ID
 * Replaces parseInt() patterns for ID parameters
 */
export declare function parseIdParam<T extends string>(param: string | undefined): Id<T> | null;
/**
 * Validate and assert ID is valid UUID
 * Throws error for better debugging
 */
export declare function assertValidId(id: string | undefined, paramName?: string): asserts id is string;
/**
 * Legacy support for numeric validation during migration
 * Use this for entities that haven't been migrated to UUIDs yet
 */
export declare function isValidNumericId(id: string | number | undefined | null): boolean;
/**
 * Convert route parameter to entity ID (supports both numeric and UUID)
 * For gradual migration scenarios
 */
export declare function parseEntityIdParam(param: string | undefined): string | number | null;
