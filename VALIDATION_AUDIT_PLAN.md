# API Validation Audit & Implementation Plan

## Current State Analysis

### ✅ Well-Validated Domains

- **Forum** (`/api/forum/*`) - Complete Zod validation with `validateRequest` middleware
- **Wallet** (`/api/wallet/*`) - Complete Zod validation with rate limiting
- **Some Auth routes** - Partial validation, register() uses Zod parsing

### ❌ Missing Validation (135+ instances)

Based on analysis of 100+ route files, the following domains lack proper input validation:

#### High Priority (Public/Sensitive Routes)

1. **Preferences Routes** (`preferences.routes.ts`) - 5 unvalidated `req.body` usages
2. **Auth Controller** (`auth.controller.ts`) - Login function logs raw `req.body.username`
3. **CCPayment Webhook** (`ccpayment-webhook.controller.ts`) - Raw webhook body processing
4. **Shop Routes** (`shop.routes.ts`, `cosmetics.routes.ts`) - Commerce operations
5. **Admin Routes** (Multiple files) - Administrative functions
6. **Social Features** (`relationships.routes.ts`, `mentions.routes.ts`) - User interactions

#### Medium Priority (Internal/Authenticated)

7. **User Management** (`user-preferences.routes.ts`) - User settings
8. **Engagement Features** (`vault.routes.ts`) - Gamification
9. **Forum Rules** (`rules.routes.ts`) - Forum management
10. **Analytics** (`stats.routes.ts`) - Data collection

## Implementation Strategy

### Phase 1: Create Validation Infrastructure

- [ ] Create consistent validation schema structure
- [ ] Standardize error response format
- [ ] Update existing `validateRequest` middleware if needed

### Phase 2: High Priority Routes (Security Critical)

- [ ] Auth routes - Login/register validation
- [ ] CCPayment webhook validation (financial)
- [ ] Admin routes validation (privilege escalation risk)
- [ ] Shop/commerce routes (financial transactions)

### Phase 3: User-Facing Routes

- [ ] Preferences and settings
- [ ] Social features (mentions, relationships)
- [ ] User management endpoints

### Phase 4: Internal Routes

- [ ] Analytics and reporting
- [ ] Engagement/gamification features
- [ ] Administrative tools

## Technical Approach

### 1. Schema Organization

```
server/src/domains/[domain]/validation/
├── [domain].validation.ts     # Main validation schemas
├── [feature].validation.ts    # Feature-specific schemas
└── common.validation.ts       # Shared validation utilities
```

### 2. Consistent Error Format

```typescript
// Standard error response
return res.status(400).json({
	error: 'Invalid input',
	details: validation.error.issues // Zod error details
});
```

### 3. Migration Pattern

```typescript
// BEFORE (vulnerable)
router.post('/endpoint', async (req, res) => {
	const data = req.body; // Direct access
	// ... process data
});

// AFTER (secure)
router.post('/endpoint', validateRequest(schemas.endpoint), async (req, res) => {
	// req.body is now validated
	// ... process data
});
```

## Files Requiring Immediate Attention

1. `/server/src/domains/preferences/preferences.routes.ts` - 5 violations
2. `/server/src/domains/auth/controllers/auth.controller.ts` - Authentication security
3. `/server/src/domains/ccpayment-webhook/ccpayment-webhook.controller.ts` - Financial security
4. `/server/src/domains/shop/shop.routes.ts` - Commerce security
5. `/server/src/domains/admin/` (multiple files) - Administrative security

## Success Criteria

- [ ] Zero raw `req.body`/`req.query`/`req.params` usage without validation
- [ ] All public endpoints have input validation
- [ ] All sensitive endpoints (auth, financial, admin) have strict validation
- [ ] Consistent error response format across all routes
- [ ] Comprehensive test coverage for validation logic
