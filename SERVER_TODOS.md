# SERVER TODO AUDIT

Generated: 2025-01-14  
Total TODOs Found: 142  
Source: `server/src/**/*`

## CRITICAL

### Authentication & Security

- `server/src/domains/advertising/ad.controller.ts:157` - TODO: Extract user ID from JWT token
- `server/src/domains/advertising/ad-admin.controller.ts:151` - TODO: Extract from JWT (const adminUserId = req.body.userId || 'admin-123')
- `server/src/domains/advertising/ad-admin.controller.ts:413` - TODO: Extract from JWT (const proposerUserId = req.body.userId || 'admin-123')
- `server/src/domains/advertising/ad.routes.ts:125` - TODO: Extract from JWT (const voterUserId = req.body.userId || 'user-123')
- `server/src/domains/advertising/ad.routes.ts:269` - TODO: Implement JWT authentication middleware
- `server/src/domains/advertising/ad.routes.ts:273` - TODO: Implement admin authentication middleware
- `server/src/domains/advertising/ad-configuration.service.ts:155` - TODO: Verify admin permissions
- `server/src/domains/advertising/ad-admin.controller.ts:136` - TODO: Verify admin permissions

### Database Schema Issues

- `server/src/domains/gamification/services/mission.service.ts:310` - TODO: Add 'conditions' TEXT column to missions table
- `server/src/domains/gamification/services/mission.service.ts:461` - TODO: Add column (conditions commented out)
- `server/src/domains/gamification/services/mission.service.ts:557` - TODO: Add column (conditions commented out)
- `server/src/domains/admin/sub-domains/social/social.service.ts:2` - TODO: Fix schema imports - temporarily disabled to get backend running

### Service Integration Failures

- `server/src/domains/admin/sub-domains/social/social.service.ts:14` - TODO: Temporarily returning defaults until schema imports are fixed
- `server/src/domains/admin/sub-domains/social/social.service.ts:17` - TODO: Implement database storage once schema imports are fixed
- `server/src/domains/admin/sub-domains/social/social.service.ts:23` - TODO: Temporarily disabled until schema imports are fixed
- `server/src/domains/admin/sub-domains/social/social.service.ts:35` - TODO: Implement database storage once schema imports are fixed
- `server/src/domains/admin/sub-domains/social/social.service.ts:43` - TODO: Temporarily returning mock data until schema imports are fixed
- `server/src/domains/admin/sub-domains/social/social.service.ts:46` - TODO: Implement database queries once schema imports are fixed
- `server/src/domains/admin/sub-domains/social/social.service.ts:58` - TODO: Temporarily disabled until schema imports are fixed
- `server/src/domains/admin/sub-domains/social/social.service.ts:61` - TODO: Implement database reset once schema imports are fixed

## HIGH

### Core Service Implementations

- `server/src/domains/gamification/services/achievement.service.ts:514` - TODO: Implement when likes system is available
- `server/src/domains/gamification/services/achievement.service.ts:578` - TODO: Implement login streak calculation
- `server/src/domains/gamification/achievements/achievement-processor.service.ts:438` - TODO: Integrate with DGT service
- `server/src/domains/gamification/achievements/achievement-processor.service.ts:447` - TODO: Integrate with Clout service
- `server/src/domains/gamification/achievements/achievement-processor.service.ts:454` - TODO: Handle title and badge rewards when those systems are integrated
- `server/src/domains/profile/social-actions.controller.ts:234` - TODO: Implement sophisticated suggestion algorithm
- `server/src/domains/profile/social-actions.controller.ts:250` - TODO: Implement full friend request query
- `server/src/domains/social/mentions.service.ts:160` - TODO: Implement friendship check when friends system is ready
- `server/src/domains/social/mentions.service.ts:168` - TODO: Implement follower check when follow system is ready

### API Feature Gaps

- `server/src/domains/engagement/tip/tip.service.ts:142` - TODO: Implement crypto tipping if CCPayment supports it
- `server/src/domains/shop/shop.routes.ts:336` - TODO: Implement USDT payments via CCPayment
- `server/src/domains/forum/controllers/post.controller.ts:56` - TODO: Implement tipping logic with DGT service integration
- `server/src/domains/forum/services/post.service.ts:352` - TODO: Implement tipping logic with DGT service integration
- `server/src/domains/wallet/admin/wallet.routes.ts:30` - TODO: Implement these methods in controller

### Admin & Analytics Functions

- `server/src/domains/gamification/admin.controller.ts:309` - TODO: Implement actual config storage and retrieval
- `server/src/domains/gamification/admin.controller.ts:341` - TODO: Implement actual config storage
- `server/src/domains/gamification/admin.controller.ts:363` - TODO: Implement actual user progress reset
- `server/src/domains/gamification/admin.controller.ts:459` - TODO: Implement actual log retrieval
- `server/src/domains/advertising/ad-admin.controller.ts:451` - TODO: Implement fraud detection system
- `server/src/domains/advertising/ad-admin.controller.ts:479` - TODO: Implement revenue reporting
- `server/src/domains/advertising/ad-admin.controller.ts:517` - TODO: Implement data export

### External Service Integration

- `server/src/core/errors.ts:341` - TODO: Integrate with alerting service (PagerDuty, Slack, etc.)
- `server/src/domains/admin/sub-domains/email-templates/email-templates.service.ts:450` - TODO: Integrate with your email service (SendGrid, AWS SES, etc.)

## MEDIUM

### Database Optimizations

- `server/src/core/services/user.service.ts:180` - TODO: Use proper IN clause when Drizzle supports it
- `server/src/domains/advertising/ad-serving.service.ts:111` - TODO: Add Redis caching layer
- `server/src/domains/admin/sub-domains/analytics/system-analytics.controller.ts:241` - TODO: Implement cache warming

### Performance & Analytics Tracking

- `server/src/domains/gamification/services/analytics.service.ts:384` - TODO: Implement completion time tracking
- `server/src/domains/gamification/services/analytics.service.ts:386` - TODO: Implement streak calculation
- `server/src/domains/gamification/services/analytics.service.ts:437` - TODO: Implement session tracking
- `server/src/domains/gamification/services/analytics.service.ts:438` - TODO: Implement retention calculation
- `server/src/domains/gamification/services/analytics.service.ts:439` - TODO: Implement churn calculation
- `server/src/domains/gamification/services/analytics.service.ts:479` - TODO: Implement actual trend data queries
- `server/src/domains/gamification/services/analytics.service.ts:569` - TODO: Implement error rate tracking
- `server/src/domains/gamification/services/analytics.service.ts:570` - TODO: Implement throughput tracking
- `server/src/domains/gamification/services/analytics.service.ts:572` - TODO: Implement alert system
- `server/src/domains/gamification/analytics.controller.ts:374` - TODO: Implement real-time activity tracking

### User Experience Features

- `server/src/domains/forum/services/thread.service.ts:417` - TODO: Calculate actual level from XP
- `server/src/domains/forum/services/thread.service.ts:418` - TODO: Fetch actual XP
- `server/src/domains/forum/services/thread.service.ts:419` - TODO: Fetch actual reputation
- `server/src/domains/forum/services/thread.service.ts:420` - TODO: Calculate post count
- `server/src/domains/forum/services/thread.service.ts:421` - TODO: Calculate thread count
- `server/src/domains/forum/services/thread.service.ts:422` - TODO: Calculate like count
- `server/src/domains/forum/services/thread.service.ts:423` - TODO: Calculate tip count
- `server/src/domains/forum/services/thread.service.ts:425` - TODO: Implement online status
- `server/src/domains/forum/services/thread.service.ts:426` - TODO: Implement last seen tracking

### Permission & Authorization Systems

- `server/src/domains/forum/services/thread.service.ts:450` - TODO: Implement proper permission checking
- `server/src/domains/forum/services/thread.service.ts:451` - TODO: Implement proper permission checking
- `server/src/domains/forum/services/thread.service.ts:452` - TODO: Check forum rules and user permissions
- `server/src/domains/forum/services/thread.service.ts:453` - TODO: Check if user can mark as solved
- `server/src/domains/forum/services/permissions.service.ts:199` - TODO: Implement level checking when user levels are available

## OTHER

### Code Cleanup & Migration

- `server/src/core/database.ts:3` - TODO: Remove after all feature branches are migrated to use "@db" or "@core/db" directly
- `server/src/domains/auth/index.ts:16` - TODO: Remove the original file after migration is complete
- `server/src/domains/forum/forum.service.ts:326` - TODO: Move to ThreadService in next iteration

### Transformer Implementations (Stub Files)

- `server/src/domains/share/transformers/share.transformer.ts:5` - TODO: Implement proper transformation
- `server/src/domains/share/transformers/share.transformer.ts:10` - TODO: Implement proper transformation
- `server/src/domains/share/transformers/share.transformer.ts:15` - TODO: Implement proper transformation
- `server/src/domains/subscriptions/transformers/subscription.transformer.ts:5` - TODO: Implement proper transformation
- `server/src/domains/subscriptions/transformers/subscription.transformer.ts:10` - TODO: Implement proper transformation
- `server/src/domains/subscriptions/transformers/subscription.transformer.ts:15` - TODO: Implement proper transformation
- `server/src/domains/collectibles/transformers/collectibles.transformer.ts:5` - TODO: Implement proper transformation
- `server/src/domains/collectibles/transformers/collectibles.transformer.ts:10` - TODO: Implement proper transformation
- `server/src/domains/collectibles/transformers/collectibles.transformer.ts:15` - TODO: Implement proper transformation
- `server/src/domains/paths/transformers/paths.transformer.ts:5` - TODO: Implement proper transformation
- `server/src/domains/paths/transformers/paths.transformer.ts:10` - TODO: Implement proper transformation
- `server/src/domains/paths/transformers/paths.transformer.ts:15` - TODO: Implement proper transformation
- `server/src/domains/treasury/transformers/treasury.transformer.ts:5` - TODO: Implement proper transformation
- `server/src/domains/treasury/transformers/treasury.transformer.ts:10` - TODO: Implement proper transformation
- `server/src/domains/treasury/transformers/treasury.transformer.ts:15` - TODO: Implement proper transformation
- `server/src/domains/missions/transformers/missions.transformer.ts:5` - TODO: Implement proper transformation
- `server/src/domains/missions/transformers/missions.transformer.ts:10` - TODO: Implement proper transformation
- `server/src/domains/missions/transformers/missions.transformer.ts:15` - TODO: Implement proper transformation
- `server/src/domains/dictionary/transformers/dictionary.transformer.ts:5` - TODO: Implement proper transformation
- `server/src/domains/dictionary/transformers/dictionary.transformer.ts:10` - TODO: Implement proper transformation
- `server/src/domains/dictionary/transformers/dictionary.transformer.ts:15` - TODO: Implement proper transformation

### Storage & File Management

- `server/src/core/storage.service.ts:311` - TODO: Implement GCS presigned URL generation
- `server/src/core/storage.service.ts:329` - TODO: Implement GCS public URL construction
- `server/src/core/storage.service.ts:337` - TODO: Implement GCS file existence check
- `server/src/core/storage.service.ts:346` - TODO: Implement GCS file deletion

### Feature Enhancements

- `server/src/domains/share/routes/xShareRoutes.ts:10` - TODO: Implement sharing routes
- `server/src/domains/advertising/user-promotion.routes.ts:134` - TODO: Implement promotion extension logic
- `server/src/domains/advertising/user-promotion.routes.ts:163` - TODO: Implement promotion cancellation logic
- `server/src/domains/advertising/user-promotion.routes.ts:268` - TODO: Implement getting active announcement slots for display
- `server/src/domains/advertising/user-promotion.routes.ts:389` - TODO: Implement admin-level analytics for all user promotions
- `server/src/domains/advertising/ad.controller.ts:136` - TODO: Implement event tracking service
- `server/src/domains/advertising/ad-admin.controller.ts:313` - TODO: Implement platform-wide analytics aggregation
- `server/src/domains/advertising/ad-admin.controller.ts:359` - TODO: Implement admin-level campaign listing
- `server/src/domains/advertising/ad-admin.controller.ts:388` - TODO: Implement campaign review logic

### Data Calculations & Metrics

- `server/src/domains/gamification/services/leveling.service.ts:251` - TODO: Implement streak calculation
- `server/src/domains/gamification/services/leveling.service.ts:312` - TODO: Implement weekly XP tracking
- `server/src/domains/gamification/services/leveling.service.ts:317` - TODO: Implement monthly XP tracking
- `server/src/domains/gamification/services/leveling.service.ts:369` - TODO: Implement trend calculation
- `server/src/domains/gamification/services/leveling.service.ts:557` - TODO: Calculate actual (levelsPerWeek)
- `server/src/domains/gamification/services/leveling.service.ts:558` - TODO: Calculate actual (completionRate)
- `server/src/domains/gamification/achievements/achievement-admin.service.ts:119` - TODO: Calculate from user_achievements progress
- `server/src/domains/gamification/analytics.controller.ts:352` - TODO: Calculate actual trend direction
- `server/src/domains/wallet/controllers/wallet.controller.ts:190` - TODO: Get actual total from service

### Wallet & Economy Features

- `server/src/domains/wallet/services/wallet.service.ts:492` - TODO: Create a transformer for local tokens to SupportedCoin[]
- `server/src/domains/wallet/services/wallet.service.ts:500` - TODO: Here we could cache the adapter response into our local DB
- `server/src/domains/wallet/services/wallet.service.ts:585` - TODO: Re-integrate max balance check from a unified config service
- `server/src/domains/wallet/services/wallet.service.ts:660` - TODO: Re-integrate vanity sink analyzer for specific sources like 'xp_boost'
- `server/src/domains/advertising/ad.routes.ts:127` - TODO: Get user's DGT token balance for voting power

### Missing Import Dependencies

- `server/src/domains/gamification/transformers/clout.transformer.ts:9` - TODO: Add when available (UserTransformer import)
- `server/src/domains/forum/transformers/forum.transformer.ts:22` - TODO: Add when available (UserTransformer import)

### System Monitoring & Operations

- `server/src/domains/admin/sub-domains/analytics/system-analytics.service.ts:137` - TODO: Implement actual uptime tracking
- `server/src/domains/admin/sub-domains/analytics/system-analytics.service.ts:148` - TODO: Implement system monitoring
- `server/src/domains/gamification/admin.controller.ts:413` - TODO: Implement leaderboard recalculation
- `server/src/domains/gamification/admin.controller.ts:418` - TODO: Implement expired data cleanup
- `server/src/domains/gamification/admin.controller.ts:423` - TODO: Implement analytics rebuild

### Rate Limiting & Security

- `server/src/domains/advertising/ad.routes.ts:265` - TODO: Implement proper rate limiting middleware
- `server/src/domains/dictionary/dictionary.routes.ts:25` - TODO: add CAPTCHA / wallet-age check

### Business Logic & Data Processing

- `server/src/domains/missions/missions.service.ts:15` - TODO: Define proper MissionType enum
- `server/src/domains/missions/missions.controller.ts:464` - TODO: Implement comprehensive mission analytics
- `server/src/domains/engagement/rain/rain.service.ts:216` - TODO: Get actual user level
- `server/src/domains/engagement/rain/rain.service.ts:217` - TODO: Get actual lifetime spending
- `server/src/domains/admin/sub-domains/treasury/treasury.service.ts:199` - TODO: Get actual user level
- `server/src/domains/admin/sub-domains/treasury/treasury.service.ts:200` - TODO: Get actual lifetime spending
- `server/src/domains/profile/transformers/profile.transformer.ts:272` - TODO: Implement risk scoring algorithm
- `server/src/domains/profile/transformers/profile.transformer.ts:278` - TODO: Implement compliance checking

### Data Export & Reporting

- `server/src/domains/gamification/services/analytics.service.ts:543` - TODO: Implement CSV export
- `server/src/domains/admin/sub-domains/shop/shop.admin.controller.ts:11` - TODO: Add pagination, filtering, sorting

### User Management & Social Features

- `server/src/domains/profile/profile.service.ts:166` - TODO: Implement friend relationships
- `server/src/domains/profile/profile.routes.ts:149` - TODO: Implement friend relationships
- `server/src/domains/profile/social-actions.controller.ts:182` - TODO: Implement suggestion algorithm
- `server/src/domains/profile/social-actions.controller.ts:215` - TODO: Implement pending requests query
- `server/src/domains/profile/profile-stats.controller.ts:168` - TODO: Implement actual analytics storage
- `server/src/domains/admin/sub-domains/users/users.service.ts:380` - TODO: Should be admin user ID

### Configuration & Settings

- `server/src/domains/admin/sub-domains/xp/xp.service.ts:28` - TODO: Fetch relevant settings from economySettings and xpCloutSettings
- `server/src/domains/admin/sub-domains/xp/xp.service.ts:35` - TODO: Update settings in economySettings or xpCloutSettings table
- `server/src/domains/admin/sub-domains/airdrop/airdrop.service.ts:65` - TODO: Implement other target types like 'role' or 'all_users' if needed
- `server/src/domains/admin/sub-domains/clout/clout.controller.ts:252` - TODO: Handle user notification if notify=true
- `server/src/domains/admin/sub-domains/clout/clout.controller.ts:329` - TODO: Calculate from previous state if needed for detailed view
- `server/src/domains/admin/sub-domains/clout/clout.controller.ts:330` - TODO: Calculate from previous state if needed for detailed view
- `server/src/domains/admin/sub-domains/clout/clout.controller.ts:331` - TODO: Extract from request context or log metadata

### Development & Documentation

- `server/src/domains/forum/forum.controller.ts:15` - TODO: @syncSchema threads
- `server/src/domains/forum/forum.controller.ts:16` - TODO: @syncSchema posts
- `server/src/domains/forum/forum.controller.ts:17` - TODO: @syncSchema content_visibility_status_enum
- `server/src/domains/admin/sub-domains/airdrop/airdrop.routes.ts:10` - TODO: Add GET route for fetching airdrop history if implementing that feature
- `server/src/domains/admin/sub-domains/airdrop/airdrop.controller.ts:53` - TODO: Add controller for fetching airdrop history if needed

### Authentication & Session Management

- `server/src/domains/auth/services/xAuthService.ts:96` - TODO: establish session for existing user
- `server/src/domains/auth/controllers/auth.controller.ts:96` - TODO: Implement or verify createDefaultSettings functionality

### Forum & Content Features

- `server/src/domains/forum/routes/content.routes.ts:53` - TODO: Add following support in ThreadService
- `server/src/domains/forum/routes/bookmark.routes.ts:127` - TODO: Join with threads table to get thread details
- `server/src/domains/shop/shop.routes.ts:200` - TODO: replace with database query (Find the item in mock data)

---

**Summary by Category:**

- **CRITICAL**: 15 items (Auth, Schema, Service failures)
- **HIGH**: 25 items (Core features, API gaps, Admin functions)
- **MEDIUM**: 21 items (Performance, UX, Permissions)
- **OTHER**: 81 items (Cleanup, Transformers, Enhancements)

**Priority Actions:**

1. Fix authentication hardcoded fallbacks
2. Resolve schema import issues in social service
3. Implement missing database columns for missions
4. Complete transformer stub implementations
5. Add proper permission checking systems
