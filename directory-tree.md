# ForumFusion Directory Structure
  
Generated on: 2025-06-09

```
├─ .clinerules/
│  ├─ available-rules.md
│  ├─ cline-continuous-improvement-protocol.md
│  ├─ cline-dev-env-rules.md
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
│     ├─ domain-rules.md
│     ├─ import-patterns.mdc
│     ├─ naming-rules.mdc
│     ├─ navigation-helper.mdc
│     ├─ riper-5.mdc
│     ├─ route-deprecation.mdc
│     ├─ rule-evolution.mdc
│     ├─ schema-consistency.mdc
│     ├─ schema-sync-rules.mdc
│     └─ update-history.mdc
├─ .github/
│  ├─ workflows/
│  │  └─ check_contributors.yml
│  └─ PULL_REQUEST_TEMPLATE.md
├─ archive/
│  ├─ scripts/
│  │  └─ db/
│  ├─ server/
│  │  └─ middleware/
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
│  │  ├─ animations/
│  │  └─ images/
│  │     ├─ Dgen.PNG
│  │     └─ profile-background.png
│  ├─ src/
│  │  ├─ components/
│  │  │  ├─ admin/
│  │  │  │  ├─ wallet/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ admin-sidebar.tsx
│  │  │  │  ├─ cooldown-settings.tsx
│  │  │  │  ├─ LottiePreview.tsx
│  │  │  │  ├─ simple-admin-sidebar.tsx
│  │  │  │  └─ simple-menu.tsx
│  │  │  ├─ auth/
│  │  │  │  ├─ login-form.tsx
│  │  │  │  ├─ protected-route.tsx
│  │  │  │  └─ register-form.tsx
│  │  │  ├─ dev/
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
│  │  │  │  ├─ create-thread-button.tsx
│  │  │  │  ├─ forum-card.tsx
│  │  │  │  ├─ forum-category-card.tsx
│  │  │  │  ├─ forum-filters.tsx
│  │  │  │  ├─ forum-guidelines.tsx
│  │  │  │  ├─ forum-search.tsx
│  │  │  │  ├─ post-card.tsx
│  │  │  │  ├─ prefix-badge.tsx
│  │  │  │  ├─ ShareButton.tsx
│  │  │  │  ├─ ShopCard.tsx
│  │  │  │  ├─ SolveBadge.tsx
│  │  │  │  ├─ tag-input.tsx
│  │  │  │  ├─ thread-card.tsx
│  │  │  │  ├─ ThreadAuthor.tsx
│  │  │  │  ├─ UserLevelDisplay.tsx
│  │  │  │  ├─ zone-group.tsx
│  │  │  │  └─ ZoneCard.tsx
│  │  │  ├─ identity/
│  │  │  │  └─ path-progress.tsx
│  │  │  ├─ layout/
│  │  │  │  ├─ announcement-ticker.css
│  │  │  │  ├─ announcement-ticker.tsx
│  │  │  │  ├─ hero-section.tsx
│  │  │  │  ├─ landing-header.tsx
│  │  │  │  ├─ PrimaryZoneLayout.tsx
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
│  │  │  │  └─ session-preferences.tsx
│  │  │  ├─ profile/
│  │  │  │  ├─ CosmeticControlPanel.tsx
│  │  │  │  ├─ ProfileEditor.tsx
│  │  │  │  ├─ ProfileSkeleton.tsx
│  │  │  │  ├─ SignatureRenderer.tsx
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
│  │  │  ├─ data/
│  │  │  │  └─ ui-settings.json
│  │  │  ├─ schemas/
│  │  │  │  └─ README.md
│  │  │  ├─ admin-routes.ts
│  │  │  ├─ CONFIG_MIGRATION_LOG.md
│  │  │  ├─ CONFIGURATION_RULES.md
│  │  │  ├─ cosmetics.config.ts
│  │  │  ├─ DEVELOPER_GUIDE.md
│  │  │  ├─ economy.config.ts
│  │  │  ├─ forumRules.config.ts
│  │  │  ├─ INTEGRATION_GUIDE.md
│  │  │  ├─ README.md
│  │  │  ├─ roles.config.ts
│  │  │  └─ ui.config.ts
│  │  ├─ constants/
│  │  │  ├─ env.ts
│  │  │  ├─ prefixRegistry.ts
│  │  │  ├─ primaryZones.tsx
│  │  │  ├─ routes.ts
│  │  │  ├─ websocket-disabled.ts
│  │  │  └─ zoneRegistry.ts
│  │  ├─ contexts/
│  │  │  ├─ LevelUpContext.tsx
│  │  │  ├─ mock-shoutbox-context.tsx
│  │  │  ├─ profile-context.tsx
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
│  │  ├─ designs/
│  │  │  └─ landing-page/
│  │  │     ├─ componentLibrary.md
│  │  │     ├─ designBrief.md
│  │  │     ├─ layoutPatterns.md
│  │  │     ├─ progress.md
│  │  │     └─ styleGuide.md
│  │  ├─ features/
│  │  │  ├─ admin/
│  │  │  │  └─ components/
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
│  │  │  ├─ useDgtPurchase.ts
│  │  │  ├─ useEmojiStickerUnlocks.ts
│  │  │  ├─ useFeatureGates.ts
│  │  │  ├─ useMissions.ts
│  │  │  ├─ useShopConfig.ts
│  │  │  ├─ useUserCosmetics.ts
│  │  │  ├─ useUserInventory.ts
│  │  │  ├─ useUserXP.ts
│  │  │  └─ useXP.ts
│  │  ├─ lib/
│  │  │  ├─ utils/
│  │  │  │  ├─ api-helpers.ts
│  │  │  │  ├─ applyPluginRewards.ts
│  │  │  │  ├─ category.ts
│  │  │  │  └─ cosmeticsUtils.tsx
│  │  │  ├─ admin-route.tsx
│  │  │  ├─ admin-vault-service.ts
│  │  │  ├─ api-request.ts
│  │  │  ├─ api.ts
│  │  │  ├─ emojiStickerRenderer.tsx
│  │  │  ├─ format-date.ts
│  │  │  ├─ formatters.ts
│  │  │  ├─ protected-route.tsx
│  │  │  ├─ queryClient.ts
│  │  │  ├─ rare-items-vault.ts
│  │  │  ├─ safeWebSocket.ts
│  │  │  ├─ unlockHelper.ts
│  │  │  └─ utils.ts
│  │  ├─ pages/
│  │  │  ├─ [zone_slug]/
│  │  │  │  └─ index.tsx
│  │  │  ├─ admin/
│  │  │  │  ├─ announcements/
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
│  │  │  │  ├─ badges.tsx
│  │  │  │  ├─ categories.tsx
│  │  │  │  ├─ cooldowns.tsx
│  │  │  │  ├─ dgt-packages.tsx
│  │  │  │  ├─ edit-user.tsx
│  │  │  │  ├─ emojis.tsx
│  │  │  │  ├─ index.tsx
│  │  │  │  ├─ levels.tsx
│  │  │  │  ├─ platform-settings.tsx
│  │  │  │  ├─ prefixes.tsx
│  │  │  │  ├─ reports.tsx
│  │  │  │  ├─ tags.tsx
│  │  │  │  ├─ threads.tsx
│  │  │  │  ├─ tip-rain-settings.tsx
│  │  │  │  ├─ treasury.tsx
│  │  │  │  ├─ user-groups.tsx
│  │  │  │  ├─ user-inventory.tsx
│  │  │  │  ├─ users.tsx
│  │  │  │  └─ xp-settings.tsx
│  │  │  ├─ briefing-room/
│  │  │  │  └─ index.tsx
│  │  │  ├─ forum/
│  │  │  │  ├─ [forum_slug].tsx
│  │  │  │  ├─ [id].tsx
│  │  │  │  ├─ [slug].tsx
│  │  │  │  └─ index.tsx
│  │  │  ├─ forums/
│  │  │  │  ├─ [forum_slug].tsx
│  │  │  │  └─ [slug].tsx
│  │  │  ├─ mission-control/
│  │  │  │  └─ index.tsx
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
│  │  │  │  ├─ xp-demo.tsx
│  │  │  │  └─ xp.tsx
│  │  │  ├─ shop-management/
│  │  │  │  ├─ dgt-purchase.tsx
│  │  │  │  └─ purchase-success.tsx
│  │  │  ├─ tags/
│  │  │  │  └─ [tagSlug].tsx
│  │  │  ├─ the-pit/
│  │  │  │  └─ index.tsx
│  │  │  ├─ the-vault/
│  │  │  │  └─ index.tsx
│  │  │  ├─ threads/
│  │  │  │  ├─ [thread_slug].tsx
│  │  │  │  └─ create.tsx
│  │  │  ├─ zones/
│  │  │  │  ├─ [slug].tsx
│  │  │  │  └─ index.tsx
│  │  │  ├─ _app.tsx
│  │  │  ├─ auth-page.tsx
│  │  │  ├─ auth.tsx
│  │  │  ├─ degen-index.tsx
│  │  │  ├─ forum-rules.tsx
│  │  │  ├─ home.tsx
│  │  │  ├─ landing-page.tsx
│  │  │  ├─ leaderboard.tsx
│  │  │  ├─ not-found.tsx
│  │  │  ├─ profile-page.tsx
│  │  │  ├─ shop.tsx
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
│  │  │  ├─ animations.css
│  │  │  ├─ globals.css
│  │  │  ├─ ticker.css
│  │  │  ├─ wallet-animations.css
│  │  │  └─ zone-themes.css
│  │  ├─ types/
│  │  │  ├─ forum.ts
│  │  │  ├─ inventory.ts
│  │  │  ├─ preferences.types.ts
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
│  ├─ CONFIG_MIGRATION_LOG.md
│  ├─ economy.config.ts
│  ├─ postcss.config.js
│  ├─ README.md
│  ├─ tailwind.config.ts
│  └─ vite.config.ts
├─ contracts/
│  └─ degentalk_dev_agreement.md
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
│  │  │  └─ themes.ts
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
│  │  │  └─ xpAdjustmentLogs.ts
│  │  ├─ forum/
│  │  │  ├─ categories.ts
│  │  │  ├─ customEmojis.ts
│  │  │  ├─ postDrafts.ts
│  │  │  ├─ postLikes.ts
│  │  │  ├─ postReactions.ts
│  │  │  ├─ posts.ts
│  │  │  ├─ prefixes.ts
│  │  │  ├─ rules.ts
│  │  │  ├─ stickers.ts
│  │  │  ├─ tags.ts
│  │  │  ├─ threadBookmarks.ts
│  │  │  ├─ threadDrafts.ts
│  │  │  ├─ threadFeaturePermissions.ts
│  │  │  ├─ threads.ts
│  │  │  ├─ threadTags.ts
│  │  │  └─ userRuleAgreements.ts
│  │  ├─ gamification/
│  │  │  ├─ achievements.ts
│  │  │  ├─ leaderboards.ts
│  │  │  ├─ missions.ts
│  │  │  ├─ platformStats.ts
│  │  │  ├─ userAchievements.ts
│  │  │  └─ userMissionProgress.ts
│  │  ├─ integrations/
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
│  │  │  ├─ notifications.ts
│  │  │  └─ rateLimits.ts
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
│  │  │  └─ verificationTokens.ts
│  │  └─ index.ts
│  ├─ dev.db
│  ├─ forum.db
│  ├─ index.ts
│  └─ README.md
├─ docs/
│  ├─ archive/
│  │  └─ FORUM_PRIMARY_ZONES_REFACTOR_PLAN.md
│  ├─ engagement/
│  │  ├─ rain-analytics.md
│  │  └─ tipping-analytics.md
│  ├─ examples/
│  │  └─ admin-users-query.md
│  ├─ forum/
│  │  ├─ backend-setup-guide.md
│  │  ├─ canonical-zones-implementation.md
│  │  ├─ Differences_vs_Legacy.md
│  │  ├─ FORUM_ROUTE_MAP.md
│  │  ├─ FrontendZoneWiring.md
│  │  ├─ RefactorDocsTracker.md
│  │  ├─ SETUP_GUIDE.md
│  │  ├─ ZoneDefinitions.md
│  │  └─ ZONES_MIGRATION_PLAN.md
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
│  ├─ ui/
│  │  ├─ routing-logic.md
│  │  └─ zone-card-design-guidelines.md
│  ├─ .DS_Store
│  ├─ admin-panel-implementation-progress.md
│  ├─ admin-panel-refactoring-plan.md
│  ├─ admin-route-registration-guide.md
│  ├─ audit-findings.md
│  ├─ audit-summary.md
│  ├─ CCPAYMENT.md
│  ├─ CODEBASE_AUDIT_FINDINGS.md
│  ├─ codebase-overview.md
│  ├─ component-tree.md
│  ├─ designworkflow.md
│  ├─ dgt-token-management-plan.md
│  ├─ FORUM_README.md
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
│  ├─ wallet/
│  │  └─ testUtils.ts
│  └─ config-utils.ts
├─ logs/
│  └─ app.log
├─ migrations/
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
│  │  ├─ meta/
│  │  │  ├─ _journal.json
│  │  │  ├─ 0000_snapshot.json
│  │  │  ├─ 0001_snapshot.json
│  │  │  ├─ 0002_snapshot.json
│  │  │  ├─ 0003_snapshot.json
│  │  │  ├─ 0004_snapshot.json
│  │  │  └─ 0005_snapshot.json
│  │  ├─ 0000_rapid_doctor_doom.sql
│  │  ├─ 0001_orange_norrin_radd.sql
│  │  ├─ 0002_broken_viper.sql
│  │  ├─ 0003_faulty_blink.sql
│  │  ├─ 0004_greedy_venom.sql
│  │  └─ 0005_yielding_guardian.sql
│  ├─ .!72442!.DS_Store
│  ├─ .DS_Store
│  ├─ 0007_romantic_colossus.sql
│  ├─ 0007_smooth_sphinx.sql
│  └─ canonical-zones-schema-update.ts
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
│  │  ├─ check-levels-table.ts
│  │  ├─ check-reward-tables.ts
│  │  ├─ create-missing-tables.ts
│  │  ├─ db-schema-summary.js
│  │  ├─ drop-enums.ts
│  │  ├─ fix-forum-relationships.ts
│  │  ├─ initialize-giphy-settings.ts
│  │  ├─ initialize-xp-system.ts
│  │  ├─ migrate.ts
│  │  ├─ neon-to-sqlite.js
│  │  ├─ read-forum-categories.ts
│  │  ├─ read-thread.ts
│  │  ├─ reset-and-seed.ts
│  │  ├─ run-db-summary.cjs
│  │  ├─ seed-badges.ts
│  │  ├─ seed-canonical-zones.ts
│  │  ├─ seed-chat.ts
│  │  ├─ seed-default-levels.ts
│  │  ├─ seed-economy-settings.ts
│  │  ├─ seed-emoji-sticker-shop.ts
│  │  ├─ seed-forum-categories.ts
│  │  ├─ seed-shop.ts
│  │  ├─ seed-threads.ts
│  │  ├─ seed-treasury.ts
│  │  ├─ seed-users.ts
│  │  ├─ seed-vaults.ts
│  │  ├─ seed-xp-actions.ts
│  │  ├─ seed-zone-registry.ts
│  │  ├─ update-forum-slugs.ts
│  │  ├─ update-levels-table.ts
│  │  ├─ update-users-table.ts
│  │  └─ verify-neon-connection.ts
│  ├─ fix-aliases/
│  │  ├─ fix-db-schema-alias.ts
│  │  ├─ rewrite-core-db-imports.ts
│  │  └─ rewrite-schema-imports.ts
│  ├─ ops/
│  │  └─ setup-xp-system.sh
│  ├─ refactor/
│  │  ├─ listUnconsolidatedServerFiles.ts
│  │  ├─ move-configs-and-update-imports.ts
│  │  └─ updateImportPaths.ts
│  ├─ seed/
│  │  ├─ shop/
│  │  │  ├─ emoji-sticker-packs.ts
│  │  │  └─ username-colors.ts
│  │  └─ run-username-colors.ts
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
│  │  └─ validate-routes.js
│  ├─ tools/
│  │  ├─ archive-legacy-admin.sh
│  │  ├─ check-imports.ts
│  │  ├─ generate-tree.js
│  │  ├─ move-deprecated-admin-files.sh
│  │  ├─ update-admin-imports-dry-run.js
│  │  └─ update-admin-imports.js
│  ├─ wallet/
│  │  ├─ archive-deprecated-wallet-files.js
│  │  ├─ migrate-wallet-components.ts
│  │  ├─ migrate-wallet-imports.ts
│  │  └─ wallet-refactor-migration.ts
│  ├─ fix-db-alias.ts
│  ├─ fix-db-schema-alias.ts
│  ├─ README.md
│  ├─ test-admin-xp.js
│  ├─ test-forum-api.ts
│  └─ verify-imports.ts
├─ server/
│  ├─ config/
│  │  └─ loadEnv.ts
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
│  │  ├─ add-emoji-sticker-fields.ts
│  │  └─ xp-clout-levels-migration.ts
│  ├─ routes/
│  │  └─ api/
│  ├─ services/
│  ├─ src/
│  │  ├─ core/
│  │  │  ├─ routes/
│  │  │  │  └─ api/
│  │  │  │     ... (max depth reached)
│  │  │  ├─ db.ts
│  │  │  ├─ errors.ts
│  │  │  ├─ logger.ts
│  │  │  ├─ middleware.ts
│  │  │  ├─ rate-limiter.ts
│  │  │  ├─ vite.ts
│  │  │  └─ wallet-validators.ts
│  │  ├─ cron/
│  │  │  └─ mission-reset.ts
│  │  ├─ domains/
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
│  │  │  │  ├─ services/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ auth.routes.ts
│  │  │  │  └─ index.ts
│  │  │  ├─ ccpayment/
│  │  │  │  ├─ controllers/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ routes/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ services/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ index.ts
│  │  │  │  └─ types.ts
│  │  │  ├─ ccpayment-webhook/
│  │  │  │  ├─ ccpayment-webhook.controller.ts
│  │  │  │  ├─ ccpayment-webhook.routes.ts
│  │  │  │  └─ ccpayment-webhook.service.ts
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
│  │  │  │  └─ forum.service.ts
│  │  │  ├─ messaging/
│  │  │  │  └─ message.routes.ts
│  │  │  ├─ missions/
│  │  │  │  ├─ missions.admin.controller.ts
│  │  │  │  ├─ missions.admin.routes.ts
│  │  │  │  ├─ missions.controller.ts
│  │  │  │  ├─ missions.routes.ts
│  │  │  │  └─ missions.service.ts
│  │  │  ├─ path/
│  │  │  │  ├─ controllers/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ routes/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ services/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ index.ts
│  │  │  │  └─ types.ts
│  │  │  ├─ paths/
│  │  │  │  └─ paths.routes.ts
│  │  │  ├─ preferences/
│  │  │  │  ├─ preferences.routes.ts
│  │  │  │  ├─ preferences.service.ts
│  │  │  │  └─ preferences.validators.ts
│  │  │  ├─ profile/
│  │  │  │  ├─ profile.routes.ts
│  │  │  │  ├─ signature.routes.ts
│  │  │  │  └─ signature.service.ts
│  │  │  ├─ shop/
│  │  │  │  └─ shop.routes.ts
│  │  │  ├─ shoutbox/
│  │  │  │  └─ shoutbox.routes.ts
│  │  │  ├─ social/
│  │  │  │  └─ relationships.routes.ts
│  │  │  ├─ tipping/
│  │  │  │  ├─ controllers/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ routes/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ services/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ index.ts
│  │  │  │  └─ types.ts
│  │  │  ├─ treasury/
│  │  │  │  └─ treasury.routes.ts
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
│  │  │     ├─ controllers/
│  │  │     │  ... (max depth reached)
│  │  │     ├─ events/
│  │  │     │  ... (max depth reached)
│  │  │     ├─ routes/
│  │  │     │  ... (max depth reached)
│  │  │     ├─ services/
│  │  │     │  ... (max depth reached)
│  │  │     ├─ index.ts
│  │  │     ├─ types.ts
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
│  │  │  ├─ validate-request.ts
│  │  │  └─ validate.ts
│  │  ├─ routes/
│  │  │  └─ api/
│  │  │     └─ index.ts
│  │  ├─ utils/
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
│  ├─ README.md
│  ├─ routes.ts
│  ├─ storage.ts
│  └─ vite.ts
├─ shared/
│  ├─ schemas/
│  │  └─ forum.ts
│  ├─ signature/
│  │  └─ SignatureTierConfig.ts
│  ├─ validators/
│  │  └─ admin.ts
│  ├─ constants.ts
│  ├─ path-config.ts
│  ├─ README.md
│  └─ types.ts
├─ Wallet-Workspace/
│  ├─ ccpayment-api-docs/
│  │  ├─ 00-introduction.md
│  │  ├─ 01-api-authentication-and-specifications.md
│  │  └─ 03-testnet.md
│  ├─ client/
│  │  └─ src/
│  │     ├─ components/
│  │     │  ├─ admin/
│  │     │  │  ... (max depth reached)
│  │     │  ├─ economy/
│  │     │  │  ... (max depth reached)
│  │     │  ├─ payment/
│  │     │  │  ... (max depth reached)
│  │     │  └─ sidebar/
│  │     │     ... (max depth reached)
│  │     ├─ contexts/
│  │     │  └─ wallet-context.tsx
│  │     ├─ features/
│  │     │  └─ wallet/
│  │     │     ... (max depth reached)
│  │     ├─ hooks/
│  │     │  ├─ use-rain.ts
│  │     │  ├─ use-tip.ts
│  │     │  └─ useDgtPurchase.ts
│  │     ├─ lib/
│  │     │  └─ queryClient.ts
│  │     ├─ pages/
│  │     │  ├─ admin/
│  │     │  │  ... (max depth reached)
│  │     │  └─ wallet.tsx
│  │     ├─ payments/
│  │     │  └─ ccpayment/
│  │     │     ... (max depth reached)
│  │     ├─ types/
│  │     │  └─ wallet.ts
│  │     ├─ App.tsx
│  │     └─ main.tsx
│  ├─ db/
│  │  ├─ migrations/
│  │  │  └─ meta/
│  │  │     └─ _journal.json
│  │  └─ schema/
│  │     ├─ admin/
│  │     │  ├─ announcements.ts
│  │     │  ├─ auditLogs.ts
│  │     │  ├─ featureFlags.ts
│  │     │  ├─ mediaLibrary.ts
│  │     │  ├─ moderationActions.ts
│  │     │  ├─ reports.ts
│  │     │  ├─ scheduledTasks.ts
│  │     │  ├─ seoMetadata.ts
│  │     │  ├─ siteSettings.ts
│  │     │  ├─ templates.ts
│  │     │  └─ themes.ts
│  │     ├─ core/
│  │     │  └─ enums.ts
│  │     ├─ economy/
│  │     │  ├─ airdropRecords.ts
│  │     │  ├─ airdropSettings.ts
│  │     │  ├─ badges.ts
│  │     │  ├─ dgtPackages.ts
│  │     │  ├─ dgtPurchaseOrders.ts
│  │     │  ├─ levels.ts
│  │     │  ├─ postTips.ts
│  │     │  ├─ rainEvents.ts
│  │     │  ├─ settings.ts
│  │     │  ├─ titles.ts
│  │     │  ├─ transactions.ts
│  │     │  ├─ treasurySettings.ts
│  │     │  ├─ userBadges.ts
│  │     │  ├─ userCommands.ts
│  │     │  ├─ userTitles.ts
│  │     │  ├─ vaults.ts
│  │     │  ├─ wallets.ts
│  │     │  ├─ withdrawalRequests.ts
│  │     │  ├─ xpActionSettings.ts
│  │     │  └─ xpAdjustmentLogs.ts
│  │     ├─ forum/
│  │     │  ├─ categories.ts
│  │     │  ├─ customEmojis.ts
│  │     │  ├─ postDrafts.ts
│  │     │  ├─ postLikes.ts
│  │     │  ├─ postReactions.ts
│  │     │  ├─ posts.ts
│  │     │  ├─ prefixes.ts
│  │     │  ├─ rules.ts
│  │     │  ├─ tags.ts
│  │     │  ├─ threadBookmarks.ts
│  │     │  ├─ threadDrafts.ts
│  │     │  ├─ threadFeaturePermissions.ts
│  │     │  ├─ threads.ts
│  │     │  ├─ threadTags.ts
│  │     │  └─ userRuleAgreements.ts
│  │     ├─ gamification/
│  │     │  ├─ achievements.ts
│  │     │  ├─ leaderboards.ts
│  │     │  ├─ missions.ts
│  │     │  ├─ platformStats.ts
│  │     │  ├─ userAchievements.ts
│  │     │  └─ userMissionProgress.ts
│  │     ├─ integrations/
│  │     ├─ messaging/
│  │     │  ├─ chatRooms.ts
│  │     │  ├─ conversationParticipants.ts
│  │     │  ├─ conversations.ts
│  │     │  ├─ directMessages.ts
│  │     │  ├─ messageReads.ts
│  │     │  ├─ messages.ts
│  │     │  ├─ onlineUsers.ts
│  │     │  └─ shoutboxMessages.ts
│  │     ├─ shop/
│  │     │  ├─ inventoryTransactions.ts
│  │     │  ├─ orderItems.ts
│  │     │  ├─ orders.ts
│  │     │  ├─ productCategories.ts
│  │     │  ├─ productMedia.ts
│  │     │  ├─ products.ts
│  │     │  ├─ signatureItems.ts
│  │     │  ├─ userInventory.ts
│  │     │  └─ userSignatureItems.ts
│  │     ├─ system/
│  │     │  ├─ activityFeed.ts
│  │     │  ├─ airdrop-records.ts
│  │     │  ├─ analyticsEvents.ts
│  │     │  ├─ notifications.ts
│  │     │  └─ rateLimits.ts
│  │     ├─ user/
│  │     │  ├─ avatarFrames.ts
│  │     │  ├─ bans.ts
│  │     │  ├─ featurePermissions.ts
│  │     │  ├─ passwordResetTokens.ts
│  │     │  ├─ permissions.ts
│  │     │  ├─ preferences.ts
│  │     │  ├─ relationships.ts
│  │     │  ├─ rolePermissions.ts
│  │     │  ├─ roles.ts
│  │     │  ├─ sessions.ts
│  │     │  ├─ settingsHistory.ts
│  │     │  ├─ userGroups.ts
│  │     │  ├─ userRoles.ts
│  │     │  ├─ users.ts
│  │     │  └─ verificationTokens.ts
│  │     └─ index.ts
│  ├─ docs/
│  ├─ lib/
│  │  └─ wallet/
│  ├─ logs/
│  │  ├─ app.log
│  │  └─ wallet-server.log
│  ├─ server/
│  │  ├─ src/
│  │  │  ├─ core/
│  │  │  │  ├─ routes/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ db.ts
│  │  │  │  ├─ errors.ts
│  │  │  │  ├─ logger.ts
│  │  │  │  ├─ middleware.ts
│  │  │  │  ├─ rate-limiter.ts
│  │  │  │  ├─ vite.ts
│  │  │  │  └─ wallet-validators.ts
│  │  │  ├─ domains/
│  │  │  │  ├─ admin/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ auth/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ ccpayment/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ ccpayment-webhook/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ engagement/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ tipping/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  └─ wallet/
│  │  │  │     ... (max depth reached)
│  │  │  ├─ test/
│  │  │  │  ├─ ccpayment-webhook/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ engagement/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  └─ wallet/
│  │  │  │     ... (max depth reached)
│  │  │  └─ utils/
│  │  ├─ index.ts
│  │  └─ storage.ts
│  ├─ .cursorignore
│  ├─ .DS_Store
│  ├─ .env.local
│  ├─ drizzle.config.ts
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ README.md
│  ├─ tsconfig.json
│  ├─ tsconfig.server.json
│  ├─ vite.config.ts
│  └─ wallet-scope.md
├─ .DS_Store
├─ .gitignore
├─ ADMIN_PANEL_REFACTOR_LOG.md
├─ components.json
├─ CONTRIBUTORS.md
├─ directory-tree.md
├─ drizzle.config.ts
├─ env.local
├─ FORUM_ROUTING_REFACTOR_PLAN.md
├─ MVP-GUIDE.md
├─ OPTIMIZATION_SUMMARY.md
├─ package-lock.json
├─ package.json
├─ projectBrief.md
├─ README-FORUM.md
├─ README.md
├─ rebrand-degentalk.sh
├─ tsconfig.json
├─ UI_Wiring_Audit_Report.md
└─ wallet-scope.md
```

## Structure Notes

- `server/src/domains/` - Domain-driven backend modules
- `client/src/components/` - Reusable React components
- `client/src/pages/` - Page components corresponding to routes
- `shared/` - Shared code between client and server
