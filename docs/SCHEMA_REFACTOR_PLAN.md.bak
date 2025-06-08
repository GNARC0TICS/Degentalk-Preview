# Degentalk™™ Modular Schema Refactor Plan

## 1. Introduction & Goals

This document outlines the plan to refactor the Degentalk™™ platform's database schema from a monolithic structure (`shared/schema.ts`) into a modular, domain-driven design. This change is crucial for enhancing scalability, maintainability, and clarity for both developers and AI agents working on the codebase.

**Key Goals:**

*   **Improved Scalability:** Allow different parts of the application (e.g., forum, user management, economy, shop) to evolve and scale independently.
*   **Enhanced Maintainability:** Make it easier to understand, modify, and extend specific parts of the schema without impacting unrelated areas.
*   **Clear Separation of Concerns:** Logically group tables based on their business domain, reducing complexity and improving code organization.
*   **Developer & AI Efficiency:** Provide a more intuitive schema structure that is easier for new developers and AI assistants to navigate and work with.
*   **Optimized for PostgreSQL (Neon):** Ensure the schema design is well-suited for the production PostgreSQL environment on Neon.

## 2. Current Schema Overview & Challenges

The current schema, located in `shared/schema.ts`, has grown organically and encompasses all database tables for the entire platform in a single file. While functional, this monolithic approach presents several challenges as the platform scales:

*   **Increased Complexity:** A single large file is difficult to navigate and understand, especially for new team members or when trying to isolate specific domain logic.
*   **Higher Risk of Conflicts:** Changes in one area can inadvertently affect others, increasing the risk of bugs and making code reviews more challenging.
*   **Reduced Reusability:** It's harder to reuse or isolate schema components for specific services or micro-frontends if the need arises.
*   **Slower Development Cycles:** Modifying a large, interconnected schema can be more time-consuming and error-prone.

## 3. Proposed Modular Domain Structure

We will reorganize the schema into a directory structure under `/db/schema/` (or a similar path, to be finalized, aligning with Drizzle Kit conventions, likely `shared/db/schema/` or just `db/schema/` if `shared/` is phased out for schema). Each subdirectory will represent a distinct domain.

**Proposed Directory Structure:**

```
/db  <-- Or potentially /shared/db/
  /schema
    index.ts                   # Main export file for all domain schemas (optional, for easier imports)
    core/                      # Fundamental enums, shared types, base table configs
      enums.ts
      relations.ts             # Centralized relations if needed, or co-located
    forum/
      categories.ts            # Replaces forumCategories
      threads.ts
      posts.ts
      prefixes.ts              # threadPrefixes
      tags.ts                  # tags table
      threadTags.ts            # join table
      postReactions.ts
      postDrafts.ts
      threadDrafts.ts
      threadBookmarks.ts       # userThreadBookmarks
      rules.ts                 # forumRules
      userRuleAgreements.ts    # userRulesAgreements
    user/
      users.ts
      userGroups.ts
      profiles.ts              # Could merge aspects of users table here, or keep separate
      sessions.ts              # userSessions
      settings.ts              # userSettings, notificationSettings
      permissions.ts           # permissions table (system-wide permissions)
      roles.ts                 # roles table (system-wide roles)
      userRoles.ts             # join table
      rolePermissions.ts       # join table
      bans.ts                  # userBans
      relationships.ts         # userRelationships (follows, friends)
      verificationTokens.ts    # For email verification etc.
      passwordResetTokens.ts
    economy/ # Covers XP, Clout, DGT, Wallets, Transactions
      wallets.ts               # user wallets (internal DGT representation)
      transactions.ts          # Internal DGT transactions (tips, rewards, etc.)
      xpHistory.ts             # If detailed logging is needed beyond user.xp
      levels.ts                # XP levels configuration
      cloutHistory.ts          # If detailed logging is needed
      titles.ts                # User titles
      badges.ts                # User badges
      userTitles.ts            # Join table
      userBadges.ts            # Join table
      settings.ts              # economySettings, tipSettings, rainSettings, xpCloutSettings, cooldownSettings
      dgtPackages.ts           # Packages for buying DGT
      dgtPurchaseOrders.ts     # Tracking DGT purchases via crypto
      postTips.ts
    shop/
      products.ts
      productCategories.ts
      productMedia.ts          # Join table for product images/videos
      orders.ts
      orderItems.ts
      inventory.ts             # userInventory (for shop items)
      inventoryTransactions.ts # For tracking shop item acquisitions
      signatureItems.ts        # signatureShopItems
      userSignatureItems.ts    # Join table
    messaging/
      conversations.ts
      conversationParticipants.ts
      messages.ts              # Private messages
      messageReads.ts
      directMessages.ts        # Potentially merge with conversations/messages
      chatRooms.ts             # For shoutbox/group chats
      shoutboxMessages.ts
      onlineUsers.ts           # For presence
    admin/
      auditLogs.ts             # adminAuditLogs, auditLogs (consolidate)
      reports.ts               # reportedContent
      moderationActions.ts     # contentModerationActions
      announcements.ts
      siteSettings.ts          # General platform settings
      themes.ts                # adminThemes
      templates.ts             # siteTemplates
      featureFlags.ts          # betaFeatureFlags, featureFlags (consolidate)
      seoMetadata.ts
      scheduledTasks.ts
      mediaLibrary.ts          # General media storage, potentially cross-domain
    gamification/
      achievements.ts
      userAchievements.ts
      missions.ts
      userMissionProgress.ts
      leaderboards.ts          # leaderboardHistory
      platformStats.ts         # platformStatistics (e.g. total users, posts)
    integrations/
      ccPayment.ts             # Specific tables for CCPayment if any beyond user/wallet fields
      tron.ts                  # Specific tables for Tron if any
    system/ # Core system functionalities
      rateLimits.ts
      # Other system-level tables (e.g., migrations_history if not handled by Drizzle itself)
```

**Note:** Some tables like `users` are central but will reside in the `user/` domain. Cross-domain relationships will be managed using Drizzle's relation features. The `core/` domain will house shared enums and potentially base table configurations.

## 4. Detailed Schema Definitions (Examples)

Below are illustrative examples of how tables would be defined within their new domain modules. These are not exhaustive but demonstrate the intended structure.

### Domain: `core/enums.ts`

```typescript
// db/schema/core/enums.ts
import { pgEnum } from "drizzle-orm/pg-core";

export const shoutboxPositionEnum = pgEnum('shoutbox_position', ['sidebar-top', 'sidebar-bottom', 'main-top', 'main-bottom', 'floating']);
export const ticketStatusEnum = pgEnum('ticket_status', ['open', 'pending', 'resolved', 'closed', 'archived']);
export const transactionStatusEnum = pgEnum('transaction_status', ['pending', 'confirmed', 'failed', 'reversed', 'disputed']);
export const notificationTypeEnum = pgEnum('notification_type', [
  'info', 'system', 'private_message', 'achievement', 'transaction', 
  'post_mention', 'thread_reply', 'reaction', 'quest_complete', 'badge_awarded'
]);
export const reactionTypeEnum = pgEnum('reaction_type', ['like', 'helpful']);
export const transactionTypeEnum = pgEnum('transaction_type', [
  'TIP', 'DEPOSIT', 'WITHDRAWAL', 'ADMIN_ADJUST', 
  'RAIN', 'AIRDROP', 'SHOP_PURCHASE', 'REWARD', 
  'REFERRAL_BONUS', 'FEE', 'VAULT_LOCK', 'VAULT_UNLOCK'
]);
export const withdrawalStatusEnum = pgEnum('withdrawal_status', ['pending', 'approved', 'rejected']);
export const vaultStatusEnum = pgEnum('vault_status', ['locked', 'unlocked', 'pending_unlock']);
export const userRoleEnum = pgEnum('user_role', ['user', 'mod', 'admin']); // Consider moving to user/enums.ts if specific
export const contentEditStatusEnum = pgEnum('content_edit_status', ['draft', 'published', 'archived']);

// ... other globally used enums ...
```

### Domain: `forum/categories.ts`

```typescript
// db/schema/forum/categories.ts
import { pgTable, serial, text, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
// Potentially import relations from other domains if needed, e.g., userGroups for minGroupIdRequired
// import { userGroups } from "../user/userGroups"; 

export const forumCategories = pgTable('forum_categories', {
  id: serial('category_id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(), // Ensure unique constraint is defined
  description: text('description'),
  parentId: integer('parent_id'), // Self-referential for subcategories
  type: text('type').notNull().default('forum'), // 'zone', 'category', 'forum'
  position: integer('position').notNull().default(0),
  isVip: boolean('is_vip').notNull().default(false),
  isLocked: boolean('is_locked').notNull().default(false),
  minXpRequired: integer('min_xp_required').notNull().default(0), // Name updated from minXp for clarity
  color: text('color').notNull().default('gray'),
  icon: text('icon').notNull().default('hash'),
  colorTheme: text('color_theme'),
  isHidden: boolean('is_hidden').notNull().default(false),
  minGroupIdRequired: integer('min_group_id_required'), //.references(() => userGroups.id), // Define relation
  pluginData: jsonb('plugin_data').default('{}'),
  createdAt: timestamp('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Example of how relations might be defined (either here or in a central relations file per domain)
// export const forumCategoriesRelations = relations(forumCategories, ({ one, many }) => ({
//   parentCategory: one(forumCategories, {
//     fields: [forumCategories.parentId],
//     references: [forumCategories.id],
//     relationName: 'parentCategory',
//   }),
//   childCategories: many(forumCategories, {
//     relationName: 'childCategories',
//   }),
//   threads: many(threads), // Assuming threads table is defined in forum/threads.ts
//   minGroup: one(userGroups, { // If minGroupIdRequired references userGroups
//      fields: [forumCategories.minGroupIdRequired],
//      references: [userGroups.id]
//   })
// }));
```

### Domain: `user/users.ts`

```typescript
// db/schema/user/users.ts
import { pgTable, serial, text, varchar, boolean, timestamp, integer, bigint, uuid, jsonb, unique } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { userRoleEnum } from "../core/enums"; // Assuming userRoleEnum is in core
// import { userGroups } from "./userGroups"; // For groupId relation
// import { titles } from "../economy/titles"; // For activeTitleId relation
// import { badges } from "../economy/badges"; // For activeBadgeId relation
// import { avatarFrames } from "./avatarFrames"; // Assuming avatarFrames is moved to user domain

export const users = pgTable('users', {
  id: serial('user_id').primaryKey(),
  uuid: uuid('uuid').notNull().defaultRandom().unique(), // Added unique constraint
  username: text('username').notNull().unique(), // Ensure unique constraint is defined
  email: text('email').notNull().unique(), // Ensure unique constraint is defined
  passwordHash: text('password_hash').notNull(), // Renamed from 'password' for clarity
  bio: text('bio'),
  signature: text('signature'),
  avatarUrl: varchar('avatar_url', { length: 255 }),
  activeAvatarUrl: varchar('active_avatar_url', { length: 255 }), // Specific to user's current choice
  profileBannerUrl: varchar('profile_banner_url', { length: 255 }),
  // activeFrameId: integer('active_frame_id'), // Consider if this relates to a general `items` table or specific `avatarFrames`
  // avatarFrameId: integer('avatar_frame_id'), //.references(() => avatarFrames.id),
  groupId: integer('group_id'), //.references(() => userGroups.id, { onDelete: 'set null' }),
  discordHandle: varchar('discord_handle', { length: 255 }),
  twitterHandle: varchar('twitter_handle', { length: 255 }),
  website: varchar('website', { length: 255 }),
  telegramHandle: varchar('telegram_handle', { length: 255 }),
  isActive: boolean('is_active').notNull().default(true),
  isVerified: boolean('is_verified').notNull().default(false),
  isDeleted: boolean('is_deleted').notNull().default(false), // For soft deletes
  isBanned: boolean('is_banned').notNull().default(false),
  isShadowbanned: boolean('is_shadowbanned').notNull().default(false),
  subscribedToNewsletter: boolean('subscribed_to_newsletter').notNull().default(false),
  lastSeenAt: timestamp('last_seen_at'),
  createdAt: timestamp('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  lastLoginAt: timestamp('last_login_at'), // Renamed from lastLogin for clarity
  referrerId: integer('referrer_id'), //.references((): AnyPgColumn => users.id, { onDelete: 'set null' }), // Self-reference
  referralLevel: integer('referral_level'), // Consider if this is still needed or derived
  xp: bigint('xp', { mode: 'number' }).notNull().default(0),
  level: integer('level').notNull().default(1), // Consider deriving from XP via levels table
  clout: integer('clout').notNull().default(0),
  // activeTitleId: integer('active_title_id'), //.references(() => titles.id, { onDelete: 'set null' }),
  // activeBadgeId: integer('active_badge_id'), //.references(() => badges.id, { onDelete: 'set null' }),
  dgtPoints: integer('dgt_points').notNull().default(0), // Legacy or separate from wallet?
  // dgtWalletBalance: integer('dgt_wallet_balance').notNull().default(0), // Should be in economy/wallets.ts
  pointsVersion: integer('points_version').notNull().default(1), // Purpose?
  dailyXpGained: integer('daily_xp_gained').notNull().default(0), // For daily limits
  lastXpGainDate: timestamp('last_xp_gain_date'),
  role: userRoleEnum('role').default('user'),
  // Wallet related fields to be moved to economy/wallets.ts or linked
  // walletAddress: varchar('wallet_address', { length: 255 }),
  // encryptedPrivateKey: varchar('encrypted_private_key', { length: 512 }),
  // walletBalanceUSDT: doublePrecision('wallet_balance_usdt').notNull().default(0),
  // walletPendingWithdrawals: jsonb('wallet_pending_withdrawals').default('[]'),
  ccpaymentAccountId: varchar('ccpayment_account_id', { length: 100 }), // Integration specific ID
  // verifyToken: varchar('verify_token', { length: 255 }), // Moved to user/verificationTokens.ts
  // resetToken: varchar('reset_token', { length: 255 }), // Moved to user/passwordResetTokens.ts
  // resetTokenExpiresAt: timestamp('reset_token_expires_at'), // Moved to user/passwordResetTokens.ts
  gdprConsentedAt: timestamp('gdpr_consented_at'),
  tosAgreedAt: timestamp('tos_agreed_at'),
  privacyAgreedAt: timestamp('privacy_agreed_at'),
  pathXp: jsonb('path_xp').default('{}'), // For specific XP paths/tracks
  pathMultipliers: jsonb('path_multipliers').default('{}'),
  pluginData: jsonb('plugin_data').default('{}'), // Generic extension point
}, (table) => ({
  // usernameUnique: unique('users_username_unique').on(table.username), // Drizzle infers unique from .unique()
  // emailUnique: unique('users_email_unique').on(table.email), // Drizzle infers unique from .unique()
  // referrerIdx: index('idx_users_referrer_id').on(table.referrerId),
  // groupIdx: index('idx_users_group_id').on(table.groupId),
}));

// Define relations for users table
// export const usersRelations = relations(users, ({ one, many }) => ({
//   group: one(userGroups, { fields: [users.groupId], references: [userGroups.id] }),
//   posts: many(posts), // Assuming posts table is defined elsewhere
//   threads: many(threads),
//   activeTitle: one(titles, { fields: [users.activeTitleId], references: [titles.id] }),
//   // ... other relations
// }));
```

### Domain: `economy/wallets.ts`
```typescript
// db/schema/economy/wallets.ts
import { pgTable, serial, integer, doublePrecision, timestamp, boolean, index } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
// import { users } from "../user/users";

export const wallets = pgTable('wallets', {
  id: serial('wallet_id').primaryKey(),
  userId: integer('user_id').notNull(), //.references(() => users.id, { onDelete: 'cascade' }),
  // Specific DGT balance for internal platform use
  dgtBalance: bigint('dgt_balance', { mode: 'number' }).notNull().default(0),
  // External wallet related fields (if distinct from user profile's walletAddress)
  // externalWalletAddress: varchar('external_wallet_address', { length: 255 }),
  // externalWalletType: varchar('external_wallet_type', { length: 50 }), // e.g., 'tron', 'ethereum'
  lastTransactionAt: timestamp('last_transaction_at'), // Renamed for clarity
  isPrimary: boolean('is_primary').notNull().default(false), // If users can have multiple wallets
  isDeleted: boolean('is_deleted').notNull().default(false),
  deletedAt: timestamp('deleted_at'),
  // deletedBy: integer('deleted_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  userIdx: index('idx_wallets_user_id').on(table.userId),
  // Consider unique constraint if one user has one primary internal DGT wallet
  // userPrimaryUnique: unique('wallet_user_primary_unique').on(table.userId, table.isPrimary).where(sql`${table.isPrimary} = true`)
}));

// export const walletsRelations = relations(wallets, ({ one, many }) => ({
//   user: one(users, { fields: [wallets.userId], references: [users.id] }),
//   transactions: many(transactions), // Assuming transactions table is defined
// }));
```

## 5. Table Mapping to Domains

This section provides a comprehensive mapping of existing tables from `shared/schema.ts` to their proposed new domain modules.

*   **core/**
    *   `pgEnum` definitions (e.g., `shoutboxPositionEnum`, `ticketStatusEnum`, etc.) -> `core/enums.ts`
*   **forum/**
    *   `forumCategories` -> `forum/categories.ts`
    *   `threads` -> `forum/threads.ts`
    *   `posts` -> `forum/posts.ts`
    *   `threadPrefixes` -> `forum/prefixes.ts`
    *   `tags` -> `forum/tags.ts`
    *   `threadTags` -> `forum/threadTags.ts` (join table)
    *   `postReactions` -> `forum/postReactions.ts`
    *   `postDrafts` -> `forum/postDrafts.ts`
    *   `threadDrafts` -> `forum/threadDrafts.ts`
    *   `userThreadBookmarks` -> `forum/threadBookmarks.ts`
    *   `forumRules` -> `forum/rules.ts`
    *   `userRulesAgreements` -> `forum/userRuleAgreements.ts`
    *   `customEmojis` -> `forum/customEmojis.ts` (or `shop/` if purchasable, or `gamification/`)
    *   `postLikes` -> `forum/postLikes.ts` (Consider merging with `postReactions` if `reactionType` covers likes)
*   **user/**
    *   `users` -> `user/users.ts`
    *   `userGroups` -> `user/userGroups.ts`
    *   `userSessions` -> `user/sessions.ts`
    *   `userSettings` -> `user/settings.ts`
    *   `notificationSettings` -> `user/settings.ts` (merge or keep separate under user domain)
    *   `permissions` -> `user/permissions.ts`
    *   `roles` -> `user/roles.ts`
    *   `userRoles` -> `user/userRoles.ts` (join table)
    *   `rolePermissions` -> `user/rolePermissions.ts` (join table)
    *   `userBans` -> `user/bans.ts`
    *   `userRelationships` -> `user/relationships.ts`
    *   `verificationTokens` -> `user/verificationTokens.ts`
    *   `passwordResetTokens` -> `user/passwordResetTokens.ts`
    *   `userSettingsHistory` -> `user/settingsHistory.ts`
    *   `avatarFrames` -> `user/avatarFrames.ts` (or `shop/` if purchasable)
*   **economy/**
    *   `wallets` (DGT specific user wallet) -> `economy/wallets.ts`
    *   `transactions` (internal DGT) -> `economy/transactions.ts`
    *   `levels` -> `economy/levels.ts`
    *   `xpAdjustmentLogs` -> `economy/xpAdjustmentLogs.ts`
    *   `xpActionSettings` -> `economy/xpActionSettings.ts`
    *   `titles` -> `economy/titles.ts`
    *   `badges` -> `economy/badges.ts` (if primarily earned via economy/xp, else `gamification/`)
    *   `userTitles` -> `economy/userTitles.ts`
    *   `userBadges` -> `economy/userBadges.ts`
    *   `vaults` -> `economy/vaults.ts`
    *   `withdrawalRequests` -> `economy/withdrawalRequests.ts`
    *   `treasurySettings` -> `economy/settings.ts`
    *   `tipSettings` -> `economy/settings.ts`
    *   `rainSettings` -> `economy/settings.ts`
    *   `cooldownSettings` -> `economy/settings.ts`
    *   `userCommands` (tip, rain related) -> `economy/userCommands.ts`
    *   `rainEvents` -> `economy/rainEvents.ts`
    *   `xpCloutSettings` -> `economy/settings.ts`
    *   `postTips` -> `economy/postTips.ts`
    *   `dgtPackages` -> `economy/dgtPackages.ts`
    *   `dgtPurchaseOrders` -> `economy/dgtPurchaseOrders.ts`
    *   `economySettings` -> `economy/settings.ts`
*   **shop/**
    *   `products` -> `shop/products.ts`
    *   `productCategories` -> `shop/productCategories.ts`
    *   `productMedia` -> `shop/productMedia.ts`
    *   `orders` -> `shop/orders.ts`
    *   `orderItems` -> `shop/orderItems.ts`
    *   `userInventory` -> `shop/inventory.ts`
    *   `inventoryTransactions` -> `shop/inventoryTransactions.ts`
    *   `signatureShopItems` -> `shop/signatureItems.ts`
    *   `userSignatureItems` -> `shop/userSignatureItems.ts`
*   **messaging/**
    *   `conversations` -> `messaging/conversations.ts`
    *   `conversationParticipants` -> `messaging/conversationParticipants.ts`
    *   `messages` -> `messaging/messages.ts`
    *   `messageReads` -> `messaging/messageReads.ts`
    *   `directMessages` -> `messaging/directMessages.ts` (or merge into `conversations`/`messages`)
    *   `chatRooms` -> `messaging/chatRooms.ts`
    *   `shoutboxMessages` -> `messaging/shoutboxMessages.ts`
    *   `onlineUsers` -> `messaging/onlineUsers.ts`
*   **admin/**
    *   `auditLogs` -> `admin/auditLogs.ts`
    *   `adminAuditLogs` -> `admin/auditLogs.ts` (consolidate)
    *   `reportedContent` -> `admin/reports.ts`
    *   `contentModerationActions` -> `admin/moderationActions.ts`
    *   `announcements` -> `admin/announcements.ts`
    *   `siteSettings` -> `admin/siteSettings.ts`
    *   `adminThemes` -> `admin/themes.ts`
    *   `siteTemplates` -> `admin/templates.ts`
    *   `betaFeatureFlags` -> `admin/featureFlags.ts` (consolidate with `featureFlags`)
    *   `featureFlags` -> `admin/featureFlags.ts`
    *   `seoMetadata` -> `admin/seoMetadata.ts`
    *   `scheduledTasks` -> `admin/scheduledTasks.ts`
    *   `mediaLibrary` -> `admin/mediaLibrary.ts` (or a top-level `media/` domain if heavily used across features)
*   **gamification/**
    *   `achievements` -> `gamification/achievements.ts`
    *   `userAchievements` -> `gamification/userAchievements.ts`
    *   `missions` -> `gamification/missions.ts`
    *   `userMissionProgress` -> `gamification/userMissionProgress.ts`
    *   `leaderboardHistory` -> `gamification/leaderboards.ts`
    *   `platformStatistics` -> `gamification/platformStats.ts`
*   **system/**
    *   `rateLimits` -> `system/rateLimits.ts`
    *   `notifications` -> `system/notifications.ts` (or `user/notifications.ts` if tightly coupled to user preferences)

## 6. Development and Migration Workflow

This section details the recommended workflow for developing with the new modular schema and generating migrations using Neon/PostgreSQL.

### 6.1. Environment Setup

*   **Environment Variables:** Control the database connection string via `.env` or `env.local`:
    ```env
    # For PostgreSQL/Neon (Development, Staging & Production):
    DATABASE_PROVIDER=postgresql # This should consistently be postgresql
    DATABASE_URL=postgresql://user:password@host:port/database # Your Neon connection string
    NEON_DATABASE_URL=postgresql://user:password@host:port/database # Specific Neon variable if used
    ```
*   **Drizzle Config (`drizzle.config.ts`):** This file must be configured exclusively for PostgreSQL. Ensure it points to the new modular schema directory (e.g., `db/schema/`). The `schema` path should be updated to `"./db/schema/index.ts"` or `"./db/schema/"`.
    ```typescript
    // Example snippet from drizzle.config.ts (PostgreSQL only)
    import { defineConfig } from "drizzle-kit";
    import "dotenv/config";

    const dbUrl = process.env.DRIZZLE_DATABASE_URL || process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;

    if (!dbUrl) {
      throw new Error(
        "DATABASE_URL or DRIZZLE_DATABASE_URL environment variable is not set."
      );
    }

    export default defineConfig({
      dialect: "postgresql",
      dbCredentials: {
        url: dbUrl,
      },
      schema: "./db/schema", // Or "./db/schema/index.ts"
      out: "./migrations/postgres",
      verbose: true,
      strict: true,
    });
    ```

### 6.2. Schema Development and Migrations

1.  **Modify Schema Files:** Make changes to your domain-specific schema files within `db/schema/{domain}/`. Export all tables and relations from `db/schema/index.ts`.
2.  **Generate Migrations:**
    *   **PostgreSQL/Neon:**
        ```bash
        npm run db:migrate 
        # This script typically calls `drizzle-kit generate`
        ```
    *   Ensure `drizzle.config.ts` correctly references `./db/schema/index.ts` and is configured for PostgreSQL.
3.  **Apply Migrations:**
    *   Run the script to apply PostgreSQL migrations (e.g., `pnpm db:migrate:pg` or a similar custom script). This script will use Drizzle ORM to execute the migration files against the configured Neon/PostgreSQL database.
    *   Ensure your `DATABASE_URL` in the environment is set to your Neon connection string.
4.  **Verify Changes:** Connect to your Neon database using a DB client or query tools and verify that the schema changes have been applied as expected.

### 6.3. Working with Neon/PostgreSQL

Since Neon/PostgreSQL is the sole database provider, the workflow simplifies to ensuring consistent environment configuration for development, staging, and production, all pointing to appropriate Neon instances or local PostgreSQL setups if used during early development before pushing to Neon.

### 6.4. Key Considerations for PostgreSQL/Neon

*   **Rich Data Types:** Leverage PostgreSQL's native types like `BOOLEAN`, `JSONB`, `TIMESTAMP WITH TIME ZONE`, arrays, and enums.
*   **Advanced Features:** Utilize PostgreSQL's support for complex indexing, constraints, window functions, and other advanced SQL features where beneficial.
*   **Migrations:** Drizzle ORM provides robust migration generation and management for PostgreSQL.
*   **Neon Specifics:** Be aware of Neon's serverless architecture, branching capabilities, and connection pooling when designing and troubleshooting.

### 6.5. Troubleshooting Common Issues (PostgreSQL/Neon)

*   **Schema Mismatch Errors:**
    *   Always rely on Drizzle migrations. Manual `ALTER TABLE` statements are strongly discouraged as they bypass Drizzle's schema tracking and can break future migrations.
*   **Connection Issues (Neon):**
    *   Ensure your `DATABASE_URL` is correctly formatted (e.g., `postgresql://user:pass@host/db?sslmode=require`).
    *   Verify network accessibility, credentials, and that the Neon endpoint is active and not suspended.
    *   Check Neon's dashboard for any reported issues or maintenance.
*   **Migration Conflicts or Errors:**
    *   Carefully review the SQL generated in migration files by Drizzle Kit.
    *   If a migration fails, check the database logs (accessible via Neon console or logs) and Drizzle error messages for clues.
    *   Complex changes might occasionally require manual adjustments to the generated migration SQL, but do this with extreme caution and a full understanding of the implications. Always test such changes thoroughly.

## 7. Documentation Cleanup & Consolidation

As part of this refactoring effort, existing database-related documentation has been reviewed, and this `SCHEMA_REFACTOR_PLAN.md` document is intended to become the central source of truth for schema design, structure, and development workflow, now exclusively for Neon/PostgreSQL.

**Actions Taken:**

*   **SQLite References Removed:** All references to SQLite, its specific migration paths, and SQLite-specific development practices have been removed from this document.
*   **`db/schema.sql`**: DELETED. This raw SQL snapshot is superseded by Drizzle schema and migrations.
*   **`docs/PHASE_1_DATABASE_FOUNDATION_CHECKLIST.md`**: DELETED. Its relevant initial setup and design considerations are now covered or superseded by this comprehensive plan.
*   **`db/schema-analysis-2025-05-21.json`**: DELETED. This was an outdated JSON snapshot of a previous schema state.
*   **`docs/database-switching.md`**: DELETED. Information relevant to PostgreSQL has been merged into Section 6 of this plan.

**For Future Review:**

*   **`scripts/db/update-database-cheatsheet.js`**: This script was designed to analyze an SQLite database.
*   **`docs/database-cheatsheet.mdc`** (if it exists):
    *   **Action:** Since SQLite is no longer in use, this script and any associated cheatsheet are likely obsolete. Mark them for **deletion**. If a PostgreSQL schema overview tool is desired in the future, a new solution would be needed.

## 8. Next Steps & Action Plan

**Phase 1: Modularization (Completed)**
1.  **New Directory Structure:** Created `db/schema/` with domain subdirectories. (✅ Completed)
2.  **Enum Migration:** Moved all `pgEnum` definitions to `db/schema/core/enums.ts`. (✅ Completed)
3.  **Table Migration by Domain:**
    *   `forum/`: All tables migrated. (✅ Completed)
    *   `user/`: All tables migrated. (✅ Completed)
    *   `economy/`: All tables migrated. (✅ Completed)
    *   `shop/`: All tables migrated. (✅ Completed)
    *   `messaging/`: All tables migrated. (✅ Completed)
    *   `admin/`: All tables migrated. (✅ Completed)
    *   `gamification/`: All tables migrated. (✅ Completed)
    *   `integrations/`: Relevant fields integrated into other domains; no separate tables needed for now. (✅ Completed)
    *   `system/`: All tables migrated. (✅ Completed)
4.  **Cleanup `shared/schema.ts`:** File cleared and marked as phased out. (✅ Completed)
5.  **Create Main Schema Index File:** `db/schema/index.ts` created and populated with exports from all domain modules. (✅ Completed)
6.  **Update `drizzle.config.ts`:** `schema` property updated to `\"./db/schema/index.ts\"`. (✅ Completed)
7.  **Generate Consolidated Migration:** Successfully generated `migrations/postgres/0001_orange_norrin_radd.sql`. (✅ Completed)

**Phase 2: Codebase Integration & Testing**

1.  **Review Generated Migration:**
    *   **Action:** Carefully review the SQL in the newly generated migration file (`migrations/postgres/0001_orange_norrin_radd.sql`). Ensure it accurately reflects the schema changes and acts as a new baseline.
2.  **Refactor Codebase Imports:**
    *   **Action:** Scan the entire codebase (server-side services, API routes, client-side components, hooks, etc.) for any imports that currently reference `shared/schema.ts`.
    *   **Action:** Update these imports to use the new central export from `db/schema/index.ts` (e.g., `import { users, posts } from \'@/db/schema\';`) or directly from the domain files if preferred (e.g. `import { users } from \'@/db/schema/user/users\'`).
3.  **Apply Migration to Database:**
    *   **Action:** Once the migration script is reviewed and imports are refactored, apply the migration to development/testing databases. (e.g., `npm run db:migrate:apply` or your project\'s standard procedure).
4.  **Testing:**
    *   **Action:** Conduct thorough testing of all database operations, API endpoints, and application features that interact with the database to ensure no regressions were introduced by the schema refactor or import changes.
5.  **Documentation Update:**
    *   **Action:** Ensure all relevant project documentation (READMEs, technical docs) that refer to schema location or database interaction patterns are updated to reflect the new structure. (Ongoing)

This refactor is a significant undertaking but will yield substantial benefits in the long term for the Degentalk™™ platform. 