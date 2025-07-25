# Leaderboard Widget Migration Guide

## Overview

We've consolidated multiple leaderboard implementations into a unified, modular `LeaderboardWidget` component that offers consistent styling and flexible display options.

## Key Changes

### 1. New Unified Component
- **Location**: `/client/src/components/leaderboard/LeaderboardWidget.tsx`
- **Features**:
  - 4 size variants: `micro`, `compact`, `standard`, `expanded`
  - Multiple metrics: `xp`, `clout`, `tips`, `activity`
  - Time-based filtering: `daily`, `weekly`, `monthly`, `all-time`
  - Consistent theming via `leaderboard-theme.ts`
  - Built-in caching and performance optimizations

### 2. Backend Improvements
- **API Endpoint**: `/api/analytics/leaderboards/:type`
- **Caching**: 5-minute Redis cache for all leaderboard data
- **Real Data**: Connected to `LevelingService` for actual user statistics

### 3. Component Usage

#### Basic Usage
```tsx
import { LeaderboardWidget } from '@app/components/leaderboard';

// Compact sidebar widget
<LeaderboardWidget
  variant="compact"
  timeframe="weekly"
  metric="xp"
  limit={5}
/>

// Full page leaderboard
<LeaderboardWidget
  variant="expanded"
  timeframe="all-time"
  metric="xp"
  showViewAll={false}
/>
```

#### Size Variants
- **micro**: 3 users, minimal info (sidebar ready)
- **compact**: 5 users, standard info (homepage default)
- **standard**: 10 users, detailed info
- **expanded**: 20 users, full details with top 3 showcase

## Migration Steps

### 1. Update Sidebar Widget
The sidebar leaderboard has been updated to use the new component:
```tsx
// Old: Complex custom implementation
// New: Simple wrapper
<LeaderboardWidget variant="compact" />
```

### 2. Update Main Leaderboard Page
The main leaderboard page now uses the unified widget with tabs:
```tsx
<Tabs>
  <TabsContent value={activeTab}>
    <LeaderboardWidget
      variant="expanded"
      metric={activeTab}
    />
  </TabsContent>
</Tabs>
```

### 3. Update API Calls
Old endpoints should be migrated to the new unified endpoint:
```tsx
// Old: /api/leaderboards/xp
// New: /api/analytics/leaderboards/xp
```

## Theming Customization

The leaderboard theme is centralized in `leaderboard-theme.ts`:

```tsx
leaderboardTheme = {
  colors: {
    ranks: { 1: gold, 2: silver, 3: bronze },
    metrics: { xp: emerald, clout: cyan, tips: purple }
  },
  sizes: { micro, compact, standard, expanded },
  animations: { itemEnter, rankChange, hover }
}
```

## Performance Considerations

1. **Caching**: All leaderboard data cached for 5 minutes
2. **Query Deduplication**: React Query prevents duplicate requests
3. **Skeleton Loading**: Smooth loading states
4. **Optimized Rendering**: Only requested data is fetched

## Future Enhancements

1. **Real-time Updates**: WebSocket integration for live rank changes
2. **Virtual Scrolling**: For expanded variant with 100+ users
3. **Filters**: Path/category filtering
4. **Export**: CSV/JSON export functionality
5. **Historical View**: Time-based comparisons

## Troubleshooting

### Common Issues

1. **Empty Leaderboard**
   - Check if users have XP data in database
   - Verify API endpoint is accessible
   - Check Redis cache connection

2. **Styling Issues**
   - Ensure `leaderboard-theme.ts` is imported
   - Check for CSS conflicts with existing styles

3. **Performance**
   - Monitor cache hit rates
   - Check database query performance
   - Consider pagination for large datasets

## API Reference

### GET /api/analytics/leaderboards/:type

**Parameters:**
- `type`: `xp` | `posts` | `clout` | `tips`
- `current`: `true` | `false` (for weekly view)

**Response:**
```json
[
  {
    "userId": "uuid",
    "username": "degenking",
    "level": 42,
    "xp": 150000,
    "weeklyXp": 5000,
    "rank": 1,
    "trend": "up",
    "avatar": "/api/avatar/uuid"
  }
]
```

## Component Props Reference

```typescript
interface LeaderboardWidgetProps {
  variant?: 'micro' | 'compact' | 'standard' | 'expanded';
  timeframe?: 'daily' | 'weekly' | 'monthly' | 'all-time';
  metric?: 'xp' | 'clout' | 'tips' | 'activity';
  limit?: number;
  showViewAll?: boolean;
  animated?: boolean;
  className?: string;
  title?: string;
}
```