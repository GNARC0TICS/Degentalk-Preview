/**
 * User Domain Types - Security-First Implementation
 *
 * GDPR-compliant, audit-ready user type definitions with proper
 * separation between public, authenticated, and admin-only data.
 */
// Type guards for runtime validation
export const isPublicUserSafe = (data) => {
    return (data &&
        typeof data.id === 'string' &&
        typeof data.username === 'string' &&
        !data.email && // Ensure no email leaked
        !data.ipAddress && // Ensure no IP leaked
        !data.password); // Ensure no password leaked
};
export const hasAdminPermission = (user, permission) => {
    // Implementation for role-based permission checking
    return (user.role === 'admin' ||
        user.role === 'owner' ||
        (user.permissions && user.permissions.includes(permission)));
};
