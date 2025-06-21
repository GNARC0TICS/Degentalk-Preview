# DotLottie Animation Integration Guide

> Status: Draft – v1.0 (2025-06-20)

Degentalk relies on the **`@lottiefiles/dotlottie-react`** runtime to render animated emojis, UI flourishes, and purchasable cosmetic packs.  This document captures the required setup and best-practice guidelines so every contributor can wire animations without breaking the dev server.

---

## 1  Why DotLottie?

* **Compact** – a single `.lottie` archive bundles JSON, images, fonts and can be streamed progressively.
* **Themeable** – colour / speed adjustments at runtime.
* **Marketplace Ready** – the exact assets we upload to the Shop are what the frontend consumes.

---

## 2  Project Setup

| Area | Requirement |
|------|-------------|
| **Dependency** | `@lottiefiles/dotlottie-react` (already in `package.json`) |
| **React Instance** | Must share the root React copy (Vite `resolve.dedupe` handles this). |
| **Vite Loader** | 2 options:<br/>① Remote URL – _easiest_, no extra config.<br/>② Local file – install `vite-plugin-lottie` **or** `vite-plugin-raw` so `.lottie` is served as an asset URL. |
| **Optimise Deps** | _Remove_ the package from `optimizeDeps.exclude` so it is pre-bundled once for faster HMR. |
| **Tree-Shaking** | Import **only** the component you need: `import { DotLottieReact } from '@lottiefiles/dotlottie-react';` |

### Example Vite Snippet
```ts
// config/vite.config.ts
import { defineConfig } from 'vite';
import lottie from 'vite-plugin-lottie';

export default defineConfig({
  plugins: [react(), lottie()],
  optimizeDeps: {
    exclude: [] // <- ensure dotlottie-react is NOT excluded
  }
});
```

---

## 3  Usage Pattern

```tsx
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

export function FlameAnimation({ size = 24 }) {
  return (
    <DotLottieReact
      src="https://cdn.example.com/animations/flame.lottie"
      autoplay
      loop
      style={{ width: size, height: size }}
    />
  );
}
```

* **Remote vs Local:** until a loader is enabled, prefer CDN URLs.
* **Dynamic Imports:** you can lazy-load animation-heavy components with `import()`; just ensure the module path actually exists to avoid 500 errors.

---

## 4  Troubleshooting Cheat-Sheet

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| `Failed to fetch dynamically imported module …` with path to `*.tsx` | The file (or one of its imports) can't be resolved or compiled. | Check barrel exports, path casing, or missing files. |
| Same error but URL ends in `.lottie` | Vite doesn't know how to serve the asset | Add `vite-plugin-lottie` _or_ serve from CDN. |
| React‐related hook errors | Duplicate React copy pulled in | Ensure `resolve.dedupe` entries for `react` and `react-dom`. |

---

## 5  Shop & Marketplace Hooks (Upcoming)

* Animation packs live in `db/schema/forum/customEmojis.ts` and `emojiPacks.ts`.
* Frontend purchase flow will load previews via DotLottie, then unlock usage everywhere (forum posts, shoutbox, etc.).
* **TODO:** document the pack JSON schema once the shop UI ships.

Degentalk's goal is full no-code control over animations once we launch. The Admin panel therefore exposes dedicated pages that work hand-in-hand with DotLottieReact:

### 5.1  Database binding

| Table | Purpose |
|-------|---------|
| `admin.mediaLibrary` | Binary/object store for uploaded `.lottie` files. Records `url`, `filesize`, `uploaderId`, etc. |
| `forum.customEmojis` / `forum.emojiPacks` | Reference the uploaded file via `media_id`, and hold extra metadata (keywords, price). |

### 5.2  Admin pages & UX flow

| Route | Description |
|-------|-------------|
| `/admin/ui/animations` | CRUD table (based on existing `EntityTable`) listing all `.lottie` entries with live preview. |
| `/admin/shop/emoji-packs` | Wizard for bundling animations into purchasable packs. Select animations from the Media Library modal. |

* **Live preview:** Each row renders `<DotLottieReact src={row.url} hover loop style={{ width: 64, height: 64 }} />`, so admins can verify before saving.
* **Bulk upload:** Drag-&-drop uploader (accept `.lottie`) directly saves to S3/CDN and writes the DB row via `/api/admin/media`. On success, the new entry appears instantly in the grid—no rebuild required.

### 5.3  Frontend consumption pattern

1. Client components fetch available animations at runtime via `/api/ui/animations` (public) or `/api/emoji-packs/:id` (for packs).
2. `DotLottieReact` is the single renderer across Admin preview, user composer, post reactions, etc.—guaranteeing consistent behaviour.
3. Because everything is in the DB/CDN, adding or updating an animation post-launch is a pure content operation (no code changes, no redeploys).

---

## 6  Admin Panel Integration & Live Preview

Degentalk's goal is full no-code control over animations once we launch. The Admin panel therefore exposes dedicated pages that work hand-in-hand with DotLottieReact:

### 6.1  Database binding

| Table | Purpose |
|-------|---------|
| `admin.mediaLibrary` | Binary/object store for uploaded `.lottie` files. Records `url`, `filesize`, `uploaderId`, etc. |
| `forum.customEmojis` / `forum.emojiPacks` | Reference the uploaded file via `media_id`, and hold extra metadata (keywords, price). |

### 6.2  Admin pages & UX flow

| Route | Description |
|-------|-------------|
| `/admin/ui/animations` | CRUD table (based on existing `EntityTable`) listing all `.lottie` entries with live preview. |
| `/admin/shop/emoji-packs` | Wizard for bundling animations into purchasable packs. Select animations from the Media Library modal. |

* **Live preview:** Each row renders `<DotLottieReact src={row.url} hover loop style={{ width: 64, height: 64 }} />`, so admins can verify before saving.
* **Bulk upload:** Drag-&-drop uploader (accept `.lottie`) directly saves to S3/CDN and writes the DB row via `/api/admin/media`. On success, the new entry appears instantly in the grid—no rebuild required.

### 6.3  Frontend consumption pattern

1. Client components fetch available animations at runtime via `/api/ui/animations` (public) or `/api/emoji-packs/:id` (for packs).
2. `DotLottieReact` is the single renderer across Admin preview, user composer, post reactions, etc.—guaranteeing consistent behaviour.
3. Because everything is in the DB/CDN, adding or updating an animation post-launch is a pure content operation (no code changes, no redeploys).

---

## 7  Changelog
* **2025-06-20 (v1.0)** – Initial guide drafted after Hot Threads import debugging.

---

_Keep this document updated whenever build config or animation workflow changes._ 