# Degentalk Icon System

This directory houses the **canonical icon registry** for the entire frontend.  
By routing _all_ icon usage through this module we gain:

1. **One-stop configuration** – swap an icon once, see the change everywhere.
2. **Multiple asset formats** – Lucide components, SVG / PNG fall-backs, or Lottie animations.
3. **Theme awareness** – provide light / dark variants without conditional logic in components.
4. **Static analysis** – the usage scanner can reveal dead or duplicate icons.

---

## Directory Structure

```
components/icons/
├── custom/              # Place bespoke SVG / PNG / Lottie files here
├── iconMap.config.ts    # Source-of-truth mapping
├── iconLoader.ts        # Helper – fetch config by key
├── iconRenderer.tsx     # React component with fallback hierarchy
├── types.ts             # Shared type definitions
├── icon-usage-snapshot.txt # Auto-generated scan results (git-ignored)
└── README.md            # This file
```

> **NOTE**  
> `icon-usage-snapshot.txt` is created by the scanner script and **should not** be edited manually.

---

## Adding a New Icon

1. **Import assets**

   ```tsx
   import { Rocket } from 'lucide-react';
   // or copy `rocket.svg` / `rocket.png` into `custom/`
   ```

2. **Register in `iconMap.config.ts`**

   ```ts
   import { Rocket } from 'lucide-react';

   export const iconMap = {
   	// …existing icons
   	rocket: {
   		lucide: Rocket,
   		fallbackSvg: '/icons/custom/rocket.svg'
   	}
   } as const satisfies IconMap;
   ```

3. **Use it**

   ```tsx
   import { IconRenderer } from '@/components/icons/iconRenderer';

   <IconRenderer icon="rocket" size={32} />;
   ```

---

## `<IconRenderer />` Props

| Prop  | Type                      | Default | Description                              |
| ----- | ------------------------- | ------- | ---------------------------------------- |
| icon  | `IconKey` (union of keys) | –       | Key from `iconMap`                       |
| size  | `number`                  | `24`    | Pixel size applied to SVG / IMG / Lottie |
| theme | `'light' \| 'dark'`       | `light` | Theme variant to prefer                  |

### Render Precedence

1. `themeVariants[theme]` _(Lucide or path)_
2. `lucide` _(Lucide component)_
3. `lottie` _(requires `<script src="https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js"></script>` in `index.html`)_
4. `fallbackSvg`
5. `fallbackPng`

---

## Auto Scanning Existing Icons _(Optional but recommended)_

Run the script to generate a snapshot of **all** Lucide icons imported anywhere in `client/src/`.

```bash
npm run scan:icons
```

This will create / overwrite `icon-usage-snapshot.txt` alongside this README – perfect for audits and refactors.

If you spot an icon in the snapshot that is _not_ present in `iconMap.config.ts`, consider adding it.

---

### Roadmap & Ideas

- Pre-bundle icons in a sprite sheet for perf.
- Automatic tree-shaking of unused Lucide modules.
- Nightly CI job comparing `icon-usage-snapshot.txt` with `iconMap.config.ts`.
