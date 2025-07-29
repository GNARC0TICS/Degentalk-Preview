/**
 * Forum Domain Types - Secure & Performance-Optimized
 *
 * Clean, permission-aware forum types with proper separation
 * between public, authenticated, and moderation data.
 */
// Type guards
export const isPublicThreadSafe = (data) => {
    return (data &&
        typeof data.id === 'string' &&
        typeof data.title === 'string' &&
        !data.moderationReason && // No moderation data
        !data.pluginData && // No system data
        !data.uuid); // No internal IDs
};
export const isForumModerator = (user, forumId) => {
    return (user &&
        (user.role === 'admin' ||
            user.role === 'owner' ||
            (user.permissions && user.permissions.includes(`forum.moderate.${forumId}`))));
};
