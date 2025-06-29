---
title: Roles & RBAC
status: STABLE
updated: 2025-06-28
---

# Roles & RBAC Architecture

This document explains how Degentalk converts a **permission string** into a **module slug** and ultimately enforces access control both server-side and client-side.

## Key Terms

| Term | Definition |
|------|------------|
| **Role** | High-level grouping assigned to a user (`user`, `moderator`, `admin`, `super_admin`). |
| **Permission** | Fine-grained capability string (`admin.users.manage`). |
| **Module ID** | Unique slug registered in `adminModuleRegistry` (`users`, `xp-system`). |
| **permissionToModuleMap** | Helper map translating a permission to its owning module. |

## Data Flow

````mermaid
flowchart LR;
  subgraph Login
    A(User JWT) --> B[Role & permission claims]
  end
  B -->|Is request admin?| S(Security Middleware)
  S -->|yes| P{Has permission?}
  P -->|no| Denied
  P -->|yes| Served

  %% Client-side path
  B --> C(Client Session)
  C --> useAdminNavigation --> ModularSidebar
  C --> ProtectedAdminRoute
````

1. **Backend Enforcement** – Express middleware inspects JWT claims and ensures the incoming request carries at least one of the controller's required permissions.
2. **Client Navigation** – React hooks read the same permission list and hide modules the user cannot access.
3. **Route Guard** – `<ProtectedAdminRoute permission="…" />` blocks direct URL access even if the link is hidden.

## permissionToModuleMap

Defined in `shared/config/admin.config.ts` and generated automatically when modules register:

```ts
export const permissionToModuleMap: Record<string, string> = {
  'admin.users.view': 'users',
  'admin.users.manage': 'users',
  'admin.xp.manage': 'xp-system'
  // …auto-generated
};
```

`<ProtectedAdminRoute />` uses the map to bridge older `moduleId` props during the migration phase.

```tsx
<ProtectedAdminRoute permission="admin.xp.manage">
  <XPSystemPage />
</ProtectedAdminRoute>
```

If a page still provides `moduleId`, the guard back-fills the correct permission list using this map – guaranteeing backward compatibility.

## Adding a New Permission

1. **Declare** it in `ADMIN_PERMISSIONS` inside `admin.config.ts`.
2. **Assign** it to one or more roles in `adminConfig.defaultPermissions`.
3. **Protect** new endpoints with `requirePermission('my.permission')`.
4. **Wrap** the page component with `<ProtectedAdminRoute permission="my.permission">`.

The navigation generator will now automatically include (or hide) the module based on the user's updated role.

---

*Last updated: 2025-06-28* 