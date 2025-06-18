# ForumFusion Directory Structure
  
Generated on: 2025-06-18

```
├─ _audit/
│  ├─ forum/
│  │  ├─ 00-overview.md
│  │  ├─ 01-batch-1.md
│  │  ├─ 02-batch-2.md
│  │  ├─ 03-batch-3.md
│  │  ├─ 04-batch-4.md
│  │  ├─ 05-batch-5.md
│  │  ├─ 05-batch-5b-profile-polish.md
│  │  ├─ 06-integrity-plan.md
│  │  ├─ 07-user-flow-audit.md
│  │  └─ 08-consolidation-update.md
│  ├─ codebase-audit.md
│  ├─ codebase-tasks.md
│  ├─ Degentalk-X-Integration-plan.md
│  ├─ forum-audit.md
│  ├─ profile-system-ux-audit-2025-06-15.md
│  └─ profile-system-ux-implementation-plan-2025-06-15.md
├─ .clinerules/
│  ├─ available-rules.md
│  ├─ cline-continuous-improvement-protocol.md
│  ├─ cline-for-webdev-ui.md
│  ├─ database-cheatsheet.mdc
│  ├─ memory-bank.md
│  └─ self-improving-cline.md
├─ .cursor/
│  └─ rules/
│     ├─ admin-structure.mdc
│     ├─ api-client-pattern.mdc
│     ├─ cheat-codes.mdc
│     ├─ context-mup-protocol.mdc
│     ├─ id-type-consistency.mdc
│     ├─ import-patterns.mdc
│     ├─ naming-rules.mdc
│     ├─ navigation-helper.mdc
│     ├─ npm-script-safety.mdc
│     ├─ riper-5.mdc
│     ├─ route-deprecation.mdc
│     ├─ rule-evolution.mdc
│     ├─ schema-consistency.mdc
│     ├─ schema-sync-rules.mdc
│     └─ update-history.mdc
├─ .github/
│  └─ workflows/
│     └─ validate-codebase.yml
├─ .tscache/
│  └─ .tsbuildinfo
├─ archive/
│  ├─ client/
│  │  └─ pages/
│  │     └─ admin/
│  │        ├─ badges.tsx
│  │        ├─ cooldowns.tsx
│  │        ├─ edit-user.tsx
│  │        ├─ forum-management.tsx
│  │        ├─ levels.tsx
│  │        ├─ platform-settings.tsx
│  │        ├─ user-inventory.tsx
│  │        └─ xp-settings.tsx
│  ├─ server/
│  │  ├─ routes/
│  │  │  └─ api/
│  │  │     └─ ccpayment/
│  │  │        ... (max depth reached)
│  │  └─ src/
│  │     └─ domains/
│  │        └─ admin/
│  │           ... (max depth reached)
│  └─ .DS_Store
├─ attached_assets/
│  ├─ generated-icon.png
│  ├─ IMG_5701.png
│  ├─ IMG_5702.png
│  ├─ IMG_5703.jpeg
│  ├─ IMG_5704.png
│  ├─ IMG_5706.png
│  ├─ IMG_5707.png
│  ├─ IMG_5709.png
│  └─ IMG_5710.png
├─ client/
│  ├─ public/
│  │  └─ images/
│  │     ├─ Dgen.PNG
│  │     ├─ DGNSHOP.PNG
│  │     ├─ DGNZONES.PNG
│  │     ├─ ForumsGrafitti.PNG
│  │     └─ profile-background.png
│  ├─ src/
│  │  ├─ components/
│  │  │  ├─ admin/
│  │  │  │  ├─ forms/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ layout/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ wallet/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ admin-sidebar.tsx
│  │  │  │  ├─ cooldown-settings.tsx
│  │  │  │  └─ simple-menu.tsx
│  │  │  ├─ auth/
│  │  │  │  ├─ login-form.tsx
│  │  │  │  ├─ protected-route.tsx
│  │  │  │  └─ register-form.tsx
│  │  │  ├─ common/
│  │  │  │  └─ BackToHomeButton.tsx
│  │  │  ├─ dashboard/
│  │  │  │  └─ DailyTasksWidget.tsx
│  │  │  ├─ dev/
│  │  │  │  ├─ dev-playground-shortcut.tsx
│  │  │  │  └─ dev-role-switcher.tsx
│  │  │  ├─ economy/
│  │  │  │  ├─ badges/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ styles/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ wallet/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ xp/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ wallet-display.tsx
│  │  │  │  └─ wallet-modal-v2.tsx
│  │  │  ├─ editor/
│  │  │  │  ├─ enhanced-gif-picker.tsx
│  │  │  │  ├─ gif-picker.tsx
│  │  │  │  ├─ rich-text-editor.tsx
│  │  │  │  └─ suggestion.ts
│  │  │  ├─ forum/
│  │  │  │  ├─ breadcrumb-nav.tsx
│  │  │  │  ├─ CanonicalZoneGrid.tsx
│  │  │  │  ├─ category-card.tsx
│  │  │  │  ├─ CreateThreadButton.tsx
│  │  │  │  ├─ forum-card.tsx
│  │  │  │  ├─ forum-category-card.tsx
│  │  │  │  ├─ forum-filters.tsx
│  │  │  │  ├─ forum-guidelines.tsx
│  │  │  │  ├─ OriginForumPill.tsx
│  │  │  │  ├─ prefix-badge.tsx
│  │  │  │  ├─ ShareButton.tsx
│  │  │  │  ├─ ShopCard.tsx
│  │  │  │  ├─ SolveBadge.tsx
│  │  │  │  ├─ tag-input.tsx
│  │  │  │  ├─ ThreadAuthor.tsx
│  │  │  │  ├─ ThreadCard.tsx
│  │  │  │  ├─ ThreadStats.tsx
│  │  │  │  ├─ UserLevelDisplay.tsx
│  │  │  │  ├─ XpBoostBadge.tsx
│  │  │  │  ├─ zone-group.tsx
│  │  │  │  ├─ ZoneCard.tsx
│  │  │  │  └─ ZoneStats.tsx
│  │  │  ├─ identity/
│  │  │  │  └─ path-progress.tsx
│  │  │  ├─ layout/
│  │  │  │  ├─ announcement-ticker.css
│  │  │  │  ├─ announcement-ticker.tsx
│  │  │  │  ├─ hero-section.tsx
│  │  │  │  ├─ ProfileBackground.tsx
│  │  │  │  ├─ sidebar.tsx
│  │  │  │  ├─ SidebarNavigation.tsx
│  │  │  │  ├─ site-footer.tsx
│  │  │  │  ├─ site-header.tsx
│  │  │  │  └─ site-layout-wrapper.tsx
│  │  │  ├─ messages/
│  │  │  │  ├─ icons/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ WhisperButton.tsx
│  │  │  │  ├─ WhisperModal.tsx
│  │  │  │  └─ WhispersInbox.tsx
│  │  │  ├─ missions/
│  │  │  │  ├─ DailyMissions.tsx
│  │  │  │  └─ MissionsWidget.tsx
│  │  │  ├─ mod/
│  │  │  │  ├─ mod-layout.tsx
│  │  │  │  └─ mod-sidebar.tsx
│  │  │  ├─ navigation/
│  │  │  │  ├─ mobile-nav-bar.tsx
│  │  │  │  └─ nav-item.tsx
│  │  │  ├─ notifications/
│  │  │  │  └─ NotificationPanel.tsx
│  │  │  ├─ paths/
│  │  │  │  ├─ path-progress.tsx
│  │  │  │  └─ user-paths-display.tsx
│  │  │  ├─ payment/
│  │  │  │  ├─ PaymentForm.tsx
│  │  │  │  └─ StripeElementsWrapper.tsx
│  │  │  ├─ platform-energy/
│  │  │  │  ├─ featured-threads/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ hot-threads/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ leaderboards/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ recent-posts/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ stats/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  └─ index.ts
│  │  │  ├─ preferences/
│  │  │  │  ├─ account-preferences.tsx
│  │  │  │  ├─ display-preferences.tsx
│  │  │  │  ├─ notification-preferences.tsx
│  │  │  │  ├─ PreferencesCard.tsx
│  │  │  │  ├─ PreferencesGroup.tsx
│  │  │  │  ├─ PreferencesInput.tsx
│  │  │  │  ├─ PreferencesSelect.tsx
│  │  │  │  ├─ PreferencesTextarea.tsx
│  │  │  │  ├─ PreferencesToggle.tsx
│  │  │  │  ├─ profile-preferences.tsx
│  │  │  │  ├─ referral-preferences.tsx
│  │  │  │  └─ session-preferences.tsx
│  │  │  ├─ profile/
│  │  │  │  ├─ CosmeticControlPanel.tsx
│  │  │  │  ├─ FriendsTab.tsx
│  │  │  │  ├─ index.ts
│  │  │  │  ├─ InventoryTab.tsx
│  │  │  │  ├─ OverviewTab.tsx
│  │  │  │  ├─ ProfileEditor.tsx
│  │  │  │  ├─ ProfileSidebar.tsx
│  │  │  │  ├─ ProfileSkeleton.tsx
│  │  │  │  ├─ rarityUtils.ts
│  │  │  │  ├─ SignatureRenderer.tsx
│  │  │  │  ├─ StatCard.tsx
│  │  │  │  ├─ UserBadges.tsx
│  │  │  │  ├─ UserTitles.tsx
│  │  │  │  ├─ XpLogView.tsx
│  │  │  │  ├─ XPProfileSection.tsx
│  │  │  │  └─ XPProgressBar.tsx
│  │  │  ├─ shop/
│  │  │  │  ├─ purchase-modal.tsx
│  │  │  │  ├─ shop-categories-tabs.tsx
│  │  │  │  ├─ shop-header.tsx
│  │  │  │  ├─ shop-item-card.tsx
│  │  │  │  ├─ shop-item-grid.tsx
│  │  │  │  └─ ShopItem.tsx
│  │  │  ├─ shoutbox/
│  │  │  │  ├─ index.ts
│  │  │  │  ├─ integration-example.tsx
│  │  │  │  ├─ positioned-shoutbox.tsx
│  │  │  │  ├─ README.md
│  │  │  │  ├─ shoutbox-help-command.tsx
│  │  │  │  ├─ shoutbox-message-styles.tsx
│  │  │  │  ├─ shoutbox-position-selector.tsx
│  │  │  │  ├─ shoutbox-rain-notification.tsx
│  │  │  │  ├─ shoutbox-widget.tsx
│  │  │  │  └─ ShoutboxContainer.tsx
│  │  │  ├─ sidebar/
│  │  │  │  ├─ leaderboard-widget.tsx
│  │  │  │  └─ wallet-summary-widget.tsx
│  │  │  ├─ ui/
│  │  │  │  ├─ accordion.tsx
│  │  │  │  ├─ alert-dialog.tsx
│  │  │  │  ├─ alert.tsx
│  │  │  │  ├─ animated-logo.tsx
│  │  │  │  ├─ aspect-ratio.tsx
│  │  │  │  ├─ avatar.tsx
│  │  │  │  ├─ badge.tsx
│  │  │  │  ├─ bookmark-button.tsx
│  │  │  │  ├─ breadcrumb.tsx
│  │  │  │  ├─ button.tsx
│  │  │  │  ├─ calendar.tsx
│  │  │  │  ├─ candlestick-menu.tsx
│  │  │  │  ├─ card.tsx
│  │  │  │  ├─ carousel.tsx
│  │  │  │  ├─ chart.tsx
│  │  │  │  ├─ checkbox.tsx
│  │  │  │  ├─ collapsible.tsx
│  │  │  │  ├─ command.tsx
│  │  │  │  ├─ context-menu.tsx
│  │  │  │  ├─ dialog.tsx
│  │  │  │  ├─ drawer.tsx
│  │  │  │  ├─ dropdown-menu.tsx
│  │  │  │  ├─ error-display.tsx
│  │  │  │  ├─ feature-gate.tsx
│  │  │  │  ├─ FileDropZone.tsx
│  │  │  │  ├─ form.tsx
│  │  │  │  ├─ hamburger.tsx
│  │  │  │  ├─ hover-card.tsx
│  │  │  │  ├─ input-otp.tsx
│  │  │  │  ├─ input.tsx
│  │  │  │  ├─ label.tsx
│  │  │  │  ├─ loader.tsx
│  │  │  │  ├─ menu.tsx
│  │  │  │  ├─ menubar.tsx
│  │  │  │  ├─ navigation-menu.tsx
│  │  │  │  ├─ pagination.tsx
│  │  │  │  ├─ popover.tsx
│  │  │  │  ├─ progress.tsx
│  │  │  │  ├─ radio-group.tsx
│  │  │  │  ├─ reactions-bar.tsx
│  │  │  │  ├─ resizable.tsx
│  │  │  │  ├─ scroll-area.tsx
│  │  │  │  ├─ select.tsx
│  │  │  │  ├─ SeoHead.tsx
│  │  │  │  ├─ separator.tsx
│  │  │  │  ├─ sheet.tsx
│  │  │  │  ├─ sidebar.tsx
│  │  │  │  ├─ skeleton.tsx
│  │  │  │  ├─ slider.tsx
│  │  │  │  ├─ StatChip.tsx
│  │  │  │  ├─ switch.tsx
│  │  │  │  ├─ table.tsx
│  │  │  │  ├─ tabs.tsx
│  │  │  │  ├─ tag-badge.tsx
│  │  │  │  ├─ textarea.tsx
│  │  │  │  ├─ toast.tsx
│  │  │  │  ├─ toaster.tsx
│  │  │  │  ├─ toggle-group.tsx
│  │  │  │  ├─ toggle.tsx
│  │  │  │  ├─ tooltip-utils.tsx
│  │  │  │  ├─ tooltip.tsx
│  │  │  │  └─ user-badge.tsx
│  │  │  ├─ users/
│  │  │  │  ├─ ActiveMembersWidget.tsx
│  │  │  │  ├─ Avatar.tsx
│  │  │  │  ├─ framed-avatar.tsx
│  │  │  │  ├─ index.ts
│  │  │  │  ├─ user-avatar.tsx
│  │  │  │  ├─ UserCard.tsx
│  │  │  │  ├─ UserDirectoryTable.tsx
│  │  │  │  ├─ UserFilters.tsx
│  │  │  │  └─ Username.tsx
│  │  │  ├─ xp/
│  │  │  │  ├─ LevelUpModal.tsx
│  │  │  │  ├─ XPBarsContainer.tsx
│  │  │  │  ├─ XPBarTrack.tsx
│  │  │  │  ├─ xpConfig.ts
│  │  │  │  └─ XpToast.tsx
│  │  │  └─ ErrorBoundary.tsx
│  │  ├─ config/
│  │  │  ├─ admin-navigation.ts
│  │  │  ├─ admin-routes.ts
│  │  │  ├─ forumMap.config.ts
│  │  │  ├─ publicConfig.ts
│  │  │  ├─ README.md
│  │  │  ├─ tags.config.ts
│  │  │  ├─ themeConstants.ts
│  │  │  ├─ themeFallbacks.ts
│  │  │  ├─ ui.config.ts
│  │  │  └─ xp.config.ts
│  │  ├─ constants/
│  │  │  ├─ env.ts
│  │  │  ├─ routes.ts
│  │  │  └─ websocket-disabled.ts
│  │  ├─ contexts/
│  │  │  ├─ AdminSidebarContext.tsx
│  │  │  ├─ ForumStructureContext.tsx
│  │  │  ├─ ForumThemeProvider.tsx
│  │  │  ├─ LevelUpContext.tsx
│  │  │  ├─ mock-shoutbox-context.tsx
│  │  │  ├─ safe-shoutbox-provider.tsx
│  │  │  ├─ shoutbox-context.tsx
│  │  │  ├─ wallet-context.tsx
│  │  │  └─ XpToastContext.tsx
│  │  ├─ core/
│  │  │  ├─ api.ts
│  │  │  ├─ constants.ts
│  │  │  ├─ polyfills.js
│  │  │  ├─ providers.tsx
│  │  │  ├─ queryClient.ts
│  │  │  └─ router.tsx
│  │  ├─ features/
│  │  │  ├─ activity/
│  │  │  │  ├─ components/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ hooks/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  └─ services/
│  │  │  │     ... (max depth reached)
│  │  │  ├─ admin/
│  │  │  │  ├─ components/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  └─ services/
│  │  │  │     ... (max depth reached)
│  │  │  ├─ forum/
│  │  │  │  ├─ components/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ hooks/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  └─ services/
│  │  │  │     ... (max depth reached)
│  │  │  ├─ users/
│  │  │  │  ├─ hooks/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  └─ services/
│  │  │  │     ... (max depth reached)
│  │  │  └─ wallet/
│  │  │     ├─ components/
│  │  │     │  ... (max depth reached)
│  │  │     ├─ hooks/
│  │  │     │  ... (max depth reached)
│  │  │     ├─ pages/
│  │  │     │  ... (max depth reached)
│  │  │     ├─ services/
│  │  │     │  ... (max depth reached)
│  │  │     ├─ tests/
│  │  │     │  ... (max depth reached)
│  │  │     └─ index.ts
│  │  ├─ hooks/
│  │  │  ├─ preferences/
│  │  │  │  ├─ useUpdateUserSettings.ts
│  │  │  │  └─ useUserSettings.ts
│  │  │  ├─ wrappers/
│  │  │  │  └─ use-auth-wrapper.ts
│  │  │  ├─ index.ts
│  │  │  ├─ use-async-button.tsx
│  │  │  ├─ use-auth.tsx
│  │  │  ├─ use-debounce.ts
│  │  │  ├─ use-local-storage.ts
│  │  │  ├─ use-media-query.ts
│  │  │  ├─ use-messages.tsx
│  │  │  ├─ use-mobile.tsx
│  │  │  ├─ use-notifications.ts
│  │  │  ├─ use-pending-transactions.ts
│  │  │  ├─ use-purchase-modal.tsx
│  │  │  ├─ use-rain-notifications.ts
│  │  │  ├─ use-rain.ts
│  │  │  ├─ use-shop-items.tsx
│  │  │  ├─ use-shop-ownership.tsx
│  │  │  ├─ use-tip.ts
│  │  │  ├─ use-toast.ts
│  │  │  ├─ use-vault-items.tsx
│  │  │  ├─ use-wallet-modal.ts
│  │  │  ├─ use-wallet.ts
│  │  │  ├─ useConfig.ts
│  │  │  ├─ useCrudMutation.ts
│  │  │  ├─ useDailyTasks.ts
│  │  │  ├─ useDgtPurchase.ts
│  │  │  ├─ useFeatureGates.ts
│  │  │  ├─ useMissions.ts
│  │  │  ├─ useThreadZone.ts
│  │  │  ├─ useUserCosmetics.ts
│  │  │  ├─ useUserInventory.ts
│  │  │  ├─ useUserXP.ts
│  │  │  └─ useXP.ts
│  │  ├─ lib/
│  │  │  ├─ utils/
│  │  │  │  ├─ animateNumber.ts
│  │  │  │  ├─ api-helpers.ts
│  │  │  │  ├─ applyPluginRewards.ts
│  │  │  │  ├─ category.ts
│  │  │  │  └─ cosmeticsUtils.tsx
│  │  │  ├─ admin-route.tsx
│  │  │  ├─ admin-vault-service.ts
│  │  │  ├─ api-request.ts
│  │  │  ├─ api.ts
│  │  │  ├─ format-date.ts
│  │  │  ├─ formatters.ts
│  │  │  ├─ protected-route.tsx
│  │  │  ├─ queryClient.ts
│  │  │  ├─ rare-items-vault.ts
│  │  │  ├─ safeWebSocket.ts
│  │  │  ├─ utils.ts
│  │  │  └─ wallet-service.ts
│  │  ├─ navigation/
│  │  │  └─ forumNav.ts
│  │  ├─ pages/
│  │  │  ├─ admin/
│  │  │  │  ├─ activity/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ announcements/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ config/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ dev/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ features/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ missions/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ reports/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ shop/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ stats/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ transactions/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ users/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ wallets/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ xp/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ admin-layout.tsx
│  │  │  │  ├─ airdrop.tsx
│  │  │  │  ├─ categories.tsx
│  │  │  │  ├─ dgt-packages.tsx
│  │  │  │  ├─ emojis.tsx
│  │  │  │  ├─ forum-structure.tsx
│  │  │  │  ├─ index.tsx
│  │  │  │  ├─ prefixes.tsx
│  │  │  │  ├─ reports.tsx
│  │  │  │  ├─ roles.tsx
│  │  │  │  ├─ tags.tsx
│  │  │  │  ├─ threads.tsx
│  │  │  │  ├─ tip-rain-settings.tsx
│  │  │  │  ├─ treasury.tsx
│  │  │  │  ├─ ui-config.tsx
│  │  │  │  └─ users.tsx
│  │  │  ├─ announcements/
│  │  │  │  └─ index.tsx
│  │  │  ├─ forums/
│  │  │  │  ├─ [forum_slug].tsx
│  │  │  │  ├─ index.tsx
│  │  │  │  └─ search.tsx
│  │  │  ├─ missions/
│  │  │  │  └─ index.tsx
│  │  │  ├─ mod/
│  │  │  │  ├─ index.tsx
│  │  │  │  ├─ shoutbox.tsx
│  │  │  │  └─ users.tsx
│  │  │  ├─ preferences/
│  │  │  │  └─ index.tsx
│  │  │  ├─ profile/
│  │  │  │  ├─ [username].tsx
│  │  │  │  ├─ activity.tsx
│  │  │  │  ├─ xp-demo.tsx
│  │  │  │  └─ xp.tsx
│  │  │  ├─ search/
│  │  │  │  └─ index.tsx
│  │  │  ├─ shop-management/
│  │  │  │  ├─ dgt-purchase.tsx
│  │  │  │  └─ purchase-success.tsx
│  │  │  ├─ tags/
│  │  │  │  └─ [tagSlug].tsx
│  │  │  ├─ threads/
│  │  │  │  ├─ [thread_slug].tsx
│  │  │  │  └─ create.tsx
│  │  │  ├─ ui-playground/
│  │  │  │  └─ demo-data.ts
│  │  │  ├─ zones/
│  │  │  │  ├─ [slug].tsx
│  │  │  │  └─ index.tsx
│  │  │  ├─ _app.tsx
│  │  │  ├─ auth-page.tsx
│  │  │  ├─ auth.tsx
│  │  │  ├─ degen-index.tsx
│  │  │  ├─ forum-rules.tsx
│  │  │  ├─ home.tsx
│  │  │  ├─ leaderboard.tsx
│  │  │  ├─ not-found.tsx
│  │  │  ├─ shop.tsx
│  │  │  ├─ ui-playground.tsx
│  │  │  ├─ wallet.tsx
│  │  │  └─ whispers.tsx
│  │  ├─ payments/
│  │  │  ├─ ccpayment/
│  │  │  │  ├─ ccpayment-client.ts
│  │  │  │  ├─ deposit.ts
│  │  │  │  ├─ index.ts
│  │  │  │  ├─ README.md
│  │  │  │  ├─ swap.ts
│  │  │  │  ├─ types.ts
│  │  │  │  ├─ utils.ts
│  │  │  │  └─ withdraw.ts
│  │  │  ├─ shared/
│  │  │  │  └─ index.ts
│  │  │  └─ index.ts
│  │  ├─ providers/
│  │  │  ├─ app-provider.tsx
│  │  │  ├─ app-providers.tsx
│  │  │  └─ root-provider.tsx
│  │  ├─ styles/
│  │  │  ├─ admin-theme.css
│  │  │  ├─ animations.css
│  │  │  ├─ cssVariables.ts
│  │  │  ├─ globals.css
│  │  │  ├─ ticker.css
│  │  │  ├─ underline-links.css
│  │  │  ├─ utilities.css
│  │  │  ├─ wallet-animations.css
│  │  │  └─ zone-themes.css
│  │  ├─ types/
│  │  │  ├─ forum.ts
│  │  │  ├─ inventory.ts
│  │  │  ├─ notifications.ts
│  │  │  ├─ preferences.types.ts
│  │  │  ├─ profile.ts
│  │  │  └─ wallet.ts
│  │  ├─ utils/
│  │  │  └─ forum-routing-helper.ts
│  │  ├─ App.tsx
│  │  ├─ index.css
│  │  ├─ main.tsx
│  ├─ index.html
│  ├─ README.md
│  └─ tailwind.config.js
├─ config/
│  ├─ postcss.config.js
│  ├─ README.md
│  ├─ tailwind.config.ts
│  └─ vite.config.ts
├─ db/
│  ├─ schema/
│  │  ├─ admin/
│  │  │  ├─ announcements.ts
│  │  │  ├─ auditLogs.ts
│  │  │  ├─ featureFlags.ts
│  │  │  ├─ mediaLibrary.ts
│  │  │  ├─ moderationActions.ts
│  │  │  ├─ reports.ts
│  │  │  ├─ scheduledTasks.ts
│  │  │  ├─ seoMetadata.ts
│  │  │  ├─ siteSettings.ts
│  │  │  ├─ templates.ts
│  │  │  ├─ themes.ts
│  │  │  ├─ uiConfig.ts
│  │  │  └─ uiThemes.ts
│  │  ├─ core/
│  │  │  └─ enums.ts
│  │  ├─ economy/
│  │  │  ├─ airdropRecords.ts
│  │  │  ├─ airdropSettings.ts
│  │  │  ├─ badges.ts
│  │  │  ├─ dgtPackages.ts
│  │  │  ├─ dgtPurchaseOrders.ts
│  │  │  ├─ levels.ts
│  │  │  ├─ postTips.ts
│  │  │  ├─ rainEvents.ts
│  │  │  ├─ settings.ts
│  │  │  ├─ titles.ts
│  │  │  ├─ transactions.ts
│  │  │  ├─ treasurySettings.ts
│  │  │  ├─ userBadges.ts
│  │  │  ├─ userCommands.ts
│  │  │  ├─ userTitles.ts
│  │  │  ├─ vaults.ts
│  │  │  ├─ wallets.ts
│  │  │  ├─ withdrawalRequests.ts
│  │  │  ├─ xpActionSettings.ts
│  │  │  ├─ xpAdjustmentLogs.ts
│  │  │  └─ xpLogs.ts
│  │  ├─ forum/
│  │  │  ├─ categories.ts
│  │  │  ├─ customEmojis.ts
│  │  │  ├─ emojiPackItems.ts
│  │  │  ├─ emojiPacks.ts
│  │  │  ├─ pollOptions.ts
│  │  │  ├─ polls.ts
│  │  │  ├─ pollVotes.ts
│  │  │  ├─ postDrafts.ts
│  │  │  ├─ postLikes.ts
│  │  │  ├─ postReactions.ts
│  │  │  ├─ posts.ts
│  │  │  ├─ prefixes.ts
│  │  │  ├─ rules.ts
│  │  │  ├─ tags.ts
│  │  │  ├─ threadBookmarks.ts
│  │  │  ├─ threadDrafts.ts
│  │  │  ├─ threadFeaturePermissions.ts
│  │  │  ├─ threads.ts
│  │  │  ├─ threadTags.ts
│  │  │  ├─ userEmojiPacks.ts
│  │  │  └─ userRuleAgreements.ts
│  │  ├─ gamification/
│  │  │  ├─ achievements.ts
│  │  │  ├─ leaderboards.ts
│  │  │  ├─ missions.ts
│  │  │  ├─ platformStats.ts
│  │  │  ├─ userAchievements.ts
│  │  │  └─ userMissionProgress.ts
│  │  ├─ messaging/
│  │  │  ├─ chatRooms.ts
│  │  │  ├─ conversationParticipants.ts
│  │  │  ├─ conversations.ts
│  │  │  ├─ directMessages.ts
│  │  │  ├─ messageReads.ts
│  │  │  ├─ messages.ts
│  │  │  ├─ onlineUsers.ts
│  │  │  └─ shoutboxMessages.ts
│  │  ├─ shop/
│  │  │  ├─ inventoryTransactions.ts
│  │  │  ├─ orderItems.ts
│  │  │  ├─ orders.ts
│  │  │  ├─ productCategories.ts
│  │  │  ├─ productMedia.ts
│  │  │  ├─ products.ts
│  │  │  ├─ signatureItems.ts
│  │  │  ├─ userInventory.ts
│  │  │  └─ userSignatureItems.ts
│  │  ├─ system/
│  │  │  ├─ activityFeed.ts
│  │  │  ├─ airdrop-records.ts
│  │  │  ├─ analyticsEvents.ts
│  │  │  ├─ cooldownState.ts
│  │  │  ├─ event_logs.ts
│  │  │  ├─ mentionsIndex.ts
│  │  │  ├─ notifications.ts
│  │  │  ├─ rateLimits.ts
│  │  │  ├─ referralSources.ts
│  │  │  ├─ userAbuseFlags.ts
│  │  │  └─ userReferrals.ts
│  │  ├─ user/
│  │  │  ├─ avatarFrames.ts
│  │  │  ├─ bans.ts
│  │  │  ├─ featurePermissions.ts
│  │  │  ├─ passwordResetTokens.ts
│  │  │  ├─ permissions.ts
│  │  │  ├─ preferences.ts
│  │  │  ├─ relationships.ts
│  │  │  ├─ rolePermissions.ts
│  │  │  ├─ roles.ts
│  │  │  ├─ sessions.ts
│  │  │  ├─ settingsHistory.ts
│  │  │  ├─ userGroups.ts
│  │  │  ├─ userRoles.ts
│  │  │  ├─ users.ts
│  │  │  ├─ verificationTokens.ts
│  │  │  └─ xShares.ts
│  │  └─ index.ts
│  ├─ types/
│  │  ├─ announcement.types.ts
│  │  ├─ emoji.types.ts
│  │  ├─ forum.types.ts
│  │  ├─ system.types.ts
│  │  └─ user.types.ts
│  ├─ dev.db
│  ├─ forum.db
│  ├─ index.ts
│  └─ README.md
├─ docs/
│  ├─ archive/
│  │  ├─ FORUM_PRIMARY_ZONES_REFACTOR_PLAN.md
│  │  └─ placeholder.txt
│  ├─ engagement/
│  │  ├─ rain-analytics.md
│  │  └─ tipping-analytics.md
│  ├─ examples/
│  │  └─ admin-users-query.md
│  ├─ forum/
│  │  ├─ backend-setup-guide.md
│  │  ├─ mentions-index.md
│  │  └─ SETUP_GUIDE.md
│  ├─ memory-bank/
│  │  ├─ activeContext.md
│  │  ├─ consolidated_learnings.md
│  │  ├─ productContext.md
│  │  ├─ progress.md
│  │  ├─ projectbrief.md
│  │  ├─ raw_reflection_log.md
│  │  ├─ systemPatterns.md
│  │  └─ techContext.md
│  ├─ shop/
│  │  └─ README.md
│  ├─ system/
│  ├─ ui/
│  │  ├─ routing-logic.md
│  │  └─ zone-card-design-guidelines.md
│  ├─ activity-feed-system.md
│  ├─ admin-panel-audit-2025-06-17.md
│  ├─ admin-panel-refactoring-plan.md
│  ├─ audit-findings.md
│  ├─ CCPAYMENT.md
│  ├─ codebase-overview.md
│  ├─ component-tree.md
│  ├─ designworkflow.md
│  ├─ dgt-token-management-plan.md
│  ├─ frontend-enhancement-plan.md
│  ├─ launch-readiness-audit-may-2025.md
│  ├─ README_API.md
│  ├─ README.md
│  ├─ refactor-tracker.md
│  ├─ RESTRUCTURE.md
│  ├─ REWRITE_IMPORTS.md
│  ├─ SCHEMA_REFACTOR_PLAN.md
│  ├─ stripecustoms.md
│  ├─ stripeelements.md
│  ├─ wallet-api-integration-plan.md
│  ├─ wallet-system.md
│  ├─ xp-dgt-system-implementation-plan.md
│  └─ xp-system-reference.md
├─ lib/
│  ├─ auth/
│  │  └─ canUser.ts
│  ├─ emoji/
│  │  └─ unlockEmojiPack.ts
│  ├─ forum/
│  │  ├─ canUserPost.ts
│  │  ├─ getAvailablePrefixes.ts
│  │  ├─ getForumRules.ts
│  │  ├─ prefixEngine.ts
│  │  └─ shouldAwardXP.ts
│  ├─ mentions/
│  │  ├─ createMentionsIndex.ts
│  │  └─ utils.ts
│  ├─ moderation/
│  │  └─ applyModerationAction.ts
│  └─ wallet/
│     └─ testUtils.ts
├─ logs/
│  └─ app.log
├─ migrations/
│  ├─ archive/
│  │  ├─ 0007_romantic_colossus.sql
│  │  ├─ 0007_smooth_sphinx.sql
│  │  └─ canonical-zones-schema-update.ts
│  ├─ meta/
│  │  ├─ _journal.json
│  │  ├─ 0000_snapshot.json
│  │  ├─ 0001_snapshot.json
│  │  ├─ 0002_snapshot.json
│  │  ├─ 0003_snapshot.json
│  │  ├─ 0004_snapshot.json
│  │  ├─ 0005_snapshot.json
│  │  ├─ 0006_snapshot.json
│  │  └─ 0007_snapshot.json
│  ├─ postgres/
│  │  ├─ archive/
│  │  │  ├─ 0000_rapid_doctor_doom.sql
│  │  │  ├─ 0001_orange_norrin_radd.sql
│  │  │  ├─ 0002_broken_viper.sql
│  │  │  ├─ 0003_faulty_blink.sql
│  │  │  ├─ 0004_fixed_tempest.sql
│  │  │  ├─ 0006_amazing_slyde.sql
│  │  │  ├─ 0007_wooden_emma_frost.sql
│  │  │  ├─ 0010_slow_hammerhead.sql
│  │  │  └─ 0011_robust_stephen_strange.sql
│  │  ├─ meta/
│  │  │  ├─ _journal.json
│  │  │  ├─ 0000_snapshot.json
│  │  │  ├─ 0001_snapshot.json
│  │  │  ├─ 0002_snapshot.json
│  │  │  ├─ 0003_snapshot.json
│  │  │  ├─ 0004_snapshot.json
│  │  │  ├─ 0006_snapshot.json
│  │  │  ├─ 0007_snapshot.json
│  │  │  ├─ 0008_snapshot.json
│  │  │  ├─ 0009_snapshot.json
│  │  │  ├─ 0010_snapshot.json
│  │  │  ├─ 0011_snapshot.json
│  │  │  ├─ 0012_snapshot.json
│  │  │  └─ 0013_snapshot.json
│  │  ├─ 0012_event_logs_table.sql
│  │  ├─ 0013_forum_schema_cleanup.sql
│  │  ├─ 0013_gray_harrier.sql
│  │  ├─ 0014_forum_schema_refactor.sql
│  │  ├─ 0015_archive_legacy_forum_columns.sql
│  │  ├─ 0016_roles_uuid_to_int.sql
│  │  └─ 0017_auto_tables_and_defaults.sql
│  ├─ .DS_Store
│  ├─ 0008_add_users_profile_fields.sql
│  ├─ 0009_create_xp_logs_table.sql
│  ├─ 0010_add_x_account_fields.sql
│  └─ 0011_create_x_shares_table.sql
├─ MVP-SPRINTS/
│  ├─ adminlaunchplan.md
│  ├─ projectlaunchplan.md
│  ├─ UI_Wiring_Tasks.md
│  ├─ userprofilepolishplan.md
│  └─ XP-DGT-SPRINT.md
├─ scripts/
│  ├─ auth/
│  │  ├─ auth-refactor.js
│  │  ├─ auth-refactor.ts
│  │  ├─ auth-standardize.ts
│  │  └─ fix-auth.ts
│  ├─ db/
│  │  ├─ utils/
│  │  │  ├─ schema.ts
│  │  │  └─ seedUtils.ts
│  │  ├─ add_categoryid_to_thread_prefixes.ts
│  │  ├─ add-color-theme-field.ts
│  │  ├─ apply-migration.ts
│  │  ├─ backfill-configZoneType.ts
│  │  ├─ check-levels-table.ts
│  │  ├─ check-reward-tables.ts
│  │  ├─ create-missing-tables.ts
│  │  ├─ db-schema-summary.js
│  │  ├─ fix-forum-relationships.ts
│  │  ├─ initialize-giphy-settings.ts
│  │  ├─ initialize-xp-system.ts
│  │  ├─ neon-to-sqlite.js
│  │  ├─ read-forum-categories.ts
│  │  ├─ read-thread.ts
│  │  ├─ README-UI-CONFIG.md
│  │  ├─ reset-and-seed.ts
│  │  ├─ run-db-summary.cjs
│  │  ├─ seed-badges.ts
│  │  ├─ seed-chat.ts
│  │  ├─ seed-default-levels.ts
│  │  ├─ seed-economy-settings.ts
│  │  ├─ seed-shop.ts
│  │  ├─ seed-treasury.ts
│  │  ├─ seed-ui-config-quotes.ts
│  │  ├─ seed-user-role-migration.ts
│  │  ├─ seed-users.ts
│  │  ├─ seed-vaults.ts
│  │  ├─ seed-xp-actions.ts
│  │  ├─ test-forum-query.ts
│  │  ├─ test-forum-runtime.ts
│  │  ├─ update-forum-slugs.ts
│  │  ├─ update-levels-table.ts
│  │  ├─ update-users-table.ts
│  │  └─ verify-neon-connection.ts
│  ├─ dev/
│  │  └─ syncForumsToDB.ts
│  ├─ logs/
│  ├─ ops/
│  │  ├─ check-forum-config-sync.ts
│  │  └─ setup-xp-system.sh
│  ├─ refactor/
│  │  ├─ fix-admin-double-layout.ts
│  │  └─ rbac-codemod.ts
│  ├─ seed/
│  │  ├─ shop/
│  │  │  └─ username-colors.ts
│  │  ├─ run-username-colors.ts
│  │  ├─ seed-dummy-threads.ts
│  │  ├─ seed-realistic-threads.ts
│  │  ├─ seedDynamicContent.ts
│  │  └─ seedForumsFromConfig.ts
│  ├─ templates/
│  │  ├─ transaction-domain-template.ts
│  │  └─ vault-domain-template.ts
│  ├─ testing/
│  │  ├─ admin-api-tests.sh
│  │  ├─ test-forum-endpoints.js
│  │  ├─ test-mock-requests.js
│  │  ├─ test-xp-actions.js
│  │  ├─ test-xp-system.ts
│  │  ├─ validate-domain-migration.sh
│  │  ├─ validate-forum-fks.ts
│  │  └─ validate-routes.js
│  ├─ tools/
│  │  └─ generate-tree.js
│  ├─ wallet/
│  │  ├─ migrate-wallet-components.ts
│  │  ├─ migrate-wallet-imports.ts
│  │  └─ wallet-refactor-migration.ts
│  ├─ backfill-thread-parentForumSlug.ts
│  ├─ build-forum-sdk.ts
│  ├─ fix-all-schema-issues.ts
│  ├─ fix-all-user-refs.ts
│  ├─ fix-integer-imports.ts
│  ├─ fix-missing-uuid-imports.ts
│  ├─ fix-table-references.ts
│  ├─ fix-userid-types.ts
│  ├─ README.md
│  ├─ reset-database.sql
│  ├─ reset-db-clean.ts
│  ├─ test-admin-xp.js
│  ├─ test-ci-readiness.ts
│  ├─ test-forum-api.ts
│  ├─ validate-everything.ts
│  └─ validate-imports.ts
├─ server/
│  ├─ config/
│  │  ├─ loadEnv.ts
│  │  └─ zoneThemes.config.ts
│  ├─ logs/
│  │  └─ app.log
│  ├─ migrations/
│  │  ├─ archive/
│  │  │  ├─ README.md
│  │  │  └─ run-tip-rain.ts
│  │  ├─ 20250510_create_xp_adjustment_logs.ts
│  │  ├─ 20250512_create_xp_action_logs.ts
│  │  ├─ 20250513_create_xp_action_settings.ts
│  │  ├─ add-daily-xp-tracking.ts
│  │  ├─ add-dgt-packages-table.ts
│  │  ├─ add-dgt-purchase-orders-table.ts
│  │  └─ xp-clout-levels-migration.ts
│  ├─ routes/
│  │  └─ api/
│  │     └─ ccpayment/
│  ├─ services/
│  │  ├─ ccpayment-client.ts
│  │  ├─ path-service.ts
│  │  ├─ tip-service-ccpayment.ts
│  │  ├─ xp-clout-service.ts
│  │  └─ xp-level-service.ts
│  ├─ src/
│  │  ├─ config/
│  │  │  └─ forum.config.ts
│  │  ├─ core/
│  │  │  ├─ routes/
│  │  │  │  └─ api/
│  │  │  │     ... (max depth reached)
│  │  │  ├─ config.service.ts
│  │  │  ├─ db.ts
│  │  │  ├─ errors.ts
│  │  │  ├─ logger.ts
│  │  │  ├─ middleware.ts
│  │  │  ├─ rate-limiter.ts
│  │  │  ├─ storage.service.ts
│  │  │  ├─ vite.ts
│  │  │  └─ wallet-validators.ts
│  │  ├─ cron/
│  │  │  └─ mission-reset.ts
│  │  ├─ domains/
│  │  │  ├─ activity/
│  │  │  │  ├─ controllers/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ routes/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  └─ services/
│  │  │  │     ... (max depth reached)
│  │  │  ├─ admin/
│  │  │  │  ├─ sub-domains/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ admin.controller.ts
│  │  │  │  ├─ admin.errors.ts
│  │  │  │  ├─ admin.middleware.ts
│  │  │  │  ├─ admin.routes.ts
│  │  │  │  └─ admin.service.ts
│  │  │  ├─ auth/
│  │  │  │  ├─ controllers/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ middleware/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ routes/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ services/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ auth.routes.ts
│  │  │  │  └─ index.ts
│  │  │  ├─ ccpayment-webhook/
│  │  │  │  ├─ ccpayment-webhook.controller.ts
│  │  │  │  ├─ ccpayment-webhook.routes.ts
│  │  │  │  └─ ccpayment-webhook.service.ts
│  │  │  ├─ economy/
│  │  │  │  └─ services/
│  │  │  │     ... (max depth reached)
│  │  │  ├─ editor/
│  │  │  │  └─ editor.routes.ts
│  │  │  ├─ engagement/
│  │  │  │  ├─ airdrop/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ rain/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ tip/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ vault/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  └─ engagement.service.ts
│  │  │  ├─ feature-gates/
│  │  │  │  ├─ feature-gates.controller.ts
│  │  │  │  ├─ feature-gates.routes.ts
│  │  │  │  └─ feature-gates.service.ts
│  │  │  ├─ forum/
│  │  │  │  ├─ rules/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ forum.controller.ts
│  │  │  │  ├─ forum.routes.ts
│  │  │  │  ├─ forum.service.test.ts
│  │  │  │  └─ forum.service.ts
│  │  │  ├─ messaging/
│  │  │  │  └─ message.routes.ts
│  │  │  ├─ missions/
│  │  │  │  ├─ missions.admin.controller.ts
│  │  │  │  ├─ missions.admin.routes.ts
│  │  │  │  ├─ missions.controller.ts
│  │  │  │  ├─ missions.routes.ts
│  │  │  │  └─ missions.service.ts
│  │  │  ├─ notifications/
│  │  │  │  ├─ event-notification-listener.ts
│  │  │  │  ├─ notification-generator.service.ts
│  │  │  │  ├─ notification.routes.ts
│  │  │  │  └─ notification.service.ts
│  │  │  ├─ paths/
│  │  │  │  └─ paths.routes.ts
│  │  │  ├─ preferences/
│  │  │  │  ├─ preferences.routes.ts
│  │  │  │  ├─ preferences.service.ts
│  │  │  │  └─ preferences.validators.ts
│  │  │  ├─ profile/
│  │  │  │  ├─ profile.routes.ts
│  │  │  │  ├─ profile.service.ts
│  │  │  │  ├─ referrals.service.ts
│  │  │  │  ├─ signature.routes.ts
│  │  │  │  └─ signature.service.ts
│  │  │  ├─ share/
│  │  │  │  ├─ routes/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  └─ services/
│  │  │  │     ... (max depth reached)
│  │  │  ├─ shop/
│  │  │  │  └─ shop.routes.ts
│  │  │  ├─ shoutbox/
│  │  │  │  └─ shoutbox.routes.ts
│  │  │  ├─ social/
│  │  │  │  └─ relationships.routes.ts
│  │  │  ├─ treasury/
│  │  │  │  └─ treasury.routes.ts
│  │  │  ├─ uploads/
│  │  │  │  ├─ upload.controller.ts
│  │  │  │  ├─ upload.routes.ts
│  │  │  │  └─ upload.service.ts
│  │  │  ├─ wallet/
│  │  │  │  ├─ ccpayment.service.ts
│  │  │  │  ├─ dgt.service.ts
│  │  │  │  ├─ wallet-api-tests.ts
│  │  │  │  ├─ wallet.constants.ts
│  │  │  │  ├─ wallet.controller.ts
│  │  │  │  ├─ wallet.routes.ts
│  │  │  │  ├─ wallet.service.ts
│  │  │  │  └─ wallet.validators.ts
│  │  │  └─ xp/
│  │  │     ├─ events/
│  │  │     │  ... (max depth reached)
│  │  │     ├─ xp-actions-schema.ts
│  │  │     ├─ xp-actions.controller.ts
│  │  │     ├─ xp-actions.ts
│  │  │     ├─ xp.admin.routes.ts
│  │  │     ├─ xp.controller.ts
│  │  │     ├─ xp.events.ts
│  │  │     ├─ xp.routes.ts
│  │  │     └─ xp.service.ts
│  │  ├─ lib/
│  │  │  └─ db.ts
│  │  ├─ middleware/
│  │  │  ├─ auth.ts
│  │  │  ├─ authenticate.ts
│  │  │  ├─ mission-progress.ts
│  │  │  ├─ trace.middleware.ts
│  │  │  ├─ validate-request.ts
│  │  │  └─ validate.ts
│  │  ├─ routes/
│  │  │  └─ api/
│  │  │     ├─ index.ts
│  │  │     └─ ui.routes.ts
│  │  ├─ utils/
│  │  │  ├─ auth.ts
│  │  │  ├─ db-utils.ts
│  │  │  └─ environment.ts
│  │  └─ app.ts
│  ├─ test/
│  │  ├─ ccpayment-webhook/
│  │  │  └─ webhook.test.ts
│  │  ├─ engagement/
│  │  │  └─ tip.test.ts
│  │  └─ wallet/
│  │     └─ dgt-service.test.ts
│  ├─ utils/
│  │  ├─ dgt-treasury-init.ts
│  │  ├─ dgt-wallet-integration.ts
│  │  ├─ path-utils.ts
│  │  ├─ platform-energy.ts
│  │  ├─ seed-dev-user.ts
│  │  ├─ shop-utils.ts
│  │  ├─ slugify.ts
│  │  ├─ task-scheduler.ts
│  │  ├─ wallet-utils.ts
│  │  └─ walletEngine.ts
│  ├─ index.ts
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ pnpm-lock.yaml
│  ├─ README.md
│  ├─ routes.ts
│  ├─ storage.ts
│  ├─ tsconfig.json
│  └─ vite.ts
├─ shared/
│  ├─ signature/
│  │  └─ SignatureTierConfig.ts
│  ├─ validators/
│  │  └─ admin.ts
│  ├─ constants.ts
│  ├─ path-config.ts
│  ├─ paths.config.ts
│  ├─ README.md
│  └─ types.ts
├─ tests/
│  └─ e2e/
│     └─ forum-home.spec.ts
├─ Wallet-Workspace/
├─ .DS_Store
├─ .env
├─ .eslintrc.json
├─ .gitignore
├─ .prettierignore
├─ .prettierrc
├─ CLEANUP_SUMMARY.md
├─ cline_mcp_settings.json
├─ components.json
├─ CONTRIBUTING.md
├─ directory-tree.md
├─ drizzle.config.ts
├─ env.local
├─ FORUM-ADMIN-IMPROVEMENTS.md
├─ forum-sprint-subforums.md
├─ MVP-FORUM-LAUNCH-SUMMARY.md
├─ MVP-FORUM-SETUP.md
├─ MVP-NEEDS.md
├─ package-lock.json
├─ package.json
├─ playwright.config.ts
├─ PRIMARY-ZONES-IMPLEMENTATION.md
├─ projectBrief.md
├─ README-FORUM.md
├─ README.md
├─ tsconfig.client.json
└─ tsconfig.json
```

## Structure Notes

- `server/src/domains/` - Domain-driven backend modules
- `client/src/components/` - Reusable React components
- `client/src/pages/` - Page components corresponding to routes
- `shared/` - Shared code between client and server
