# User Model Contract

## Overview

This document defines the canonical user model for the Degentalk platform. All services, components, and integrations MUST use the `CanonicalUser` type as the single source of truth for user data.

## Migration Status

- [ ] Phase 1: Type definitions in shared package ✅
- [ ] Phase 2: Transform utilities for gradual migration ✅
- [ ] Phase 3: Enhanced auth hook (useCanonicalAuth) ✅
- [ ] Phase 4: Update API endpoints to return full profiles
- [ ] Phase 5: Migrate all components to use CanonicalUser
- [ ] Phase 6: Deprecate basic User type

## Type Definition

```typescript
interface CanonicalUser {
  // Core identity
  id: Id<'UserId'>;          // UUID branded type
  username: string;          // Unique handle
  displayName?: string;      // Display name (defaults to username)
  email?: string;           // Email (hidden from public)
  
  // Profile data
  avatarUrl?: string;       // Profile picture URL
  activeAvatarUrl?: string; // With cosmetic frame applied
  bannerUrl?: string;       // Profile banner
  bio?: string;            // User bio/description
  signature?: string;      // Forum signature
  
  // Role & permissions
  role: BasicRole;         // user | moderator | admin | super_admin
  permissions?: string[];  // Granular permissions
  
  // Forum statistics
  forumStats: {
    level: number;         // 1-100
    xp: number;           // Experience points
    reputation: number;   // Community reputation
    clout?: number;      // Influence score
    totalPosts: number;
    totalThreads: number;
    totalLikes: number;
    totalTips: number;
  };
  
  // Economic data
  wallet?: {
    id: Id<'WalletId'>;
    address?: string;      // Blockchain address
    dgtBalance: number;    // DGT token balance
    usdBalance?: number;   // USD balance
  };
  
  // Social profiles
  social?: {
    website?: string;
    github?: string;
    twitter?: string;
    discord?: string;
  };
  
  // Status indicators
  isOnline: boolean;
  lastSeenAt?: string;     // ISO timestamp
  joinedAt: string;        // ISO timestamp
  
  // Flags
  isAdmin: boolean;
  isModerator: boolean;
  isVerified: boolean;
  isBanned: boolean;
  isShadowbanned?: boolean;
  
  // Cosmetics
  activeFrameId?: Id<'FrameId'>;
  activeBadgeId?: Id<'BadgeId'>;
  activeTitleId?: Id<'TitleId'>;
  
  // Plugin/integration data
  pluginData?: Record<string, any>;
}
```

## API Contract

### GET /api/users/:id/profile
Returns full CanonicalUser with all fields populated.

**Response:**
```json
{
  "user": { /* CanonicalUser */ },
  "stats": { /* Additional computed stats */ },
  "activity": { /* Recent activity summary */ }
}
```

### GET /api/auth/user
Returns current authenticated user as CanonicalUser.

## Usage Examples

### In Components

```typescript
// New way - Full canonical user
import { useCanonicalAuth } from '@/features/auth/useCanonicalAuth';

function ProfileCard() {
  const { user } = useCanonicalAuth();
  
  if (!user) return null;
  
  return (
    <div>
      <h2>{user.displayName || user.username}</h2>
      <p>Level {user.forumStats.level}</p>
      <p>{user.forumStats.totalPosts} posts</p>
    </div>
  );
}
```

### Migration Path

```typescript
// Old way - Basic user
const { user } = useAuth();

// Transition - Use transformer
import { toCanonicalUser } from '@/utils/user-transformer';
const canonicalUser = toCanonicalUser(user);

// New way - Direct canonical
const { user } = useCanonicalAuth();
```

## Data Sources

| Field | Source | Cache TTL |
|-------|--------|-----------|
| Core identity | auth service | Session |
| Profile data | user service | 5 min |
| Forum stats | gamification service | 1 min |
| Wallet data | wallet service | 30 sec |
| Online status | presence service | Real-time |

## Security Considerations

1. **Email** is only visible to:
   - The user themselves
   - Admins with user:read:email permission
   
2. **Wallet address** is only visible to:
   - The user themselves
   - Admins with wallet:read permission
   
3. **Permissions array** is only visible to:
   - The user themselves
   - Admins/mods with permission:read

## Performance Guidelines

1. Use React Query with appropriate stale times
2. Prefetch user profiles on SSR pages
3. Cache canonical users in Redux/Zustand for cross-component access
4. Use UserSummary type for lists to reduce payload size

## Monitoring

Track these metrics:
- Profile fetch latency (p50, p95, p99)
- Cache hit rate
- Transformer usage (indicates migration progress)
- API errors for profile endpoints