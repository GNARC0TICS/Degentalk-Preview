import { z, ZodError, ZodSchema } from 'zod';
import { logger } from '@/lib/logger';

export class ApiValidationError extends Error {
  constructor(
    public zodError: ZodError,
    public context?: string
  ) {
    super(`API Response Validation Failed${context ? ` (${context})` : ''}`);
    this.name = 'ApiValidationError';
  }
}

/**
 * Validates API response data against a schema
 * Logs errors in development but doesn't throw in production
 */
export function validateApiResponse<T>(
  schema: ZodSchema<T>,
  data: unknown,
  context?: string
): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof ZodError) {
      logger.error('validateApiResponse', 'API Response Validation Failed', {
        context,
        errors: error.errors,
        data: process.env.NODE_ENV === 'development' ? data : undefined
      });
      
      // In development, throw to catch issues early
      if (process.env.NODE_ENV === 'development') {
        throw new ApiValidationError(error, context);
      }
      
      // In production, return the data as-is to avoid breaking the app
      // but log the validation error for monitoring
      return data as T;
    }
    throw error;
  }
}

/**
 * Safe parse that returns a result object instead of throwing
 */
export function safeParseApiResponse<T>(
  schema: ZodSchema<T>,
  data: unknown,
  context?: string
): { success: true; data: T } | { success: false; error: ZodError } {
  const result = schema.safeParse(data);
  
  if (!result.success) {
    logger.warn('safeParseApiResponse', 'API Response Validation Warning', {
      context,
      errors: result.error.errors
    });
  }
  
  return result;
}

/**
 * Type guard for checking if a value matches a schema
 */
export function matchesSchema<T>(
  schema: ZodSchema<T>,
  value: unknown
): value is T {
  return schema.safeParse(value).success;
}

/**
 * Extract inferred type from a Zod schema
 */
export type InferSchema<T extends ZodSchema> = z.infer<T>;