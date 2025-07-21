/**
 * ID Constructor Helpers
 * 
 * These functions create properly branded IDs for use throughout the application.
 * They provide type-safe ID creation and validation.
 */

import type {
  UserId,
  PostId,
  ThreadId,
  ForumId,
  RoleId,
  TitleId,
  BadgeId,
  FrameId,
  ProductId,
  InventoryId,
  AchievementId,
  CategoryId,
  PrefixId,
  DraftId,
  MessageId,
  NotificationId,
  ReportId,
  ContentId,
  EntityId,
  TipId,
  TransactionId,
  WalletId,
  EmojiId,
  TagId,
  ActionId,
  OrderId,
  GroupId,
  AdminUserId,
  ModeratorId,
  PermissionId
} from '../../types/ids.js';

// Generic ID creator function
function createBrandedId<T extends { readonly __tag: string }>(value: string): T {
  return value as unknown as T;
}

// User-related IDs
export function createUserId(id: string): UserId {
  return createBrandedId<UserId>(id);
}

// Content IDs
export function createPostId(id: string): PostId {
  return createBrandedId<PostId>(id);
}

export function createThreadId(id: string): ThreadId {
  return createBrandedId<ThreadId>(id);
}

export function createForumId(id: string): ForumId {
  return createBrandedId<ForumId>(id);
}

export function createCategoryId(id: string): CategoryId {
  return createBrandedId<CategoryId>(id);
}

export function createPrefixId(id: string): PrefixId {
  return createBrandedId<PrefixId>(id);
}

export function createDraftId(id: string): DraftId {
  return createBrandedId<DraftId>(id);
}

// Role and permissions
export function createRoleId(id: string): RoleId {
  return createBrandedId<RoleId>(id);
}

// Cosmetics and achievements
export function createTitleId(id: string): TitleId {
  return createBrandedId<TitleId>(id);
}

export function createBadgeId(id: string): BadgeId {
  return createBrandedId<BadgeId>(id);
}

export function createFrameId(id: string): FrameId {
  return createBrandedId<FrameId>(id);
}

export function createAchievementId(id: string): AchievementId {
  return createBrandedId<AchievementId>(id);
}

// Shop and inventory
export function createProductId(id: string): ProductId {
  return createBrandedId<ProductId>(id);
}

export function createInventoryId(id: string): InventoryId {
  return createBrandedId<InventoryId>(id);
}

// Messaging
export function createMessageId(id: string): MessageId {
  return createBrandedId<MessageId>(id);
}

export function createNotificationId(id: string): NotificationId {
  return createBrandedId<NotificationId>(id);
}

// Moderation
export function createReportId(id: string): ReportId {
  return createBrandedId<ReportId>(id);
}

export function createContentId(id: string): ContentId {
  return createBrandedId<ContentId>(id);
}

// Financial
export function createTipId(id: string): TipId {
  return createBrandedId<TipId>(id);
}

export function createTransactionId(id: string): TransactionId {
  return createBrandedId<TransactionId>(id);
}

export function createWalletId(id: string): WalletId {
  return createBrandedId<WalletId>(id);
}

// Social features
export function createEmojiId(id: string): EmojiId {
  return createBrandedId<EmojiId>(id);
}

export function createTagId(id: string): TagId {
  return createBrandedId<TagId>(id);
}

export function createActionId(id: string): ActionId {
  return createBrandedId<ActionId>(id);
}

// Additional IDs
export function createOrderId(id: string): OrderId {
  return createBrandedId<OrderId>(id);
}

export function createGroupId(id: string): GroupId {
  return createBrandedId<GroupId>(id);
}

export function createAdminUserId(id: string): AdminUserId {
  return createBrandedId<AdminUserId>(id);
}

export function createModeratorId(id: string): ModeratorId {
  return createBrandedId<ModeratorId>(id);
}

export function createPermissionId(id: string): PermissionId {
  return createBrandedId<PermissionId>(id);
}

// Generic entity ID (when type is dynamic)
export function createEntityId(id: string): EntityId {
  return createBrandedId<EntityId>(id);
}

// Validation helpers
export function isValidUuid(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

export function assertValidId(id: string, type: string): void {
  if (!id || typeof id !== 'string') {
    throw new Error(`Invalid ${type}: ID must be a non-empty string`);
  }
  if (!isValidUuid(id)) {
    throw new Error(`Invalid ${type}: ID must be a valid UUID`);
  }
}

// Batch ID creation helpers
export function createUserIds(ids: string[]): UserId[] {
  return ids.map(createUserId);
}

export function createPostIds(ids: string[]): PostId[] {
  return ids.map(createPostId);
}

export function createThreadIds(ids: string[]): ThreadId[] {
  return ids.map(createThreadId);
}