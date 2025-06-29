---
title: Admin Navigation
status: STABLE
updated: 2025-06-28
---

# Admin Navigation System

This document explains how the modular admin navigation is generated in **adminModules V2**.

## Overview

Admin navigation is derived entirely from the central module registry defined in `shared/config/admin.config.ts`.  Each registered module provides the metadata required to render a sidebar item, top-level route, and permission guard.

````mermaid
flowchart TD;
  AdminConfig["admin.config.ts<br/>module definitions"] -->|registers| ModuleRegistry
  ModuleRegistry -->|exposes| useAdminNavigation
  useAdminNavigation -->|provides| ModularAdminSidebar
````

1. **Module Registration** – Modules are registered at application start-up.  See `adminModuleRegistry.register()`.
2. **Permission Filtering** – `useAdminNavigation()` inspects the current user's permissions and returns only the modules (and sub-modules) they can access.
3. **Navigation Rendering** – `<ModularAdminSidebar />` consumes the filtered list and renders links, groups, icons, and badges.

## Adding a New Module

1. **Register the module** in `shared/config/admin.config.ts`:
   ```ts
   adminModuleRegistry.register({
     id: 'xp-system',
     name: 'XP System',
     icon: 'Bolt',
     route: '/admin/xp-system',
     permissions: ['admin.xp.manage'],
     enabled: true,
     order: 30
   });
   ```
2. **Protect the page** with `<ProtectedAdminRoute permission="admin.xp.manage">`.
3. **Enjoy automatic navigation** – no manual link maintenance required.

## Icon Mapping

•  The `icon` string maps to a Lucide icon component.
•  Use any valid Lucide export name (e.g. `Users`, `Gauge`, `Bolt`).

## Badges & Status

Modules can expose a `badge` string (e.g. `"beta"`, `"new"`).  The sidebar shows this badge next to the link.  Badges respect the permission filter.

## Sub-Modules

A module can define `subModules` – these render as nested links.  Permissions are evaluated per-sub-module.

```ts
adminModuleRegistry.register({
  id: 'shop',
  name: 'Shop',
  ...,
  subModules: [
    { id: 'shop.items', name: 'Items', route: '/admin/shop/items', permissions: ['admin.shop.manage'] },
    { id: 'shop.categories', name: 'Categories', route: '/admin/shop/categories', permissions: ['admin.shop.manage'] }
  ]
});
```

## Permission → Route Resolution

The navigation generator does **not** require a direct mapping file;  it infers route visibility from:

1. The module's `permissions` array.
2. The runtime `permissionToModuleMap` helper used by `<ProtectedAdminRoute />`.

As soon as a module ID is resolvable from a permission the system can:

•   Validate access server-side
•   Protect the route client-side
•   Show or hide the link in navigation

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Link not showing | Ensure the module is `enabled` and the user has **all** required permissions. |
| Incorrect icon | Verify the icon name matches a Lucide export. |
| Route accessible but link hidden | The page may still use the legacy `moduleId` prop; update to `permission` based protection. |

---

*Last updated: 2025-06-28* 