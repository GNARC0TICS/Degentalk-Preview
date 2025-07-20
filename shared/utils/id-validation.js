/**
 * UUID-First ID Validation Utilities
 *
 * Runtime guards and helpers to enforce UUID-first architecture
 */
import { z } from 'zod';
/**
 * Runtime UUID validation
 */
export function isValidUUID(value) {
    if (typeof value !== 'string')
        return false;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(value);
}
/**
 * Generic ID validation with branded types
 */
export function isValidId(id) {
    return isValidUUID(id);
}
/**
 * Specific ID type guards
 */
export function isUserId(id) {
    return isValidUUID(id);
}
export function isThreadId(id) {
    return isValidUUID(id);
}
export function isPostId(id) {
    return isValidUUID(id);
}
export function isMissionId(id) {
    return isValidUUID(id);
}
export function isAchievementId(id) {
    return isValidUUID(id);
}
/**
 * Zod schemas for UUID validation
 */
export const uuidSchema = z.string().uuid('Invalid UUID format');
export const userIdSchema = uuidSchema.transform((val) => val);
export const threadIdSchema = uuidSchema.transform((val) => val);
export const postIdSchema = uuidSchema.transform((val) => val);
export const missionIdSchema = uuidSchema.transform((val) => val);
export const achievementIdSchema = uuidSchema.transform((val) => val);
/**
 * Safe ID parsing from request params
 */
export function parseUserId(param) {
    if (!isUserId(param)) {
        throw new Error(`Invalid user ID: ${param}`);
    }
    return param;
}
export function parseThreadId(param) {
    if (!isThreadId(param)) {
        throw new Error(`Invalid thread ID: ${param}`);
    }
    return param;
}
export function parsePostId(param) {
    if (!isPostId(param)) {
        throw new Error(`Invalid post ID: ${param}`);
    }
    return param;
}
export function parseMissionId(param) {
    if (!isMissionId(param)) {
        throw new Error(`Invalid mission ID: ${param}`);
    }
    return param;
}
export function parseAchievementId(param) {
    if (!isAchievementId(param)) {
        throw new Error(`Invalid achievement ID: ${param}`);
    }
    return param;
}
/**
 * Request parameter validation middleware
 */
export function validateUUIDParam(paramName) {
    return (req, res, next) => {
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
export function validateRouteParams(params, validators) {
    const schema = z.object(validators);
    return schema.parse(params);
}
/**
 * Legacy compatibility - throws error for integer IDs
 */
export function rejectIntegerId(value) {
    if (typeof value === 'number' || (typeof value === 'string' && /^\d+$/.test(value))) {
        throw new Error('Integer IDs are not allowed in UUID-first architecture. ' +
            'Please ensure all IDs are UUIDs.');
    }
    throw new Error('Invalid ID format');
}
