/**
 * ID Validation Middleware
 * 
 * Provides type-safe validation for route parameters containing branded IDs.
 * Ensures all IDs are valid UUIDs before reaching business logic.
 */

import { Request, Response, NextFunction } from 'express';
import { validateAndConvertId } from '@core/helpers/validate-controller-ids';
import { SafeIdConverter } from '@core/helpers/safe-id-converter';
import { logger } from '@core/logger';
import type { 
  UserId, 
  ThreadId, 
  PostId, 
  ForumId, 
  WalletId, 
  TransactionId,
  MissionId,
  AchievementId,
  TitleId,
  RoleId
} from '@shared/types/ids';

/**
 * Middleware to validate multiple ID parameters
 * @param paramNames Array of parameter names to validate
 * @returns Express middleware function
 */
export const validateIdParams = (paramNames: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      for (const param of paramNames) {
        if (req.params[param]) {
          req.params[param] = validateAndConvertId(req.params[param], param);
        }
      }
      next();
    } catch (error: any) {
      logger.warn('ID_VALIDATION', `Invalid ID parameter: ${error.message}`, {
        params: req.params,
        path: req.path
      });
      res.status(400).json({ 
        error: 'Invalid ID format',
        message: error.message,
        code: 'INVALID_ID_FORMAT'
      });
    }
  };
};

/**
 * Middleware to validate query parameters containing IDs
 * @param queryNames Array of query parameter names to validate
 * @returns Express middleware function
 */
export const validateIdQueries = (queryNames: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      for (const query of queryNames) {
        if (req.query[query]) {
          const value = req.query[query] as string;
          req.query[query] = validateAndConvertId(value, query);
        }
      }
      next();
    } catch (error: any) {
      logger.warn('ID_VALIDATION', `Invalid ID in query: ${error.message}`, {
        query: req.query,
        path: req.path
      });
      res.status(400).json({ 
        error: 'Invalid ID format in query',
        message: error.message,
        code: 'INVALID_QUERY_ID_FORMAT'
      });
    }
  };
};

/**
 * Validate body fields containing IDs
 * @param fieldPaths Array of dot-notation paths to ID fields
 * @returns Express middleware function
 */
export const validateIdBody = (fieldPaths: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      for (const path of fieldPaths) {
        const value = getNestedValue(req.body, path);
        if (value !== undefined) {
          setNestedValue(req.body, path, validateAndConvertId(value, path));
        }
      }
      next();
    } catch (error: any) {
      logger.warn('ID_VALIDATION', `Invalid ID in body: ${error.message}`, {
        body: req.body,
        path: req.path
      });
      res.status(400).json({ 
        error: 'Invalid ID format in request body',
        message: error.message,
        code: 'INVALID_BODY_ID_FORMAT'
      });
    }
  };
};

/**
 * Type-specific validators for common routes
 */
export const validateUserId = validateIdParams(['userId']);
export const validateThreadId = validateIdParams(['threadId']);
export const validatePostId = validateIdParams(['postId']);
export const validateForumId = validateIdParams(['forumId']);
export const validateWalletId = validateIdParams(['walletId']);
export const validateTransactionId = validateIdParams(['transactionId']);

/**
 * Compound validators for routes with multiple IDs
 */
export const validateForumThreadIds = validateIdParams(['forumId', 'threadId']);
export const validateThreadPostIds = validateIdParams(['threadId', 'postId']);
export const validateUserWalletIds = validateIdParams(['userId', 'walletId']);

/**
 * Safe ID converter instance for manual conversions
 */
export const idConverter = new SafeIdConverter();

/**
 * Manual ID validation function for service layer
 * @param id The ID to validate
 * @param idType The type of ID for error messages
 * @returns The validated ID
 * @throws Error if ID is invalid
 */
export function assertValidId<T extends string>(
  id: string | undefined,
  idType: string
): asserts id is string {
  if (!id || !isValidUUID(id)) {
    throw new Error(`Invalid ${idType}: must be a valid UUID`);
  }
}

/**
 * Check if a string is a valid UUID v4
 */
function isValidUUID(value: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
}

/**
 * Get nested value from object using dot notation
 */
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

/**
 * Set nested value in object using dot notation
 */
function setNestedValue(obj: any, path: string, value: any): void {
  const keys = path.split('.');
  const lastKey = keys.pop()!;
  const target = keys.reduce((current, key) => {
    if (!(key in current)) {
      current[key] = {};
    }
    return current[key];
  }, obj);
  target[lastKey] = value;
}

/**
 * Type guard for checking if value is a valid branded ID
 */
export function isBrandedId<T extends string>(
  value: unknown,
  validator: (value: unknown) => value is T
): value is T {
  return typeof value === 'string' && isValidUUID(value) && validator(value);
}

/**
 * Batch validate multiple IDs
 * @param ids Object with ID fields to validate
 * @returns Object with validated IDs
 * @throws Error if any ID is invalid
 */
export function validateIdBatch<T extends Record<string, string | undefined>>(
  ids: T
): T {
  const validated = {} as T;
  
  for (const [key, value] of Object.entries(ids)) {
    if (value !== undefined) {
      assertValidId(value, key);
      validated[key as keyof T] = value as T[keyof T];
    }
  }
  
  return validated;
}