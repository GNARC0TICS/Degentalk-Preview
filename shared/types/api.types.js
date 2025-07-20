// Common error codes
export var ApiErrorCode;
(function (ApiErrorCode) {
    // Authentication & Authorization
    ApiErrorCode["UNAUTHORIZED"] = "UNAUTHORIZED";
    ApiErrorCode["FORBIDDEN"] = "FORBIDDEN";
    ApiErrorCode["TOKEN_EXPIRED"] = "TOKEN_EXPIRED";
    // Validation
    ApiErrorCode["VALIDATION_ERROR"] = "VALIDATION_ERROR";
    ApiErrorCode["INVALID_REQUEST"] = "INVALID_REQUEST";
    ApiErrorCode["MISSING_FIELD"] = "MISSING_FIELD";
    // Resources
    ApiErrorCode["NOT_FOUND"] = "NOT_FOUND";
    ApiErrorCode["ALREADY_EXISTS"] = "ALREADY_EXISTS";
    // Operations
    ApiErrorCode["OPERATION_FAILED"] = "OPERATION_FAILED";
    ApiErrorCode["RATE_LIMITED"] = "RATE_LIMITED";
    // System
    ApiErrorCode["INTERNAL_ERROR"] = "INTERNAL_ERROR";
    ApiErrorCode["SERVICE_UNAVAILABLE"] = "SERVICE_UNAVAILABLE";
    // Domain-specific
    ApiErrorCode["INSUFFICIENT_FUNDS"] = "INSUFFICIENT_FUNDS";
    ApiErrorCode["INVALID_PERMISSIONS"] = "INVALID_PERMISSIONS";
})(ApiErrorCode || (ApiErrorCode = {}));
