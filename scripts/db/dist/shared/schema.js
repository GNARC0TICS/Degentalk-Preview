"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.siteSettings = exports.insertThreadFeaturePermissionSchema = exports.insertThreadDraftSchema = exports.insertChatMessageSchema = exports.chatMessages = exports.insertPostSchema = exports.insertThreadSchema = exports.insertForumCategorySchema = exports.insertUserSchema = exports.notifications = exports.onlineUsers = exports.rainSettings = exports.tipSettings = exports.postReactions = exports.threadFeaturePermissions = exports.threadDrafts = exports.postDrafts = exports.threadTags = exports.rolePermissions = exports.userRoles = exports.userSessions = exports.userSettings = exports.betaFeatureFlags = exports.xpActionSettings = exports.xpAdjustmentLogs = exports.levels = exports.productCategories = exports.posts = exports.threads = exports.forumCategories = exports.users = exports.permissions = exports.roles = exports.tags = exports.threadPrefixes = exports.mediaLibrary = exports.avatarFrames = exports.userGroups = exports.badges = exports.titles = exports.contentEditStatusEnum = exports.userRoleEnum = exports.vaultStatusEnum = exports.withdrawalStatusEnum = exports.transactionTypeEnum = exports.reactionTypeEnum = exports.notificationTypeEnum = exports.transactionStatusEnum = exports.ticketStatusEnum = exports.shoutboxPositionEnum = void 0;
exports.shoutboxMessages = exports.insertChatRoomSchema = exports.chatRooms = exports.passwordResetTokens = exports.leaderboardHistory = exports.platformStatistics = exports.activityFeed = exports.notificationSettings = exports.userRelationships = exports.scheduledTasks = exports.adminAuditLogs = exports.contentModerationActions = exports.userBans = exports.reportedContent = exports.userSettingsHistory = exports.insertDirectMessageSchema = exports.directMessages = exports.messageReads = exports.messages = exports.conversationParticipants = exports.conversations = exports.inventoryTransactions = exports.orderItems = exports.orders = exports.productMedia = exports.products = exports.treasurySettings = exports.rateLimits = exports.insertForumRuleSchema = exports.insertWithdrawalRequestSchema = exports.withdrawalRequests = exports.insertVaultSchema = exports.vaults = exports.userTitles = exports.userBadges = exports.customEmojis = exports.userRulesAgreements = exports.forumRules = exports.seoMetadata = exports.auditLogs = exports.analyticsEvents = exports.featureFlags = exports.insertDgtPurchaseOrderSchema = exports.dgtPurchaseOrders = exports.transactions = exports.wallets = exports.userAchievements = exports.achievements = exports.siteTemplates = exports.adminThemes = void 0;
exports.userSignatureItems = exports.signatureShopItems = exports.airdropRecords = exports.airdropSettings = exports.userMissionProgress = exports.missions = exports.postLikes = exports.insertBadgeSchema = exports.insertTitleSchema = exports.insertLevelSchema = exports.insertEconomySettingSchema = exports.insertPostReactionSchema = exports.insertPostTipSchema = exports.economySettings = exports.insertDgtPackageSchema = exports.dgtPackages = exports.postTips = exports.verificationTokens = exports.userThreadBookmarks = exports.xpCloutSettings = exports.rainEvents = exports.userCommands = exports.cooldownSettings = exports.insertAnnouncementSchema = exports.announcements = exports.userInventory = exports.insertShoutboxMessageSchema = void 0;
var pg_core_1 = require("drizzle-orm/pg-core");
var drizzle_orm_1 = require("drizzle-orm");
var drizzle_zod_1 = require("drizzle-zod");
var zod_1 = require("zod");
/*
 * ===================================
 * Schema Strategy Documentation
 * ===================================
 * - Reactions:
 *   - The `postReactions` table tracks structured reactions (`like`, `helpful`).
 *   - The `emoji` column and its use in the PK have been removed.
 *   - The PK is now `(userId, postId, reactionType)`.
 *
 * - XP & Clout System:
 *   - The `economySettings` table holds tunable values (e.g., `clout_per_helpful`, `xp_per_post`).
 *   - Clout is awarded ONLY to the post author when someone else reacts (value based on `economySettings`).
 *   - XP is awarded ONLY for creating posts/replies (value based on `economySettings`).
 *   - Users do NOT gain XP/Clout for reacting to others' content.
 *
 * - Goal:
 *   - This system provides a scalable, configurable clout mechanism.
 *   - It resolves previous primary key issues related to emojis.
 */
// Enums
exports.shoutboxPositionEnum = (0, pg_core_1.pgEnum)('shoutbox_position', ['sidebar-top', 'sidebar-bottom', 'main-top', 'main-bottom', 'floating']);
exports.ticketStatusEnum = (0, pg_core_1.pgEnum)('ticket_status', ['open', 'pending', 'resolved', 'closed', 'archived']);
exports.transactionStatusEnum = (0, pg_core_1.pgEnum)('transaction_status', ['pending', 'confirmed', 'failed', 'reversed', 'disputed']);
exports.notificationTypeEnum = (0, pg_core_1.pgEnum)('notification_type', [
    'info', 'system', 'private_message', 'achievement', 'transaction',
    'post_mention', 'thread_reply', 'reaction', 'quest_complete', 'badge_awarded'
]);
exports.reactionTypeEnum = (0, pg_core_1.pgEnum)('reaction_type', ['like', 'helpful']);
exports.transactionTypeEnum = (0, pg_core_1.pgEnum)('transaction_type', [
    'TIP', 'DEPOSIT', 'WITHDRAWAL', 'ADMIN_ADJUST',
    'RAIN', 'AIRDROP', 'SHOP_PURCHASE', 'REWARD',
    'REFERRAL_BONUS', 'FEE', 'VAULT_LOCK', 'VAULT_UNLOCK'
]);
// Withdrawal status enum
exports.withdrawalStatusEnum = (0, pg_core_1.pgEnum)('withdrawal_status', ['pending', 'approved', 'rejected']);
// Define vault status types
exports.vaultStatusEnum = (0, pg_core_1.pgEnum)('vault_status', ['locked', 'unlocked', 'pending_unlock']);
// Define user role types
exports.userRoleEnum = (0, pg_core_1.pgEnum)('user_role', ['user', 'mod', 'admin']);
// Content edit status enum
exports.contentEditStatusEnum = (0, pg_core_1.pgEnum)('content_edit_status', ['draft', 'published', 'archived']);
// Define tables needed for references first
exports.titles = (0, pg_core_1.pgTable)('titles', {
    id: (0, pg_core_1.serial)('title_id').primaryKey(),
    name: (0, pg_core_1.varchar)('name', { length: 100 }).notNull(),
    description: (0, pg_core_1.text)('description'),
    iconUrl: (0, pg_core_1.varchar)('icon_url', { length: 255 }),
    rarity: (0, pg_core_1.varchar)('rarity', { length: 50 }).default('common'),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().default((0, drizzle_orm_1.sql)(templateObject_1 || (templateObject_1 = __makeTemplateObject(["CURRENT_TIMESTAMP"], ["CURRENT_TIMESTAMP"])))), // Use CURRENT_TIMESTAMP for SQLite compatibility
});
exports.badges = (0, pg_core_1.pgTable)('badges', {
    id: (0, pg_core_1.serial)('badge_id').primaryKey(),
    name: (0, pg_core_1.varchar)('name', { length: 100 }).notNull(),
    description: (0, pg_core_1.text)('description'),
    iconUrl: (0, pg_core_1.varchar)('icon_url', { length: 255 }).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().default((0, drizzle_orm_1.sql)(templateObject_2 || (templateObject_2 = __makeTemplateObject(["CURRENT_TIMESTAMP"], ["CURRENT_TIMESTAMP"])))), // Use CURRENT_TIMESTAMP for SQLite compatibility
});
exports.userGroups = (0, pg_core_1.pgTable)('user_groups', {
    id: (0, pg_core_1.serial)('group_id').primaryKey(),
    name: (0, pg_core_1.varchar)('name', { length: 100 }).notNull(),
    description: (0, pg_core_1.text)('description'),
    color: (0, pg_core_1.varchar)('color', { length: 25 }).default('#3366ff'),
    icon: (0, pg_core_1.varchar)('icon', { length: 100 }),
    badge: (0, pg_core_1.varchar)('badge', { length: 100 }), // Badge displayed next to username
    isStaff: (0, pg_core_1.boolean)('is_staff').notNull().default(false), // Whether this is a staff group
    staffPriority: (0, pg_core_1.integer)('staff_priority').default(0), // Priority for staff groups (higher = more important)
    isDefault: (0, pg_core_1.boolean)('is_default').notNull().default(false),
    isModerator: (0, pg_core_1.boolean)('is_moderator').notNull().default(false), // Has moderation privileges
    isAdmin: (0, pg_core_1.boolean)('is_admin').notNull().default(false), // Has administration privileges
    canManageUsers: (0, pg_core_1.boolean)('can_manage_users').notNull().default(false),
    canManageContent: (0, pg_core_1.boolean)('can_manage_content').notNull().default(false),
    canManageSettings: (0, pg_core_1.boolean)('can_manage_settings').notNull().default(false),
    permissions: (0, pg_core_1.jsonb)('permissions').default('{}'), // For more granular permissions
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().default((0, drizzle_orm_1.sql)(templateObject_3 || (templateObject_3 = __makeTemplateObject(["CURRENT_TIMESTAMP"], ["CURRENT_TIMESTAMP"])))), // Use CURRENT_TIMESTAMP for SQLite compatibility
    updatedAt: (0, pg_core_1.timestamp)('updated_at').notNull().default((0, drizzle_orm_1.sql)(templateObject_4 || (templateObject_4 = __makeTemplateObject(["CURRENT_TIMESTAMP"], ["CURRENT_TIMESTAMP"])))), // Use CURRENT_TIMESTAMP for SQLite compatibility
    pluginData: (0, pg_core_1.jsonb)('plugin_data').default('{}') // Plugin-ready field
}, function (table) { return ({
    nameUnique: (0, pg_core_1.unique)('user_groups_name_unique').on(table.name)
}); });
exports.avatarFrames = (0, pg_core_1.pgTable)('avatar_frames', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    name: (0, pg_core_1.text)('name').notNull(),
    imageUrl: (0, pg_core_1.text)('image_url').notNull(),
    rarity: (0, pg_core_1.text)('rarity').default('common'),
    animated: (0, pg_core_1.boolean)('animated').default(false),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().default((0, drizzle_orm_1.sql)(templateObject_5 || (templateObject_5 = __makeTemplateObject(["CURRENT_TIMESTAMP"], ["CURRENT_TIMESTAMP"])))), // Use CURRENT_TIMESTAMP for SQLite compatibility
});
exports.mediaLibrary = (0, pg_core_1.pgTable)('media_library', {
    id: (0, pg_core_1.serial)('media_id').primaryKey(),
    userId: (0, pg_core_1.integer)('user_id').references(function () { return exports.users.id; }, { onDelete: 'set null' }), // Forward reference
    type: (0, pg_core_1.varchar)('type', { length: 50 }).notNull(),
    fileName: (0, pg_core_1.varchar)('file_name', { length: 255 }).notNull(),
    fileSize: (0, pg_core_1.integer)('file_size').notNull(),
    mimeType: (0, pg_core_1.varchar)('mime_type', { length: 100 }).notNull(),
    path: (0, pg_core_1.varchar)('path', { length: 255 }).notNull(),
    url: (0, pg_core_1.varchar)('url', { length: 255 }).notNull(),
    thumbnailUrl: (0, pg_core_1.varchar)('thumbnail_url', { length: 255 }),
    isPublic: (0, pg_core_1.boolean)('is_public').notNull().default(true),
    metadata: (0, pg_core_1.jsonb)('metadata').default('{}'),
    isDeleted: (0, pg_core_1.boolean)('is_deleted').notNull().default(false),
    deletedAt: (0, pg_core_1.timestamp)('deleted_at'),
    deletedBy: (0, pg_core_1.integer)('deleted_by').references(function () { return exports.users.id; }, { onDelete: 'set null' }), // Forward reference
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().default((0, drizzle_orm_1.sql)(templateObject_6 || (templateObject_6 = __makeTemplateObject(["CURRENT_TIMESTAMP"], ["CURRENT_TIMESTAMP"])))), // Use CURRENT_TIMESTAMP for SQLite compatibility
    updatedAt: (0, pg_core_1.timestamp)('updated_at').notNull().default((0, drizzle_orm_1.sql)(templateObject_7 || (templateObject_7 = __makeTemplateObject(["CURRENT_TIMESTAMP"], ["CURRENT_TIMESTAMP"])))), // Use CURRENT_TIMESTAMP for SQLite compatibility
}, function (table) { return ({
    userIdx: (0, pg_core_1.index)('idx_media_library_user_id').on(table.userId),
    typeIdx: (0, pg_core_1.index)('idx_media_library_type').on(table.type),
    createdAtIdx: (0, pg_core_1.index)('idx_media_library_created_at').on(table.createdAt),
    fileNameUnique: (0, pg_core_1.unique)('media_library_filename_unique').on(table.fileName)
}); });
exports.threadPrefixes = (0, pg_core_1.pgTable)('thread_prefixes', {
    id: (0, pg_core_1.serial)('prefix_id').primaryKey(),
    name: (0, pg_core_1.varchar)('name', { length: 30 }).notNull().unique(),
    color: (0, pg_core_1.varchar)('color', { length: 20 }),
    isActive: (0, pg_core_1.boolean)('is_active').notNull().default(true),
    position: (0, pg_core_1.integer)('position').notNull().default(0),
    categoryId: (0, pg_core_1.integer)('category_id').references(function () { return exports.forumCategories.id; }, { onDelete: 'set null' }), // Added for category-specific prefixes
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().default((0, drizzle_orm_1.sql)(templateObject_8 || (templateObject_8 = __makeTemplateObject(["CURRENT_TIMESTAMP"], ["CURRENT_TIMESTAMP"])))), // Use CURRENT_TIMESTAMP for SQLite compatibility
});
exports.tags = (0, pg_core_1.pgTable)('tags', {
    id: (0, pg_core_1.serial)('tag_id').primaryKey(),
    name: (0, pg_core_1.varchar)('name', { length: 50 }).notNull().unique(),
    slug: (0, pg_core_1.varchar)('slug', { length: 50 }).notNull().unique(),
    description: (0, pg_core_1.text)('description'),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().default((0, drizzle_orm_1.sql)(templateObject_9 || (templateObject_9 = __makeTemplateObject(["CURRENT_TIMESTAMP"], ["CURRENT_TIMESTAMP"])))), // Use CURRENT_TIMESTAMP for SQLite compatibility
});
exports.roles = (0, pg_core_1.pgTable)('roles', {
    id: (0, pg_core_1.serial)('role_id').primaryKey(),
    name: (0, pg_core_1.varchar)('role_name', { length: 50 }).notNull().unique(),
    description: (0, pg_core_1.text)('description'),
    isSystemRole: (0, pg_core_1.boolean)('is_system_role').notNull().default(false),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().default((0, drizzle_orm_1.sql)(templateObject_10 || (templateObject_10 = __makeTemplateObject(["CURRENT_TIMESTAMP"], ["CURRENT_TIMESTAMP"])))), // Use CURRENT_TIMESTAMP for SQLite compatibility
});
exports.permissions = (0, pg_core_1.pgTable)('permissions', {
    id: (0, pg_core_1.serial)('perm_id').primaryKey(),
    name: (0, pg_core_1.varchar)('perm_name', { length: 100 }).notNull().unique(),
    description: (0, pg_core_1.text)('description'),
    category: (0, pg_core_1.varchar)('category', { length: 50 }),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().default((0, drizzle_orm_1.sql)(templateObject_11 || (templateObject_11 = __makeTemplateObject(["CURRENT_TIMESTAMP"], ["CURRENT_TIMESTAMP"])))), // Use CURRENT_TIMESTAMP for SQLite compatibility
});
// Now define tables with self-references or cross-references
exports.users = (0, pg_core_1.pgTable)('users', {
    id: (0, pg_core_1.serial)('user_id').primaryKey(),
    uuid: (0, pg_core_1.uuid)('uuid').notNull().defaultRandom(),
    username: (0, pg_core_1.text)('username').notNull(),
    email: (0, pg_core_1.text)('email').notNull(),
    password: (0, pg_core_1.text)('password_hash').notNull(),
    bio: (0, pg_core_1.text)('bio'),
    signature: (0, pg_core_1.text)('signature'),
    avatarUrl: (0, pg_core_1.varchar)('avatar_url', { length: 255 }),
    activeAvatarUrl: (0, pg_core_1.varchar)('active_avatar_url', { length: 255 }),
    profileBannerUrl: (0, pg_core_1.varchar)('profile_banner_url', { length: 255 }),
    activeFrameId: (0, pg_core_1.integer)('active_frame_id'),
    avatarFrameId: (0, pg_core_1.integer)('avatar_frame_id').references(function () { return exports.avatarFrames.id; }),
    groupId: (0, pg_core_1.integer)('group_id').references(function () { return exports.userGroups.id; }, { onDelete: 'set null' }),
    discordHandle: (0, pg_core_1.varchar)('discord_handle', { length: 255 }),
    twitterHandle: (0, pg_core_1.varchar)('twitter_handle', { length: 255 }),
    website: (0, pg_core_1.varchar)('website', { length: 255 }),
    telegramHandle: (0, pg_core_1.varchar)('telegram_handle', { length: 255 }),
    isActive: (0, pg_core_1.boolean)('is_active').notNull().default(true),
    isVerified: (0, pg_core_1.boolean)('is_verified').notNull().default(false),
    isDeleted: (0, pg_core_1.boolean)('is_deleted').notNull().default(false),
    isBanned: (0, pg_core_1.boolean)('is_banned').notNull().default(false),
    isShadowbanned: (0, pg_core_1.boolean)('is_shadowbanned').notNull().default(false),
    subscribedToNewsletter: (0, pg_core_1.boolean)('subscribed_to_newsletter').notNull().default(false),
    lastSeenAt: (0, pg_core_1.timestamp)('last_seen_at'),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().default((0, drizzle_orm_1.sql)(templateObject_12 || (templateObject_12 = __makeTemplateObject(["CURRENT_TIMESTAMP"], ["CURRENT_TIMESTAMP"])))), // Use CURRENT_TIMESTAMP for SQLite compatibility
    lastLogin: (0, pg_core_1.timestamp)('last_login'),
    referrerId: (0, pg_core_1.integer)('referrer_id').references(function () { return exports.users.id; }, { onDelete: 'set null' }), // Self-reference fixed
    referralLevel: (0, pg_core_1.integer)('referral_level'),
    xp: (0, pg_core_1.bigint)('xp', { mode: 'number' }).notNull().default(0),
    level: (0, pg_core_1.integer)('level').notNull().default(1),
    clout: (0, pg_core_1.integer)('clout').notNull().default(0),
    activeTitleId: (0, pg_core_1.integer)('active_title_id').references(function () { return exports.titles.id; }, { onDelete: 'set null' }),
    activeBadgeId: (0, pg_core_1.integer)('active_badge_id').references(function () { return exports.badges.id; }, { onDelete: 'set null' }),
    dgtPoints: (0, pg_core_1.integer)('dgt_points').notNull().default(0),
    dgtWalletBalance: (0, pg_core_1.integer)('dgt_wallet_balance').notNull().default(0),
    pointsVersion: (0, pg_core_1.integer)('points_version').notNull().default(1),
    dailyXpGained: (0, pg_core_1.integer)('daily_xp_gained').notNull().default(0),
    lastXpGainDate: (0, pg_core_1.timestamp)('last_xp_gain_date'),
    role: (0, exports.userRoleEnum)('role').default('user'),
    walletAddress: (0, pg_core_1.varchar)('wallet_address', { length: 255 }),
    encryptedPrivateKey: (0, pg_core_1.varchar)('encrypted_private_key', { length: 512 }),
    walletBalanceUSDT: (0, pg_core_1.doublePrecision)('wallet_balance_usdt').notNull().default(0),
    walletPendingWithdrawals: (0, pg_core_1.jsonb)('wallet_pending_withdrawals').default('[]'),
    ccpaymentAccountId: (0, pg_core_1.varchar)('ccpayment_account_id', { length: 100 }), // Correctly nullable by default
    verifyToken: (0, pg_core_1.varchar)('verify_token', { length: 255 }),
    resetToken: (0, pg_core_1.varchar)('reset_token', { length: 255 }),
    resetTokenExpiresAt: (0, pg_core_1.timestamp)('reset_token_expires_at'),
    gdprConsentedAt: (0, pg_core_1.timestamp)('gdpr_consented_at'),
    tosAgreedAt: (0, pg_core_1.timestamp)('tos_agreed_at'),
    privacyAgreedAt: (0, pg_core_1.timestamp)('privacy_agreed_at'),
    pathXp: (0, pg_core_1.jsonb)('path_xp').default('{}'),
    pathMultipliers: (0, pg_core_1.jsonb)('path_multipliers').default('{}'),
    pluginData: (0, pg_core_1.jsonb)('plugin_data').default('{}'),
}, function (table) { return ({
    usernameUnique: (0, pg_core_1.unique)('users_username_unique').on(table.username),
    emailUnique: (0, pg_core_1.unique)('users_email_unique').on(table.email),
    referrerIdx: (0, pg_core_1.index)('idx_users_referrer_id').on(table.referrerId),
    groupIdx: (0, pg_core_1.index)('idx_users_group_id').on(table.groupId)
}); });
exports.forumCategories = (0, pg_core_1.pgTable)('forum_categories', {
    id: (0, pg_core_1.serial)('category_id').primaryKey(), // PostgreSQL auto-incrementing primary key
    name: (0, pg_core_1.text)('name').notNull(),
    slug: (0, pg_core_1.text)('slug').notNull(),
    description: (0, pg_core_1.text)('description'),
    parentId: (0, pg_core_1.integer)('parent_id'),
    isZone: (0, pg_core_1.boolean)('is_zone').notNull().default(false),
    canonical: (0, pg_core_1.boolean)('canonical').notNull().default(false),
    position: (0, pg_core_1.integer)('position').notNull().default(0),
    isVip: (0, pg_core_1.boolean)('is_vip').notNull().default(false),
    isLocked: (0, pg_core_1.boolean)('is_locked').notNull().default(false),
    minXp: (0, pg_core_1.integer)('min_xp').notNull().default(0),
    color: (0, pg_core_1.text)('color').notNull().default('gray'),
    icon: (0, pg_core_1.text)('icon').notNull().default('hash'),
    colorTheme: (0, pg_core_1.text)('color_theme'), // Added for UI theming (e.g., 'theme-pit', 'theme-casino')
    isHidden: (0, pg_core_1.boolean)('is_hidden').notNull().default(false),
    minGroupIdRequired: (0, pg_core_1.integer)('min_group_id_required'),
    pluginData: (0, pg_core_1.jsonb)('plugin_data').default('{}'), // Use jsonb for PostgreSQL
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().default((0, drizzle_orm_1.sql)(templateObject_13 || (templateObject_13 = __makeTemplateObject(["CURRENT_TIMESTAMP"], ["CURRENT_TIMESTAMP"])))), // Use CURRENT_TIMESTAMP for SQLite compatibility
    updatedAt: (0, pg_core_1.timestamp)('updated_at').notNull().default((0, drizzle_orm_1.sql)(templateObject_14 || (templateObject_14 = __makeTemplateObject(["CURRENT_TIMESTAMP"], ["CURRENT_TIMESTAMP"])))), // Use CURRENT_TIMESTAMP for SQLite compatibility
});
exports.threads = (0, pg_core_1.pgTable)('threads', {
    id: (0, pg_core_1.serial)('thread_id').primaryKey(),
    uuid: (0, pg_core_1.uuid)('uuid').notNull().defaultRandom(),
    title: (0, pg_core_1.varchar)('title', { length: 255 }).notNull(),
    slug: (0, pg_core_1.varchar)('slug', { length: 255 }).notNull(),
    categoryId: (0, pg_core_1.integer)('category_id').notNull().references(function () { return exports.forumCategories.id; }, { onDelete: 'cascade' }),
    userId: (0, pg_core_1.integer)('user_id').notNull().references(function () { return exports.users.id; }, { onDelete: 'cascade' }),
    prefixId: (0, pg_core_1.integer)('prefix_id').references(function () { return exports.threadPrefixes.id; }, { onDelete: 'set null' }),
    isSticky: (0, pg_core_1.boolean)('is_sticky').notNull().default(false),
    isLocked: (0, pg_core_1.boolean)('is_locked').notNull().default(false),
    isHidden: (0, pg_core_1.boolean)('is_hidden').notNull().default(false),
    isFeatured: (0, pg_core_1.boolean)('is_featured').notNull().default(false),
    featuredAt: (0, pg_core_1.timestamp)('featured_at'),
    featuredBy: (0, pg_core_1.integer)('featured_by').references(function () { return exports.users.id; }, { onDelete: 'set null' }),
    featuredExpiresAt: (0, pg_core_1.timestamp)('featured_expires_at'),
    isDeleted: (0, pg_core_1.boolean)('is_deleted').notNull().default(false),
    deletedAt: (0, pg_core_1.timestamp)('deleted_at'),
    deletedBy: (0, pg_core_1.integer)('deleted_by').references(function () { return exports.users.id; }, { onDelete: 'set null' }),
    viewCount: (0, pg_core_1.integer)('view_count').notNull().default(0),
    postCount: (0, pg_core_1.integer)('post_count').notNull().default(0),
    firstPostLikeCount: (0, pg_core_1.integer)('first_post_like_count').notNull().default(0),
    dgtStaked: (0, pg_core_1.bigint)('dgt_staked', { mode: 'number' }).notNull().default(0),
    hotScore: (0, pg_core_1.real)('hot_score').notNull().default(0),
    isBoosted: (0, pg_core_1.boolean)('is_boosted').notNull().default(false),
    boostAmountDgt: (0, pg_core_1.bigint)('boost_amount_dgt', { mode: 'number' }).default(0),
    boostExpiresAt: (0, pg_core_1.timestamp)('boost_expires_at'),
    lastPostId: (0, pg_core_1.bigint)('last_post_id', { mode: 'number' }),
    lastPostAt: (0, pg_core_1.timestamp)('last_post_at'),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().default((0, drizzle_orm_1.sql)(templateObject_15 || (templateObject_15 = __makeTemplateObject(["CURRENT_TIMESTAMP"], ["CURRENT_TIMESTAMP"])))), // Use CURRENT_TIMESTAMP for SQLite compatibility
    updatedAt: (0, pg_core_1.timestamp)('updated_at').notNull().default((0, drizzle_orm_1.sql)(templateObject_16 || (templateObject_16 = __makeTemplateObject(["CURRENT_TIMESTAMP"], ["CURRENT_TIMESTAMP"])))), // Use CURRENT_TIMESTAMP for SQLite compatibility
    isArchived: (0, pg_core_1.boolean)('is_archived').notNull().default(false),
    pollId: (0, pg_core_1.bigint)('poll_id', { mode: 'number' }),
    isSolved: (0, pg_core_1.boolean)('is_solved').notNull().default(false), // Added for "Solved" feature
    solvingPostId: (0, pg_core_1.integer)('solving_post_id').references(function () { return exports.posts.id; }, { onDelete: 'set null' }), // Added for "Solved" feature
    pluginData: (0, pg_core_1.jsonb)('plugin_data').default('{}'),
}, function (table) { return ({
    categoryIdx: (0, pg_core_1.index)('idx_threads_category_id').on(table.categoryId),
    userIdx: (0, pg_core_1.index)('idx_threads_user_id').on(table.userId),
    createdAtIdx: (0, pg_core_1.index)('idx_threads_created_at').on(table.createdAt),
    slugUnique: (0, pg_core_1.unique)('threads_slug_visible_unique').on(table.slug),
    hotScoreIdx: (0, pg_core_1.index)('idx_threads_hot_score').on(table.hotScore),
    isBoostedIdx: (0, pg_core_1.index)('idx_threads_is_boosted').on(table.isBoosted)
}); });
exports.posts = (0, pg_core_1.pgTable)('posts', {
    id: (0, pg_core_1.serial)('post_id').primaryKey(),
    uuid: (0, pg_core_1.uuid)('uuid').notNull().defaultRandom(),
    threadId: (0, pg_core_1.integer)('thread_id').notNull().references(function () { return exports.threads.id; }, { onDelete: 'cascade' }),
    userId: (0, pg_core_1.integer)('user_id').notNull().references(function () { return exports.users.id; }, { onDelete: 'cascade' }),
    replyToPostId: (0, pg_core_1.integer)('reply_to_post_id').references(function () { return exports.posts.id; }, { onDelete: 'set null' }), // Self-reference fixed
    content: (0, pg_core_1.text)('content').notNull(),
    editorState: (0, pg_core_1.jsonb)('editor_state'),
    likeCount: (0, pg_core_1.integer)('like_count').notNull().default(0),
    tipCount: (0, pg_core_1.integer)('tip_count').notNull().default(0),
    totalTips: (0, pg_core_1.bigint)('total_tips', { mode: 'number' }).notNull().default(0),
    isFirstPost: (0, pg_core_1.boolean)('is_first_post').notNull().default(false),
    isHidden: (0, pg_core_1.boolean)('is_hidden').notNull().default(false),
    isDeleted: (0, pg_core_1.boolean)('is_deleted').notNull().default(false),
    deletedAt: (0, pg_core_1.timestamp)('deleted_at'),
    deletedBy: (0, pg_core_1.integer)('deleted_by').references(function () { return exports.users.id; }, { onDelete: 'set null' }),
    isEdited: (0, pg_core_1.boolean)('is_edited').notNull().default(false),
    editedAt: (0, pg_core_1.timestamp)('edited_at'),
    editedBy: (0, pg_core_1.integer)('edited_by').references(function () { return exports.users.id; }, { onDelete: 'set null' }),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().default((0, drizzle_orm_1.sql)(templateObject_17 || (templateObject_17 = __makeTemplateObject(["CURRENT_TIMESTAMP"], ["CURRENT_TIMESTAMP"])))), // Use CURRENT_TIMESTAMP for SQLite compatibility
    updatedAt: (0, pg_core_1.timestamp)('updated_at').notNull().default((0, drizzle_orm_1.sql)(templateObject_18 || (templateObject_18 = __makeTemplateObject(["CURRENT_TIMESTAMP"], ["CURRENT_TIMESTAMP"])))), // Use CURRENT_TIMESTAMP for SQLite compatibility
    quarantineData: (0, pg_core_1.jsonb)('quarantine_data'),
    pluginData: (0, pg_core_1.jsonb)('plugin_data').default('{}'),
}, function (table) { return ({
    threadIdx: (0, pg_core_1.index)('idx_posts_thread_id').on(table.threadId),
    replyToIdx: (0, pg_core_1.index)('idx_posts_reply_to').on(table.replyToPostId),
    userIdx: (0, pg_core_1.index)('idx_posts_user_id').on(table.userId),
    totalTipsIdx: (0, pg_core_1.index)('idx_posts_total_tips').on(table.totalTips)
}); });
exports.productCategories = (0, pg_core_1.pgTable)('product_categories', {
    id: (0, pg_core_1.serial)('category_id').primaryKey(),
    name: (0, pg_core_1.varchar)('name', { length: 100 }).notNull(),
    slug: (0, pg_core_1.varchar)('slug', { length: 100 }).notNull().unique(),
    description: (0, pg_core_1.text)('description'),
    imageId: (0, pg_core_1.integer)('image_id').references(function () { return exports.mediaLibrary.id; }, { onDelete: 'set null' }),
    parentId: (0, pg_core_1.integer)('parent_id').references(function () { return exports.productCategories.id; }, { onDelete: 'set null' }), // Self-reference fixed
    position: (0, pg_core_1.integer)('position').notNull().default(0),
    isActive: (0, pg_core_1.boolean)('is_active').notNull().default(true),
    isDeleted: (0, pg_core_1.boolean)('is_deleted').notNull().default(false),
    deletedAt: (0, pg_core_1.timestamp)('deleted_at'),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().default((0, drizzle_orm_1.sql)(templateObject_19 || (templateObject_19 = __makeTemplateObject(["CURRENT_TIMESTAMP"], ["CURRENT_TIMESTAMP"])))), // Use CURRENT_TIMESTAMP for SQLite compatibility
    updatedAt: (0, pg_core_1.timestamp)('updated_at').notNull().default((0, drizzle_orm_1.sql)(templateObject_20 || (templateObject_20 = __makeTemplateObject(["CURRENT_TIMESTAMP"], ["CURRENT_TIMESTAMP"])))), // Use CURRENT_TIMESTAMP for SQLite compatibility
}, function (table) { return ({
    parentIdx: (0, pg_core_1.index)('idx_product_categories_parent_id').on(table.parentId)
}); });
// Define the rest of the tables
exports.levels = (0, pg_core_1.pgTable)('levels', {
    level: (0, pg_core_1.integer)('level').primaryKey().notNull(),
    minXp: (0, pg_core_1.bigint)('min_xp', { mode: 'number' }).notNull().default(0),
    name: (0, pg_core_1.varchar)('name', { length: 100 }),
    rewardDgt: (0, pg_core_1.integer)('reward_dgt').default(0),
    rewardTitleId: (0, pg_core_1.integer)('reward_title_id').references(function () { return exports.titles.id; }, { onDelete: 'set null' }),
    rewardBadgeId: (0, pg_core_1.integer)('reward_badge_id').references(function () { return exports.badges.id; }, { onDelete: 'set null' }),
});
// XP Adjustment Logs to track admin XP modifications
exports.xpAdjustmentLogs = (0, pg_core_1.pgTable)('xp_adjustment_logs', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    userId: (0, pg_core_1.integer)('user_id').notNull().references(function () { return exports.users.id; }, { onDelete: 'cascade' }),
    adminId: (0, pg_core_1.integer)('admin_id').notNull().references(function () { return exports.users.id; }, { onDelete: 'set null' }),
    adjustmentType: (0, pg_core_1.text)('adjustment_type').notNull(), // 'add', 'subtract', 'set'
    amount: (0, pg_core_1.integer)('amount').notNull(),
    reason: (0, pg_core_1.text)('reason').notNull(),
    oldXp: (0, pg_core_1.integer)('old_xp').notNull(),
    newXp: (0, pg_core_1.integer)('new_xp').notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().default((0, drizzle_orm_1.sql)(templateObject_21 || (templateObject_21 = __makeTemplateObject(["CURRENT_TIMESTAMP"], ["CURRENT_TIMESTAMP"])))), // Use CURRENT_TIMESTAMP for SQLite compatibility
});
/**
 * XP Action Settings table
 *
 * Stores configurable settings for XP actions
 * This replaces the hardcoded XP_ACTIONS object in xp-actions.ts
 */
exports.xpActionSettings = (0, pg_core_1.pgTable)('xp_action_settings', {
    action: (0, pg_core_1.text)('action').primaryKey(),
    baseValue: (0, pg_core_1.integer)('base_value').notNull(),
    description: (0, pg_core_1.text)('description').notNull(),
    maxPerDay: (0, pg_core_1.integer)('max_per_day'),
    cooldownSec: (0, pg_core_1.integer)('cooldown_sec'),
    enabled: (0, pg_core_1.boolean)('enabled').default(true).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull()
});
exports.betaFeatureFlags = (0, pg_core_1.pgTable)('beta_feature_flags', {
    id: (0, pg_core_1.serial)('flag_id').primaryKey(),
    name: (0, pg_core_1.varchar)('name', { length: 100 }).notNull().unique(),
    enabled: (0, pg_core_1.boolean)('enabled').notNull().default(false),
    description: (0, pg_core_1.text)('description'),
    accessCode: (0, pg_core_1.varchar)('access_code', { length: 100 }),
    expiresAt: (0, pg_core_1.timestamp)('expires_at'),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').notNull().defaultNow(),
    createdBy: (0, pg_core_1.integer)('created_by').references(function () { return exports.users.id; }, { onDelete: 'set null' }),
    updatedBy: (0, pg_core_1.integer)('updated_by').references(function () { return exports.users.id; }, { onDelete: 'set null' }),
});
exports.userSettings = (0, pg_core_1.pgTable)('user_settings', {
    userId: (0, pg_core_1.integer)('user_id').primaryKey().references(function () { return exports.users.id; }, { onDelete: 'cascade' }),
    theme: (0, pg_core_1.varchar)('theme', { length: 40 }).default('auto'),
    sidebarState: (0, pg_core_1.jsonb)('sidebar_state').default('{}'),
    notificationPrefs: (0, pg_core_1.jsonb)('notification_prefs').default('{}'),
    profileVisibility: (0, pg_core_1.varchar)('profile_visibility', { length: 20 }).default('public'),
    timezone: (0, pg_core_1.varchar)('timezone', { length: 50 }),
    language: (0, pg_core_1.varchar)('language', { length: 20 }).default('en'),
    shoutboxPosition: (0, pg_core_1.varchar)('shoutbox_position', { length: 20 }).default('sidebar-top'),
}, function (table) { return ({
    userIdx: (0, pg_core_1.index)('idx_user_settings_user_id').on(table.userId)
}); });
exports.userSessions = (0, pg_core_1.pgTable)('user_sessions', {
    sid: (0, pg_core_1.text)('sid').primaryKey(),
    sess: (0, pg_core_1.jsonb)('sess').notNull(),
    expire: (0, pg_core_1.timestamp)('expire', { mode: 'date', withTimezone: true }).notNull(),
});
exports.userRoles = (0, pg_core_1.pgTable)('user_roles', {
    userId: (0, pg_core_1.integer)('user_id').notNull().references(function () { return exports.users.id; }, { onDelete: 'cascade' }),
    roleId: (0, pg_core_1.integer)('role_id').notNull().references(function () { return exports.roles.id; }, { onDelete: 'cascade' }),
    grantedAt: (0, pg_core_1.timestamp)('granted_at').notNull().defaultNow(),
    grantedBy: (0, pg_core_1.integer)('granted_by').references(function () { return exports.users.id; }, { onDelete: 'set null' }),
    expiresAt: (0, pg_core_1.timestamp)('expires_at'),
}, function (table) { return ({
    pk: (0, pg_core_1.primaryKey)({ columns: [table.userId, table.roleId] })
}); });
exports.rolePermissions = (0, pg_core_1.pgTable)('role_permissions', {
    roleId: (0, pg_core_1.integer)('role_id').notNull().references(function () { return exports.roles.id; }, { onDelete: 'cascade' }),
    permId: (0, pg_core_1.integer)('perm_id').notNull().references(function () { return exports.permissions.id; }, { onDelete: 'cascade' }),
    grantedAt: (0, pg_core_1.timestamp)('granted_at').notNull().defaultNow(),
    grantedBy: (0, pg_core_1.integer)('granted_by').references(function () { return exports.users.id; }, { onDelete: 'set null' }),
}, function (table) { return ({
    pk: (0, pg_core_1.primaryKey)({ columns: [table.roleId, table.permId] })
}); });
exports.threadTags = (0, pg_core_1.pgTable)('thread_tags', {
    threadId: (0, pg_core_1.integer)('thread_id').notNull().references(function () { return exports.threads.id; }, { onDelete: 'cascade' }),
    tagId: (0, pg_core_1.integer)('tag_id').notNull().references(function () { return exports.tags.id; }, { onDelete: 'cascade' }),
}, function (table) { return ({
    pk: (0, pg_core_1.primaryKey)({ columns: [table.threadId, table.tagId] })
}); });
exports.postDrafts = (0, pg_core_1.pgTable)('post_drafts', {
    id: (0, pg_core_1.serial)('draft_id').primaryKey(),
    uuid: (0, pg_core_1.uuid)('uuid').notNull().defaultRandom(),
    threadId: (0, pg_core_1.integer)('thread_id').references(function () { return exports.threads.id; }, { onDelete: 'cascade' }),
    userId: (0, pg_core_1.integer)('user_id').notNull().references(function () { return exports.users.id; }, { onDelete: 'cascade' }),
    content: (0, pg_core_1.text)('content'),
    editorState: (0, pg_core_1.jsonb)('editor_state'),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').notNull().defaultNow(),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
});
exports.threadDrafts = (0, pg_core_1.pgTable)('thread_drafts', {
    id: (0, pg_core_1.serial)('draft_id').primaryKey(),
    uuid: (0, pg_core_1.uuid)('uuid').notNull().defaultRandom(),
    userId: (0, pg_core_1.integer)('user_id').notNull().references(function () { return exports.users.id; }, { onDelete: 'cascade' }),
    categoryId: (0, pg_core_1.integer)('category_id').notNull().references(function () { return exports.forumCategories.id; }, { onDelete: 'cascade' }),
    title: (0, pg_core_1.varchar)('title', { length: 255 }),
    content: (0, pg_core_1.text)('content'),
    contentHtml: (0, pg_core_1.text)('content_html'),
    editorState: (0, pg_core_1.jsonb)('editor_state'),
    prefixId: (0, pg_core_1.integer)('prefix_id').references(function () { return exports.threadPrefixes.id; }, { onDelete: 'set null' }),
    isPublished: (0, pg_core_1.boolean)('is_published').notNull().default(false),
    lastSavedAt: (0, pg_core_1.timestamp)('last_saved_at').notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').notNull().defaultNow(),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
}, function (table) { return ({
    userIdx: (0, pg_core_1.index)('idx_thread_drafts_user_id').on(table.userId),
    categoryIdx: (0, pg_core_1.index)('idx_thread_drafts_category_id').on(table.categoryId)
}); });
exports.threadFeaturePermissions = (0, pg_core_1.pgTable)('thread_feature_permissions', {
    id: (0, pg_core_1.serial)('feature_id').primaryKey(),
    featureName: (0, pg_core_1.varchar)('feature_name', { length: 50 }).notNull().unique(),
    description: (0, pg_core_1.text)('description'),
    requiredLevel: (0, pg_core_1.integer)('required_level').notNull().default(1),
    roleOverrides: (0, pg_core_1.text)('role_override').array(),
    isEnabled: (0, pg_core_1.boolean)('is_enabled').notNull().default(true),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').notNull().defaultNow(),
});
exports.postReactions = (0, pg_core_1.pgTable)('post_reactions', {
    userId: (0, pg_core_1.integer)('user_id').notNull().references(function () { return exports.users.id; }, { onDelete: 'cascade' }),
    postId: (0, pg_core_1.integer)('post_id').notNull().references(function () { return exports.posts.id; }, { onDelete: 'cascade' }),
    reactionType: (0, exports.reactionTypeEnum)('reaction_type').notNull(), // 'like' | 'helpful'
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
}, function (table) { return ({
    pk: (0, pg_core_1.primaryKey)({ columns: [table.userId, table.postId, table.reactionType] }),
    postIdx: (0, pg_core_1.index)('idx_post_reactions_post_id').on(table.postId),
    reactionTypeIdx: (0, pg_core_1.index)('idx_post_reactions_reaction_type').on(table.reactionType)
}); });
exports.tipSettings = (0, pg_core_1.pgTable)('tip_settings', {
    id: (0, pg_core_1.serial)('setting_id').primaryKey(),
    enabled: (0, pg_core_1.boolean)('enabled').notNull().default(true),
    minAmountDGT: (0, pg_core_1.doublePrecision)('min_amount_dgt').notNull().default(10.00),
    minAmountUSDT: (0, pg_core_1.doublePrecision)('min_amount_usdt').notNull().default(0.10),
    maxAmountDGT: (0, pg_core_1.doublePrecision)('max_amount_dgt').notNull().default(1000.00),
    maxAmountUSDT: (0, pg_core_1.doublePrecision)('max_amount_usdt').notNull().default(100.00),
    burnPercentage: (0, pg_core_1.doublePrecision)('burn_percentage').notNull().default(5.00),
    processingFeePercentage: (0, pg_core_1.doublePrecision)('processing_fee_percentage').notNull().default(2.50),
    cooldownSeconds: (0, pg_core_1.integer)('cooldown_seconds').notNull().default(60),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').notNull().defaultNow()
});
exports.rainSettings = (0, pg_core_1.pgTable)('rain_settings', {
    id: (0, pg_core_1.serial)('setting_id').primaryKey(),
    enabled: (0, pg_core_1.boolean)('enabled').notNull().default(true),
    minAmountDGT: (0, pg_core_1.doublePrecision)('min_amount_dgt').notNull().default(10.00),
    minAmountUSDT: (0, pg_core_1.doublePrecision)('min_amount_usdt').notNull().default(1.00),
    maxRecipients: (0, pg_core_1.integer)('max_recipients').notNull().default(15),
    cooldownSeconds: (0, pg_core_1.integer)('cooldown_seconds').notNull().default(60),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').notNull().defaultNow()
});
exports.onlineUsers = (0, pg_core_1.pgTable)('online_users', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    userId: (0, pg_core_1.integer)('user_id').notNull().references(function () { return exports.users.id; }, { onDelete: 'cascade' }),
    roomId: (0, pg_core_1.integer)('room_id').references(function () { return exports.chatRooms.id; }, { onDelete: 'set null' }), // Forward reference
    lastActive: (0, pg_core_1.timestamp)('last_active').notNull().defaultNow(),
    ipAddress: (0, pg_core_1.varchar)('ip_address', { length: 45 }),
    userAgent: (0, pg_core_1.text)('user_agent'),
    metadata: (0, pg_core_1.jsonb)('metadata').default({}),
}, function (table) { return ({
    userIdx: (0, pg_core_1.index)('idx_online_users_user_id').on(table.userId),
    lastActiveIdx: (0, pg_core_1.index)('idx_online_users_last_active').on(table.lastActive),
    uniqueUserConstraint: (0, pg_core_1.unique)('unique_online_user').on(table.userId)
}); });
exports.notifications = (0, pg_core_1.pgTable)('notifications', {
    id: (0, pg_core_1.serial)('notification_id').primaryKey(),
    userId: (0, pg_core_1.integer)('user_id').notNull().references(function () { return exports.users.id; }, { onDelete: 'cascade' }),
    type: (0, exports.notificationTypeEnum)('type').notNull(),
    title: (0, pg_core_1.varchar)('title', { length: 255 }).notNull(),
    body: (0, pg_core_1.text)('body'),
    data: (0, pg_core_1.jsonb)('data'),
    isRead: (0, pg_core_1.boolean)('is_read').notNull().default(false),
    readAt: (0, pg_core_1.timestamp)('read_at'),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
}, function (table) { return ({
    userIdx: (0, pg_core_1.index)('idx_notifications_user_id').on(table.userId)
}); });
// Insert schemas
exports.insertUserSchema = (0, drizzle_zod_1.createInsertSchema)(exports.users, {
    email: zod_1.z.string().email(),
    username: zod_1.z.string().min(3).max(50),
    password: zod_1.z.string().min(8),
    tosAgreedAt: zod_1.z.date().optional(),
    privacyAgreedAt: zod_1.z.date().optional(),
}).omit({
    id: true,
    uuid: true,
    isActive: true,
    isVerified: true,
    isDeleted: true,
    isBanned: true,
    createdAt: true,
    lastLogin: true,
    referralLevel: true,
    xp: true,
    level: true,
    dgtPoints: true,
    pointsVersion: true,
    verifyToken: true,
    resetToken: true,
    resetTokenExpiresAt: true,
    gdprConsentedAt: true
});
exports.insertForumCategorySchema = (0, drizzle_zod_1.createInsertSchema)(exports.forumCategories, {
    name: zod_1.z.string().min(1).max(100),
    slug: zod_1.z.string().min(1).max(100),
    description: zod_1.z.string().optional(),
}).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    pluginData: true,
    minGroupIdRequired: true,
    parentId: true,
});
exports.insertThreadSchema = (0, drizzle_zod_1.createInsertSchema)(exports.threads).extend({
    title: zod_1.z.string().min(3).max(255),
}).omit({
    id: true,
    uuid: true,
    slug: true,
    isSticky: true,
    isLocked: true,
    isHidden: true,
    isFeatured: true,
    featuredAt: true,
    featuredBy: true,
    featuredExpiresAt: true,
    isDeleted: true,
    deletedAt: true,
    deletedBy: true,
    viewCount: true,
    postCount: true,
    firstPostLikeCount: true,
    dgtStaked: true,
    hotScore: true,
    isBoosted: true,
    boostAmountDgt: true,
    boostExpiresAt: true,
    lastPostId: true,
    lastPostAt: true,
    createdAt: true,
    updatedAt: true,
    isArchived: true,
    pollId: true,
    pluginData: true,
});
exports.insertPostSchema = (0, drizzle_zod_1.createInsertSchema)(exports.posts, {
    content: zod_1.z.string().min(1)
}).omit({
    id: true,
    uuid: true,
    likeCount: true,
    tipCount: true,
    totalTips: true,
    isFirstPost: true,
    isHidden: true,
    isDeleted: true,
    deletedAt: true,
    deletedBy: true,
    isEdited: true,
    editedAt: true,
    editedBy: true,
    createdAt: true,
    updatedAt: true,
    quarantineData: true,
    pluginData: true,
});
exports.chatMessages = (0, pg_core_1.pgTable)('chat_messages', {
    id: (0, pg_core_1.serial)('message_id').primaryKey(),
    userId: (0, pg_core_1.integer)('user_id').notNull().references(function () { return exports.users.id; }, { onDelete: 'cascade' }),
    message: (0, pg_core_1.text)('message').notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
}, function (table) { return ({
    userIdx: (0, pg_core_1.index)('idx_chat_messages_user_id').on(table.userId),
    createdAtIdx: (0, pg_core_1.index)('idx_chat_messages_created_at').on(table.createdAt)
}); });
exports.insertChatMessageSchema = (0, drizzle_zod_1.createInsertSchema)(exports.chatMessages, {
    message: zod_1.z.string().min(1).max(1000)
}).omit({
    id: true,
    createdAt: true
});
exports.insertThreadDraftSchema = (0, drizzle_zod_1.createInsertSchema)(exports.threadDrafts, {
    title: zod_1.z.string().min(3).max(255).optional(),
    content: zod_1.z.string().optional(),
    contentHtml: zod_1.z.string().optional(),
    editorState: zod_1.z.any().optional()
}).omit({
    id: true,
    uuid: true,
    lastSavedAt: true,
    updatedAt: true,
    createdAt: true,
    isPublished: true
});
exports.insertThreadFeaturePermissionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.threadFeaturePermissions, {
    featureName: zod_1.z.string().min(1).max(50),
    description: zod_1.z.string().optional(),
    requiredLevel: zod_1.z.number().int().min(1).default(1),
    roleOverrides: zod_1.z.array(zod_1.z.string()).optional(),
    isEnabled: zod_1.z.boolean().default(true)
}).omit({
    id: true,
    createdAt: true,
    updatedAt: true
});
exports.siteSettings = (0, pg_core_1.pgTable)('site_settings', {
    id: (0, pg_core_1.serial)('setting_id').primaryKey(),
    key: (0, pg_core_1.varchar)('key', { length: 100 }).notNull().unique(),
    value: (0, pg_core_1.text)('value'),
    valueType: (0, pg_core_1.varchar)('value_type', { length: 20 }).notNull().default('string'), // string, number, boolean, json
    group: (0, pg_core_1.varchar)('group', { length: 100 }).notNull().default('general'),
    description: (0, pg_core_1.text)('description'),
    isPublic: (0, pg_core_1.boolean)('is_public').notNull().default(false),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().default((0, drizzle_orm_1.sql)(templateObject_22 || (templateObject_22 = __makeTemplateObject(["CURRENT_TIMESTAMP"], ["CURRENT_TIMESTAMP"])))), // Use CURRENT_TIMESTAMP for SQLite compatibility
    updatedAt: (0, pg_core_1.timestamp)('updated_at').notNull().default((0, drizzle_orm_1.sql)(templateObject_23 || (templateObject_23 = __makeTemplateObject(["CURRENT_TIMESTAMP"], ["CURRENT_TIMESTAMP"])))), // Use CURRENT_TIMESTAMP for SQLite compatibility
});
exports.adminThemes = (0, pg_core_1.pgTable)('admin_themes', {
    id: (0, pg_core_1.serial)('theme_id').primaryKey(),
    name: (0, pg_core_1.varchar)('name', { length: 100 }).notNull().unique(),
    description: (0, pg_core_1.text)('description'),
    cssVars: (0, pg_core_1.jsonb)('css_vars').notNull().default('{}'),
    customCss: (0, pg_core_1.text)('custom_css'),
    isActive: (0, pg_core_1.boolean)('is_active').notNull().default(false),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').notNull().defaultNow(),
    createdBy: (0, pg_core_1.integer)('created_by').references(function () { return exports.users.id; }, { onDelete: 'set null' }),
});
exports.siteTemplates = (0, pg_core_1.pgTable)('site_templates', {
    id: (0, pg_core_1.serial)('template_id').primaryKey(),
    name: (0, pg_core_1.varchar)('name', { length: 100 }).notNull().unique(),
    type: (0, pg_core_1.varchar)('type', { length: 50 }).notNull(), // page, email, component
    content: (0, pg_core_1.text)('content').notNull(),
    description: (0, pg_core_1.text)('description'),
    isActive: (0, pg_core_1.boolean)('is_active').notNull().default(true),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').notNull().defaultNow(),
    createdBy: (0, pg_core_1.integer)('created_by').references(function () { return exports.users.id; }, { onDelete: 'set null' }),
});
exports.achievements = (0, pg_core_1.pgTable)('achievements', {
    id: (0, pg_core_1.serial)('achievement_id').primaryKey(),
    name: (0, pg_core_1.varchar)('name', { length: 100 }).notNull().unique(),
    description: (0, pg_core_1.text)('description'),
    iconUrl: (0, pg_core_1.varchar)('icon_url', { length: 255 }),
    rewardXp: (0, pg_core_1.integer)('reward_xp').notNull().default(0),
    rewardPoints: (0, pg_core_1.integer)('reward_points').notNull().default(0),
    requirement: (0, pg_core_1.jsonb)('requirement').notNull().default('{}'), // JSON schema for achievement criteria
    isActive: (0, pg_core_1.boolean)('is_active').notNull().default(true),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
});
exports.userAchievements = (0, pg_core_1.pgTable)('user_achievements', {
    userId: (0, pg_core_1.integer)('user_id').notNull().references(function () { return exports.users.id; }, { onDelete: 'cascade' }),
    achievementId: (0, pg_core_1.integer)('achievement_id').notNull().references(function () { return exports.achievements.id; }, { onDelete: 'cascade' }),
    awardedAt: (0, pg_core_1.timestamp)('awarded_at').notNull().defaultNow(),
    progress: (0, pg_core_1.jsonb)('progress').notNull().default('{}'), // Current progress toward achievement
}, function (table) { return ({
    pk: (0, pg_core_1.primaryKey)({ columns: [table.userId, table.achievementId] })
}); });
exports.wallets = (0, pg_core_1.pgTable)('wallets', {
    id: (0, pg_core_1.serial)('wallet_id').primaryKey(),
    userId: (0, pg_core_1.integer)('user_id').notNull().references(function () { return exports.users.id; }, { onDelete: 'cascade' }),
    balance: (0, pg_core_1.doublePrecision)('balance').notNull().default(0),
    lastTransaction: (0, pg_core_1.timestamp)('last_transaction'),
    isDeleted: (0, pg_core_1.boolean)('is_deleted').notNull().default(false),
    deletedAt: (0, pg_core_1.timestamp)('deleted_at'),
    deletedBy: (0, pg_core_1.integer)('deleted_by').references(function () { return exports.users.id; }, { onDelete: 'set null' }),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').notNull().defaultNow(),
}, function (table) { return ({
    userIdx: (0, pg_core_1.index)('idx_wallets_user_id').on(table.userId)
}); });
exports.transactions = (0, pg_core_1.pgTable)('transactions', {
    id: (0, pg_core_1.serial)('transaction_id').primaryKey(),
    userId: (0, pg_core_1.integer)('user_id').references(function () { return exports.users.id; }, { onDelete: 'set null' }),
    walletId: (0, pg_core_1.integer)('wallet_id').references(function () { return exports.wallets.id; }, { onDelete: 'cascade' }),
    fromUserId: (0, pg_core_1.integer)('from_user_id').references(function () { return exports.users.id; }, { onDelete: 'set null' }),
    toUserId: (0, pg_core_1.integer)('to_user_id').references(function () { return exports.users.id; }, { onDelete: 'set null' }),
    amount: (0, pg_core_1.bigint)('amount', { mode: 'number' }).notNull(),
    type: (0, exports.transactionTypeEnum)('type').notNull(),
    status: (0, exports.transactionStatusEnum)('status').notNull().default('pending'),
    description: (0, pg_core_1.text)('description'),
    metadata: (0, pg_core_1.jsonb)('metadata').default('{}'),
    blockchainTxId: (0, pg_core_1.varchar)('blockchain_tx_id', { length: 255 }),
    fromWalletAddress: (0, pg_core_1.varchar)('from_wallet_address', { length: 255 }),
    toWalletAddress: (0, pg_core_1.varchar)('to_wallet_address', { length: 255 }),
    isTreasuryTransaction: (0, pg_core_1.boolean)('is_treasury_transaction').default(false),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').notNull().defaultNow(),
}, function (table) { return ({
    userIdx: (0, pg_core_1.index)('idx_transactions_user_id').on(table.userId),
    walletIdx: (0, pg_core_1.index)('idx_transactions_wallet_id').on(table.walletId),
    fromUserIdx: (0, pg_core_1.index)('idx_transactions_from_user_id').on(table.fromUserId),
    toUserIdx: (0, pg_core_1.index)('idx_transactions_to_user_id').on(table.toUserId),
    typeIdx: (0, pg_core_1.index)('idx_transactions_type').on(table.type),
    statusIdx: (0, pg_core_1.index)('idx_transactions_status').on(table.status),
    createdAtIdx: (0, pg_core_1.index)('idx_transactions_created_at').on(table.createdAt),
    typeStatusIdx: (0, pg_core_1.index)('idx_transactions_type_status').on(table.type, table.status)
}); });
// [REFAC-DGT] DGT purchase orders table to track crypto-to-DGT purchases
exports.dgtPurchaseOrders = (0, pg_core_1.pgTable)('dgt_purchase_orders', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    userId: (0, pg_core_1.integer)('user_id').notNull().references(function () { return exports.users.id; }, { onDelete: 'cascade' }),
    dgtAmountRequested: (0, pg_core_1.bigint)('dgt_amount_requested', { mode: 'number' }).notNull(),
    cryptoAmountExpected: (0, pg_core_1.decimal)('crypto_amount_expected', { precision: 18, scale: 8 }).notNull(),
    cryptoCurrencyExpected: (0, pg_core_1.varchar)('crypto_currency_expected', { length: 10 }).notNull(),
    ccpaymentReference: (0, pg_core_1.varchar)('ccpayment_reference', { length: 255 }).notNull(),
    status: (0, pg_core_1.varchar)('status', { length: 20 }).notNull().default('pending'),
    metadata: (0, pg_core_1.jsonb)('metadata').default('{}'),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').notNull().defaultNow(),
}, function (table) { return ({
    userIdx: (0, pg_core_1.index)('idx_dgt_purchase_orders_user_id').on(table.userId),
    statusIdx: (0, pg_core_1.index)('idx_dgt_purchase_orders_status').on(table.status),
    ccpaymentRefIdx: (0, pg_core_1.index)('idx_dgt_purchase_orders_ccpayment_ref').on(table.ccpaymentReference),
    createdAtIdx: (0, pg_core_1.index)('idx_dgt_purchase_orders_created_at').on(table.createdAt)
}); });
// Create schema and types for dgtPurchaseOrders
exports.insertDgtPurchaseOrderSchema = (0, drizzle_zod_1.createInsertSchema)(exports.dgtPurchaseOrders, {
    dgtAmountRequested: zod_1.z.number().min(1),
    cryptoAmountExpected: zod_1.z.number().min(0.00000001),
    cryptoCurrencyExpected: zod_1.z.string().min(1).max(10),
    ccpaymentReference: zod_1.z.string().min(1).max(255)
}).omit({
    id: true,
    userId: true, // Set by the server
    status: true, // Managed by the server
    metadata: true,
    createdAt: true,
    updatedAt: true
});
exports.featureFlags = (0, pg_core_1.pgTable)('feature_flags', {
    id: (0, pg_core_1.serial)('flag_id').primaryKey(),
    key: (0, pg_core_1.varchar)('key', { length: 100 }).notNull().unique(),
    name: (0, pg_core_1.varchar)('name', { length: 100 }).notNull(),
    description: (0, pg_core_1.text)('description'),
    isEnabled: (0, pg_core_1.boolean)('is_enabled').notNull().default(false),
    config: (0, pg_core_1.jsonb)('config').notNull().default('{}'),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').notNull().defaultNow(),
});
exports.analyticsEvents = (0, pg_core_1.pgTable)('analytics_events', {
    id: (0, pg_core_1.serial)('event_id').primaryKey(),
    userId: (0, pg_core_1.integer)('user_id').references(function () { return exports.users.id; }, { onDelete: 'set null' }),
    sessionId: (0, pg_core_1.uuid)('session_id'),
    type: (0, pg_core_1.varchar)('event_type', { length: 100 }).notNull(),
    data: (0, pg_core_1.jsonb)('data').notNull().default('{}'),
    ipAddress: (0, pg_core_1.varchar)('ip_address', { length: 50 }),
    userAgent: (0, pg_core_1.text)('user_agent'),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
}, function (table) { return ({
    userIdx: (0, pg_core_1.index)('idx_analytics_events_user_id').on(table.userId),
    typeIdx: (0, pg_core_1.index)('idx_analytics_events_type').on(table.type),
    createdAtIdx: (0, pg_core_1.index)('idx_analytics_events_created_at').on(table.createdAt)
}); });
exports.auditLogs = (0, pg_core_1.pgTable)('audit_logs', {
    id: (0, pg_core_1.serial)('log_id').primaryKey(),
    userId: (0, pg_core_1.integer)('user_id').references(function () { return exports.users.id; }, { onDelete: 'set null' }),
    action: (0, pg_core_1.varchar)('action', { length: 100 }).notNull(),
    entityType: (0, pg_core_1.varchar)('entity_type', { length: 100 }).notNull(),
    entityId: (0, pg_core_1.varchar)('entity_id', { length: 100 }),
    before: (0, pg_core_1.jsonb)('before'),
    after: (0, pg_core_1.jsonb)('after'),
    ipAddress: (0, pg_core_1.varchar)('ip_address', { length: 50 }),
    userAgent: (0, pg_core_1.text)('user_agent'),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
}, function (table) { return ({
    userIdx: (0, pg_core_1.index)('idx_audit_logs_user_id').on(table.userId),
    entityTypeIdx: (0, pg_core_1.index)('idx_audit_logs_entity_type').on(table.entityType),
    createdAtIdx: (0, pg_core_1.index)('idx_audit_logs_created_at').on(table.createdAt)
}); });
exports.seoMetadata = (0, pg_core_1.pgTable)('seo_metadata', {
    id: (0, pg_core_1.serial)('meta_id').primaryKey(),
    path: (0, pg_core_1.varchar)('path', { length: 255 }).notNull().unique(),
    title: (0, pg_core_1.varchar)('title', { length: 255 }),
    description: (0, pg_core_1.text)('description'),
    keywords: (0, pg_core_1.text)('keywords'),
    ogImage: (0, pg_core_1.varchar)('og_image', { length: 255 }),
    canonicalUrl: (0, pg_core_1.varchar)('canonical_url', { length: 255 }),
    robots: (0, pg_core_1.varchar)('robots', { length: 100 }),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').notNull().defaultNow(),
    updatedBy: (0, pg_core_1.integer)('updated_by').references(function () { return exports.users.id; }, { onDelete: 'set null' }),
});
exports.forumRules = (0, pg_core_1.pgTable)('forum_rules', {
    id: (0, pg_core_1.serial)('rule_id').primaryKey(),
    title: (0, pg_core_1.varchar)('title', { length: 255 }).notNull(),
    content: (0, pg_core_1.text)('content').notNull(),
    contentHtml: (0, pg_core_1.text)('content_html'),
    section: (0, pg_core_1.varchar)('section', { length: 100 }).notNull().default('general'),
    position: (0, pg_core_1.integer)('position').notNull().default(0),
    status: (0, exports.contentEditStatusEnum)('status').notNull().default('published'),
    isRequired: (0, pg_core_1.boolean)('is_required').notNull().default(false),
    lastAgreedVersionHash: (0, pg_core_1.varchar)('last_agreed_version_hash', { length: 255 }),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').notNull().defaultNow(),
    createdBy: (0, pg_core_1.integer)('created_by').references(function () { return exports.users.id; }, { onDelete: 'set null' }),
    updatedBy: (0, pg_core_1.integer)('updated_by').references(function () { return exports.users.id; }, { onDelete: 'set null' }),
}, function (table) { return ({
    sectionIdx: (0, pg_core_1.index)('idx_forum_rules_section').on(table.section),
    statusIdx: (0, pg_core_1.index)('idx_forum_rules_status').on(table.status)
}); });
exports.userRulesAgreements = (0, pg_core_1.pgTable)('user_rules_agreements', {
    userId: (0, pg_core_1.integer)('user_id').notNull().references(function () { return exports.users.id; }, { onDelete: 'cascade' }),
    ruleId: (0, pg_core_1.integer)('rule_id').notNull().references(function () { return exports.forumRules.id; }, { onDelete: 'cascade' }),
    versionHash: (0, pg_core_1.varchar)('version_hash', { length: 255 }).notNull(),
    agreedAt: (0, pg_core_1.timestamp)('agreed_at').notNull().defaultNow(),
}, function (table) { return ({
    pk: (0, pg_core_1.primaryKey)({ columns: [table.userId, table.ruleId] }),
    userIdx: (0, pg_core_1.index)('idx_user_rules_agreements_user_id').on(table.userId)
}); });
exports.customEmojis = (0, pg_core_1.pgTable)('custom_emojis', {
    id: (0, pg_core_1.serial)('emoji_id').primaryKey(),
    name: (0, pg_core_1.varchar)('name', { length: 50 }).notNull().unique(),
    code: (0, pg_core_1.varchar)('code', { length: 50 }).notNull(),
    type: (0, pg_core_1.varchar)('type', { length: 20 }).notNull().default('static'),
    url: (0, pg_core_1.varchar)('url', { length: 255 }).notNull(),
    previewUrl: (0, pg_core_1.varchar)('preview_url', { length: 255 }),
    category: (0, pg_core_1.varchar)('category', { length: 50 }).default('standard'),
    isLocked: (0, pg_core_1.boolean)('is_locked').notNull().default(true),
    unlockType: (0, pg_core_1.varchar)('unlock_type', { length: 20 }).default('free'),
    priceDgt: (0, pg_core_1.bigint)('price_dgt', { mode: 'number' }),
    requiredPath: (0, pg_core_1.varchar)('required_path', { length: 50 }),
    requiredPathXP: (0, pg_core_1.integer)('required_path_xp'),
    xpValue: (0, pg_core_1.integer)('xp_value').notNull().default(0),
    cloutValue: (0, pg_core_1.integer)('clout_value').notNull().default(0),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').notNull().defaultNow(),
    createdBy: (0, pg_core_1.integer)('created_by').references(function () { return exports.users.id; }, { onDelete: 'set null' }),
    isDeleted: (0, pg_core_1.boolean)('is_deleted').notNull().default(false),
    deletedAt: (0, pg_core_1.timestamp)('deleted_at'),
}, function (table) { return ({
    nameIdx: (0, pg_core_1.index)('idx_custom_emojis_name').on(table.name),
    categoryIdx: (0, pg_core_1.index)('idx_custom_emojis_category').on(table.category),
    typeIdx: (0, pg_core_1.index)('idx_custom_emojis_type').on(table.type),
    unlockTypeIdx: (0, pg_core_1.index)('idx_custom_emojis_unlock_type').on(table.unlockType)
}); });
exports.userBadges = (0, pg_core_1.pgTable)('user_badges', {
    userId: (0, pg_core_1.integer)('user_id').notNull().references(function () { return exports.users.id; }, { onDelete: 'cascade' }),
    badgeId: (0, pg_core_1.integer)('badge_id').notNull().references(function () { return exports.badges.id; }, { onDelete: 'cascade' }),
    awardedAt: (0, pg_core_1.timestamp)('awarded_at').notNull().defaultNow(),
}, function (table) { return ({
    pk: (0, pg_core_1.primaryKey)({ columns: [table.userId, table.badgeId] })
}); });
exports.userTitles = (0, pg_core_1.pgTable)('user_titles', {
    userId: (0, pg_core_1.integer)('user_id').notNull().references(function () { return exports.users.id; }, { onDelete: 'cascade' }),
    titleId: (0, pg_core_1.integer)('title_id').notNull().references(function () { return exports.titles.id; }, { onDelete: 'cascade' }),
    awardedAt: (0, pg_core_1.timestamp)('awarded_at').notNull().defaultNow(),
}, function (table) { return ({
    pk: (0, pg_core_1.primaryKey)({ columns: [table.userId, table.titleId] })
}); });
exports.vaults = (0, pg_core_1.pgTable)('vaults', {
    id: (0, pg_core_1.serial)('vault_id').primaryKey(),
    userId: (0, pg_core_1.integer)('user_id').notNull().references(function () { return exports.users.id; }, { onDelete: 'cascade' }),
    walletAddress: (0, pg_core_1.varchar)('wallet_address', { length: 255 }).notNull(),
    amount: (0, pg_core_1.doublePrecision)('amount').notNull(),
    initialAmount: (0, pg_core_1.doublePrecision)('initial_amount').notNull(),
    lockedAt: (0, pg_core_1.timestamp)('locked_at').notNull().defaultNow(),
    unlockTime: (0, pg_core_1.timestamp)('unlock_time'),
    status: (0, exports.vaultStatusEnum)('status').notNull().default('locked'),
    unlockedAt: (0, pg_core_1.timestamp)('unlocked_at'),
    lockTransactionId: (0, pg_core_1.integer)('lock_transaction_id').references(function () { return exports.transactions.id; }, { onDelete: 'set null' }), // Forward reference
    unlockTransactionId: (0, pg_core_1.integer)('unlock_transaction_id').references(function () { return exports.transactions.id; }, { onDelete: 'set null' }), // Forward reference
    blockchainTxId: (0, pg_core_1.varchar)('blockchain_tx_id', { length: 255 }),
    unlockBlockchainTxId: (0, pg_core_1.varchar)('unlock_blockchain_tx_id', { length: 255 }),
    metadata: (0, pg_core_1.jsonb)('metadata').default('{}'),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').notNull().defaultNow(),
    notes: (0, pg_core_1.text)('notes'),
}, function (table) { return ({
    userIdx: (0, pg_core_1.index)('idx_vaults_user_id').on(table.userId),
    statusIdx: (0, pg_core_1.index)('idx_vaults_status').on(table.status),
    unlockTimeIdx: (0, pg_core_1.index)('idx_vaults_unlock_time').on(table.unlockTime),
    walletAddressIdx: (0, pg_core_1.index)('idx_vaults_wallet_address').on(table.walletAddress)
}); });
var isDevelopment = function () { return process.env.NODE_ENV !== 'production'; };
var walletAddressSchema = zod_1.z.union([
    zod_1.z.string().min(34).max(34),
    zod_1.z.string().refine(function (addr) { return isDevelopment() && ['TREASURY_SYSTEM_TRON_ADDRESS', 'TRzJRNqjgmzCR4zwm6wLMnECDj35zZZnVt'].includes(addr); }, { message: "Invalid wallet address format" })
]);
exports.insertVaultSchema = (0, drizzle_zod_1.createInsertSchema)(exports.vaults, {
    walletAddress: walletAddressSchema,
    amount: zod_1.z.number().positive(),
    unlockTime: zod_1.z.date().refine(function (date) { return date > new Date(); }, {
        message: "Unlock time must be in the future"
    }).optional().nullable(),
    notes: zod_1.z.string().optional()
}).omit({
    id: true,
    userId: true,
    initialAmount: true,
    lockedAt: true,
    status: true,
    unlockedAt: true,
    lockTransactionId: true,
    unlockTransactionId: true,
    blockchainTxId: true,
    unlockBlockchainTxId: true,
    metadata: true,
    createdAt: true,
    updatedAt: true
});
exports.withdrawalRequests = (0, pg_core_1.pgTable)('withdrawal_requests', {
    id: (0, pg_core_1.serial)('request_id').primaryKey(),
    userId: (0, pg_core_1.integer)('user_id').notNull().references(function () { return exports.users.id; }, { onDelete: 'cascade' }),
    amount: (0, pg_core_1.bigint)('amount', { mode: 'number' }).notNull(),
    status: (0, exports.withdrawalStatusEnum)('status').notNull().default('pending'),
    walletAddress: (0, pg_core_1.varchar)('wallet_address', { length: 255 }).notNull(),
    transactionId: (0, pg_core_1.integer)('transaction_id').references(function () { return exports.transactions.id; }, { onDelete: 'set null' }),
    processingFee: (0, pg_core_1.bigint)('processing_fee', { mode: 'number' }).notNull().default(0),
    requestNotes: (0, pg_core_1.text)('request_notes'),
    adminNotes: (0, pg_core_1.text)('admin_notes'),
    processed: (0, pg_core_1.boolean)('processed').notNull().default(false),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
    fulfilledAt: (0, pg_core_1.timestamp)('fulfilled_at'),
    processedBy: (0, pg_core_1.integer)('processed_by').references(function () { return exports.users.id; }, { onDelete: 'set null' }),
}, function (table) { return ({
    userIdx: (0, pg_core_1.index)('idx_withdrawal_requests_user_id').on(table.userId),
    statusIdx: (0, pg_core_1.index)('idx_withdrawal_requests_status').on(table.status),
    createdAtIdx: (0, pg_core_1.index)('idx_withdrawal_requests_created_at').on(table.createdAt)
}); });
exports.insertWithdrawalRequestSchema = (0, drizzle_zod_1.createInsertSchema)(exports.withdrawalRequests, {
    amount: zod_1.z.number().min(1),
    walletAddress: zod_1.z.string().min(1).max(255)
}).omit({
    id: true,
    status: true,
    transactionId: true,
    processingFee: true,
    adminNotes: true,
    processed: true,
    createdAt: true,
    fulfilledAt: true,
    processedBy: true
});
exports.insertForumRuleSchema = (0, drizzle_zod_1.createInsertSchema)(exports.forumRules, {
    title: zod_1.z.string().min(3).max(255),
    content: zod_1.z.string().min(10),
    section: zod_1.z.string().min(1).max(100),
    isRequired: zod_1.z.boolean().default(false)
}).omit({
    id: true,
    status: true,
    contentHtml: true,
    lastAgreedVersionHash: true,
    createdAt: true,
    updatedAt: true,
    createdBy: true,
    updatedBy: true
});
exports.rateLimits = (0, pg_core_1.pgTable)('rate_limits', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    key: (0, pg_core_1.text)('key').notNull(), // User ID or IP address
    endpoint: (0, pg_core_1.text)('endpoint').notNull(), // API endpoint being rate-limited
    count: (0, pg_core_1.integer)('count').notNull().default(0), // Number of requests made
    resetAt: (0, pg_core_1.timestamp)('reset_at').notNull(), // When the rate limit resets
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').notNull()
});
exports.treasurySettings = (0, pg_core_1.pgTable)('treasury_settings', {
    id: (0, pg_core_1.serial)('setting_id').primaryKey(),
    treasuryWalletAddress: (0, pg_core_1.varchar)('treasury_wallet_address', { length: 255 }),
    dgtTreasuryBalance: (0, pg_core_1.bigint)('dgt_treasury_balance', { mode: 'number' }).notNull().default(0),
    minWithdrawalAmount: (0, pg_core_1.bigint)('min_withdrawal_amount', { mode: 'number' }).notNull().default(5000000),
    withdrawalFeePercent: (0, pg_core_1.doublePrecision)('withdrawal_fee_percent').notNull().default(0),
    rewardDistributionDelayHours: (0, pg_core_1.integer)('reward_distribution_delay_hours').notNull().default(24),
    tipBurnPercent: (0, pg_core_1.integer)('tip_burn_percent').notNull().default(10),
    tipRecipientPercent: (0, pg_core_1.integer)('tip_recipient_percent').notNull().default(90),
    minTipAmount: (0, pg_core_1.bigint)('min_tip_amount', { mode: 'number' }).notNull().default(1000000),
    maxTipAmount: (0, pg_core_1.bigint)('max_tip_amount', { mode: 'number' }).notNull().default(1000000000),
    enableLikes: (0, pg_core_1.boolean)('enable_likes').notNull().default(true),
    enableTips: (0, pg_core_1.boolean)('enable_tips').notNull().default(true),
    likesGiveXp: (0, pg_core_1.boolean)('likes_give_xp').notNull().default(true),
    tipsGiveXp: (0, pg_core_1.boolean)('tips_give_xp').notNull().default(true),
    likeXpAmount: (0, pg_core_1.integer)('like_xp_amount').notNull().default(5),
    tipXpMultiplier: (0, pg_core_1.doublePrecision)('tip_xp_multiplier').notNull().default(0.1),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').notNull().defaultNow(),
    updatedBy: (0, pg_core_1.integer)('updated_by').references(function () { return exports.users.id; }, { onDelete: 'set null' }),
});
exports.products = (0, pg_core_1.pgTable)('products', {
    id: (0, pg_core_1.serial)('product_id').primaryKey(),
    uuid: (0, pg_core_1.uuid)('uuid').notNull().defaultRandom(),
    name: (0, pg_core_1.varchar)('name', { length: 255 }).notNull(),
    slug: (0, pg_core_1.varchar)('slug', { length: 255 }).notNull().unique(),
    description: (0, pg_core_1.text)('description'),
    richDescription: (0, pg_core_1.text)('rich_description'),
    price: (0, pg_core_1.doublePrecision)('price').notNull().default(0),
    discountPrice: (0, pg_core_1.doublePrecision)('discount_price'),
    costPrice: (0, pg_core_1.doublePrecision)('cost_price'),
    sku: (0, pg_core_1.varchar)('sku', { length: 100 }),
    barcode: (0, pg_core_1.varchar)('barcode', { length: 100 }),
    stock: (0, pg_core_1.integer)('stock').notNull().default(0),
    weight: (0, pg_core_1.doublePrecision)('weight'),
    dimensions: (0, pg_core_1.jsonb)('dimensions').default('{}'),
    categoryId: (0, pg_core_1.integer)('category_id').references(function () { return exports.productCategories.id; }, { onDelete: 'set null' }),
    featuredImageId: (0, pg_core_1.integer)('featured_image_id').references(function () { return exports.mediaLibrary.id; }, { onDelete: 'set null' }),
    status: (0, pg_core_1.varchar)('status', { length: 50 }).notNull().default('draft'),
    pluginReward: (0, pg_core_1.jsonb)('plugin_reward').default('{}'),
    isDigital: (0, pg_core_1.boolean)('is_digital').notNull().default(false),
    digitalFileId: (0, pg_core_1.integer)('digital_file_id').references(function () { return exports.mediaLibrary.id; }, { onDelete: 'set null' }),
    pointsPrice: (0, pg_core_1.integer)('points_price'),
    publishedAt: (0, pg_core_1.timestamp)('published_at'),
    availableFrom: (0, pg_core_1.timestamp)('available_from'),
    availableUntil: (0, pg_core_1.timestamp)('available_until'),
    stockLimit: (0, pg_core_1.integer)('stock_limit'),
    featuredUntil: (0, pg_core_1.timestamp)('featured_until'),
    promotionLabel: (0, pg_core_1.varchar)('promotion_label', { length: 100 }),
    isDeleted: (0, pg_core_1.boolean)('is_deleted').notNull().default(false),
    deletedAt: (0, pg_core_1.timestamp)('deleted_at'),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').notNull().defaultNow(),
    metadata: (0, pg_core_1.jsonb)('metadata').default('{}'),
}, function (table) { return ({
    categoryIdx: (0, pg_core_1.index)('idx_products_category_id').on(table.categoryId),
    statusIdx: (0, pg_core_1.index)('idx_products_status').on(table.status),
    createdAtIdx: (0, pg_core_1.index)('idx_products_created_at').on(table.createdAt),
    availableFromIdx: (0, pg_core_1.index)('idx_products_available_from').on(table.availableFrom),
    availableUntilIdx: (0, pg_core_1.index)('idx_products_available_until').on(table.availableUntil),
    featuredUntilIdx: (0, pg_core_1.index)('idx_products_featured_until').on(table.featuredUntil)
}); });
exports.productMedia = (0, pg_core_1.pgTable)('product_media', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    productId: (0, pg_core_1.integer)('product_id').notNull().references(function () { return exports.products.id; }, { onDelete: 'cascade' }),
    mediaId: (0, pg_core_1.integer)('media_id').notNull().references(function () { return exports.mediaLibrary.id; }, { onDelete: 'cascade' }),
    position: (0, pg_core_1.integer)('position').notNull().default(0),
    isPrimary: (0, pg_core_1.boolean)('is_primary').notNull().default(false),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
}, function (table) { return ({
    productMediaIdx: (0, pg_core_1.unique)('product_media_unique').on(table.productId, table.mediaId),
    productIdx: (0, pg_core_1.index)('idx_product_media_product_id').on(table.productId)
}); });
exports.orders = (0, pg_core_1.pgTable)('orders', {
    id: (0, pg_core_1.serial)('order_id').primaryKey(),
    uuid: (0, pg_core_1.uuid)('uuid').notNull().defaultRandom(),
    userId: (0, pg_core_1.integer)('user_id').references(function () { return exports.users.id; }, { onDelete: 'set null' }),
    status: (0, pg_core_1.varchar)('status', { length: 50 }).notNull().default('pending'),
    total: (0, pg_core_1.doublePrecision)('total').notNull().default(0),
    subtotal: (0, pg_core_1.doublePrecision)('subtotal').notNull().default(0),
    tax: (0, pg_core_1.doublePrecision)('tax').default(0),
    shipping: (0, pg_core_1.doublePrecision)('shipping').default(0),
    discount: (0, pg_core_1.doublePrecision)('discount').default(0),
    paymentMethod: (0, pg_core_1.varchar)('payment_method', { length: 100 }),
    paymentId: (0, pg_core_1.varchar)('payment_id', { length: 255 }),
    billingAddress: (0, pg_core_1.jsonb)('billing_address').default('{}'),
    shippingAddress: (0, pg_core_1.jsonb)('shipping_address').default('{}'),
    customerNotes: (0, pg_core_1.text)('customer_notes'),
    adminNotes: (0, pg_core_1.text)('admin_notes'),
    isPointsUsed: (0, pg_core_1.boolean)('is_points_used').notNull().default(false),
    pointsUsed: (0, pg_core_1.integer)('points_used').default(0),
    isDeleted: (0, pg_core_1.boolean)('is_deleted').notNull().default(false),
    deletedAt: (0, pg_core_1.timestamp)('deleted_at'),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').notNull().defaultNow(),
    completedAt: (0, pg_core_1.timestamp)('completed_at'),
}, function (table) { return ({
    userIdx: (0, pg_core_1.index)('idx_orders_user_id').on(table.userId),
    statusIdx: (0, pg_core_1.index)('idx_orders_status').on(table.status),
    createdAtIdx: (0, pg_core_1.index)('idx_orders_created_at').on(table.createdAt)
}); });
exports.orderItems = (0, pg_core_1.pgTable)('order_items', {
    id: (0, pg_core_1.serial)('item_id').primaryKey(),
    orderId: (0, pg_core_1.integer)('order_id').notNull().references(function () { return exports.orders.id; }, { onDelete: 'cascade' }),
    productId: (0, pg_core_1.integer)('product_id').references(function () { return exports.products.id; }, { onDelete: 'set null' }),
    productName: (0, pg_core_1.varchar)('product_name', { length: 255 }).notNull(),
    quantity: (0, pg_core_1.integer)('quantity').notNull().default(1),
    price: (0, pg_core_1.doublePrecision)('price').notNull(),
    total: (0, pg_core_1.doublePrecision)('total').notNull(),
    isPointsUsed: (0, pg_core_1.boolean)('is_points_used').notNull().default(false),
    pointsUsed: (0, pg_core_1.integer)('points_used').default(0),
    metadata: (0, pg_core_1.jsonb)('metadata').default('{}'),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
}, function (table) { return ({
    orderIdx: (0, pg_core_1.index)('idx_order_items_order_id').on(table.orderId),
    productIdx: (0, pg_core_1.index)('idx_order_items_product_id').on(table.productId)
}); });
exports.inventoryTransactions = (0, pg_core_1.pgTable)('inventory_transactions', {
    id: (0, pg_core_1.serial)('transaction_id').primaryKey(),
    userId: (0, pg_core_1.integer)('user_id').notNull().references(function () { return exports.users.id; }, { onDelete: 'cascade' }),
    productId: (0, pg_core_1.integer)('product_id').notNull().references(function () { return exports.products.id; }, { onDelete: 'cascade' }),
    transactionType: (0, pg_core_1.varchar)('transaction_type', { length: 50 }).notNull(),
    amount: (0, pg_core_1.integer)('amount').notNull().default(1),
    currency: (0, pg_core_1.varchar)('currency', { length: 10 }).notNull(),
    currencyAmount: (0, pg_core_1.doublePrecision)('currency_amount').notNull(),
    status: (0, pg_core_1.varchar)('status', { length: 20 }).notNull().default('completed'),
    metadata: (0, pg_core_1.jsonb)('metadata').default('{}'),
    createdBy: (0, pg_core_1.integer)('created_by').references(function () { return exports.users.id; }, { onDelete: 'set null' }),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
}, function (table) { return ({
    userIdx: (0, pg_core_1.index)('idx_inventory_transactions_user_id').on(table.userId),
    productIdx: (0, pg_core_1.index)('idx_inventory_transactions_product_id').on(table.productId),
    typeIdx: (0, pg_core_1.index)('idx_inventory_transactions_transaction_type').on(table.transactionType),
    createdAtIdx: (0, pg_core_1.index)('idx_inventory_transactions_created_at').on(table.createdAt)
}); });
exports.conversations = (0, pg_core_1.pgTable)('conversations', {
    id: (0, pg_core_1.serial)('conversation_id').primaryKey(),
    uuid: (0, pg_core_1.uuid)('uuid').notNull().defaultRandom(),
    title: (0, pg_core_1.varchar)('title', { length: 255 }),
    isGroup: (0, pg_core_1.boolean)('is_group').notNull().default(false),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').notNull().defaultNow(),
    lastMessageAt: (0, pg_core_1.timestamp)('last_message_at').notNull().defaultNow(),
    createdBy: (0, pg_core_1.integer)('created_by').notNull().references(function () { return exports.users.id; }, { onDelete: 'cascade' }),
    isArchived: (0, pg_core_1.boolean)('is_archived').notNull().default(false),
}, function (table) { return ({
    createdByIdx: (0, pg_core_1.index)('idx_conversations_created_by').on(table.createdBy),
    updatedAtIdx: (0, pg_core_1.index)('idx_conversations_updated_at').on(table.updatedAt)
}); });
exports.conversationParticipants = (0, pg_core_1.pgTable)('conversation_participants', {
    id: (0, pg_core_1.serial)('participant_id').primaryKey(),
    conversationId: (0, pg_core_1.integer)('conversation_id').notNull().references(function () { return exports.conversations.id; }, { onDelete: 'cascade' }),
    userId: (0, pg_core_1.integer)('user_id').notNull().references(function () { return exports.users.id; }, { onDelete: 'cascade' }),
    joinedAt: (0, pg_core_1.timestamp)('joined_at').notNull().defaultNow(),
    lastReadAt: (0, pg_core_1.timestamp)('last_read_at'),
    isActive: (0, pg_core_1.boolean)('is_active').notNull().default(true),
    isMuted: (0, pg_core_1.boolean)('is_muted').notNull().default(false),
    isAdmin: (0, pg_core_1.boolean)('is_admin').notNull().default(false),
}, function (table) { return ({
    conversationUserUnique: (0, pg_core_1.unique)('conversation_user_unique').on(table.conversationId, table.userId),
    conversationIdx: (0, pg_core_1.index)('idx_conversation_participants_conversation_id').on(table.conversationId),
    userIdx: (0, pg_core_1.index)('idx_conversation_participants_user_id').on(table.userId)
}); });
exports.messages = (0, pg_core_1.pgTable)('messages', {
    id: (0, pg_core_1.serial)('message_id').primaryKey(),
    uuid: (0, pg_core_1.uuid)('uuid').notNull().defaultRandom(),
    conversationId: (0, pg_core_1.integer)('conversation_id').notNull().references(function () { return exports.conversations.id; }, { onDelete: 'cascade' }),
    senderId: (0, pg_core_1.integer)('sender_id').notNull().references(function () { return exports.users.id; }, { onDelete: 'cascade' }),
    content: (0, pg_core_1.text)('content').notNull(),
    attachmentUrl: (0, pg_core_1.varchar)('attachment_url', { length: 255 }),
    attachmentType: (0, pg_core_1.varchar)('attachment_type', { length: 50 }),
    isEdited: (0, pg_core_1.boolean)('is_edited').notNull().default(false),
    editedAt: (0, pg_core_1.timestamp)('edited_at'),
    isDeleted: (0, pg_core_1.boolean)('is_deleted').notNull().default(false),
    deletedAt: (0, pg_core_1.timestamp)('deleted_at'),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
    systemMessageType: (0, pg_core_1.varchar)('system_message_type', { length: 50 }),
    editorState: (0, pg_core_1.jsonb)('editor_state'),
}, function (table) { return ({
    conversationIdx: (0, pg_core_1.index)('idx_messages_conversation_id').on(table.conversationId),
    senderIdx: (0, pg_core_1.index)('idx_messages_sender_id').on(table.senderId),
    createdAtIdx: (0, pg_core_1.index)('idx_messages_created_at').on(table.createdAt)
}); });
exports.messageReads = (0, pg_core_1.pgTable)('message_reads', {
    messageId: (0, pg_core_1.integer)('message_id').notNull().references(function () { return exports.messages.id; }, { onDelete: 'cascade' }),
    userId: (0, pg_core_1.integer)('user_id').notNull().references(function () { return exports.users.id; }, { onDelete: 'cascade' }),
    readAt: (0, pg_core_1.timestamp)('read_at').notNull().defaultNow(),
}, function (table) { return ({
    pk: (0, pg_core_1.primaryKey)({ columns: [table.messageId, table.userId] }),
    messageIdx: (0, pg_core_1.index)('idx_message_reads_message_id').on(table.messageId)
}); });
exports.directMessages = (0, pg_core_1.pgTable)('direct_messages', {
    id: (0, pg_core_1.serial)('message_id').primaryKey(),
    senderId: (0, pg_core_1.integer)('sender_id').notNull().references(function () { return exports.users.id; }, { onDelete: 'cascade' }),
    recipientId: (0, pg_core_1.integer)('recipient_id').notNull().references(function () { return exports.users.id; }, { onDelete: 'cascade' }),
    content: (0, pg_core_1.text)('content').notNull(),
    timestamp: (0, pg_core_1.timestamp)('timestamp').notNull().defaultNow(),
    isRead: (0, pg_core_1.boolean)('is_read').notNull().default(false),
    isDeleted: (0, pg_core_1.boolean)('is_deleted').notNull().default(false),
}, function (table) { return ({
    senderIdx: (0, pg_core_1.index)('idx_direct_messages_sender_id').on(table.senderId),
    recipientIdx: (0, pg_core_1.index)('idx_direct_messages_recipient_id').on(table.recipientId),
    timestampIdx: (0, pg_core_1.index)('idx_direct_messages_timestamp').on(table.timestamp)
}); });
exports.insertDirectMessageSchema = (0, drizzle_zod_1.createInsertSchema)(exports.directMessages, {
    id: undefined,
    timestamp: undefined,
    isRead: undefined,
    isDeleted: undefined,
});
exports.userSettingsHistory = (0, pg_core_1.pgTable)('user_settings_history', {
    id: (0, pg_core_1.serial)('history_id').primaryKey(),
    userId: (0, pg_core_1.integer)('user_id').notNull().references(function () { return exports.users.id; }, { onDelete: 'cascade' }),
    changedField: (0, pg_core_1.varchar)('changed_field', { length: 100 }).notNull(),
    oldValue: (0, pg_core_1.text)('old_value'),
    newValue: (0, pg_core_1.text)('new_value'),
    changedAt: (0, pg_core_1.timestamp)('changed_at').notNull().defaultNow(),
    ipAddress: (0, pg_core_1.varchar)('ip_address', { length: 45 }),
    userAgent: (0, pg_core_1.text)('user_agent'),
});
exports.reportedContent = (0, pg_core_1.pgTable)('reported_content', {
    id: (0, pg_core_1.serial)('report_id').primaryKey(),
    reporterId: (0, pg_core_1.integer)('reporter_id').notNull().references(function () { return exports.users.id; }, { onDelete: 'cascade' }),
    contentType: (0, pg_core_1.varchar)('content_type', { length: 50 }).notNull(),
    contentId: (0, pg_core_1.integer)('content_id').notNull(),
    reason: (0, pg_core_1.varchar)('reason', { length: 100 }).notNull(),
    details: (0, pg_core_1.text)('details'),
    status: (0, pg_core_1.varchar)('status', { length: 50 }).notNull().default('pending'),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
    resolvedAt: (0, pg_core_1.timestamp)('resolved_at'),
    resolvedBy: (0, pg_core_1.integer)('resolved_by').references(function () { return exports.users.id; }, { onDelete: 'set null' }),
    resolutionNotes: (0, pg_core_1.text)('resolution_notes'),
});
exports.userBans = (0, pg_core_1.pgTable)('user_bans', {
    id: (0, pg_core_1.serial)('ban_id').primaryKey(),
    userId: (0, pg_core_1.integer)('user_id').notNull().references(function () { return exports.users.id; }, { onDelete: 'cascade' }),
    bannedBy: (0, pg_core_1.integer)('banned_by').notNull().references(function () { return exports.users.id; }, { onDelete: 'cascade' }),
    reason: (0, pg_core_1.text)('reason').notNull(),
    banType: (0, pg_core_1.varchar)('ban_type', { length: 50 }).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
    expiresAt: (0, pg_core_1.timestamp)('expires_at'),
    isActive: (0, pg_core_1.boolean)('is_active').notNull().default(true),
    liftedAt: (0, pg_core_1.timestamp)('lifted_at'),
    liftedBy: (0, pg_core_1.integer)('lifted_by').references(function () { return exports.users.id; }, { onDelete: 'set null' }),
    liftingReason: (0, pg_core_1.text)('lifting_reason'),
});
exports.contentModerationActions = (0, pg_core_1.pgTable)('content_moderation_actions', {
    id: (0, pg_core_1.serial)('action_id').primaryKey(),
    moderatorId: (0, pg_core_1.integer)('moderator_id').notNull().references(function () { return exports.users.id; }, { onDelete: 'cascade' }),
    contentType: (0, pg_core_1.varchar)('content_type', { length: 50 }).notNull(),
    contentId: (0, pg_core_1.integer)('content_id').notNull(),
    actionType: (0, pg_core_1.varchar)('action_type', { length: 50 }).notNull(),
    reason: (0, pg_core_1.text)('reason'),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
    additionalData: (0, pg_core_1.jsonb)('additional_data').default('{}'),
});
exports.adminAuditLogs = (0, pg_core_1.pgTable)('admin_audit_logs', {
    id: (0, pg_core_1.serial)('log_id').primaryKey(),
    userId: (0, pg_core_1.integer)('user_id').notNull().references(function () { return exports.users.id; }, { onDelete: 'cascade' }),
    action: (0, pg_core_1.varchar)('action', { length: 100 }).notNull(),
    entityType: (0, pg_core_1.varchar)('entity_type', { length: 50 }).notNull(),
    entityId: (0, pg_core_1.varchar)('entity_id', { length: 100 }),
    details: (0, pg_core_1.jsonb)('details').notNull().default('{}'),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
    ipAddress: (0, pg_core_1.varchar)('ip_address', { length: 45 }),
});
exports.scheduledTasks = (0, pg_core_1.pgTable)('scheduled_tasks', {
    id: (0, pg_core_1.serial)('task_id').primaryKey(),
    name: (0, pg_core_1.varchar)('name', { length: 100 }).notNull(),
    description: (0, pg_core_1.text)('description'),
    taskType: (0, pg_core_1.varchar)('task_type', { length: 50 }).notNull(),
    frequency: (0, pg_core_1.varchar)('frequency', { length: 50 }).notNull(),
    cronExpression: (0, pg_core_1.varchar)('cron_expression', { length: 100 }),
    isActive: (0, pg_core_1.boolean)('is_active').notNull().default(true),
    lastRunAt: (0, pg_core_1.timestamp)('last_run_at'),
    nextRunAt: (0, pg_core_1.timestamp)('next_run_at'),
    lastStatus: (0, pg_core_1.varchar)('last_status', { length: 50 }),
    lastRunDetails: (0, pg_core_1.jsonb)('last_run_details').default('{}'),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').notNull().defaultNow(),
});
exports.userRelationships = (0, pg_core_1.pgTable)('user_relationships', {
    id: (0, pg_core_1.serial)('relationship_id').primaryKey(),
    followerId: (0, pg_core_1.integer)('follower_id').notNull().references(function () { return exports.users.id; }, { onDelete: 'cascade' }),
    followingId: (0, pg_core_1.integer)('following_id').notNull().references(function () { return exports.users.id; }, { onDelete: 'cascade' }),
    relationshipType: (0, pg_core_1.varchar)('relationship_type', { length: 50 }).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
    isAccepted: (0, pg_core_1.boolean)('is_accepted'),
    acceptedAt: (0, pg_core_1.timestamp)('accepted_at'),
}, function (table) { return ({
    followerFollowingUnique: (0, pg_core_1.unique)('user_relationships_follower_following_type_unique').on(table.followerId, table.followingId, table.relationshipType)
}); });
exports.notificationSettings = (0, pg_core_1.pgTable)('notification_settings', {
    userId: (0, pg_core_1.integer)('user_id').primaryKey().references(function () { return exports.users.id; }, { onDelete: 'cascade' }),
    receiveMentionNotifications: (0, pg_core_1.boolean)('receive_mention_notifications').notNull().default(true),
    receiveReplyNotifications: (0, pg_core_1.boolean)('receive_reply_notifications').notNull().default(true),
    receivePmNotifications: (0, pg_core_1.boolean)('receive_pm_notifications').notNull().default(true),
    receiveFriendNotifications: (0, pg_core_1.boolean)('receive_friend_notifications').notNull().default(true),
    receiveFollowNotifications: (0, pg_core_1.boolean)('receive_follow_notifications').notNull().default(true),
    receiveShopNotifications: (0, pg_core_1.boolean)('receive_shop_notifications').notNull().default(true),
    receiveSystemNotifications: (0, pg_core_1.boolean)('receive_system_notifications').notNull().default(true),
    receiveEmailNotifications: (0, pg_core_1.boolean)('receive_email_notifications').notNull().default(false),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').notNull().defaultNow(),
});
exports.activityFeed = (0, pg_core_1.pgTable)('activity_feed', {
    id: (0, pg_core_1.serial)('activity_id').primaryKey(),
    userId: (0, pg_core_1.integer)('user_id').notNull().references(function () { return exports.users.id; }, { onDelete: 'cascade' }),
    activityType: (0, pg_core_1.varchar)('activity_type', { length: 50 }).notNull(),
    activityData: (0, pg_core_1.jsonb)('activity_data').notNull().default('{}'),
    isPublic: (0, pg_core_1.boolean)('is_public').notNull().default(true),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
});
exports.platformStatistics = (0, pg_core_1.pgTable)('platform_statistics', {
    id: (0, pg_core_1.serial)('stat_id').primaryKey(),
    key: (0, pg_core_1.varchar)('stat_key', { length: 100 }).notNull().unique(),
    value: (0, pg_core_1.integer)('stat_value').notNull().default(0),
    lastUpdated: (0, pg_core_1.timestamp)('last_updated').notNull().defaultNow(),
});
exports.leaderboardHistory = (0, pg_core_1.pgTable)('leaderboard_history', {
    id: (0, pg_core_1.serial)('leaderboard_id').primaryKey(),
    weekStartDate: (0, pg_core_1.timestamp)('week_start_date').notNull(),
    weekEndDate: (0, pg_core_1.timestamp)('week_end_date').notNull(),
    leaderboardType: (0, pg_core_1.varchar)('leaderboard_type', { length: 50 }).notNull(),
    leaderboardData: (0, pg_core_1.jsonb)('leaderboard_data').notNull().default('[]'),
    pathType: (0, pg_core_1.varchar)('path_type', { length: 50 }),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
});
exports.passwordResetTokens = (0, pg_core_1.pgTable)('password_reset_tokens', {
    id: (0, pg_core_1.serial)('token_id').primaryKey(),
    userId: (0, pg_core_1.integer)('user_id').notNull().references(function () { return exports.users.id; }, { onDelete: 'cascade' }),
    token: (0, pg_core_1.varchar)('token', { length: 255 }).notNull().unique(),
    expiresAt: (0, pg_core_1.timestamp)('expires_at').notNull(),
    isUsed: (0, pg_core_1.boolean)('is_used').notNull().default(false),
    usedAt: (0, pg_core_1.timestamp)('used_at'),
    ipRequested: (0, pg_core_1.varchar)('ip_requested', { length: 50 }),
    ipUsed: (0, pg_core_1.varchar)('ip_used', { length: 50 }),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
}, function (table) { return ({
    userIdx: (0, pg_core_1.index)('idx_password_reset_tokens_user_id').on(table.userId),
    tokenIdx: (0, pg_core_1.index)('idx_password_reset_tokens_token').on(table.token)
}); });
exports.chatRooms = (0, pg_core_1.pgTable)('chat_rooms', {
    id: (0, pg_core_1.serial)('room_id').primaryKey(),
    name: (0, pg_core_1.varchar)('name', { length: 100 }).notNull(),
    description: (0, pg_core_1.text)('description'),
    isPrivate: (0, pg_core_1.boolean)('is_private').notNull().default(false),
    minGroupIdRequired: (0, pg_core_1.integer)('min_group_id_required').references(function () { return exports.userGroups.id; }, { onDelete: 'set null' }),
    minXpRequired: (0, pg_core_1.integer)('min_xp_required').default(0),
    createdBy: (0, pg_core_1.integer)('created_by').references(function () { return exports.users.id; }, { onDelete: 'set null' }),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').notNull().defaultNow(),
    isDeleted: (0, pg_core_1.boolean)('is_deleted').notNull().default(false),
    order: (0, pg_core_1.integer)('order').notNull().default(0),
}, function (table) { return ({
    nameIdx: (0, pg_core_1.index)('idx_chat_rooms_name').on(table.name),
    privateIdx: (0, pg_core_1.index)('idx_chat_rooms_is_private').on(table.isPrivate),
    orderIdx: (0, pg_core_1.index)('idx_chat_rooms_order').on(table.order)
}); });
exports.insertChatRoomSchema = (0, drizzle_zod_1.createInsertSchema)(exports.chatRooms, {
    name: zod_1.z.string().min(2).max(100),
    description: zod_1.z.string().optional(),
}).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    isDeleted: true
});
exports.shoutboxMessages = (0, pg_core_1.pgTable)('shoutbox_messages', {
    id: (0, pg_core_1.serial)('message_id').primaryKey(),
    userId: (0, pg_core_1.integer)('user_id').notNull().references(function () { return exports.users.id; }, { onDelete: 'cascade' }),
    roomId: (0, pg_core_1.integer)('room_id').references(function () { return exports.chatRooms.id; }, { onDelete: 'cascade' }),
    content: (0, pg_core_1.text)('content').notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
    editedAt: (0, pg_core_1.timestamp)('edited_at'),
    isDeleted: (0, pg_core_1.boolean)('is_deleted').notNull().default(false),
    isPinned: (0, pg_core_1.boolean)('is_pinned').notNull().default(false),
    tipAmount: (0, pg_core_1.integer)('tip_amount'),
}, function (table) { return ({
    userIdx: (0, pg_core_1.index)('idx_shoutbox_messages_user_id').on(table.userId),
    roomIdx: (0, pg_core_1.index)('idx_shoutbox_messages_room_id').on(table.roomId),
    createdAtIdx: (0, pg_core_1.index)('idx_shoutbox_messages_created_at').on(table.createdAt)
}); });
exports.insertShoutboxMessageSchema = (0, drizzle_zod_1.createInsertSchema)(exports.shoutboxMessages, {
    content: zod_1.z.string().min(2).max(250),
    roomId: zod_1.z.number().optional(),
}).omit({
    id: true,
    createdAt: true,
    editedAt: true,
    isDeleted: true,
    isPinned: true,
    tipAmount: true
});
exports.userInventory = (0, pg_core_1.pgTable)('user_inventory', {
    id: (0, pg_core_1.serial)('inventory_id').primaryKey(),
    userId: (0, pg_core_1.integer)('user_id').notNull().references(function () { return exports.users.id; }, { onDelete: 'cascade' }),
    productId: (0, pg_core_1.integer)('product_id').notNull().references(function () { return exports.products.id; }, { onDelete: 'cascade' }),
    quantity: (0, pg_core_1.integer)('quantity').notNull().default(1),
    isEquipped: (0, pg_core_1.boolean)('is_equipped').notNull().default(false),
    acquiredAt: (0, pg_core_1.timestamp)('acquired_at').notNull().defaultNow(),
    expiresAt: (0, pg_core_1.timestamp)('expires_at'),
    lastUsedAt: (0, pg_core_1.timestamp)('last_used_at'),
    transactionId: (0, pg_core_1.integer)('transaction_id').references(function () { return exports.inventoryTransactions.id; }, { onDelete: 'set null' }), // Forward reference
    metadata: (0, pg_core_1.jsonb)('metadata').default('{}'),
}, function (table) { return ({
    userIdx: (0, pg_core_1.index)('idx_user_inventory_user_id').on(table.userId),
    productIdx: (0, pg_core_1.index)('idx_user_inventory_product_id').on(table.productId),
    userProductUnique: (0, pg_core_1.unique)('user_inventory_user_product_unique').on(table.userId, table.productId)
}); });
exports.announcements = (0, pg_core_1.pgTable)('announcements', {
    id: (0, pg_core_1.serial)('announcement_id').primaryKey(),
    content: (0, pg_core_1.text)('content').notNull(),
    icon: (0, pg_core_1.varchar)('icon', { length: 50 }),
    type: (0, pg_core_1.varchar)('type', { length: 30 }).default('info'),
    isActive: (0, pg_core_1.boolean)('is_active').notNull().default(true),
    createdBy: (0, pg_core_1.integer)('created_by').references(function () { return exports.users.id; }, { onDelete: 'set null' }),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').notNull().defaultNow(),
    expiresAt: (0, pg_core_1.timestamp)('expires_at'),
    priority: (0, pg_core_1.integer)('priority').default(0),
    visibleTo: (0, pg_core_1.jsonb)('visible_to').$type().default(['all']), // 'all', 'guest', 'user', 'mod', 'admin', or user group IDs
    tickerMode: (0, pg_core_1.boolean)('ticker_mode').default(true),
    link: (0, pg_core_1.varchar)('link', { length: 255 }),
    bgColor: (0, pg_core_1.varchar)('bg_color', { length: 30 }),
    textColor: (0, pg_core_1.varchar)('text_color', { length: 30 }),
}, function (table) { return ({
    createdByIdx: (0, pg_core_1.index)('idx_announcements_created_by').on(table.createdBy),
    createdAtIdx: (0, pg_core_1.index)('idx_announcements_created_at').on(table.createdAt)
}); });
exports.insertAnnouncementSchema = (0, drizzle_zod_1.createInsertSchema)(exports.announcements, {
    content: zod_1.z.string().min(1, 'Content is required'),
    isActive: zod_1.z.boolean().default(true),
    visibleTo: zod_1.z.array(zod_1.z.string()).default(['all']),
    priority: zod_1.z.number().default(0),
    tickerMode: zod_1.z.boolean().default(true),
}).omit({ id: true });
exports.cooldownSettings = (0, pg_core_1.pgTable)('cooldown_settings', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    tipCooldownSeconds: (0, pg_core_1.integer)('tip_cooldown_seconds').notNull().default(10),
    rainCooldownSeconds: (0, pg_core_1.integer)('rain_cooldown_seconds').notNull().default(60),
    moderatorBypassCooldown: (0, pg_core_1.boolean)('moderator_bypass_cooldown').notNull().default(true),
    adminBypassCooldown: (0, pg_core_1.boolean)('admin_bypass_cooldown').notNull().default(true),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').notNull().defaultNow()
});
exports.userCommands = (0, pg_core_1.pgTable)('user_commands', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    userId: (0, pg_core_1.integer)('user_id').notNull().references(function () { return exports.users.id; }, { onDelete: 'cascade' }),
    commandType: (0, pg_core_1.text)('command_type').notNull(), // 'tip', 'rain', etc.
    executedAt: (0, pg_core_1.timestamp)('executed_at').notNull().defaultNow(),
    metadata: (0, pg_core_1.jsonb)('metadata').default({})
});
// Rain events table to track rain distributions
exports.rainEvents = (0, pg_core_1.pgTable)('rain_events', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    userId: (0, pg_core_1.integer)('user_id').notNull().references(function () { return exports.users.id; }, { onDelete: 'cascade' }),
    amount: (0, pg_core_1.bigint)('amount', { mode: 'number' }).notNull(),
    currency: (0, pg_core_1.varchar)('currency', { length: 10 }).notNull().default('DGT'),
    recipientCount: (0, pg_core_1.integer)('recipient_count').notNull(),
    transactionId: (0, pg_core_1.integer)('transaction_id').references(function () { return exports.transactions.id; }, { onDelete: 'set null' }),
    source: (0, pg_core_1.varchar)('source', { length: 50 }).default('shoutbox'),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
    metadata: (0, pg_core_1.jsonb)('metadata').default({})
});
exports.xpCloutSettings = (0, pg_core_1.pgTable)('xp_clout_settings', {
    actionKey: (0, pg_core_1.varchar)('action_key', { length: 100 }).primaryKey(),
    xpValue: (0, pg_core_1.integer)('xp_value').notNull().default(0),
    cloutValue: (0, pg_core_1.integer)('clout_value').notNull().default(0),
    description: (0, pg_core_1.text)('description'),
});
exports.userThreadBookmarks = (0, pg_core_1.pgTable)('user_thread_bookmarks', {
    userId: (0, pg_core_1.integer)('user_id').notNull().references(function () { return exports.users.id; }, { onDelete: 'cascade' }),
    threadId: (0, pg_core_1.integer)('thread_id').notNull().references(function () { return exports.threads.id; }, { onDelete: 'cascade' }),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
}, function (table) { return ({
    pk: (0, pg_core_1.primaryKey)({ columns: [table.userId, table.threadId] }),
    userIdx: (0, pg_core_1.index)('idx_user_thread_bookmarks_user_id').on(table.userId)
}); });
exports.verificationTokens = (0, pg_core_1.pgTable)('verification_tokens', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    userId: (0, pg_core_1.integer)('user_id').notNull().references(function () { return exports.users.id; }, { onDelete: 'cascade' }),
    token: (0, pg_core_1.varchar)('token', { length: 64 }).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
});
exports.postTips = (0, pg_core_1.pgTable)('post_tips', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    postId: (0, pg_core_1.integer)('post_id').notNull().references(function () { return exports.posts.id; }, { onDelete: 'cascade' }),
    userId: (0, pg_core_1.integer)('user_id').notNull().references(function () { return exports.users.id; }, { onDelete: 'cascade' }),
    amount: (0, pg_core_1.bigint)('amount', { mode: 'number' }).notNull().default(0),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
});
exports.dgtPackages = (0, pg_core_1.pgTable)('dgt_packages', {
    id: (0, pg_core_1.serial)('package_id').primaryKey(),
    name: (0, pg_core_1.varchar)('name', { length: 100 }).notNull(),
    description: (0, pg_core_1.text)('description'),
    dgtAmount: (0, pg_core_1.bigint)('dgt_amount', { mode: 'number' }).notNull(),
    usdPrice: (0, pg_core_1.decimal)('usd_price', { precision: 10, scale: 2 }).notNull(),
    discountPercentage: (0, pg_core_1.integer)('discount_percentage'),
    isFeatured: (0, pg_core_1.boolean)('is_featured').notNull().default(false),
    imageUrl: (0, pg_core_1.varchar)('image_url', { length: 255 }),
    isActive: (0, pg_core_1.boolean)('is_active').notNull().default(true),
    sortOrder: (0, pg_core_1.integer)('sort_order').notNull().default(0),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').notNull().defaultNow(),
}, function (table) { return ({
    nameIdx: (0, pg_core_1.index)('idx_dgt_packages_name').on(table.name),
    activeIdx: (0, pg_core_1.index)('idx_dgt_packages_active').on(table.isActive),
    featuredIdx: (0, pg_core_1.index)('idx_dgt_packages_featured').on(table.isFeatured)
}); });
exports.insertDgtPackageSchema = (0, drizzle_zod_1.createInsertSchema)(exports.dgtPackages, {
    name: zod_1.z.string().min(1).max(100),
    description: zod_1.z.string().optional(),
    dgtAmount: zod_1.z.number().min(1),
    usdPrice: zod_1.z.number().min(0.01),
    discountPercentage: zod_1.z.number().min(0).max(100).optional(),
    isFeatured: zod_1.z.boolean().default(false),
    imageUrl: zod_1.z.string().optional(),
    isActive: zod_1.z.boolean().default(true),
    sortOrder: zod_1.z.number().default(0)
}).omit({
    id: true,
    createdAt: true,
    updatedAt: true
});
exports.economySettings = (0, pg_core_1.pgTable)('economy_settings', {
    key: (0, pg_core_1.text)('key').primaryKey(),
    value: (0, pg_core_1.integer)('value').notNull(),
});
exports.insertPostTipSchema = (0, drizzle_zod_1.createInsertSchema)(exports.postTips).omit({
    id: true,
    createdAt: true
});
exports.insertPostReactionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.postReactions).omit({
    createdAt: true
});
exports.insertEconomySettingSchema = (0, drizzle_zod_1.createInsertSchema)(exports.economySettings);
exports.insertLevelSchema = (0, drizzle_zod_1.createInsertSchema)(exports.levels);
exports.insertTitleSchema = (0, drizzle_zod_1.createInsertSchema)(exports.titles);
exports.insertBadgeSchema = (0, drizzle_zod_1.createInsertSchema)(exports.badges);
exports.postLikes = (0, pg_core_1.pgTable)('post_likes', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    postId: (0, pg_core_1.integer)('post_id').notNull().references(function () { return exports.posts.id; }, { onDelete: 'cascade' }),
    likedByUserId: (0, pg_core_1.integer)('liked_by_user_id').notNull().references(function () { return exports.users.id; }, { onDelete: 'cascade' }),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
}, function (table) { return ({
    uniqueLike: (0, pg_core_1.unique)('unique_post_like').on(table.postId, table.likedByUserId)
}); });
// Mission types and schemas
exports.missions = (0, pg_core_1.pgTable)('missions', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    title: (0, pg_core_1.varchar)('title', { length: 100 }).notNull(),
    description: (0, pg_core_1.varchar)('description', { length: 255 }).notNull(),
    type: (0, pg_core_1.varchar)('type', { length: 50 }).notNull(),
    requiredAction: (0, pg_core_1.varchar)('required_action', { length: 100 }).notNull(),
    requiredCount: (0, pg_core_1.integer)('required_count').notNull().default(1),
    xpReward: (0, pg_core_1.integer)('xp_reward').notNull(),
    dgtReward: (0, pg_core_1.integer)('dgt_reward'),
    badgeReward: (0, pg_core_1.varchar)('badge_reward', { length: 100 }),
    icon: (0, pg_core_1.varchar)('icon', { length: 100 }),
    isDaily: (0, pg_core_1.boolean)('is_daily').notNull().default(true),
    isWeekly: (0, pg_core_1.boolean)('is_weekly').notNull().default(false),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
    expiresAt: (0, pg_core_1.timestamp)('expires_at'),
    isActive: (0, pg_core_1.boolean)('is_active').notNull().default(true),
    minLevel: (0, pg_core_1.integer)('min_level').notNull().default(1),
    sortOrder: (0, pg_core_1.integer)('sort_order').notNull().default(0),
});
exports.userMissionProgress = (0, pg_core_1.pgTable)('user_mission_progress', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    userId: (0, pg_core_1.integer)('user_id').notNull().references(function () { return exports.users.id; }, { onDelete: 'cascade' }),
    missionId: (0, pg_core_1.integer)('mission_id').notNull().references(function () { return exports.missions.id; }, { onDelete: 'cascade' }),
    currentCount: (0, pg_core_1.integer)('current_count').notNull().default(0),
    isCompleted: (0, pg_core_1.boolean)('is_completed').notNull().default(false),
    isRewardClaimed: (0, pg_core_1.boolean)('is_reward_claimed').notNull().default(false),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow(),
    completedAt: (0, pg_core_1.timestamp)('completed_at'),
    claimedAt: (0, pg_core_1.timestamp)('claimed_at'),
}, function (table) {
    return {
        userMissionIdx: (0, pg_core_1.unique)('user_mission_idx').on(table.userId, table.missionId),
    };
});
// Airdrop Schemas
exports.airdropSettings = (0, pg_core_1.pgTable)('airdrop_settings', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    key: (0, pg_core_1.varchar)('key', { length: 100 }).notNull().unique(), // e.g., 'global_airdrop_enabled', 'min_amount_dgt'
    value: (0, pg_core_1.text)('value').notNull(),
    description: (0, pg_core_1.text)('description'),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').notNull().defaultNow(),
});
exports.airdropRecords = (0, pg_core_1.pgTable)('airdrop_records', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    adminUserId: (0, pg_core_1.integer)('admin_user_id').references(function () { return exports.users.id; }, { onDelete: 'set null' }),
    title: (0, pg_core_1.varchar)('title', { length: 255 }).notNull(),
    description: (0, pg_core_1.text)('description'),
    amount: (0, pg_core_1.bigint)('amount', { mode: 'number' }).notNull(), // Total amount for the airdrop
    perUserAmount: (0, pg_core_1.bigint)('per_user_amount', { mode: 'number' }).notNull(), // Amount each recipient gets
    currency: (0, pg_core_1.varchar)('currency', { length: 10 }).notNull(),
    recipientCount: (0, pg_core_1.integer)('recipient_count').notNull(),
    target: (0, pg_core_1.varchar)('target', { length: 50 }), // e.g., 'all', 'active', 'premium'
    activityDays: (0, pg_core_1.integer)('activity_days'),
    threshold: (0, pg_core_1.integer)('threshold'),
    reference: (0, pg_core_1.uuid)('reference').notNull().unique(), // Unique reference for this airdrop event
    status: (0, pg_core_1.varchar)('status', { length: 20 }).notNull().default('pending'), // pending, processing, completed, failed
    metadata: (0, pg_core_1.jsonb)('metadata'), // Store recipientIds, original options, etc.
    transactionId: (0, pg_core_1.integer)('transaction_id').references(function () { return exports.transactions.id; }, { onDelete: 'set null' }),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').notNull().defaultNow(),
}, function (table) { return ({
    adminUserIdIdx: (0, pg_core_1.index)('idx_airdrop_records_admin_user_id').on(table.adminUserId),
    referenceIdx: (0, pg_core_1.index)('idx_airdrop_records_reference').on(table.reference),
    statusIdx: (0, pg_core_1.index)('idx_airdrop_records_status').on(table.status),
    createdAtIdx: (0, pg_core_1.index)('idx_airdrop_records_created_at').on(table.createdAt),
}); });
// Add this with the other table definitions
exports.signatureShopItems = (0, pg_core_1.pgTable)('signature_shop_items', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    name: (0, pg_core_1.text)('name').notNull(),
    effectKey: (0, pg_core_1.text)('effect_key').notNull(),
    price: (0, pg_core_1.integer)('price').notNull(),
    requiredLevel: (0, pg_core_1.integer)('required_level').default(1),
    rarity: (0, pg_core_1.text)('rarity'),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().default((0, drizzle_orm_1.sql)(templateObject_24 || (templateObject_24 = __makeTemplateObject(["CURRENT_TIMESTAMP"], ["CURRENT_TIMESTAMP"])))),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').notNull().default((0, drizzle_orm_1.sql)(templateObject_25 || (templateObject_25 = __makeTemplateObject(["CURRENT_TIMESTAMP"], ["CURRENT_TIMESTAMP"])))),
});
// Add this after the signatureShopItems definition
exports.userSignatureItems = (0, pg_core_1.pgTable)('user_signature_items', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    userId: (0, pg_core_1.integer)('user_id').notNull().references(function () { return exports.users.id; }, { onDelete: 'cascade' }),
    signatureItemId: (0, pg_core_1.integer)('signature_item_id').notNull().references(function () { return exports.signatureShopItems.id; }, { onDelete: 'cascade' }),
    isActive: (0, pg_core_1.boolean)('is_active').notNull().default(false),
    purchaseDate: (0, pg_core_1.timestamp)('purchase_date').notNull().default((0, drizzle_orm_1.sql)(templateObject_26 || (templateObject_26 = __makeTemplateObject(["CURRENT_TIMESTAMP"], ["CURRENT_TIMESTAMP"])))),
}, function (table) { return ({
    uniqueUserItem: (0, pg_core_1.unique)('user_signature_items_user_item_unique').on(table.userId, table.signatureItemId)
}); });
var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5, templateObject_6, templateObject_7, templateObject_8, templateObject_9, templateObject_10, templateObject_11, templateObject_12, templateObject_13, templateObject_14, templateObject_15, templateObject_16, templateObject_17, templateObject_18, templateObject_19, templateObject_20, templateObject_21, templateObject_22, templateObject_23, templateObject_24, templateObject_25, templateObject_26;
