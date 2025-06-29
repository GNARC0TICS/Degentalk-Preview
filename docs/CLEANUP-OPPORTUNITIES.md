# Codebase Cleanup Opportunities

**Scan Date**: 2025-06-29  
**Scope**: Backend server code (`server/src/`)  
**Priority**: Post-migration cleanup recommendations

## 🚨 High Priority Issues

### 1. Console.log Usage in Production Code
**Location**: `domains/auth/controllers/auth.controller.ts`, `domains/auth/auth.routes.ts`

```typescript
// ❌ Found multiple console.log statements in auth controller
console.log('🔐 Login attempt for username:', req.body.username);
console.log('🔍 Passport authenticate callback:', { err: !!err, user: !!user, info });
console.log('❌ Authentication error:', err);
```

**Fix**: Replace with proper logger
```typescript
// ✅ Should be
logger.info('Login attempt', { username: req.body.username });
logger.debug('Passport authenticate callback', { hasError: !!err, hasUser: !!user, info });
logger.error('Authentication error', err);
```

**Impact**: Security risk (credentials in logs), performance issues

### 2. Deprecated Code Still Present
**Locations**:
- `domains/wallet/dgt.service.ts:245` - `@deprecated – use debitDGT`
- `utils/auth.ts:6` - `@deprecated Use userService.getUserFromRequest() instead`

**Action**: Remove deprecated code and update any remaining usage

## 🔧 Medium Priority Issues

### 3. TypeScript `any` Usage
**Patterns Found**:
```typescript
// middleware/authenticate.ts:35
const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;

// middleware/auth.ts:13  
export const requireAdmin = (req: any, res: any, next: any) => {
```

**Fix**: Add proper typing
```typescript
// ✅ Better typing
const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
```

### 4. TODO Comments Accumulation
**Count**: 15+ TODO comments found

**Categories**:
- **Gamification**: 10 TODOs for missing integrations (DGT, Clout, Likes systems)
- **Auth**: 3 TODOs for session management improvements  
- **General**: 2 TODOs for cleanup tasks

**Example**:
```typescript
// domains/gamification/achievement.service.ts:513
// TODO: Implement when likes system is available

// domains/gamification/achievements/achievement-processor.service.ts:437
// TODO: Integrate with DGT service
```

### 5. Namespace Imports vs Named Imports
**Pattern Found**:
```typescript
// missions/missions.routes.ts:4
import * as missionsController from './missions.controller';

// admin/sub-domains/database/database.routes.ts:9
import * as databaseController from './database.controller';
```

**Recommendation**: Consider specific named imports for better tree-shaking

## 🛠️ Low Priority Issues

### 6. Unhandled Promise Rejections
**Locations**:
```typescript
// middleware/mission-progress.ts:35
updateMissionProgress(userId, actionType, req, getMetadata).catch((err) => {
    logger.error('Failed to update mission progress', err);
});
```

**Status**: Actually handled properly with logger - not an issue ✅

### 7. Auth Index File Cleanup
**Location**: `domains/auth/index.ts:16`
```typescript
// TODO: Remove the original file after migration is complete
```

**Action**: Clean up post-migration files

## 📋 Recommended Cleanup Plan

### Phase 1: Critical Security & Performance
```bash
# 1. Replace console.log with logger in auth files
# Priority: IMMEDIATE
# Files: auth.controller.ts, auth.routes.ts
```

### Phase 2: Remove Deprecated Code  
```bash
# 2. Remove @deprecated functions
# Priority: HIGH  
# Files: dgt.service.ts, utils/auth.ts
```

### Phase 3: TypeScript Improvements
```bash
# 3. Fix 'any' types with proper interfaces
# Priority: MEDIUM
# Files: authenticate.ts, auth.ts middleware
```

### Phase 4: TODO Cleanup Sprint
```bash
# 4. Address gamification TODOs or convert to issues
# Priority: MEDIUM
# Scope: 10+ TODO comments in gamification domain
```

## 🎯 Quick Wins (30 min fixes)

1. **Auth Console Logs** → Replace with logger (5 min)
2. **Remove deprecated utils/auth.ts** → Already marked deprecated (2 min)  
3. **Auth index.ts cleanup** → Remove TODO comment (1 min)
4. **Type middleware parameters** → Add proper Request/Response types (10 min)

## 📊 Cleanup Impact

| Category | Files Affected | Effort | Impact |
|----------|---------------|--------|--------|
| Console.log removal | 2 | Low | High (Security) |
| Deprecated code | 2 | Low | Medium (Maintenance) |
| TypeScript any | 5 | Medium | Medium (Type Safety) |
| TODO resolution | 10+ | High | Low (Documentation) |

## 🚀 Next Steps

1. **Immediate**: Fix auth console.log statements
2. **This week**: Remove deprecated code  
3. **Next sprint**: TypeScript improvements
4. **Backlog**: TODO comment resolution or conversion to GitHub issues

---

**Note**: This scan focused on technical debt and code quality. The legacy user-fetch migration revealed these additional cleanup opportunities in the codebase.