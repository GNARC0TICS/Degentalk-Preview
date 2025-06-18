# Identity Components

This directory contains reusable React components for consistently displaying user identity elements across the Degentalk platform. These components are designed to work closely with the `useIdentityDisplay` hook (`client/src/hooks/useIdentityDisplay.ts`) to ensure a unified look and feel.

## Core Components

### 1. `AvatarFrame.tsx`

Displays a user's avatar, optionally within a cosmetic frame that can have a rarity-based glow.

**Props:**
- `avatarUrl: string | null | undefined`: URL of the user's avatar image.
- `frame?: { imageUrl: string | null; rarityColor: string | null; name?: string } | null`: Optional frame object.
  - `imageUrl`: URL of the frame image.
  - `rarityColor`: Hex color code for the frame's glow effect.
- `username?: string`: Username for alt text and fallback.
- `size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number`: Size of the avatar. Defaults to `md`.
- `className?: string`: Additional CSS classes.
- `fallbackClassName?: string`: CSS classes for the fallback display.

**Usage:**
```tsx
import { AvatarFrame } from '@/components/identity/AvatarFrame';
import { useIdentityDisplay } from '@/hooks/useIdentityDisplay';
// ...
const user = { /* ... user object ... */ };
const identity = useIdentityDisplay(user);

return (
  <AvatarFrame
    avatarUrl={user.avatarUrl}
    frame={identity.avatarFrame}
    username={user.username}
    size="lg"
  />
);
```

### 2. `UserName.tsx`

Displays the user's name, optionally with their primary role or title inline. Handles username coloring based on role or preferences.

**Props:**
- `user: { id: string; username: string; displayName?: string | null; } & Partial<ReturnType<typeof useIdentityDisplay>>`: The user object, which can optionally include the output of `useIdentityDisplay` for `nameColor`, `primaryRole`, and `title`.
- `className?: string`: Additional CSS classes for the main span.
- `prefersDisplayName?: boolean`: If true and `displayName` is available, it will be used. Defaults to `false`.
- `showRole?: boolean`: If true and `primaryRole` exists, displays it as a badge. Defaults to `false` (as `RoleBadge` is often separate).
- `showTitle?: boolean`: If true and `title` exists, displays it. Defaults to `false`.
- `truncate?: boolean | number`: If true, truncates long names. If a number, truncates at that length. Defaults to `false`.

**Usage:**
```tsx
import { UserName } from '@/components/identity/UserName';
import { useIdentityDisplay } from '@/hooks/useIdentityDisplay';
// ...
const user = { /* ... user object ... */ };
const identity = useIdentityDisplay(user);

return <UserName user={{...user, ...identity}} className="text-xl font-bold" />;
```

### 3. `RoleBadge.tsx`

Displays a styled badge for a user's role.

**Props:**
- `role: { name: string; color?: string | null }`: Role object with name and optional color.
- `className?: string`: Additional CSS classes.
- `size?: 'sm' | 'md'`: Size of the badge. Defaults to `md`.

**Usage:**
```tsx
import { RoleBadge } from '@/components/identity/RoleBadge';
import { useIdentityDisplay } from '@/hooks/useIdentityDisplay';
// ...
const user = { /* ... user object ... */ };
const identity = useIdentityDisplay(user);

return identity.primaryRole ? <RoleBadge role={identity.primaryRole} /> : null;
```

### 4. `LevelBadge.tsx`

Displays a user's level.

**Props:**
- `level: number | string`: The user's level.
- `className?: string`: Additional CSS classes.
- `icon?: React.ReactNode`: Optional icon to display next to the level.

**Usage:**
```tsx
import { LevelBadge } from '@/components/identity/LevelBadge';
import { useIdentityDisplay } from '@/hooks/useIdentityDisplay';
// ...
const user = { /* ... user object ... */ };
const identity = useIdentityDisplay(user);

return identity.level ? <LevelBadge level={identity.level} /> : null;
```

## Integration with `useIdentityDisplay`

These components are designed to be primarily fed by the `useIdentityDisplay` hook. This hook centralizes the logic for determining which cosmetics are active, what colors to use, and what text to display, providing a consistent data structure to these presentational components.

Example of typical integration:
```tsx
import { useIdentityDisplay } from '@/hooks/useIdentityDisplay';
import { AvatarFrame, UserName, RoleBadge, LevelBadge } from '@/components/identity';

const UserDisplay = ({ userId }) => {
  const { user, ...identity } = useIdentityDisplay(userId); // Or pass full user object

  if (!user) return <p>Loading user...</p>;

  return (
    <div className="flex items-center space-x-2">
      <AvatarFrame
        avatarUrl={user.avatarUrl}
        frame={identity.avatarFrame}
        username={user.username}
        size="md"
      />
      <div>
        <UserName user={{...user, ...identity}} />
        <div className="flex items-center space-x-1">
          {identity.primaryRole && <RoleBadge role={identity.primaryRole} size="sm" />}
          {identity.level && <LevelBadge level={identity.level} />}
        </div>
      </div>
    </div>
  );
};
```

This approach ensures that as the logic for identity display evolves (e.g., new cosmetic types, different priority for titles vs. roles), the changes are made primarily in the hook, and the components can remain relatively stable. 