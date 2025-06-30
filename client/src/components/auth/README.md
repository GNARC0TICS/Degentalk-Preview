# Production Route Guard System

A comprehensive, type-safe route protection system with role-based access control and hierarchical permissions.

## Quick Start

```tsx
import { RequireAdmin, RequireAuth, ProtectedRoute } from '@/components/auth';

// Basic authentication
<RequireAuth>
  <UserDashboard />
</RequireAuth>

// Role-based protection
<RequireAdmin>
  <AdminPanel />
</RequireAdmin>

// Custom protection with fallback
<ProtectedRoute minRole="moderator" fallback={<AccessDenied />}>
  <ModerationTools />
</ProtectedRoute>
```

## Component API

### ProtectedRoute (Core Component)

```tsx
interface ProtectedRouteProps {
	children: React.ReactNode;
	minRole?: Role; // Minimum role required
	exactRole?: Role; // Exact role match required
	requireAuth?: boolean; // Requires authentication (default: true)
	redirectTo?: string; // Redirect destination (default: '/auth')
	fallback?: React.ReactNode; // Custom fallback content
	showError?: boolean; // Show error UI (default: true)
}
```

### Convenience Guards

| Component            | Purpose                | Equivalent                                   |
| -------------------- | ---------------------- | -------------------------------------------- |
| `RequireAuth`        | Any authenticated user | `<ProtectedRoute requireAuth />`             |
| `RequireAdmin`       | Admin or super_admin   | `<ProtectedRoute minRole="admin" />`         |
| `RequireSuperAdmin`  | Super admin only       | `<ProtectedRoute exactRole="super_admin" />` |
| `RequireModerator`   | Moderator+             | `<ProtectedRoute minRole="moderator" />`     |
| `RequireDev`         | Developer+             | `<ProtectedRoute minRole="dev" />`           |
| `RequireShoutboxMod` | Shoutbox mod+          | `<ProtectedRoute minRole="shoutbox_mod" />`  |

## Higher-Order Components

```tsx
// Automatic protection based on route config
const ProtectedAdmin = withAdmin(AdminDashboard);

// Custom protection
const ProtectedComponent = withRouteProtection(MyComponent, {
	fallback: <CustomAccessDenied />,
	showError: false
});
```

## Hooks

### useRouteProtection

```tsx
const protection = useRouteProtection('admin');

if (protection.isLoading) return <Loading />;
if (!protection.canAccess) return <AccessDenied reason={protection.reason} />;

return <AdminContent />;
```

### Convenience Hooks

```tsx
const authStatus = useRequireAuth();
const adminStatus = useRequireAdmin();
const superAdminStatus = useRequireSuperAdmin();
const moderatorStatus = useRequireModerator();
const customStatus = useRequireRole('content_mod');
```

## Role Hierarchy

```
super_admin (100) - Full system access
    ↓
admin (80) - Admin panel, user management, mod actions
    ↓
moderator (60) - Content moderation, reports
    ↓
dev (50) - Developer tools
    ↓
content_mod (40) - Content-specific moderation
market_mod (40) - Market-specific moderation
    ↓
shoutbox_mod (30) - Shoutbox moderation
    ↓
user (0) - Basic user access
```

## Route Configuration

Define protection requirements in `lib/routeConfig.ts`:

```tsx
export const routeConfig: RouteConfig[] = [
	{
		path: '/admin',
		minRole: 'admin',
		title: 'Admin Panel',
		redirectTo: '/',
		children: [
			{
				path: '/admin/system',
				exactRole: 'super_admin',
				title: 'System Settings',
				redirectTo: '/admin'
			}
		]
	}
];
```

## Usage Patterns

### 1. Page-Level Protection

```tsx
export default function AdminUsersPage() {
	return (
		<RequireAdmin>
			<AdminUsersContent />
		</RequireAdmin>
	);
}
```

### 2. Component-Level Protection

```tsx
function UserCard({ user }) {
	return (
		<Card>
			<CardContent>
				<h3>{user.name}</h3>

				<RequireModerator fallback={null}>
					<Button onClick={() => banUser(user.id)}>Ban User</Button>
				</RequireModerator>

				<RequireSuperAdmin fallback={null}>
					<Button onClick={() => deleteUser(user.id)}>Delete User</Button>
				</RequireSuperAdmin>
			</CardContent>
		</Card>
	);
}
```

### 3. Conditional Rendering

```tsx
function Navigation() {
	const { canAccessAdminPanel } = useAuth();

	return (
		<nav>
			<Link to="/">Home</Link>
			<Link to="/forum">Forum</Link>

			{canAccessAdminPanel && <Link to="/admin">Admin</Link>}
		</nav>
	);
}
```

### 4. Programmatic Protection

```tsx
function useAdminActions() {
	const { canAccess } = useRequireAdmin();

	const deleteUser = useCallback(
		async (userId) => {
			if (!canAccess) {
				toast.error('Insufficient permissions');
				return;
			}

			await apiRequest.delete(`/users/${userId}`);
		},
		[canAccess]
	);

	return { deleteUser, canDeleteUsers: canAccess };
}
```

## Error Handling

### Custom Error UI

```tsx
<ProtectedRoute
	minRole="admin"
	fallback={
		<CustomAccessDenied
			requiredRole="admin"
			userRole={user?.role}
			onRequestAccess={() => openAccessRequestModal()}
		/>
	}
>
	<AdminContent />
</ProtectedRoute>
```

### Redirect Patterns

```tsx
// Redirect to login
<ProtectedRoute requireAuth redirectTo="/auth">

// Redirect to home
<ProtectedRoute minRole="admin" redirectTo="/">

// Redirect to parent admin page
<ProtectedRoute exactRole="super_admin" redirectTo="/admin">
```

## Global Monitoring

Add to your app root:

```tsx
<GlobalRouteGuard
	onUnauthorizedAccess={(path, reason) => {
		analytics.track('unauthorized_access_attempt', { path, reason });
	}}
	enableLogging={process.env.NODE_ENV === 'development'}
>
	<App />
</GlobalRouteGuard>
```

## Best Practices

### 1. Defense in Depth

- Protect at multiple levels (route, page, component, API)
- Never rely solely on frontend protection
- Always validate permissions on the backend

### 2. User Experience

- Provide clear error messages explaining access requirements
- Offer alternative actions when possible
- Use fallback content rather than empty states

### 3. Performance

- Use programmatic checks for conditional rendering
- Avoid wrapping large component trees unnecessarily
- Consider route-level protection for page components

### 4. Maintainability

- Use convenience components for common patterns
- Define protection requirements in route config
- Keep role logic centralized in `lib/roles.ts`

## Migration Guide

### From Legacy Pattern

```tsx
// ❌ Old pattern
const { user } = useAuth();
if (!user?.isAdmin) return <Redirect to="/" />;

// ✅ New pattern
<RequireAdmin>
	<AdminContent />
</RequireAdmin>;
```

### From Manual Checks

```tsx
// ❌ Manual role checking
const canAccess = user?.role === 'admin' || user?.role === 'super_admin';

// ✅ Hierarchy-based checking
const canAccess = hasRoleAtLeast(user.role, 'admin');
```

## Security Considerations

1. **Backend Validation**: All frontend protection must be mirrored on the backend
2. **Role Enumeration**: Avoid exposing role hierarchy in client-side code
3. **Progressive Disclosure**: Show only relevant UI elements based on permissions
4. **Audit Logging**: Track access attempts for security monitoring

## Testing

```tsx
import { render } from '@testing-library/react';
import { RequireAdmin } from '@/components/auth';

// Mock auth context
const mockUser = { role: 'admin', username: 'test-admin' };

test('allows admin access', () => {
	render(
		<MockAuthProvider user={mockUser}>
			<RequireAdmin>
				<div>Admin content</div>
			</RequireAdmin>
		</MockAuthProvider>
	);

	expect(screen.getByText('Admin content')).toBeInTheDocument();
});
```

## Type Safety

The system provides full TypeScript support:

```tsx
// Type-safe role checking
const userRole: Role = 'admin';
const canAccess = hasRoleAtLeast(userRole, 'moderator'); // boolean

// Type-safe route config
const config: RouteConfig = {
	path: '/admin',
	minRole: 'admin', // Only valid Role types accepted
	exactRole: 'invalid_role' // ❌ TypeScript error
};
```
