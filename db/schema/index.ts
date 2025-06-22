/**
 * @file db/schema/index.ts
 * @description Barrel file re-exporting all Drizzle ORM schema definitions for the Degentalk project.
 *
 * @purpose Provides a single entry point for importing all database table schemas.
 *          Organized by domain (e.g., user, forum, economy) for clarity.
 *          This file is typically aliased as `@schema` in `tsconfig.json` for easy access.
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
// Core exports (Note: db/schema/core/ is deprecated. Enums are now directly managed within their respective domains or shared types if truly global.)
export * from './core/enums'; // Removed as db/schema/core/ is deprecated.

// User domain exports
export * from './user/users';
export * from './user/sessions';
export * from './user/preferences';
export * from './user/permissions';
export * from './user/roles';
export * from './user/userRoles';
export * from './user/rolePermissions';
export * from './user/bans';
export * from './user/relationships';
export * from './user/verificationTokens';
export * from './user/passwordResetTokens';
export * from './user/settingsHistory';
export * from './user/avatarFrames';
export * from './user/userGroups';
export * from './user/user-social-preferences';

// User domain - feature permissions
export * from './user/featurePermissions';

// Forum domain exports
export * from './forum/categories';
export * from './forum/threads';
export * from './forum/posts';
export * from './forum/prefixes';
export * from './forum/tags';
export * from './forum/threadTags';
export * from './forum/postReactions';
export * from './forum/postDrafts';
export * from './forum/threadDrafts';
export * from './forum/threadBookmarks';
export * from './forum/rules';
export * from './forum/userRuleAgreements';
export * from './forum/customEmojis';
export * from './forum/postLikes';
export * from './forum/threadFeaturePermissions';
export * from './forum/polls';
export * from './forum/pollOptions';
export * from './forum/pollVotes';
export * from './forum/emojiPacks';
export * from './forum/emojiPackItems';
export * from './forum/userEmojiPacks';

// Economy domain exports
export * from './economy/wallets';
export * from './economy/transactions';
export * from './economy/levels';
export * from './economy/xpAdjustmentLogs';
export * from './economy/xpActionSettings';
export * from './economy/titles';
export * from './economy/badges';
export * from './economy/userTitles';
export * from './economy/userBadges';
export * from './economy/vaults';
export * from './economy/withdrawalRequests';
export * from './economy/userCommands';
export * from './economy/rainEvents';
export * from './economy/postTips';
export * from './economy/dgtPackages';
export * from './economy/dgtPurchaseOrders';
export * from './economy/settings';
export * from './economy/treasurySettings';
export * from './economy/cloutAchievements';
export * from './economy/userCloutLog';

// Economy domain - airdrop
export * from './economy/airdropSettings';
export * from './economy/airdropRecords';
export * from './economy/xpLogs';

// Shop domain exports
export * from './shop/products';
export * from './shop/productCategories';
export * from './shop/productMedia';
export * from './shop/orders';
export * from './shop/orderItems';
export * from './shop/userInventory';
export * from './shop/inventoryTransactions';
export * from './shop/signatureItems';
export * from './shop/userSignatureItems';
export * from './shop/cosmeticCategories';
export * from './shop/rarities';
export * from './shop/animationPacks';
export * from './shop/animationPackItems';

// Messaging domain exports
export * from './messaging/conversations';
export * from './messaging/conversationParticipants';
export * from './messaging/messages';
export * from './messaging/messageReads';
export * from './messaging/directMessages';
export * from './messaging/chatRooms';
export * from './messaging/shoutboxMessages';
export * from './messaging/onlineUsers';

// Admin domain exports
export * from './admin/auditLogs';
export * from './admin/reports';
export * from './admin/moderationActions';
export * from './admin/announcements';
export * from './admin/siteSettings';
export * from './admin/themes';
export * from './admin/templates';
export * from './admin/featureFlags';
export * from './admin/seoMetadata';
export * from './admin/scheduledTasks';
export * from './admin/mediaLibrary';
export * from './admin/uiConfig';
export * from './admin/uiThemes';
export * from './admin/moderator-notes';

// Gamification domain exports
export * from './gamification/achievements';
export * from './gamification/userAchievements';
export * from './gamification/missions';
export * from './gamification/userMissionProgress';
export * from './gamification/leaderboards';
export * from './gamification/platformStats';

// System domain exports
export * from './system/rateLimits';
export * from './system/notifications';
export * from './system/analyticsEvents';
export * from './system/activityFeed';
export * from './system/airdrop-records';
export * from './system/userAbuseFlags';
export * from './system/cooldownState';
export * from './system/mentionsIndex';
export * from './system/referralSources';
export * from './system/userReferrals';
export * from './system/event_logs';
export * from './system/economyConfigOverrides';

// Dictionary domain exports
export * from './dictionary/entries';
export * from './dictionary/upvotes';

// Social domain exports
export * from './social/mentions';
export * from './social/user-follows';
export * from './social/friends';

// Wallet domain exports - CCPayment integration
export * from './wallet/ccpayment-users';
export * from './wallet/crypto-wallets';
export * from './wallet/deposit-records';
export * from './wallet/withdrawal-records';
export * from './wallet/internal-transfers';
export * from './wallet/swap-records';
export * from './wallet/webhook-events';
export * from './wallet/supported-tokens';

// Note: './forum/threadDrafts.ts' was commented out as it was empty in the previous steps.
// Ensure all files listed for export actually exist and contain exports.
