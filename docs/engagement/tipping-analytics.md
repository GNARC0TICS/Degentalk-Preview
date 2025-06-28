---
title: tipping analytics
status: STABLE
updated: 2025-06-28
---

# Tipping Analytics

This document describes the Tipping analytics system, which provides insights into how users are tipping each other across the platform.

## Overview

The Tipping analytics system consists of:

1. **Backend API**: Collects and processes tipping transaction data for the admin dashboard
2. **Admin Dashboard UI**: Visualizes tipping activity and provides insights for platform administrators
3. **Data Storage**: Uses the `transactions` table with tipping-specific queries

## Backend Implementation

### Data Model

The Tipping analytics uses the following tables:

- `transactions`: Records all transaction data including tips (with type='TIP')
- `users`: Contains user profiles for tippers and recipients
- `postTips`: Specific table for tracking post-related tips

### API Endpoints

- `GET /api/admin/analytics/engagement/tips`: Main admin endpoint for tipping analytics
  - Query parameters:
    - `days`: Number of days to include in the data (default: 30, max: 365)
    - `topLimit`: Number of top tippers/recipients to include (default: 10, max: 100)

### Response Format

The endpoint returns a `TippingAnalytics` object with:

```typescript
interface TippingAnalytics {
  // Summary statistics
  totalTips: number;
  totalTipVolume: number;
  uniqueTippers: number;
  uniqueRecipients: number;
  averageTipAmount: number;
  
  // Time-based metrics
  dailyVolume: Array<{
    date: string;
    amount: number;
    tipCount: number;
  }>;
  
  // Top tippers
  topTippers: Array<{
    userId: number;
    username: string;
    avatarUrl: string | null;
    totalAmount: number;
    tipCount: number;
  }>;
  
  // Top recipients
  topRecipients: Array<{
    userId: number;
    username: string;
    avatarUrl: string | null;
    totalReceived: number;
    tipCount: number;
  }>;
  
  // Currency distribution
  currencyDistribution: Array<{
    currency: string;
    amount: number;
    percentage: number;
  }>;

  // Context distribution (posts, shoutbox, etc.)
  contextDistribution: Array<{
    context: string;
    tipCount: number;
    percentage: number;
  }>;
  
  // Last updated timestamp
  lastUpdated: string;
}
```

## Frontend Implementation

The frontend uses a React component that displays tipping analytics with:

1. **Summary Cards**: Key metrics including total tips, volume, unique users, and average amount
2. **Time Series Chart**: Shows daily tip volume and count over time
3. **Currency Distribution**: Pie chart showing the distribution of currencies used in tips
4. **Context Distribution**: Pie chart showing where tips are occurring (forum posts, shoutbox, etc.)
5. **Top Users**: Tables showing top tippers and top recipients

### Integration

To integrate the Tipping analytics component into an admin page:

```jsx
import TippingAnalyticsCard from '@/features/admin/components/dashboard/TippingAnalyticsCard';

function AdminDashboard() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Other dashboard cards */}
      <TippingAnalyticsCard className="col-span-full md:col-span-2" />
    </div>
  );
}
```

## Usage with Rain Analytics

The Tipping Analytics system is designed to work alongside the [Rain Analytics](./rain-analytics.md) system to provide comprehensive engagement metrics. Together they give administrators a full picture of user-to-user token interactions on the platform.

For a complete engagement dashboard, use both components together:

```jsx
import RainAnalyticsCard from '@/features/admin/components/dashboard/RainAnalyticsCard';
import TippingAnalyticsCard from '@/features/admin/components/dashboard/TippingAnalyticsCard';

function EngagementDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Engagement Analytics</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <TippingAnalyticsCard className="w-full" />
        <RainAnalyticsCard className="w-full" />
      </div>
    </div>
  );
}
```

## Future Enhancements

Potential enhancements for the Tipping analytics system:

1. **Retention Analysis**: Measure how tipping affects user retention rates
2. **User Response Tracking**: Track how recipients respond to tips (e.g., do they continue posting, tip back, etc.)
3. **Integration with Leaderboards**: Create public leaderboards based on tipping activity
4. **Geographic Analysis**: Show tipping patterns by geographic region
5. **Comparison Reports**: Compare tipping activity across different time periods
6. **Tipping Impact on Content**: Analyze correlation between tips received and content quality/popularity

## Related Documents

- [Engagement Domain Structure](../architecture/engagement-domain.md)
- [Rain Analytics](./rain-analytics.md)
- [Tip Service API](../api/tip-service.md)
- [Admin Dashboard Overview](../admin/dashboard.md) 