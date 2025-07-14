"use strict";
/**
 * UUID ID Utilities for UUID Migration
 *
 * Provides type-safe ID conversion and validation utilities for the migration
 * from numeric IDs to UUID-based branded types.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.toId = toId;
exports.isValidId = isValidId;
exports.validateUuid = validateUuid;
exports.parseId = parseId;
exports.generateId = generateId;
exports.idsEqual = idsEqual;
exports.filterValidIds = filterValidIds;
exports.parseIdParam = parseIdParam;
exports.assertValidId = assertValidId;
exports.isValidNumericId = isValidNumericId;
exports.parseEntityIdParam = parseEntityIdParam;
/**
 * Type-safe ID constructor that ensures proper branding
 */
function toId(value) {
    if (!isValidId(value)) {
        throw new Error("Invalid ID format: ".concat(value, ". Expected UUID format."));
    }
    return value;
}
/**
 * Validates if a string is a valid UUID format
 */
function isValidId(value) {
    if (typeof value !== 'string')
        return false;
    // UUID v4 regex pattern
    var uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(value);
}
/**
 * Strict UUID validation (throws on invalid)
 */
function validateUuid(value) {
    if (!isValidId(value)) {
        throw new Error("Invalid UUID: ".concat(value));
    }
    return value;
}
/**
 * Safe ID parsing that returns null on failure
 */
function parseId(value) {
    try {
        if (typeof value === 'string' && isValidId(value)) {
            return value;
        }
        return null;
    }
    catch (_a) {
        return null;
    }
}
// Legacy toInt function removed - use UUID-based branded types instead
/**
 * Generate a new UUID v4
 */
function generateId() {
    // Use crypto.randomUUID if available (Node 14.17+, modern browsers)
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    // Fallback implementation
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (Math.random() * 16) | 0;
        var v = c == 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}
/**
 * Check if two IDs are equal (type-safe comparison)
 */
function idsEqual(a, b) {
    return a === b;
}
/**
 * Filter out null/undefined IDs from an array
 */
function filterValidIds(ids) {
    return ids.filter(function (id) { return id != null && isValidId(id); });
}
/**
 * Convert route parameter to typed ID
 * Replaces parseInt() patterns for ID parameters
 */
function parseIdParam(param) {
    if (!param || !isValidId(param)) {
        return null;
    }
    return param;
}
/**
 * Validate and assert ID is valid UUID
 * Throws error for better debugging
 */
function assertValidId(id, paramName) {
    if (paramName === void 0) { paramName = 'id'; }
    if (!id || !isValidId(id)) {
        throw new Error("Invalid ".concat(paramName, ": must be a valid UUID"));
    }
}
/**
 * Legacy support for numeric validation during migration
 * Use this for entities that haven't been migrated to UUIDs yet
 */
function isValidNumericId(id) {
    if (!id)
        return false;
    var num = Number(id);
    return !isNaN(num) && num > 0 && Number.isInteger(num);
}
/**
 * Convert route parameter to entity ID (supports both numeric and UUID)
 * For gradual migration scenarios
 */
function parseEntityIdParam(param) {
    if (!param)
        return null;
    // Try UUID first
    if (isValidId(param)) {
        return param;
    }
    // Fall back to numeric for legacy support
    var num = parseInt(param);
    if (!isNaN(num) && num > 0) {
        return num;
    }
    return null;
}
