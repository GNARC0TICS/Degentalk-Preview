.
├── .clinerules
│   ├── available-rules.md
│   ├── cline-continuous-improvement-protocol.md
│   ├── cline-for-webdev-ui.md
│   ├── database-cheatsheet.mdc
│   ├── memory-bank.md
│   └── self-improving-cline.md
├── .cursor
│   └── rules
│       ├── admin-structure.mdc
│       ├── api-client-pattern.mdc
│       ├── cheat-codes.mdc
│       ├── context-mup-protocol.mdc
│       ├── domain-rules.md
│       ├── import-patterns.mdc
│       ├── naming-rules.mdc
│       ├── navigation-helper.mdc
│       ├── riper-5.mdc
│       ├── route-deprecation.mdc
│       ├── rule-evolution.mdc
│       ├── schema-consistency.mdc
│       ├── schema-sync-rules.mdc
│       └── update-history.mdc
├── .gitignore
├── FORUM_NAVIGATION_REFACTOR_SUMMARY.md
├── MVP-NEEDS.md
├── MVP-SPRINTS
│   ├── UI_Wiring_Tasks.md
│   ├── XP-DGT-SPRINT.md
│   ├── adminlaunchplan.md
│   ├── projectlaunchplan.md
│   └── userprofilepolishplan.md
├── OPTIMIZATION_SUMMARY.md
├── README-FORUM.md
├── README.md
├── UI_Wiring_Audit_Report.md
├── archive
│   └── server
│       └── middleware
├── attached_assets
│   ├── IMG_5701.png
│   ├── IMG_5702.png
│   ├── IMG_5703.jpeg
│   ├── IMG_5704.png
│   ├── IMG_5706.png
│   ├── IMG_5707.png
│   ├── IMG_5709.png
│   ├── IMG_5710.png
│   └── generated-icon.png
├── client
│   ├── README.md
│   ├── index.html
│   ├── public
│   │   └── images
│   │       ├── Dgen.PNG
│   │       └── profile-background.png
│   ├── src
│   │   ├── App.tsx
│   │   ├── components
│   │   │   ├── ErrorBoundary.tsx
│   │   │   ├── admin
│   │   │   │   ├── admin-sidebar.tsx
│   │   │   │   ├── cooldown-settings.tsx
│   │   │   │   ├── simple-admin-sidebar.tsx
│   │   │   │   ├── simple-menu.tsx
│   │   │   │   └── wallet
│   │   │   │       └── mock-webhook-trigger.tsx
│   │   │   ├── auth
│   │   │   │   ├── login-form.tsx
│   │   │   │   ├── protected-route.tsx
│   │   │   │   └── register-form.tsx
│   │   │   ├── dev
│   │   │   │   └── dev-role-switcher.tsx
│   │   │   ├── economy
│   │   │   │   ├── badges
│   │   │   │   │   ├── BadgeShowcase.tsx
│   │   │   │   │   └── UserBadgesDisplay.tsx
│   │   │   │   ├── styles
│   │   │   │   │   └── wallet-animations.css
│   │   │   │   ├── wallet
│   │   │   │   │   ├── TransactionSheet.tsx
│   │   │   │   │   ├── WalletSheet.tsx
│   │   │   │   │   ├── animated-balance.tsx
│   │   │   │   │   ├── buy-dgt-button.tsx
│   │   │   │   │   ├── deposit-button.tsx
│   │   │   │   │   ├── rain-button.tsx
│   │   │   │   │   ├── tip-button.tsx
│   │   │   │   │   ├── transaction-history.tsx
│   │   │   │   │   ├── wallet-address-display.tsx
│   │   │   │   │   ├── wallet-balance-display.tsx
│   │   │   │   │   ├── wallet-balance.tsx
│   │   │   │   │   ├── wallet-modal-v2.tsx
│   │   │   │   │   └── withdraw-button.tsx
│   │   │   │   ├── wallet-display.tsx
│   │   │   │   ├── wallet-modal-v2.tsx
│   │   │   │   └── xp
│   │   │   │       ├── LevelBadge.tsx
│   │   │   │       ├── LevelUpNotification.tsx
│   │   │   │       ├── TitleSelector.tsx
│   │   │   │       ├── XPHistoryLog.tsx
│   │   │   │       └── XPProgressBar.tsx
│   │   │   ├── editor
│   │   │   │   ├── enhanced-gif-picker.tsx
│   │   │   │   ├── gif-picker.tsx
│   │   │   │   ├── rich-text-editor.tsx
│   │   │   │   └── suggestion.ts
│   │   │   ├── forum
│   │   │   │   ├── CanonicalZoneGrid.tsx
│   │   │   │   ├── ShareButton.tsx
│   │   │   │   ├── ShopCard.tsx
│   │   │   │   ├── SolveBadge.tsx
│   │   │   │   ├── ThreadAuthor.tsx
│   │   │   │   ├── UserLevelDisplay.tsx
│   │   │   │   ├── ZoneCard.tsx
│   │   │   │   ├── breadcrumb-nav.tsx
│   │   │   │   ├── category-card.tsx
│   │   │   │   ├── create-thread-button.tsx
│   │   │   │   ├── forum-card.tsx
│   │   │   │   ├── forum-category-card.tsx
│   │   │   │   ├── forum-filters.tsx
│   │   │   │   ├── forum-guidelines.tsx
│   │   │   │   ├── forum-search.tsx
│   │   │   │   ├── post-card.tsx
│   │   │   │   ├── prefix-badge.tsx
│   │   │   │   ├── tag-input.tsx
│   │   │   │   ├── thread-card.tsx
│   │   │   │   └── zone-group.tsx
│   │   │   ├── identity
│   │   │   │   └── path-progress.tsx
│   │   │   ├── layout
│   │   │   │   ├── ProfileBackground.tsx
│   │   │   │   ├── SidebarNavigation.tsx
│   │   │   │   ├── announcement-ticker.css
│   │   │   │   ├── announcement-ticker.tsx
│   │   │   │   ├── hero-section.tsx
│   │   │   │   ├── sidebar.tsx
│   │   │   │   ├── site-footer.tsx
│   │   │   │   ├── site-header.tsx
│   │   │   │   └── site-layout-wrapper.tsx
│   │   │   ├── messages
│   │   │   │   ├── WhisperButton.tsx
│   │   │   │   ├── WhisperModal.tsx
│   │   │   │   ├── WhispersInbox.tsx
│   │   │   │   └── icons
│   │   │   │       └── MessageSquareWave.tsx
│   │   │   ├── missions
│   │   │   │   ├── DailyMissions.tsx
│   │   │   │   └── MissionsWidget.tsx
│   │   │   ├── mod
│   │   │   │   ├── mod-layout.tsx
│   │   │   │   └── mod-sidebar.tsx
│   │   │   ├── navigation
│   │   │   │   ├── mobile-nav-bar.tsx
│   │   │   │   └── nav-item.tsx
│   │   │   ├── paths
│   │   │   │   ├── path-progress.tsx
│   │   │   │   └── user-paths-display.tsx
│   │   │   ├── payment
│   │   │   │   ├── PaymentForm.tsx
│   │   │   │   └── StripeElementsWrapper.tsx
│   │   │   ├── platform-energy
│   │   │   │   ├── featured-threads
│   │   │   │   │   └── featured-threads-slider.tsx
│   │   │   │   ├── hot-threads
│   │   │   │   │   └── hot-threads-list.tsx
│   │   │   │   ├── index.ts
│   │   │   │   ├── leaderboards
│   │   │   │   │   └── weekly-leaderboard.tsx
│   │   │   │   ├── recent-posts
│   │   │   │   │   └── recent-posts-feed.tsx
│   │   │   │   └── stats
│   │   │   │       └── platform-stats-widget.tsx
│   │   │   ├── preferences
│   │   │   │   ├── PreferencesCard.tsx
│   │   │   │   ├── PreferencesGroup.tsx
│   │   │   │   ├── PreferencesInput.tsx
│   │   │   │   ├── PreferencesSelect.tsx
│   │   │   │   ├── PreferencesTextarea.tsx
│   │   │   │   ├── PreferencesToggle.tsx
│   │   │   │   ├── account-preferences.tsx
│   │   │   │   ├── display-preferences.tsx
│   │   │   │   ├── notification-preferences.tsx
│   │   │   │   ├── profile-preferences.tsx
│   │   │   │   └── session-preferences.tsx
│   │   │   ├── profile
│   │   │   │   ├── CosmeticControlPanel.tsx
│   │   │   │   ├── ProfileEditor.tsx
│   │   │   │   ├── ProfileSkeleton.tsx
│   │   │   │   ├── SignatureRenderer.tsx
│   │   │   │   ├── UserBadges.tsx
│   │   │   │   ├── UserTitles.tsx
│   │   │   │   ├── XPProfileSection.tsx
│   │   │   │   ├── XPProgressBar.tsx
│   │   │   │   └── XpLogView.tsx
│   │   │   ├── shop
│   │   │   │   ├── ShopItem.tsx
│   │   │   │   ├── purchase-modal.tsx
│   │   │   │   ├── shop-categories-tabs.tsx
│   │   │   │   ├── shop-header.tsx
│   │   │   │   ├── shop-item-card.tsx
│   │   │   │   └── shop-item-grid.tsx
│   │   │   ├── shoutbox
│   │   │   │   ├── README.md
│   │   │   │   ├── ShoutboxContainer.tsx
│   │   │   │   ├── index.ts
│   │   │   │   ├── integration-example.tsx
│   │   │   │   ├── positioned-shoutbox.tsx
│   │   │   │   ├── shoutbox-help-command.tsx
│   │   │   │   ├── shoutbox-message-styles.tsx
│   │   │   │   ├── shoutbox-position-selector.tsx
│   │   │   │   ├── shoutbox-rain-notification.tsx
│   │   │   │   └── shoutbox-widget.tsx
│   │   │   ├── sidebar
│   │   │   │   ├── leaderboard-widget.tsx
│   │   │   │   └── wallet-summary-widget.tsx
│   │   │   ├── ui
│   │   │   │   ├── SeoHead.tsx
│   │   │   │   ├── accordion.tsx
│   │   │   │   ├── alert-dialog.tsx
│   │   │   │   ├── alert.tsx
│   │   │   │   ├── animated-logo.tsx
│   │   │   │   ├── aspect-ratio.tsx
│   │   │   │   ├── avatar.tsx
│   │   │   │   ├── badge.tsx
│   │   │   │   ├── bookmark-button.tsx
│   │   │   │   ├── breadcrumb.tsx
│   │   │   │   ├── button.tsx
│   │   │   │   ├── calendar.tsx
│   │   │   │   ├── candlestick-menu.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── carousel.tsx
│   │   │   │   ├── chart.tsx
│   │   │   │   ├── checkbox.tsx
│   │   │   │   ├── collapsible.tsx
│   │   │   │   ├── command.tsx
│   │   │   │   ├── context-menu.tsx
│   │   │   │   ├── dialog.tsx
│   │   │   │   ├── drawer.tsx
│   │   │   │   ├── dropdown-menu.tsx
│   │   │   │   ├── error-display.tsx
│   │   │   │   ├── feature-gate.tsx
│   │   │   │   ├── form.tsx
│   │   │   │   ├── hamburger.tsx
│   │   │   │   ├── hover-card.tsx
│   │   │   │   ├── input-otp.tsx
│   │   │   │   ├── input.tsx
│   │   │   │   ├── label.tsx
│   │   │   │   ├── loader.tsx
│   │   │   │   ├── menu.tsx
│   │   │   │   ├── menubar.tsx
│   │   │   │   ├── navigation-menu.tsx
│   │   │   │   ├── pagination.tsx
│   │   │   │   ├── popover.tsx
│   │   │   │   ├── progress.tsx
│   │   │   │   ├── radio-group.tsx
│   │   │   │   ├── reactions-bar.tsx
│   │   │   │   ├── resizable.tsx
│   │   │   │   ├── scroll-area.tsx
│   │   │   │   ├── select.tsx
│   │   │   │   ├── separator.tsx
│   │   │   │   ├── sheet.tsx
│   │   │   │   ├── sidebar.tsx
│   │   │   │   ├── skeleton.tsx
│   │   │   │   ├── slider.tsx
│   │   │   │   ├── switch.tsx
│   │   │   │   ├── table.tsx
│   │   │   │   ├── tabs.tsx
│   │   │   │   ├── tag-badge.tsx
│   │   │   │   ├── textarea.tsx
│   │   │   │   ├── toast.tsx
│   │   │   │   ├── toaster.tsx
│   │   │   │   ├── toggle-group.tsx
│   │   │   │   ├── toggle.tsx
│   │   │   │   ├── tooltip-utils.tsx
│   │   │   │   ├── tooltip.tsx
│   │   │   │   └── user-badge.tsx
│   │   │   ├── users
│   │   │   │   ├── ActiveMembersWidget.tsx
│   │   │   │   ├── Avatar.tsx
│   │   │   │   ├── UserCard.tsx
│   │   │   │   ├── UserDirectoryTable.tsx
│   │   │   │   ├── UserFilters.tsx
│   │   │   │   ├── Username.tsx
│   │   │   │   ├── framed-avatar.tsx
│   │   │   │   ├── index.ts
│   │   │   │   └── user-avatar.tsx
│   │   │   └── xp
│   │   │       ├── LevelUpModal.tsx
│   │   │       ├── XPBarTrack.tsx
│   │   │       ├── XPBarsContainer.tsx
│   │   │       ├── XpToast.tsx
│   │   │       └── xpConfig.ts
│   │   ├── config
│   │   │   └── admin-routes.ts
│   │   ├── constants
│   │   │   ├── env.ts
│   │   │   ├── routes.ts
│   │   │   └── websocket-disabled.ts
│   │   ├── contexts
│   │   │   ├── LevelUpContext.tsx
│   │   │   ├── XpToastContext.tsx
│   │   │   ├── mock-shoutbox-context.tsx
│   │   │   ├── profile-context.tsx
│   │   │   ├── safe-shoutbox-provider.tsx
│   │   │   ├── shoutbox-context.tsx
│   │   │   └── wallet-context.tsx
│   │   ├── core
│   │   │   ├── api.ts
│   │   │   ├── constants.ts
│   │   │   ├── polyfills.js
│   │   │   ├── providers.tsx
│   │   │   ├── queryClient.ts
│   │   │   └── router.tsx
│   │   ├── features
│   │   │   ├── admin
│   │   │   │   └── components
│   │   │   │       └── dashboard
│   │   │   │           ├── EngagementAnalyticsDashboard.tsx
│   │   │   │           ├── RainAnalyticsCard.tsx
│   │   │   │           ├── TippingAnalyticsCard.tsx
│   │   │   │           └── index.ts
│   │   │   ├── forum
│   │   │   │   ├── components
│   │   │   │   │   ├── CreatePostForm.tsx
│   │   │   │   │   ├── CreateThreadButton.tsx
│   │   │   │   │   ├── CreateThreadForm.tsx
│   │   │   │   │   ├── ForumHeader.tsx
│   │   │   │   │   ├── ForumListItem.tsx
│   │   │   │   │   ├── HierarchicalZoneNav.tsx
│   │   │   │   │   ├── HotThreads.tsx
│   │   │   │   │   ├── LikeButton.tsx
│   │   │   │   │   ├── PostReply.tsx
│   │   │   │   │   ├── ReplyForm.tsx
│   │   │   │   │   ├── SolveBadge.tsx
│   │   │   │   │   ├── ThreadList.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   ├── hooks
│   │   │   │   │   ├── useForumQueries.ts
│   │   │   │   │   └── useForumStructure.ts
│   │   │   │   └── services
│   │   │   │       └── forumApi.ts
│   │   │   ├── users
│   │   │   │   ├── hooks
│   │   │   │   │   ├── index.ts
│   │   │   │   │   └── useActiveUsers.ts
│   │   │   │   └── services
│   │   │   │       ├── index.ts
│   │   │   │       └── usersApi.ts
│   │   │   └── wallet
│   │   │       ├── components
│   │   │       │   ├── wallet-address-display.tsx
│   │   │       │   ├── wallet-balance-display.tsx
│   │   │       │   ├── wallet-balance.tsx
│   │   │       │   ├── wallet-display.tsx
│   │   │       │   └── wallet-modal-v2.tsx
│   │   │       ├── hooks
│   │   │       │   ├── use-wallet-modal.ts
│   │   │       │   └── use-wallet.ts
│   │   │       ├── index.ts
│   │   │       ├── pages
│   │   │       │   └── WalletPage.tsx
│   │   │       ├── services
│   │   │       │   └── wallet-api.service.ts
│   │   │       └── tests
│   │   │           └── wallet-api.test.ts
│   │   ├── hooks
│   │   │   ├── index.ts
│   │   │   ├── preferences
│   │   │   │   ├── useUpdateUserSettings.ts
│   │   │   │   └── useUserSettings.ts
│   │   │   ├── use-async-button.tsx
│   │   │   ├── use-auth.tsx
│   │   │   ├── use-debounce.ts
│   │   │   ├── use-local-storage.ts
│   │   │   ├── use-media-query.ts
│   │   │   ├── use-messages.tsx
│   │   │   ├── use-mobile.tsx
│   │   │   ├── use-pending-transactions.ts
│   │   │   ├── use-purchase-modal.tsx
│   │   │   ├── use-rain-notifications.ts
│   │   │   ├── use-rain.ts
│   │   │   ├── use-shop-items.tsx
│   │   │   ├── use-shop-ownership.tsx
│   │   │   ├── use-tip.ts
│   │   │   ├── use-toast.ts
│   │   │   ├── use-vault-items.tsx
│   │   │   ├── use-wallet-modal.ts
│   │   │   ├── use-wallet.ts
│   │   │   ├── useDgtPurchase.ts
│   │   │   ├── useFeatureGates.ts
│   │   │   ├── useMissions.ts
│   │   │   ├── useUserCosmetics.ts
│   │   │   ├── useUserInventory.ts
│   │   │   ├── useUserXP.ts
│   │   │   ├── useXP.ts
│   │   │   └── wrappers
│   │   │       └── use-auth-wrapper.ts
│   │   ├── index.css
│   │   ├── lib
│   │   │   ├── admin-route.tsx
│   │   │   ├── admin-vault-service.ts
│   │   │   ├── api-request.ts
│   │   │   ├── api.ts
│   │   │   ├── format-date.ts
│   │   │   ├── formatters.ts
│   │   │   ├── protected-route.tsx
│   │   │   ├── queryClient.ts
│   │   │   ├── rare-items-vault.ts
│   │   │   ├── safeWebSocket.ts
│   │   │   ├── utils
│   │   │   │   ├── api-helpers.ts
│   │   │   │   ├── applyPluginRewards.ts
│   │   │   │   ├── category.ts
│   │   │   │   └── cosmeticsUtils.ts
│   │   │   ├── utils.ts
│   │   │   └── wallet-service.ts
│   │   ├── main.tsx
│   │   ├── pages
│   │   │   ├── _app.tsx
│   │   │   ├── admin
│   │   │   │   ├── admin-layout.tsx
│   │   │   │   ├── airdrop.tsx
│   │   │   │   ├── announcements
│   │   │   │   │   └── index.tsx
│   │   │   │   ├── badges.tsx
│   │   │   │   ├── categories.tsx
│   │   │   │   ├── cooldowns.tsx
│   │   │   │   ├── dgt-packages.tsx
│   │   │   │   ├── edit-user.tsx
│   │   │   │   ├── emojis.tsx
│   │   │   │   ├── features
│   │   │   │   │   └── index.tsx
│   │   │   │   ├── index.tsx
│   │   │   │   ├── levels.tsx
│   │   │   │   ├── missions
│   │   │   │   │   └── index.tsx
│   │   │   │   ├── platform-settings.tsx
│   │   │   │   ├── prefixes.tsx
│   │   │   │   ├── reports
│   │   │   │   │   └── index.tsx
│   │   │   │   ├── reports.tsx
│   │   │   │   ├── shop
│   │   │   │   │   ├── edit.tsx
│   │   │   │   │   └── index.tsx
│   │   │   │   ├── stats
│   │   │   │   │   └── index.tsx
│   │   │   │   ├── tags.tsx
│   │   │   │   ├── threads.tsx
│   │   │   │   ├── tip-rain-settings.tsx
│   │   │   │   ├── transactions
│   │   │   │   │   └── index.tsx
│   │   │   │   ├── treasury.tsx
│   │   │   │   ├── user-groups.tsx
│   │   │   │   ├── user-inventory.tsx
│   │   │   │   ├── users
│   │   │   │   │   └── [userId].tsx
│   │   │   │   ├── users.tsx
│   │   │   │   ├── wallets
│   │   │   │   │   └── index.tsx
│   │   │   │   ├── xp
│   │   │   │   │   ├── adjust.tsx
│   │   │   │   │   ├── badges.tsx
│   │   │   │   │   ├── levels.tsx
│   │   │   │   │   ├── settings.tsx
│   │   │   │   │   ├── titles.tsx
│   │   │   │   │   └── user-adjustment.tsx
│   │   │   │   └── xp-settings.tsx
│   │   │   ├── auth-page.tsx
│   │   │   ├── auth.tsx
│   │   │   ├── degen-index.tsx
│   │   │   ├── forum
│   │   │   │   ├── [forum_slug].tsx
│   │   │   │   ├── [id].tsx
│   │   │   │   └── [slug].tsx
│   │   │   ├── forum-rules.tsx
│   │   │   ├── forums
│   │   │   │   ├── [forum_slug].tsx
│   │   │   │   ├── [slug].tsx
│   │   │   │   └── index.tsx
│   │   │   ├── home.tsx
│   │   │   ├── leaderboard.tsx
│   │   │   ├── missions
│   │   │   │   └── index.tsx
│   │   │   ├── mod
│   │   │   │   ├── index.tsx
│   │   │   │   ├── shoutbox.tsx
│   │   │   │   └── users.tsx
│   │   │   ├── not-found.tsx
│   │   │   ├── preferences
│   │   │   │   └── index.tsx
│   │   │   ├── profile
│   │   │   │   ├── [username].tsx
│   │   │   │   ├── xp-demo.tsx
│   │   │   │   └── xp.tsx
│   │   │   ├── profile-page.tsx
│   │   │   ├── shop-management
│   │   │   │   ├── dgt-purchase.tsx
│   │   │   │   └── purchase-success.tsx
│   │   │   ├── shop.tsx
│   │   │   ├── tags
│   │   │   │   └── [tagSlug].tsx
│   │   │   ├── threads
│   │   │   │   ├── [thread_slug].tsx
│   │   │   │   └── create.tsx
│   │   │   ├── wallet.tsx
│   │   │   ├── whispers.tsx
│   │   │   └── zones
│   │   │       ├── [slug].tsx
│   │   │       └── index.tsx
│   │   ├── payments
│   │   │   ├── ccpayment
│   │   │   │   ├── README.md
│   │   │   │   ├── ccpayment-client.ts
│   │   │   │   ├── deposit.ts
│   │   │   │   ├── index.ts
│   │   │   │   ├── swap.ts
│   │   │   │   ├── types.ts
│   │   │   │   ├── utils.ts
│   │   │   │   └── withdraw.ts
│   │   │   ├── index.ts
│   │   │   └── shared
│   │   │       └── index.ts
│   │   ├── providers
│   │   │   ├── app-provider.tsx
│   │   │   ├── app-providers.tsx
│   │   │   └── root-provider.tsx
│   │   ├── styles
│   │   │   ├── animations.css
│   │   │   ├── globals.css
│   │   │   ├── ticker.css
│   │   │   ├── wallet-animations.css
│   │   │   └── zone-themes.css
│   │   ├── types
│   │   │   ├── forum.ts
│   │   │   ├── inventory.ts
│   │   │   ├── preferences.types.ts
│   │   │   └── wallet.ts
│   │   ├── utils
│   │   │   └── forum-routing-helper.ts
│   │   └── vite-env.d.ts
│   └── tailwind.config.js
├── components.json
├── config
│   ├── README.md
│   ├── postcss.config.js
│   ├── tailwind.config.ts
│   └── vite.config.ts
├── db
│   ├── README.md
│   ├── index.ts
│   └── schema
│       ├── admin
│       │   ├── announcements.ts
│       │   ├── auditLogs.ts
│       │   ├── featureFlags.ts
│       │   ├── mediaLibrary.ts
│       │   ├── moderationActions.ts
│       │   ├── reports.ts
│       │   ├── scheduledTasks.ts
│       │   ├── seoMetadata.ts
│       │   ├── siteSettings.ts
│       │   ├── templates.ts
│       │   └── themes.ts
│       ├── core
│       │   └── enums.ts
│       ├── economy
│       │   ├── airdropRecords.ts
│       │   ├── airdropSettings.ts
│       │   ├── badges.ts
│       │   ├── dgtPackages.ts
│       │   ├── dgtPurchaseOrders.ts
│       │   ├── levels.ts
│       │   ├── postTips.ts
│       │   ├── rainEvents.ts
│       │   ├── settings.ts
│       │   ├── titles.ts
│       │   ├── transactions.ts
│       │   ├── treasurySettings.ts
│       │   ├── userBadges.ts
│       │   ├── userCommands.ts
│       │   ├── userTitles.ts
│       │   ├── vaults.ts
│       │   ├── wallets.ts
│       │   ├── withdrawalRequests.ts
│       │   ├── xpActionSettings.ts
│       │   └── xpAdjustmentLogs.ts
│       ├── forum
│       │   ├── categories.ts
│       │   ├── customEmojis.ts
│       │   ├── postDrafts.ts
│       │   ├── postLikes.ts
│       │   ├── postReactions.ts
│       │   ├── posts.ts
│       │   ├── prefixes.ts
│       │   ├── rules.ts
│       │   ├── tags.ts
│       │   ├── threadBookmarks.ts
│       │   ├── threadDrafts.ts
│       │   ├── threadFeaturePermissions.ts
│       │   ├── threadTags.ts
│       │   ├── threads.ts
│       │   └── userRuleAgreements.ts
│       ├── gamification
│       │   ├── achievements.ts
│       │   ├── leaderboards.ts
│       │   ├── missions.ts
│       │   ├── platformStats.ts
│       │   ├── userAchievements.ts
│       │   └── userMissionProgress.ts
│       ├── index.ts
│       ├── integrations
│       ├── messaging
│       │   ├── chatRooms.ts
│       │   ├── conversationParticipants.ts
│       │   ├── conversations.ts
│       │   ├── directMessages.ts
│       │   ├── messageReads.ts
│       │   ├── messages.ts
│       │   ├── onlineUsers.ts
│       │   └── shoutboxMessages.ts
│       ├── shop
│       │   ├── inventoryTransactions.ts
│       │   ├── orderItems.ts
│       │   ├── orders.ts
│       │   ├── productCategories.ts
│       │   ├── productMedia.ts
│       │   ├── products.ts
│       │   ├── signatureItems.ts
│       │   ├── userInventory.ts
│       │   └── userSignatureItems.ts
│       ├── system
│       │   ├── activityFeed.ts
│       │   ├── airdrop-records.ts
│       │   ├── analyticsEvents.ts
│       │   ├── notifications.ts
│       │   └── rateLimits.ts
│       └── user
│           ├── avatarFrames.ts
│           ├── bans.ts
│           ├── featurePermissions.ts
│           ├── passwordResetTokens.ts
│           ├── permissions.ts
│           ├── preferences.ts
│           ├── relationships.ts
│           ├── rolePermissions.ts
│           ├── roles.ts
│           ├── sessions.ts
│           ├── settingsHistory.ts
│           ├── userGroups.ts
│           ├── userRoles.ts
│           ├── users.ts
│           └── verificationTokens.ts
├── directory-tree.md
├── docs
│   ├── CCPAYMENT.md
│   ├── CODEBASE_AUDIT_FINDINGS.md
│   ├── FORUM_README.md
│   ├── README.md
│   ├── README_API.md
│   ├── RESTRUCTURE.md
│   ├── REWRITE_IMPORTS.md
│   ├── SCHEMA_REFACTOR_PLAN.md
│   ├── admin-panel-implementation-progress.md
│   ├── admin-panel-refactoring-plan.md
│   ├── archive
│   │   └── FORUM_PRIMARY_ZONES_REFACTOR_PLAN.md
│   ├── audit-findings.md
│   ├── audit-summary.md
│   ├── codebase-overview.md
│   ├── component-tree.md
│   ├── designworkflow.md
│   ├── dgt-token-management-plan.md
│   ├── engagement
│   │   ├── rain-analytics.md
│   │   └── tipping-analytics.md
│   ├── examples
│   │   └── admin-users-query.md
│   ├── forum
│   │   ├── SETUP_GUIDE.md
│   │   ├── backend-setup-guide.md
│   │   └── canonical-zones-implementation.md
│   ├── frontend-enhancement-plan.md
│   ├── launch-readiness-audit-may-2025.md
│   ├── memory-bank
│   │   ├── activeContext.md
│   │   ├── consolidated_learnings.md
│   │   ├── productContext.md
│   │   ├── progress.md
│   │   ├── projectbrief.md
│   │   ├── raw_reflection_log.md
│   │   ├── systemPatterns.md
│   │   └── techContext.md
│   ├── refactor-tracker.md
│   ├── shop
│   │   └── README.md
│   ├── stripecustoms.md
│   ├── stripeelements.md
│   ├── ui
│   │   ├── routing-logic.md
│   │   └── zone-card-design-guidelines.md
│   ├── wallet-api-integration-plan.md
│   ├── wallet-system.md
│   ├── xp-dgt-system-implementation-plan.md
│   └── xp-system-reference.md
├── drizzle.config.ts
├── env.local
├── lib
│   └── wallet
│       └── testUtils.ts
├── migrations
│   ├── 0007_romantic_colossus.sql
│   ├── 0007_smooth_sphinx.sql
│   ├── canonical-zones-schema-update.ts
│   ├── meta
│   │   ├── 0000_snapshot.json
│   │   ├── 0001_snapshot.json
│   │   ├── 0002_snapshot.json
│   │   ├── 0003_snapshot.json
│   │   ├── 0004_snapshot.json
│   │   ├── 0005_snapshot.json
│   │   ├── 0006_snapshot.json
│   │   ├── 0007_snapshot.json
│   │   └── _journal.json
│   ├── postgres
│   │   ├── 0000_rapid_doctor_doom.sql
│   │   ├── 0001_orange_norrin_radd.sql
│   │   ├── 0002_broken_viper.sql
│   │   ├── 0003_faulty_blink.sql
│   │   └── meta
│   │       ├── 0000_snapshot.json
│   │       ├── 0001_snapshot.json
│   │       ├── 0002_snapshot.json
│   │       ├── 0003_snapshot.json
│   │       └── _journal.json
│   └── sqlite
│       └── meta
├── package-lock.json
├── package.json
├── projectBrief.md
├── scripts
│   ├── README.md
│   ├── auth
│   │   ├── auth-refactor.js
│   │   ├── auth-refactor.ts
│   │   ├── auth-standardize.ts
│   │   └── fix-auth.ts
│   ├── db
│   │   ├── add-color-theme-field.ts
│   │   ├── add_categoryid_to_thread_prefixes.ts
│   │   ├── apply-migration.ts
│   │   ├── check-levels-table.ts
│   │   ├── check-reward-tables.ts
│   │   ├── create-missing-tables.ts
│   │   ├── db-schema-summary.js
│   │   ├── dist
│   │   │   ├── scripts
│   │   │   │   └── db
│   │   │   │       └── seed-forum-categories.js
│   │   │   ├── server
│   │   │   │   └── src
│   │   │   │       └── core
│   │   │   │           ├── db.js
│   │   │   │           └── logger.js
│   │   │   └── shared
│   │   │       └── schema.js
│   │   ├── fix-forum-relationships.ts
│   │   ├── initialize-giphy-settings.ts
│   │   ├── initialize-xp-system.ts
│   │   ├── neon-to-sqlite.js
│   │   ├── read-forum-categories.ts
│   │   ├── read-thread.ts
│   │   ├── reset-and-seed.ts
│   │   ├── run-db-summary.cjs
│   │   ├── seed-badges.ts
│   │   ├── seed-canonical-zones.ts
│   │   ├── seed-chat.ts
│   │   ├── seed-default-levels.ts
│   │   ├── seed-economy-settings.ts
│   │   ├── seed-forum-categories.ts
│   │   ├── seed-shop.ts
│   │   ├── seed-threads.ts
│   │   ├── seed-treasury.ts
│   │   ├── seed-users.ts
│   │   ├── seed-vaults.ts
│   │   ├── seed-xp-actions.ts
│   │   ├── update-forum-slugs.ts
│   │   ├── update-levels-table.ts
│   │   ├── update-users-table.ts
│   │   ├── utils
│   │   │   ├── schema.ts
│   │   │   └── seedUtils.ts
│   │   └── verify-neon-connection.ts
│   ├── fix-aliases
│   │   ├── fix-db-schema-alias.ts
│   │   ├── rewrite-core-db-imports.ts
│   │   └── rewrite-schema-imports.ts
│   ├── fix-db-alias.ts
│   ├── fix-db-schema-alias.ts
│   ├── ops
│   │   └── setup-xp-system.sh
│   ├── refactor
│   │   ├── listUnconsolidatedServerFiles.ts
│   │   └── updateImportPaths.ts
│   ├── seed
│   │   ├── run-username-colors.ts
│   │   └── shop
│   │       └── username-colors.ts
│   ├── templates
│   │   ├── transaction-domain-template.ts
│   │   └── vault-domain-template.ts
│   ├── test-admin-xp.js
│   ├── test-forum-api.ts
│   ├── testing
│   │   ├── admin-api-tests.sh
│   │   ├── test-forum-endpoints.js
│   │   ├── test-mock-requests.js
│   │   ├── test-xp-actions.js
│   │   ├── test-xp-system.ts
│   │   ├── validate-domain-migration.sh
│   │   └── validate-routes.js
│   ├── tools
│   │   ├── archive-legacy-admin.sh
│   │   ├── check-imports.ts
│   │   ├── generate-tree.js
│   │   ├── move-deprecated-admin-files.sh
│   │   ├── update-admin-imports-dry-run.js
│   │   └── update-admin-imports.js
│   ├── verify-imports.ts
│   └── wallet
│       ├── archive-deprecated-wallet-files.js
│       ├── migrate-wallet-components.ts
│       ├── migrate-wallet-imports.ts
│       └── wallet-refactor-migration.ts
├── server
│   ├── README.md
│   ├── config
│   │   └── loadEnv.ts
│   ├── index.ts
│   ├── migrations
│   │   ├── 20250510_create_xp_adjustment_logs.ts
│   │   ├── 20250512_create_xp_action_logs.ts
│   │   ├── 20250513_create_xp_action_settings.ts
│   │   ├── add-daily-xp-tracking.ts
│   │   ├── add-dgt-packages-table.ts
│   │   ├── add-dgt-purchase-orders-table.ts
│   │   ├── archive
│   │   │   ├── README.md
│   │   │   └── run-tip-rain.ts
│   │   └── xp-clout-levels-migration.ts
│   ├── routes
│   │   └── api
│   ├── routes.ts
│   ├── services
│   ├── src
│   │   ├── app.ts
│   │   ├── core
│   │   │   ├── db.ts
│   │   │   ├── errors.ts
│   │   │   ├── logger.ts
│   │   │   ├── middleware.ts
│   │   │   ├── rate-limiter.ts
│   │   │   ├── routes
│   │   │   │   └── api
│   │   │   │       ├── index.ts
│   │   │   │       └── status.ts
│   │   │   ├── vite.ts
│   │   │   └── wallet-validators.ts
│   │   ├── cron
│   │   │   └── mission-reset.ts
│   │   ├── domains
│   │   │   ├── admin
│   │   │   │   ├── admin.controller.ts
│   │   │   │   ├── admin.errors.ts
│   │   │   │   ├── admin.middleware.ts
│   │   │   │   ├── admin.routes.ts
│   │   │   │   ├── admin.service.ts
│   │   │   │   └── sub-domains
│   │   │   │       ├── airdrop
│   │   │   │       │   ├── airdrop.controller.ts
│   │   │   │       │   ├── airdrop.routes.ts
│   │   │   │       │   └── airdrop.service.ts
│   │   │   │       ├── analytics
│   │   │   │       │   ├── analytics.controller.ts
│   │   │   │       │   ├── analytics.routes.ts
│   │   │   │       │   ├── analytics.service.ts
│   │   │   │       │   ├── analytics.validators.ts
│   │   │   │       │   ├── engagement
│   │   │   │       │   │   ├── rain-analytics.controller.ts
│   │   │   │       │   │   ├── rain-analytics.routes.ts
│   │   │   │       │   │   ├── rain-analytics.service.ts
│   │   │   │       │   │   ├── tipping-analytics.controller.ts
│   │   │   │       │   │   ├── tipping-analytics.routes.ts
│   │   │   │       │   │   └── tipping-analytics.service.ts
│   │   │   │       │   ├── routes
│   │   │   │       │   │   └── stats.routes.ts
│   │   │   │       │   └── services
│   │   │   │       │       └── platformStats.service.ts
│   │   │   │       ├── announcements
│   │   │   │       │   ├── announcements.routes.ts
│   │   │   │       │   ├── controllers
│   │   │   │       │   │   └── announcements.controller.ts
│   │   │   │       │   ├── index.ts
│   │   │   │       │   └── services
│   │   │   │       │       └── announcements.service.ts
│   │   │   │       ├── forum
│   │   │   │       │   ├── forum.controller.ts
│   │   │   │       │   ├── forum.routes.ts
│   │   │   │       │   ├── forum.service.ts
│   │   │   │       │   └── forum.validators.ts
│   │   │   │       ├── reports
│   │   │   │       │   ├── reports.controller.ts
│   │   │   │       │   ├── reports.routes.ts
│   │   │   │       │   ├── reports.service.ts
│   │   │   │       │   └── reports.validators.ts
│   │   │   │       ├── settings
│   │   │   │       │   ├── settings.controller.ts
│   │   │   │       │   ├── settings.routes.ts
│   │   │   │       │   ├── settings.service.ts
│   │   │   │       │   └── settings.validators.ts
│   │   │   │       ├── shop
│   │   │   │       │   ├── shop.admin.controller.ts
│   │   │   │       │   └── shop.admin.routes.ts
│   │   │   │       ├── treasury
│   │   │   │       │   ├── treasury.controller.ts
│   │   │   │       │   ├── treasury.routes.ts
│   │   │   │       │   ├── treasury.service.ts
│   │   │   │       │   └── treasury.validators.ts
│   │   │   │       ├── user-groups
│   │   │   │       │   ├── user-groups.controller.ts
│   │   │   │       │   ├── user-groups.routes.ts
│   │   │   │       │   ├── user-groups.service.ts
│   │   │   │       │   └── user-groups.validators.ts
│   │   │   │       ├── users
│   │   │   │       │   ├── inventory.admin.controller.ts
│   │   │   │       │   ├── inventory.admin.routes.ts
│   │   │   │       │   ├── users.controller.ts
│   │   │   │       │   ├── users.routes.ts
│   │   │   │       │   └── users.service.ts
│   │   │   │       └── xp
│   │   │   │           ├── xp-actions.controller.ts
│   │   │   │           ├── xp.controller.ts
│   │   │   │           ├── xp.routes.ts
│   │   │   │           └── xp.service.ts
│   │   │   ├── auth
│   │   │   │   ├── auth.routes.ts
│   │   │   │   ├── controllers
│   │   │   │   │   └── auth.controller.ts
│   │   │   │   ├── index.ts
│   │   │   │   ├── middleware
│   │   │   │   │   └── auth.middleware.ts
│   │   │   │   └── services
│   │   │   │       └── auth.service.ts
│   │   │   ├── ccpayment
│   │   │   │   ├── controllers
│   │   │   │   │   └── index.ts
│   │   │   │   ├── index.ts
│   │   │   │   ├── routes
│   │   │   │   │   └── ccpayment
│   │   │   │   │       ├── deposit.ts
│   │   │   │   │       ├── index.ts
│   │   │   │   │       ├── webhook.ts
│   │   │   │   │       └── withdraw.ts
│   │   │   │   ├── services
│   │   │   │   │   └── ccpayment-client.ts
│   │   │   │   └── types.ts
│   │   │   ├── ccpayment-webhook
│   │   │   │   ├── ccpayment-webhook.controller.ts
│   │   │   │   ├── ccpayment-webhook.routes.ts
│   │   │   │   └── ccpayment-webhook.service.ts
│   │   │   ├── editor
│   │   │   │   └── editor.routes.ts
│   │   │   ├── engagement
│   │   │   │   ├── airdrop
│   │   │   │   │   ├── airdrop.controller.ts
│   │   │   │   │   ├── airdrop.routes.ts
│   │   │   │   │   └── airdrop.service.ts
│   │   │   │   ├── engagement.service.ts
│   │   │   │   ├── rain
│   │   │   │   │   ├── rain.controller.ts
│   │   │   │   │   ├── rain.routes.ts
│   │   │   │   │   └── rain.service.ts
│   │   │   │   ├── tip
│   │   │   │   │   ├── tip.controller.ts
│   │   │   │   │   ├── tip.routes.ts
│   │   │   │   │   └── tip.service.ts
│   │   │   │   └── vault
│   │   │   │       ├── vault.controller.ts
│   │   │   │       ├── vault.routes.ts
│   │   │   │       └── vault.service.ts
│   │   │   ├── feature-gates
│   │   │   │   ├── feature-gates.controller.ts
│   │   │   │   ├── feature-gates.routes.ts
│   │   │   │   └── feature-gates.service.ts
│   │   │   ├── forum
│   │   │   │   ├── forum.controller.ts
│   │   │   │   ├── forum.routes.ts
│   │   │   │   ├── forum.service.ts
│   │   │   │   └── rules
│   │   │   │       └── rules.routes.ts
│   │   │   ├── messaging
│   │   │   │   └── message.routes.ts
│   │   │   ├── missions
│   │   │   │   ├── missions.admin.controller.ts
│   │   │   │   ├── missions.admin.routes.ts
│   │   │   │   ├── missions.controller.ts
│   │   │   │   ├── missions.routes.ts
│   │   │   │   └── missions.service.ts
│   │   │   ├── path
│   │   │   │   ├── controllers
│   │   │   │   │   └── index.ts
│   │   │   │   ├── index.ts
│   │   │   │   ├── routes
│   │   │   │   ├── services
│   │   │   │   │   └── path-service.ts
│   │   │   │   └── types.ts
│   │   │   ├── paths
│   │   │   │   └── paths.routes.ts
│   │   │   ├── preferences
│   │   │   │   ├── preferences.routes.ts
│   │   │   │   ├── preferences.service.ts
│   │   │   │   └── preferences.validators.ts
│   │   │   ├── profile
│   │   │   │   ├── profile.routes.ts
│   │   │   │   ├── signature.routes.ts
│   │   │   │   └── signature.service.ts
│   │   │   ├── shop
│   │   │   │   └── shop.routes.ts
│   │   │   ├── shoutbox
│   │   │   │   └── shoutbox.routes.ts
│   │   │   ├── social
│   │   │   │   └── relationships.routes.ts
│   │   │   ├── tipping
│   │   │   │   ├── controllers
│   │   │   │   │   └── index.ts
│   │   │   │   ├── index.ts
│   │   │   │   ├── routes
│   │   │   │   ├── services
│   │   │   │   │   └── tip-service-ccpayment.ts
│   │   │   │   └── types.ts
│   │   │   ├── treasury
│   │   │   │   └── treasury.routes.ts
│   │   │   ├── wallet
│   │   │   │   ├── ccpayment.service.ts
│   │   │   │   ├── dgt.service.ts
│   │   │   │   ├── wallet-api-tests.ts
│   │   │   │   ├── wallet.constants.ts
│   │   │   │   ├── wallet.controller.ts
│   │   │   │   ├── wallet.routes.ts
│   │   │   │   ├── wallet.service.ts
│   │   │   │   └── wallet.validators.ts
│   │   │   └── xp
│   │   │       ├── controllers
│   │   │       │   └── index.ts
│   │   │       ├── events
│   │   │       │   └── xp.events.ts
│   │   │       ├── index.ts
│   │   │       ├── routes
│   │   │       ├── services
│   │   │       │   ├── xp-clout-service.ts
│   │   │       │   └── xp-level-service.ts
│   │   │       ├── types.ts
│   │   │       ├── xp-actions-schema.ts
│   │   │       ├── xp-actions.controller.ts
│   │   │       ├── xp-actions.ts
│   │   │       ├── xp.admin.routes.ts
│   │   │       ├── xp.controller.ts
│   │   │       ├── xp.events.ts
│   │   │       ├── xp.routes.ts
│   │   │       └── xp.service.ts
│   │   ├── lib
│   │   │   └── db.ts
│   │   ├── middleware
│   │   │   ├── auth.ts
│   │   │   ├── authenticate.ts
│   │   │   ├── mission-progress.ts
│   │   │   ├── validate-request.ts
│   │   │   └── validate.ts
│   │   ├── routes
│   │   │   └── api
│   │   │       └── index.ts
│   │   └── utils
│   │       ├── db-utils.ts
│   │       └── environment.ts
│   ├── storage.ts
│   ├── test
│   │   ├── ccpayment-webhook
│   │   │   └── webhook.test.ts
│   │   ├── engagement
│   │   │   └── tip.test.ts
│   │   └── wallet
│   │       └── dgt-service.test.ts
│   ├── utils
│   │   ├── dgt-treasury-init.ts
│   │   ├── dgt-wallet-integration.ts
│   │   ├── path-utils.ts
│   │   ├── platform-energy.ts
│   │   ├── seed-dev-user.ts
│   │   ├── shop-utils.ts
│   │   ├── slugify.ts
│   │   ├── task-scheduler.ts
│   │   ├── wallet-utils.ts
│   │   └── walletEngine.ts
│   └── vite.ts
├── shared
│   ├── README.md
│   ├── constants.ts
│   ├── path-config.ts
│   ├── signature
│   │   └── SignatureTierConfig.ts
│   ├── types.ts
│   └── validators
│       └── admin.ts
└── tsconfig.json

238 directories, 876 files
