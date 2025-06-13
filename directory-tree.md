.
├── .clinerules
│   └── database-cheatsheet.mdc
├── .cursor
│   └── rules
│       ├── admin-structure.mdc
│       ├── api-client-pattern.mdc
│       ├── cheat-codes.mdc
│       ├── context-mup-protocol.mdc
│       ├── import-patterns.mdc
│       ├── naming-rules.mdc
│       ├── navigation-helper.mdc
│       ├── npm-script-safety.mdc
│       ├── riper-5.mdc
│       ├── route-deprecation.mdc
│       ├── rule-evolution.mdc
│       ├── schema-consistency.mdc
│       ├── schema-sync-rules.mdc
│       └── update-history.mdc
├── .github
│   └── workflows
├── .gitignore
├── .prettierignore
├── .prettierrc
├── .tscache
├── MVP-SPRINTS
├── client
│   ├── index.html
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
│   │   │   ├── auth
│   │   │   │   ├── login-form.tsx
│   │   │   │   ├── protected-route.tsx
│   │   │   │   └── register-form.tsx
│   │   │   ├── dev
│   │   │   │   └── dev-role-switcher.tsx
│   │   │   ├── economy
│   │   │   │   ├── badges
│   │   │   │   ├── styles
│   │   │   │   ├── wallet
│   │   │   │   ├── wallet-display.tsx
│   │   │   │   ├── wallet-modal-v2.tsx
│   │   │   │   └── xp
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
│   │   │   ├── missions
│   │   │   │   ├── DailyMissions.tsx
│   │   │   │   └── MissionsWidget.tsx
│   │   │   ├── mod
│   │   │   │   ├── mod-layout.tsx
│   │   │   │   └── mod-sidebar.tsx
│   │   │   ├── navigation
│   │   │   │   ├── mobile-nav-bar.tsx
│   │   │   │   └── nav-item.tsx
│   │   │   ├── notifications
│   │   │   │   └── NotificationPanel.tsx
│   │   │   ├── paths
│   │   │   │   ├── path-progress.tsx
│   │   │   │   └── user-paths-display.tsx
│   │   │   ├── payment
│   │   │   │   ├── PaymentForm.tsx
│   │   │   │   └── StripeElementsWrapper.tsx
│   │   │   ├── platform-energy
│   │   │   │   ├── featured-threads
│   │   │   │   ├── hot-threads
│   │   │   │   ├── index.ts
│   │   │   │   ├── leaderboards
│   │   │   │   ├── recent-posts
│   │   │   │   └── stats
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
│   │   │   ├── admin-routes.ts
│   │   │   └── ui.config.ts
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
│   │   │   │   ├── components
│   │   │   │   └── services
│   │   │   ├── forum
│   │   │   │   ├── components
│   │   │   │   ├── hooks
│   │   │   │   └── services
│   │   │   ├── users
│   │   │   │   ├── hooks
│   │   │   │   └── services
│   │   │   └── wallet
│   │   │       ├── components
│   │   │       ├── hooks
│   │   │       ├── index.ts
│   │   │       ├── pages
│   │   │       ├── services
│   │   │       └── tests
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
│   │   │   ├── use-notifications.ts
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
│   │   │   │   └── cosmeticsUtils.tsx
│   │   │   ├── utils.ts
│   │   │   └── wallet-service.ts
│   │   ├── main.tsx
│   │   ├── pages
│   │   │   ├── _app.tsx
│   │   │   ├── admin
│   │   │   │   ├── admin-layout.tsx
│   │   │   │   ├── airdrop.tsx
│   │   │   │   ├── announcements
│   │   │   │   ├── badges.tsx
│   │   │   │   ├── categories.tsx
│   │   │   │   ├── cooldowns.tsx
│   │   │   │   ├── dgt-packages.tsx
│   │   │   │   ├── edit-user.tsx
│   │   │   │   ├── emojis.tsx
│   │   │   │   ├── features
│   │   │   │   ├── index.tsx
│   │   │   │   ├── levels.tsx
│   │   │   │   ├── missions
│   │   │   │   ├── platform-settings.tsx
│   │   │   │   ├── prefixes.tsx
│   │   │   │   ├── reports
│   │   │   │   ├── reports.tsx
│   │   │   │   ├── shop
│   │   │   │   ├── stats
│   │   │   │   ├── tags.tsx
│   │   │   │   ├── threads.tsx
│   │   │   │   ├── tip-rain-settings.tsx
│   │   │   │   ├── transactions
│   │   │   │   ├── treasury.tsx
│   │   │   │   ├── ui-config.tsx
│   │   │   │   ├── user-groups.tsx
│   │   │   │   ├── user-inventory.tsx
│   │   │   │   ├── users
│   │   │   │   ├── users.tsx
│   │   │   │   ├── wallets
│   │   │   │   ├── xp
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
│   │   │   ├── notifications.ts
│   │   │   ├── preferences.types.ts
│   │   │   └── wallet.ts
│   │   ├── utils
│   │   │   └── forum-routing-helper.ts
│   │   └── vite-env.d.ts
│   └── tailwind.config.js
├── config
│   ├── postcss.config.js
│   ├── tailwind.config.ts
│   └── vite.config.ts
├── db
│   ├── index.ts
│   ├── schema
│   │   ├── admin
│   │   │   ├── announcements.ts
│   │   │   ├── auditLogs.ts
│   │   │   ├── featureFlags.ts
│   │   │   ├── mediaLibrary.ts
│   │   │   ├── moderationActions.ts
│   │   │   ├── reports.ts
│   │   │   ├── scheduledTasks.ts
│   │   │   ├── seoMetadata.ts
│   │   │   ├── siteSettings.ts
│   │   │   ├── templates.ts
│   │   │   ├── themes.ts
│   │   │   └── uiConfig.ts
│   │   ├── core
│   │   │   └── enums.ts
│   │   ├── economy
│   │   │   ├── airdropRecords.ts
│   │   │   ├── airdropSettings.ts
│   │   │   ├── badges.ts
│   │   │   ├── dgtPackages.ts
│   │   │   ├── dgtPurchaseOrders.ts
│   │   │   ├── levels.ts
│   │   │   ├── postTips.ts
│   │   │   ├── rainEvents.ts
│   │   │   ├── settings.ts
│   │   │   ├── titles.ts
│   │   │   ├── transactions.ts
│   │   │   ├── treasurySettings.ts
│   │   │   ├── userBadges.ts
│   │   │   ├── userCommands.ts
│   │   │   ├── userTitles.ts
│   │   │   ├── vaults.ts
│   │   │   ├── wallets.ts
│   │   │   ├── withdrawalRequests.ts
│   │   │   ├── xpActionSettings.ts
│   │   │   └── xpAdjustmentLogs.ts
│   │   ├── forum
│   │   │   ├── categories.ts
│   │   │   ├── customEmojis.ts
│   │   │   ├── postDrafts.ts
│   │   │   ├── postLikes.ts
│   │   │   ├── postReactions.ts
│   │   │   ├── posts.ts
│   │   │   ├── prefixes.ts
│   │   │   ├── rules.ts
│   │   │   ├── tags.ts
│   │   │   ├── threadBookmarks.ts
│   │   │   ├── threadDrafts.ts
│   │   │   ├── threadFeaturePermissions.ts
│   │   │   ├── threadTags.ts
│   │   │   ├── threads.ts
│   │   │   └── userRuleAgreements.ts
│   │   ├── gamification
│   │   │   ├── achievements.ts
│   │   │   ├── leaderboards.ts
│   │   │   ├── missions.ts
│   │   │   ├── platformStats.ts
│   │   │   ├── userAchievements.ts
│   │   │   └── userMissionProgress.ts
│   │   ├── index.ts
│   │   ├── integrations
│   │   ├── messaging
│   │   │   ├── chatRooms.ts
│   │   │   ├── conversationParticipants.ts
│   │   │   ├── conversations.ts
│   │   │   ├── directMessages.ts
│   │   │   ├── messageReads.ts
│   │   │   ├── messages.ts
│   │   │   ├── onlineUsers.ts
│   │   │   └── shoutboxMessages.ts
│   │   ├── shop
│   │   │   ├── inventoryTransactions.ts
│   │   │   ├── orderItems.ts
│   │   │   ├── orders.ts
│   │   │   ├── productCategories.ts
│   │   │   ├── productMedia.ts
│   │   │   ├── products.ts
│   │   │   ├── signatureItems.ts
│   │   │   ├── userInventory.ts
│   │   │   └── userSignatureItems.ts
│   │   ├── system
│   │   │   ├── activityFeed.ts
│   │   │   ├── airdrop-records.ts
│   │   │   ├── analyticsEvents.ts
│   │   │   ├── notifications.ts
│   │   │   └── rateLimits.ts
│   │   └── user
│   │       ├── avatarFrames.ts
│   │       ├── bans.ts
│   │       ├── featurePermissions.ts
│   │       ├── passwordResetTokens.ts
│   │       ├── permissions.ts
│   │       ├── preferences.ts
│   │       ├── relationships.ts
│   │       ├── rolePermissions.ts
│   │       ├── roles.ts
│   │       ├── sessions.ts
│   │       ├── settingsHistory.ts
│   │       ├── userGroups.ts
│   │       ├── userRoles.ts
│   │       ├── users.ts
│   │       └── verificationTokens.ts
│   └── types
│       ├── emoji.types.ts
│       ├── forum.types.ts
│       └── user.types.ts
├── docs
│   ├── engagement
│   ├── examples
│   ├── forum
│   ├── memory-bank
│   ├── shop
│   └── ui
├── drizzle.config.ts
├── env.local
├── lib
│   └── wallet
│       └── testUtils.ts
├── scripts
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
│   │   ├── seed-ui-config-quotes.ts
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
│   ├── ops
│   │   └── setup-xp-system.sh
│   ├── seed
│   │   ├── run-username-colors.ts
│   │   └── shop
│   │       └── username-colors.ts
│   ├── templates
│   │   ├── transaction-domain-template.ts
│   │   └── vault-domain-template.ts
│   ├── test-admin-xp.js
│   ├── test-ci-readiness.ts
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
│   │   └── generate-tree.js
│   ├── validate-everything.ts
│   ├── validate-imports.ts
│   └── wallet
│       ├── archive-deprecated-wallet-files.js
│       ├── migrate-wallet-components.ts
│       ├── migrate-wallet-imports.ts
│       └── wallet-refactor-migration.ts
├── server
│   ├── config
│   │   └── loadEnv.ts
│   ├── index.ts
│   ├── routes
│   │   └── api
│   │       └── ccpayment
│   │           ├── deposit.ts
│   │           ├── index.ts
│   │           ├── webhook.ts
│   │           └── withdraw.ts
│   ├── routes.ts
│   ├── services
│   │   ├── ccpayment-client.ts
│   │   ├── path-service.ts
│   │   ├── tip-service-ccpayment.ts
│   │   ├── xp-clout-service.ts
│   │   └── xp-level-service.ts
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
│   │   │   ├── auth
│   │   │   │   ├── auth.routes.ts
│   │   │   │   ├── controllers
│   │   │   │   ├── index.ts
│   │   │   │   ├── middleware
│   │   │   │   └── services
│   │   │   ├── ccpayment-webhook
│   │   │   │   ├── ccpayment-webhook.controller.ts
│   │   │   │   ├── ccpayment-webhook.routes.ts
│   │   │   │   └── ccpayment-webhook.service.ts
│   │   │   ├── editor
│   │   │   │   └── editor.routes.ts
│   │   │   ├── engagement
│   │   │   │   ├── airdrop
│   │   │   │   ├── engagement.service.ts
│   │   │   │   ├── rain
│   │   │   │   ├── tip
│   │   │   │   └── vault
│   │   │   ├── feature-gates
│   │   │   │   ├── feature-gates.controller.ts
│   │   │   │   ├── feature-gates.routes.ts
│   │   │   │   └── feature-gates.service.ts
│   │   │   ├── forum
│   │   │   │   ├── forum.controller.ts
│   │   │   │   ├── forum.routes.ts
│   │   │   │   ├── forum.service.ts
│   │   │   │   └── rules
│   │   │   ├── messaging
│   │   │   │   └── message.routes.ts
│   │   │   ├── missions
│   │   │   │   ├── missions.admin.controller.ts
│   │   │   │   ├── missions.admin.routes.ts
│   │   │   │   ├── missions.controller.ts
│   │   │   │   ├── missions.routes.ts
│   │   │   │   └── missions.service.ts
│   │   │   ├── notifications
│   │   │   │   ├── notification.routes.ts
│   │   │   │   └── notification.service.ts
│   │   │   ├── path
│   │   │   │   └── routes
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
│   │   │   │   └── routes
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
│   │   │       ├── events
│   │   │       ├── routes
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
│   │   ├── engagement
│   │   └── wallet
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
└── shared
    ├── constants.ts
    ├── path-config.ts
    ├── paths.config.ts
    ├── signature
    │   └── SignatureTierConfig.ts
    ├── types.ts
    └── validators
        └── admin.ts

194 directories, 601 files
