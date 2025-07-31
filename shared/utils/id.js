/**
 * UUID ID Utilities for UUID Migration
 *
 * Provides type-safe ID conversion and validation utilities for the migration
 * from numeric IDs to UUID-based branded types.
 */
/**
 * Validates if a string is a valid UUID format
 */
export function isValidId(value) {
    if (typeof value !== 'string')
        return false;
    // UUID v4 regex pattern
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(value);
}
/**
 * Type-safe ID constructor that ensures proper branding
 */
export function toId(value) {
    if (!isValidId(value)) {
        throw new Error(`Invalid ID format: ${value}. Expected UUID format.`);
    }
    return value;
}
/**
 * Strict UUID validation (throws on invalid)
 */
export function validateUuid(value) {
    if (!isValidId(value)) {
        throw new Error(`Invalid UUID: ${value}`);
    }
    return value;
}
/**
 * Safe ID parsing that returns null on failure
 */
export function parseId(value) {
    try {
        if (typeof value === 'string' && isValidId(value)) {
            return value;
        }
        return null;
    }
    catch {
        return null;
    }
}
// Legacy toInt function removed - use UUID-based branded types instead
/**
 * Generic helper to create a branded ID validator
 */
export const createIdValidator = () => (id) => isValidId(id);
// Specific ID validators
export const isUserId = createIdValidator();
export const isThreadId = createIdValidator();
export const isPostId = createIdValidator();
export const isWalletId = createIdValidator();
export const isTransactionId = createIdValidator();
export const isForumId = createIdValidator();
export const isItemId = createIdValidator();
export const isFrameId = createIdValidator();
export const isBadgeId = createIdValidator();
export const isTitleId = createIdValidator();
/**
 * Generate a new UUID v4
 */
export function generateId() {
    // Use crypto.randomUUID if available (Node 14.17+, modern browsers)
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    // Fallback implementation
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c == 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}
/**
 * Check if two IDs are equal (type-safe comparison)
 */
export function idsEqual(a, b) {
    return a === b;
}
/**
 * Filter out null/undefined IDs from an array
 */
export function filterValidIds(ids) {
    return ids.filter((id) => id != null && isValidId(id));
}
/**
 * Convert route parameter to typed ID
 * Replaces parseInt() patterns for ID parameters
 */
export function parseIdParam(param) {
    if (!param || !isValidId(param)) {
        return null;
    }
    return param;
}
/**
 * Validate and assert ID is valid UUID
 * Throws error for better debugging
 */
export function assertValidId(id, paramName = 'id') {
    if (!id || !isValidId(id)) {
        throw new Error(`Invalid ${paramName}: must be a valid UUID`);
    }
}
/**
 * Legacy support for numeric validation during migration
 * Use this for entities that haven't been migrated to UUIDs yet
 */
export function isValidNumericId(id) {
    if (!id)
        return false;
    const num = Number(id);
    return !isNaN(num) && num > 0 && Number.isInteger(num);
}
/**
 * Convert route parameter to entity ID (supports both numeric and UUID)
 * For gradual migration scenarios
 */
export function parseEntityIdParam(param) {
    if (!param)
        return null;
    // Try UUID first
    if (isValidId(param)) {
        return param;
    }
    // Fall back to numeric for legacy support
    const num = parseInt(param);
    if (!isNaN(num) && num > 0) {
        return num;
    }
    return null;
}
/**
 * Specific ID creation helpers for common types
 * These bypass validation for mock data and tests
 */
export const toUserId = (id) => id;
export const toThreadId = (id) => id;
export const toPostId = (id) => id;
export const toForumId = (id) => id;
export const toStructureId = (id) => id;
export const toTransactionId = (id) => id;
export const toWalletId = (id) => id;
export const toItemId = (id) => id;
export const toFrameId = (id) => id;
export const toBadgeId = (id) => id;
export const toTitleId = (id) => id;
export const toTagId = (id) => id;
export const toMissionId = (id) => id;
export const toAchievementId = (id) => id;
export const toProductId = (id) => id;
export const toPathId = (id) => id;
export const toAdminId = (id) => id;
export const toReportId = (id) => id;
export const toConversationId = (id) => id;
export const toMessageId = (id) => id;
export const toRoomId = (id) => id;
export const toLevelId = (id) => id;
export const toEntityId = (id) => id;
