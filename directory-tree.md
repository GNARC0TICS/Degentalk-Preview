# @degentalk/monorepo Directory Structure

Generated on: 2025-07-07

```
├─ .claude/
│  ├─ audit/
�# @degentalk/monorepo Directory Structure

Generated on: 2025-07-07

```
├─ .claude/
│  ├─ audit/
│  │  ├─ 2025-06-29.jsonl
│  │  └─ 2025-06-30.jsonl
│  ├─ mcp.json
│  └─ settings.local.json
├─ .claudedocs/
│  ├─ incidents/
│  │  └─ rca-2025-07-03.md
│  ├─ metrics/
│  │  └─ migration-progress-$(date +%Y%m%d).md
│  └─ reports/
│     ├─ cleanup-workspace-$(date +%Y%m%d).md
│     └─ cleanup-workspace-20250702.md
├─ .clinerules/
│  └─ database-cheatsheet.mdc
├─ .cursor/
│  ├─ rules/
│  │  ├─ composable-domain-architecture.mdc
│  │  ├─ config-first-architecture.mdc
│  │  ├─ forum-permission-enforcement.mdc
│  │  ├─ import-patterns.mdc
│  │  ├─ no-untyped-values.mdc
│  │  ├─ README.md
│  │  └─ schema-consistency.mdc
│  ├─ mcp.json
│  └─ settings.json
├─ .devcontainer/
│  ├─ devcontainer.json
│  └─ setup.sh
├─ .github/
│  ├─ PULL_REQUEST_TEMPLATE/
│  │  └─ migration.md
│  └─ workflows/
│     ├─ ci.yml
│     ├─ migrate.yml
│     ├─ phase5-validation.yml
│     ├─ prebuild.yml
│     ├─ promote-to-prod.yml
│     └─ validate-codebase.yml
├─ .husky/
│  ├─ _/
│  │  ├─ .gitignore
│  │  ├─ h
│  │  ├─ husky.sh
│  │  └─ pre-commit
│  └─ pre-commit
├─ .tscache/
│  └─ .tsbuildinfo
├─ archive/
│  ├─ auth-cleanup-2025-06-26/
│  │  └─ auth/
│  │     ├─ auth-refactor.ts
│  │     ├─ auth-standardize.ts
│  │     └─ fix-auth.ts
│  ├─ component-merge-scripts/
│  │  ├─ app-sidebar-path.js
│  │  ├─ path-progress.js
│  │  ├─ run-dry-run.sh
│  │  ├─ user-avatar.js
│  │  └─ username.js
│  ├─ legacy/
│  │  ├─ codemods/
│  │  │  ├─ apply-id-codemod-tsmorph.ts
│  │  │  ├─ apply-id-codemod.ts
│  │  │  ├─ fix-typescript-uuid-types-safe.ts
│  │  │  ├─ fix-typescript-uuid-types.ts
│  │  │  ├─ generate-id-codemod-plan.ts
│  │  │  ├─ migrate-user-fetch.ts
│  │  │  ├─ replace-degentalk-case.ts
│  │  │  ├─ replace-zonecard-import.cjs
│  │  │  ├─ update-schema-to-uuid.ts
│  │  │  └─ wrap-with-asyncHandler.ts
│  │  └─ wallet/
│  │     ├─ migrate-wallet-components.ts
│  │     ├─ migrate-wallet-imports.ts
│  │     └─ wallet-refactor-migration.ts
│  └─ seed-corrupted/
│     ├─ avatar-frames.ts
│     ├─ dictionary.ts
│     ├─ run-username-colors.ts
│     ├─ seed-all-comprehensive.ts
│     ├─ seed-avatar-frames.ts
│     └─ seedForumsFromConfig.ts
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
│  ├─ .claudedocs/
│  │  ├─ incidents/
│  │  └─ reports/
│  ├─ .tscache/
│  │  └─ .tsbuildinfo
│  ├─ public/
│  │  ├─ assets/
│  │  │  └─ frames/
│  │  │     ├─ bronze-frame.svg
│  │  │     ├─ cyber-circuit-frame.svg
│  │  │     ├─ diamond-crown-frame.svg
│  │  │     ├─ electric-blue-frame.svg
│  │  │     ├─ gold-frame.svg
│  │  │     ├─ og-beta-frame.svg
│  │  │     └─ silver-frame.svg
│  │  └─ images/
│  │     ├─ Dgen.PNG
│  │     ├─ DGNSHOP.PNG
│  │     ├─ DGNZONES.PNG
│  │     ├─ ForumsGrafitti.PNG
│  │     └─ profile-background.png
│  ├─ src/
│  │  ├─ __tests__/
│  │  │  ├─ services/
│  │  │  │  └─ error.service.test.ts
│  │  │  ├─ types/
│  │  │  │  └─ admin.types.test.ts
│  │  │  └─ admin-modules.test.ts
│  │  ├─ components/
│  │  │  ├─ admin/
│  │  │  │  ├─ clout/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ common/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ effects/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ form-controls/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ forms/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ inputs/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ layout/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ media/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ permissions/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ roles/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ titles/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ wallet/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ AdminDashboard.tsx
│  │  │  │  ├─ AdminThemeProvider.tsx
│  │  │  │  ├─ cooldown-settings.tsx
│  │  │  │  ├─ GrantFrameModal.tsx
│  │  │  │  ├─ ModularAdminLayout.tsx
│  │  │  │  ├─ ModularAdminSidebar.tsx
│  │  │  │  ├─ protected-admin-route.tsx
│  │  │  │  ├─ README.md
│  │  │  │  ├─ simple-menu.tsx
│  │  │  │  ├─ VisualJsonTabs.tsx
│  │  │  │  └─ XpActionRow.tsx
│  │  │  ├─ auth/
│  │  │  │  ├─ GlobalRouteGuard.tsx
│  │  │  │  ├─ index.ts
│  │  │  │  ├─ protected-route.tsx
│  │  │  │  ├─ ProtectedRoute.tsx
│  │  │  │  ├─ README-MIGRATION.md
│  │  │  │  ├─ README.md
│  │  │  │  ├─ RequireRole.tsx
│  │  │  │  ├─ RouteGuards.tsx
│  │  │  │  └─ withRouteProtection.tsx
│  │  │  ├─ common/
│  │  │  │  ├─ BackToHomeButton.tsx
│  │  │  │  ├─ Breadcrumb.tsx
│  │  │  │  ├─ index.ts
│  │  │  │  ├─ LoadingCard.tsx
│  │  │  │  ├─ StandardErrorDisplay.tsx
│  │  │  │  └─ StatsBar.tsx
│  │  │  ├─ dashboard/
│  │  │  │  ├─ DailyTasksWidget.tsx
│  │  │  │  └─ UpcomingEventsWidget.tsx
│  │  │  ├─ dev/
│  │  │  │  ├─ dev-playground-shortcut.tsx
│  │  │  │  └─ dev-role-switcher.tsx
│  │  │  ├─ economy/
│  │  │  │  ├─ badges/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ shoutbox/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ wallet/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ xp/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ wallet-display.tsx
│  │  │  │  └─ WalletDashboard.tsx
│  │  │  ├─ editor/
│  │  │  │  ├─ enhanced-gif-picker.tsx
│  │  │  │  ├─ gif-picker.tsx
│  │  │  │  ├─ rich-text-editor.tsx
│  │  │  │  └─ suggestion.ts
│  │  │  ├─ errors/
│  │  │  │  ├─ AdminErrorBoundary.tsx
│  │  │  │  ├─ ErrorBoundary.tsx
│  │  │  │  ├─ ForumNotFound.tsx
│  │  │  │  ├─ NetworkError.tsx
│  │  │  │  ├─ ThreadNotFound.tsx
│  │  │  │  └─ UserNotFound.tsx
│  │  │  ├─ fixtures/
│  │  │  │  ├─ fixture-builder.tsx
│  │  │  │  └─ fixture-preview.tsx
│  │  │  ├─ footer/
│  │  │  │  ├─ FooterBrand.tsx
│  │  │  │  ├─ FooterSection.tsx
│  │  │  │  ├─ index.ts
│  │  │  │  ├─ LiveStats.tsx
│  │  │  │  ├─ RandomTagline.tsx
│  │  │  │  └─ SiteFooter.tsx
│  │  │  ├─ forum/
│  │  │  │  ├─ bbcode/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ enhanced/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ layouts/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ sidebar/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ BBCodePostCard.tsx
│  │  │  │  ├─ breadcrumb-nav.tsx
│  │  │  │  ├─ CanonicalZoneGrid.tsx
│  │  │  │  ├─ category-card.tsx
│  │  │  │  ├─ CreateThreadButton.tsx
│  │  │  │  ├─ forum-card.tsx
│  │  │  │  ├─ forum-category-card.tsx
│  │  │  │  ├─ forum-filters.tsx
│  │  │  │  ├─ forum-guidelines.tsx
│  │  │  │  ├─ ForumErrorBoundary.tsx
│  │  │  │  ├─ ForumHeader.tsx
│  │  │  │  ├─ ForumPage.tsx
│  │  │  │  ├─ HotTopics.tsx
│  │  │  │  ├─ index.ts
│  │  │  │  ├─ LegacyForumRedirect.tsx
│  │  │  │  ├─ ModeratorActions.tsx
│  │  │  │  ├─ OriginForumPill.tsx
│  │  │  │  ├─ prefix-badge.tsx
│  │  │  │  ├─ ProfileCard.tsx
│  │  │  │  ├─ QuickReplyInput.tsx
│  │  │  │  ├─ QuickStats.tsx
│  │  │  │  ├─ ReactionBar.tsx
│  │  │  │  ├─ RecentActivity.tsx
│  │  │  │  ├─ ShareButton.tsx
│  │  │  │  ├─ ShopCard.tsx
│  │  │  │  ├─ SignatureRenderer.tsx
│  │  │  │  ├─ SolveBadge.tsx
│  │  │  │  ├─ StickyBackButton.tsx
│  │  │  │  ├─ tag-input.tsx
│  │  │  │  ├─ ThreadAuthor.tsx
│  │  │  │  ├─ ThreadCard.tsx
│  │  │  │  ├─ ThreadFilters.tsx
│  │  │  │  ├─ ThreadPagination.tsx
│  │  │  │  ├─ ThreadRow.tsx
│  │  │  │  ├─ ThreadSidebar.tsx
│  │  │  │  ├─ ThreadStats.tsx
│  │  │  │  ├─ UserLevelDisplay.tsx
│  │  │  │  ├─ XpBoostBadge.tsx
│  │  │  │  ├─ zone-group.tsx
│  │  │  │  ├─ ZoneCard.tsx
│  │  │  │  └─ ZoneStats.tsx
│  │  │  ├─ gamification/
│  │  │  │  ├─ achievement-card.tsx
│  │  │  │  ├─ achievement-grid.tsx
│  │  │  │  ├─ achievement-unlock-modal.tsx
│  │  │  │  ├─ index.ts
│  │  │  │  ├─ leaderboard.tsx
│  │  │  │  ├─ level-display.tsx
│  │  │  │  ├─ level-up-modal.tsx
│  │  │  │  ├─ mission-card.tsx
│  │  │  │  ├─ mission-dashboard.tsx
│  │  │  │  ├─ profile-gamification-widget.tsx
│  │  │  │  ├─ progression-card.tsx
│  │  │  │  └─ ProgressPath.tsx
│  │  │  ├─ header/
│  │  │  │  ├─ AdminButton.tsx
│  │  │  │  ├─ AuthButtons.tsx
│  │  │  │  ├─ HeaderContext.tsx
│  │  │  │  ├─ HeaderPluginSlot.tsx
│  │  │  │  ├─ HeaderThemeWrapper.tsx
│  │  │  │  ├─ index.ts
│  │  │  │  ├─ Logo.tsx
│  │  │  │  ├─ MobileNav.tsx
│  │  │  │  ├─ NavLink.tsx
│  │  │  │  ├─ NotificationButton.tsx
│  │  │  │  ├─ PrimaryNav.tsx
│  │  │  │  ├─ SearchBox.tsx
│  │  │  │  ├─ SiteHeader.tsx
│  │  │  │  ├─ UserMenu.tsx
│  │  │  │  └─ WalletButton.tsx
│  │  │  ├─ icons/
│  │  │  │  ├─ custom/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ icon-usage-snapshot.txt
│  │  │  │  ├─ iconLoader.ts
│  │  │  │  ├─ iconMap.config.ts
│  │  │  │  ├─ iconRenderer.tsx
│  │  │  │  ├─ README.md
│  │  │  │  └─ types.ts
│  │  │  ├─ identity/
│  │  │  │  ├─ AvatarFrame.tsx
│  │  │  │  ├─ index.ts
│  │  │  │  ├─ LevelBadge.tsx
│  │  │  │  ├─ README.md
│  │  │  │  ├─ RoleBadge.tsx
│  │  │  │  └─ UserName.tsx
│  │  │  ├─ layout/
│  │  │  │  ├─ announcement-ticker.css
│  │  │  │  ├─ announcement-ticker.tsx
│  │  │  │  ├─ AppSidebar.tsx
│  │  │  │  ├─ hero-section.tsx
│  │  │  │  ├─ LayoutRenderer.tsx
│  │  │  │  ├─ ProfileBackground.tsx
│  │  │  │  ├─ ResponsiveLayoutWrapper.tsx
│  │  │  │  ├─ sidebar.tsx
│  │  │  │  ├─ SidebarNavigation.tsx
│  │  │  │  ├─ site-layout-wrapper.tsx
│  │  │  │  ├─ SlotRenderer.tsx
│  │  │  │  ├─ WidgetFrame.tsx
│  │  │  │  └─ WidgetGallery.tsx
│  │  │  ├─ media/
│  │  │  │  └─ MediaAsset.tsx
│  │  │  ├─ mentions/
│  │  │  │  ├─ MentionAutocomplete.tsx
│  │  │  │  └─ MentionRenderer.tsx
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
│  │  │  ├─ modals/
│  │  │  │  ├─ DeleteConfirmModal.tsx
│  │  │  │  ├─ QuotePostModal.tsx
│  │  │  │  └─ TipPostModal.tsx
│  │  │  ├─ navigation/
│  │  │  │  ├─ ForumBreadcrumbs.tsx
│  │  │  │  ├─ mobile-nav-bar.tsx
│  │  │  │  └─ nav-item.tsx
│  │  │  ├─ notifications/
│  │  │  │  ├─ MentionsNotifications.tsx
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
│  │  │  │  ├─ session-preferences.tsx
│  │  │  │  └─ social-preferences.tsx
│  │  │  ├─ profile/
│  │  │  │  ├─ widgets/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ AchievementsTab.tsx
│  │  │  │  ├─ CosmeticControlPanel.tsx
│  │  │  │  ├─ FriendsTab.tsx
│  │  │  │  ├─ index.ts
│  │  │  │  ├─ InventoryTab.tsx
│  │  │  │  ├─ OverviewTab.tsx
│  │  │  │  ├─ ProfileCard.tsx
│  │  │  │  ├─ ProfileDashboard.tsx
│  │  │  │  ├─ ProfileEditor.tsx
│  │  │  │  ├─ ProfileNavigation.tsx
│  │  │  │  ├─ ProfileSidebar.tsx
│  │  │  │  ├─ ProfileSkeleton.tsx
│  │  │  │  ├─ rarityUtils.ts
│  │  │  │  ├─ README.md
│  │  │  │  ├─ SignatureRenderer.tsx
│  │  │  │  ├─ StatCard.tsx
│  │  │  │  ├─ UnifiedProfileCard.tsx
│  │  │  │  ├─ UserBadges.tsx
│  │  │  │  ├─ UserProfileRenderer.tsx
│  │  │  │  ├─ UserTitles.tsx
│  │  │  │  ├─ WhaleWatchTab.tsx
│  │  │  │  ├─ XpLogView.tsx
│  │  │  │  ├─ XPProfileSection.tsx
│  │  │  │  └─ XPProgressBar.tsx
│  │  │  ├─ shop/
│  │  │  │  ├─ purchase-modal.tsx
│  │  │  │  ├─ shop-item-card.tsx
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
│  │  │  │  ├─ shoutbox.spec.tsx
│  │  │  │  ├─ ShoutboxContainer.tsx
│  │  │  │  └─ ShoutboxInput.tsx
│  │  │  ├─ sidebar/
│  │  │  │  ├─ leaderboard-widget.tsx
│  │  │  │  ├─ navigation-widget.tsx
│  │  │  │  ├─ related-content-widget.tsx
│  │  │  │  └─ wallet-summary-widget.tsx
│  │  │  ├─ skeletons/
│  │  │  │  ├─ HomePageSkeleton.tsx
│  │  │  │  └─ ZoneCardSkeleton.tsx
│  │  │  ├─ social/
│  │  │  │  ├─ FollowButton.tsx
│  │  │  │  ├─ FollowingList.tsx
│  │  │  │  ├─ FriendsManager.tsx
│  │  │  │  ├─ WhaleWatchDashboard.tsx
│  │  │  │  └─ WhaleWatchDisplay.tsx
│  │  │  ├─ test/
│  │  │  │  └─ RoleTest.tsx
│  │  │  ├─ ui/
│  │  │  │  ├─ accessibility-enhancements.tsx
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
│  │  │  │  ├─ Container.tsx
│  │  │  │  ├─ content-area.tsx
│  │  │  │  ├─ content-feed.tsx
│  │  │  │  ├─ context-menu.tsx
│  │  │  │  ├─ dialog.tsx
│  │  │  │  ├─ drawer.tsx
│  │  │  │  ├─ dropdown-menu.tsx
│  │  │  │  ├─ enhanced-button.tsx
│  │  │  │  ├─ enhanced-loading-states.tsx
│  │  │  │  ├─ enhanced-notifications.tsx
│  │  │  │  ├─ enhanced-thread-card.tsx
│  │  │  │  ├─ error-display.tsx
│  │  │  │  ├─ feature-gate.tsx
│  │  │  │  ├─ file-drop-zone.tsx
│  │  │  │  ├─ form.tsx
│  │  │  │  ├─ frost-card.tsx
│  │  │  │  ├─ hamburger.tsx
│  │  │  │  ├─ hover-card.tsx
│  │  │  │  ├─ index.ts
│  │  │  │  ├─ input-otp.tsx
│  │  │  │  ├─ input.tsx
│  │  │  │  ├─ label.tsx
│  │  │  │  ├─ loader.tsx
│  │  │  │  ├─ menu.tsx
│  │  │  │  ├─ menubar.tsx
│  │  │  │  ├─ mobile-forum-nav.tsx
│  │  │  │  ├─ navigation-menu.tsx
│  │  │  │  ├─ pagination.tsx
│  │  │  │  ├─ popover.tsx
│  │  │  │  ├─ progress.tsx
│  │  │  │  ├─ radio-group.tsx
│  │  │  │  ├─ reactions-bar.tsx
│  │  │  │  ├─ resizable.tsx
│  │  │  │  ├─ safe-image.tsx
│  │  │  │  ├─ scroll-area.tsx
│  │  │  │  ├─ select.tsx
│  │  │  │  ├─ seo-head.tsx
│  │  │  │  ├─ separator.tsx
│  │  │  │  ├─ sheet.tsx
│  │  │  │  ├─ sidebar.tsx
│  │  │  │  ├─ skeleton.tsx
│  │  │  │  ├─ slider.tsx
│  │  │  │  ├─ smart-thread-filters.tsx
│  │  │  │  ├─ stat-chip.tsx
│  │  │  │  ├─ switch.tsx
│  │  │  │  ├─ tab-switcher.tsx
│  │  │  │  ├─ table.tsx
│  │  │  │  ├─ tabs.tsx
│  │  │  │  ├─ tag-badge.tsx
│  │  │  │  ├─ textarea.tsx
│  │  │  │  ├─ thread-skeleton.tsx
│  │  │  │  ├─ toast.tsx
│  │  │  │  ├─ toaster.tsx
│  │  │  │  ├─ toggle-group.tsx
│  │  │  │  ├─ toggle.tsx
│  │  │  │  ├─ tooltip-utils.tsx
│  │  │  │  ├─ tooltip.tsx
│  │  │  │  ├─ user-badge.tsx
│  │  │  │  └─ widget-skeleton.tsx
│  │  │  ├─ uiverse-clones/
│  │  │  ├─ users/
│  │  │  │  ├─ ActiveMembersWidget.tsx
│  │  │  │  ├─ framed-avatar.tsx
│  │  │  │  ├─ index.ts
│  │  │  │  ├─ UserAvatar.tsx
│  │  │  │  ├─ UserCard.tsx
│  │  │  │  ├─ UserDirectoryTable.tsx
│  │  │  │  ├─ UserFilters.tsx
│  │  │  │  └─ Username.tsx
│  │  │  ├─ widgets/
│  │  │  │  ├─ ProfileCard.tsx
│  │  │  │  └─ README.md
│  │  │  ├─ xp/
│  │  │  │  ├─ LevelUpModal.tsx
│  │  │  │  ├─ tracks.ts
│  │  │  │  ├─ XPBarsContainer.tsx
│  │  │  │  ├─ XPBarTrack.tsx
│  │  │  │  └─ XpToast.tsx
│  │  │  ├─ zone/
│  │  │  │  └─ PrimaryZoneCarousel.tsx
│  │  │  └─ ErrorBoundary.tsx
│  │  ├─ config/
│  │  │  ├─ animation.config.ts
│  │  │  ├─ brand.config.ts
│  │  │  ├─ easter-eggs.config.ts
│  │  │  ├─ featureFlags.ts
│  │  │  ├─ fonts.config.ts
│  │  │  ├─ footer-navigation.ts
│  │  │  ├─ forum-layouts.config.ts
│  │  │  ├─ forumMap.config.ts
│  │  │  ├─ frames.config.ts
│  │  │  ├─ navigation.ts
│  │  │  ├─ pageSlotMap.ts
│  │  │  ├─ pagination.config.ts
│  │  │  ├─ publicConfig.ts
│  │  │  ├─ rarity.config.ts
│  │  │  ├─ README.md
│  │  │  ├─ shop-items.config.ts
│  │  │  ├─ sidebarWidgets.config.ts
│  │  │  ├─ social.config.ts
│  │  │  ├─ tags.config.ts
│  │  │  ├─ themeConstants.ts
│  │  │  ├─ themeFallbacks.ts
│  │  │  ├─ thread.config.ts
│  │  │  ├─ ui.config.ts
│  │  │  └─ widgetRegistry.ts
│  │  ├─ constants/
│  │  │  ├─ apiRoutes.ts
│  │  │  ├─ env.ts
│  │  │  ├─ routes.ts
│  │  │  └─ websocket-disabled.ts
│  │  ├─ contexts/
│  │  │  ├─ AdminSidebarContext.tsx
│  │  │  ├─ content-feed-context.tsx
│  │  │  ├─ ForumOrderingContext.tsx
│  │  │  ├─ ForumStructureContext.tsx
│  │  │  ├─ ForumThemeProvider.tsx
│  │  │  ├─ LevelUpContext.tsx
│  │  │  ├─ mock-shoutbox-context.tsx
│  │  │  ├─ MotionContext.tsx
│  │  │  ├─ ProfileCardContext.tsx
│  │  │  ├─ safe-shoutbox-provider.tsx
│  │  │  ├─ shoutbox-context.tsx
│  │  │  ├─ wallet-context.tsx
│  │  │  └─ XpToastContext.tsx
│  │  ├─ core/
│  │  │  ├─ api.ts
│  │  │  ├─ constants.ts
│  │  │  ├─ polyfills.js
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
│  │  │  │  ├─ api/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ components/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ hooks/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  └─ services/
│  │  │  │     ... (max depth reached)
│  │  │  ├─ dictionary/
│  │  │  │  ├─ components/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  └─ services/
│  │  │  │     ... (max depth reached)
│  │  │  ├─ forum/
│  │  │  │  ├─ components/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ contexts/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ hooks/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  └─ services/
│  │  │  │     ... (max depth reached)
│  │  │  ├─ gamification/
│  │  │  │  ├─ services/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  └─ README.md
│  │  │  ├─ users/
│  │  │  │  ├─ hooks/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  └─ services/
│  │  │  │     ... (max depth reached)
│  │  │  └─ wallet/
│  │  │     └─ services/
│  │  │        ... (max depth reached)
│  │  ├─ hooks/
│  │  │  ├─ __tests__/
│  │  │  │  └─ useMediaQuery.test.tsx
│  │  │  ├─ preferences/
│  │  │  │  ├─ useUpdateUserSettings.ts
│  │  │  │  └─ useUserSettings.ts
│  │  │  ├─ wrappers/
│  │  │  │  └─ use-auth-wrapper.ts
│  │  │  ├─ index.ts
│  │  │  ├─ README.md
│  │  │  ├─ use-achievements.ts
│  │  │  ├─ use-admin-modules.ts
│  │  │  ├─ use-async-button.tsx
│  │  │  ├─ use-auth.tsx
│  │  │  ├─ use-content.ts
│  │  │  ├─ use-debounce.ts
│  │  │  ├─ use-dgt-packages.ts
│  │  │  ├─ use-draft.ts
│  │  │  ├─ use-gamification.tsx
│  │  │  ├─ use-local-storage.ts
│  │  │  ├─ use-media-query.ts
│  │  │  ├─ use-mentions.ts
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
│  │  │  ├─ use-wallet.ts
│  │  │  ├─ useConfig.ts
│  │  │  ├─ useCrudMutation.ts
│  │  │  ├─ useDailyTasks.ts
│  │  │  ├─ useDgtPurchase.ts
│  │  │  ├─ useFeatureGates.ts
│  │  │  ├─ useFollowing.ts
│  │  │  ├─ useForumFilters.ts
│  │  │  ├─ useFriends.ts
│  │  │  ├─ useIdentityDisplay.ts
│  │  │  ├─ useJsonConfig.ts
│  │  │  ├─ useMediaQuery.ts
│  │  │  ├─ useMissions.ts
│  │  │  ├─ usePermission.ts
│  │  │  ├─ useProfileEngagement.ts
│  │  │  ├─ useProfileStats.ts
│  │  │  ├─ useRouteProtection.ts
│  │  │  ├─ useSearchParams.ts
│  │  │  ├─ useShowHotRibbon.ts
│  │  │  ├─ useThreadZone.ts
│  │  │  ├─ useUserCosmetics.ts
│  │  │  ├─ useUserInventory.ts
│  │  │  ├─ useUserXP.ts
│  │  │  ├─ useXP.ts
│  │  │  ├─ useZoneStats.ts
│  │  │  └─ widgetData.ts
│  │  ├─ layout/
│  │  │  └─ primitives/
│  │  │     ├─ ClampPadding.tsx
│  │  │     ├─ FullBleedSection.tsx
│  │  │     ├─ index.ts
│  │  │     ├─ PageBackdrop.tsx
│  │  │     ├─ Prose.tsx
│  │  │     ├─ StickyRegion.tsx
│  │  │     └─ Wide.tsx
│  │  ├─ lib/
│  │  │  ├─ api/
│  │  │  │  └─ achievements.ts
│  │  │  ├─ forum/
│  │  │  │  ├─ breadcrumbs.ts
│  │  │  │  ├─ sidebarUtils.ts
│  │  │  │  └─ urls.ts
│  │  │  ├─ utils/
│  │  │  │  ├─ animateNumber.ts
│  │  │  │  ├─ api-helpers.ts
│  │  │  │  ├─ applyPluginRewards.ts
│  │  │  │  ├─ category.ts
│  │  │  │  ├─ cosmeticsUtils.tsx
│  │  │  │  └─ generateSlug.ts
│  │  │  ├─ admin-route.tsx
│  │  │  ├─ admin-utils.ts
│  │  │  ├─ admin-vault-service.ts
│  │  │  ├─ adminApi.ts
│  │  │  ├─ api-request.ts
│  │  │  ├─ api-response.ts
│  │  │  ├─ api.ts
│  │  │  ├─ format-date.ts
│  │  │  ├─ formatters.ts
│  │  │  ├─ queryClient.ts
│  │  │  ├─ rare-items-vault.ts
│  │  │  ├─ roles.ts
│  │  │  ├─ routeConfig.ts
│  │  │  ├─ safeWebSocket.ts
│  │  │  └─ utils.ts
│  │  ├─ navigation/
│  │  │  └─ forumNav.ts
│  │  ├─ pages/
│  │  │  ├─ admin/
│  │  │  │  ├─ activity/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ announcements/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ clout/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ config/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ dev/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ dictionary/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ features/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ missions/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ permissions/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ reports/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ shop/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ stats/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ transactions/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ ui/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ users/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ wallets/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ xp/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ ad-management.tsx
│  │  │  │  ├─ admin-layout.tsx
│  │  │  │  ├─ airdrop.tsx
│  │  │  │  ├─ avatar-frames.tsx
│  │  │  │  ├─ brand-config.tsx
│  │  │  │  ├─ categories.tsx
│  │  │  │  ├─ database-config.tsx
│  │  │  │  ├─ dgt-packages.tsx
│  │  │  │  ├─ emojis.tsx
│  │  │  │  ├─ feature-flags.tsx
│  │  │  │  ├─ forum-structure.tsx
│  │  │  │  ├─ index.tsx
│  │  │  │  ├─ live-database.tsx
│  │  │  │  ├─ prefixes.tsx
│  │  │  │  ├─ README.md
│  │  │  │  ├─ roles-titles.tsx
│  │  │  │  ├─ roles.tsx
│  │  │  │  ├─ shoutbox.tsx
│  │  │  │  ├─ social-config.tsx
│  │  │  │  ├─ stickers.tsx
│  │  │  │  ├─ system-analytics.tsx
│  │  │  │  ├─ tags.tsx
│  │  │  │  ├─ tip-rain-settings.tsx
│  │  │  │  ├─ treasury.tsx
│  │  │  │  ├─ ui-config.tsx
│  │  │  │  ├─ users.tsx
│  │  │  │  └─ xp-system.tsx
│  │  │  ├─ announcements/
│  │  │  │  └─ index.tsx
│  │  │  ├─ dev/
│  │  │  │  ├─ ControlsDrawer.tsx
│  │  │  │  ├─ DemoCard.tsx
│  │  │  │  ├─ DevPlaygroundLayout.tsx
│  │  │  │  └─ index.ts
│  │  │  ├─ dictionary/
│  │  │  │  ├─ [slug].tsx
│  │  │  │  └─ index.tsx
│  │  │  ├─ forums/
│  │  │  │  ├─ [forumSlug].tsx
│  │  │  │  ├─ index.tsx
│  │  │  │  └─ search.tsx
│  │  │  ├─ invite/
│  │  │  │  └─ [code].tsx
│  │  │  ├─ missions/
│  │  │  │  └─ index.tsx
│  │  │  ├─ mod/
│  │  │  │  ├─ activity.tsx
│  │  │  │  ├─ index.tsx
│  │  │  │  ├─ reports.tsx
│  │  │  │  ├─ shoutbox.tsx
│  │  │  │  └─ users.tsx
│  │  │  ├─ preferences/
│  │  │  │  └─ index.tsx
│  │  │  ├─ profile/
│  │  │  │  ├─ [username].tsx
│  │  │  │  ├─ activity.tsx
│  │  │  │  ├─ xp-demo.tsx
│  │  │  │  └─ xp.tsx
│  │  │  ├─ referrals/
│  │  │  │  └─ index.tsx
│  │  │  ├─ search/
│  │  │  │  └─ index.tsx
│  │  │  ├─ shop/
│  │  │  │  └─ avatar-frames.tsx
│  │  │  ├─ shop-management/
│  │  │  │  ├─ dgt-purchase.tsx
│  │  │  │  └─ purchase-success.tsx
│  │  │  ├─ tags/
│  │  │  │  └─ [tagSlug].tsx
│  │  │  ├─ threads/
│  │  │  │  ├─ BBCodeThreadPage.tsx
│  │  │  │  └─ create.tsx
│  │  │  ├─ ui-playground/
│  │  │  │  ├─ animations/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ sections/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  └─ demo-data.ts
│  │  │  ├─ zones/
│  │  │  │  ├─ [slug].tsx
│  │  │  │  └─ index.tsx
│  │  │  ├─ auth.tsx
│  │  │  ├─ degen-index.tsx
│  │  │  ├─ fixtures-dashboard.tsx
│  │  │  ├─ forum-rules.tsx
│  │  │  ├─ home.tsx
│  │  │  ├─ leaderboard.tsx
│  │  │  ├─ not-found.tsx
│  │  │  ├─ progress.tsx
│  │  │  ├─ RouteProtectionDemo.tsx
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
│  │  │  └─ root-provider.tsx
│  │  ├─ schemas/
│  │  │  ├─ assertValid.ts
│  │  │  ├─ brand.schema.ts
│  │  │  ├─ featureFlags.schema.ts
│  │  │  └─ uiQuotes.schema.ts
│  │  ├─ services/
│  │  │  └─ error.service.ts
│  │  ├─ stores/
│  │  │  ├─ useLayoutStore.ts
│  │  │  └─ usePlaygroundControls.ts
│  │  ├─ styles/
│  │  │  ├─ tokens/
│  │  │  │  └─ animations.css
│  │  │  ├─ accessibility.css
│  │  │  ├─ admin-theme.css
│  │  │  ├─ animations.css
│  │  │  ├─ avatar-frames.css
│  │  │  ├─ content-feed.css
│  │  │  ├─ cssVariables.ts
│  │  │  ├─ globals.css
│  │  │  ├─ underline-links.css
│  │  │  └─ utilities.css
│  │  ├─ test/
│  │  │  ├─ utils/
│  │  │  │  └─ renderWithProviders.tsx
│  │  │  └─ setup.ts
│  │  ├─ types/
│  │  │  ├─ compat/
│  │  │  │  ├─ avatar.ts
│  │  │  │  ├─ brand.ts
│  │  │  │  ├─ economy.ts
│  │  │  │  ├─ forum.ts
│  │  │  │  └─ user.ts
│  │  │  ├─ admin.types.ts
│  │  │  ├─ canonical.types.ts
│  │  │  ├─ core.types.ts
│  │  │  ├─ forum.ts
│  │  │  ├─ gamification.types.ts
│  │  │  ├─ ids.ts
│  │  │  ├─ inventory.ts
│  │  │  ├─ notifications.ts
│  │  │  ├─ payment.types.ts
│  │  │  ├─ preferences.types.ts
│  │  │  ├─ profile.ts
│  │  │  ├─ thread.types.ts
│  │  │  ├─ user.ts
│  │  │  ├─ vault.types.ts
│  │  │  └─ wallet.ts
│  │  ├─ utils/
│  │  │  ├─ dev/
│  │  │  │  └─ mockProfile.ts
│  │  │  ├─ adaptiveSpacing.ts
│  │  │  ├─ avatar.ts
│  │  │  ├─ card-constants.ts
│  │  │  ├─ format.ts
│  │  │  ├─ forum-routing-helper.ts
│  │  │  ├─ forum-urls.ts
│  │  │  ├─ forumStats.ts
│  │  │  ├─ README-MIGRATION.md
│  │  │  └─ spacing-constants.ts
│  │  ├─ App.tsx
│  │  ├─ index.css
│  │  ├─ main.tsx
│  ├─ .eslintignore
│  ├─ index.html
│  ├─ package.json
│  ├─ postcss.config.js
│  ├─ README.md
│  ├─ tailwind.config.ts
│  ├─ tsconfig.eslint.json
│  ├─ tsconfig.json
│  ├─ vite.config.ts
│  └─ vitest.config.ts
├─ config/
│  ├─ postcss.config.js
│  ├─ README.md
│  ├─ tailwind.config.ts
│  └─ vite.config.ts
├─ db/
│  ├─ .claudedocs/
│  │  ├─ metrics/
│  │  └─ reports/
│  ├─ migrations/
│  │  ├─ 2025-06-24_admin_performance_indices/
│  │  │  ├─ down.sql
│  │  │  ├─ metadata.json
│  │  │  └─ migration.sql
│  │  ├─ 2025-06-24_level_visual_fields/
│  │  │  ├─ down.sql
│  │  │  ├─ metadata.json
│  │  │  └─ migration.sql
│  │  ├─ 2025-06-24_backup_restore_system.sql
│  │  ├─ 2025-06-24_email_templates.sql
│  │  ├─ 2025-06-24_sticker_system.sql
│  │  ├─ 20250128_enhanced_achievements_system.sql
│  │  ├─ 20250701_fix_wallet_columns.sql
│  │  └─ 20250703_shoutbox_user_id_to_uuid.sql
│  ├─ schema/
│  │  ├─ admin/
│  │  │  ├─ announcements.ts
│  │  │  ├─ auditLogs.ts
│  │  │  ├─ backups.ts
│  │  │  ├─ brandConfig.ts
│  │  │  ├─ emailTemplates.ts
│  │  │  ├─ featureFlags.ts
│  │  │  ├─ mediaLibrary.ts
│  │  │  ├─ moderationActions.ts
│  │  │  ├─ moderator-notes.ts
│  │  │  ├─ relations.ts
│  │  │  ├─ reports.ts
│  │  │  ├─ scheduledTasks.ts
│  │  │  ├─ seoMetadata.ts
│  │  │  ├─ shoutboxConfig.ts
│  │  │  ├─ siteSettings.ts
│  │  │  ├─ templates.ts
│  │  │  ├─ themes.ts
│  │  │  ├─ uiConfig.ts
│  │  │  └─ uiThemes.ts
│  │  ├─ advertising/
│  │  │  ├─ campaigns.ts
│  │  │  ├─ payments.ts
│  │  │  ├─ performance.ts
│  │  │  ├─ placements.ts
│  │  │  ├─ relations.ts
│  │  │  ├─ targeting.ts
│  │  │  └─ user-promotions.ts
│  │  ├─ collectibles/
│  │  │  ├─ relations.ts
│  │  │  └─ stickers.ts
│  │  ├─ core/
│  │  │  ├─ enums/
│  │  │  │  └─ index.ts
│  │  │  └─ enums.ts
│  │  ├─ dictionary/
│  │  │  ├─ entries.ts
│  │  │  ├─ relations.ts
│  │  │  └─ upvotes.ts
│  │  ├─ economy/
│  │  │  ├─ airdropRecords.ts
│  │  │  ├─ airdropSettings.ts
│  │  │  ├─ badges.ts
│  │  │  ├─ cloutAchievements.ts
│  │  │  ├─ dgtPackages.ts
│  │  │  ├─ dgtPurchaseOrders.ts
│  │  │  ├─ levels.ts
│  │  │  ├─ postTips.ts
│  │  │  ├─ rainEvents.ts
│  │  │  ├─ relations.ts
│  │  │  ├─ settings.ts
│  │  │  ├─ titles.ts
│  │  │  ├─ transactions.ts
│  │  │  ├─ treasurySettings.ts
│  │  │  ├─ userBadges.ts
│  │  │  ├─ userCloutLog.ts
│  │  │  ├─ userCommands.ts
│  │  │  ├─ userTitles.ts
│  │  │  ├─ vaults.ts
│  │  │  ├─ wallets.ts
│  │  │  ├─ withdrawalRequests.ts
│  │  │  ├─ xpActionSettings.ts
│  │  │  ├─ xpAdjustmentLogs.ts
│  │  │  ├─ xpCloutSettings.ts
│  │  │  └─ xpLogs.ts
│  │  ├─ forum/
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
│  │  │  ├─ relations.ts
│  │  │  ├─ rules.ts
│  │  │  ├─ structure.ts
│  │  │  ├─ tags.ts
│  │  │  ├─ threadBookmarks.ts
│  │  │  ├─ threadDrafts.ts
│  │  │  ├─ threadFeaturePermissions.ts
│  │  │  ├─ threads.ts
│  │  │  ├─ threadTags.ts
│  │  │  ├─ userEmojiPacks.ts
│  │  │  └─ userRuleAgreements.ts
│  │  ├─ gamification/
│  │  │  ├─ achievementEvents.ts
│  │  │  ├─ achievements.ts
│  │  │  ├─ leaderboards.ts
│  │  │  ├─ missions.ts
│  │  │  ├─ platformStats.ts
│  │  │  ├─ relations.ts
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
│  │  │  ├─ relations.ts
│  │  │  └─ shoutboxMessages.ts
│  │  ├─ migrations/
│  │  │  └─ performance-indices.ts
│  │  ├─ shop/
│  │  │  ├─ animationPackItems.ts
│  │  │  ├─ animationPacks.ts
│  │  │  ├─ cosmeticCategories.ts
│  │  │  ├─ inventoryTransactions.ts
│  │  │  ├─ orderItems.ts
│  │  │  ├─ orders.ts
│  │  │  ├─ productCategories.ts
│  │  │  ├─ productMedia.ts
│  │  │  ├─ products.ts
│  │  │  ├─ rarities.ts
│  │  │  ├─ relations.ts
│  │  │  ├─ signatureItems.ts
│  │  │  ├─ userInventory.ts
│  │  │  └─ userSignatureItems.ts
│  │  ├─ social/
│  │  │  ├─ friends.ts
│  │  │  ├─ mentions.ts
│  │  │  ├─ relations.ts
│  │  │  └─ user-follows.ts
│  │  ├─ system/
│  │  │  ├─ activityFeed.ts
│  │  │  ├─ airdrop-records.ts
│  │  │  ├─ analyticsEvents.ts
│  │  │  ├─ cooldownState.ts
│  │  │  ├─ economyConfigOverrides.ts
│  │  │  ├─ event_logs.ts
│  │  │  ├─ mentionsIndex.ts
│  │  │  ├─ notifications.ts
│  │  │  ├─ profileAnalytics.ts
│  │  │  ├─ rateLimits.ts
│  │  │  ├─ referralSources.ts
│  │  │  ├─ relations.ts
│  │  │  ├─ userAbuseFlags.ts
│  │  │  └─ userReferrals.ts
│  │  ├─ user/
│  │  │  ├─ avatarFrames.ts
│  │  │  ├─ bans.ts
│  │  │  ├─ featurePermissions.ts
│  │  │  ├─ passwordResetTokens.ts
│  │  │  ├─ permissions.ts
│  │  │  ├─ preferences.ts
│  │  │  ├─ relations.ts
│  │  │  ├─ relationships.ts
│  │  │  ├─ rolePermissions.ts
│  │  │  ├─ roles.ts
│  │  │  ├─ sessions.ts
│  │  │  ├─ settingsHistory.ts
│  │  │  ├─ subscriptions.ts
│  │  │  ├─ user-social-preferences.ts
│  │  │  ├─ userGroups.ts
│  │  │  ├─ userOwnedFrames.ts
│  │  │  ├─ userRoles.ts
│  │  │  ├─ users.ts
│  │  │  ├─ verificationTokens.ts
│  │  │  └─ xShares.ts
│  │  ├─ wallet/
│  │  │  ├─ ccpayment-users.ts
│  │  │  ├─ crypto-wallets.ts
│  │  │  ├─ deposit-records.ts
│  │  │  ├─ internal-transfers.ts
│  │  │  ├─ relations.ts
│  │  │  ├─ supported-tokens.ts
│  │  │  ├─ swap-records.ts
│  │  │  ├─ webhook-events.ts
│  │  │  └─ withdrawal-records.ts
│  │  └─ index.ts
│  ├─ types/
│  │  ├─ announcement.types.ts
│  │  ├─ brand.types.ts
│  │  ├─ emoji.types.ts
│  │  ├─ forum.types.ts
│  │  ├─ index.ts
│  │  ├─ system.types.ts
│  │  ├─ user.types.ts
│  │  └─ utils.ts
│  ├─ index.ts
│  ├─ package.json
│  ├─ README.md
│  └─ tsconfig.json
├─ design/
│  ├─ tokens/
│  │  ├─ colors.json
│  │  ├─ spacing.json
│  │  └─ typography.json
│  └─ .DS_Store
├─ docs/
│  ├─ admin/
│  │  └─ README.md
│  ├─ api/
│  │  ├─ admin/
│  │  │  └─ README.md
│  │  ├─ auth/
│  │  │  └─ README.md
│  │  ├─ chat/
│  │  │  └─ README.md
│  │  ├─ forum/
│  │  │  └─ README.md
│  │  ├─ monitoring/
│  │  │  └─ README.md
│  │  ├─ security/
│  │  │  └─ README.md
│  │  ├─ social/
│  │  ├─ wallet/
│  │  │  └─ README.md
│  │  ├─ webhooks/
│  │  │  └─ README.md
│  │  ├─ xp/
│  │  │  └─ README.md
│  │  ├─ admin-api.md
│  │  ├─ auth-api.md
│  │  ├─ backend-improvements.md
│  │  ├─ forum-api.md
│  │  ├─ gamification-api.md
│  │  ├─ README_API.md
│  │  ├─ README.md
│  │  ├─ wallet-api.md
│  │  └─ xp-api.md
│  ├─ archive/
│  │  └─ placeholder.txt
│  ├─ migration/
│  │  └─ batch-template.md
│  ├─ refactor/
│  │  └─ component-consolidation/
│  │     ├─ dupes.csv
│  │     └─ import-stats.json
│  ├─ schema/
│  │  └─ UUID_SCHEMA_CONSOLIDATION.md
│  ├─ shop/
│  │  └─ README.md
│  ├─ system/
│  │  └─ UUID_FIRST_CHEAT_SHEET.md
│  ├─ API-INTEGRATION-GUIDE.md
│  └─ FORUM-MUSTDO.md
├─ eslint-plugins/
│  └─ degen/
│     ├─ rules/
│     │  ├─ no-cross-context-imports.js
│     │  ├─ no-direct-req-user.js
│     │  ├─ no-missing-branded-id-import.js
│     │  ├─ no-number-id.js
│     │  ├─ no-raw-container-auto.js
│     │  └─ no-undeclared-branded-id.js
│     ├─ index.cjs
│     └─ package.json
├─ eslint-rules/
│  └─ no-number-id.js
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
├─ migrations/
│  ├─ archive/
│  │  ├─ 0007_romantic_colossus.sql
│  │  ├─ 0007_smooth_sphinx.sql
│  │  └─ canonical-zones-schema-update.ts
│  ├─ meta/
│  │  ├─ _journal.json
│  │  ├─ 0006_snapshot.json
│  │  └─ 0007_snapshot.json
│  ├─ postgres/
│  │  ├─ meta/
│  │  │  ├─ _journal.json
│  │  │  ├─ 0002_snapshot.json
│  │  │  ├─ 0003_snapshot.json
│  │  │  ├─ 0004_snapshot.json
│  │  │  ├─ 0005_snapshot.json
│  │  │  ├─ 0006_snapshot.json
│  │  │  ├─ 0007_snapshot.json
│  │  │  ├─ 0008_snapshot.json
│  │  │  ├─ 0009_snapshot.json
│  │  │  ├─ 0010_snapshot.json
│  │  │  ├─ 0011_snapshot.json
│  │  │  ├─ 0012_snapshot.json
│  │  │  ├─ 0013_snapshot.json
│  │  │  └─ 0014_snapshot.json
│  │  ├─ 0000_silky_drax.sql
│  │  ├─ 0001_happy_vulture.sql
│  │  ├─ 0002_closed_romulus.sql
│  │  ├─ 0003_fluffy_terror.sql
│  │  ├─ 0004_enhanced_profiles.sql
│  │  ├─ 0004_high_magneto.sql
│  │  ├─ 0005_sparkling_sphinx.sql
│  │  ├─ 0006_funny_speedball.sql
│  │  ├─ 0007_shiny_stepford_cuckoos.sql
│  │  ├─ 0008_round_loners.sql
│  │  ├─ 0009_nappy_skreet.sql
│  │  ├─ 0010_tiny_vin_gonzales.sql
│  │  ├─ 0011_motionless_malice.sql
│  │  ├─ 0012_bright_sleeper.sql
│  │  ├─ 0013_fantastic_hex.sql
│  │  ├─ 0014_dazzling_silhouette.sql
│  │  ├─ 0014_dev_uuid_schema_fixes.sql
│  │  ├─ 0014_fix_uuid_foreign_keys.sql
│  │  ├─ relations.ts
│  │  └─ schema.snapshot.ts
│  ├─ 0008_add_users_profile_fields.sql
│  ├─ 0009_create_xp_logs_table.sql
│  ├─ 0010_add_x_account_fields.sql
│  ├─ 0011_create_x_shares_table.sql
│  └─ 20250701_uuid_migration.sql
├─ quality-reports/
│  └─ quality-report-2025-06-22.json
├─ scripts/
│  ├─ admin/
│  │  ├─ admin-performance-indices.sql
│  │  ├─ query-performance-audit.ts
│  │  └─ validate-admin-controllers.ts
│  ├─ codemods/
│  │  ├─ phase5/
│  │  │  ├─ console-to-logger.ts
│  │  │  ├─ enforce-transformers.ts
│  │  │  ├─ numeric-id-migration.ts
│  │  │  ├─ README.md
│  │  │  ├─ req-user-removal.ts
│  │  │  ├─ run-all.ts
│  │  │  └─ test-compilation.ts
│  │  ├─ fix-id-validation-patterns.ts
│  │  ├─ fix-server-userid-types.ts
│  │  ├─ id-to-entityid.ts
│  │  └─ move-db-id-imports.ts
│  ├─ db/
│  │  ├─ utils/
│  │  │  ├─ schema.ts
│  │  │  └─ seedUtils.ts
│  │  ├─ add_categoryid_to_thread_prefixes.ts
│  │  ├─ add-color-theme-field.ts
│  │  ├─ add-critical-indices.ts
│  │  ├─ apply-migration.ts
│  │  ├─ backfill-configZoneType.ts
│  │  ├─ check-indices.ts
│  │  ├─ check-levels-table.ts
│  │  ├─ check-reward-tables.ts
│  │  ├─ create-missing-tables.ts
│  │  ├─ db-helper.js
│  │  ├─ db-schema-summary.js
│  │  ├─ diagnose-mentions-table.ts
│  │  ├─ diff-schema-snapshot.ts
│  │  ├─ fix-forum-relationships.ts
│  │  ├─ generate-performance-migration.ts
│  │  ├─ generate-relations.ts
│  │  ├─ initialize-giphy-settings.ts
│  │  ├─ initialize-xp-system.ts
│  │  ├─ read-thread.ts
│  │  ├─ reset-and-seed.ts
│  │  ├─ seed-achievements.ts
│  │  ├─ seed-badges.ts
│  │  ├─ seed-chat.ts
│  │  ├─ seed-default-levels.ts
│  │  ├─ seed-dev-subscriptions.ts
│  │  ├─ seed-dev-wallet.ts
│  │  ├─ seed-economy-settings.ts
│  │  ├─ seed-promotion-pricing.ts
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
│  │  ├─ update-users-table.ts
│  │  └─ verify-neon-connection.ts
│  ├─ dev/
│  │  ├─ cursor-sync.sh
│  │  ├─ generate-scope-guide.ts
│  │  ├─ setup-fresh-wallet-test.ts
│  │  └─ syncForumsToDB.ts
│  ├─ docs/
│  │  └─ add-frontmatter.cjs
│  ├─ logs/
│  ├─ migration/
│  │  ├─ domain-migrations/
│  │  │  ├─ client-api-migration.ts
│  │  │  ├─ client-components-migration.ts
│  │  │  ├─ client-hooks-migration.ts
│  │  │  ├─ client-types-migration.ts
│  │  │  ├─ forum-core-migration.ts
│  │  │  └─ server-storage-migration.ts
│  │  ├─ notes/
│  │  │  ├─ current-structure-analysis.md
│  │  │  ├─ manual-preparation-tasks.md
│  │  │  ├─ revised-task-assignments.md
│  │  │  ├─ server-storage-mapping.md
│  │  │  ├─ subagent-analysis-tasks.md
│  │  │  └─ subagent-task-assignments.md
│  │  ├─ output/
│  │  │  ├─ codebase-analysis.json
│  │  │  ├─ components-dryrun.log
│  │  │  ├─ components-manual-review.md
│  │  │  ├─ domain-activity.json
│  │  │  ├─ domain-admin.json
│  │  │  ├─ domain-advertising.json
│  │  │  ├─ domain-auth.json
│  │  │  ├─ domain-ccpayment-webhook.json
│  │  │  ├─ domain-collectibles.json
│  │  │  ├─ domain-cosmetics.json
│  │  │  ├─ domain-dictionary.json
│  │  │  ├─ domain-economy.json
│  │  │  ├─ domain-editor.json
│  │  │  ├─ domain-engagement.json
│  │  │  ├─ domain-feature-gates.json
│  │  │  ├─ domain-forum-core.json
│  │  │  ├─ domain-forum.json
│  │  │  ├─ domain-gamification.json
│  │  │  ├─ domain-infrastructure.json
│  │  │  ├─ domain-messaging.json
│  │  │  ├─ domain-missions.json
│  │  │  ├─ domain-moderation.json
│  │  │  ├─ domain-notifications.json
│  │  │  ├─ domain-other.json
│  │  │  ├─ domain-paths.json
│  │  │  ├─ domain-preferences.json
│  │  │  ├─ domain-profile.json
│  │  │  ├─ domain-share.json
│  │  │  ├─ domain-shop.json
│  │  │  ├─ domain-shoutbox.json
│  │  │  ├─ domain-social.json
│  │  │  ├─ domain-subscriptions.json
│  │  │  ├─ domain-treasury.json
│  │  │  ├─ domain-uploads.json
│  │  │  ├─ domain-user-management.json
│  │  │  ├─ domain-user.json
│  │  │  ├─ domain-wallet.json
│  │  │  ├─ domain-xp.json
│  │  │  ├─ forum-core-migration-dryrun-1751412697617.json
│  │  │  ├─ forum-core-migration-dryrun-1751413669981.json
│  │  │  ├─ forum-core-migration-dryrun-1751413778821.json
│  │  │  ├─ forum-core-migration-dryrun-1751413797844.json
│  │  │  ├─ forum-core-migration-live-1751413899507.json
│  │  │  ├─ hooks-dryrun.log
│  │  │  ├─ hooks-manual-review.md
│  │  │  ├─ manual-preparation-analysis.md
│  │  │  ├─ migration-roadmap.md
│  │  │  ├─ migration-summary.md
│  │  │  ├─ numeric-id-report.json
│  │  │  └─ server-storage-dryrun.json
│  │  ├─ scripts/
│  │  │  └─ migration/
│  │  │     └─ output/
│  │  │        ... (max depth reached)
│  │  ├─ add-missing-references.ts
│  │  ├─ add-performance-indices.ts
│  │  ├─ ANALYSIS_VS_DETECTION.md
│  │  ├─ analyze-codebase.ts
│  │  ├─ check-ids-ci.ts
│  │  ├─ check-naming-conventions.ts
│  │  ├─ cleanup-old-category-schema.ts
│  │  ├─ fix-admin-api-calls.ts
│  │  ├─ fix-admin-implicit-any.ts
│  │  ├─ fix-admin-missing-modules.ts
│  │  ├─ fix-admin-optional-types.ts
│  │  ├─ fix-broken-validators.ts
│  │  ├─ fix-frontend-id-types.ts
│  │  ├─ fix-integer-id-patterns.ts
│  │  ├─ fix-seed-files.ts
│  │  ├─ fix-shoutbox-message-id.ts
│  │  ├─ fix-test-files.ts
│  │  ├─ generate-id-aliases.ts
│  │  ├─ generate-uuid-audit.ts
│  │  ├─ generated-id-aliases.ts
│  │  ├─ id-migration-summary.md
│  │  ├─ identify-numeric-ids.ts
│  │  ├─ migrate-forum-structure.ts
│  │  ├─ REVIEWER_GUIDE.md
│  │  ├─ scan-non-uuid-columns.ts
│  │  ├─ sync-branded-types.ts
│  │  ├─ test-update-baseline.ts
│  │  ├─ update-baseline.ts
│  │  ├─ uuid-audit.json
│  │  └─ uuid-first-completion-summary.md
│  ├─ ops/
│  │  ├─ check-forum-config-sync.ts
│  │  ├─ neon-sync-agent.ts
│  │  ├─ setup-xp-system.sh
│  │  └─ validate-safe-migrations.ts
│  ├─ phase5/
│  │  ├─ rollback.ts
│  │  └─ validate-phase5.ts
│  ├─ quality/
│  │  └─ quality-metrics.ts
│  ├─ refactor/
│  │  ├─ fix-admin-double-layout.ts
│  │  ├─ fix-broken-admin-imports.ts
│  │  └─ rbac-codemod.ts
│  ├─ seed/
│  │  ├─ shop/
│  │  │  ├─ seed-default-cosmetics.ts
│  │  │  └─ username-colors.ts
│  │  └─ README.md
│  ├─ templates/
│  │  ├─ transaction-domain-template.ts
│  │  └─ vault-domain-template.ts
│  ├─ testing/
│  │  ├─ admin-api-tests.sh
│  │  ├─ test-forum-endpoints.js
│  │  ├─ test-mock-requests.js
│  │  ├─ test-repository-implementation.ts
│  │  ├─ test-xp-actions.js
│  │  ├─ test-xp-endpoints.js
│  │  ├─ test-xp-system.ts
│  │  ├─ validate-domain-migration.sh
│  │  ├─ validate-forum-fks.ts
│  │  └─ validate-routes.js
│  ├─ tools/
│  │  ├─ generate-tree.js
│  │  └─ icon-scan.ts
│  ├─ validation/
│  │  ├─ validate-boundaries.cjs
│  │  ├─ validate-dependencies.cjs
│  │  ├─ validate-forum-structure-migration.ts
│  │  └─ validate-uuid-migration.ts
│  ├─ backfill-thread-parentForumSlug.ts
│  ├─ build-forum-sdk.ts
│  ├─ convert-admin-pages.cjs
│  ├─ fix-all-schema-issues.ts
│  ├─ fix-all-user-refs.ts
│  ├─ fix-conversion-errors.cjs
│  ├─ fix-frontend-imports.sh
│  ├─ fix-integer-imports.ts
│  ├─ fix-missing-uuid-imports.ts
│  ├─ fix-table-references.ts
│  ├─ fix-userid-types.ts
│  ├─ manual-fix-critical.cjs
│  ├─ migrate-to-pnpm.js
│  ├─ package.json
│  ├─ README.md
│  ├─ reset-database.sql
│  ├─ reset-db-clean.ts
│  ├─ test-admin-xp.js
│  ├─ test-ci-readiness.ts
│  ├─ test-forum-api.ts
│  ├─ tsconfig.json
│  ├─ validate-everything.ts
│  └─ validate-imports.ts
├─ server/
│  ├─ .claude/
│  │  └─ audit/
│  ├─ config/
│  │  └─ loadEnv.ts
│  ├─ logs/
│  │  └─ app.log
│  ├─ migrations/
│  │  ├─ archive/
│  │  │  ├─ README.md
│  │  │  └─ run-tip-rain.ts
│  │  ├─ 20250510_create_xp_adjustment_logs.ts
│  │  ├─ 20250512_create_xp_action_logs.ts
│  │  ├─ 20250513_create_xp_action_settings.ts
│  │  ├─ 20250618_add_clout_achievements.ts
│  │  ├─ 20250618_add_rollout_percentage_to_feature_flags.ts
│  │  ├─ 20250618_add_updated_by_to_site_settings.ts
│  │  ├─ 20250618_create_xp_clout_settings.ts
│  │  ├─ 20250624_add_visual_fields_to_levels.ts
│  │  ├─ 20250626_extend_ui_themes.ts
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
│  │  │  ├─ audit/
│  │  │  │  ├─ audit-logger.ts
│  │  │  │  └─ audit-logger.ts.bak
│  │  │  ├─ config/
│  │  │  │  └─ environment.ts
│  │  │  ├─ events/
│  │  │  │  └─ achievement-events.service.ts
│  │  │  ├─ middleware/
│  │  │  │  └─ security.middleware.ts
│  │  │  ├─ monitoring/
│  │  │  │  ├─ health-check.ts
│  │  │  │  └─ query-performance.ts
│  │  │  ├─ repository/
│  │  │  │  ├─ __tests__/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ repositories/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ ANALYSIS.md
│  │  │  │  ├─ base-repository.ts
│  │  │  │  ├─ index.ts
│  │  │  │  ├─ interfaces.ts
│  │  │  │  └─ repository-factory.ts
│  │  │  ├─ routes/
│  │  │  │  └─ api/
│  │  │  │     ... (max depth reached)
│  │  │  ├─ services/
│  │  │  │  ├─ rate-limit.service.ts
│  │  │  │  └─ user.service.ts
│  │  │  ├─ utils/
│  │  │  │  ├─ auth.helpers.ts
│  │  │  │  └─ error-response.util.ts
│  │  │  ├─ background-processor.ts
│  │  │  ├─ base-controller.ts
│  │  │  ├─ cache.service.ts
│  │  │  ├─ config.service.ts
│  │  │  ├─ database.ts
│  │  │  ├─ db.ts
│  │  │  ├─ errors.ts
│  │  │  ├─ logger.ts
│  │  │  ├─ middleware.ts
│  │  │  ├─ rate-limiter.ts
│  │  │  ├─ storage.service.ts
│  │  │  ├─ type-transformer.ts
│  │  │  └─ wallet-validators.ts
│  │  ├─ cron/
│  │  │  ├─ mission-reset.ts
│  │  │  └─ subscription-management.ts
│  │  ├─ domains/
│  │  │  ├─ activity/
│  │  │  │  ├─ controllers/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ routes/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  └─ services/
│  │  │  │     ... (max depth reached)
│  │  │  ├─ admin/
│  │  │  │  ├─ shared/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ sub-domains/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ admin.controller.ts
│  │  │  │  ├─ admin.errors.ts
│  │  │  │  ├─ admin.middleware.ts
│  │  │  │  ├─ admin.response.ts
│  │  │  │  ├─ admin.routes.ts
│  │  │  │  ├─ admin.service.ts
│  │  │  │  └─ admin.validation.ts
│  │  │  ├─ advertising/
│  │  │  │  ├─ ad-admin.controller.ts
│  │  │  │  ├─ ad-configuration.service.ts
│  │  │  │  ├─ ad-serving.service.ts
│  │  │  │  ├─ ad.controller.ts
│  │  │  │  ├─ ad.routes.ts
│  │  │  │  ├─ campaign-management.service.ts
│  │  │  │  ├─ user-promotion.routes.ts
│  │  │  │  └─ user-promotion.service.ts
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
│  │  │  ├─ collectibles/
│  │  │  │  └─ stickers/
│  │  │  │     ... (max depth reached)
│  │  │  ├─ cosmetics/
│  │  │  │  ├─ avatarFrameStore.service.ts
│  │  │  │  └─ frameEquip.service.ts
│  │  │  ├─ dictionary/
│  │  │  │  ├─ dictionary.routes.ts
│  │  │  │  └─ dictionary.service.ts
│  │  │  ├─ economy/
│  │  │  │  ├─ services/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ transformers/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  └─ types/
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
│  │  │  │  ├─ engagement.service.ts
│  │  │  │  └─ engagement.service.ts.bak
│  │  │  ├─ feature-gates/
│  │  │  │  ├─ feature-gates.controller.ts
│  │  │  │  ├─ feature-gates.routes.ts
│  │  │  │  ├─ feature-gates.service.ts
│  │  │  │  └─ feature-gates.service.ts.bak
│  │  │  ├─ forum/
│  │  │  │  ├─ routes/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ rules/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ services/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ sub-domains/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ transformers/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ types/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ forum.controller.ts
│  │  │  │  ├─ forum.routes.ts
│  │  │  │  ├─ forum.service.test.ts
│  │  │  │  └─ forum.service.ts
│  │  │  ├─ gamification/
│  │  │  │  ├─ achievements/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ transformers/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ achievement.controller.ts
│  │  │  │  ├─ achievement.routes.ts
│  │  │  │  ├─ achievement.service.ts
│  │  │  │  ├─ achievement.service.ts.bak
│  │  │  │  ├─ admin.controller.ts
│  │  │  │  ├─ admin.routes.ts
│  │  │  │  ├─ analytics.controller.ts
│  │  │  │  ├─ analytics.routes.ts
│  │  │  │  ├─ analytics.service.ts
│  │  │  │  ├─ gamification.routes.ts
│  │  │  │  ├─ index.ts
│  │  │  │  ├─ leveling.controller.ts
│  │  │  │  ├─ leveling.routes.ts
│  │  │  │  ├─ leveling.service.ts
│  │  │  │  ├─ mission.controller.ts
│  │  │  │  └─ mission.routes.ts
│  │  │  ├─ messaging/
│  │  │  │  ├─ transformers/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ types/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ index.ts
│  │  │  │  ├─ message.routes.ts
│  │  │  │  ├─ message.service.ts
│  │  │  │  └─ README.md
│  │  │  ├─ missions/
│  │  │  │  ├─ missions.admin.controller.ts
│  │  │  │  ├─ missions.admin.routes.ts
│  │  │  │  ├─ missions.controller.ts
│  │  │  │  ├─ missions.routes.ts
│  │  │  │  ├─ missions.service.ts
│  │  │  │  └─ missions.service.ts.bak
│  │  │  ├─ notifications/
│  │  │  │  ├─ event-notification-listener.ts
│  │  │  │  ├─ notification-generator.service.ts
│  │  │  │  ├─ notification.routes.ts
│  │  │  │  └─ notification.service.ts
│  │  │  ├─ paths/
│  │  │  │  ├─ paths.routes.ts
│  │  │  │  └─ paths.routes.ts.bak
│  │  │  ├─ preferences/
│  │  │  │  ├─ preferences.routes.ts
│  │  │  │  ├─ preferences.service.ts
│  │  │  │  └─ preferences.validators.ts
│  │  │  ├─ profile/
│  │  │  │  ├─ profile-stats.controller.ts
│  │  │  │  ├─ profile-stats.routes.ts
│  │  │  │  ├─ profile-stats.service.ts
│  │  │  │  ├─ profile.routes.ts
│  │  │  │  ├─ profile.service.ts
│  │  │  │  ├─ profile.service.ts.bak
│  │  │  │  ├─ referrals.service.ts
│  │  │  │  ├─ referrals.service.ts.bak
│  │  │  │  ├─ schema-updates.sql
│  │  │  │  ├─ signature.routes.ts
│  │  │  │  ├─ signature.routes.ts.bak
│  │  │  │  ├─ signature.service.ts
│  │  │  │  ├─ social-actions.controller.ts
│  │  │  │  ├─ social-actions.routes.ts
│  │  │  │  └─ social-actions.service.ts
│  │  │  ├─ share/
│  │  │  │  ├─ routes/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  └─ services/
│  │  │  │     ... (max depth reached)
│  │  │  ├─ shop/
│  │  │  │  ├─ services/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ transformers/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ types/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ cosmetics.routes.ts
│  │  │  │  └─ shop.routes.ts
│  │  │  ├─ shoutbox/
│  │  │  │  ├─ services/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ enhanced-shoutbox.routes.ts
│  │  │  │  └─ shoutbox.routes.ts
│  │  │  ├─ social/
│  │  │  │  ├─ follows.routes.ts
│  │  │  │  ├─ follows.service.ts
│  │  │  │  ├─ follows.types.ts
│  │  │  │  ├─ friends.routes.ts
│  │  │  │  ├─ friends.service.ts
│  │  │  │  ├─ mentions.routes.ts
│  │  │  │  ├─ mentions.service.ts
│  │  │  │  ├─ mentions.types.ts
│  │  │  │  ├─ relationships.routes.ts
│  │  │  │  ├─ social.routes.ts
│  │  │  │  ├─ whale-watch.routes.ts
│  │  │  │  └─ whale-watch.service.ts
│  │  │  ├─ subscriptions/
│  │  │  │  ├─ subscription-permissions.service.ts
│  │  │  │  ├─ subscription.controller.ts
│  │  │  │  ├─ subscription.routes.ts
│  │  │  │  ├─ subscription.service.ts
│  │  │  │  └─ subscription.validators.ts
│  │  │  ├─ treasury/
│  │  │  │  └─ treasury.routes.ts
│  │  │  ├─ uploads/
│  │  │  │  ├─ upload.controller.ts
│  │  │  │  ├─ upload.routes.ts
│  │  │  │  └─ upload.service.ts
│  │  │  ├─ user/
│  │  │  │  ├─ user-preferences.routes.ts
│  │  │  │  └─ user-preferences.service.ts
│  │  │  ├─ users/
│  │  │  │  ├─ middleware/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ transformers/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  └─ types/
│  │  │  │     ... (max depth reached)
│  │  │  ├─ wallet/
│  │  │  │  ├─ middleware/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ services/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ ccpayment.service.ts
│  │  │  │  ├─ crypto-wallet.routes.ts
│  │  │  │  ├─ dgt.service.ts
│  │  │  │  ├─ treasury.controller.ts
│  │  │  │  ├─ user-management.service.ts
│  │  │  │  ├─ wallet-api-tests.ts
│  │  │  │  ├─ wallet-config.service.ts
│  │  │  │  ├─ wallet.constants.ts
│  │  │  │  ├─ wallet.controller.ts
│  │  │  │  ├─ wallet.dev.controller.ts
│  │  │  │  ├─ wallet.routes.ts
│  │  │  │  ├─ wallet.service.ts
│  │  │  │  ├─ wallet.test.controller.ts
│  │  │  │  ├─ wallet.test.routes.ts
│  │  │  │  ├─ wallet.validators.ts
│  │  │  │  ├─ webhook.service.ts
│  │  │  │  └─ withdrawal.controller.ts
│  │  │  ├─ xp/
│  │  │  │  ├─ events/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ xp-actions-schema.ts
│  │  │  │  ├─ xp-actions.controller.ts
│  │  │  │  ├─ xp-actions.ts
│  │  │  │  ├─ xp.admin.routes.ts
│  │  │  │  ├─ xp.controller.ts
│  │  │  │  ├─ xp.events.ts
│  │  │  │  ├─ xp.routes.ts
│  │  │  │  ├─ xp.service.ts
│  │  │  │  └─ xp.service.ts.bak
│  │  │  └─ README.md
│  │  ├─ lib/
│  │  │  └─ db.ts
│  │  ├─ middleware/
│  │  │  ├─ auth.ts
│  │  │  ├─ authenticate.ts
│  │  │  ├─ dev-security.middleware.ts
│  │  │  ├─ mission-progress.ts
│  │  │  ├─ subscription-permissions.ts
│  │  │  ├─ trace.middleware.ts
│  │  │  ├─ transform-response.ts
│  │  │  ├─ validate-request.ts
│  │  │  └─ validate.ts
│  │  ├─ routes/
│  │  │  ├─ api/
│  │  │  │  ├─ store/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ user/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ index.ts
│  │  │  │  └─ ui.routes.ts
│  │  │  └─ dev.routes.ts
│  │  ├─ utils/
│  │  │  ├─ auth.ts
│  │  │  ├─ db-utils.ts
│  │  │  ├─ economy-loader.ts
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
│  ├─ .eslintignore
│  ├─ index.ts
│  ├─ package.json
│  ├─ README.md
│  ├─ routes.ts
│  ├─ storage.ts
│  ├─ tsconfig.build.json
│  ├─ tsconfig.eslint.json
│  ├─ tsconfig.json
│  └─ vite.ts
├─ shared/
│  ├─ .tscache/
│  │  └─ .tsbuildinfo
│  ├─ admin-core/
│  │  └─ README.md
│  ├─ config/
│  │  ├─ admin.config.ts
│  │  ├─ index.ts
│  │  ├─ social.config.ts
│  │  └─ zoneThemes.config.ts
│  ├─ economy/
│  │  ├─ clout-calculator.ts
│  │  ├─ economy.config.ts
│  │  ├─ index.ts
│  │  ├─ rain-tip-config.ts
│  │  ├─ README.md
│  │  ├─ reward-calculator.ts
│  │  └─ shop-items.ts
│  ├─ enums/
│  │  ├─ index.ts
│  │  └─ user.ts
│  ├─ fixtures/
│  │  ├─ core/
│  │  │  └─ factory.ts
│  │  ├─ factories/
│  │  │  ├─ forum.factory.ts
│  │  │  └─ user.factory.ts
│  │  ├─ utilities/
│  │  │  ├─ scenario-generator.ts
│  │  │  └─ test-helpers.ts
│  │  └─ index.ts
│  ├─ lib/
│  │  ├─ auth/
│  │  │  └─ canUser.ts
│  │  ├─ emoji/
│  │  │  └─ unlockEmojiPack.ts
│  │  ├─ forum/
│  │  │  ├─ canUserPost.ts
│  │  │  ├─ getAvailablePrefixes.ts
│  │  │  ├─ getForumRules.ts
│  │  │  ├─ prefixEngine.ts
│  │  │  └─ shouldAwardXP.ts
│  │  ├─ mentions/
│  │  │  ├─ createMentionsIndex.ts
│  │  │  └─ utils.ts
│  │  ├─ moderation/
│  │  │  └─ applyModerationAction.ts
│  │  ├─ wallet/
│  │  │  └─ testUtils.ts
│  │  ├─ admin-module-registry.ts
│  │  └─ index.ts
│  ├─ signature/
│  │  └─ SignatureTierConfig.ts
│  ├─ test-utils/
│  │  └─ mock-uuid.ts
│  ├─ types/
│  │  ├─ config/
│  │  │  ├─ core-entities.schema.ts
│  │  │  ├─ economy.schema.ts
│  │  │  ├─ features.schema.ts
│  │  │  ├─ index.ts
│  │  │  └─ xp.schema.ts
│  │  ├─ core/
│  │  │  ├─ cosmetics.types.ts
│  │  │  ├─ economy.types.ts
│  │  │  ├─ forum.types.ts
│  │  │  ├─ index.ts
│  │  │  ├─ user-secure.types.ts
│  │  │  └─ user.types.ts
│  │  ├─ validation/
│  │  │  └─ index.ts
│  │  ├─ api.types.ts
│  │  ├─ config.types.ts
│  │  ├─ economy.ts
│  │  ├─ ids.ts
│  │  └─ index.ts
│  ├─ utils/
│  │  ├─ id-validation.ts
│  │  └─ id.ts
│  ├─ validation/
│  │  └─ common.schemas.ts
│  ├─ validators/
│  │  ├─ admin.ts
│  │  └─ index.ts
│  ├─ constants.ts
│  ├─ index.ts
│  ├─ package.json
│  ├─ path-config.ts
│  ├─ paths.config.ts
│  ├─ README.md
│  ├─ tsconfig.json
│  ├─ types.ts
│  └─ wallet.config.ts
├─ SuperClaude/
│  ├─ .claude/
│  │  └─ commands/
│  │     └─ shared/
│  │        ├─ ambiguity-check.yml
│  │        ├─ audit.yml
│  │        ├─ checkpoint.yml
│  │        ├─ cleanup-patterns.yml
│  │        ├─ command-memory.yml
│  │        ├─ command-templates.yml
│  │        ├─ config-validator.yml
│  │        ├─ documentation-dirs.yml
│  │        ├─ error-recovery-enhanced.yml
│  │        ├─ error-recovery.yml
│  │        ├─ evidence.yml
│  │        ├─ git-operations.yml
│  │        ├─ git-workflow.yml
│  │        ├─ implementation.yml
│  │        ├─ loading-config.yml
│  │        ├─ mcp-flags.yml
│  │        ├─ patterns.yml
│  │        ├─ performance-monitoring.yml
│  │        ├─ performance-tracker.yml
│  │        ├─ planning-mode.yml
│  │        ├─ research-first.yml
│  │        ├─ thinking-modes.yml
│  │        ├─ ultracompressed.yml
│  │        ├─ user-experience.yml
│  │        ├─ validation.yml
│  │        └─ workflow-chains.yml
│  ├─ .github/
│  │  └─ ISSUE_TEMPLATE/
│  │     ├─ bug_report.yml
│  │     ├─ feature_request.yml
│  │     └─ question.yml
│  ├─ .gitignore
│  ├─ install.sh
│  ├─ LICENSE
│  └─ README.md
├─ test-results/
│  ├─ artifacts/
│  │  ├─ .playwright-artifacts-5/
│  │  │  ├─ traces/
│  │  │  │  ├─ resources/
│  │  │  │  │  ... (max depth reached)
│  │  │  │  ├─ a91dcd0cf94c577a6db9-684a717408c3331f2fea-retry1.network
│  │  │  │  └─ a91dcd0cf94c577a6db9-684a717408c3331f2fea-retry1.trace
│  │  │  └─ da96a6e4051c62fee860efc1cb648c25.webm
│  │  ├─ user-journey-analytics-Use-2e6cd-low-Matches-Seeded-Patterns-behavioral-flows/
│  │  │  ├─ test-failed-1.png
│  │  │  └─ video.webm
│  │  ├─ user-journey-analytics-Use-2e6cd-low-Matches-Seeded-Patterns-behavioral-flows-retry1/
│  │  │  ├─ test-failed-1.png
│  │  │  ├─ trace.zip
│  │  │  └─ video.webm
│  │  ├─ user-journey-analytics-Use-6d764-ta-Integration-Verification-behavioral-flows/
│  │  │  ├─ test-failed-1.png
│  │  │  └─ video.webm
│  │  ├─ user-journey-analytics-Use-6d764-ta-Integration-Verification-behavioral-flows-retry1/
│  │  ├─ user-journey-analytics-Use-f02aa--Accessibility-Verification-behavioral-flows/
│  │  │  └─ video.webm
│  │  └─ user-journey-analytics-Use-f02aa--Accessibility-Verification-behavioral-flows-retry1/
│  │     ├─ test-failed-1.png
│  │     ├─ trace.zip
│  │     └─ video.webm
│  ├─ html-report/
│  │  ├─ data/
│  │  │  └─ 4ab82790a324f7aed9bd9d975b24253f327d4b21.webm
│  │  └─ index.html
│  ├─ .last-run.json
│  ├─ junit.xml
│  └─ results.json
├─ tests/
│  └─ e2e/
│     ├─ behavioral-flows/
│     │  └─ user-journey-analytics.spec.ts
│     ├─ cross-domain/
│     │  └─ data-consistency.spec.ts
│     ├─ fixtures/
│     │  ├─ test-setup.ts
│     │  └─ user-journeys.ts
│     ├─ helpers/
│     │  └─ behavior-analyzer.ts
│     ├─ reports/
│     │  └─ test-analytics-reporter.ts
│     ├─ admin-settings.spec.ts
│     ├─ avatarFrames.spec.ts.backup
│     └─ forum-home.spec.ts
├─ UIVERSE/
│  ├─ AnimatedCheckbox.css
│  ├─ AnimatedCheckbox.tsx
│  ├─ BrutalistCard.css
│  ├─ BrutalistCard.tsx
│  ├─ CopeButton.css
│  ├─ CopeButton.tsx
│  ├─ CTAButton.css
│  ├─ CTAButton.tsx
│  ├─ DegenLoader.css
│  ├─ DegenLoader.tsx
│  ├─ DeleteButton.css
│  ├─ DeleteButton.tsx
│  ├─ DiscordButton.css
│  ├─ DiscordButton.tsx
│  ├─ GridBackground.css
│  ├─ GridBackground.tsx
│  ├─ InfiniteMarquee.css
│  ├─ InfiniteMarquee.tsx
│  ├─ LikeButton.css
│  ├─ LikeButton.tsx
│  ├─ MacTerminal.css
│  ├─ MacTerminal.tsx
│  ├─ PumpButton.css
│  ├─ PumpButton.tsx
│  ├─ RadarLoader.css
│  ├─ RadarLoader.tsx
│  ├─ Red3DButton.css
│  ├─ Red3DButton.tsx
│  ├─ RevenueWidget.css
│  ├─ RevenueWidget.tsx
│  ├─ ShareButton.css
│  ├─ ShareButton.tsx
│  ├─ ShopCard3D.css
│  ├─ ShopCard3D.tsx
│  ├─ SleepyLoader.css
│  ├─ SleepyLoader.tsx
│  ├─ SubscribeInput.css
│  └─ SubscribeInput.tsx
├─ .DS_Store
├─ .env
├─ .env.local
├─ .eslintignore
├─ .eslintrc.json
├─ .gitignore
├─ .jscodeshift.json
├─ .lintstagedrc.json
├─ .markdown-link-check.json
├─ .markdownlint.json
├─ .markdownlintignore
├─ .npmrc
├─ .phase5-checkpoint
├─ .prettierignore
├─ .prettierrc
├─ CLEANUP-SUMMARY.md
├─ components.json
├─ cookies.txt
├─ dependency-migration-plan.json
├─ directory-tree.md
├─ DOMAIN_CONSOLIDATION_STRATEGY.md
├─ drizzle.config.ts
├─ env.development.local
├─ env.example
├─ env.local
├─ fix-package-manager.sh
├─ IMPLEMENTATION_SAFETY_CHECKLIST.md
├─ package.json
├─ PHASE_5_AUDIT_FIXES.md
├─ PHASE_5_FINAL_VERIFICATION.md
├─ PHASE_5_MAX_DEBT_ERADICATION.md
├─ playwright.config.ts
├─ pnpm-lock.yaml
├─ pnpm-workspace.yaml
├─ README.md
├─ server-migration-analysis.md
├─ style-dictionary.config.js
├─ test-forum-e2e.spec.ts
├─ test-threads-simple.ts
├─ TESTING_VALIDATION_STRATEGY.md
├─ tsconfig.client.json
├─ tsconfig.eslint.json
├─ tsconfig.json
├─ tsconfig.lite.json
├─ UUID_MIGRATION_COMPREHENSIVE_REVIEW.md
├─ uuid-migration-scan-2025-07-03T06-22-13-175Z.csv
├─ uuid-migration-scan-2025-07-03T06-24-15-450Z.csv
├─ uuid-migration-scan-2025-07-03T06-31-43-579Z.csv
└─ uuid-migration-scan-2025-07-03T06-32-10-971Z.csv
```

## Structure Notes

- `server/src/domains/` - Domain-driven backend modules
- `client/src/components/` - Reusable React components
- `client/src/pages/` - Page components corresponding to routes
- `shared/` - Shared code between client and server

Directory tree written to: directory-tree.md
