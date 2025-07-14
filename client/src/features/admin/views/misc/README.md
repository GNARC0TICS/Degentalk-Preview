# Admin Pages – Developer Notes

> This file lives alongside the admin pages to give new contributors a quick orientation.

## Anatomy of an Admin Page

1. **Route File** – Located in this directory (`/admin/<page>.tsx`).
2. **Protection Wrapper** – Every page must be wrapped with `<ProtectedAdminRoute />`.
3. **Permission First** – Use the `permission` prop, not `moduleId`, unless you are maintaining legacy code.

```tsx
// Example
export default function UsersPage() {
	return (
		<ProtectedAdminRoute permission="admin.users.view">
			<UsersModule />
		</ProtectedAdminRoute>
	);
}
```

## Why `permission` Instead of `moduleId`?

• **Clarity** – The required capability is explicit.  
• **Flexibility** – A module can declare multiple permissions; pages can request exactly what they need.  
• **Future-proof** – Decouples UI routing from internal module slugs.

`moduleId` is still accepted for backward compatibility but will be removed after the migration window.

## Adding a New Page

1. **Create** the `.tsx` file.
2. **Wrap** it with `<ProtectedAdminRoute permission="your.permission">`.
3. **Register** the module (or sub-module) in `shared/config/admin.config.ts`.
4. **Done** – The navigation will pick it up automatically.

## Common Pitfalls

| Problem                       | Fix                                                                                   |
| ----------------------------- | ------------------------------------------------------------------------------------- |
| Page shows blank              | Check that the user has the required permission.                                      |
| Sidebar link missing          | Ensure `enabled: true` and the `order` is set in the module config.                   |
| TS error on `permission` prop | Make sure you imported the component from `@/components/admin/protected-admin-route`. |

---

_Last updated: 2025-06-28_
