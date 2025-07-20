/* eslint-disable degen/no-missing-branded-id-import */
/**
 * Frontend-Safe ID Types
 *
 * String-based branded types for frontend use.
 * These provide type safety without exposing database internals.
 */
export const isValidUUID = (id) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
};
// Re-export validators from utils/id
export { isValidId, createIdValidator, isUserId, isThreadId, isPostId, isWalletId, isTransactionId, isForumId, isItemId, isFrameId, isBadgeId, isTitleId } from '../utils/id.js';
/**
 * ⚠️ DEPRECATED - SECURITY VULNERABILITY ⚠️
 *
 * These ID casting helpers bypass all validation and create security vulnerabilities.
 * They allow any string to become a branded ID without UUID validation.
 *
 * DO NOT USE THESE FUNCTIONS
 * Use the validated conversion functions from @shared/utils/id instead:
 * - toId() for generic conversions with validation
 * - parseId() for parsing with validation
 * - isValidId() to check validity
 *
 * For controllers, use:
 * - validateAndConvertId() from @core/helpers/validate-controller-ids
 * - SafeIdConverter from @core/helpers/safe-id-converter
 *
 * These unsafe functions will be removed in the next major version.
 *
 * @deprecated These functions are security vulnerabilities - use validated alternatives
 */
// ID casting helpers - DEPRECATED AND UNSAFE
/** @deprecated SECURITY: Use toId<'User'>() from @shared/utils/id instead */
export const asUserId = (id) => {
    console.error('SECURITY WARNING: asUserId() bypasses validation. Use toId() instead.');
    return id;
};
/** @deprecated SECURITY: Use toId<'Thread'>() from @shared/utils/id instead */
export const asThreadId = (id) => {
    console.error('SECURITY WARNING: asThreadId() bypasses validation. Use toId() instead.');
    return id;
};
/** @deprecated SECURITY: Use toId<'Post'>() from @shared/utils/id instead */
export const asPostId = (id) => {
    console.error('SECURITY WARNING: asPostId() bypasses validation. Use toId() instead.');
    return id;
};
/** @deprecated SECURITY: Use toId<'Wallet'>() from @shared/utils/id instead */
export const asWalletId = (id) => {
    console.error('SECURITY WARNING: asWalletId() bypasses validation. Use toId() instead.');
    return id;
};
/** @deprecated SECURITY: Use toId<'Transaction'>() from @shared/utils/id instead */
export const asTransactionId = (id) => {
    console.error('SECURITY WARNING: asTransactionId() bypasses validation. Use toId() instead.');
    return id;
};
/** @deprecated SECURITY: Use toId<'Forum'>() from @shared/utils/id instead */
export const asForumId = (id) => {
    console.error('SECURITY WARNING: asForumId() bypasses validation. Use toId() instead.');
    return id;
};
/** @deprecated SECURITY: Use toId<'Item'>() from @shared/utils/id instead */
export const asItemId = (id) => {
    console.error('SECURITY WARNING: asItemId() bypasses validation. Use toId() instead.');
    return id;
};
/** @deprecated SECURITY: Use toId<'Frame'>() from @shared/utils/id instead */
export const asFrameId = (id) => {
    console.error('SECURITY WARNING: asFrameId() bypasses validation. Use toId() instead.');
    return id;
};
/** @deprecated SECURITY: Use toId<'Badge'>() from @shared/utils/id instead */
export const asBadgeId = (id) => {
    console.error('SECURITY WARNING: asBadgeId() bypasses validation. Use toId() instead.');
    return id;
};
/** @deprecated SECURITY: Use toId<'Title'>() from @shared/utils/id instead */
export const asTitleId = (id) => {
    console.error('SECURITY WARNING: asTitleId() bypasses validation. Use toId() instead.');
    return id;
};
// Dictionary & content ID casting helpers - DEPRECATED
/** @deprecated SECURITY: Use toId<'DictionaryEntry'>() from @shared/utils/id instead */
export const asDictionaryEntryId = (id) => {
    console.error('SECURITY WARNING: asDictionaryEntryId() bypasses validation. Use toId() instead.');
    return id;
};
/** @deprecated SECURITY: Use toId<'Entry'>() from @shared/utils/id instead */
export const asEntryId = (id) => {
    console.error('SECURITY WARNING: asEntryId() bypasses validation. Use toId() instead.');
    return id;
};
/** @deprecated SECURITY: Use toId<'Rule'>() from @shared/utils/id instead */
export const asRuleId = (id) => {
    console.error('SECURITY WARNING: asRuleId() bypasses validation. Use toId() instead.');
    return id;
};
// Settings & configuration ID casting helpers - DEPRECATED
/** @deprecated SECURITY: Use toId<'Setting'>() from @shared/utils/id instead */
export const asSettingId = (id) => {
    console.error('SECURITY WARNING: asSettingId() bypasses validation. Use toId() instead.');
    return id;
};
/** @deprecated SECURITY: Use toId<'Config'>() from @shared/utils/id instead */
export const asConfigId = (id) => {
    console.error('SECURITY WARNING: asConfigId() bypasses validation. Use toId() instead.');
    return id;
};
/** @deprecated SECURITY: Use toId<'LogEntry'>() from @shared/utils/id instead */
export const asLogEntryId = (id) => {
    console.error('SECURITY WARNING: asLogEntryId() bypasses validation. Use toId() instead.');
    return id;
};
/** @deprecated SECURITY: Use toId<'AuditLog'>() from @shared/utils/id instead */
export const asAuditLogId = (id) => {
    console.error('SECURITY WARNING: asAuditLogId() bypasses validation. Use toId() instead.');
    return id;
};
/** @deprecated SECURITY: Use toId<'Notification'>() from @shared/utils/id instead */
export const asNotificationId = (id) => {
    console.error('SECURITY WARNING: asNotificationId() bypasses validation. Use toId() instead.');
    return id;
};
// Sticker & pack ID casting helpers - DEPRECATED
/** @deprecated SECURITY: Use toId<'Sticker'>() from @shared/utils/id instead */
export const asStickerId = (id) => {
    console.error('SECURITY WARNING: asStickerId() bypasses validation. Use toId() instead.');
    return id;
};
/** @deprecated SECURITY: Use toId<'Pack'>() from @shared/utils/id instead */
export const asPackId = (id) => {
    console.error('SECURITY WARNING: asPackId() bypasses validation. Use toId() instead.');
    return id;
};
// Social ID casting helpers - DEPRECATED
/** @deprecated SECURITY: Use toId<'Friend'>() from @shared/utils/id instead */
export const asFriendId = (id) => {
    console.error('SECURITY WARNING: asFriendId() bypasses validation. Use toId() instead.');
    return id;
};
/** @deprecated SECURITY: Use toId<'Follow'>() from @shared/utils/id instead */
export const asFollowId = (id) => {
    console.error('SECURITY WARNING: asFollowId() bypasses validation. Use toId() instead.');
    return id;
};
/** @deprecated SECURITY: Use toId<'Request'>() from @shared/utils/id instead */
export const asRequestId = (id) => {
    console.error('SECURITY WARNING: asRequestId() bypasses validation. Use toId() instead.');
    return id;
};
// Additional casting helpers for common forum types - DEPRECATED
/** @deprecated SECURITY: Use toId<'Structure'>() from @shared/utils/id instead */
export const asStructureId = (id) => {
    console.error('SECURITY WARNING: asStructureId() bypasses validation. Use toId() instead.');
    return id;
};
/** @deprecated SECURITY: Use toId<'Tag'>() from @shared/utils/id instead */
export const asTagId = (id) => {
    console.error('SECURITY WARNING: asTagId() bypasses validation. Use toId() instead.');
    return id;
};
/** @deprecated SECURITY: Use toId<'Prefix'>() from @shared/utils/id instead */
export const asPrefixId = (id) => {
    console.error('SECURITY WARNING: asPrefixId() bypasses validation. Use toId() instead.');
    return id;
};
/** @deprecated SECURITY: Use toId<'Category'>() from @shared/utils/id instead */
export const asCategoryId = (id) => {
    console.error('SECURITY WARNING: asCategoryId() bypasses validation. Use toId() instead.');
    return id;
};
/** @deprecated SECURITY: Use toId<'Zone'>() from @shared/utils/id instead */
export const asZoneId = (id) => {
    console.error('SECURITY WARNING: asZoneId() bypasses validation. Use toId() instead.');
    return id;
};
