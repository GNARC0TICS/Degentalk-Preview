---
title: rain analytics
status: STABLE
updated: 2025-06-28
---

# Rain Analytics

This document describes the Rain analytics system, which provides insights into how users are utilizing the "rain" feature to distribute tokens to random active users.

## Overview

The Rain analytics system consists of:

1. **Backend API**: Collects and processes rain event data for the admin dashboard
2. **Admin Dashboard UI**: Visualizes rain activity and provides insights for platform administrators
3. **Data Storage**: Uses the `rainEvents` table to track and query rain activity

## Backend Implementation

### Data Model

The Rain analytics uses the following tables:

- `rainEvents`: Records all rain distributions, including amount, currency, recipient count, and source
- `transactions`: Records individual transfers that result from rain events
- `users`: Contains user profiles for rainers and recipients

### API Endpoints

- `GET /api/admin/analytics/engagement/rain`: Main admin endpoint for rain analytics
  - Query parameters:
    - `days`: Number of days to include in the data (default: 30, max: 365)
    - `topLimit`: Number of top rainers to include (default: 10, max: 100)

### Response Format

The endpoint returns a `RainEventAnalytics` object with:

```typescript
interface RainEventAnalytics {
  // Summary statistics
  totalRainEvents: number;
  totalRainVolume: number;
  uniqueRainers: number;
  uniqueRecipients: number;
  averageRainAmount: number;
  
  // Time-based metrics
  dailyVolume: Array<{
    date: string;
    amount: number;
    eventCount: number;
  }>;
  
  // Top rainers
  topRainers: Array<{
    userId: number;
    username: string;
    avatarUrl: string | null;
    totalAmount: number;
    eventCount: number;
  }>;
  
  // Currency distribution
  currencyDistribution: Array<{
    currency: string;
    amount: number;
    percentage: number;
  }>;
  
  // Last updated timestamp
  lastUpdated: string;
}
```

## Frontend Implementation

The frontend uses a React component that displays rain analytics with:

1. **Summary Cards**: Key metrics including total events, volume, unique rainers, and average amount
2. **Time Series Chart**: Shows daily rain volume and event count over time
3. **Currency Distribution**: Pie chart showing the distribution of currencies used in rain events
4. **Top Rainers Table**: Lists the most active users making it rain

### Integration

To integrate the Rain analytics component into an admin page:

```jsx
import RainAnalyticsCard from '@/features/admin/components/dashboard/RainAnalyticsCard';

function AdminDashboard() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Other dashboard cards */}
      <RainAnalyticsCard className="col-span-full md:col-span-2" />
    </div>
  );
}
```

## Future Enhancements

Potential enhancements for the Rain analytics system:

1. **Real-time Analytics**: Implement WebSocket updates for live dashboard updates
2. **User Segmentation**: Add ability to filter analytics by user groups or activity levels
3. **Export Functionality**: Allow exporting rain data for further analysis
4. **Recipient Analytics**: Add metrics about users who receive rain (e.g., retention impact)
5. **Correlation Analysis**: Show relationships between rain activity and other platform metrics

## Related Documents

- [Engagement Domain Structure](../architecture/engagement-domain.md)
- [Rain Service API](../api/rain-service.md)
- [Admin Dashboard Overview](../admin/dashboard.md) 