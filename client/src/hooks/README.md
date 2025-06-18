# Hooks

This directory contains custom React hooks used throughout the Degentalk client application. Hooks encapsulate reusable stateful logic, data fetching, or side effects.

## Core Hooks

### 1. `useIdentityDisplay.ts`

This hook is central to the user identity rendering system. It consolidates all necessary data and logic to determine a user's visual identity, including their display name, username color, primary role (name and color), equipped title, level, and avatar frame (image URL and rarity color).

**Purpose:**
- To provide a single source of truth for a user's displayable identity attributes.
- To abstract the complexity of fetching and combining user data, active cosmetics, roles, and XP/level information.
- To ensure consistency in how user identity is presented across different parts of the application.

**Input:**
- `userOrId: User | string | null | undefined`: Can be a full user object, a user ID (string), or null/undefined. If a user ID is provided, the hook will attempt to fetch the user data.

**Returns (Object):**
- `user: User | null`: The full user object (fetched or passed in).
- `displayName: string`: The name to be displayed (username or a cosmetic display name if available and prioritized).
- `nameColor: string | null`: The CSS color string for the username (e.g., based on primary role or cosmetic).
- `primaryRole: { name: string; color: string | null } | null`: The user's most prominent role to display.
- `title: { name: string; prefix?: string | null; suffix?: string | null; color?: string | null; } | null`: The user's equipped title, if any.
- `level: number | null`: The user's current level from the XP system.
- `avatarFrame: { imageUrl: string | null; rarityColor: string | null; name?: string } | null`: Details of the equipped avatar frame, including its image URL and rarity color for glow effects.
- `isLoading: boolean`: True if essential data for identity display is still loading.
- `error: Error | null`: Any error encountered during data fetching.

**Internal Logic:**
1.  Fetches the base user data if only an ID is provided (using `useUser`).
2.  Fetches the user's equipped cosmetics using `useUserCosmetics`.
3.  Fetches the user's XP and level information using `useUserXP`.
4.  Determines the `nameColor` based on the primary role's color or other cosmetic settings.
5.  Selects the `primaryRole` based on a predefined hierarchy or user settings.
6.  Identifies the `activeTitle` and `avatarFrame` from the equipped cosmetics.
7.  Constructs and returns the consolidated identity object.

**Usage with Identity Components:**
This hook is designed to be used directly with the components in `client/src/components/identity/`:

```tsx
import { useIdentityDisplay } from '@/hooks/useIdentityDisplay';
import { AvatarFrame, UserName, RoleBadge, LevelBadge } from '@/components/identity';

const UserProfileCard = ({ userId }) => {
  const { user, ...identityProps } = useIdentityDisplay(userId);

  if (identityProps.isLoading) return <p>Loading identity...</p>;
  if (identityProps.error || !user) return <p>Error loading user.</p>;

  return (
    <div style={{ border: `2px solid ${identityProps.nameColor || 'transparent'}` }}>
      <AvatarFrame
        avatarUrl={user.avatarUrl}
        frame={identityProps.avatarFrame}
        username={user.username}
      />
      <UserName user={{...user, ...identityProps}} />
      {identityProps.primaryRole && <RoleBadge role={identityProps.primaryRole} />}
      {identityProps.level && <LevelBadge level={identityProps.level} />}
      {identityProps.title && <p style={{ color: identityProps.title.color || 'inherit' }}>{identityProps.title.name}</p>}
    </div>
  );
};
```

### Other Notable Hooks:

- **`useAuth.tsx`**: Provides authentication state and user information for the currently logged-in user.
- **`useToast.tsx`**: Interface for displaying toast notifications.
- **`useUserCosmetics.ts`**: Fetches and manages a user's cosmetic inventory and equipped items.
- **`useUserXP.ts`**: Fetches and manages a user's XP, level, and related progression data.
- **`useUserPreferences.ts`**: Manages user-specific application preferences.

Refer to individual hook files for more detailed explanations of their specific functionalities and APIs. 