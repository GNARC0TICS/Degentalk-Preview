/**
 * Domain-specific errors for dictionary operations
 */

export class DictionaryError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly context?: Record<string, any>
  ) {
    super(message);
    this.name = 'DictionaryError';
  }
}

// Specific error types for better error handling
export class EntryNotFoundError extends DictionaryError {
  constructor(identifier: string, context?: Record<string, any>) {
    super('ENTRY_NOT_FOUND', `Dictionary entry not found: ${identifier}`, context);
  }
}

export class AlreadyUpvotedError extends DictionaryError {
  constructor(entryId: string, userId: string) {
    super('ALREADY_UPVOTED', 'User has already upvoted this entry', { entryId, userId });
  }
}

export class UpvoteNotFoundError extends DictionaryError {
  constructor(entryId: string, userId: string) {
    super('UPVOTE_NOT_FOUND', 'Upvote not found for this user and entry', { entryId, userId });
  }
}

export class SlugConflictError extends DictionaryError {
  constructor(slug: string) {
    super('SLUG_CONFLICT', `Slug already exists: ${slug}`, { slug });
  }
}

export class ValidationError extends DictionaryError {
  constructor(field: string, message: string, value?: any) {
    super('VALIDATION_ERROR', `Validation failed for ${field}: ${message}`, { field, value });
  }
}

export class PermissionDeniedError extends DictionaryError {
  constructor(operation: string, userId: string) {
    super('PERMISSION_DENIED', `Permission denied for operation: ${operation}`, { operation, userId });
  }
}

// Error code constants for consistent error handling
export const DICTIONARY_ERROR_CODES = {
  ENTRY_NOT_FOUND: 'ENTRY_NOT_FOUND',
  ALREADY_UPVOTED: 'ALREADY_UPVOTED',
  UPVOTE_NOT_FOUND: 'UPVOTE_NOT_FOUND',
  SLUG_CONFLICT: 'SLUG_CONFLICT',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  DATABASE_ERROR: 'DATABASE_ERROR',
  RATE_LIMITED: 'RATE_LIMITED'
} as const;