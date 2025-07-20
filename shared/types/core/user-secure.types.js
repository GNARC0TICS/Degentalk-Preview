/**
 * Security-Enhanced User Types
 *
 * GDPR-compliant, audit-ready user type definitions with proper
 * separation between public, authenticated, and admin-only data.
 *
 * Re-exports from the user domain for cross-domain usage.
 */
// Type guards and utilities for secure user handling
export const isPublicUserSafe = (data) => {
    return (data &&
        typeof data.id === 'string' &&
        typeof data.username === 'string' &&
        !data.email && // Ensure no email leaked
        !data.ipAddress && // Ensure no IP leaked
        !data.password); // Ensure no password leaked
};
export const hasAdminPermission = (user, permission) => {
    return (user.role === 'admin' ||
        user.role === 'owner' ||
        (user.permissions && user.permissions.includes(permission)));
};
