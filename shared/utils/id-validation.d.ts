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
export declare function isValidUUID(value: unknown): value is string;
/**
 * Generic ID validation with branded types
 */
export declare function isValidId<T extends string>(id: unknown): id is T;
/**
 * Specific ID type guards
 */
export declare function isUserId(id: unknown): id is UserId;
export declare function isThreadId(id: unknown): id is ThreadId;
export declare function isPostId(id: unknown): id is PostId;
export declare function isMissionId(id: unknown): id is MissionId;
export declare function isAchievementId(id: unknown): id is AchievementId;
/**
 * Zod schemas for UUID validation
 */
export declare const uuidSchema: z.ZodString;
export declare const userIdSchema: z.ZodEffects<z.ZodString, UserId, string>;
export declare const threadIdSchema: z.ZodEffects<z.ZodString, ThreadId, string>;
export declare const postIdSchema: z.ZodEffects<z.ZodString, PostId, string>;
export declare const missionIdSchema: z.ZodEffects<z.ZodString, MissionId, string>;
export declare const achievementIdSchema: z.ZodEffects<z.ZodString, AchievementId, string>;
/**
 * Safe ID parsing from request params
 */
export declare function parseUserId(param: unknown): UserId;
export declare function parseThreadId(param: unknown): ThreadId;
export declare function parsePostId(param: unknown): PostId;
export declare function parseMissionId(param: unknown): MissionId;
export declare function parseAchievementId(param: unknown): AchievementId;
/**
 * Request parameter validation middleware
 */
export declare function validateUUIDParam(paramName: string): (req: any, res: any, next: any) => any;
/**
 * Common validation schemas for API routes
 */
export declare const commonSchemas: {
    userId: z.ZodEffects<z.ZodString, UserId, string>;
    threadId: z.ZodEffects<z.ZodString, ThreadId, string>;
    postId: z.ZodEffects<z.ZodString, PostId, string>;
    missionId: z.ZodEffects<z.ZodString, MissionId, string>;
    achievementId: z.ZodEffects<z.ZodString, AchievementId, string>;
    userIdOptional: z.ZodOptional<z.ZodEffects<z.ZodString, UserId, string>>;
    threadIdOptional: z.ZodOptional<z.ZodEffects<z.ZodString, ThreadId, string>>;
    postIdOptional: z.ZodOptional<z.ZodEffects<z.ZodString, PostId, string>>;
    userIds: z.ZodArray<z.ZodEffects<z.ZodString, UserId, string>, "many">;
    threadIds: z.ZodArray<z.ZodEffects<z.ZodString, ThreadId, string>, "many">;
    postIds: z.ZodArray<z.ZodEffects<z.ZodString, PostId, string>, "many">;
};
/**
 * Route param validation helper
 */
export declare function validateRouteParams<T extends Record<string, unknown>>(params: T, validators: Record<keyof T, z.ZodSchema>): T;
/**
 * Legacy compatibility - throws error for integer IDs
 */
export declare function rejectIntegerId(value: unknown): never;
