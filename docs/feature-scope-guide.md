# Feature Scope Guide

Generated on: 2025-06-26T19:44:47.040Z

> NOTE: This file is auto-generated. Do not edit manually.

## Activity

### Frontend Pages
- client/src/pages/admin/activity/index.tsx
- client/src/pages/admin/activity/user/[userId].tsx
- client/src/pages/mod/activity.tsx
- client/src/pages/profile/activity.tsx

### Frontend Components / Hooks / Services
- client/src/features/activity/components/ActivityFeed.tsx
- client/src/features/activity/components/PaginatedActivityFeed.tsx
- client/src/features/activity/hooks/useActivityFeed.ts
- client/src/features/activity/services/activityApi.ts

### Backend
- server/src/domains/activity/controllers/event-log.controller.ts
- server/src/domains/activity/routes/event-log.routes.ts
- server/src/domains/activity/routes/index.ts
- server/src/domains/activity/services/event-log.service.ts
- server/src/domains/activity/services/event-logger.service.ts

### Docs
- docs/activity-feed-system.md

## Admin

### Frontend Pages
- client/src/pages/admin/activity/index.tsx
- client/src/pages/admin/activity/user/[userId].tsx
- client/src/pages/admin/ad-management.tsx
- client/src/pages/admin/admin-layout.tsx
- client/src/pages/admin/airdrop.tsx
- client/src/pages/admin/announcements/index.tsx
- client/src/pages/admin/avatar-frames.tsx
- client/src/pages/admin/brand-config.tsx
- client/src/pages/admin/categories.tsx
- client/src/pages/admin/clout/achievements.tsx
- client/src/pages/admin/clout/grants.tsx
- client/src/pages/admin/clout/index.tsx
- client/src/pages/admin/config/economy.tsx
- client/src/pages/admin/config/tags.tsx
- client/src/pages/admin/config/xp.tsx
- client/src/pages/admin/config/zones.tsx
- client/src/pages/admin/database-config.tsx
- client/src/pages/admin/dev/seeding.tsx
- client/src/pages/admin/dgt-packages.tsx
- client/src/pages/admin/dictionary/index.tsx
- client/src/pages/admin/emojis.tsx
- client/src/pages/admin/feature-flags.tsx
- client/src/pages/admin/features/index.tsx
- client/src/pages/admin/forum-structure.tsx
- client/src/pages/admin/index.tsx
- client/src/pages/admin/missions/index.tsx
- client/src/pages/admin/permissions/index.tsx
- client/src/pages/admin/prefixes.tsx
- client/src/pages/admin/reports/index.tsx
- client/src/pages/admin/roles-titles.tsx
- client/src/pages/admin/roles.tsx
- client/src/pages/admin/shop/categories.tsx
- client/src/pages/admin/shop/edit.tsx
- client/src/pages/admin/shop/index.tsx
- client/src/pages/admin/shop/rarities.tsx
- client/src/pages/admin/social-config.tsx
- client/src/pages/admin/stats/index.tsx
- client/src/pages/admin/stickers.tsx
- client/src/pages/admin/system-analytics.tsx
- client/src/pages/admin/tags.tsx
- client/src/pages/admin/tip-rain-settings.tsx
- client/src/pages/admin/transactions/index.tsx
- client/src/pages/admin/treasury.tsx
- client/src/pages/admin/ui-config.tsx
- client/src/pages/admin/ui/animations.tsx
- client/src/pages/admin/ui/pack-builder.tsx
- client/src/pages/admin/users.tsx
- client/src/pages/admin/users/[userId].tsx
- client/src/pages/admin/wallets/index.tsx
- client/src/pages/admin/xp-system.tsx
- client/src/pages/admin/xp/actions.tsx
- client/src/pages/admin/xp/adjust.tsx
- client/src/pages/admin/xp/badges.tsx
- client/src/pages/admin/xp/settings.tsx
- client/src/pages/admin/xp/titles.tsx
- client/src/pages/admin/xp/user-adjustment.tsx

### Frontend Components / Hooks / Services
- client/src/components/admin/AdminDashboard.tsx
- client/src/components/admin/AdminThemeProvider.tsx
- client/src/components/admin/FeatureFlagRow.tsx
- client/src/components/admin/GrantFrameModal.tsx
- client/src/components/admin/ModularAdminLayout.tsx
- client/src/components/admin/ModularAdminSidebar.tsx
- client/src/components/admin/XpActionRow.tsx
- client/src/components/admin/clout/AchievementsSection.tsx
- client/src/components/admin/clout/CloutGrantsSection.tsx
- client/src/components/admin/clout/CloutLogsSection.tsx
- client/src/components/admin/clout/CloutTiersSection.tsx
- client/src/components/admin/cooldown-settings.tsx
- client/src/components/admin/effects/BankruptcyEffect.tsx
- client/src/components/admin/effects/CloutObliterationEffect.tsx
- client/src/components/admin/forms/reports/ReportActionDialogs.tsx
- client/src/components/admin/forms/reports/ViewReportDialog.tsx
- client/src/components/admin/forms/roles/RoleFormDialog.tsx
- client/src/components/admin/forms/users/UserActionDialogs.tsx
- client/src/components/admin/forms/users/UserFormDialog.tsx
- client/src/components/admin/forms/wallets/ManualDgtAdjustmentDialog.tsx
- client/src/components/admin/forms/xp/BadgeFormDialogs.tsx
- client/src/components/admin/forms/xp/LevelFormDialogs.tsx
- client/src/components/admin/forms/xp/TitleMediaInput.tsx
- client/src/components/admin/inputs/AdminAccessSelector.tsx
- client/src/components/admin/inputs/AdminToggle.tsx
- client/src/components/admin/inputs/UnlockMultiSelect.tsx
- client/src/components/admin/layout/AdminPageShell.tsx
- client/src/components/admin/layout/EntityFilters.tsx
- client/src/components/admin/layout/EntityTable.tsx
- client/src/components/admin/media/MediaLibraryModal.tsx
- client/src/components/admin/media/MediaPickerModal.tsx
- client/src/components/admin/permissions/PermissionsEditor.tsx
- client/src/components/admin/permissions/PermissionsOverview.tsx
- client/src/components/admin/protected-admin-route.tsx
- client/src/components/admin/roles/RoleForm.tsx
- client/src/components/admin/roles/RolesSection.tsx
- client/src/components/admin/simple-menu.tsx
- client/src/components/admin/titles/TitlesSection.tsx
- client/src/components/admin/wallet/mock-webhook-trigger.tsx
- client/src/features/admin/api/system-analytics.api.ts
- client/src/features/admin/components/analytics/APIMetricsCard.tsx
- client/src/features/admin/components/analytics/CacheAnalyticsCard.tsx
- client/src/features/admin/components/analytics/DatabaseStatsCard.tsx
- client/src/features/admin/components/analytics/PerformanceHeatmapCard.tsx
- client/src/features/admin/components/analytics/RealtimeMetricsCard.tsx
- client/src/features/admin/components/analytics/SystemAlertsCard.tsx
- client/src/features/admin/components/analytics/SystemHealthCard.tsx
- client/src/features/admin/components/analytics/SystemOverviewCard.tsx
- client/src/features/admin/components/dashboard/EngagementAnalyticsDashboard.tsx
- client/src/features/admin/components/dashboard/RainAnalyticsCard.tsx
- client/src/features/admin/components/dashboard/TippingAnalyticsCard.tsx
- client/src/features/admin/components/dashboard/index.ts
- client/src/features/admin/hooks/useSystemAnalytics.ts
- client/src/features/admin/services/animation-pack-api.service.ts
- client/src/features/admin/services/brandConfigApi.ts
- client/src/features/admin/services/cloutAchievementsService.ts
- client/src/features/admin/services/cloutGrantsService.ts
- client/src/features/admin/services/economyConfigService.ts
- client/src/features/admin/services/featureFlagsService.ts
- client/src/features/admin/services/media-api.service.ts
- client/src/features/admin/services/settingsService.ts
- client/src/features/admin/services/sticker-api.service.ts
- client/src/features/admin/services/uiConfigApi.ts
- client/src/features/admin/services/xpActionsService.ts
- client/src/features/admin/services/xpCloutService.ts
- client/src/hooks/use-admin-modules.ts

### Backend
- server/src/domains/admin/admin.controller.ts
- server/src/domains/admin/admin.errors.ts
- server/src/domains/admin/admin.middleware.ts
- server/src/domains/admin/admin.response.ts
- server/src/domains/admin/admin.routes.ts
- server/src/domains/admin/admin.service.ts
- server/src/domains/admin/admin.validation.ts
- server/src/domains/admin/shared/admin-cache.service.ts
- server/src/domains/admin/shared/admin-error-boundaries.ts
- server/src/domains/admin/shared/admin-operation-utils.ts
- server/src/domains/admin/shared/admin-query-utils.ts
- server/src/domains/admin/shared/index.ts
- server/src/domains/admin/sub-domains/airdrop/airdrop.controller.ts
- server/src/domains/admin/sub-domains/airdrop/airdrop.routes.ts
- server/src/domains/admin/sub-domains/airdrop/airdrop.service.ts
- server/src/domains/admin/sub-domains/analytics/analytics.controller.ts
- server/src/domains/admin/sub-domains/analytics/analytics.routes.ts
- server/src/domains/admin/sub-domains/analytics/analytics.service.ts
- server/src/domains/admin/sub-domains/analytics/analytics.validators.ts
- server/src/domains/admin/sub-domains/analytics/engagement/rain-analytics.controller.ts
- server/src/domains/admin/sub-domains/analytics/engagement/rain-analytics.routes.ts
- server/src/domains/admin/sub-domains/analytics/engagement/rain-analytics.service.ts
- server/src/domains/admin/sub-domains/analytics/engagement/tipping-analytics.controller.ts
- server/src/domains/admin/sub-domains/analytics/engagement/tipping-analytics.routes.ts
- server/src/domains/admin/sub-domains/analytics/engagement/tipping-analytics.service.ts
- server/src/domains/admin/sub-domains/analytics/routes/stats.routes.ts
- server/src/domains/admin/sub-domains/analytics/services/platformStats.service.ts
- server/src/domains/admin/sub-domains/analytics/system-analytics.controller.ts
- server/src/domains/admin/sub-domains/analytics/system-analytics.service.ts
- server/src/domains/admin/sub-domains/analytics/system-analytics.validators.ts
- server/src/domains/admin/sub-domains/animation-packs/animation-packs.controller.ts
- server/src/domains/admin/sub-domains/animation-packs/animation-packs.routes.ts
- server/src/domains/admin/sub-domains/animation-packs/animation-packs.service.ts
- server/src/domains/admin/sub-domains/announcements/announcements.routes.ts
- server/src/domains/admin/sub-domains/announcements/controllers/announcements.controller.ts
- server/src/domains/admin/sub-domains/announcements/index.ts
- server/src/domains/admin/sub-domains/announcements/services/announcements.service.ts
- server/src/domains/admin/sub-domains/avatar-frames/avatar-frames.controller.ts
- server/src/domains/admin/sub-domains/avatar-frames/avatar-frames.routes.ts
- server/src/domains/admin/sub-domains/avatar-frames/avatar-frames.service.ts
- server/src/domains/admin/sub-domains/backup-restore/backup-restore.controller.ts
- server/src/domains/admin/sub-domains/backup-restore/backup-restore.routes.ts
- server/src/domains/admin/sub-domains/backup-restore/backup.service.ts
- server/src/domains/admin/sub-domains/backup-restore/restore.service.ts
- server/src/domains/admin/sub-domains/backup-restore/schedule.service.ts
- server/src/domains/admin/sub-domains/brand-config/brand.controller.ts
- server/src/domains/admin/sub-domains/brand-config/brand.routes.ts
- server/src/domains/admin/sub-domains/brand-config/brand.service.ts
- server/src/domains/admin/sub-domains/cache/cache.controller.ts
- server/src/domains/admin/sub-domains/cache/cache.routes.ts
- server/src/domains/admin/sub-domains/clout/clout.controller.ts
- server/src/domains/admin/sub-domains/clout/clout.routes.ts
- server/src/domains/admin/sub-domains/dev/seeding.routes.ts
- server/src/domains/admin/sub-domains/dgt-packages/dgt-packages.controller.ts
- server/src/domains/admin/sub-domains/dgt-packages/dgt-packages.routes.ts
- server/src/domains/admin/sub-domains/dgt-packages/dgt-packages.service.ts
- server/src/domains/admin/sub-domains/economy/economy.controller.ts
- server/src/domains/admin/sub-domains/economy/economy.routes.ts
- server/src/domains/admin/sub-domains/email-templates/email-templates.controller.ts
- server/src/domains/admin/sub-domains/email-templates/email-templates.routes.ts
- server/src/domains/admin/sub-domains/email-templates/email-templates.service.ts
- server/src/domains/admin/sub-domains/emojis/emojis.controller.ts
- server/src/domains/admin/sub-domains/emojis/emojis.routes.ts
- server/src/domains/admin/sub-domains/emojis/emojis.service.ts
- server/src/domains/admin/sub-domains/emojis/emojis.validators.ts
- server/src/domains/admin/sub-domains/forum/forum.controller.ts
- server/src/domains/admin/sub-domains/forum/forum.routes.ts
- server/src/domains/admin/sub-domains/forum/forum.service.ts
- server/src/domains/admin/sub-domains/forum/forum.validators.ts
- server/src/domains/admin/sub-domains/forumPrefix/forumPrefix.service.ts
- server/src/domains/admin/sub-domains/index.ts
- server/src/domains/admin/sub-domains/moderator-notes/moderator-notes.routes.ts
- server/src/domains/admin/sub-domains/permissions/permissions.controller.ts
- server/src/domains/admin/sub-domains/permissions/permissions.routes.ts
- server/src/domains/admin/sub-domains/permissions/permissions.service.ts
- server/src/domains/admin/sub-domains/referrals/referrals.controller.ts
- server/src/domains/admin/sub-domains/referrals/referrals.routes.ts
- server/src/domains/admin/sub-domains/referrals/referrals.service.ts
- server/src/domains/admin/sub-domains/referrals/referrals.validators.ts
- server/src/domains/admin/sub-domains/reports/reports.controller.ts
- server/src/domains/admin/sub-domains/reports/reports.routes.ts
- server/src/domains/admin/sub-domains/reports/reports.service.ts
- server/src/domains/admin/sub-domains/reports/reports.validators.ts
- server/src/domains/admin/sub-domains/roles/roles.controller.ts
- server/src/domains/admin/sub-domains/roles/roles.routes.ts
- server/src/domains/admin/sub-domains/roles/roles.service.ts
- server/src/domains/admin/sub-domains/roles/roles.validators.ts
- server/src/domains/admin/sub-domains/settings/services/index.ts
- server/src/domains/admin/sub-domains/settings/services/settings-command.service.ts
- server/src/domains/admin/sub-domains/settings/services/settings-group.service.ts
- server/src/domains/admin/sub-domains/settings/services/settings-query.service.ts
- server/src/domains/admin/sub-domains/settings/services/settings-validation.service.ts
- server/src/domains/admin/sub-domains/settings/settings.controller.ts
- server/src/domains/admin/sub-domains/settings/settings.routes.ts
- server/src/domains/admin/sub-domains/settings/settings.service.refactored.ts
- server/src/domains/admin/sub-domains/settings/settings.validators.ts
- server/src/domains/admin/sub-domains/shop/rarity.routes.ts
- server/src/domains/admin/sub-domains/shop/rarity.service.ts
- server/src/domains/admin/sub-domains/shop/shop.admin.controller.ts
- server/src/domains/admin/sub-domains/shop/shop.admin.routes.ts
- server/src/domains/admin/sub-domains/shop/shopCategory.routes.ts
- server/src/domains/admin/sub-domains/shop/shopCategory.service.ts
- server/src/domains/admin/sub-domains/social/social.controller.ts
- server/src/domains/admin/sub-domains/social/social.routes.ts
- server/src/domains/admin/sub-domains/social/social.service.ts
- server/src/domains/admin/sub-domains/subscriptions/subscription.admin.controller.ts
- server/src/domains/admin/sub-domains/subscriptions/subscription.admin.routes.ts
- server/src/domains/admin/sub-domains/titles/titles.controller.ts
- server/src/domains/admin/sub-domains/titles/titles.routes.ts
- server/src/domains/admin/sub-domains/titles/titles.service.ts
- server/src/domains/admin/sub-domains/titles/titles.validators.ts
- server/src/domains/admin/sub-domains/treasury/treasury.controller.ts
- server/src/domains/admin/sub-domains/treasury/treasury.routes.ts
- server/src/domains/admin/sub-domains/treasury/treasury.service.ts
- server/src/domains/admin/sub-domains/treasury/treasury.validators.ts
- server/src/domains/admin/sub-domains/ui-config/ui-config.controller.ts
- server/src/domains/admin/sub-domains/ui-config/ui-config.routes.ts
- server/src/domains/admin/sub-domains/ui-config/ui-config.service.ts
- server/src/domains/admin/sub-domains/ui-config/ui-config.types.ts
- server/src/domains/admin/sub-domains/ui-config/ui-config.validators.ts
- server/src/domains/admin/sub-domains/ui-config/uiThemes.service.ts
- server/src/domains/admin/sub-domains/user-groups/user-groups.controller.ts
- server/src/domains/admin/sub-domains/user-groups/user-groups.routes.ts
- server/src/domains/admin/sub-domains/user-groups/user-groups.service.ts
- server/src/domains/admin/sub-domains/user-groups/user-groups.validators.ts
- server/src/domains/admin/sub-domains/users/bulk-operations.controller.ts
- server/src/domains/admin/sub-domains/users/bulk-operations.service.ts
- server/src/domains/admin/sub-domains/users/inventory.admin.controller.ts
- server/src/domains/admin/sub-domains/users/inventory.admin.routes.ts
- server/src/domains/admin/sub-domains/users/users.controller.ts
- server/src/domains/admin/sub-domains/users/users.routes.ts
- server/src/domains/admin/sub-domains/users/users.service.ts
- server/src/domains/admin/sub-domains/wallet/wallet.controller.ts
- server/src/domains/admin/sub-domains/wallet/wallet.routes.ts
- server/src/domains/admin/sub-domains/wallet/wallet.validators.ts
- server/src/domains/admin/sub-domains/xp/xp-actions.controller.ts
- server/src/domains/admin/sub-domains/xp/xp.clout.service.ts
- server/src/domains/admin/sub-domains/xp/xp.controller.ts
- server/src/domains/admin/sub-domains/xp/xp.routes.ts
- server/src/domains/admin/sub-domains/xp/xp.service.ts
- server/src/domains/admin/sub-domains/xp/xp.validators.ts

### Database Schema
- db/schema/admin/announcements.ts
- db/schema/admin/auditLogs.ts
- db/schema/admin/backups.ts
- db/schema/admin/brandConfig.ts
- db/schema/admin/emailTemplates.ts
- db/schema/admin/featureFlags.ts
- db/schema/admin/mediaLibrary.ts
- db/schema/admin/moderationActions.ts
- db/schema/admin/moderator-notes.ts
- db/schema/admin/reports.ts
- db/schema/admin/scheduledTasks.ts
- db/schema/admin/seoMetadata.ts
- db/schema/admin/siteSettings.ts
- db/schema/admin/templates.ts
- db/schema/admin/themes.ts
- db/schema/admin/uiConfig.ts
- db/schema/admin/uiThemes.ts

### Tests
- client/src/__tests__/admin-modules.test.ts
- tests/e2e/admin-settings.spec.ts

### Scripts & Tools
- scripts/admin/validate-admin-controllers.ts
- scripts/refactor/fix-admin-double-layout.ts
- scripts/refactor/fix-broken-admin-imports.ts
- scripts/test-admin-xp.js

### Docs
- docs/admin-panel-audit-2025-06-17.md
- docs/api/admin-api.md
- docs/examples/admin-users-query.md

## Advertising

### Backend
- server/src/domains/advertising/ad-admin.controller.ts
- server/src/domains/advertising/ad-configuration.service.ts
- server/src/domains/advertising/ad-serving.service.ts
- server/src/domains/advertising/ad.controller.ts
- server/src/domains/advertising/ad.routes.ts
- server/src/domains/advertising/campaign-management.service.ts
- server/src/domains/advertising/user-promotion.routes.ts
- server/src/domains/advertising/user-promotion.service.ts

### Database Schema
- db/schema/advertising/campaigns.ts
- db/schema/advertising/payments.ts
- db/schema/advertising/performance.ts
- db/schema/advertising/placements.ts
- db/schema/advertising/targeting.ts
- db/schema/advertising/user-promotions.ts

## App-shell

### Frontend Pages
- client/src/App.tsx

### Frontend Components / Hooks / Services
- client/src/App.tsx

## Auth

### Frontend Pages
- client/src/pages/auth.tsx

### Frontend Components / Hooks / Services
- client/src/components/auth/protected-route.tsx
- client/src/hooks/use-auth.tsx
- client/src/hooks/wrappers/use-auth-wrapper.ts

### Backend
- server/src/domains/auth/auth.routes.ts
- server/src/domains/auth/controllers/auth.controller.ts
- server/src/domains/auth/index.ts
- server/src/domains/auth/middleware/auth.middleware.ts
- server/src/domains/auth/routes/xAuthRoutes.ts
- server/src/domains/auth/services/auth.service.ts
- server/src/domains/auth/services/xAuthService.ts
- server/src/middleware/auth.ts
- server/src/middleware/authenticate.ts
- server/src/utils/auth.ts

### Docs
- docs/AUTH-MIGRATION-GUIDE.md
- docs/api/auth-api.md
- docs/dev/auth-wallet-dev-guide.md

## Ccpayment-webhook

### Backend
- server/src/domains/ccpayment-webhook/ccpayment-webhook.controller.ts
- server/src/domains/ccpayment-webhook/ccpayment-webhook.routes.ts
- server/src/domains/ccpayment-webhook/ccpayment-webhook.service.ts

## Collectibles

### Backend
- server/src/domains/collectibles/stickers/stickers.controller.ts
- server/src/domains/collectibles/stickers/stickers.routes.ts
- server/src/domains/collectibles/stickers/stickers.service.ts
- server/src/domains/collectibles/stickers/stickers.validators.ts

### Database Schema
- db/schema/collectibles/stickers.ts

## Core

### Database Schema
- db/schema/core/enums.ts

## Cosmetics

### Frontend Components / Hooks / Services
- client/src/hooks/useUserCosmetics.ts

### Backend
- server/src/domains/cosmetics/avatarFrameStore.service.ts
- server/src/domains/cosmetics/frameEquip.service.ts

## Degen-index

### Frontend Pages
- client/src/pages/degen-index.tsx

## Dictionary

### Frontend Pages
- client/src/pages/admin/dictionary/index.tsx
- client/src/pages/dictionary/[slug].tsx
- client/src/pages/dictionary/index.tsx

### Frontend Components / Hooks / Services
- client/src/features/dictionary/components/AddWordModal.tsx
- client/src/features/dictionary/services/dictionaryApi.ts

### Backend
- server/src/domains/dictionary/dictionary.routes.ts
- server/src/domains/dictionary/dictionary.service.ts

### Database Schema
- db/schema/dictionary/entries.ts
- db/schema/dictionary/upvotes.ts

### Scripts & Tools
- scripts/seed/dictionary.ts

## Economy

### Frontend Pages
- client/src/pages/admin/config/economy.tsx

### Frontend Components / Hooks / Services
- client/src/components/economy/badges/BadgeShowcase.tsx
- client/src/components/economy/badges/UserBadgesDisplay.tsx
- client/src/components/economy/wallet-display.tsx
- client/src/components/economy/wallet/DgtPackageCard.tsx
- client/src/components/economy/wallet/PackagesGrid.tsx
- client/src/components/economy/wallet/TransactionSheet.tsx
- client/src/components/economy/wallet/WalletSheet.tsx
- client/src/components/economy/wallet/animated-balance.tsx
- client/src/components/economy/wallet/buy-dgt-button.tsx
- client/src/components/economy/wallet/deposit-button.tsx
- client/src/components/economy/wallet/dgt-transfer.tsx
- client/src/components/economy/wallet/rain-button.tsx
- client/src/components/economy/wallet/tip-button.tsx
- client/src/components/economy/wallet/transaction-history.tsx
- client/src/components/economy/wallet/wallet-address-display.tsx
- client/src/components/economy/wallet/wallet-balance-display.tsx
- client/src/components/economy/wallet/withdraw-button.tsx
- client/src/components/economy/xp/LevelBadge.tsx
- client/src/components/economy/xp/LevelUpNotification.tsx
- client/src/components/economy/xp/TitleSelector.tsx
- client/src/components/economy/xp/XPHistoryLog.tsx
- client/src/components/economy/xp/XPProgressBar.tsx

### Backend
- server/src/domains/admin/sub-domains/economy/economy.controller.ts
- server/src/domains/admin/sub-domains/economy/economy.routes.ts
- server/src/domains/economy/services/cloutService.ts
- server/src/domains/economy/services/rewardService.ts
- server/src/utils/economy-loader.ts

### Database Schema
- db/schema/economy/airdropRecords.ts
- db/schema/economy/airdropSettings.ts
- db/schema/economy/badges.ts
- db/schema/economy/cloutAchievements.ts
- db/schema/economy/dgtPackages.ts
- db/schema/economy/dgtPurchaseOrders.ts
- db/schema/economy/levels.ts
- db/schema/economy/postTips.ts
- db/schema/economy/rainEvents.ts
- db/schema/economy/settings.ts
- db/schema/economy/titles.ts
- db/schema/economy/transactions.ts
- db/schema/economy/treasurySettings.ts
- db/schema/economy/userBadges.ts
- db/schema/economy/userCloutLog.ts
- db/schema/economy/userCommands.ts
- db/schema/economy/userTitles.ts
- db/schema/economy/vaults.ts
- db/schema/economy/wallets.ts
- db/schema/economy/withdrawalRequests.ts
- db/schema/economy/xpActionSettings.ts
- db/schema/economy/xpAdjustmentLogs.ts
- db/schema/economy/xpCloutSettings.ts
- db/schema/economy/xpLogs.ts

### Scripts & Tools
- scripts/db/seed-economy-settings.ts

## Editor

### Frontend Components / Hooks / Services
- client/src/components/editor/enhanced-gif-picker.tsx
- client/src/components/editor/gif-picker.tsx
- client/src/components/editor/rich-text-editor.tsx
- client/src/components/editor/suggestion.ts

### Backend
- server/src/domains/editor/editor.routes.ts

## Engagement

### Frontend Components / Hooks / Services
- client/src/hooks/useProfileEngagement.ts

### Backend
- server/src/domains/engagement/airdrop/airdrop.controller.ts
- server/src/domains/engagement/airdrop/airdrop.routes.ts
- server/src/domains/engagement/airdrop/airdrop.service.ts
- server/src/domains/engagement/engagement.service.ts
- server/src/domains/engagement/rain/rain.controller.ts
- server/src/domains/engagement/rain/rain.routes.ts
- server/src/domains/engagement/rain/rain.service.ts
- server/src/domains/engagement/tip/tip.controller.ts
- server/src/domains/engagement/tip/tip.routes.ts
- server/src/domains/engagement/tip/tip.service.ts
- server/src/domains/engagement/vault/vault.controller.ts
- server/src/domains/engagement/vault/vault.routes.ts
- server/src/domains/engagement/vault/vault.service.ts

### Tests
- client/src/components/forum/enhanced/__tests__/CryptoEngagementBar.test.tsx

## Feature-gates

### Backend
- server/src/domains/feature-gates/feature-gates.controller.ts
- server/src/domains/feature-gates/feature-gates.routes.ts
- server/src/domains/feature-gates/feature-gates.service.ts

## Forum

### Frontend Components / Hooks / Services
- client/src/components/forum/BBCodePostCard.tsx
- client/src/components/forum/CanonicalZoneGrid.tsx
- client/src/components/forum/CreateThreadButton.tsx
- client/src/components/forum/ForumPage.tsx
- client/src/components/forum/HotTopics.tsx
- client/src/components/forum/ModeratorActions.tsx
- client/src/components/forum/OriginForumPill.tsx
- client/src/components/forum/ProfileCard.tsx
- client/src/components/forum/QuickStats.tsx
- client/src/components/forum/ReactionBar.tsx
- client/src/components/forum/RecentActivity.tsx
- client/src/components/forum/ShareButton.tsx
- client/src/components/forum/ShopCard.tsx
- client/src/components/forum/SignatureRenderer.tsx
- client/src/components/forum/SolveBadge.tsx
- client/src/components/forum/StickyBackButton.tsx
- client/src/components/forum/ThreadAuthor.tsx
- client/src/components/forum/ThreadCard.tsx
- client/src/components/forum/ThreadFilters.tsx
- client/src/components/forum/ThreadPagination.tsx
- client/src/components/forum/ThreadSidebar.tsx
- client/src/components/forum/ThreadStats.tsx
- client/src/components/forum/UserLevelDisplay.tsx
- client/src/components/forum/XpBoostBadge.tsx
- client/src/components/forum/ZoneCard.tsx
- client/src/components/forum/ZoneStats.tsx
- client/src/components/forum/breadcrumb-nav.tsx
- client/src/components/forum/category-card.tsx
- client/src/components/forum/enhanced/CryptoEngagementBar.tsx
- client/src/components/forum/enhanced/MobileForumNavigation.tsx
- client/src/components/forum/enhanced/QuickReactions.tsx
- client/src/components/forum/enhanced/__tests__/CryptoEngagementBar.test.tsx
- client/src/components/forum/enhanced/__tests__/EnhancedThreadCard.test.tsx
- client/src/components/forum/enhanced/__tests__/QuickReactions.test.tsx
- client/src/components/forum/forum-card.tsx
- client/src/components/forum/forum-category-card.tsx
- client/src/components/forum/forum-filters.tsx
- client/src/components/forum/forum-guidelines.tsx
- client/src/components/forum/index.ts
- client/src/components/forum/layouts/AdaptiveForumGrid.tsx
- client/src/components/forum/layouts/MagicForumBuilder.tsx
- client/src/components/forum/layouts/ResponsiveForumLayout.tsx
- client/src/components/forum/layouts/__tests__/AdaptiveForumGrid.test.tsx
- client/src/components/forum/layouts/__tests__/ResponsiveForumLayout.test.tsx
- client/src/components/forum/layouts/index.ts
- client/src/components/forum/prefix-badge.tsx
- client/src/components/forum/tag-input.tsx
- client/src/components/forum/zone-group.tsx
- client/src/features/forum/components/CreatePostForm.tsx
- client/src/features/forum/components/CreateThreadForm.tsx
- client/src/features/forum/components/EditPostDialog.tsx
- client/src/features/forum/components/ForumHeader.tsx
- client/src/features/forum/components/ForumListItem.tsx
- client/src/features/forum/components/HierarchicalZoneNav.tsx
- client/src/features/forum/components/HotThreads.tsx
- client/src/features/forum/components/LikeButton.tsx
- client/src/features/forum/components/PostCard.tsx
- client/src/features/forum/components/ReactionTray.tsx
- client/src/features/forum/components/ReplyForm.tsx
- client/src/features/forum/components/ReportPostDialog.tsx
- client/src/features/forum/components/ThreadForm.tsx
- client/src/features/forum/components/ThreadList.tsx
- client/src/features/forum/components/index.ts
- client/src/features/forum/hooks/useForumQueries.ts
- client/src/features/forum/services/forumApi.ts

### Backend
- server/src/config/forum.config.ts
- server/src/domains/admin/sub-domains/forum/forum.controller.ts
- server/src/domains/admin/sub-domains/forum/forum.routes.ts
- server/src/domains/admin/sub-domains/forum/forum.service.ts
- server/src/domains/admin/sub-domains/forum/forum.validators.ts
- server/src/domains/admin/sub-domains/forumPrefix/forumPrefix.service.ts
- server/src/domains/forum/forum.controller.ts
- server/src/domains/forum/forum.routes.ts
- server/src/domains/forum/forum.service.test.ts
- server/src/domains/forum/forum.service.ts
- server/src/domains/forum/routes/bookmark.routes.ts
- server/src/domains/forum/routes/category.routes.ts
- server/src/domains/forum/routes/post.routes.ts
- server/src/domains/forum/routes/thread.routes.ts
- server/src/domains/forum/rules/rules.routes.ts
- server/src/domains/forum/services/cache.service.ts
- server/src/domains/forum/services/category.service.ts
- server/src/domains/forum/services/config.service.ts
- server/src/domains/forum/services/post.service.ts
- server/src/domains/forum/services/structure.service.ts
- server/src/domains/forum/services/thread.service.ts
- server/src/domains/forum/sub-domains/reports/reports.controller.ts
- server/src/domains/forum/sub-domains/reports/reports.routes.ts
- server/src/domains/forum/sub-domains/reports/reports.service.ts
- server/src/domains/forum/sub-domains/reports/reports.validators.ts

### Database Schema
- db/schema/forum/customEmojis.ts
- db/schema/forum/emojiPackItems.ts
- db/schema/forum/emojiPacks.ts
- db/schema/forum/pollOptions.ts
- db/schema/forum/pollVotes.ts
- db/schema/forum/polls.ts
- db/schema/forum/postDrafts.ts
- db/schema/forum/postLikes.ts
- db/schema/forum/postReactions.ts
- db/schema/forum/posts.ts
- db/schema/forum/prefixes.ts
- db/schema/forum/rules.ts
- db/schema/forum/structure.ts
- db/schema/forum/tags.ts
- db/schema/forum/threadBookmarks.ts
- db/schema/forum/threadDrafts.ts
- db/schema/forum/threadFeaturePermissions.ts
- db/schema/forum/threadTags.ts
- db/schema/forum/threads.ts
- db/schema/forum/userEmojiPacks.ts
- db/schema/forum/userRuleAgreements.ts

### Tests
- client/src/components/forum/layouts/__tests__/AdaptiveForumGrid.test.tsx
- client/src/components/forum/layouts/__tests__/ResponsiveForumLayout.test.tsx
- server/src/domains/forum/forum.service.test.ts
- test-forum-e2e.spec.ts
- tests/e2e/forum-home.spec.ts

### Scripts & Tools
- scripts/backfill-thread-parentForumSlug.ts
- scripts/build-forum-sdk.ts
- scripts/db/dist/scripts/db/seed-forum-categories.js
- scripts/db/fix-forum-relationships.ts
- scripts/db/read-forum-categories.ts
- scripts/db/test-forum-query.ts
- scripts/db/test-forum-runtime.ts
- scripts/db/update-forum-slugs.ts
- scripts/dev/syncForumsToDB.ts
- scripts/migration/migrate-forum-structure.ts
- scripts/ops/check-forum-config-sync.ts
- scripts/seed/seedForumsFromConfig.ts
- scripts/test-forum-api.ts
- scripts/testing/test-forum-endpoints.js
- scripts/testing/validate-forum-fks.ts
- scripts/validation/validate-forum-structure-migration.ts

### Docs
- docs/api/forum-api.md
- docs/archive/FORUM_PRIMARY_ZONES_REFACTOR_PLAN.md

## Forum-rules

### Frontend Pages
- client/src/pages/forum-rules.tsx

## Gamification

### Database Schema
- db/schema/gamification/achievements.ts
- db/schema/gamification/leaderboards.ts
- db/schema/gamification/missions.ts
- db/schema/gamification/platformStats.ts
- db/schema/gamification/userAchievements.ts
- db/schema/gamification/userMissionProgress.ts

## Home

### Frontend Pages
- client/src/pages/home.tsx

### Tests
- tests/e2e/forum-home.spec.ts

## Leaderboard

### Frontend Pages
- client/src/pages/leaderboard.tsx

## Messaging

### Backend
- server/src/domains/messaging/message.routes.ts

### Database Schema
- db/schema/messaging/chatRooms.ts
- db/schema/messaging/conversationParticipants.ts
- db/schema/messaging/conversations.ts
- db/schema/messaging/directMessages.ts
- db/schema/messaging/messageReads.ts
- db/schema/messaging/messages.ts
- db/schema/messaging/onlineUsers.ts
- db/schema/messaging/shoutboxMessages.ts

## Migrations

### Database Schema
- db/schema/migrations/performance-indices.ts

### Scripts & Tools
- scripts/ops/validate-safe-migrations.ts

## Missions

### Frontend Pages
- client/src/pages/admin/missions/index.tsx
- client/src/pages/missions/index.tsx

### Frontend Components / Hooks / Services
- client/src/components/missions/DailyMissions.tsx
- client/src/components/missions/MissionsWidget.tsx
- client/src/hooks/useMissions.ts

### Backend
- server/src/domains/missions/missions.admin.controller.ts
- server/src/domains/missions/missions.admin.routes.ts
- server/src/domains/missions/missions.controller.ts
- server/src/domains/missions/missions.routes.ts
- server/src/domains/missions/missions.service.ts

## Not-found

### Frontend Pages
- client/src/pages/not-found.tsx

## Notifications

### Frontend Components / Hooks / Services
- client/src/components/notifications/MentionsNotifications.tsx
- client/src/components/notifications/NotificationPanel.tsx
- client/src/hooks/use-notifications.ts
- client/src/hooks/use-rain-notifications.ts

### Backend
- server/src/domains/notifications/event-notification-listener.ts
- server/src/domains/notifications/notification-generator.service.ts
- server/src/domains/notifications/notification.routes.ts
- server/src/domains/notifications/notification.service.ts

## Paths

### Frontend Components / Hooks / Services
- client/src/components/paths/path-progress.tsx
- client/src/components/paths/user-paths-display.tsx

### Backend
- server/src/domains/paths/paths.routes.ts

## Preferences

### Frontend Pages
- client/src/pages/preferences/index.tsx

### Frontend Components / Hooks / Services
- client/src/components/preferences/PreferencesCard.tsx
- client/src/components/preferences/PreferencesGroup.tsx
- client/src/components/preferences/PreferencesInput.tsx
- client/src/components/preferences/PreferencesSelect.tsx
- client/src/components/preferences/PreferencesTextarea.tsx
- client/src/components/preferences/PreferencesToggle.tsx
- client/src/components/preferences/account-preferences.tsx
- client/src/components/preferences/display-preferences.tsx
- client/src/components/preferences/notification-preferences.tsx
- client/src/components/preferences/profile-preferences.tsx
- client/src/components/preferences/referral-preferences.tsx
- client/src/components/preferences/session-preferences.tsx
- client/src/components/preferences/social-preferences.tsx

### Backend
- server/src/domains/preferences/preferences.routes.ts
- server/src/domains/preferences/preferences.service.ts
- server/src/domains/preferences/preferences.validators.ts

## Profile

### Frontend Pages
- client/src/pages/profile/[username].tsx
- client/src/pages/profile/activity.tsx
- client/src/pages/profile/xp-demo.tsx
- client/src/pages/profile/xp.tsx

### Frontend Components / Hooks / Services
- client/src/components/profile/CosmeticControlPanel.tsx
- client/src/components/profile/FriendsTab.tsx
- client/src/components/profile/InventoryTab.tsx
- client/src/components/profile/OverviewTab.tsx
- client/src/components/profile/ProfileCard.tsx
- client/src/components/profile/ProfileDashboard.tsx
- client/src/components/profile/ProfileEditor.tsx
- client/src/components/profile/ProfileNavigation.tsx
- client/src/components/profile/ProfileSidebar.tsx
- client/src/components/profile/ProfileSkeleton.tsx
- client/src/components/profile/SignatureRenderer.tsx
- client/src/components/profile/StatCard.tsx
- client/src/components/profile/UnifiedProfileCard.tsx
- client/src/components/profile/UserBadges.tsx
- client/src/components/profile/UserProfileRenderer.tsx
- client/src/components/profile/UserTitles.tsx
- client/src/components/profile/WhaleWatchTab.tsx
- client/src/components/profile/XPProfileSection.tsx
- client/src/components/profile/XPProgressBar.tsx
- client/src/components/profile/XpLogView.tsx
- client/src/components/profile/index.ts
- client/src/components/profile/rarityUtils.ts
- client/src/components/profile/widgets/ActivityStatsCard.tsx
- client/src/components/profile/widgets/MilestoneCard.tsx
- client/src/components/profile/widgets/ProfileInsightsCard.tsx
- client/src/components/profile/widgets/QuickActionsCard.tsx
- client/src/components/profile/widgets/ReputationCard.tsx
- client/src/components/profile/widgets/SocialStatsCard.tsx
- client/src/components/profile/widgets/WalletOverviewCard.tsx
- client/src/components/profile/widgets/index.ts
- client/src/hooks/useProfileEngagement.ts
- client/src/hooks/useProfileStats.ts

### Backend
- server/src/domains/profile/profile-stats.controller.ts
- server/src/domains/profile/profile-stats.routes.ts
- server/src/domains/profile/profile-stats.service.ts
- server/src/domains/profile/profile.routes.ts
- server/src/domains/profile/profile.service.ts
- server/src/domains/profile/referrals.service.ts
- server/src/domains/profile/signature.routes.ts
- server/src/domains/profile/signature.service.ts
- server/src/domains/profile/social-actions.controller.ts
- server/src/domains/profile/social-actions.routes.ts
- server/src/domains/profile/social-actions.service.ts

## Share

### Backend
- server/src/domains/share/routes/xShareRoutes.ts
- server/src/domains/share/services/xShareService.ts

## Shop

### Frontend Pages
- client/src/pages/admin/shop/categories.tsx
- client/src/pages/admin/shop/edit.tsx
- client/src/pages/admin/shop/index.tsx
- client/src/pages/admin/shop/rarities.tsx
- client/src/pages/shop.tsx
- client/src/pages/shop/avatar-frames.tsx

### Frontend Components / Hooks / Services
- client/src/components/shop/ShopItem.tsx
- client/src/components/shop/purchase-modal.tsx
- client/src/components/shop/shop-item-card.tsx
- client/src/hooks/use-shop-items.tsx
- client/src/hooks/use-shop-ownership.tsx

### Backend
- server/src/domains/admin/sub-domains/shop/shop.admin.controller.ts
- server/src/domains/admin/sub-domains/shop/shop.admin.routes.ts
- server/src/domains/admin/sub-domains/shop/shopCategory.routes.ts
- server/src/domains/admin/sub-domains/shop/shopCategory.service.ts
- server/src/domains/shop/shop.routes.ts

### Database Schema
- db/schema/shop/animationPackItems.ts
- db/schema/shop/animationPacks.ts
- db/schema/shop/cosmeticCategories.ts
- db/schema/shop/inventoryTransactions.ts
- db/schema/shop/orderItems.ts
- db/schema/shop/orders.ts
- db/schema/shop/productCategories.ts
- db/schema/shop/productMedia.ts
- db/schema/shop/products.ts
- db/schema/shop/rarities.ts
- db/schema/shop/signatureItems.ts
- db/schema/shop/userInventory.ts
- db/schema/shop/userSignatureItems.ts

### Scripts & Tools
- scripts/db/seed-shop.ts

## Shoutbox

### Frontend Pages
- client/src/pages/mod/shoutbox.tsx

### Frontend Components / Hooks / Services
- client/src/components/shoutbox/ShoutboxContainer.tsx
- client/src/components/shoutbox/ShoutboxInput.tsx
- client/src/components/shoutbox/index.ts
- client/src/components/shoutbox/integration-example.tsx
- client/src/components/shoutbox/positioned-shoutbox.tsx
- client/src/components/shoutbox/shoutbox-help-command.tsx
- client/src/components/shoutbox/shoutbox-message-styles.tsx
- client/src/components/shoutbox/shoutbox-position-selector.tsx
- client/src/components/shoutbox/shoutbox-rain-notification.tsx
- client/src/components/shoutbox/shoutbox-widget.tsx
- client/src/components/shoutbox/shoutbox.spec.tsx

### Backend
- server/src/domains/shoutbox/shoutbox.routes.ts

### Tests
- client/src/components/shoutbox/shoutbox.spec.tsx

## Social

### Frontend Components / Hooks / Services
- client/src/components/social/FollowButton.tsx
- client/src/components/social/FollowingList.tsx
- client/src/components/social/FriendsManager.tsx
- client/src/components/social/WhaleWatchDashboard.tsx
- client/src/components/social/WhaleWatchDisplay.tsx

### Backend
- server/src/domains/admin/sub-domains/social/social.controller.ts
- server/src/domains/admin/sub-domains/social/social.routes.ts
- server/src/domains/admin/sub-domains/social/social.service.ts
- server/src/domains/profile/social-actions.controller.ts
- server/src/domains/profile/social-actions.routes.ts
- server/src/domains/profile/social-actions.service.ts
- server/src/domains/social/follows.routes.ts
- server/src/domains/social/follows.service.ts
- server/src/domains/social/follows.types.ts
- server/src/domains/social/friends.routes.ts
- server/src/domains/social/friends.service.ts
- server/src/domains/social/mentions.routes.ts
- server/src/domains/social/mentions.service.ts
- server/src/domains/social/mentions.types.ts
- server/src/domains/social/relationships.routes.ts
- server/src/domains/social/social.routes.ts
- server/src/domains/social/whale-watch.routes.ts
- server/src/domains/social/whale-watch.service.ts

### Database Schema
- db/schema/social/friends.ts
- db/schema/social/mentions.ts
- db/schema/social/user-follows.ts

## Subscriptions

### Backend
- server/src/domains/subscriptions/subscription-permissions.service.ts
- server/src/domains/subscriptions/subscription.controller.ts
- server/src/domains/subscriptions/subscription.routes.ts
- server/src/domains/subscriptions/subscription.service.ts
- server/src/domains/subscriptions/subscription.validators.ts

### Scripts & Tools
- scripts/db/seed-dev-subscriptions.ts

## System

### Backend
- server/src/domains/admin/sub-domains/analytics/system-analytics.controller.ts
- server/src/domains/admin/sub-domains/analytics/system-analytics.service.ts
- server/src/domains/admin/sub-domains/analytics/system-analytics.validators.ts

### Database Schema
- db/schema/system/activityFeed.ts
- db/schema/system/airdrop-records.ts
- db/schema/system/analyticsEvents.ts
- db/schema/system/cooldownState.ts
- db/schema/system/economyConfigOverrides.ts
- db/schema/system/event_logs.ts
- db/schema/system/mentionsIndex.ts
- db/schema/system/notifications.ts
- db/schema/system/profileAnalytics.ts
- db/schema/system/rateLimits.ts
- db/schema/system/referralSources.ts
- db/schema/system/userAbuseFlags.ts
- db/schema/system/userReferrals.ts

### Scripts & Tools
- scripts/db/initialize-xp-system.ts
- scripts/testing/test-xp-system.ts

### Docs
- docs/ADVERTISEMENT-SYSTEM.md
- docs/activity-feed-system.md
- docs/gamification/level-flex-system.md
- docs/memory-bank/systemPatterns.md
- docs/ui/avatar-frames-system.md

## Treasury

### Frontend Pages
- client/src/pages/admin/treasury.tsx

### Backend
- server/src/domains/admin/sub-domains/treasury/treasury.controller.ts
- server/src/domains/admin/sub-domains/treasury/treasury.routes.ts
- server/src/domains/admin/sub-domains/treasury/treasury.service.ts
- server/src/domains/admin/sub-domains/treasury/treasury.validators.ts
- server/src/domains/treasury/treasury.routes.ts
- server/src/domains/wallet/treasury.controller.ts

### Scripts & Tools
- scripts/db/seed-treasury.ts

## Ui-playground

### Frontend Pages
- client/src/pages/ui-playground.tsx
- client/src/pages/ui-playground/animations/ButtonPulseDemo.tsx
- client/src/pages/ui-playground/animations/CardFlipDemo.tsx
- client/src/pages/ui-playground/animations/FadeInListDemo.tsx
- client/src/pages/ui-playground/demo-data.ts
- client/src/pages/ui-playground/sections/AnimationsSection.tsx
- client/src/pages/ui-playground/sections/AvatarBadgesSection.tsx
- client/src/pages/ui-playground/sections/ButtonsSection.tsx
- client/src/pages/ui-playground/sections/CardsSection.tsx
- client/src/pages/ui-playground/sections/ColorsSection.tsx
- client/src/pages/ui-playground/sections/FontsSection.tsx

## Uploads

### Backend
- server/src/domains/uploads/upload.controller.ts
- server/src/domains/uploads/upload.routes.ts
- server/src/domains/uploads/upload.service.ts

## User

### Frontend Pages
- client/src/pages/admin/activity/user/[userId].tsx

### Frontend Components / Hooks / Services
- client/src/hooks/preferences/useUpdateUserSettings.ts
- client/src/hooks/preferences/useUserSettings.ts
- client/src/hooks/useUserCosmetics.ts
- client/src/hooks/useUserInventory.ts
- client/src/hooks/useUserXP.ts

### Backend
- server/src/core/repository/__tests__/user-repository.test.ts
- server/src/core/repository/repositories/user-repository.ts
- server/src/domains/admin/sub-domains/user-groups/user-groups.controller.ts
- server/src/domains/admin/sub-domains/user-groups/user-groups.routes.ts
- server/src/domains/admin/sub-domains/user-groups/user-groups.service.ts
- server/src/domains/admin/sub-domains/user-groups/user-groups.validators.ts
- server/src/domains/admin/sub-domains/users/users.controller.ts
- server/src/domains/admin/sub-domains/users/users.routes.ts
- server/src/domains/admin/sub-domains/users/users.service.ts
- server/src/domains/advertising/user-promotion.routes.ts
- server/src/domains/advertising/user-promotion.service.ts
- server/src/domains/user/user-preferences.routes.ts
- server/src/domains/user/user-preferences.service.ts
- server/src/domains/wallet/user-management.service.ts

### Database Schema
- db/schema/user/avatarFrames.ts
- db/schema/user/bans.ts
- db/schema/user/featurePermissions.ts
- db/schema/user/passwordResetTokens.ts
- db/schema/user/permissions.ts
- db/schema/user/preferences.ts
- db/schema/user/relationships.ts
- db/schema/user/rolePermissions.ts
- db/schema/user/roles.ts
- db/schema/user/sessions.ts
- db/schema/user/settingsHistory.ts
- db/schema/user/subscriptions.ts
- db/schema/user/user-social-preferences.ts
- db/schema/user/userGroups.ts
- db/schema/user/userOwnedFrames.ts
- db/schema/user/userRoles.ts
- db/schema/user/users.ts
- db/schema/user/verificationTokens.ts
- db/schema/user/xShares.ts

### Tests
- server/src/core/repository/__tests__/user-repository.test.ts

### Scripts & Tools
- scripts/db/seed-user-role-migration.ts
- scripts/db/seed-users.ts
- scripts/db/update-users-table.ts
- scripts/fix-all-user-refs.ts
- scripts/fix-userid-types.ts
- scripts/refactor/component-merge/user-avatar.js
- scripts/refactor/component-merge/username.js
- scripts/seed/run-username-colors.ts
- scripts/seed/shop/username-colors.ts

### Docs
- docs/USER-ADVERTISEMENT-IMPLEMENTATION.md
- docs/admin/user-guide.md
- docs/examples/admin-users-query.md

## Users

### Frontend Pages
- client/src/pages/admin/users.tsx
- client/src/pages/admin/users/[userId].tsx
- client/src/pages/mod/users.tsx

### Frontend Components / Hooks / Services
- client/src/components/admin/forms/users/UserActionDialogs.tsx
- client/src/components/admin/forms/users/UserFormDialog.tsx
- client/src/components/users/ActiveMembersWidget.tsx
- client/src/components/users/Avatar.tsx
- client/src/components/users/UserAvatar.tsx
- client/src/components/users/UserCard.tsx
- client/src/components/users/UserDirectoryTable.tsx
- client/src/components/users/UserFilters.tsx
- client/src/components/users/Username.tsx
- client/src/components/users/framed-avatar.tsx
- client/src/components/users/index.ts
- client/src/components/users/user-avatar.tsx
- client/src/features/users/hooks/index.ts
- client/src/features/users/hooks/useActiveUsers.ts
- client/src/features/users/hooks/useUserReferrals.ts
- client/src/features/users/services/index.ts
- client/src/features/users/services/referralsApi.ts
- client/src/features/users/services/usersApi.ts
- client/src/hooks/preferences/useUpdateUserSettings.ts
- client/src/hooks/preferences/useUserSettings.ts

### Backend
- server/src/domains/admin/sub-domains/users/users.controller.ts
- server/src/domains/admin/sub-domains/users/users.routes.ts
- server/src/domains/admin/sub-domains/users/users.service.ts

### Scripts & Tools
- scripts/db/seed-users.ts
- scripts/db/update-users-table.ts

### Docs
- docs/examples/admin-users-query.md

## Wallet

### Frontend Pages
- client/src/pages/wallet.tsx

### Frontend Components / Hooks / Services
- client/src/components/admin/wallet/mock-webhook-trigger.tsx
- client/src/components/economy/wallet/DgtPackageCard.tsx
- client/src/components/economy/wallet/PackagesGrid.tsx
- client/src/components/economy/wallet/TransactionSheet.tsx
- client/src/components/economy/wallet/WalletSheet.tsx
- client/src/components/economy/wallet/animated-balance.tsx
- client/src/components/economy/wallet/buy-dgt-button.tsx
- client/src/components/economy/wallet/deposit-button.tsx
- client/src/components/economy/wallet/dgt-transfer.tsx
- client/src/components/economy/wallet/rain-button.tsx
- client/src/components/economy/wallet/tip-button.tsx
- client/src/components/economy/wallet/transaction-history.tsx
- client/src/components/economy/wallet/wallet-address-display.tsx
- client/src/components/economy/wallet/wallet-balance-display.tsx
- client/src/components/economy/wallet/withdraw-button.tsx
- client/src/features/wallet/services/wallet-api.service.ts
- client/src/hooks/use-wallet.ts

### Backend
- server/src/core/wallet-validators.ts
- server/src/domains/admin/sub-domains/wallet/wallet.controller.ts
- server/src/domains/admin/sub-domains/wallet/wallet.routes.ts
- server/src/domains/admin/sub-domains/wallet/wallet.validators.ts
- server/src/domains/wallet/ccpayment.service.ts
- server/src/domains/wallet/dgt.service.ts
- server/src/domains/wallet/middleware/index.ts
- server/src/domains/wallet/middleware/security.middleware.ts
- server/src/domains/wallet/middleware/types.ts
- server/src/domains/wallet/middleware/webhook.middleware.ts
- server/src/domains/wallet/services/ccpayment-api.service.ts
- server/src/domains/wallet/services/ccpayment-balance.service.ts
- server/src/domains/wallet/services/ccpayment-deposit.service.ts
- server/src/domains/wallet/treasury.controller.ts
- server/src/domains/wallet/user-management.service.ts
- server/src/domains/wallet/wallet-api-tests.ts
- server/src/domains/wallet/wallet-config.service.ts
- server/src/domains/wallet/wallet.config.ts
- server/src/domains/wallet/wallet.constants.ts
- server/src/domains/wallet/wallet.controller.ts
- server/src/domains/wallet/wallet.dev.controller.ts
- server/src/domains/wallet/wallet.routes.ts
- server/src/domains/wallet/wallet.service.ts
- server/src/domains/wallet/wallet.test.controller.ts
- server/src/domains/wallet/wallet.test.routes.ts
- server/src/domains/wallet/wallet.validators.ts
- server/src/domains/wallet/webhook.service.ts
- server/src/domains/wallet/withdrawal.controller.ts

### Database Schema
- db/schema/wallet/ccpayment-users.ts
- db/schema/wallet/crypto-wallets.ts
- db/schema/wallet/deposit-records.ts
- db/schema/wallet/internal-transfers.ts
- db/schema/wallet/supported-tokens.ts
- db/schema/wallet/swap-records.ts
- db/schema/wallet/webhook-events.ts
- db/schema/wallet/withdrawal-records.ts

### Scripts & Tools
- scripts/db/seed-dev-wallet.ts
- scripts/dev/setup-fresh-wallet-test.ts
- scripts/wallet/migrate-wallet-components.ts
- scripts/wallet/migrate-wallet-imports.ts
- scripts/wallet/wallet-refactor-migration.ts

### Docs
- docs/CCPAYMENT/WALLET_INTEGRATION_GUIDE.md
- docs/api/wallet-api.md
- docs/dev/auth-wallet-dev-guide.md

## Whispers

### Frontend Pages
- client/src/pages/whispers.tsx

## Xp

### Frontend Pages
- client/src/pages/admin/config/xp.tsx
- client/src/pages/admin/xp/actions.tsx
- client/src/pages/admin/xp/adjust.tsx
- client/src/pages/admin/xp/badges.tsx
- client/src/pages/admin/xp/settings.tsx
- client/src/pages/admin/xp/titles.tsx
- client/src/pages/admin/xp/user-adjustment.tsx
- client/src/pages/profile/xp.tsx

### Frontend Components / Hooks / Services
- client/src/components/admin/forms/xp/BadgeFormDialogs.tsx
- client/src/components/admin/forms/xp/LevelFormDialogs.tsx
- client/src/components/admin/forms/xp/TitleMediaInput.tsx
- client/src/components/economy/xp/LevelBadge.tsx
- client/src/components/economy/xp/LevelUpNotification.tsx
- client/src/components/economy/xp/TitleSelector.tsx
- client/src/components/economy/xp/XPHistoryLog.tsx
- client/src/components/economy/xp/XPProgressBar.tsx
- client/src/components/xp/LevelUpModal.tsx
- client/src/components/xp/XPBarTrack.tsx
- client/src/components/xp/XPBarsContainer.tsx
- client/src/components/xp/XpToast.tsx
- client/src/components/xp/tracks.ts
- client/src/hooks/useUserXP.ts
- client/src/hooks/useXP.ts

### Backend
- server/src/domains/admin/sub-domains/xp/xp-actions.controller.ts
- server/src/domains/admin/sub-domains/xp/xp.clout.service.ts
- server/src/domains/admin/sub-domains/xp/xp.controller.ts
- server/src/domains/admin/sub-domains/xp/xp.routes.ts
- server/src/domains/admin/sub-domains/xp/xp.service.ts
- server/src/domains/admin/sub-domains/xp/xp.validators.ts
- server/src/domains/xp/events/xp.events.ts
- server/src/domains/xp/xp-actions-schema.ts
- server/src/domains/xp/xp-actions.controller.ts
- server/src/domains/xp/xp-actions.ts
- server/src/domains/xp/xp.admin.routes.ts
- server/src/domains/xp/xp.controller.ts
- server/src/domains/xp/xp.events.ts
- server/src/domains/xp/xp.routes.ts
- server/src/domains/xp/xp.service.ts

### Scripts & Tools
- scripts/db/initialize-xp-system.ts
- scripts/db/seed-xp-actions.ts
- scripts/test-admin-xp.js
- scripts/testing/test-xp-actions.js
- scripts/testing/test-xp-endpoints.js
- scripts/testing/test-xp-system.ts

### Docs
- docs/api/xp-api.md
