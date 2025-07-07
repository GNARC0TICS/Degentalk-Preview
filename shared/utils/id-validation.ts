/**
 * UUID-First ID Validation Utilities
 * 
 * Runtime guards and helpers to enforce UUID-first architecture
 */

import type { UserId, ThreadId, PostId, MissionId, AchievementId } from '@shared/types/ids';
import { z } from 'zod';

/**
 * Runtime UUID validation
 */
export function isValidUUID(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
}

/**
 * Generic ID validation with branded types
 */
export function isValidId<T extends string>(id: unknown): id is T {
  return isValidUUID(id);
}

/**
 * Specific ID type guards
 */
export function isUserId(id: unknown): id is UserId {
  return isValidUUID(id);
}

export function isThreadId(id: unknown): id is ThreadId {
  return isValidUUID(id);
}

export function isPostId(id: unknown): id is PostId {
  return isValidUUID(id);
}

export function isMissionId(id: unknown): id is MissionId {
  return isValidUUID(id);
}

export function isAchievementId(id: unknown): id is AchievementId {
  return isValidUUID(id);
}

/**
 * Zod schemas for UUID validation
 */
export const uuidSchema = z.string().uuid('Invalid UUID format');

export const userIdSchema = uuidSchema.transform((val): UserId => val as UserId);
export const threadIdSchema = uuidSchema.transform((val): ThreadId => val as ThreadId);
export const postIdSchema = uuidSchema.transform((val): PostId => val as PostId);
export const missionIdSchema = uuidSchema.transform((val): MissionId => val as MissionId);
export const achievementIdSchema = uuidSchema.transform((val): AchievementId => val as AchievementId);

/**
 * Safe ID parsing from request params
 */
export function parseUserId(param: unknown): UserId {
  if (!isUserId(param)) {
    throw new Error(`Invalid user ID: ${param}`);
  }
  return param;
}

export function parseThreadId(param: unknown): ThreadId {
  if (!isThreadId(param)) {
    throw new Error(`Invalid thread ID: ${param}`);
  }
  return param;
}

export function parsePostId(param: unknown): PostId {
  if (!isPostId(param)) {
    throw new Error(`Invalid post ID: ${param}`);
  }
  return param;
}

export function parseMissionId(param: unknown): MissionId {
  if (!isMissionId(param)) {
    throw new Error(`Invalid mission ID: ${param}`);
  }
  return param;
}

export function parseAchievementId(param: unknown): AchievementId {
  if (!isAchievementId(param)) {
    throw new Error(`Invalid achievement ID: ${param}`);
  }
  return param;
}

/**
 * Request parameter validation middleware
 */
export function validateUUIDParam(paramName: string) {
  return (req: any, res: any, next: any) => {
    const value = req.params[paramName];
    if (!isValidUUID(value)) {
      return res.status(400).json({
        error: `Invalid ${paramName}: must be a valid UUID`,
        received: value
      });
    }
    next();
  };
}

/**
 * Common validation schemas for API routes
 */
export const commonSchemas = {
  userId: userIdSchema,
  threadId: threadIdSchema,
  postId: postIdSchema,
  missionId: missionIdSchema,
  achievementId: achievementIdSchema,
  
  // Optional variants
  userIdOptional: userIdSchema.optional(),
  threadIdOptional: threadIdSchema.optional(),
  postIdOptional: postIdSchema.optional(),
  
  // Array variants
  userIds: z.array(userIdSchema),
  threadIds: z.array(threadIdSchema),
  postIds: z.array(postIdSchema)
};

/**
 * Route param validation helper
 */
export function validateRouteParams<T extends Record<string, unknown>>(
  params: T,
  validators: Record<keyof T, z.ZodSchema>
): T {
  const schema = z.object(validators);
  return schema.parse(params);
}

/**
 * Legacy compatibility - throws error for integer IDs
 */
export function rejectIntegerId(value: unknown): never {
  if (typeof value === 'number' || (typeof value === 'string' && /^\d+$/.test(value))) {
    throw new Error(
      'Integer IDs are not allowed in UUID-first architecture. ' +
      'Please ensure all IDs are UUIDs.'
    );
  }
  throw new Error('Invalid ID format');
}