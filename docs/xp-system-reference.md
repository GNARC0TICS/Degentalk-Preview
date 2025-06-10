# XP System Reference Guide

This document serves as the comprehensive reference for the Degentalk™ XP system architecture, implementation, and best practices. It consolidates information from multiple rule files and provides a single source of truth for XP system development.

## Table of Contents
- [System Overview](#system-overview)
- [Architecture](#architecture)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Frontend Components](#frontend-components)
- [Implementation Best Practices](#implementation-best-practices)
- [Admin Panel Controls](#admin-panel-controls)
- [Integration Points](#integration-points)

## System Overview

The ForumFusion platform implements a comprehensive XP (experience points) system that handles user progression, leveling, badges, and titles. The XP system interacts with the wallet system through DGT token rewards.

### Core Components

- **User XP and Levels**: XP is earned through various platform activities, users level up as they accumulate XP
- **Badges and Titles**: Users can earn and equip badges and titles as they progress
- **Admin Interfaces**: Comprehensive admin tools for managing the XP economy
- **XP Sources**: Various actions that award XP (posts, reactions, logins, etc.)
- **Rewards System**: DGT tokens, special titles, badges, and unlocked features

### Integration with Wallet
- Level-up rewards can include DGT tokens that are credited to the user's wallet
- XP multipliers and boosts can be purchased using DGT
- The XP and wallet systems work together but maintain separation of concerns

## Architecture

The XP/Level system follows a tiered architecture with a scaling XP formula.

### Backend Components

- **XpLevelService**: Main service that handles awarding XP for user actions, enforcing daily caps, and managing level progression.
- **PathService**: Manages path specializations and path-specific XP.
- **WalletEngine**: Manages DGT balances and transactions related to XP/levels.
- **Database Schema**: Updated to support the XP system with tables for levels, badges, titles, and user progression tracking.

### XP Formula

The system uses an exponential-softened scaling formula:

```javascript
function xpForLevel(n) {
  return Math.floor(500 * n ** 1.5);
}
```

This provides the following progression:
- Level 1 = 500 XP
- Level 2 = 1,414 XP
- Level 3 = 2,598 XP
- Level 10 ≈ 15,800 XP
- Level 50 ≈ 176,000 XP
- Level 100 ≈ 1,000,000 XP

### Level Tiers

The levels are divided into meaningful brackets:
- 1-10 "Surface": New user starter ranks
- 11-30 "Core": Active contributors with subtle perks
- 31-60 "Deep": Reputation leaders with governance privileges
- 61-99 "Abyss": Forum elders with experimental perks
- 100+ "Mythic": Elite status with custom badges and exclusive access

## Database Schema

### Users Table Modifications

The `users` table has been updated to include:
- `xp`: integer - Total accumulated experience points
- `clout`: integer - Reputation/credibility score (0-99)
- `activeTitleId`: integer (optional) - FK to the currently equipped title
- Removed arrays: `unlockedBadges` and `unlockedTitles` (moved to separate junction tables)

### Core Tables

```sql
-- Levels table
CREATE TABLE levels (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  level INTEGER NOT NULL,
  requiredXp INTEGER NOT NULL,
  title TEXT NOT NULL,
  rewardTitleId INTEGER REFERENCES titles(id),
  rewardBadgeId INTEGER REFERENCES badges(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Badges table
CREATE TABLE badges (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL,
  description TEXT,
  iconUrl TEXT,
  category TEXT,
  rarity TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Titles table
CREATE TABLE titles (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL,
  description TEXT,
  iconUrl TEXT,
  category TEXT,
  rarity TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Junction tables
CREATE TABLE userBadges (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  userId INTEGER NOT NULL REFERENCES users(id),
  badgeId INTEGER NOT NULL REFERENCES badges(id),
  earnedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(userId, badgeId)
);

CREATE TABLE userTitles (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  userId INTEGER NOT NULL REFERENCES users(id),
  titleId INTEGER NOT NULL REFERENCES titles(id),
  earnedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(userId, titleId)
);

-- XP Actions
CREATE TABLE xp_actions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  default_value INTEGER NOT NULL DEFAULT 10,
  is_enabled BOOLEAN DEFAULT TRUE,
  cooldown_seconds INTEGER DEFAULT 0
);

-- XP Log
CREATE TABLE xpLogs (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  userId INTEGER NOT NULL REFERENCES users(id),
  amount INTEGER NOT NULL,
  source TEXT NOT NULL,
  details TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Additional Tables

Refer to the complete database schema in the [XP & DGT System Implementation Plan](xp-dgt-system-implementation-plan.md) for additional tables including:
- Path tables
- DGT rewards
- Economy settings
- And more

## API Endpoints

### XP Routes
- `GET /api/xp/actions` - Get all XP actions
- `GET /api/xp/levels` - Get all XP levels
- `GET /api/xp/me` - Get my XP info
- `GET /api/xp/me/log` - Get my XP history
- `GET /api/xp/leaderboard` - Get XP leaderboard
- `GET /api/xp/users/:userId` - Get user's XP info
- `POST /api/xp/award` - Trigger XP award (authenticated actions)

### Path Routes
- `GET /api/paths` - Get all paths
- `GET /api/paths/:pathId` - Get specific path
- `GET /api/paths/user/me` - Get my paths
- `GET /api/paths/user/me/primary` - Get my primary path
- `POST /api/paths/user/me/primary/:pathId` - Set my primary path
- `GET /api/paths/:pathId/leaderboard` - Get path leaderboard

### Admin Routes
- `POST /api/admin/xp/actions` - Manage XP actions
- `POST /api/admin/xp/levels` - Manage level thresholds
- `POST /api/admin/xp/paths` - Manage XP paths
- `POST /api/admin/dgt/rewards` - Manage level-up rewards
- `POST /api/admin/user/xp` - Manually adjust user XP

## Frontend Components

### User Profile Components

- **XPProgressBar**: Visual representation of progress to the next level
  - Should display current XP, level, and XP needed for next level
  - Located in: `client/src/components/economy/xp/XPProgressBar.tsx`

- **UserBadges**: Component to display earned badges
  - Grid layout with tooltips for badge details
  - Located in: `client/src/components/economy/badges/UserBadges.tsx`

- **UserTitles**: Component to display and select active title
  - Located in: `client/src/components/economy/titles/UserTitles.tsx`

### Forum Post Components

- **UserLevelDisplay**: Compact component showing user level beside username
  - Should appear in post headers, comments, and user mentions
  - Located in: `client/src/components/forum/UserLevelDisplay.tsx`

### Admin Panel Components

- **LevelManagement**: Interface for admins to configure level thresholds and rewards
  - Located in: `client/src/pages/admin/xp/levels.tsx`

- **BadgeManagement**: Interface for creating and assigning badges
  - Located in: `client/src/pages/admin/xp/badges.tsx`

- **TitleManagement**: Interface for creating and managing titles
  - Located in: `client/src/pages/admin/xp/titles.tsx`

- **XPSettings**: Interface for configuring XP values for actions and daily caps
  - Located in: `client/src/pages/admin/xp/settings.tsx`

- **UserXPAdjustment**: Interface for manually adjusting user XP
  - Located in: `client/src/pages/admin/xp/user-adjustment.tsx`

## Implementation Best Practices

### State Management

- Use React Query for data fetching and caching XP/Level data:
  ```typescript
  const { data: userXpData, isLoading } = useQuery(
    ['userXp', userId],
    () => api.getUserXp(userId)
  );
  ```

- Prefer context for sharing XP data across components:
  ```typescript
  // In a context provider
  const XpContext = createContext<XpContextType | null>(null);
  
  // In components
  const { xp, level, nextLevelXp } = useXpContext();
  ```

### UI Design Patterns

- Display XP and level information consistently:
  - Use `<LevelBadge>` component beside usernames
  - Show XP progress bars with current/next level information
  - Apply consistent color coding based on level tiers

- For level progress bars:
  ```tsx
  <ProgressBar
    value={currentXp - levelThresholds[currentLevel]}
    max={levelThresholds[currentLevel + 1] - levelThresholds[currentLevel]}
    colorScheme={getLevelColorScheme(currentLevel)} // Based on level tiers
  />
  ```

### Backend Performance

- Cache level thresholds to avoid recalculating for each user:
  ```typescript
  // In XpLevelService
  private levelThresholds: Record<number, number> = {};
  
  constructor() {
    // Precalculate thresholds for common levels
    for (let i = 0; i <= 100; i++) {
      this.levelThresholds[i] = this.calculateXpForLevel(i);
    }
  }
  ```

- Batch XP updates when possible to reduce database writes:
  ```typescript
  // Instead of updating after each action
  async batchUpdateUserXp(userId: number, actions: Array<{type: string, amount: number}>) {
    // Process in a single transaction
  }
  ```

### Security Practices

- Validate all XP modifications server-side:
  ```typescript
  // In route handlers
  if (amount > maxAllowedAdjustment && !isAdmin) {
    throw new Error('Exceeds maximum allowed adjustment');
  }
  ```

- Log all admin XP adjustments for audit purposes:
  ```typescript
  await xpLogService.logAdminAdjustment({
    userId,
    adminId: req.user.id,
    amount,
    reason
  });
  ```

## Admin Panel Controls

The admin panel includes the following XP system management interfaces:

- **XP adjustment**: [client/src/pages/admin/xp/adjust.tsx](client/src/pages/admin/xp/adjust.tsx)
- **Badge management**: [client/src/pages/admin/xp/badges.tsx](client/src/pages/admin/xp/badges.tsx)
- **Title management**: [client/src/pages/admin/xp/titles.tsx](client/src/pages/admin/xp/titles.tsx)
- **Level configuration**: [client/src/pages/admin/xp/levels.tsx](client/src/pages/admin/xp/levels.tsx)
- **System settings**: [client/src/pages/admin/xp/settings.tsx](client/src/pages/admin/xp/settings.tsx)

## Integration Points

### Forum Activity
- XP is awarded for posts, replies, reactions, and receiving tips
- Daily Cap: Prevents abuse by limiting daily XP gains
- Reward System: Automatically grants titles and badges upon reaching level thresholds

### Frontend Locations
- Profile Page: `client/src/pages/profile/[username].tsx`
- User Settings: `client/src/pages/settings/profile.tsx`
- Forum Posts: `client/src/components/forum/post-card.tsx`
- Thread View: `client/src/pages/threads/[threadId].tsx`
- Admin Dashboard: `client/src/pages/admin/index.tsx`

## Implementation Priority

1. Core user-facing components (XP display, progress bar)
2. Admin configuration panels (levels, XP settings)
3. Badge and title display components
4. Advanced admin tools (user XP adjustment, logs)

---

For more detailed implementation instructions, refer to the [XP & DGT System Implementation Plan](xp-dgt-system-implementation-plan.md). 