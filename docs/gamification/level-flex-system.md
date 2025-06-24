# Level Flex System (Levels V2)

## Overview
The **Level Flex** upgrade turns numeric XP levels into fully-themed progression rewards.
All visuals are data-driven, configurable from the Admin panel, and rendered automatically across the client.

```
Levels (DB) ─┐
             │  unlocks   ┌─> Titles
             ├────────────┼─> Badges
             │            └─> Frames
             │
             └── visuals → iconUrl • colorTheme • rarity • animationEffect • frameUrl | frameStyle
```

## Key Database Fields (table `levels`)
| column | type | purpose |
|--------|------|---------|
| `icon_url` | varchar | Optional badge icon displayed on LevelBadge |
| `color_theme` | varchar | Hex or named Tailwind colour (emerald, cyan…) |
| `rarity` | enum | common · rare · epic · legendary · mythic |
| `animation_effect` | varchar | pulse · glow · chroma · ripple (maps to Tailwind `animate-*`) |
| `frame_url` | varchar | Image/Video asset overlay for avatars |
| `unlocks` | JSONB | `{ titles: number[], badges: number[], frames: number[] }` |

Legacy columns (`min_xp`, `reward_*`) remain backward-compatible.

## Admin UI
* **Basics** – level number, XP required, DGT reward, description
* **Visuals** – icon upload, colour picker, rarity, animation, frame URL
* **Unlocks** – multi-select Titles / Badges / Frames + JSON editor

All changes are validated (Zod) and persisted through the `/api/admin/xp/levels` endpoints.

## Front-End Components
| component | responsibility |
|-----------|----------------|
| `LevelBadge` | Renders animated badge using `levelConfig` or fallback `level` |
| `UserLevelDisplay` | Public display helper wrapping `LevelBadge` |
| `AvatarFrame` | Overlays avatar with `frameUrl` **or** `frameStyle` |

### New Animation Utilities (Tailwind)
```
animate-glow    // soft white glow
animate-chroma  // hue-rotate loop
animate-ripple  // scale/fade pulse
animate-pulse   // default subtle pulse
```
Defined under `tailwind.config.ts → extend.keyframes` & `extend.animation`.

## Adding Pre-Defined Frame Styles
`frameStyle` accepts:
* `bronze` · `silver` · `gold`
* `mythic-glow` (glow animation)
* `chroma-loop` (hue rotation)

Style ring colours & animations live in `AvatarFrame.getStyleClasses()`; extend as needed.

## Migration History
* `2025-06-24_level_visual_fields/` – SQL migration adding visual/unlock columns
* `20250624_add_visual_fields_to_levels.ts` – initial online run

## Developer Checklist
- [ ] When creating a new level, always set **XP required** and at least one visual cue (colour or rarity)
- [ ] Use **multi-select** unlocks rather than editing JSON by hand when possible
- [ ] For animated assets, prefer **WebP** ≤256 KB
- [ ] To display levels in new UI, pass `levelConfig` from API → components (`LevelBadge`, etc.)

---
**Questions?** Ping #dev-gamification on Slack. 