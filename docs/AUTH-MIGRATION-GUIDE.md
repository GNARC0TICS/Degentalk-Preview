# Authentication System Migration Guide

This guide helps developers understand the new authentication architecture and migrate from the old patterns.

## 🚨 What Changed (June 2025)

### Before: Multiple Conflicting Systems
- ❌ Multiple QueryClient instances with different 401 handling
- ❌ Deprecated `userGroups` schema still being used
- ❌ Mock user systems conflicting with real auth
- ❌ Inconsistent query keys (`['user']` vs `['/api/auth/user']`)
- ❌ Custom 401 error handling conflicting with QueryClient config

### After: Unified Authentication System  
- ✅ Single QueryClient in RootProvider with consistent 401 handling
- ✅ Unified `roles` schema (replaces `userGroups`)
- ✅ Clean auth state management with proper cache clearing
- ✅ URL-based query keys for consistency
- ✅ Centralized auth logic in `use-auth.tsx`

## 🔄 Migration Checklist

### 1. Update Schema Imports
```typescript
// ❌ Old - deprecated userGroups
import { userGroups } from '@schema';

// ✅ New - use roles
import { roles } from '@schema';
```

### 2. Update QueryClient Usage
```typescript
// ❌ Old - importing separate QueryClient
import { queryClient } from '@/lib/queryClient';

// ✅ New - use the one from provider via hook
import { useQueryClient } from '@tanstack/react-query';
const queryClient = useQueryClient();
```

### 3. Update Auth Query Keys
```typescript
// ❌ Old - generic keys
queryClient.setQueryData(['user'], userData);

// ✅ New - URL-based keys
queryClient.setQueryData(['/api/auth/user'], userData);
```

### 4. Remove Custom 401 Handling
```typescript
// ❌ Old - custom error handling
const { data } = useQuery({
  queryKey: ['user'],
  queryFn: async () => {
    try {
      return await apiRequest('/api/auth/user');
    } catch (error) {
      if (error.status === 401) return null;
      throw error;
    }
  }
});

// ✅ New - let QueryClient handle 401s
const { data } = useQuery({
  queryKey: ['/api/auth/user']
  // QueryClient automatically returns null for 401s
});
```

## 🏗️ Architecture Overview

### Component Hierarchy
```
App.tsx
├── RootProvider (QueryClient with on401: 'returnNull')
    ├── AuthProvider (auth state management)
        └── Your Components
            └── HeaderProvider (UI sync)
```

### Data Flow
```
1. User loads app
2. AuthProvider clears stale cache
3. useQuery fetches /api/auth/user
4. 401 → returns null (guest)
5. 200 → returns user data (authenticated)
6. HeaderContext syncs with auth state
7. UI shows appropriate elements
```

## 🔧 Common Migration Issues

### Issue: "userGroups not found"
```typescript
// ❌ Problem
import { userGroups } from '@schema';

// ✅ Solution  
import { roles } from '@schema';
// Note: userGroups is now an alias for roles
```

### Issue: "Multiple auth providers"
```typescript
// ❌ Problem - Don't wrap with AuthProvider again
function MyComponent() {
  return (
    <AuthProvider>  // ❌ Already exists in RootProvider
      <SomeContent />
    </AuthProvider>
  );
}

// ✅ Solution - Just use the hook
function MyComponent() {
  const { user, isAuthenticated } = useAuth();
  return <SomeContent />;
}
```

### Issue: "Login button flickers to authenticated UI"
```typescript
// ❌ Problem - Stale cached data
// This happens when old auth data is cached

// ✅ Solution - Clear browser cache or add cache clearing
React.useEffect(() => {
  queryClient.removeQueries({ queryKey: ['/api/auth/user'] });
}, []);
```

## 🛠️ Development Environment Setup

### Required Environment Variables
```bash
# env.local
NODE_ENV=development
DEV_FORCE_AUTH=true          # Force real authentication
DEV_BYPASS_PASSWORD=false    # Disable password bypass  
VITE_FORCE_AUTH=true         # Frontend auth enforcement
```

### Testing Auth States
```typescript
// Test auth state in browser console
console.log('[AUTH]', {
  user: window.__REACT_QUERY_STATE__?.queries?.find(q => 
    q.queryKey[0] === '/api/auth/user'
  )?.state?.data,
  isAuthenticated: !!user
});
```

## 📋 File Changes Summary

### Archived Files (moved to `archive/auth-cleanup-2025-06-26/`)
- `scripts/auth/` - Temporary refactor scripts
- `complete-auth-reset.js` - Browser reset script

### Updated Files
- `client/src/providers/root-provider.tsx` - Documented QueryClient config
- `client/src/hooks/use-auth.tsx` - Unified auth logic with comments
- `client/src/components/header/HeaderContext.tsx` - Proper auth sync
- `db/schema/*/` - Replaced userGroups with roles references
- `server/src/domains/admin/*/` - Updated schema imports

### Key Configuration
- **QueryClient**: `on401: 'returnNull'` in RootProvider
- **Auth Hook**: URL-based query keys
- **Header Context**: Uses `isAuthenticated` flag from auth hook

## 🚀 Benefits of New System

1. **Consistency**: Single source of truth for auth state
2. **Debugging**: Clear auth flow with debug logging
3. **Performance**: Proper cache management
4. **Maintainability**: Centralized auth logic
5. **Reliability**: No more auth state conflicts

## 🆘 Troubleshooting

### Clear Auth Cache Completely
```javascript
// Run in browser console
sessionStorage.clear();
localStorage.clear();
// Then reload page
location.reload();
```

### Check Current Auth State
```javascript
// Browser console debug
const authQuery = window.__REACT_QUERY_STATE__?.queries?.find(q => 
  q.queryKey[0] === '/api/auth/user'
);
console.log('Auth Query State:', authQuery?.state);
```

### Reset Development Environment
```bash
# Clear all caches and restart
npm run kill-ports
rm -rf node_modules/.cache
npm run dev
```

---

**Migration completed**: June 26, 2025  
**Next review**: End of Q3 2025 for further optimizations