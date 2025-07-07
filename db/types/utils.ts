/**
 * Database Type Utilities
 * 
 * Enhanced utilities for working with UUID-branded types in the DegenTalk platform.
 * Provides type-safe ID operations, validation, and conversion helpers.
 */

import type { Brand } from 'utility-types';
import type { Id } from '@shared/types/ids';

/**
 * Type guard to check if a value is a valid UUID string
 */
export function isValidUuid(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  
  // UUID v4 regex pattern
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidPattern.test(value);
}

/**
 * Type-safe ID converter with runtime validation
 * Throws error for invalid UUIDs to catch issues early
 */
export function toId<T extends string>(value: string, tag?: T): Id<T> {
  if (!isValidUuid(value)) {
    throw new Error(`Invalid UUID format for ${tag || 'ID'}: ${value}. Expected UUID v4 format.`);
  }
  return value as Id<T>;
}

/**
 * Safe ID converter that returns null for invalid values
 * Useful for handling potentially invalid input without throwing
 */
export function toIdSafe<T extends string>(value: unknown): Id<T> | null {
  if (typeof value === 'string' && isValidUuid(value)) {
    return value as Id<T>;
  }
  return null;
}

/**
 * Generate a new UUID for a specific ID type
 * Uses crypto.randomUUID() for secure random generation
 */
export function generateId<T extends string>(): Id<T> {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID() as Id<T>;
  }
  
  // Fallback for environments without crypto.randomUUID
  throw new Error('crypto.randomUUID is not available. Ensure running in a supported environment.');
}

/**
 * Validate array of IDs, filtering out invalid ones
 * Useful for cleaning up data from external sources
 */
export function validateIds<T extends string>(values: unknown[]): Id<T>[] {
  return values.filter(isValidUuid) as Id<T>[];
}

/**
 * Create a type-safe ID mapper for bulk operations
 * Maps from one ID type to another with validation
 */
export function createIdMapper<TFrom extends string, TTo extends string>(
  fromTag: TFrom,
  toTag: TTo
) {
  return (id: Id<TFrom>): Id<TTo> => {
    // In real use, this would involve database lookup or mapping logic
    // For now, we just ensure type safety
    return id as unknown as Id<TTo>;
  };
}

/**
 * Type-safe comparison for branded IDs
 * Prevents accidental comparison of different ID types
 */
export function isSameId<T extends string>(id1: Id<T>, id2: Id<T>): boolean {
  return id1 === id2;
}

/**
 * Extract the raw UUID string from a branded ID
 * Useful for database operations that need the raw string
 */
export function unwrapId<T extends string>(id: Id<T>): string {
  return id as string;
}

/**
 * Batch ID operations for performance
 */
export class IdBatch<T extends string> {
  private ids: Set<Id<T>> = new Set();
  
  add(id: Id<T>): this {
    this.ids.add(id);
    return this;
  }
  
  addMany(ids: Id<T>[]): this {
    ids.forEach(id => this.ids.add(id));
    return this;
  }
  
  has(id: Id<T>): boolean {
    return this.ids.has(id);
  }
  
  toArray(): Id<T>[] {
    return Array.from(this.ids);
  }
  
  size(): number {
    return this.ids.size;
  }
  
  clear(): void {
    this.ids.clear();
  }
}

/**
 * Commonly used ID type guards for specific entities
 */
export const IdValidators = {
  user: (value: unknown): value is Id<'user'> => 
    typeof value === 'string' && isValidUuid(value),
    
  thread: (value: unknown): value is Id<'thread'> => 
    typeof value === 'string' && isValidUuid(value),
    
  post: (value: unknown): value is Id<'post'> => 
    typeof value === 'string' && isValidUuid(value),
    
  wallet: (value: unknown): value is Id<'wallet'> => 
    typeof value === 'string' && isValidUuid(value),
} as const;

/**
 * Development helper to create mock IDs for testing
 * Generates valid UUIDs that can be used in tests
 */
export function createMockId<T extends string>(tag?: T): Id<T> {
  return generateId<T>();
}

/**
 * Type-safe ID parsing from request parameters
 * Common pattern for API route handlers
 */
export function parseIdParam<T extends string>(
  param: string | undefined,
  paramName: string
): Id<T> {
  if (!param) {
    throw new Error(`Missing required parameter: ${paramName}`);
  }
  
  if (!isValidUuid(param)) {
    throw new Error(`Invalid UUID format for parameter ${paramName}: ${param}`);
  }
  
  return param as Id<T>;
}

/**
 * Error classes for ID-related operations
 */
export class InvalidIdError extends Error {
  constructor(value: unknown, expectedType?: string) {
    super(`Invalid ID${expectedType ? ` for ${expectedType}` : ''}: ${value}`);
    this.name = 'InvalidIdError';
  }
}

export class MissingIdError extends Error {
  constructor(paramName: string) {
    super(`Missing required ID parameter: ${paramName}`);
    this.name = 'MissingIdError';
  }
}

/**
 * ID utility constants
 */
export const ID_CONSTANTS = {
  UUID_LENGTH: 36,
  UUID_PATTERN: /^[0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  NIL_UUID: '00000000-0000-0000-0000-000000000000',
} as const;