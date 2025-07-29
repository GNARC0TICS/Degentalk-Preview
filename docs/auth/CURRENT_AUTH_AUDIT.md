# DegenTalk Authentication System Audit

## Executive Summary

This audit maps all authentication touchpoints in the current DegenTalk codebase to inform the Lucia Auth migration. The system currently uses a hybrid approach with Passport.js sessions, JWT tokens, and development mock users.

## Current Authentication Architecture

### 1. Client-Side Authentication (`client/src/hooks/use-auth.tsx`)

**Primary Authentication Hook**
- **Location**: `client/src/hooks/use-auth.tsx:471`
- **Type**: React Context with TanStack Query integration
- **State Management**: React useState + useQuery caching
- **Features**:
  - Mock user system for development (4 roles: user, moderator, admin, super_admin)
  - JWT token storage in localStorage via `setAuthToken()`
  - Session-based fallback via TanStack Query
  - Role-based permission computed properties
  - Development mode role switching

**Key Properties**:
```typescript
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login/logout/register: () => void;
  // Role permissions
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isModerator: boolean;
  canAccessAdminPanel: boolean;
  // Dev mode
  isDevMode: boolean;
  currentMockRole: MockRole | null;
  setMockRole: (role: MockRole) => void;
}
```

### 2. Archived/Deprecated Authentication

**Canonical Auth (Archived)**
- **Location**: `client/src/archive/features/auth/useCanonicalAuth.tsx`
- **Status**: Deprecated compatibility layer
- **Purpose**: Transformed regular User to CanonicalUser for forum components
- **Note**: Should be completely removed during Lucia migration

### 3. Server-Side Authentication Middleware

**Unified Auth Middleware**
- **Location**: `server/src/middleware/auth.unified.ts:54`
- **Core Function**: `authenticateRequest()` - Multi-strategy auth validation
- **Strategies**:
  1. Check existing `req.user` (session middleware)
  2. JWT token validation (`Authorization: Bearer <token>`)
  3. Passport.js session validation
  4. Development mode bypass

**Available Middleware Functions**:
- `authenticate` - Optional auth (attaches user if present)
- `requireAuth` - Mandatory authentication
- `requireAdmin` - Admin role required
- `requireModerator` - Moderator+ role required
- `requireJWT` - JWT-only authentication
- `requireSession` - Session-only authentication

### 4. Domain-Specific Auth Middleware

**Auth Domain Middleware**
- **Location**: `server/src/domains/auth/middleware/auth.middleware.ts`
- **Purpose**: Re-exports unified middleware for backward compatibility
- **Special**: Includes `devModeAuthHandler` for development role switching

### 5. Authentication Routes & Controllers

**Main Auth Routes**
- **Location**: `server/src/domains/auth/auth.routes.ts`
- **Passport Integration**: Full LocalStrategy setup with user serialization
- **Endpoints**:
  - `POST /register` - User registration
  - `POST /login` - Passport.js authentication
  - `POST /logout` - Session destruction
  - `GET /user` - Current user retrieval
  - `GET /verify-email` - Email verification
  - `POST /resend-verification` - Resend verification email
  - `GET /dev-mode/set-role` - Development role switching

**Passport.js Configuration**:
- LocalStrategy with username/password
- User serialization/deserialization
- Development password bypass (`DEV_BYPASS_PASSWORD=true`)
- Session configuration with express-session

### 6. Database Schema

**Users Table**
- **Location**: `db/schema/user/users.ts`
- **Primary Key**: `user_id` (UUID)
- **Auth Fields**:
  - `username` (TEXT, unique)
  - `email` (TEXT, unique) 
  - `password_hash` (TEXT)
  - `is_active` (BOOLEAN)
  - `is_verified` (BOOLEAN)
  - `is_banned` (BOOLEAN)
  - `role` (ENUM: user, moderator, admin, super_admin)

**Session Storage**: Currently uses express-session (in-memory or Redis)

## Authentication Flows

### 1. Login Flow

**Client-Side**:
1. User submits credentials via `login()` from `useAuth()`
2. `loginMutation` calls `/api/auth/login`
3. On success: stores JWT token + updates user state
4. TanStack Query caches user data

**Server-Side**:
1. `POST /login` → Passport LocalStrategy
2. Database user lookup + password verification
3. Passport session creation
4. JWT token generation (optional)
5. User object returned

### 2. Session Validation Flow

**Client-Side**:
1. App startup → `useQuery(['/api/auth/user'])`
2. Automatic JWT token inclusion in requests
3. Fallback to session cookies

**Server-Side**:
1. `authenticateRequest()` tries multiple strategies:
   - Existing `req.user` from session middleware
   - JWT token from `Authorization` header
   - Passport session validation
   - Dev mode bypass (if enabled)

### 3. Development Mode Flow

**Client-Side**:
1. Environment check: `isDevelopment && !VITE_FORCE_AUTH`
2. Auto-login with mock user based on `currentMockRoleState`
3. Role switching via `setMockRole()`

**Server-Side**:
1. Development bypass in LocalStrategy
2. Mock user creation in deserializer
3. Dev role switching endpoint

## Protected Routes & Components

### Server-Side Protection

**Files Using Auth Middleware** (sample):
- `server/src/domains/forum/forum.routes.ts` - Forum operations
- `server/src/domains/admin/admin.routes.ts` - Admin functions
- `server/src/domains/profile/profile.routes.ts` - User profiles
- `server/src/domains/shop/shop.routes.ts` - Shop operations

**Common Patterns**:
```typescript
router.get('/protected', requireAuth, controller.handler);
router.get('/admin-only', requireAdmin, controller.handler);
router.get('/mod-only', requireModerator, controller.handler);
```

### Client-Side Protection

**Files Using `useAuth()`** (sample):
- `client/src/components/widgets/ProfileCardWidget.tsx`
- `client/src/features/forum/components/CreateThreadForm.tsx`
- `client/src/features/forum/components/PostCard.tsx`
- `client/src/pages/forums/index.tsx`

**Common Patterns**:
```typescript
const { user, isAuthenticated, isAdmin } = useAuth();
if (!isAuthenticated) return <LoginPrompt />;
if (isAdmin) return <AdminFeatures />;
```

## Session & Token Management

### JWT Token System
- **Storage**: localStorage via `setAuthToken()`/`removeAuthToken()`
- **Location**: `client/src/utils/auth-token.ts`
- **Usage**: Automatic inclusion in API requests
- **Validation**: Server-side via `verifyToken()` + database lookup

### Session Cookies
- **Framework**: express-session with Passport.js
- **Storage**: In-memory (dev) or Redis (production)
- **Cookie Config**: HTTP-only, secure in production
- **Serialization**: User ID only, full user loaded on deserialize

### Development Session Management
- **Mock Users**: 4 predefined users with different roles
- **Role Switching**: Runtime role changes without re-authentication
- **Session Persistence**: `sessionStorage` for logout state

## Current Issues & Technical Debt

### 1. Authentication Complexity
- **Hybrid System**: JWT + Sessions creates confusion
- **Multiple Strategies**: 4 different auth validation paths
- **Inconsistent State**: Client/server auth state can diverge

### 2. Development Experience
- **Mock System**: Complex mock user management
- **Role Switching**: Manual role switching not seamless
- **Debug Difficulty**: Hard to trace auth failures

### 3. Security Concerns
- **JWT Storage**: localStorage susceptible to XSS
- **Development Bypass**: Potential production leakage
- **Session Fixation**: No session regeneration on login

### 4. Performance Issues
- **Multiple DB Queries**: User lookup on every request
- **Session Storage**: In-memory sessions don't scale
- **No Caching**: Repeated user permission calculations

### 5. Code Maintenance
- **Deprecated Code**: `useCanonicalAuth` still referenced
- **Inconsistent Types**: Multiple user type definitions
- **Legacy Patterns**: Old Passport.js patterns mixed with modern hooks

## Dependencies & External Services

### Current Dependencies
```json
{
  "passport": "^0.6.0", 
  "passport-local": "^1.0.0",
  "express-session": "^1.17.3",
  "jsonwebtoken": "^9.0.0",
  "@tanstack/react-query": "^4.x"
}
```

### Database Dependencies
- **Drizzle ORM**: For database queries
- **PostgreSQL**: Primary database
- **Neon**: Database hosting (connection pooling issues noted)

## Migration Readiness Assessment

### ✅ Migration-Friendly Aspects
- Clean user schema with UUIDs
- Drizzle ORM already in use
- Proper TypeScript types
- Modular middleware structure
- TanStack Query for client state

### ⚠️ Migration Challenges
- Complex development mock system
- Multiple authentication strategies to consolidate
- Extensive middleware usage throughout codebase
- Client-side role permission calculations
- Session cookie name changes will log out all users

### 🔧 Required Changes
- Replace Passport.js with Lucia session management
- Consolidate JWT + session auth into Lucia sessions
- Migrate development mock system
- Update all middleware usage
- Client-side auth hook refactoring

## Recommendations for Lucia Migration

### 1. Preserve Development Experience
- Implement Lucia-compatible development mock system
- Maintain role switching functionality
- Keep similar permission calculation patterns

### 2. Minimize Breaking Changes
- Maintain similar `useAuth()` hook interface
- Preserve role-based permission properties
- Keep TanStack Query integration

### 3. Improve Security
- Move from localStorage JWT to HTTP-only cookies
- Implement proper session rotation
- Add CSRF protection
- Remove development bypass vulnerabilities

### 4. Maintain Performance
- Implement session caching
- Optimize user permission calculations
- Use Lucia's built-in session validation

### 5. Cleanup Opportunities
- Remove deprecated `useCanonicalAuth`
- Consolidate user type definitions
- Remove Passport.js dependencies
- Simplify middleware chain