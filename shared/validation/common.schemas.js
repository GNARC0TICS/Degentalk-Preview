"use strict";
/**
 * Common Validation Schemas
 *
 * Reusable Zod schemas to eliminate validation pattern duplication
 * Provides consistent validation across domains
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditActionSchema = exports.channelSchema = exports.notificationTypeSchema = exports.privacyLevelSchema = exports.friendshipStatusSchema = exports.forumAccessLevelSchema = exports.postTypeSchema = exports.threadTypeSchema = exports.transactionTypeSchema = exports.cryptoAddressSchema = exports.dgtAmountSchema = exports.configUpdateSchema = exports.configCreateSchema = exports.featureGateSchema = exports.errorResponseSchema = exports.successResponseSchema = exports.fileUploadSchema = exports.fileSizeSchema = exports.fileTypeSchema = exports.tagsArraySchema = exports.tagSchema = exports.contentSchema = exports.titleSchema = exports.permissionSchema = exports.userRoleSchema = exports.currencySchema = exports.colorSchema = exports.tokenSchema = exports.passwordSchema = exports.searchSchema = exports.sortSchema = exports.paginationSchema = exports.forumId = exports.postId = exports.threadId = exports.groupId = exports.userId = exports.pastDate = exports.futureDate = exports.dateString = exports.username = exports.slug = exports.url = exports.email = exports.trimmedString = exports.nonEmptyString = exports.nonNegativeFloat = exports.positiveFloat = exports.nonNegativeInt = exports.positiveInt = void 0;
exports.slugParamSchema = exports.idParamSchema = exports.apiQuerySchema = exports.paginatedQuerySchema = exports.postCreateSchema = exports.threadCreateSchema = exports.userUpdateSchema = exports.userCreateSchema = exports.versionSchema = exports.coordinatesSchema = exports.durationSchema = exports.timeRangeSchema = void 0;
exports.createArraySchema = createArraySchema;
exports.createOptionalWithDefault = createOptionalWithDefault;
exports.createEnumSchema = createEnumSchema;
exports.validateId = validateId;
exports.validateEmail = validateEmail;
exports.validatePagination = validatePagination;
exports.sanitizeInput = sanitizeInput;
var zod_1 = require("zod");
// Basic primitive validators
exports.positiveInt = zod_1.z.number().int().positive();
exports.nonNegativeInt = zod_1.z.number().int().min(0);
exports.positiveFloat = zod_1.z.number().positive();
exports.nonNegativeFloat = zod_1.z.number().min(0);
// String validators
exports.nonEmptyString = zod_1.z.string().min(1, 'Cannot be empty');
exports.trimmedString = zod_1.z.string().trim();
exports.email = zod_1.z.string().email('Invalid email format');
exports.url = zod_1.z.string().url('Invalid URL format');
exports.slug = zod_1.z.string().regex(/^[a-z0-9-]+$/, 'Invalid slug format');
exports.username = zod_1.z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be less than 20 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens');
// Date validators
exports.dateString = zod_1.z.string().datetime();
exports.futureDate = zod_1.z
    .date()
    .refine(function (date) { return date > new Date(); }, 'Date must be in the future');
exports.pastDate = zod_1.z.date().refine(function (date) { return date < new Date(); }, 'Date must be in the past');
// ID validators (UUID-based)
exports.userId = zod_1.z.string().uuid('Invalid userId format');
exports.groupId = zod_1.z.string().uuid('Invalid groupId format');
exports.threadId = zod_1.z.string().uuid('Invalid threadId format');
exports.postId = zod_1.z.string().uuid('Invalid postId format');
exports.forumId = zod_1.z.string().uuid('Invalid forumId format');
// Pagination schemas
exports.paginationSchema = zod_1.z.object({
    page: zod_1.z.number().int().min(1).default(1),
    limit: zod_1.z.number().int().min(1).max(100).default(20),
    offset: zod_1.z.number().int().min(0).optional()
});
exports.sortSchema = zod_1.z.object({
    sortBy: zod_1.z.string().optional(),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('desc')
});
exports.searchSchema = zod_1.z.object({
    query: zod_1.z.string().min(1).max(100).optional(),
    filters: zod_1.z.record(zod_1.z.any()).optional()
});
// Common field validators
exports.passwordSchema = zod_1.z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be less than 128 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number');
exports.tokenSchema = zod_1.z
    .string()
    .min(32, 'Token must be at least 32 characters')
    .max(512, 'Token must be less than 512 characters');
exports.colorSchema = zod_1.z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color');
exports.currencySchema = zod_1.z.object({
    symbol: zod_1.z.string().min(1).max(10),
    amount: exports.positiveFloat,
    decimals: zod_1.z.number().int().min(0).max(18).default(2)
});
// User role validators
exports.userRoleSchema = zod_1.z.enum(['user', 'moderator', 'admin']);
exports.permissionSchema = zod_1.z.string().min(1);
// Content validators
exports.titleSchema = zod_1.z
    .string()
    .min(1, 'Title cannot be empty')
    .max(200, 'Title must be less than 200 characters');
exports.contentSchema = zod_1.z
    .string()
    .min(1, 'Content cannot be empty')
    .max(50000, 'Content must be less than 50,000 characters');
exports.tagSchema = zod_1.z
    .string()
    .min(1, 'Tag cannot be empty')
    .max(50, 'Tag must be less than 50 characters')
    .regex(/^[a-zA-Z0-9-_]+$/, 'Tag can only contain letters, numbers, hyphens, and underscores');
exports.tagsArraySchema = zod_1.z.array(exports.tagSchema).max(10, 'Cannot have more than 10 tags');
// File upload validators
exports.fileTypeSchema = zod_1.z.enum([
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
    'application/json'
]);
exports.fileSizeSchema = zod_1.z
    .number()
    .min(1, 'File cannot be empty')
    .max(10 * 1024 * 1024, 'File cannot be larger than 10MB'); // 10MB
exports.fileUploadSchema = zod_1.z.object({
    filename: exports.nonEmptyString,
    size: exports.fileSizeSchema,
    type: exports.fileTypeSchema,
    data: zod_1.z.string() // base64 or similar
});
// API response schemas
exports.successResponseSchema = zod_1.z.object({
    success: zod_1.z.literal(true),
    data: zod_1.z.any(),
    meta: zod_1.z
        .object({
        pagination: exports.paginationSchema.optional(),
        timestamp: exports.dateString.optional()
    })
        .optional()
});
exports.errorResponseSchema = zod_1.z.object({
    success: zod_1.z.literal(false),
    error: exports.nonEmptyString,
    code: zod_1.z.string().optional(),
    details: zod_1.z.any().optional(),
    timestamp: exports.dateString.optional()
});
// Configuration schemas
exports.featureGateSchema = zod_1.z.object({
    id: exports.nonEmptyString,
    name: exports.nonEmptyString,
    description: exports.nonEmptyString,
    enabled: zod_1.z.boolean(),
    minLevel: exports.nonNegativeInt.optional(),
    devOnly: zod_1.z.boolean().optional(),
    rolloutPercentage: zod_1.z.number().min(0).max(100).optional()
});
exports.configCreateSchema = zod_1.z.object({
    field: exports.nonEmptyString,
    value: zod_1.z.any(),
    reason: zod_1.z.string()
});
exports.configUpdateSchema = exports.configCreateSchema.partial();
// Wallet/Economy schemas
exports.dgtAmountSchema = zod_1.z
    .number()
    .min(0.000001, 'Amount must be greater than 0')
    .max(1000000, 'Amount cannot exceed 1,000,000 DGT');
exports.cryptoAddressSchema = zod_1.z
    .string()
    .min(20, 'Invalid crypto address')
    .max(100, 'Invalid crypto address');
exports.transactionTypeSchema = zod_1.z.enum([
    'deposit',
    'withdrawal',
    'transfer',
    'tip',
    'purchase',
    'reward',
    'refund'
]);
// Forum-specific schemas
exports.threadTypeSchema = zod_1.z.enum(['discussion', 'question', 'announcement', 'poll']);
exports.postTypeSchema = zod_1.z.enum(['post', 'reply']);
exports.forumAccessLevelSchema = zod_1.z.enum(['public', 'registered', 'level_10+', 'mod', 'admin']);
// Social features schemas
exports.friendshipStatusSchema = zod_1.z.enum(['pending', 'accepted', 'blocked', 'declined']);
exports.privacyLevelSchema = zod_1.z.enum(['public', 'friends', 'private']);
// Notification schemas
exports.notificationTypeSchema = zod_1.z.enum([
    'mention',
    'reply',
    'friend_request',
    'achievement',
    'system',
    'tip_received'
]);
exports.channelSchema = zod_1.z.enum(['email', 'sms', 'push', 'webhook']);
// Admin schemas
exports.auditActionSchema = zod_1.z.enum([
    'create',
    'update',
    'delete',
    'login',
    'logout',
    'permission_change'
]);
// Time-based validators
exports.timeRangeSchema = zod_1.z
    .object({
    start: zod_1.z.date(),
    end: zod_1.z.date()
})
    .refine(function (data) { return data.end > data.start; }, 'End date must be after start date');
exports.durationSchema = zod_1.z.object({
    value: exports.positiveInt,
    unit: zod_1.z.enum(['seconds', 'minutes', 'hours', 'days', 'weeks', 'months'])
});
// Complex object validators
exports.coordinatesSchema = zod_1.z.object({
    latitude: zod_1.z.number().min(-90).max(90),
    longitude: zod_1.z.number().min(-180).max(180)
});
exports.versionSchema = zod_1.z
    .string()
    .regex(/^\d+\.\d+\.\d+$/, 'Must be in semver format (x.y.z)');
// Utility functions for schema composition
function createArraySchema(itemSchema, minItems, maxItems) {
    if (minItems === void 0) { minItems = 0; }
    if (maxItems === void 0) { maxItems = 100; }
    return zod_1.z.array(itemSchema).min(minItems).max(maxItems);
}
function createOptionalWithDefault(schema, defaultValue) {
    return schema.default(defaultValue);
}
function createEnumSchema(values, errorMessage) {
    return zod_1.z.enum(values, {
        errorMap: function () { return ({ message: errorMessage || "Must be one of: ".concat(values.join(', ')) }); }
    });
}
// Schema combinations for common use cases
exports.userCreateSchema = zod_1.z.object({
    username: exports.username,
    email: exports.email,
    password: exports.passwordSchema,
    role: exports.userRoleSchema.optional()
});
exports.userUpdateSchema = exports.userCreateSchema.partial().omit({ password: true });
exports.threadCreateSchema = zod_1.z.object({
    title: exports.titleSchema,
    content: exports.contentSchema,
    forumId: exports.forumId,
    tags: exports.tagsArraySchema.optional(),
    type: exports.threadTypeSchema.optional()
});
exports.postCreateSchema = zod_1.z.object({
    content: exports.contentSchema,
    threadId: exports.threadId,
    replyToPostId: exports.postId.optional()
});
exports.paginatedQuerySchema = exports.paginationSchema.merge(exports.sortSchema).merge(exports.searchSchema);
// Export commonly used combinations
exports.apiQuerySchema = exports.paginatedQuerySchema;
exports.idParamSchema = zod_1.z.object({ id: zod_1.z.string().uuid('Invalid ID format') });
exports.slugParamSchema = zod_1.z.object({ slug: exports.slug });
// Validation helper functions
function validateId(id) {
    return zod_1.z.string().uuid().parse(id);
}
function validateEmail(email) {
    return email.parse(email);
}
function validatePagination(query) {
    return exports.paginationSchema.parse(query);
}
function sanitizeInput(input) {
    if (typeof input !== 'string') {
        throw new Error('Input must be a string');
    }
    return input.trim().substring(0, 10000); // Prevent excessively long inputs
}
