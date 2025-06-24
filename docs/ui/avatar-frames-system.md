# Avatar Frame System

> Status: **Production-Ready** (2025-06-23)

This document is the canonical reference for the Avatar-Frame subsystem that powers profile cosmetics, shop monetisation and XP hooks.

---

## Overview

```
DB  →  APIs  →  Services  →  Front-End  →  UX
```

1. **Database**
   * `avatar_frames` – master table (name, imageUrl, rarity, animated, …)
   * `user_owned_frames` – ownership join (user_id ↔ frame_id, source, created_at)
   * `products.frame_id` – FK when category = `avatar-frame`
2. **Core Services**
   * `avatarFrameStore.service.ts` – list / purchase (wallet deduction)
   * `frameEquip.service.ts` – ownership + equip (XP emit)
3. **Public Routes**
   * `GET  /api/store/avatar-frames` – list for shop grid
   * `POST /api/store/avatar-frames/:id/purchase` – buy & own
   * `POST /api/users/me/frames/:id/equip` – equip owned frame
4. **Admin Routes**
   * `POST /api/admin/avatar-frames/upload` – image upload helper
   * `POST /api/admin/avatar-frames/:id/grant` – batch grant to users
5. **React Components**
   * `FramedAvatar` – low-level renderer
   * `UserAvatar` – app-wide avatar wrapper
   * `shop/avatar-frames.tsx` – purchase / equip UI
   * `GrantFrameModal` – admin batch grant dialog
6. **Config-First**
   * `frames.config.ts` – rarity → price / glow / border definitions used everywhere.
7. **Gamification**
   * XP action `FRAME_EQUIPPED` (+5 XP, configurable).

---

## End-to-End Flow

1. Product with `category = "avatar-frame"` is **published**.
2. Front-end shop grid (`/shop/avatar-frames`) fetches list and shows **Buy**.
3. On **Buy**:
   * Route deducts DGT via `dgtService.deductDGT` (unless price = 0).
   * Inserts `user_owned_frames`.
4. On **Equip**:
   * `frameEquip.service` verifies ownership → sets `users.active_frame_id`.
   * Emits XP (`FRAME_EQUIPPED`).
5. Anywhere `UserAvatar` is rendered → gets live frame overlay.

---

## Quick API Reference

| Method | Path | Auth | Body | Notes |
| ------ | ---- | ---- | ---- | ----- |
| GET | `/api/store/avatar-frames` | Public | – | Returns `{ id, name, imageUrl, price, rarity, owned?, equipped? }[]` |
| POST | `/api/store/avatar-frames/:id/purchase` | User | – | Deducts wallet, grants ownership |
| POST | `/api/users/me/frames/:id/equip` | User | – | Sets active frame & awards XP |
| POST | `/api/admin/avatar-frames/:id/grant` | Admin | `{ userIds: string[] }` | Batch grant |
| POST | `/api/admin/avatar-frames/upload` | Admin | *multipart* | Returns image URL |

---

## Component Cheat-Sheet

* `FramedAvatar` props: `{ avatarUrl, frameUrl, username, size, shape }`
* `UserAvatar` adds automatic `frameUrl` from `user.activeFrame`.
* Rarity glow classes come from `frames.config.ts`.

```tsx
import { frameRarityConfig } from '@/config/frames.config';

const glow = frameRarityConfig[frame.rarity].glowClass;
```

---

## Admin Panel Tips

* Use **Create Frame** dialog to seed new cosmetics.
* Use **👥 Grant** to reward event participants.
* Upload SVG/WebP ≤ 200 KB for best performance.

---

## Testing

Cypress spec `tests/e2e/avatarFrames.spec.ts` covers:
1. Purchase → Equip → Visual check in thread.
2. (Make sure thread `123` exists in seed or change the spec.)

Run:

```bash
npm run cypress:open  # or headless: npm run cypress
```

---

## Future Extensions

* Limited-time drops (`products.availableUntil`).
* Marketplace trading via `internal_transfer_*` DGT transactions.
* Animated WebP frames (`animated` flag already in schema).

---

© 2025 DegenTalk 