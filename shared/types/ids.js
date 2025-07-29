/**
 * Frontend-Safe ID Types
 *
 * String-based branded types for frontend use.
 * These provide type safety without exposing database internals.
 */
// UUID validation
export const isValidUUID = (id) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
};
// Re-export validation functions
export { isValidId, createIdValidator, isUserId, isThreadId, isPostId, isWalletId, isTransactionId, isForumId, isItemId, isFrameId, isBadgeId, isTitleId } from '../utils/id.js';
// asCategoryId function removed - use toId<'Category'>() from @shared/utils/id instead
