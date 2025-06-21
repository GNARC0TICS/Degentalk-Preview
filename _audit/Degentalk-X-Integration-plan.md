# DegenTalk X Integration Plan

_Date: 2025-06-15_

---

## Objective

Enable users to:

- Link their DegenTalk profiles to X accounts for seamless content sharing.
- Create DegenTalk accounts using X OAuth authentication.
- Share posts, threads, and DegenTalk material directly to X from our app.
- Leverage X integration for viral growth through the referral system and DegenTalk economy.

## Scope

- **Authentication**: Implement X OAuth 2.0 for account creation and linking.
- **Profile Linking**: Store X account data and tokens in user profiles.
- **Content Sharing**: Enable sharing of posts, threads, and referral links to X.
- **Economy Integration**: Reward users with XP or DGT for X-based activities (e.g., sharing, referrals).
- **Scalability**: Design for high user volume and API rate limits.
- **Viral Mechanics**: Integrate with referral system to incentivize X-based invites and content sharing.

## Dependencies

- **X Developer Account**: Obtain API keys and OAuth credentials for X API access.
- **OAuth Library**: Use a library like `passport.js` with `passport-twitter` strategy or a similar OAuth 2.0 client for X.
- **Database**: Update user schema to store X account data and tokens.
- **Frontend**: UI components for linking, authentication, and sharing.
- **Backend**: Services for handling X API calls and token management.
- **Economy System**: Existing XP and DGT systems for rewards.

## Implementation Steps

### 1. Database Schema Updates

- [x] **Table: users (Extend Existing)**
  - [x] Add fields for X integration:
    - [x] `xAccountId`: `varchar('x_account_id', { length: 255 })` - Store X user ID.
    - [x] `xAccessToken`: `varchar('x_access_token', { length: 512 })` - Store OAuth access token.
    - [x] `xRefreshToken`: `varchar('x_refresh_token', { length: 512 })` - Store OAuth refresh token.
    - [x] `xTokenExpiresAt`: `timestamp('x_token_expires_at')` - Token expiration time.
    - [x] `xLinkedAt`: `timestamp('x_linked_at')` - Timestamp of linking.
  - [x] Migration script: Create `migrations/0010_add_x_account_fields.sql` to add these columns.
- [x] **Table: xShares (New Table for Tracking Shares)**
  - [x] Track sharing activities for analytics and rewards:
    - [x] `id`: `serial('id').primaryKey()`
    - [x] `userId`: `integer('user_id').references(() => users.id, { onDelete: 'cascade' })`
    - [x] `contentType`: `varchar('content_type', { length: 50 })` - e.g., 'post', 'thread', 'referral'.
    - [x] `contentId`: `integer('content_id')` - ID of shared content.
    - [x] `xPostId`: `varchar('x_post_id', { length: 255 })` - ID of the post on X.
    - [x] `sharedAt`: `timestamp('shared_at').defaultNow().notNull()`
  - [x] Add to `db/schema/user/xShares.ts`.
  - [x] Create migration script for `xShares` table.

### 2. Backend Implementation

- [x] **OAuth Authentication Service**:
  - [x] Define Location: `server/src/domains/auth/services/xAuthService.ts`
  - [x] Implement X OAuth 2.0 flow using `passport-twitter` or a similar library.
  - [x] Handle login/registration: If user exists, link X account; if not, create new DegenTalk account with X data.
  - [x] Store tokens securely in the database with expiration handling.
- [ ] **API Endpoints**:
  - [x] Create `GET /api/auth/x/login`: Initiate X OAuth flow, redirect to X for authorization.
  - [x] Create `GET /api/auth/x/callback`: Handle callback, store tokens, and link/create account.
  - [x] Create `POST /api/profile/x/unlink`: Unlink X account from DegenTalk profile.
  - [x] Create `POST /api/share/x/post`: Share a post or thread to X, requires linked account.
  - [x] Create `POST /api/share/x/referral`: Share referral link to X, track for rewards.
  - [ ] Define Location: `server/src/domains/auth/routes/xAuthRoutes.ts` and `server/src/domains/share/routes/xShareRoutes.ts`
- [ ] **X API Interaction Service**:
  - [x] Define Location: `server/src/domains/share/services/xShareService.ts`
  - [x] Use X API to post content (tweets, threads) on behalf of users.
  - [ ] Handle rate limits with queuing system (e.g., using Redis or BullMQ).
  - [x] Track share events in `xShares` table for analytics and rewards.
- [x] **Economy Integration**:
  - [x] Define Location: `server/src/domains/economy/services/rewardService.ts`
  - [x] Award XP/DGT for X sharing activities (e.g., configurable via economySettings).
  - [x] Integrated with `XpLevelService` and `dgtService`.
- [ ] **Scalability Considerations**:
  - [ ] Implement rate limit handling for X API calls using a queue system.
  - [ ] Cache X user data to reduce API calls.
  - [ ] Use database indexing on `xShares` for efficient analytics.

### 3. Frontend Implementation

- [ ] **Authentication UI**:
  - [ ] Define Location: `client/src/features/auth/components/XLoginButton.tsx`
  - [ ] Add "Sign in with X" button on login/registration pages.
  - [ ] Define Location: `client/src/features/profile/components/XLinkButton.tsx`
  - [ ] Add "Link X Account" button in profile settings for existing users.
- [ ] **Sharing UI**:
  - [ ] Define Location: `client/src/features/forum/components/XShareButton.tsx`
  - [ ] Add X share button to posts and threads, visible only if X account is linked.
  - [ ] Define Location: `client/src/features/referral/components/XReferralShare.tsx`
  - [ ] Add option to share referral link to X from referral page.
- [ ] **Profile Display**:
  - [ ] Define Location: `client/src/features/profile/components/XProfileBadge.tsx`
  - [ ] Display X handle or badge on user profile if linked.
- [ ] **Hooks and Services**:
  - [ ] Define Location: `client/src/features/auth/hooks/useXAuth.ts`
  - [ ] Create Hook to check if X account is linked and initiate linking flow.
  - [ ] Define Location: `client/src/features/share/services/xShareApi.ts`
  - [ ] Create API service to trigger sharing to X via backend endpoints.
- [ ] **Mobile Considerations**:
  - [ ] Ensure X OAuth flow works in mobile browsers with proper redirect handling.
  - [ ] Use compact share buttons on mobile views.

### 4. Integration with DegenTalk Economy and Referral System

- [ ] **Referral System**:
  - [ ] Extend `users/services/referralsApi.ts` to track referrals originating from X shares.
  - [ ] Reward users with DGT or XP for successful referrals (e.g., 100 DGT per new user signup from X link).
- [ ] **Viral Mechanics**:
  - [ ] Incentivize sharing by offering escalating rewards for X posts that drive engagement (e.g., bonus XP for shares that get likes/retweets on X).
  - [ ] Use `xShares` table to track engagement metrics if X API provides feedback.
  - [ ] Promote forum culture by encouraging users to share unique DegenTalk content or memes to X with branded hashtags.
- [ ] **Economy Events**:
  - [ ] Trigger economy events for X activities (e.g., `event_logs` entry for 'x_share', 'x_referral_success').
  - [ ] Display notifications for rewards earned via X activities.

### 5. Plan for Scale

- [ ] **API Rate Limits**: Implement a job queue (e.g., BullMQ with Redis) to manage X API calls, retrying on rate limit errors.
- [ ] **Token Refresh**: Automate token refresh for X OAuth tokens to prevent expired token issues.
- [ ] **Database Performance**: Index `users.xAccountId` and `xShares.userId` for fast lookups.
- [ ] **Caching**: Cache X profile data and share counts to reduce load on X API.
- [ ] **Monitoring**: Add analytics to track X integration usage and errors for proactive scaling.

### 6. Security Considerations

- [ ] Encrypt X tokens in the database using a secure method (e.g., server-side encryption).
- [ ] Implement strict OAuth scopes to limit access to necessary X account features.
- [ ] Provide clear UI feedback when X permissions are requested during linking.

## Roadmap Integration

- [ ] **Insert** X Account Linking as **Step 3C** after "Persistent Profile Sub-Navigation" in the audit's "Next Steps" section.
- [ ] **Timeline**: Estimate 3-5 dev-days for MVP implementation, including OAuth setup, UI integration, and economy rewards.

## Mermaid Diagram for Implementation Flow

```mermaid
graph TD
    A[User Initiates X Linking] --> B[X OAuth Flow]
    B --> C[Callback: Store Tokens in DB]
    C --> D[Link X Account to Profile]
    D --> E[UI: Show X Badge on Profile]
    E --> F[User Shares Content to X]
    F --> G[Backend: Post to X via API]
    G --> H[Track Share in xShares Table]
    H --> I[Award XP/DGT for Sharing]
    I --> J[Referral Share: Track Engagement]
    J --> K[Reward for Successful Referrals]
```

This plan ensures a robust integration of X account linking into DegenTalk, focusing on user experience, scalability, and viral growth through economy incentives.
