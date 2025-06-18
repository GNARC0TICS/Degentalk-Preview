# Admin Panel Audit (June 17, 2025)

**Objective:** This document summarizes the audit of the DegenTalk admin panel's current state as of June 17, 2025. The audit was conducted against the MVP requirements provided by the user, aiming to determine the existing functionality, identify gaps, and lay the groundwork for a new implementation plan to achieve a "fully functional and configurable" admin panel.

**Acknowledgments:**
*   The MVP requirements and definition of "fully functional and configurable" were provided by the user (gnarcotic).
*   This audit is based on an analysis of the existing codebase, including server-side logic, client-side UI components, and database schema information.
*   Deprecated documents (`docs/admin-panel-implementation-progress.md` and `docs/admin-panel-refactoring-plan.md`) were initially consulted but later disregarded as per user instruction for a fresh audit.

---

## User's Core MVP Requirements & "Configurable" Definition:
*(This section refers to the detailed list provided by the user in the message timestamped approximately 6/17/2025, 4:12:44 PM. That list is the primary benchmark for this audit and should be consulted for full details on each required feature.)*

---

## Audit Findings Summary:

### 1. User Management

*   **Files Audited:**
    *   `server/src/domains/admin/sub-domains/users/users.service.ts`
    *   `server/src/domains/admin/sub-domains/users/users.routes.ts`
    *   `client/src/pages/admin/users.tsx`
    *   `client/src/pages/admin/users/[userId].tsx` (User Inventory Page)
    *   `server/src/domains/admin/sub-domains/users/inventory.admin.routes.ts`
    *   `client/src/components/admin/forms/users/UserFormDialog.tsx`
*   **Status:**
    *   **View all users (paginated):** Mostly Implemented. Backend service/routes exist. Frontend UI (`users.tsx`) displays users with search/filter stubs. UI for pagination controls is a TODO.
    *   **Edit user info (username, email, role, XP, DGT, Clout):**
        *   Username, Email: Partially Implemented. Backend update for these fields exists. `UserFormDialog.tsx` has basic UI; submit logic is placeholder.
        *   Role: Partially Implemented. UI dialog for change role exists in `users.tsx`. Backend update might cover role if sent; specific role assignment logic might be needed. Submit logic TODO.
        *   XP, DGT, Clout: Editing these fields is **Missing** from `UserFormDialog.tsx` and backend update logic in `users.service.ts`.
    *   **Ban/unban users (soft & hard):** Partially Implemented. UI dialogs exist in `users.tsx`. Backend API/service logic **Missing**. Frontend submit logic TODO.
    *   **Login as user (beta-only feature toggle):** **Missing**.
    *   **Assign roles (admin, mod, dev):** See "Edit user info - Role".
    *   **View user activity/logs:** Basic stats (post/thread count) in `users.service.ts`. Detailed activity/audit log view per user in admin UI is **Missing**. (Backend `adminService.ts` has `auditLogs` table and `getRecentAdminActions`).
    *   **User Inventory Management (Cosmetics):** Functionally Implemented via `users/[userId].tsx` (inventory page) and corresponding backend.

### 2. XP & Clout Engine

*   **Files Audited:**
    *   `server/src/domains/admin/sub-domains/xp/xp.service.ts`
    *   `server/src/domains/admin/sub-domains/xp/xp.routes.ts`
    *   `server/src/domains/admin/sub-domains/xp/xp-actions.controller.ts`
    *   `client/src/pages/admin/xp/settings.tsx`
    *   `client/src/pages/admin/xp/levels.tsx`
    *   `client/src/pages/admin/xp/adjust.tsx`
    *   `client/src/pages/admin/xp/badges.tsx`
    *   `client/src/pages/admin/xp/titles.tsx`
    *   `client/src/pages/admin/config/xp.tsx` (JSON editor)
*   **Status:**
    *   **Configure XP gain rules (post, comment, thread, etc.):**
        *   Backend: `xp-actions.controller.ts` provides CRUD for individual XP actions (value, cooldown, daily cap per action) using `xpActionSettings` table. This is **Implemented**.
        *   Client: `client/src/pages/admin/config/xp.tsx` offers a generic JSON editor that *could* manage these if its API endpoint (`/api/admin/config/xp`) is tied to `xpActionSettings`. A user-friendly, table-based UI for granular `xpActionSettings` management is **Missing**.
        *   `client/src/pages/admin/xp/settings.tsx` handles general XP multipliers & feature toggles; its backend save logic in `XpAdminService` is **TODO**.
    *   **Adjust XP manually per user:** **Implemented**. `xp.service.ts` (`adjustUserXp`), `xp.routes.ts`, and `client/src/pages/admin/xp/adjust.tsx` cover this.
    *   **View XP leaderboard:** Optional requirement. Public leaderboard exists. Admin-specific view/tool **Not Audited/Likely Missing**.
    *   **Configure Clout bonuses, decay, etc.:** **Missing**. Schema `xpCloutSettings` mentioned in `XpAdminService` stubs. Needs UI and backend logic.
    *   **XP caps per day (global + per user override):** Per-action daily caps exist via `xpActionSettings`. Global/user-specific daily caps are **Missing**.
    *   **Level Configuration:** Client UI (`xp/levels.tsx`) for CRUD is **Implemented**. Backend service logic in `XpAdminService` for CRUD is **Mostly Missing** (only `getLevels` is complete).
    *   **Badge/Title Configuration:** Client UI (`xp/badges.tsx`, `xp/titles.tsx`) for CRUD is **Implemented**. Backend service logic in `XpAdminService` for CRUD is **Mostly Missing** (only `getBadges`/`getTitles` are complete).

### 3. Economy & Shop Controls

*   **Files Audited:**
    *   `server/src/domains/admin/sub-domains/shop/shop.admin.controller.ts`
    *   `server/src/domains/admin/sub-domains/shop/shop.admin.routes.ts`
    *   `client/src/pages/admin/shop/index.tsx`
    *   `client/src/pages/admin/shop/edit.tsx`
    *   `server/src/domains/admin/sub-domains/treasury/treasury.service.ts`
    *   `client/src/pages/admin/treasury.tsx`
    *   `client/src/pages/admin/tip-rain-settings.tsx`
*   **Status:**
    *   **Adjust DGT faucet settings:** **Missing**. `AdminTreasuryService` can manage `dgtEconomyParameters`, which could store faucet settings, but UI is missing.
    *   **Set rain/tip limits:**
        *   Tip Limits: `AdminTreasuryService` handles `minTipAmount`/`maxTipAmount` via `dgtEconomyParameters`. `client/src/pages/admin/treasury.tsx` UI does **not** expose these. `client/src/pages/admin/tip-rain-settings.tsx` UI *does* have fields for these but uses different API endpoints. Needs reconciliation. Backend for `tip-rain-settings.tsx` APIs needs verification/implementation.
        *   Rain Limits: `tip-rain-settings.tsx` UI has fields. Backend logic for rain-specific limits is **not apparent** in `AdminTreasuryService`.
    *   **Create/edit shop items (cosmetics, boosters, unlocks):** **Implemented**. Backend controller and client UI (`shop/index.tsx`, `shop/edit.tsx`) are robust.
    *   **View shop purchases and inventory by user:** User-specific inventory view is **Implemented** (`client/src/pages/admin/users/[userId].tsx`). A global view of all shop purchases/transactions is **Missing**.
    *   **Edit item pricing, rarity, effects, availability:** **Implemented** as part of shop item edit UI.

### 4. Cosmetic Management

*   **Files Audited:** (Covered by Shop & User Inventory sections)
*   **Status:**
    *   **Create/edit avatar frames, username colors, fonts:** Handled via Shop Item creation (`pluginReward` field). **Implemented**.
    *   **Equip/unequip cosmetics for any user:** Handled by User Inventory Page. **Implemented**.
    *   **Configure cosmetic categories (frame, color, font, flair, sig, etc.):** **Missing**. No UI to define or manage these categories themselves.
    *   **Edit rarity tiers, visual effects:** Rarity tiers are selectable in shop item edit. Visual effects are part of `pluginReward`. Management of the *definitions* of rarity tiers is **Missing**.

### 5. Forum & Content Controls

*   **Files Audited:**
    *   `server/src/domains/admin/sub-domains/forum/forum.service.ts`
    *   `server/src/domains/admin/sub-domains/forum/forum.routes.ts`
    *   `client/src/pages/admin/forum-structure.tsx`
    *   `client/src/pages/admin/prefixes.tsx`
    *   `client/src/pages/admin/threads.tsx`
*   **Status:**
    *   **View all forums (categories/entities):** **Implemented** (`forum-structure.tsx` and backend).
    *   **Set access rules (who can post/view/tip/etc.):** Basic `viewPermission`, `postPermission` fields exist in `AdminForumService` for categories. UI for these on `forum-structure.tsx` is **Missing**. More granular rules **Missing**.
    *   **Manage prefixes per forum:** Client UI (`prefixes.tsx`) for CRUD is **Implemented**. Backend service logic for Update/Delete/Reorder of prefixes is **Missing**.
    *   **Toggle styling freedom per forum (unlocked posts):** **Missing**.
    *   **Pin, unpin, lock, unlock, delete threads/posts:**
        *   Threads: Lock/Unlock **Implemented** (UI & Backend). Pin/Unpin/Hide UI actions **Missing** (backend service supports these flags). Delete thread UI is placeholder; backend logic **Missing**. Editing thread content **Missing**.
        *   Posts: Moderation tools (view/edit/delete individual posts) are **Missing**.

### 6. Settings Panel (Global Config)

*   **Files Audited:**
    *   `server/src/domains/admin/sub-domains/settings/settings.service.ts`
    *   `server/src/domains/admin/sub-domains/settings/settings.routes.ts`
    *   `client/src/pages/admin/ui-config.tsx` (UI Quotes)
    *   `client/src/pages/admin/announcements/index.tsx`
    *   `client/src/pages/admin/config/xp.tsx` (JSON editor for some XP config)
    *   `db/schema/admin/siteSettings.ts`, `featureFlags.ts`, `announcements.ts`
*   **Status:**
    *   **Edit config values from (conceptual) `economy.config.ts`, `reward-calculator.ts`, `shop-items.ts`:** Backend `AdminSettingsService` for generic key-value `siteSettings` is **Implemented**. Client UI for these specific settings (if they are to be in `siteSettings`) is **Missing**. These conceptual `.config.ts` files were not found; their values need to be defined as database-driven settings.
    *   **Feature flags:** Schema `featureFlags.ts` exists. Dedicated backend service and client UI are **Not Audited / Likely Missing**.
    *   **Adjust XP-to-DGT rate, leveling formula:** Can be stored in `siteSettings`. Client UI **Missing**.
    *   **Edit site-wide announcements, mod alerts:** Announcements management is **Implemented** (UI & Backend). Mod alerts can be a type of announcement.
    *   **Forum system behavior toggles:** Can be stored in `siteSettings`. Client UI **Missing**.
    *   **Admin-editable UI copy (headers, slogans, disclaimers):** `ui-config.tsx` (UI Quote Manager) is **Implemented** and covers this well for quote-like texts.

### 7. Beta Tools

*   **Files Audited:** `client/src/pages/admin/dev/seeding.tsx`
*   **Status:**
    *   **View all admins/mods/devs with their audit logs:** **Missing**. (Generic audit log viewing in `adminController.ts` exists but not specific UI for this).
    *   **Grant XP/DGT/frame/title manually:**
        *   Grant XP: Implemented (`xp/adjust.tsx`).
        *   Grant DGT: Backend service exists (`AdminTreasuryService.sendFromTreasury`). Client UI **Missing**.
        *   Grant Frame/Title (Cosmetics): Handled by granting shop items via User Inventory page. **Implemented**.
    *   **Force password resets:** **Missing**.
    *   **View system logs:** **Missing**. (Server-side `logger.ts` exists, but no admin UI to view logs).
    *   **Toggle “beta-only” tools:** This would likely be a feature flag. Management of feature flags is **Missing**.
    *   Developer Seeding Page (`dev/seeding.tsx`): Exists and is functional for triggering backend seed scripts.

### General Observations:

*   The backend often has a more complete structure (routes, service method stubs, or even full logic) than the client-side UI for some features.
*   Many admin UI pages use `AdminPageShell` and `EntityTable`, indicating a consistent UI library/pattern.
*   `useCrudMutation` custom hook is used in some places, standardizing mutation logic.
*   API calls are made via `fetch` directly, `axios`, or an `apiRequest` helper. Consistency could be improved (ref: `api-client-pattern.mdc` rule).
*   Placeholder TODOs for submit logic exist in some older UI components (e.g., `users.tsx` dialogs).
*   The `directory-tree.md` may have some outdated file paths (e.g., `platform-settings.tsx` was not found).
*   The definition of "Configurable" (live edit without rebuilds, stored in DB or editable JSON) implies that settings currently in `.ts` config files (e.g., `client/src/config/xp.config.ts`) need to be migrated to a database-backed solution managed via the admin panel.

---

This audit document should serve as a baseline for planning the next phase of development for the admin panel.
