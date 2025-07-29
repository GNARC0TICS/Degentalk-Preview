/**
 * ID Constructor Helpers
 *
 * These functions create properly branded IDs for use throughout the application.
 * They provide type-safe ID creation and validation.
 */
import type { UserId, PostId, ThreadId, ForumId, RoleId, TitleId, BadgeId, FrameId, ProductId, InventoryId, AchievementId, CategoryId, PrefixId, DraftId, MessageId, NotificationId, ReportId, ContentId, EntityId, TipId, TransactionId, WalletId, EmojiId, TagId, StructureId, ActionId, OrderId, GroupId, AdminUserId, ModeratorId, PermissionId } from '../../types/ids.js';
export declare function createUserId(id: string): UserId;
export declare function createPostId(id: string): PostId;
export declare function createThreadId(id: string): ThreadId;
export declare function createForumId(id: string): ForumId;
export declare function createCategoryId(id: string): CategoryId;
export declare function createPrefixId(id: string): PrefixId;
export declare function createDraftId(id: string): DraftId;
export declare function createRoleId(id: string): RoleId;
export declare function createTitleId(id: string): TitleId;
export declare function createBadgeId(id: string): BadgeId;
export declare function createFrameId(id: string): FrameId;
export declare function createAchievementId(id: string): AchievementId;
export declare function createProductId(id: string): ProductId;
export declare function createInventoryId(id: string): InventoryId;
export declare function createMessageId(id: string): MessageId;
export declare function createNotificationId(id: string): NotificationId;
export declare function createReportId(id: string): ReportId;
export declare function createContentId(id: string): ContentId;
export declare function createTipId(id: string): TipId;
export declare function createTransactionId(id: string): TransactionId;
export declare function createWalletId(id: string): WalletId;
export declare function createEmojiId(id: string): EmojiId;
export declare function createTagId(id: string): TagId;
export declare function createStructureId(id: string): StructureId;
export declare function createActionId(id: string): ActionId;
export declare function createOrderId(id: string): OrderId;
export declare function createGroupId(id: string): GroupId;
export declare function createAdminUserId(id: string): AdminUserId;
export declare function createModeratorId(id: string): ModeratorId;
export declare function createPermissionId(id: string): PermissionId;
export declare function createEntityId(id: string): EntityId;
export declare function isValidUuid(id: string): boolean;
export declare function assertValidId(id: string, type: string): void;
export declare function createUserIds(ids: string[]): UserId[];
export declare function createPostIds(ids: string[]): PostId[];
export declare function createThreadIds(ids: string[]): ThreadId[];
//# sourceMappingURL=ids.d.ts.map