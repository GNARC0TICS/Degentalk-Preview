import type { Brand } from 'utility-types';

/**
 * UUID-branded primitive wrappers – ensures we never accidentally pass a plain `string` where a
 * structured ID is expected. Use these across the codebase instead of raw `string`.
 */

export type UserId = Id<'user'>;
export type ThreadId = Id<'thread'>;
export type PostId = Id<'post'>;
export type StructureId = Id<'structure'>;
export type WalletId = Id<'wallet'>;
export type TransactionId = Id<'transaction'>;
export type MissionId = Id<'mission'>;
export type AchievementId = Id<'achievement'>;
export type ProductId = Id<'product'>;
export type BadgeId = Id<'badge'>;
export type TitleId = Id<'title'>;
export type FrameId = Id<'frame'>;
export type PathId = Id<'path'>;
// Add additional IDs as needed following the same convention.

export const __ensureModule = true;

// Generic helper – use for ad-hoc IDs without cluttering this file with hundreds of aliases
export type Id<Tag extends string> = Brand<string, `${Capitalize<Tag>}Id`>;

// Commonly referenced but previously missing aliases
export type AdminId = Id<'admin'>;
export type ReporterId = Id<'reporter'>;
export type ReportId = Id<'report'>;
export type ConversationId = Id<'conversation'>;
export type RoomId = Id<'room'>;

// Core domain aliases – high-reuse entity IDs
export type AdminUserId = Id<'adminUser'>;
export type AirdropId = Id<'airdrop'>;
export type AnimationFrameId = Id<'animationFrame'>;
export type BackupId = Id<'backup'>;
export type CategoryId = Id<'category'>;
export type CoinId = Id<'coin'>;
export type AuthorId = Id<'author'>; // renamed from ContentAuthorId
export type CosmeticId = Id<'cosmetic'>;
export type EditorId = Id<'editor'>;
export type EmojiPackId = Id<'emojiPack'>;
export type EntityId = Id<'entity'>;
export type EntryId = Id<'entry'>;
export type ForumId = Id<'forum'>;
export type GroupId = Id<'group'>;
export type InventoryId = Id<'inventory'>;
export type ItemId = Id<'item'>;
export type MentionId = Id<'mention'>;
export type ModeratorId = Id<'moderator'>;
export type PackId = Id<'pack'>;
export type ParentForumId = Id<'parentForum'>;
export type ParentZoneId = Id<'parentZone'>;
export type RuleId = Id<'rule'>;
export type SettingId = Id<'setting'>;
export type StickerId = Id<'sticker'>;
export type SubscriptionId = Id<'subscription'>;
export type TagId = Id<'tag'>;
export type TemplateId = Id<'template'>;
export type TipId = Id<'tip'>;
export type UnlockTransactionId = Id<'unlockTransaction'>;
export type VaultId = Id<'vault'>;
export type VaultLockId = Id<'vaultLock'>;
export type WhaleId = Id<'whale'>;
export type ZoneId = Id<'zone'>;
export type RequestId = Id<'request'>;
export type ContentId = Id<'content'>;
export type SignatureItemId = Id<'signatureItem'>;

// Security / Auth / Admin
export type VerificationTokenId = Id<'verificationToken'>;
export type BanId = Id<'ban'>;
export type SessionId = Id<'session'>;
export type ModActionId = Id<'modAction'>;
export type IpLogId = Id<'ipLog'>;

// Thread / Post context
export type DraftId = Id<'draft'>;
export type ReplyId = Id<'reply'>;
export type QuoteId = Id<'quote'>;

// Commerce / Shop / Cosmetic
export type OrderId = Id<'order'>;
export type StoreItemId = Id<'storeItem'>;
export type UnlockId = Id<'unlock'>;

// Messaging / Social
export type NotificationId = Id<'notification'>;
export type FriendRequestId = Id<'friendRequest'>;
export type FollowRequestId = Id<'followRequest'>;
export type MessageId = Id<'message'>;

// Structural / Forum
export type PrefixId = Id<'prefix'>;

// Analytics / Logging
export type EventId = Id<'event'>;
export type AuditLogId = Id<'auditLog'>;
export type ActionId = Id<'action'>;
export type HeatEventId = Id<'heatEvent'>;

export type XpLevelId = Id<'xpLevel'>;
export type AnnouncementId = Id<'announcement'>;

// Auto-generated missing types

// Gamification domain
export type AchievementEventId = Id<'achievementevent'>;
export type CloutAchievementId = Id<'cloutachievement'>;
export type LeaderboardHistoryId = Id<'leaderboardhistory'>;

// System domain
export type ActivityFeedId = Id<'activityfeed'>;
export type AdGovernanceProposalId = Id<'adgovernanceproposal'>;
export type AdGovernanceVotId = Id<'adgovernancevot'>;
export type AdImpressionId = Id<'adimpression'>;
export type AnalyticsEventId = Id<'analyticsevent'>;
export type AnnouncementSlotId = Id<'announcementslot'>;
export type AvatarFramId = Id<'avatarfram'>;
export type BadgId = Id<'badg'>;
export type CooldownStateId = Id<'cooldownstate'>;
export type CosmeticCategoryId = Id<'cosmeticcategory'>;
export type CosmeticDropId = Id<'cosmeticdrop'>;
export type DepositRecordId = Id<'depositrecord'>;
export type DictionaryEntryId = Id<'dictionaryentry'>;
export type DictionaryUpvotId = Id<'dictionaryupvot'>;
export type DisplayPreferencId = Id<'displaypreferenc'>;
export type EconomyConfigOverridId = Id<'economyconfigoverrid'>;
export type EmailTemplatId = Id<'emailtemplat'>;
export type EventLogId = Id<'eventlog'>;
export type FriendGroupId = Id<'friendgroup'>;
export type FriendGroupMemberId = Id<'friendgroupmember'>;
export type FriendshipId = Id<'friendship'>;
export type InternalTransferId = Id<'internaltransfer'>;
export type MentionsIndexId = Id<'mentionsindex'>;
export type MessagId = Id<'messag'>;
export type ModeratorNotId = Id<'moderatornot'>;
export type PasswordResetTokenId = Id<'passwordresettoken'>;
export type PermissionId = Id<'permission'>;
export type PlatformStatisticId = Id<'platformstatistic'>;
export type ProfileAnalyticId = Id<'profileanalytic'>;
export type ProfileSpotlightId = Id<'profilespotlight'>;
export type RarityId = Id<'rarity'>;
export type RateLimitId = Id<'ratelimit'>;
export type ReferralSourcId = Id<'referralsourc'>;
export type RestoreOperationId = Id<'restoreoperation'>;
export type RolId = Id<'rol'>;
export type RolePermissionId = Id<'rolepermission'>;
export type SubscriptionBenefitId = Id<'subscriptionbenefit'>;
export type SupportedTokenId = Id<'supportedtoken'>;
export type SwapRecordId = Id<'swaprecord'>;
export type TitlId = Id<'titl'>;
export type WebhookEventId = Id<'webhookevent'>;
export type XSharId = Id<'xshar'>;

// Advertising domain
export type AdPlacementId = Id<'adplacement'>;
export type CampaignId = Id<'campaign'>;
export type CampaignMetricId = Id<'campaignmetric'>;
export type CampaignRulId = Id<'campaignrul'>;
export type CryptoPaymentId = Id<'cryptopayment'>;
export type PromotionPricingConfigId = Id<'promotionpricingconfig'>;

// Admin domain
export type AdminBackupId = Id<'adminbackup'>;
export type AdminManualAirdropLogId = Id<'adminmanualairdroplog'>;
export type AdminThemId = Id<'adminthem'>;
export type BackupSchedulId = Id<'backupschedul'>;
export type BackupSettingId = Id<'backupsetting'>;
export type BrandConfigurationId = Id<'brandconfiguration'>;
export type ContentModerationActionId = Id<'contentmoderationaction'>;
export type CooldownSettingId = Id<'cooldownsetting'>;
export type EconomySettingId = Id<'economysetting'>;
export type EmailTemplateLogId = Id<'emailtemplatelog'>;
export type EmailTemplateVersionId = Id<'emailtemplateversion'>;
export type FeatureFlagId = Id<'featureflag'>;
export type FeaturePermissionId = Id<'featurepermission'>;
export type MediaLibraryId = Id<'medialibrary'>;
export type NotificationSettingId = Id<'notificationsetting'>;
export type PlatformTreasurySettingId = Id<'platformtreasurysetting'>;
export type ReportedContentId = Id<'reportedcontent'>;
export type ScheduledTaskId = Id<'scheduledtask'>;
export type SeoMetadataId = Id<'seometadata'>;
export type SiteSettingId = Id<'sitesetting'>;
export type SiteTemplatId = Id<'sitetemplat'>;
export type UiAnalyticId = Id<'uianalytic'>;
export type UiCollectionId = Id<'uicollection'>;
export type UiCollectionQuotId = Id<'uicollectionquot'>;
export type UiQuotId = Id<'uiquot'>;
export type UiThemId = Id<'uithem'>;

// Economy domain
export type AirdropRecordId = Id<'airdroprecord'>;
export type AirdropSettingId = Id<'airdropsetting'>;
export type CryptoWalletId = Id<'cryptowallet'>;
export type DgtEconomyParameterId = Id<'dgteconomyparameter'>;
export type DgtPackagId = Id<'dgtpackag'>;
export type DgtPurchaseOrderId = Id<'dgtpurchaseorder'>;
export type InventoryTransactionId = Id<'inventorytransaction'>;
export type InventoryTransactionLinkId = Id<'inventorytransactionlink'>;
export type LevelId = Id<'level'>;
export type RainEventId = Id<'rainevent'>;
export type RainSettingId = Id<'rainsetting'>;
export type TipSettingId = Id<'tipsetting'>;
export type WithdrawalRecordId = Id<'withdrawalrecord'>;
export type WithdrawalRequestId = Id<'withdrawalrequest'>;
export type XpActionSettingId = Id<'xpactionsetting'>;
export type XpAdjustmentLogId = Id<'xpadjustmentlog'>;
export type XpCloutSettingId = Id<'xpcloutsetting'>;
export type XpLogId = Id<'xplog'>;

// Collectibles domain
export type AnimationPackId = Id<'animationpack'>;
export type AnimationPackItemId = Id<'animationpackitem'>;
export type StickerPackId = Id<'stickerpack'>;
export type StickerUsageId = Id<'stickerusage'>;

// User domain
export type CcpaymentUserId = Id<'ccpaymentuser'>;
export type OnlineUserId = Id<'onlineuser'>;
export type ShoutboxUserIgnorId = Id<'shoutboxuserignor'>;
export type UserAbuseFlagId = Id<'userabuseflag'>;
export type UserAchievementId = Id<'userachievement'>;
export type UserBadgId = Id<'userbadg'>;
export type UserBanId = Id<'userban'>;
export type UserCloutLogId = Id<'usercloutlog'>;
export type UserCommandId = Id<'usercommand'>;
export type UserEmojiPackId = Id<'useremojipack'>;
export type UserFollowId = Id<'userfollow'>;
export type UserFriendPreferencId = Id<'userfriendpreferenc'>;
export type UserMentionPreferencId = Id<'usermentionpreferenc'>;
export type UserMissionProgresId = Id<'usermissionprogres'>;
export type UserOwnedFramId = Id<'userownedfram'>;
export type UserPromotionAnalyticId = Id<'userpromotionanalytic'>;
export type UserPromotionId = Id<'userpromotion'>;
export type UserReferralId = Id<'userreferral'>;
export type UserRelationshipId = Id<'userrelationship'>;
export type UserRolId = Id<'userrol'>;
export type UserRulesAgreementId = Id<'userrulesagreement'>;
export type UserSessionId = Id<'usersession'>;
export type UserSettingId = Id<'usersetting'>;
export type UserSettingsHistoryId = Id<'usersettingshistory'>;
export type UserSignatureItemId = Id<'usersignatureitem'>;
export type UserSocialPreferencId = Id<'usersocialpreferenc'>;
export type UserStickerInventoryId = Id<'userstickerinventory'>;
export type UserStickerPackId = Id<'userstickerpack'>;
export type UserThreadBookmarkId = Id<'userthreadbookmark'>;
export type UserTitlId = Id<'usertitl'>;

// Messaging domain
export type ChatRoomId = Id<'chatroom'>;
export type ConversationParticipantId = Id<'conversationparticipant'>;
export type DirectMessagId = Id<'directmessag'>;
export type MessageReadId = Id<'messageread'>;
export type ShoutboxAnalyticId = Id<'shoutboxanalytic'>;
export type ShoutboxBannedWordId = Id<'shoutboxbannedword'>;
export type ShoutboxConfigId = Id<'shoutboxconfig'>;
export type ShoutboxMessagId = Id<'shoutboxmessag'>;
export type ShoutboxPinId = Id<'shoutboxpin'>;

// Forum domain
export type CustomEmojiId = Id<'customemoji'>;
export type EmojiPackItemId = Id<'emojipackitem'>;
export type ForumRulId = Id<'forumrul'>;
export type PollId = Id<'poll'>;
export type PollOptionId = Id<'polloption'>;
export type PollVotId = Id<'pollvot'>;
export type PostDraftId = Id<'postdraft'>;
export type PostLikId = Id<'postlik'>;
export type PostReactionId = Id<'postreaction'>;
export type PostTipId = Id<'posttip'>;
export type ShoutboxEmojiPermissionId = Id<'shoutboxemojipermission'>;
export type ThreadBoostId = Id<'threadboost'>;
export type ThreadDraftId = Id<'threaddraft'>;
export type ThreadFeaturePermissionId = Id<'threadfeaturepermission'>;
export type ThreadPrefixId = Id<'threadprefix'>;
export type ThreadTagId = Id<'threadtag'>;

// Shop domain
export type OrderItemId = Id<'orderitem'>;
export type ProductCategoryId = Id<'productcategory'>;
export type ProductMediaId = Id<'productmedia'>;
export type SignatureShopItemId = Id<'signatureshopitem'>;

// TEMPORARY BRIDGE: Export shared types for gradual migration
// This allows @db/types imports to work while we migrate to @shared/types
export * from '@shared/types/ids';
