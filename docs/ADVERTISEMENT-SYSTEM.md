# DegenTalk Advertisement System

## Overview

The DegenTalk Advertisement System is a comprehensive, crypto-native advertising platform designed specifically for the crypto community. It provides both external advertiser campaigns and user-generated promotional content through DGT token spending.

## Table of Contents

- [Architecture](#architecture)
- [External Advertising](#external-advertising)
- [User-Based Advertising](#user-based-advertising)
- [Ad Placement Locations](#ad-placement-locations)
- [API Reference](#api-reference)
- [Admin Management](#admin-management)
- [Community Governance](#community-governance)
- [Analytics & Reporting](#analytics--reporting)
- [Integration Guide](#integration-guide)

## Architecture

### Core Components

```
advertising/
├── campaigns/          # Campaign management and targeting
├── placements/         # Ad slot configuration and positioning
├── targeting/          # User segmentation and privacy controls
├── performance/        # Analytics and impression tracking
├── payments/           # Crypto payment processing
└── governance/         # Community voting and policy management
```

### Database Schema

The system uses 5 core tables:

1. **campaigns** - External advertiser campaigns and user promotions
2. **ad_placements** - Ad slot definitions and positioning
3. **targeting_profiles** - Privacy-preserving user segments
4. **ad_impressions** - High-volume performance tracking
5. **crypto_payments** - Blockchain payment processing

### Service Architecture

- **AdServingService** - Real-time ad selection and delivery (<50ms)
- **CampaignManagementService** - CRUD operations and optimization
- **AdConfigurationService** - System settings and governance

## External Advertising

### Campaign Types

- **Display Banners** - Traditional banner advertisements
- **Sponsored Threads** - Promoted forum discussions
- **Forum Spotlights** - Zone-level featured content
- **Native Content** - Seamlessly integrated promotional posts

### Payment Methods

- **DGT Tokens** - Primary currency with 20% discount
- **USDT** - Stable cryptocurrency payments
- **Bitcoin & Ethereum** - Major crypto support
- **Stripe** - Traditional payment processing

### Targeting Options

- **Geographic** - Region and timezone targeting
- **Behavioral** - XP level, DGT balance tiers, activity patterns
- **Contextual** - Forum zones, thread categories, content topics
- **Demographic** - Privacy-preserving interest segments

## User-Based Advertising

### DGT-Powered Promotions

Users can spend DGT tokens to promote their own content through several channels:

#### Content Promotion Types

1. **Thread Boosting** - Increase visibility in forum listings
2. **Announcement Bar** - Purchase rotating announcement slots
3. **Pinned Shoutbox** - Sticky messages in global chat
4. **Profile Spotlights** - Featured user showcases
5. **Achievement Highlights** - Promoted accomplishments

#### Pricing Structure

```typescript
interface UserPromotionPricing {
  threadBoost: {
    hourly: 50,    // 50 DGT per hour
    daily: 1000,   // 1000 DGT per day
    weekly: 5000   // 5000 DGT per week
  },
  announcementBar: {
    slot1: 2000,   // Prime position - 2000 DGT per day
    slot2: 1500,   // Secondary - 1500 DGT per day
    slot3: 1000    // Tertiary - 1000 DGT per day
  },
  pinnedShoutbox: {
    duration: 100  // 100 DGT per hour
  },
  profileSpotlight: {
    featured: 5000 // 5000 DGT per week
  }
}
```

#### User Campaign Management

- **Self-Service Interface** - Users can create and manage promotions
- **DGT Balance Integration** - Real-time balance checking and deduction
- **Approval Workflow** - Content moderation for user promotions
- **Performance Tracking** - Views, clicks, engagement metrics

## Ad Placement Locations

### Primary Ad Slots

#### Forum Areas
1. **Header Banner** (`header_banner`)
   - Position: Top of every page
   - Size: 728x90 (leaderboard)
   - Premium placement, highest visibility

2. **Forum Zone Headers** (`zone_header`)
   - Position: Above forum listings in each zone
   - Size: 468x60 (banner)
   - Contextual targeting by zone theme

3. **Thread Headers** (`thread_header`)
   - Position: Above first post in threads
   - Size: 300x250 (medium rectangle)
   - High engagement, content-relevant

4. **Between Posts** (`between_posts`)
   - Position: Inserted between thread replies
   - Size: 320x50 (mobile banner) / 728x90 (desktop)
   - Native feel, high scroll engagement

5. **Thread Footer** (`thread_footer`)
   - Position: Below last post in thread
   - Size: 300x250 (medium rectangle)
   - Captures users finishing content

#### Sidebar Placements
6. **Sidebar Top** (`sidebar_top`)
   - Position: Top of right sidebar
   - Size: 300x250 (medium rectangle)
   - Persistent across page views

7. **Sidebar Middle** (`sidebar_middle`)
   - Position: Middle of right sidebar
   - Size: 300x600 (half page) / 300x250
   - Long-form content placement

8. **Sidebar Bottom** (`sidebar_bottom`)
   - Position: Bottom of right sidebar
   - Size: 300x250 (medium rectangle)
   - Secondary sidebar placement

#### Mobile Optimized
9. **Mobile Banner** (`mobile_banner`)
   - Position: Responsive mobile placement
   - Size: 320x50 (mobile banner)
   - Touch-optimized for mobile users

### User Promotion Slots

#### Announcement Bar System
- **3 Rotating Slots** on homepage and major pages
- **Customizable Duration** from 1 hour to 7 days
- **Rich Media Support** with images and links
- **Click Tracking** and performance analytics

#### Shoutbox Integration
- **Pinned Messages** stay at top of chat
- **Highlighted Background** to distinguish from regular chat
- **Time-Based Expiration** with auto-removal
- **Moderator Override** for inappropriate content

#### Profile Showcase Areas
- **Featured Users Section** on homepage sidebar
- **Achievement Highlights** in forum signatures
- **Badge Promotions** in user cards and profiles

### Placement Performance Metrics

Each placement tracks:
- **Impression Count** - Total views
- **Click-Through Rate** - Engagement percentage
- **Revenue Generated** - Financial performance
- **Fill Rate** - Inventory utilization
- **Average CPM** - Cost effectiveness

## API Reference

### Public Endpoints

#### Ad Serving
```
GET /api/ads/serve
```
Real-time ad delivery with targeting

**Query Parameters:**
- `placement` - Placement slug (required)
- `sessionId` - Session identifier
- `userHash` - Anonymous user ID
- `forumSlug` - Current forum context
- `threadId` - Current thread context

**Response:**
```json
{
  "adId": "uuid",
  "campaignId": "uuid",
  "creativeAssets": {...},
  "trackingPixel": "url",
  "dgtReward": 0.5
}
```

#### Event Tracking
```
POST /api/ads/track/{eventType}
```
Track impressions, clicks, conversions

### User Advertisement Endpoints

#### User Promotions
```
POST /api/ads/user-promotions
```
Create user-generated promotional content

**Request Body:**
```json
{
  "type": "thread_boost|announcement_bar|pinned_shoutbox",
  "content": {...},
  "duration": "1h|1d|1w",
  "targetPlacement": "string",
  "dgtBudget": 1000
}
```

#### Announcement Bar
```
POST /api/ads/announcement-slots
```
Purchase announcement bar slots

```
GET /api/ads/announcement-slots/available
```
Check available announcement slots

#### Shoutbox Pins
```
POST /api/ads/shoutbox/pin
```
Pin messages in global chat

### Campaign Management

#### External Campaigns
```
POST /api/ads/campaigns
GET /api/ads/campaigns
PUT /api/ads/campaigns/{id}
DELETE /api/ads/campaigns/{id}
```

#### User Campaigns
```
GET /api/ads/user-campaigns
POST /api/ads/user-campaigns/{id}/extend
POST /api/ads/user-campaigns/{id}/cancel
```

### Admin Endpoints

#### Configuration
```
GET /api/ads/admin/config
PUT /api/ads/admin/config
```

#### Placement Management
```
GET /api/ads/admin/placements
POST /api/ads/admin/placements
PUT /api/ads/admin/placements/{id}
```

#### User Promotion Approval
```
GET /api/ads/admin/user-promotions/pending
POST /api/ads/admin/user-promotions/{id}/approve
POST /api/ads/admin/user-promotions/{id}/reject
```

## Admin Management

### Dashboard Features

#### Analytics Overview
- **Revenue Metrics** - Total, daily, monthly revenue
- **Impression Stats** - Views, CTR, engagement rates
- **Campaign Performance** - Active campaigns, completion rates
- **User Promotion Stats** - DGT spent, content promoted

#### Placement Management
- **Create/Edit Placements** - Position and sizing configuration
- **Performance Monitoring** - Real-time metrics per placement
- **Fill Rate Optimization** - Inventory management
- **A/B Testing Tools** - Placement effectiveness testing

#### Content Moderation
- **User Promotion Queue** - Approval workflow for user content
- **Content Guidelines** - Policy enforcement tools
- **Automated Flagging** - AI-assisted content review
- **Community Reports** - User-generated content reports

#### Financial Controls
- **Revenue Sharing** - Platform commission configuration
- **DGT Reward Pools** - User engagement incentives
- **Pricing Management** - Dynamic pricing for user promotions
- **Payment Processing** - Crypto and traditional payment handling

## Community Governance

### Proposal System

The community can vote on:
- **Commission Rates** - Platform revenue sharing
- **Content Policies** - Acceptable advertisement guidelines
- **Placement Rules** - New ad slot creation and positioning
- **DGT Pricing** - User promotion cost adjustments

### Voting Mechanics

- **Token-Based Voting** - 1000 DGT minimum to participate
- **7-Day Periods** - Standard voting duration
- **60% Majority** - Required threshold for passage
- **20% Quorum** - Minimum participation requirement

### Implementation Process

1. **Proposal Creation** - Admin or community member submits
2. **Community Discussion** - 48-hour discussion period
3. **Voting Period** - 7-day token-weighted voting
4. **Automatic Execution** - Successful proposals auto-implement
5. **Appeal Process** - 30-day community appeal window

## Analytics & Reporting

### Real-Time Metrics

#### Platform-Wide
- **Active Campaigns** - Current running advertisements
- **Total Impressions** - Daily/hourly impression counts
- **Revenue Streams** - External vs user promotion revenue
- **Top Performers** - Highest earning placements and campaigns

#### User Promotion Analytics
- **DGT Spending** - User promotion expenditure tracking
- **Content Performance** - Engagement rates for user promotions
- **Popular Slots** - Most requested announcement and pin slots
- **User Engagement** - Community interaction with promoted content

### Reporting Tools

#### Advertiser Reports
- **Campaign Performance** - Detailed metrics and ROI analysis
- **Audience Insights** - Demographic and behavioral data
- **Optimization Suggestions** - AI-powered improvement recommendations
- **Competitor Analysis** - Market positioning insights

#### Platform Reports
- **Revenue Analysis** - Financial performance breakdown
- **User Behavior** - Engagement patterns and preferences
- **Market Trends** - Advertising spend and demand analysis
- **Technical Performance** - System latency and reliability metrics

## Integration Guide

### Frontend Integration

#### Ad Component
```typescript
import { AdPlacement } from '@/components/ads/AdPlacement';

// Basic ad placement
<AdPlacement 
  slot="sidebar_top" 
  forumSlug="defi" 
  threadId={threadId}
/>

// User promotion placement
<AdPlacement 
  slot="announcement_bar" 
  type="user_promotion"
  priority="high"
/>
```

#### User Promotion Interface
```typescript
import { UserPromotionPanel } from '@/components/ads/UserPromotionPanel';

<UserPromotionPanel 
  availableBalance={userDgtBalance}
  onPromotionCreate={handleCreate}
/>
```

### Backend Integration

#### Service Initialization
```typescript
import { adServingService } from '@/domains/advertising/ad-serving.service';

// Serve ad for placement
const ad = await adServingService.serveAd({
  placementSlug: 'header_banner',
  userContext: {...},
  forumContext: {...}
});
```

#### Event Tracking
```typescript
import { analyticsService } from '@/domains/advertising/analytics.service';

// Track user interaction
await analyticsService.trackEvent({
  type: 'impression',
  adId: ad.id,
  userId: user.id,
  sessionId: session.id
});
```

### Database Migrations

#### Required Tables
```sql
-- Run migration for advertising schema
npm run db:migrate -- --name="add-advertising-system"

-- Seed initial placements
npm run seed:advertising:placements

-- Configure default settings
npm run seed:advertising:config
```

### Environment Configuration

```env
# Advertisement System Configuration
AD_SYSTEM_ENABLED=true
AD_SERVING_CACHE_TTL=300
AD_FRAUD_DETECTION=true
AD_USER_PROMOTIONS=true

# DGT Pricing Configuration
AD_THREAD_BOOST_HOURLY=50
AD_ANNOUNCEMENT_SLOT_DAILY=2000
AD_SHOUTBOX_PIN_HOURLY=100

# External Payment Configuration
AD_CRYPTO_PAYMENTS=true
AD_STRIPE_ENABLED=true
AD_MINIMUM_CAMPAIGN_BUDGET=100
```

## Security Considerations

### Privacy Protection
- **Hashed User Identifiers** - No personal data in targeting
- **Consent Management** - GDPR/CCPA compliance
- **Data Retention** - 90-day automatic cleanup
- **Anonymization** - Analytics data anonymization

### Fraud Prevention
- **Click Validation** - Bot detection and filtering
- **Impression Verification** - Viewability requirements
- **Rate Limiting** - API abuse prevention
- **Content Scanning** - Malicious content detection

### Financial Security
- **Crypto Validation** - Blockchain transaction verification
- **Multi-Signature** - Secure fund management
- **Audit Trails** - Complete transaction logging
- **Refund Protection** - Dispute resolution mechanisms

## Performance Optimization

### Caching Strategy
- **Ad Response Caching** - 5-minute TTL for static content
- **User Targeting Cache** - 1-hour profile caching
- **Analytics Aggregation** - Real-time metric computation
- **CDN Integration** - Global content delivery

### Database Optimization
- **Partitioned Tables** - Time-based impression partitioning
- **Indexed Queries** - Optimized targeting lookups
- **Connection Pooling** - Efficient database connections
- **Read Replicas** - Analytics query distribution

### API Performance
- **Sub-50ms Response** - Ad serving speed requirements
- **Async Processing** - Non-blocking event tracking
- **Circuit Breakers** - Failure isolation and recovery
- **Load Balancing** - Horizontal scaling support

## Troubleshooting

### Common Issues

#### Ad Not Displaying
1. Check placement configuration in admin panel
2. Verify campaign budget and status
3. Review targeting rules and user matching
4. Confirm placement slot availability

#### User Promotion Failures
1. Verify sufficient DGT balance
2. Check content approval status
3. Review slot availability for timeframe
4. Confirm user permissions and restrictions

#### Performance Issues
1. Monitor ad serving response times
2. Check database query performance
3. Review caching effectiveness
4. Analyze traffic patterns and load

### Support Resources

#### Admin Tools
- **System Health Dashboard** - Real-time system monitoring
- **Error Log Analysis** - Detailed error tracking and resolution
- **Performance Metrics** - Latency and throughput monitoring
- **User Support Queue** - Customer service integration

#### Community Support
- **Documentation Wiki** - User-maintained guides and tutorials
- **Developer Forum** - Technical discussion and Q&A
- **Feature Requests** - Community-driven enhancement proposals
- **Bug Reports** - Issue tracking and resolution

---

## Conclusion

The DegenTalk Advertisement System provides a comprehensive, crypto-native advertising platform that serves both external advertisers and community members. With its focus on privacy, performance, and community governance, it creates sustainable revenue streams while maintaining the platform's decentralized ethos.

For technical support or feature requests, please refer to our [GitHub repository](https://github.com/degentalk/advertisement-system) or contact the development team through the admin panel.