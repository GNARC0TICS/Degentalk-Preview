/**
 * Type Validation Utilities
 *
 * Runtime type validation helpers and guards.
 * Ensures type safety at API boundaries and data ingestion points.
 */
// UUID validation
export function isValidUuid(value) {
    if (typeof value !== 'string')
        return false;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(value);
}
// Branded ID validation
export function isValidUserId(value) {
    return isValidUuid(value);
}
// Generic ID validator factory
export function createIdValidator(brand) {
    return (value) => isValidUuid(value);
}
// Date validation
export function isValidDate(value) {
    return value instanceof Date && !isNaN(value.getTime());
}
export function isValidDateString(value) {
    if (typeof value !== 'string')
        return false;
    const date = new Date(value);
    return isValidDate(date);
}
// Number validation
export function isPositiveNumber(value) {
    return typeof value === 'number' && value > 0 && !isNaN(value);
}
export function isNonNegativeNumber(value) {
    return typeof value === 'number' && value >= 0 && !isNaN(value);
}
export function isValidAmount(value, decimals = 8) {
    if (!isNonNegativeNumber(value))
        return false;
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) === value * factor;
}
// String validation
export function isNonEmptyString(value) {
    return typeof value === 'string' && value.trim().length > 0;
}
export function isValidEmail(value) {
    if (!isNonEmptyString(value))
        return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
}
export function isValidUsername(value) {
    if (!isNonEmptyString(value))
        return false;
    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
    return usernameRegex.test(value);
}
// Array validation
export function isNonEmptyArray(value) {
    return Array.isArray(value) && value.length > 0;
}
export function isArrayOf(value, validator) {
    return Array.isArray(value) && value.every(validator);
}
// Object validation
export function hasProperty(obj, prop) {
    return typeof obj === 'object' && obj !== null && prop in obj;
}
export function hasProperties(obj, props) {
    return props.every((prop) => hasProperty(obj, prop));
}
// API validation helpers
export function validateApiInput(value, validator) {
    if (!validator(value)) {
        throw new Error('Invalid input format');
    }
    return value;
}
export function validateOptionalInput(value, validator) {
    if (value === undefined || value === null) {
        return undefined;
    }
    return validateApiInput(value, validator);
}
// Enum validation
export function isEnumValue(enumObject, value) {
    return Object.values(enumObject).includes(value);
}
// Complex validation helpers
export function validatePaginationParams(value) {
    if (typeof value !== 'object' || value === null) {
        return { page: 1, limit: 20 };
    }
    const obj = value;
    const page = typeof obj.page === 'number' && obj.page > 0 ? obj.page : 1;
    const limit = typeof obj.limit === 'number' && obj.limit > 0 && obj.limit <= 100 ? obj.limit : 20;
    return { page, limit };
}
export function validateSortParams(value) {
    if (typeof value !== 'object' || value === null) {
        return {};
    }
    const obj = value;
    const result = {};
    if (isNonEmptyString(obj.sortBy)) {
        result.sortBy = obj.sortBy;
    }
    if (obj.sortOrder === 'asc' || obj.sortOrder === 'desc') {
        result.sortOrder = obj.sortOrder;
    }
    return result;
}
// Error handling
export class ValidationError extends Error {
    field;
    code;
    constructor(message, field, code) {
        super(message);
        this.field = field;
        this.code = code;
        this.name = 'ValidationError';
    }
}
export function createValidationError(message, field, code) {
    return new ValidationError(message, field, code);
}
