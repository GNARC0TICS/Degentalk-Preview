/**
 * Type Validation Utilities
 *
 * Runtime type validation helpers and guards.
 * Ensures type safety at API boundaries and data ingestion points.
 */
import type { UserId } from '../ids.js';
export declare function isValidUuid(value: unknown): value is string;
export declare function isValidUserId(value: unknown): value is UserId;
export declare function createIdValidator<T extends string>(brand: string): (value: unknown) => value is T;
export declare function isValidDate(value: unknown): value is Date;
export declare function isValidDateString(value: unknown): value is string;
export declare function isPositiveNumber(value: unknown): value is number;
export declare function isNonNegativeNumber(value: unknown): value is number;
export declare function isValidAmount(value: unknown, decimals?: number): value is number;
export declare function isNonEmptyString(value: unknown): value is string;
export declare function isValidEmail(value: unknown): value is string;
export declare function isValidUsername(value: unknown): value is string;
export declare function isNonEmptyArray<T>(value: unknown): value is T[];
export declare function isArrayOf<T>(value: unknown, validator: (item: unknown) => item is T): value is T[];
export declare function hasProperty<K extends string>(obj: unknown, prop: K): obj is Record<K, unknown>;
export declare function hasProperties<K extends string>(obj: unknown, props: K[]): obj is Record<K, unknown>;
export declare function validateApiInput<T>(value: unknown, validator: (input: unknown) => input is T): T;
export declare function validateOptionalInput<T>(value: unknown, validator: (input: unknown) => input is T): T | undefined;
export declare function isEnumValue<T extends Record<string, string | number>>(enumObject: T, value: unknown): value is T[keyof T];
export declare function validatePaginationParams(value: unknown): {
    page: number;
    limit: number;
};
export declare function validateSortParams(value: unknown): {
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
};
export declare class ValidationError extends Error {
    field?: string;
    code?: string;
    constructor(message: string, field?: string, code?: string);
}
export declare function createValidationError(message: string, field?: string, code?: string): ValidationError;
