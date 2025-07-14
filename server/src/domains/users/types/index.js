"use strict";
/**
 * User Domain Types - Security-First Implementation
 *
 * GDPR-compliant, audit-ready user type definitions with proper
 * separation between public, authenticated, and admin-only data.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasAdminPermission = exports.isPublicUserSafe = void 0;
// Type guards for runtime validation
var isPublicUserSafe = function (data) {
    return (data &&
        typeof data.id === 'string' &&
        typeof data.username === 'string' &&
        !data.email && // Ensure no email leaked
        !data.ipAddress && // Ensure no IP leaked
        !data.password); // Ensure no password leaked
};
exports.isPublicUserSafe = isPublicUserSafe;
var hasAdminPermission = function (user, permission) {
    // Implementation for role-based permission checking
    return (user.role === 'admin' ||
        user.role === 'owner' ||
        (user.permissions && user.permissions.includes(permission)));
};
exports.hasAdminPermission = hasAdminPermission;
