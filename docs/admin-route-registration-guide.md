# Admin Route Registration Guide

## Overview

This document explains how admin routes are organized and registered in the Degentalk backend, ensuring all admin subdomain routes are properly accessible via the `/api/admin/*` path.

## Architecture

### Main Admin Router Structure

```
/api/admin/
├── /users          → User management
├── /treasury       → Treasury operations
├── /reports        → Content moderation
├── /analytics      → Platform analytics
├── /user-groups    → Role management
├── /forum          → Forum administration
├── /settings       → Platform settings
├── /xp             → XP system management
├── /missions       → Mission management
├── /announcements  → Announcement management
├── /airdrop        → Airdrop operations
├── /shop-management → Shop administration
├── /user-inventory → User inventory management
└── /emojis         → Custom emoji management
```

## Registration Pattern

### 1. Sub-domain Route Files

Each admin subdomain follows this structure:

```
server/src/domains/admin/sub-domains/{subdomain}/
├── {subdomain}.routes.ts    → Route definitions
├── {subdomain}.controller.ts → Request handlers
└── {subdomain}.service.ts   → Business logic
```

### 2. Central Admin Router

File: `server/src/domains/admin/admin.routes.ts`

```typescript
import { Router } from 'express';
import { isAdmin } from './admin.middleware';

// Import all subdomain routes
import userRoutes from './sub-domains/users/users.routes';
import emojiRoutes from './sub-domains/emojis/emojis.routes';
// ... other imports

const adminRouter = Router();

// Apply admin authentication to ALL routes
adminRouter.use(isAdmin);

// Mount subdomain routes
adminRouter.use('/users', userRoutes);
adminRouter.use('/emojis', emojiRoutes);
// ... other mounts

// Export registration function
export function registerAdminRoutes(app) {
  app.use('/api/admin', adminRouter);
}
```

### 3. Main Route Registration

File: `server/routes.ts`

```typescript
import { registerAdminRoutes } from './src/domains/admin/admin.routes';

export async function registerRoutes(app: Express): Promise<Server> {
  // ... other middleware setup
  
  // Register admin routes - CRITICAL!
  registerAdminRoutes(app);
  
  // ... other route registrations
}
```

## Critical Points

### ⚠️ Common Issues

1. **Missing Registration Call**
   - **Problem**: 404 on all `/api/admin/*` routes
   - **Cause**: `registerAdminRoutes(app)` not called in `server/routes.ts`
   - **Fix**: Add the registration call

2. **Authentication Middleware**
   - All admin routes require `isAdmin` middleware
   - Applied once at the router level, not per route
   - Dev mode bypasses authentication (configurable)

3. **Route Order Matters**
   - Admin routes must be registered before the global error handler
   - Place `registerAdminRoutes(app)` early in the registration sequence

### ✅ Verification Steps

1. **Check Registration**

   ```bash
   grep -n "registerAdminRoutes" server/routes.ts
   ```

   Should show the function being called.

2. **Test Endpoint**

   ```bash
   curl -X POST http://localhost:5001/api/admin/emojis \
     -H "Content-Type: application/json" \
     -d '{"name":"test","code":"test","url":"test","type":"static"}'
   ```

3. **Check Server Logs**
   Look for debug messages:

   ```
   ADMIN ROUTER: Request received for /api/admin/emojis
   POST /api/admin/emojis hit (controller) with body: {...}
   ```

## Debugging Admin Routes

### Enable Debug Logging

Some admin routes have debug middleware:

```typescript
adminRouter.use('/emojis', (req, res, next) => {
  console.log(`ADMIN ROUTER: Request received for /api/admin${req.url}`);
  console.log(`ADMIN ROUTER: Method: ${req.method}`);
  next();
});
```

### Common Debug Steps

1. Verify the main router registration
2. Check individual subdomain route exports
3. Confirm middleware order
4. Test authentication bypass in development

## Adding New Admin Subdomains

1. **Create subdomain structure**:

   ```
   server/src/domains/admin/sub-domains/new-feature/
   ├── new-feature.routes.ts
   ├── new-feature.controller.ts
   └── new-feature.service.ts
   ```

2. **Import and mount in admin.routes.ts**:

   ```typescript
   import newFeatureRoutes from './sub-domains/new-feature/new-feature.routes';
   adminRouter.use('/new-feature', newFeatureRoutes);
   ```

3. **Test the new endpoint**:

   ```
   /api/admin/new-feature/*
   ```

## Security Considerations

- All admin routes are protected by `isAdmin` middleware
- Authentication is checked at the router level
- Development mode can bypass authentication (check `admin.middleware.ts`)
- Rate limiting may apply globally

## Related Files

- `server/src/domains/admin/admin.routes.ts` - Main admin router
- `server/src/domains/admin/admin.middleware.ts` - Authentication middleware
- `server/routes.ts` - Central route registration
- `server/src/domains/admin/sub-domains/*/` - Individual admin features

---

**Last Updated**: 2025-01-27  
**Status**: Active - Used for all admin functionality
