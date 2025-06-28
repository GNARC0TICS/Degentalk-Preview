---
title: site header refactor plan
status: STABLE
updated: 2025-06-28
---

# Site Header Optimization & Modularization Plan

**Status:** Draft – pending kickoff
**Audience:** Frontend team, DX (DevOps), Design, Product

---

## 1. Objectives

1. Consolidate **all header‐related logic, styles, and navigation data** into a single, reusable package.
2. Remove code duplication (navigation arrays, styling fragments, GSAP/Framer snippets spread across files).
3. Maintain current UI/UX while **improving developer experience, testability, and bundle size**.
4. Prepare the component for future theme-driven variants and plugin injection without another large refactor.

---

## 2. A–K Roadmap (Concise)

| Step | Description | Outcome |
|------|-------------|---------|
| **A** | **Central navigation config** (`config/navigation.ts`) | One source-of-truth for routes, labels, icons, auth roles, analytics flags. |
| **B** | Extract atomic header atoms (`Logo`, `PrimaryNav`, `SearchBox`, `UserMenu`, etc.) into `components/header/` | SiteHeader becomes a <150-line composition file. |
| **C** | Introduce `HeaderContext` | Exposes `authStatus`, `isScrolled`, counts (wallet, notifications), theme, etc. |
| **D** | Migrate scattered CSS → co-located or Tailwind utilities; delete `underline-links.css` after merge | Cleaner tree-shakable CSS. |
| **E** | Responsive layout with Tailwind only (`flex-col md:flex-row`); mobile bottom-nav becomes `<HeaderBottomNav>` | No duplicate MobileNavBar file. |
| **F** | Build `<DashboardHeader variant="admin \| mod">` using same atoms; delete duplicated markup in admin/mod layouts | Unified look & behaviour. |
| **G** | Codemod sweep: remove raw `navigation = [...]` literals, forbid direct `site-header` import outside package | No more drift. |
| **H** | **Theme-aware wrapper** `<HeaderThemeWrapper>` that reads `zone.themeColor` + `zone.icon` | Dynamic tint / icons per zone without layout changes. |
| **I** | **Plugin slot** (`HeaderPluginSlot`) for shoutbox toggle, DegenAlerts, XP badges, etc. | Future-proof injection point. |
| **J** | **Smart auth states** via `authStatus: 'loading' | 'guest' | 'user' | 'admin'` in context | Removes scattered `isAuthenticated` checks + loading shimmer. |
| **K** | **Prefetch-aware `<NavLink>`** wrapper (ARIA, analytics, optional `prefetch` prop) | Accessibility, telemetry, perf wins. |

---

## 3. Detailed Implementation Notes

### 3.1 HeaderContext API

```ts
interface HeaderContextValue {
  authStatus: 'loading' | 'guest' | 'user' | 'admin';
  user?: { username: string; level: number; xp: number };
  unreadNotifications: number;
  walletOpen: boolean;
  isScrolled: boolean;
  theme?: { color: string; icon?: React.ReactNode };
  // actions
  toggleWallet(): void;
  toggleNotifications(): void;
}
```

### 3.2 Navigation Config Schema

```ts
export interface NavItemConfig {
  label: string;
  href: string;
  icon: React.ReactElement;
  requiresAuth?: boolean;
  roles?: Array<'admin' | 'mod' | 'user'>; // visibility rules
  mobileOnly?: boolean;
  prefetch?: boolean; // enables rsc-style prefetch
}
```

All consumer components map over this config; no more hard-coded arrays.

### 3.3 HeaderPluginSlot

```tsx
// Usage inside SiteHeader atoms
<HeaderPluginSlot position="right" />
```

Plugins register via a tiny registry:

```ts
registerHeaderPlugin('shoutboxToggle', () => <ShoutboxButton />);
```

### 3.4 Progress Utility in User Dropdown

Add a top-placed, read-only progress bar item before dropdown links:

```tsx
// new component inside UserMenu.tsx
<DropdownMenuItem disabled className="opacity-100 cursor-default">
  <div className="flex flex-col w-full">
    <span className="text-xs text-zinc-400 mb-1">Level {user.level}</span>
    <Progress value={(user.xp / nextLevelXp) * 100} />
    <span className="text-[10px] text-zinc-500 mt-1">{user.xp}/{nextLevelXp} XP</span>
  </div>
</DropdownMenuItem>
```

*Will lazy-load `Progress` component & calculate `nextLevelXp` via helper.*

---

## 4. House-Keeping Boosters

1. **Unit tests** – `site-header.test.tsx` renders at xs, md, lg breakpoints (React Testing Library + jest-dom snapshots).
2. **Docs** – Add `docs/navigation-config.md` explaining the config format & examples.
3. **Codemod** – similar to `app-sidebar-path.js`, create `header-nav-codemod.js` to replace old nav arrays.
4. **Bundle Guard** – Run `vite build --analyze`; set a 30 kB budget for `header` chunk.
5. **ESLint** – rule: `no-site-header-import` (private import path) + enforce `<NavLink>` usage.

---

## 5. Definition of Done (Extended)

- [ ] All header atoms present in `components/header/` with barrel export.
- [ ] SiteHeader ≤150 LOC, zero inline nav arrays.
- [ ] `HeaderContext` provides auth loading, scroll, theme.
- [ ] `<NavLink>` wrapper used everywhere (prefetch + analytics).
- [ ] Header dynamically re-tints per `zone.themeColor` via `<HeaderThemeWrapper>`.
- [ ] `<HeaderPluginSlot>` shows shoutbox toggle + alerts when registered.
- [ ] Progress utility displayed in user dropdown (level & XP).
- [ ] Admin/Mod headers migrated to `<DashboardHeader>` variant.
- [ ] Snapshot tests pass.
- [ ] Bundle size budget respected.

---

## 6. Roll-Out & Milestones

1. **Week 1** – Extract atoms (A–D). Codemod nav arrays. CI passes.
2. **Week 2** – Context, NavLink, responsive layout (E–G). Migrate Admin/Mod.
3. **Week 3** – Theme wrapper & plugin slot (H–I). Drop progress utility.
4. **Week 4** – Testing, docs, bundle guard, clean-up.

All changes should be feature-flagged (`ENABLE_NEW_HEADER`) until QA sign-off.

---

> **Next step:** create tracking tickets in `refactor-tracker.md` and bootstrap `components/header/` with skeleton atoms. 