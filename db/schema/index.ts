/**
 * @file db/schema/index.ts
 * @description Barrel file re-exporting all Drizzle ORM schema definitions for the Degentalk project.
 *
 * @purpose Provides a single entry point for importing all database table schemas.
 *          Organized by domain (e.g., user, forum, economy) for clarity.
 *          This file is typically aliased as `@schema` in `tsconfigon` for easy access.
 *
 * @dependencies None directly, but all exported files depend on `drizzle-orm`.
 *
 * @environment Relies on Drizzle ORM and the chosen database driver (SQLite/PostgreSQL).
 *
 * @important_notes
 *   - This file SHOULD ONLY contain export statements.
 *   - When adding new schema files, ensure they are exported here.
 *   - The order of exports does not typically matter unless there are inter-schema dependencies
 *     that Drizzle cannot resolve automatically (rare).
 *
 * @status Production
 * @last_reviewed YYYY-MM-DD by @username (TODO: Update this)
 * @owner Database Team / Backend Team (TODO: Confirm owner)
 */
// Core exports - Global enums used across domains
export * from './core/enums.js';
// User domain exports
export * from './user/users.js';
export * from './user/sessions.js';
export * from './user/preferences.js';
export * from './user/permissions.js';
export * from './user/roles.js';
export * from './user/userRoles.js';
export * from './user/rolePermissions.js';
export * from './user/bans.js';
export * from './user/relationships.js';
export * from './user/verificationTokens.js';
export * from './user/passwordResetTokens.js';
export * from './user/settingsHistory.js';
export * from './user/avatarFrames.js';
export * from './user/userOwnedFrames.js';
export * from './user/userGroups.js';
export * from './user/user-social-preferences.js';
export * from './user/subscriptions.js';
// User domain - feature permissions
export * from './user/featurePermissions.js';
// Forum domain exports
export * from './forum/structure.js'; // Forum structure schema (replaces categories)
export * from './forum/threads.js';
export * from './forum/posts.js';
export * from './forum/prefixes.js';
export * from './forum/tags.js';
export * from './forum/threadTags.js';
export * from './forum/postReactions.js';
export * from './forum/postDrafts.js';
export * from './forum/threadDrafts.js';
export * from './forum/threadBookmarks.js';
export * from './forum/rules.js';
export * from './forum/userRuleAgreements.js';
export * from './forum/customEmojis.js';
export * from './forum/postLikes.js';
export * from './forum/threadFeaturePermissions.js';
export * from './forum/polls.js';
export * from './forum/pollOptions.js';
export * from './forum/pollVotes.js';
export * from './forum/emojiPacks.js';
export * from './forum/emojiPackItems.js';
export * from './forum/userEmojiPacks.js';
// Economy domain exports
export * from './economy/wallets.js';
export * from './economy/transactions.js';
export * from './economy/levels.js';
export * from './economy/xpAdjustmentLogs.js';
export * from './economy/xpActionSettings.js';
export * from './economy/titles.js';
export * from './economy/badges.js';
export * from './economy/userTitles.js';
export * from './economy/userBadges.js';
export * from './economy/vaults.js';
export * from './economy/withdrawalRequests.js';
export * from './economy/userCommands.js';
export * from './economy/rainEvents.js';
export * from './economy/postTips.js';
export * from './economy/dgtPackages.js';
export * from './economy/dgtPurchaseOrders.js';
export * from './economy/settings.js';
export * from './economy/treasurySettings.js';
export * from './economy/cloutAchievements.js';
export * from './economy/userCloutLog.js';
// Economy domain - airdrop
export * from './economy/airdropSettings.js';
export * from './economy/airdropRecords.js';
export * from './economy/xpLogs.js';
// Shop domain exports
export * from './shop/products.js';
export * from './shop/productCategories.js';
export * from './shop/productMedia.js';
export * from './shop/orders.js';
export * from './shop/orderItems.js';
export * from './shop/userInventory.js';
export * from './shop/inventoryTransactions.js';
export * from './shop/signatureItems.js';
export * from './shop/userSignatureItems.js';
export * from './shop/cosmeticCategories.js';
export * from './shop/rarities.js';
export * from './shop/animationPacks.js';
export * from './shop/animationPackItems.js';
// Messaging domain exports
export * from './messaging/conversations.js';
export * from './messaging/conversationParticipants.js';
export * from './messaging/messages.js';
export * from './messaging/messageReads.js';
export * from './messaging/directMessages.js';
export * from './messaging/chatRooms.js';
export * from './messaging/shoutboxMessages.js';
export * from './messaging/onlineUsers.js';
// Admin domain exports
export * from './admin/auditLogs.js';
export * from './admin/reports.js';
export * from './admin/moderationActions.js';
export * from './admin/announcements.js';
export * from './admin/siteSettings.js';
export * from './admin/themes.js';
export * from './admin/templates.js';
export * from './admin/featureFlags.js';
export * from './admin/seoMetadata.js';
export * from './admin/scheduledTasks.js';
export * from './admin/mediaLibrary.js';
export * from './admin/uiConfig.js';
export * from './admin/uiThemes.js';
export * from './admin/moderator-notes.js';
export * from './admin/emailTemplates.js';
export * from './admin/backups.js';
export * from './admin/brandConfig.js';
export * from './admin/shoutboxConfig.js';
export * from './admin/settings.js';
// Gamification domain exports
export * from './gamification/achievements.js';
export * from './gamification/userAchievements.js';
export * from './gamification/achievementEvents.js';
export * from './gamification/leaderboards.js';
export * from './gamification/platformStats.js';
// System domain exports
export * from './system/rateLimits.js';
export { notifications } from './system/notifications.js';
export { notifications as systemNotifications } from './system/notifications.js';
export type {
	Notification as SystemNotification,
	InsertNotification as InsertSystemNotification
} from './system/notifications.js';
export * from './system/analyticsEvents.js';
export * from './system/profileAnalytics.js';
export * from './system/activityFeed.js';
export * from './system/airdrop-records.js';
export * from './system/userAbuseFlags.js';
export * from './system/cooldownState.js';
export * from './system/mentionsIndex.js';
export * from './system/referralSources.js';
export * from './system/userReferrals.js';
export * from './system/event_logs.js';
export * from './system/economyConfigOverrides.js';
// Dictionary domain exports
export * from './dictionary/entries.js';
export * from './dictionary/upvotes.js';
// Social domain exports
export * from './social/mentions.js';
export * from './social/user-follows.js';
export * from './social/friends.js';
// Wallet domain exports - CCPayment integration
export * from './wallet/ccpayment-users.js';
export * from './wallet/crypto-wallets.js';
export * from './wallet/deposit-records.js';
export * from './wallet/withdrawal-records.js';
export * from './wallet/internal-transfers.js';
export * from './wallet/swap-records.js';
export * from './wallet/webhook-events.js';
export * from './wallet/supported-tokens.js';
// Collectibles domain exports - Sticker system
export * from './collectibles/stickers.js';
// Advertising domain exports
export * from './advertising/campaigns.js';
export * from './advertising/placements.js';
export * from './advertising/targeting.js';
export * from './advertising/performance.js';
export * from './advertising/payments.js';
export * from './advertising/user-promotions.js';
// Note: './forum/threadDrafts.ts' was commented out as it was empty in the previous steps.
// Ensure all files listed for export actually exist and contain exports.
