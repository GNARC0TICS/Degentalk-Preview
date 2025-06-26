# DegenTalk Advertisement System API Integration Guide

## Overview

This guide provides comprehensive documentation for integrating both external advertising and user-based promotion features into the DegenTalk platform.

## Authentication

All user-specific endpoints require authentication via JWT token in the Authorization header:

```javascript
headers: {
  'Authorization': `Bearer ${userToken}`,
  'Content-Type': 'application/json'
}
```

Admin endpoints require admin role permissions in addition to authentication.

## External Advertisement API

### Ad Serving

#### Serve Ad for Placement
```http
GET /api/ads/serve?placement={placementSlug}&sessionId={sessionId}&userHash={userHash}
```

**Parameters:**
- `placement` (required): Placement slug (e.g., 'header_banner', 'sidebar_top')
- `sessionId` (optional): Session identifier for tracking
- `userHash` (optional): Anonymous user identifier for targeting
- `forumSlug` (optional): Current forum context for targeting
- `threadId` (optional): Current thread context for targeting

**Response:**
```json
{
  "adId": "uuid",
  "campaignId": "uuid",
  "creativeAssets": {
    "type": "banner",
    "imageUrl": "https://example.com/banner.jpg",
    "linkUrl": "https://example.com/landing",
    "alt": "Advertisement"
  },
  "trackingPixel": "https://api.degentalk.com/api/ads/track/impression?id=uuid",
  "dgtReward": 0.5,
  "placement": {
    "slug": "header_banner",
    "dimensions": "728x90"
  }
}
```

#### Track Ad Events
```http
POST /api/ads/track/{eventType}
```

**Event Types:** `impression`, `click`, `conversion`

**Request Body:**
```json
{
  "campaign": "campaign-uuid",
  "placement": "placement-uuid",
  "session": "session-id",
  "metadata": {
    "userAgent": "Mozilla/5.0...",
    "referrer": "https://degentalk.com/forum/defi"
  }
}
```

### Campaign Management (External Advertisers)

#### Create Campaign
```http
POST /api/ads/campaigns
```

**Request Body:**
```json
{
  "name": "DeFi Platform Promotion",
  "description": "Promoting our new yield farming platform",
  "type": "display_banner",
  "totalBudget": 10000,
  "dailyBudget": 500,
  "paymentMethod": "dgt_tokens",
  "pricingModel": "CPM",
  "bidAmount": 2.50,
  "startDate": "2025-07-01T00:00:00Z",
  "endDate": "2025-07-31T23:59:59Z",
  "targetingRules": {
    "forums": ["defi", "trading"],
    "userLevels": [5, 6, 7, 8, 9, 10],
    "dgtBalanceTier": "whale"
  },
  "creativeAssets": [
    {
      "type": "banner",
      "imageUrl": "https://example.com/banner-728x90.jpg",
      "linkUrl": "https://example.com/landing",
      "dimensions": "728x90"
    }
  ]
}
```

#### Get Campaign Analytics
```http
GET /api/ads/campaigns/{campaignId}/analytics?from=2025-07-01&to=2025-07-31
```

**Response:**
```json
{
  "campaignId": "uuid",
  "totalImpressions": 250000,
  "totalClicks": 3750,
  "totalConversions": 125,
  "ctr": 1.5,
  "conversionRate": 3.33,
  "totalSpent": 5250.00,
  "averageCpm": 2.10,
  "averageCpc": 1.40,
  "roiEstimate": 8.5,
  "dailyBreakdown": [
    {
      "date": "2025-07-01",
      "impressions": 8500,
      "clicks": 127,
      "conversions": 4,
      "spent": 178.50
    }
  ]
}
```

## User Promotion API

### Creating User Promotions

#### Calculate Promotion Cost
```http
POST /api/ads/user-promotions/calculate-cost
```

**Request Body:**
```json
{
  "type": "thread_boost",
  "duration": "1d",
  "startTime": "2025-07-01T18:00:00Z"
}
```

**Response:**
```json
{
  "baseCost": 1000,
  "demandMultiplier": 1.2,
  "timeMultiplier": 1.5,
  "totalCost": 1800,
  "availableSlots": 5,
  "nextAvailableTime": null
}
```

#### Create User Promotion
```http
POST /api/ads/user-promotions
```

**Request Body:**
```json
{
  "type": "thread_boost",
  "contentId": "thread-uuid",
  "title": "Check out my epic DeFi strategy!",
  "description": "Sharing my 400% APY farming method",
  "duration": "1d",
  "startTime": "2025-07-01T18:00:00Z",
  "autoRenew": false,
  "maxDailySpend": 2000
}
```

**Response:**
```json
{
  "promotion": {
    "id": "promotion-uuid",
    "type": "thread_boost",
    "title": "Check out my epic DeFi strategy!",
    "status": "pending",
    "dgtCost": "1800",
    "startTime": "2025-07-01T18:00:00Z",
    "endTime": "2025-07-02T18:00:00Z",
    "createdAt": "2025-06-26T12:00:00Z"
  },
  "costBreakdown": {
    "baseCost": 1000,
    "demandMultiplier": 1.2,
    "timeMultiplier": 1.5,
    "totalCost": 1800
  },
  "paymentRequired": true
}
```

### Announcement Bar Integration

#### Get Available Announcement Slots
```http
GET /api/ads/announcement-slots/available?date=2025-07-01&duration=24
```

**Response:**
```json
[
  {
    "id": "slot-uuid",
    "slotNumber": 1,
    "priority": "premium",
    "date": "2025-07-01",
    "hourStart": 18,
    "hourEnd": 19,
    "price": 3000,
    "isAvailable": true
  },
  {
    "id": "slot-uuid-2",
    "slotNumber": 2,
    "priority": "standard",
    "date": "2025-07-01",
    "hourStart": 18,
    "hourEnd": 19,
    "price": 2250,
    "isAvailable": true
  }
]
```

#### Get Active Announcements (Public)
```http
GET /api/ads/announcement-slots/active
```

**Response:**
```json
{
  "announcements": [
    {
      "id": "announcement-uuid",
      "type": "user_promotion",
      "priority": "premium",
      "content": "🚀 New DeFi yield farming strategy - 400% APY!",
      "linkUrl": "https://degentalk.com/threads/my-defi-strategy",
      "imageUrl": "https://example.com/promo-image.jpg",
      "userName": "CryptoWhale",
      "endTime": "2025-07-01T19:00:00Z",
      "clickCount": 245
    }
  ]
}
```

### Shoutbox Pin Integration

#### Get Active Pinned Messages
```http
GET /api/ads/shoutbox/pins/active
```

**Response:**
```json
[
  {
    "id": "pin-uuid",
    "userPromotionId": "promotion-uuid",
    "userId": "user-uuid",
    "content": "🎯 Check out my new trading guide - making bank!",
    "imageUrl": null,
    "linkUrl": "https://degentalk.com/threads/trading-guide",
    "backgroundColor": "#fbbf24",
    "textColor": "#000000",
    "startTime": "2025-07-01T18:00:00Z",
    "endTime": "2025-07-01T19:00:00Z",
    "user": {
      "username": "TraderPro",
      "avatarUrl": "https://example.com/avatar.jpg"
    },
    "clicks": 42,
    "dismissals": 3
  }
]
```

### User Promotion Management

#### Get User's Promotions
```http
GET /api/ads/user-promotions?status=active&limit=10&offset=0
```

**Response:**
```json
{
  "promotions": [
    {
      "id": "promotion-uuid",
      "type": "thread_boost",
      "title": "My DeFi Strategy",
      "status": "active",
      "dgtCost": "1800",
      "dgtSpent": "1800",
      "startTime": "2025-07-01T18:00:00Z",
      "endTime": "2025-07-02T18:00:00Z",
      "impressions": 5200,
      "clicks": 87,
      "conversions": 3,
      "createdAt": "2025-06-26T12:00:00Z"
    }
  ],
  "total": 15
}
```

#### Get Promotion Analytics
```http
GET /api/ads/user-promotions/{promotionId}/analytics?from=2025-07-01&to=2025-07-31
```

**Response:**
```json
{
  "totalImpressions": 5200,
  "totalClicks": 87,
  "totalConversions": 3,
  "ctr": 1.67,
  "conversionRate": 3.45,
  "totalSpent": 1800,
  "averageCPC": 20.69,
  "dailyBreakdown": [
    {
      "date": "2025-07-01",
      "impressions": 5200,
      "clicks": 87,
      "conversions": 3,
      "spent": 1800
    }
  ]
}
```

### Event Tracking

#### Track Promotion Events
```http
POST /api/ads/user-promotions/{promotionId}/track/{eventType}
```

**Event Types:** `impression`, `click`, `conversion`

**Request Body:**
```json
{
  "timestamp": "2025-07-01T18:30:00Z",
  "userAgent": "Mozilla/5.0...",
  "referrer": "https://degentalk.com/forum/defi",
  "location": "thread_list",
  "metadata": {
    "threadId": "thread-uuid",
    "forumSlug": "defi"
  }
}
```

## Admin API

### User Promotion Moderation

#### Get Pending Promotions
```http
GET /api/ads/admin/user-promotions/pending?type=announcement_bar&limit=50
```

**Response:**
```json
[
  {
    "id": "promotion-uuid",
    "userId": "user-uuid",
    "type": "announcement_bar",
    "title": "My Amazing DeFi Discovery!",
    "description": "Found a new protocol with incredible yields",
    "imageUrl": "https://example.com/image.jpg",
    "linkUrl": "https://degentalk.com/threads/discovery",
    "dgtCost": "8000",
    "status": "pending",
    "createdAt": "2025-07-01T12:00:00Z",
    "user": {
      "username": "CryptoExplorer",
      "avatarUrl": "https://example.com/avatar.jpg",
      "trustLevel": 3
    }
  }
]
```

#### Moderate Promotion
```http
POST /api/ads/admin/user-promotions/{promotionId}/moderate
```

**Request Body:**
```json
{
  "action": "approve",
  "notes": "Content looks good, approved for publication"
}
```

**For Rejection:**
```json
{
  "action": "reject",
  "rejectionReason": "Content violates community guidelines - contains affiliate links without disclosure"
}
```

### System Configuration

#### Get Ad System Configuration
```http
GET /api/ads/admin/config
```

**Response:**
```json
{
  "placements": {
    "enabled": true,
    "defaultFloorPrice": 0.50,
    "maxDailyBudget": 10000,
    "approvalRequired": true
  },
  "targeting": {
    "enablePersonalization": true,
    "dataRetentionDays": 90,
    "requireConsent": true,
    "allowCrossSiteTracking": false
  },
  "revenue": {
    "platformCommission": 30,
    "dgtRewardPool": 100000,
    "minimumPayout": 10,
    "payoutSchedule": "weekly"
  },
  "userPromotions": {
    "enabled": true,
    "autoApproveThreadBoosts": true,
    "maxPromotionsPerUser": 5,
    "maxDailySpend": 50000
  }
}
```

## Frontend Component Integration

### React Components

#### Basic Ad Placement Component
```typescript
import React, { useEffect, useState } from 'react';

interface AdPlacementProps {
  slot: string;
  forumSlug?: string;
  threadId?: string;
  className?: string;
}

export function AdPlacement({ slot, forumSlug, threadId, className }: AdPlacementProps) {
  const [ad, setAd] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAd = async () => {
      try {
        const params = new URLSearchParams({
          placement: slot,
          sessionId: getSessionId(),
          ...(forumSlug && { forumSlug }),
          ...(threadId && { threadId })
        });

        const response = await fetch(`/api/ads/serve?${params}`);
        
        if (response.ok) {
          const adData = await response.json();
          setAd(adData);
          
          // Track impression
          trackAdEvent(adData.adId, 'impression');
        }
      } catch (error) {
        console.error('Failed to fetch ad:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAd();
  }, [slot, forumSlug, threadId]);

  const handleAdClick = () => {
    if (ad) {
      trackAdEvent(ad.adId, 'click');
      if (ad.creativeAssets.linkUrl) {
        window.open(ad.creativeAssets.linkUrl, '_blank');
      }
    }
  };

  if (loading) {
    return <div className={`${className} animate-pulse bg-zinc-800 rounded`} />;
  }

  if (!ad) {
    return null;
  }

  return (
    <div className={`${className} border border-zinc-700 rounded overflow-hidden`}>
      <div className="relative group cursor-pointer" onClick={handleAdClick}>
        <img 
          src={ad.creativeAssets.imageUrl}
          alt={ad.creativeAssets.alt || 'Advertisement'}
          className="w-full h-auto transition-opacity group-hover:opacity-90"
        />
        <div className="absolute top-2 right-2">
          <span className="bg-zinc-900/80 text-zinc-300 text-xs px-2 py-1 rounded">
            Ad
          </span>
        </div>
        {ad.dgtReward > 0 && (
          <div className="absolute bottom-2 left-2">
            <span className="bg-emerald-600 text-white text-xs px-2 py-1 rounded">
              +{ad.dgtReward} DGT
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper functions
function getSessionId(): string {
  // Implement session ID generation/retrieval
  return 'session-' + Math.random().toString(36).substr(2, 9);
}

async function trackAdEvent(adId: string, eventType: string): Promise<void> {
  try {
    await fetch(`/api/ads/track/${eventType}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        campaign: adId,
        placement: 'web',
        session: getSessionId(),
        metadata: {
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          referrer: document.referrer
        }
      })
    });
  } catch (error) {
    console.error('Failed to track ad event:', error);
  }
}
```

#### User Promotion Creation Panel
```typescript
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CreatePromotionPanelProps {
  userDgtBalance: number;
  onPromotionCreated: (promotion: any) => void;
}

export function CreatePromotionPanel({ userDgtBalance, onPromotionCreated }: CreatePromotionPanelProps) {
  const [promotionType, setPromotionType] = useState<string>('thread_boost');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [duration, setDuration] = useState<string>('1d');
  const [costEstimate, setCostEstimate] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  // Calculate cost when inputs change
  useEffect(() => {
    const calculateCost = async () => {
      if (promotionType && duration) {
        try {
          const response = await fetch('/api/ads/user-promotions/calculate-cost', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: promotionType,
              duration,
              startTime: new Date().toISOString()
            })
          });

          if (response.ok) {
            const { totalCost } = await response.json();
            setCostEstimate(totalCost);
          }
        } catch (error) {
          console.error('Failed to calculate cost:', error);
        }
      }
    };

    calculateCost();
  }, [promotionType, duration]);

  const handleCreatePromotion = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/ads/user-promotions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({
          type: promotionType,
          title,
          description,
          duration,
          startTime: new Date().toISOString()
        })
      });

      if (response.ok) {
        const result = await response.json();
        onPromotionCreated(result.promotion);
        
        // Reset form
        setTitle('');
        setDescription('');
        setPromotionType('thread_boost');
        setDuration('1d');
      } else {
        const error = await response.json();
        alert(`Failed to create promotion: ${error.message}`);
      }
    } catch (error) {
      console.error('Failed to create promotion:', error);
      alert('Failed to create promotion. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const canAfford = costEstimate <= userDgtBalance;

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-white">Create Promotion</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-zinc-300">Promotion Type</Label>
          <Select value={promotionType} onValueChange={setPromotionType}>
            <SelectTrigger className="bg-zinc-800 border-zinc-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="thread_boost">Thread Boost</SelectItem>
              <SelectItem value="announcement_bar">Announcement Bar</SelectItem>
              <SelectItem value="pinned_shoutbox">Pinned Shoutbox</SelectItem>
              <SelectItem value="profile_spotlight">Profile Spotlight</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-zinc-300">Title</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter promotion title..."
            className="bg-zinc-800 border-zinc-700 text-white"
          />
        </div>

        <div>
          <Label className="text-zinc-300">Description</Label>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter promotion description..."
            className="bg-zinc-800 border-zinc-700 text-white"
          />
        </div>

        <div>
          <Label className="text-zinc-300">Duration</Label>
          <Select value={duration} onValueChange={setDuration}>
            <SelectTrigger className="bg-zinc-800 border-zinc-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">1 Hour</SelectItem>
              <SelectItem value="6h">6 Hours</SelectItem>
              <SelectItem value="1d">1 Day</SelectItem>
              <SelectItem value="3d">3 Days</SelectItem>
              <SelectItem value="1w">1 Week</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="bg-zinc-800 p-4 rounded">
          <div className="flex justify-between items-center">
            <span className="text-zinc-300">Estimated Cost:</span>
            <span className={`font-bold ${canAfford ? 'text-emerald-400' : 'text-red-400'}`}>
              {costEstimate} DGT
            </span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-zinc-400 text-sm">Your Balance:</span>
            <span className="text-zinc-300 text-sm">{userDgtBalance} DGT</span>
          </div>
        </div>

        <Button
          onClick={handleCreatePromotion}
          disabled={!canAfford || !title.trim() || loading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-700"
        >
          {loading ? 'Creating...' : `Create Promotion for ${costEstimate} DGT`}
        </Button>
      </CardContent>
    </Card>
  );
}

function getAuthToken(): string {
  // Implement token retrieval from your auth system
  return localStorage.getItem('authToken') || '';
}
```

### Announcement Bar Integration
```typescript
import React, { useState, useEffect } from 'react';

export function EnhancedAnnouncementBar() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetchActiveAnnouncements();
    const interval = setInterval(fetchActiveAnnouncements, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (announcements.length > 1) {
      const timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % announcements.length);
      }, 10000);
      return () => clearInterval(timer);
    }
  }, [announcements.length]);

  const fetchActiveAnnouncements = async () => {
    try {
      const response = await fetch('/api/ads/announcement-slots/active');
      if (response.ok) {
        const data = await response.json();
        setAnnouncements(data.announcements || []);
      }
    } catch (error) {
      console.error('Failed to fetch announcements:', error);
    }
  };

  const handleAnnouncementClick = (announcement: any) => {
    // Track click event
    fetch(`/api/ads/user-promotions/${announcement.id}/track/click`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        timestamp: new Date().toISOString(),
        location: 'announcement_bar'
      })
    });

    if (announcement.linkUrl) {
      window.open(announcement.linkUrl, '_blank');
    }
  };

  if (announcements.length === 0) return null;

  const currentAnnouncement = announcements[currentIndex];

  return (
    <div className="bg-gradient-to-r from-emerald-600 to-blue-600 text-white py-2 px-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div 
          className="flex-1 cursor-pointer hover:underline"
          onClick={() => handleAnnouncementClick(currentAnnouncement)}
        >
          <span className="font-medium">{currentAnnouncement.content}</span>
          {currentAnnouncement.type === 'user_promotion' && (
            <span className="ml-2 text-xs bg-white/20 px-2 py-1 rounded">
              by {currentAnnouncement.userName}
            </span>
          )}
        </div>
        
        {announcements.length > 1 && (
          <div className="flex space-x-1 ml-4">
            {announcements.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

## Error Handling

### Common Error Responses

```json
// Insufficient DGT Balance
{
  "error": "Insufficient DGT balance",
  "message": "Required: 1800, Available: 1200",
  "code": "INSUFFICIENT_BALANCE",
  "details": {
    "required": 1800,
    "available": 1200,
    "shortfall": 600
  }
}

// No Available Slots
{
  "error": "No slots available",
  "message": "No announcement slots available for the requested time period",
  "code": "NO_SLOTS_AVAILABLE",
  "details": {
    "nextAvailableTime": "2025-07-02T18:00:00Z",
    "alternativeSlots": [
      {
        "time": "2025-07-02T18:00:00Z",
        "price": 2400
      }
    ]
  }
}

// Content Moderation Required
{
  "error": "Promotion pending approval",
  "message": "Your promotion has been submitted for review",
  "code": "PENDING_APPROVAL",
  "details": {
    "promotionId": "uuid",
    "estimatedReviewTime": "2-4 hours",
    "status": "pending"
  }
}
```

### Rate Limiting

The API implements rate limiting for user promotions:

- **Creation**: 10 promotions per hour per user
- **Cost Calculation**: 100 requests per minute per user
- **Analytics**: 60 requests per minute per user

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 7
X-RateLimit-Reset: 1625097600
```

## Webhooks (Future Feature)

For real-time promotion status updates:

```http
POST https://your-app.com/webhooks/promotion-status
```

**Payload:**
```json
{
  "event": "promotion.approved",
  "promotionId": "uuid",
  "userId": "user-uuid",
  "timestamp": "2025-07-01T12:00:00Z",
  "data": {
    "status": "approved",
    "activatedAt": "2025-07-01T18:00:00Z",
    "moderatorNotes": "Looks great!"
  }
}
```

## SDK Integration (Future Feature)

JavaScript/TypeScript SDK for easy integration:

```typescript
import { DegenTalkAds } from '@degentalk/ads-sdk';

const ads = new DegenTalkAds({
  apiKey: 'your-api-key',
  environment: 'production' // or 'sandbox'
});

// Create user promotion
const promotion = await ads.userPromotions.create({
  type: 'thread_boost',
  title: 'My Epic Strategy',
  duration: '1d'
});

// Track events
await ads.tracking.event(promotion.id, 'impression', {
  location: 'thread_list'
});

// Get analytics
const analytics = await ads.analytics.get(promotion.id, {
  from: '2025-07-01',
  to: '2025-07-31'
});
```

This comprehensive API guide provides everything needed to integrate both external advertising and user promotion features into the DegenTalk platform.