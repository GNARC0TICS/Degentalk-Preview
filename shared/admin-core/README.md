# 🧠 DegenTalk Modular Admin System

This folder contains the modular admin panel infrastructure powering all admin pages on DegenTalk and future clones.

---

## 🔧 Core Structure

| File                                      | Purpose                                  |
|-------------------------------------------|------------------------------------------|
| `admin.config.ts`                         | Registers all admin modules              |
| `admin-module-registry.ts`                | Dynamic module registry w/ permissions   |
| `useAdminModules.ts`                      | Frontend access + navigation integration |
| `ProtectedAdminRoute.tsx`                 | Route guard for admin-only pages         |
| `xp-system-modular.tsx`                   | Demo modular page                        |

---

## ✅ Features

- 🔐 Full frontend + backend permission enforcement
- 🔄 Runtime module toggling (via config or server)
- ⚙️ Per-module settings (e.g. XP multiplier, max level)
- 📦 Clone-ready config system for future platforms
- 🧩 Plugin-style module architecture
- 🛡 Role-based access for admin, mod, super_admin

---

## 🛠 How to Add a New Admin Module

1. **Register in `admin.config.ts`:**
```ts
{
  id: 'shop',
  name: 'Shop Manager',
  route: '/admin/shop',
  component: lazy(() => import('@/pages/admin/shop')),
  permissions: ['admin.shop.view', 'admin.shop.edit'],
  enabled: true,
  order: 2,
  settings: {
    enableCryptoItems: true,
    itemLimit: 100
  }
}
```

2. Wrap page in ProtectedAdminRoute:
```ts
export default function ShopPage() {
  return (
    <ProtectedAdminRoute moduleId="shop">
      <ShopManager />
    </ProtectedAdminRoute>
  )
}
```

3. Access settings and perms in your component:
```ts
const { module, hasPermission } = useAdminModule('shop')
const itemLimit = module?.settings?.itemLimit || 50
```

4. Module will now show in sidebar and respect permissions.

---

🧪 Testing Notes
- ✅ Modules auto-hide if disabled
- ✅ Routes are blocked if user lacks permission
- ✅ Settings injected via useAdminModule()
- ✅ Clone-specific overrides supported

---

🔁 Cloning Example
```ts
// Goated Admin Variant
adminModuleRegistry.configure({
  modules: ['xp-system', 'shop', 'wallet'],
  features: { enableCasino: true },
  theme: { primary: '#2F2F2F', accent: '#F8D57E' }
})
```

---

🚀 Status: Production-Ready
- ✅ Complete feature coverage
- ✅ Zero-breaking-changes conversion path
- ✅ Backwards-compatible with legacy routes
- ✅ Safe for forks, clones, and partner platforms 