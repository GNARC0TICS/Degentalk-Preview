# Degentalk™™: MVP Beta Launch - Critical Needs

## 1. ✅ MVP Overview

Degentalk™ is a satirical next-gen crypto-native forum and social platform designed for cryptocurrency enthusiasts, gamblers, traders, developers, and the terminally online degenerates. It combines a feature-rich discussion board tied to satirical degen culture. with real-time social mechanics, a platform-exclusive token (**DGT**), and a gamified **XP** economy that rewards engagement.

<<<<<<< HEAD:MVP-NEEDS.md
**Core Features for Beta Launch (as per `projectBrief.md` & `DegenTalk XP & DGT Economy Manifesto` - Phase 1 & 1.5):**

- **User Authentication:** Register, login, logout.
- **Forum Core:** Create/Edit/View Threads & Posts, Rich Text Editor (Tiptap JSON based).
- **XP & Level System:** Earn XP via actions (posting, reactions, being tipped, referrals). Levels unlock perks/recognition.
=======
**Core Features for Beta Launch (as per `projectBrief.md` & `Degentalk™ XP & DGT Economy Manifesto` - Phase 1 & 1.5):**
- **User Authentication:** Register, login, logout, refer to earn.
- **Forum Core:** Create/Edit/View/Draft Threads & Posts, Rich Text Editor (Tiptap JSON based). Reaction System, Forums and Threads.
- **XP & Level System:** Earn XP via actions (posting, reactions, being tipped, referrals, tasks). Levels unlock perks/recognition.
>>>>>>> e9161f07a590654bde699619fdc9d26a47d0139a:MVP-GUIDE.md
- **DGT Wallet & Utility:** Internal currency (**DGT pegged at $0.10 USD**), earned (milestones, referrals, faucet) or purchased.
- **Basic Shop:** Purchase initial cosmetic items (e.g., Signature Unlock) with DGT.
- **Tipping & Rain:** Basic `/tip` command. `/rain` might be post-MVP if complex.
- **User Profiles:** View basic profiles with XP, Level, DGT. Edit basic info.
- **Basic Moderation Tools:** Hide/delete content, basic user roles (Admin, Mod, User).
- **SEO:** Basic SEO routing and OG metadata for threads.

## 2. 🧱 Finalization Checklist

### [ ] Frontend (`client/src/`)

**Pages & Routing:**

- [ ] **Authentication:**
  - [ ] Login page/modal.
  - [ ] Registration page/modal.
- [ ] **Core Forum:**
  - [ ] `pages/forums/index.tsx`: Display all forum zones/categories (from `db/schema/forum/categories.ts`).
  - [ ] `pages/forums/[slug].tsx`: Display threads within a specific category (using `threads.slug`).
  - [ ] `pages/threads/[id].tsx` (or `/[slug]~[id]`): Display a specific thread with posts.
  - [ ] Component/Modal for creating new threads (NewThreadForm).
  - [ ] Component/Modal for replying to posts (ReplyForm).
- [ ] **User Profile & Settings:**
  - [ ] `pages/profile/[username].tsx`: View user profile (XP, level, DGT balance, active title/badge, posts, threads).
  - [ ] `pages/settings/profile.tsx`: Edit user profile details (bio, signature, avatar, social handles from `db/schema/user/users.ts`).
  - [ ] `pages/settings/account.tsx`: Basic account settings (e.g., email, password change).
  - [ ] `pages/settings/notifications.tsx`: Basic notification preferences (from `db/schema/user/settings.ts`).
- [ ] **XP, DGT, Wallet & Shop:**
  - [ ] `pages/wallet.tsx` (or integrated into profile): Display DGT balance (`db/schema/economy/wallets.ts`), transaction history (`db/schema/economy/transactions.ts`).
  - [ ] `pages/shop/index.tsx`: Display Degen Shop items (Manifesto: "Enable Signature", "Custom Username Color", "Access WAGMI Lounge" as functional; "Animated Signature" as cosmetic flex).
  - [ ] Component/Modal for DGT purchase flow (Stripe/CCPayment).
- [ ] **Messaging (MVP Scope TBD - PMs higher priority than full shoutbox):**
  - [ ] `pages/messages/index.tsx`: List private conversations (`db/schema/messaging/conversations.ts`).
  - [ ] `pages/messages/[conversationId].tsx`: View and send private messages (`db/schema/messaging/directMessages.ts`).
- [ ] **Admin Panel Pages (referencing `.cursor/rules/admin-structure.mdc` & Manifesto Phase 1.5/Admin Config):**
  - [ ] `pages/admin/dashboard.tsx`: Basic overview.
  - [ ] `pages/admin/users/index.tsx`: User listing, search, basic management (view profile, edit role, ban).
  - [ ] `pages/admin/moderation/reports.tsx`: View reported content (`db/schema/admin/reports.ts`).
  - [ ] `pages/admin/settings/economy.tsx`: Configure **Smart Adjustables** from Manifesto (DGT_TO_USD, XP_PER_DGT, MAX_XP_PER_DAY, etc.) - `db/schema/economy/settings.ts` & `xpActionSettings.ts`.
  - [ ] `pages/admin/xp/adjust.tsx`: Manually grant/revoke XP to users.
  - [ ] `pages/admin/dgt/adjust.tsx`: Manually grant/revoke DGT to users.
  - [ ] `pages/admin/shop/items.tsx`: Manage shop items (add, edit, set DGT price).

**UI Components & Functionality:**

- [ ] **Forum:**
  - [ ] Rich text editor (Tiptap - JSON output) for posts/threads with basic formatting.
  - [ ] Component for displaying post reactions (Manifesto: "Reaction Received" awards 5 XP). Schema: `db/schema/forum/postReactions.ts`.
  - [ ] Tipping input/button on posts (for `/tip @user <amount> dgt`).
  - [ ] Thread creation form (title, content, category selection).
  - [ ] Post reply interface.
- [ ] **XP/DGT/Shop/User:**
  - [ ] Prominent display of user's XP, Level, DGT balance (e.g., in header, user dropdown).
  - [ ] XP Progress Bar.
  - [ ] Shop item display card.
  - [ ] "Buy with DGT" functionality for shop items.
  - [ ] Toast notifications for XP gains, DGT awards, level ups.
  - [ ] User search/mention component (for tipping, PMs).
  - [ ] Components to display user titles and badges on profile/posts.
- [ ] **Messaging:**
  - [ ] Basic UI for listing conversations and viewing/sending messages.
- [ ] **Admin Layout:**
  - [ ] All admin pages use `AdminLayout`.
- [ ] **General UI:**
  - [ ] Responsive design for core user flows.
  - [ ] Consistent loading states and error handling (using `apiRequest`).

### [ ] Backend (`server/src/`)

**API Routes & Controllers/Services:**

- [ ] **Authentication (`server/src/domains/auth/`):**
  - [ ] `POST /api/auth/register`
  - [ ] `POST /api/auth/login`
  - [ ] `POST /api/auth/logout`
  - [ ] Middleware for protecting routes.
- [ ] **Users (`server/src/domains/users/` or `profile`):**
  - [ ] `GET /api/users/@me`: Get current authenticated user's full profile.
  - [ ] `GET /api/users/:username`: Get public user profile.
  - [ ] `PUT /api/users/@me/profile`: Update profile (bio, signature, avatar).
  - [ ] `PUT /api/users/@me/settings`: Update user settings.
  - [ ] `POST /api/users/:userId/follow`: Follow a user (`db/schema/user/relationships.ts`).
  - [ ] `POST /api/users/:userId/friend-request`: Send friend request (`db/schema/user/relationships.ts`).
  - [ ] `PUT /api/users/friend-request/:requestId`: Accept/reject friend request.
- [ ] **Forum (`server/src/domains/forum/`):**
  - [ ] `POST /api/forum/threads`: Create thread (awards XP: "First Post" or "Daily Post", and potentially DGT if part of a special event).
  - [ ] `PUT /api/forum/threads/:threadId`: Edit thread.
  - [ ] `DELETE /api/forum/threads/:threadId`: Delete thread (moderator/admin).
  - [ ] `POST /api/forum/threads/:threadId/posts`: Create post/reply (awards XP: "Daily Post").
  - [ ] `PUT /api/posts/:postId`: Edit post.
  - [ ] `DELETE /api/posts/:postId`: Delete post (moderator/admin).
  - [ ] `POST /api/posts/:postId/react`: Add/remove reaction (awards XP to recipient per Manifesto).
  - [ ] `GET /api/forum/categories`, `GET /api/forum/categories/:slug/threads`, `GET /api/threads/:id/posts`: Robust data fetching, pagination.
  - [ ] `POST /api/reports`: Report content (ReportPost from Manifesto).
- [ ] **XP System (`server/src/domains/xp/` - as per Manifesto `How XP is Earned` & `XP and DGT Caps`):**
  - [ ] `POST /api/xp/award-action` (or integrated into other services): Handles XP awards.
    - Needs to check `xpActionSettings` for values (e.g., `DAILY_POST_XP`, `REACTION_RECEIVED_XP`).
    - Logic for `users.dailyXpGained` and `users.lastXpGainDate` to enforce `MAX_XP_PER_DAY`.
    - Logic for reaction XP cap (100 XP/day).
    - Logic for tip bonus XP cap (200 XP/day).
  - [ ] Service to update `users.level` based on `users.xp` and `db/schema/economy/levels.ts` definition.
- [ ] **DGT Wallet & Economy (`server/src/domains/wallet/` - as per Manifesto):**
  - [ ] `POST /api/wallet/tip`: Handle `/tip @user <amount> dgt`.
    - Deduct DGT from tipper.
    - Add DGT to tippee.
    - Award 10 XP per DGT to tippee (respecting 200 XP/day cap).
    - Configurable treasury fee (1-5%).
    - Log DGT transaction (`db/schema/economy/transactions.ts`).
  - [ ] `POST /api/wallet/transactions/create-reward`: General DGT rewards (e.g., referral signup, milestone).
  - [ ] `GET /api/wallet/balance`: Fetch user DGT balance.
  - [ ] `GET /api/wallet/transactions`: Fetch DGT transaction history.
- [ ] **Referral System (`server/src/domains/referrals/` or user service - as per Manifesto):**
  - [ ] `POST /api/referrals/track`: Endpoint for user to submit a referral code (if applicable) or link tracking.
  - [ ] Logic to award `1 DGT + 50 XP` to referee on verified signup.
  - [ ] Logic to award `5 DGT + 200 XP` to referrer when referee hits Level 3.
  - [ ] Anti-abuse: IP/device tracking for uniqueness.
- [ ] **Degen Shop (`server/src/domains/shop/`):**
  - [ ] `POST /api/shop/purchase/:itemId`: Purchase shop item with DGT.
    - Deduct DGT from `users.dgtWalletBalance` or `wallets.balance`.
    - Add item to `db/schema/shop/userInventory.ts` or `userSignatureItems.ts`.
  - [ ] `GET /api/shop/items`: List shop items.
- [ ] **Fiat/Crypto Payments (Stripe/CCPayment - as per `MVP-NEEDS.md` previous version):**
  - [ ] `POST /api/payments/create-dgt-order`: Initiate DGT purchase.
  - [ ] Webhook for CCPayment/Stripe to confirm payment and credit DGT.
- [ ] **Messaging (`server/src/domains/messaging/`):**
  - [ ] `POST /api/messages/direct`: Send direct message.
  - [ ] `GET /api/messages/conversations`: List user's conversations.
  - [ ] `GET /api/messages/conversations/:id`: Get messages for a conversation.
  - [ ] `POST /api/shoutbox` (If Shoutbox is MVP): Post to shoutbox. `db/schema/messaging/shoutboxMessages.ts`.
- [ ] **Admin (`server/src/domains/admin/`):**
  - [ ] Secure admin endpoints based on `users.role`.
  - [ ] Endpoints for managing users, economy settings (XP actions, levels, DGT peg, tip fees), granting XP/DGT, managing shop items, handling reports.
  - [ ] `GET /api/admin/session-history` (if MVP): View user session data (`db/schema/user/sessions.ts`) or audit logs.

**Logic & Stability:**

- [ ] Implement rate limiting for key actions (posting, login, tipping) - `db/schema/system/rateLimits.ts`.
- [ ] Robust error handling and logging.
- [ ] Zod validation for all API inputs.
- [ ] Database indexes on critical query columns (`userId`, `threadId`, `createdAt`).

### [ ] Database / Schema (`db/schema/` & `shared/schema.ts`)

- [ ] **Migrations & Consistency:**
  - [ ] All schema changes reflected in Drizzle migrations and applied successfully.
  - [ ] Parity between SQLite (dev) and PostgreSQL (prod) schemas confirmed (`schema-consistency.mdc`).
- [ ] **Schema Audit (Reflecting Manifesto & User's MVP list):**
  - [ ] **Users (`users.ts`):**
    - Fields: `xp`, `level`, `dgtWalletBalance` (or link to `wallets` table), `dailyXpGained`, `lastXpGainDate`, `role`, `groupId`, `activeTitleId`, `activeBadgeId`, `referrerId`.
  - [ ] **Forum (`categories.ts`, `threads.ts`, `posts.ts`, `postReactions.ts`, `tags.ts`, `threadTags.ts`, `threadBookmarks.ts`):**
    - Essential fields for full forum functionality including slugs, solved status, reactions.
  - [ ] **Economy Core:**
    - `wallets.ts`: User DGT balances.
    - `transactions.ts`: Comprehensive log of all DGT movements (type: TIP, REWARD, ADMIN_ADJUST, SHOP_PURCHASE, REFERRAL_BONUS, RAIN, FAUCET).
    - `xpActionSettings.ts`: Config for XP amounts per action (Manifesto Table 5).
    - `levels.ts`: XP requirements for levels 1-10 and formula for 11+ (Manifesto Section 8).
    - `badges.ts`, `userBadges.ts`: For basic badge system.
    - `titles.ts`, `userTitles.ts`: For user titles.
  - [ ] **Shop (`products.ts`, `signatureItems.ts`, `userInventory.ts`, `userSignatureItems.ts`):**
    - Tables for shop items and user-owned items. Prices in DGT.
  - [ ] **Referral System:**
    - `users.referrerId` is sufficient for MVP tracking. Logic handles rewards.
  - [ ] **Relationships (`relationships.ts`):**
    - For Follow/Friend system.
  - [ ] **Messaging (`conversations.ts`, `directMessages.ts`, `shoutboxMessages.ts`):**
    - Tables for private messages and potentially shoutbox.
  - [ ] **Admin & System (`reports.ts`, `moderationActions.ts`, `economy/settings.ts`, `rateLimits.ts`, `sessions.ts`):**
    - Support for moderation, economy config, rate limits, session tracking.
- [ ] **Initial Data Seeding:**
  - [ ] Seed `xpActionSettings` with values from Manifesto.
  - [ ] Seed `levels` table with XP thresholds from Manifesto.
  - [ ] Seed initial `shop/products` and `signatureItems` with DGT prices from Manifesto.
  - [ ] Seed basic `userGroups` (User, Mod, Admin).
  - [ ] Seed `economy/settings` with default "Smart Adjustables" from Manifesto.

### [ ] XP & DGT Systems (Based on Manifesto)

- [ ] **XP Earning & Logic:**
  - [ ] Implement all XP earning actions from Manifesto Table 5 ("How XP is Earned").
    - First Post: 50 XP
    - Daily Post: 25 XP (max once/24h)
    - Reaction Received: 5 XP (max 100 XP/day from this source)
    - Faucet Claim: 50 XP (once/day, if faucet is MVP)
    - Referred User Signup: 100 XP
    - Referred User Levels Up (to L3+): 200 XP
    - Tipped by Other User: 10 XP per DGT (capped 200 XP/day from tips)
  - [ ] XP caps (Daily total 1000 XP, Tip XP 200/day, Reaction XP 100/day) are enforced.
  - [ ] Leveling system implemented as per Manifesto Section 8 (table for L1-10, formula for L11+).
  - [ ] `users.xp` accumulates, `users.level` updates upon reaching thresholds.
- [ ] **DGT Earning & Logic:**
  - [ ] Implement DGT earning sources from Manifesto Table 6 ("How DGT is Earned").
    - Referral Signup (referee): 1 DGT
    - Referral Milestone (referrer, when referee hits L3): 5 DGT
    - Admin Grants: Variable (via admin panel)
    - Daily Faucet (optional, if MVP): 0.5 DGT (capped daily)
  - [ ] DGT Peg: $0.10 USD per 1 DGT (ensure purchase flows respect this).
  - [ ] XP to DGT relation: 1000 XP ≈ 1 DGT (for conceptual understanding, not direct conversion unless specified).
- [ ] **Tipping (`/tip`):**
  - [ ] Syntax: `/tip @user <amount> dgt` (or UI equivalent).
  - [ ] Min Tip: 1 DGT.
  - [ ] XP Reward to tippee: 10 XP per DGT tipped (max 200 XP/day).
  - [ ] Optional Fee: 1-5% to treasury/burn (configurable in `economy/settings.ts`).
- [ ] **Rain (`/rain`) (Potentially Post-MVP if too complex for Beta):**
  - [ ] Min Amount: 5 DGT. Max Recipients: 15. Cooldown: 1/hr.
  - [ ] Eligible: Active users (requires activity tracking).
- [ ] **Admin Configuration:**
  - [ ] All "Smart Adjustables" from Manifesto Section 13 are configurable via admin panel and stored in `db/schema/economy/settings.ts` or `xpActionSettings.ts`.

### [ ] Admin Panel (Based on Manifesto & MVP Needs)

- [ ] **User Management:**
  - [ ] View/Search Users. Edit role (`users.role`). Ban/Unban.
- [ ] **Economy Management (Key Priority):**
  - [ ] Manually Grant/Revoke XP & DGT to users (logged).
  - [ ] Configure **ALL Smart Adjustables** from Manifesto Section 13 (DGT_TO_USD, XP_PER_DGT, MAX_XP_PER_DAY, MIN_TIP_DGT, FAUCET_REWARD_XP/DGT, levelXPMap, referralRewards, rainSettings etc.).
  - [ ] Manage `xpActionSettings` values.
  - [ ] Manage `levels` XP thresholds.
- [ ] **Shop Management:**
  - [ ] Add/Edit/Disable shop items (functional & cosmetic) with DGT prices as per Manifesto Section 9.
- [ ] **Moderation:**
  - [ ] View Reports (`db/schema/admin/reports.ts`).
  - [ ] Moderate content (hide/delete posts/threads). Actions logged in `db/schema/admin/moderationActions.ts`.
- [ ] **Basic Stats:**
  - [ ] Display key platform metrics (total users, posts, DGT in circulation).

### [ ] Wallet & CCPayment / Stripe

- [ ] **DGT Wallet:**
  - [ ] Users can accurately view their DGT balance.
  - [ ] All DGT movements are logged in `db/schema/economy/transactions.ts`.
- [ ] **DGT Purchase (Stripe for Fiat, CCPayment for Crypto - USDT):**
  - [ ] Functional purchase flow for DGT.
  - [ ] Successful payments credit DGT to user's wallet.
  - [ ] Secure handling of API keys.

### [ ] Forum Features (Core from Manifesto Phase 1 & User List)

- [ ] **Core:** Threads & Replies (Create/Edit/View), Reactions, Basic Rich Text Editor.
- [ ] **User Interaction:** Likes (as reactions), Follow Users, Friend Users (basic implementation).
- [ ] **Organization:** Tags for threads.
- [ ] **Profile:** User Titles, Basic Badge display (awarded via admin or simple system).
- [ ] **Discovery:** SEO-friendly slugs for threads. Basic OG metadata.
- [ ] **Settings:** User profile editing, basic notification toggles.
- [ ] **Session History:** Admin view of user sessions or key audit logs.

## 3. 🔒 Stability & Safety (Incorporating Manifesto Anti-Abuse Rules)

- [ ] **XP/DGT Anti-Abuse (Manifesto Section 12 & 7):**
  - [ ] Daily XP Cap (1000 XP from grindable actions) strictly enforced.
  - [ ] Tip XP Cap (200 XP/day from being tipped) strictly enforced.
  - [ ] Reaction XP Cap (100 XP/day from reactions received) strictly enforced.
  - [ ] Faucet IP/Device Lock (if faucet is MVP).
  - [ ] Referral Gating (one reward per unique IP/device, tied to account verification).
  - [ ] Level-gated Withdrawals (Level 2 + 3 DGT held - _Confirm if DGT withdrawal itself is MVP. Manifesto implies internal only for now._). For MVP, focus on internal DGT economy.
- [ ] **Input Sanitization & Validation:**
  - [ ] Sanitize Tiptap JSON output and all other user inputs.
  - [ ] Backend Zod validation for all API requests.
- [ ] **Environment Configuration (`env.local`):**
  - [ ] All critical keys secure and correctly used.
  - [ ] Sensible fallbacks or clear errors for missing non-critical configs.
- [ ] **Rate Limiting (`db/schema/system/rateLimits.ts`):**
  - [ ] Applied to login, registration, post/thread creation, tipping, reactions.
- [ ] **Error Logging & Basic Monitoring.**
- [ ] **Secure User Roles & Permissions:** Admin/Mod actions are properly restricted.

## 4. 🎯 Optional Nice-to-Haves (Deferrable Post-Beta)

- [ ] Full Shoutbox with real-time updates.
- [ ] Advanced `MediaLibrary` for diverse user uploads.
- [ ] Advanced SEO (`db/schema/admin/seoMetadata.ts`).
- [ ] Full Gamification Suite: `achievements`, `missions`, `leaderboards` beyond basic display.
- [ ] Full Notification System (`db/schema/system/notifications.ts`).
- [ ] Detailed Admin Audit Logs (`db/schema/admin/auditLogs.ts`).
- [ ] Scheduled Tasks (`db/schema/admin/scheduledTasks.ts`).
- [ ] More complex shop items from Manifesto (Animated Flair Trail, Custom Font Pack, Legendary Theme Skin).
- [ ] XP/Clout decay system (Manifesto Phase 4).
- [ ] Event Bus architecture (Manifesto Phase 4).

## 5. 📦 Ready-to-Ship Criteria (Must be TRUE for Beta Launch)

1.  **User Authentication & Core Profile:** Users can register, login, logout, view their basic profile (XP, Level, DGT), and edit essential profile info.
2.  **Core Forum Usable:** Users can create/view/edit threads & posts with basic rich text; react to posts.
3.  **XP & Level System Operational:** XP is awarded for key actions (posting, reactions, being tipped, basic referrals) as per Manifesto. Users level up based on XP. Daily XP caps are functional.
4.  **DGT Wallet & Basic Shop Functional:** Users can see DGT balance. DGT is awarded for key actions (referrals). Users can purchase at least one "functional" shop item (e.g., "Enable Signature") and one "cosmetic" item with DGT.
5.  **Tipping Works:** `/tip @user <amount> dgt` (or UI equivalent) functions, transferring DGT and awarding XP to tippee per Manifesto rules.
6.  **DGT Purchase Flow Tested (at least one method):** Users can buy DGT (e.g., via Stripe), and balances update.
7.  **Basic Admin Controls Operational:** Admins can manage users (roles, ban), manually grant XP/DGT, and configure key "Smart Adjustables" for the economy from the Manifesto. Basic content moderation (hide/delete).
8.  **Critical Security & Anti-Abuse:** Manifesto's anti-abuse rules for XP/DGT caps and referral gating are implemented. Basic input sanitization.
9.  **No Major Data Loss Bugs or Critical Errors:** Core data (users, posts, DGT balances, XP) is persisted reliably. Key user flows are stable.
10. **Key MVP Features Functional:** Private messages (basic), Follow/Friend users (basic), User Titles & Badges (display of admin-awarded ones).

---
<<<<<<< HEAD:MVP-NEEDS.md

This document reflects the updated MVP scope. Aggressively validate each point against the DegenTalk XP & DGT Economy Manifesto and desired beta functionality.
=======
This document reflects the updated MVP scope. Aggressively validate each point against the Degentalk™™ XP & DGT Economy Manifesto and desired beta functionality. 
>>>>>>> e9161f07a590654bde699619fdc9d26a47d0139a:MVP-GUIDE.md
