"use strict";
/**
 * UUID-First ID Validation Utilities
 *
 * Runtime guards and helpers to enforce UUID-first architecture
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.commonSchemas = exports.achievementIdSchema = exports.missionIdSchema = exports.postIdSchema = exports.threadIdSchema = exports.userIdSchema = exports.uuidSchema = void 0;
exports.isValidUUID = isValidUUID;
exports.isValidId = isValidId;
exports.isUserId = isUserId;
exports.isThreadId = isThreadId;
exports.isPostId = isPostId;
exports.isMissionId = isMissionId;
exports.isAchievementId = isAchievementId;
exports.parseUserId = parseUserId;
exports.parseThreadId = parseThreadId;
exports.parsePostId = parsePostId;
exports.parseMissionId = parseMissionId;
exports.parseAchievementId = parseAchievementId;
exports.validateUUIDParam = validateUUIDParam;
exports.validateRouteParams = validateRouteParams;
exports.rejectIntegerId = rejectIntegerId;
var zod_1 = require("zod");
/**
 * Runtime UUID validation
 */
function isValidUUID(value) {
    if (typeof value !== 'string')
        return false;
    var uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(value);
}
/**
 * Generic ID validation with branded types
 */
function isValidId(id) {
    return isValidUUID(id);
}
/**
 * Specific ID type guards
 */
function isUserId(id) {
    return isValidUUID(id);
}
function isThreadId(id) {
    return isValidUUID(id);
}
function isPostId(id) {
    return isValidUUID(id);
}
function isMissionId(id) {
    return isValidUUID(id);
}
function isAchievementId(id) {
    return isValidUUID(id);
}
/**
 * Zod schemas for UUID validation
 */
exports.uuidSchema = zod_1.z.string().uuid('Invalid UUID format');
exports.userIdSchema = exports.uuidSchema.transform(function (val) { return val; });
exports.threadIdSchema = exports.uuidSchema.transform(function (val) { return val; });
exports.postIdSchema = exports.uuidSchema.transform(function (val) { return val; });
exports.missionIdSchema = exports.uuidSchema.transform(function (val) { return val; });
exports.achievementIdSchema = exports.uuidSchema.transform(function (val) { return val; });
/**
 * Safe ID parsing from request params
 */
function parseUserId(param) {
    if (!isUserId(param)) {
        throw new Error("Invalid user ID: ".concat(param));
    }
    return param;
}
function parseThreadId(param) {
    if (!isThreadId(param)) {
        throw new Error("Invalid thread ID: ".concat(param));
    }
    return param;
}
function parsePostId(param) {
    if (!isPostId(param)) {
        throw new Error("Invalid post ID: ".concat(param));
    }
    return param;
}
function parseMissionId(param) {
    if (!isMissionId(param)) {
        throw new Error("Invalid mission ID: ".concat(param));
    }
    return param;
}
function parseAchievementId(param) {
    if (!isAchievementId(param)) {
        throw new Error("Invalid achievement ID: ".concat(param));
    }
    return param;
}
/**
 * Request parameter validation middleware
 */
function validateUUIDParam(paramName) {
    return function (req, res, next) {
        var value = req.params[paramName];
        if (!isValidUUID(value)) {
            return res.status(400).json({
                error: "Invalid ".concat(paramName, ": must be a valid UUID"),
                received: value
            });
        }
        next();
    };
}
/**
 * Common validation schemas for API routes
 */
exports.commonSchemas = {
    userId: exports.userIdSchema,
    threadId: exports.threadIdSchema,
    postId: exports.postIdSchema,
    missionId: exports.missionIdSchema,
    achievementId: exports.achievementIdSchema,
    // Optional variants
    userIdOptional: exports.userIdSchema.optional(),
    threadIdOptional: exports.threadIdSchema.optional(),
    postIdOptional: exports.postIdSchema.optional(),
    // Array variants
    userIds: zod_1.z.array(exports.userIdSchema),
    threadIds: zod_1.z.array(exports.threadIdSchema),
    postIds: zod_1.z.array(exports.postIdSchema)
};
/**
 * Route param validation helper
 */
function validateRouteParams(params, validators) {
    var schema = zod_1.z.object(validators);
    return schema.parse(params);
}
/**
 * Legacy compatibility - throws error for integer IDs
 */
function rejectIntegerId(value) {
    if (typeof value === 'number' || (typeof value === 'string' && /^\d+$/.test(value))) {
        throw new Error('Integer IDs are not allowed in UUID-first architecture. ' +
            'Please ensure all IDs are UUIDs.');
    }
    throw new Error('Invalid ID format');
}
