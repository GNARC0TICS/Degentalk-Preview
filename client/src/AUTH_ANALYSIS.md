# AUTH ANALYSIS - Critical Issues & Inconsistencies

## 1. Multiple Auth Hooks Overview

### Primary Auth Hooks:
1. **`useAuth()`** - Main auth hook with development mode support
   - Location: `/src/hooks/use-auth.tsx`
   - Returns: Full auth context including user, login/logout mutations, role flags
   - Development mode: Auto-login with mock users
   - Router dependency: Handles navigation failures gracefully

2. **`useCanonicalAuth()`** - Enhanced auth with full user profiles
   - Location: `/src/features/auth/useCanonicalAuth.tsx`
   - Returns: CanonicalUser with forum stats, online status
   - Extends useAuth() with additional profile fetching
   - Type-safe with branded IDs

3. **`useAuthWrapper()`** - Simple wrapper (redundant)
   - Location: `/src/hooks/wrappers/use-auth-wrapper.ts`
   - Just returns useAuth() - NO VALUE ADD

## 2. Type Inconsistencies

### User Type Conflicts:
```typescript
// In use-auth.tsx (line 14)
export interface User {
  id: UserId;                    // Branded ID ✓
  role: Role;                    // From utils/roles ✓
  isAdmin: boolean;              // Computed field
  isModerator: boolean;          // Computed field
  // ... many other fields
}

// In types/user.ts (line 7) 
export interface User {
  id: string | UserId;           // MIXED TYPES! ✗
  role: string | BasicRole;      // MIXED TYPES! ✗
  isAdmin?: boolean;             // Optional! ✗
  isModerator?: boolean;         // Optional! ✗
  // ... fewer fields
}

// In types/canonical.types.ts (line 259)
export interface CanonicalUser {
  id: UserId;                    // Branded ID ✓
  role: BasicRole;               // Consistent ✓
  isAdmin: boolean;              // Required ✓
  isModerator: boolean;          // Required ✓
  // ... complete profile
}
```

### Import Conflicts:
- Some files import User from `@/hooks/use-auth` (full type)
- Others import from `@/types/user` (partial type)
- Type compatibility issues when mixing

## 3. Usage Patterns

### Inconsistent Hook Usage:
```typescript
// 48 files use useAuth()
const { user } = useAuth();

// 10 files use useCanonicalAuth()  
const { user } = useCanonicalAuth();

// 2 files use useAuthWrapper() (redundant)
const { user } = useAuthWrapper();
```

### Role Checking Inconsistencies:
```typescript
// Method 1: Direct role comparison
if (user?.role === 'admin') { }

// Method 2: Using isAdmin flag
if (user?.isAdmin) { }

// Method 3: Using permission helper
if (canAccessAdminPanel) { }
```

## 4. Router Dependencies

### Navigation Handling Issues:
```typescript
// In use-auth.tsx (lines 240-248)
let navigate: ReturnType<typeof useNavigate> | undefined;
try {
  navigate = useNavigate();
} catch (error) {
  // useNavigate was called outside of Router context
  navigate = undefined;
}
```

**Problem**: Hook tries to use React Router but may be called outside Router context

### Fallback Issues:
- Falls back to `window.location.href` which causes full page reload
- Loses React state and context

## 5. Development Mode Issues

### Auto-Login Confusion:
```typescript
// Development auto-login (lines 402-418)
if (isDevelopment && !isInitialLoading && !fetchedUser && !isLoggedOut && !userState) {
  const mockUser = mockUsers[currentMockRoleState] ?? mockUsers.user;
  setUserState(mockUser);
}
```

**Issues**:
- Auto-login can interfere with real auth testing
- Mock users have hardcoded IDs that may conflict
- Default to 'super_admin' gives too much access

### Session Storage Tracking:
- Uses `sessionStorage` to track logout state
- Can cause inconsistencies across tabs

## 6. Token Management

### Multiple Token Handlers:
1. `useAuth()` - Sets/removes tokens via mutations
2. `useAuthToken()` - Separate hook for token management
3. `apiRequest()` - Automatically adds Bearer token

**Issues**:
- Token expiration not consistently handled
- No automatic refresh mechanism
- Token stored in localStorage (XSS vulnerable)

## 7. API Integration Issues

### Query Key Patterns:
```typescript
// In use-auth.tsx
queryKey: ['/api/auth/user']  // URL-based key

// In useCanonicalAuth.tsx  
queryKey: ['canonicalUser', basicAuth.user?.id]  // Named key
```

**Inconsistent naming conventions**

### Error Handling:
- 401 responses configured to return null (via QueryClient)
- But some components still check for errors
- Inconsistent error state management

## 8. Critical Issues Summary

### MUST FIX:
1. **Type Conflicts**: Multiple User interfaces with incompatible types
2. **Router Dependency**: useAuth assumes Router context exists
3. **Token Security**: Tokens in localStorage are XSS vulnerable
4. **Import Chaos**: No clear import strategy for auth types

### SHOULD FIX:
1. **Redundant Hooks**: useAuthWrapper adds no value
2. **Dev Mode Defaults**: super_admin default too permissive
3. **Role Checking**: Multiple patterns for same check
4. **Hook Selection**: No clear guidance on which hook to use

### NICE TO FIX:
1. **Query Key Naming**: Inconsistent patterns
2. **Token Refresh**: No automatic token renewal
3. **Error Messages**: Generic error handling
4. **Performance**: Multiple queries for same user data

## 9. Recommended Actions

### Immediate:
1. Consolidate User types into single source
2. Remove useAuthWrapper completely
3. Fix Router dependency with provider check
4. Standardize role checking pattern

### Short Term:
1. Implement secure token storage (httpOnly cookies)
2. Add token refresh mechanism
3. Create auth hook selection guide
4. Improve error handling

### Long Term:
1. Migrate all components to useCanonicalAuth
2. Implement proper session management
3. Add auth state persistence
4. Create comprehensive auth tests