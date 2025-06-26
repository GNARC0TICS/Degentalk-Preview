# Profile Component Suite

This directory contains **all UI & data hooks** that compose a user-profile view.

```
ProfileSidebar  – left column, avatar + stats + actions
OverviewTab     – main overview content
InventoryTab    – cosmetics / items grid
FriendsTab      – friend list & requests
WhaleWatchTab   – follower analytics
XPProfileSection– XP achievements timeline
CosmeticControlPanel – avatar frames / titles / badges equip UI
```

## Key helpers

- `useIdentityDisplay` – merges cosmetics & role meta to provide a ready-to-render identity object.
- `getAvatarUrl` – returns avatar → gravatar → identicon.
- `generateMockProfile` (dev only) – returns mock `ProfileData` for local testing. Production bundles tree-shake this out via `import.meta.env.DEV`.

## Data flow

1. `ProfilePage` fetches `/api/profile/:username` once (TanStack Query). The payload shape lives in `client/src/types/profile.ts` and is mirrored in the server route (`profile.routes.ts`). Keep them in sync.
2. Tabs lazily render heavy sub-components (inventory, XP) to reduce TTI.
3. Sidebar shows wallet, clout, follower counts, and social handles if present.

## Adding new fields

1. **Backend** – add columns in `db/schema/user/...` and expose them in `profile.routes.ts`.
2. **Types** – extend `ProfileData`.
3. **UI** – display either in `ProfileSidebar` or relevant tab.

## Development notes

- To preview quickly without real data, run `npm run dev` and visit `/profile/devUser` (mock user).
- Avatar frames rely on Tailwind utilities + optional glow via `rarityColor`.
- All components follow the slot-aware composable pattern (see `always_applied_workspace_rules`).
