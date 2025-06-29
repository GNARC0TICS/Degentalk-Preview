# 🔍 Legacy Service Removal Audit --uc

**Generated:** 2025-06-29 | **Mode:** Pre-Phase 3 verification

## Legend

| Symbol | Meaning                  |     | Risk | Count       |
| ------ | ------------------------ | --- | ---- | ----------- |
| 🔥     | Safe to remove           |     | H    | High risk   |
| ⚠️     | Check dependencies       |     | M    | Medium risk |
| 🛡️     | Preserve (visual-config) |     | L    | Low risk    |

## 🎯 **Visual-Config Protected Services** 🛡️

### **Confirmed Preserved**

- `useJsonConfig` hook → Powers visual-config system
- `VisualJsonTabs` component → Core visual-config UI
- `/admin/brand-config`, `/admin/feature-flags`, `/admin/ui-config` endpoints
- All config files referenced by visual-config pages

## 🔍 **Legacy Pattern Analysis**

### **getUser Pattern Proliferation** (146 files found)

#### **Safe Consolidation Candidates** 🔥

- `getUserFromRequest` in permissions service → Already centralized
- Scattered auth user fetching in controllers → Can centralize
- Manual user object construction → Replace with service

#### **Files Requiring Verification** ⚠️

```
server/src/domains/admin/sub-domains/*/
├── database.controller.ts
├── users.controller.ts
├── analytics.controller.ts
├── treasury.controller.ts
└── reports.controller.ts
```

#### **Frontend User Fetching** 🔥

```
client/src/features/*/
├── forumApi.ts
├── usersApi.ts
├── gamification-api.service.ts
└── useActivityFeed.ts
```

### **Config Interface Duplication** (82+ files)

#### **Safe Consolidation Targets** 🔥

- Repeated config shape definitions
- Scattered type interfaces across domains
- Duplicate validation schemas

#### **Visual-Config Interfaces** 🛡️ (PRESERVE)

- Brand config schema
- UI config schema
- Feature flags schema
- `useJsonConfig` return types

### **Error Handling Patterns** (95+ files)

#### **Duplicate Try/Catch Blocks** 🔥

- Manual error response construction
- Repeated logger.error patterns
- Inconsistent error formatting

#### **Consolidation Strategy**

- Shared error response utilities
- Centralized error logging service
- Standard error format types

## 📋 **Proposed Removal List** (Awaiting Approval)

### **Phase 3A: User Service Consolidation**

**Target:** Replace 141 getUser implementations

**Safe to Remove:**

1. Manual user fetching in non-admin controllers
2. Scattered auth user construction
3. Duplicate user validation logic

**Preserve:**

- Admin controllers (may reference visual-config)
- `getUserFromRequest` in permissions.service (already optimized)
- Auth service core functionality

### **Phase 3B: Config Interface Standardization**

**Target:** 82 config interface files

**Safe to Remove:**

1. Duplicate config shape definitions
2. Scattered domain-specific config types
3. Redundant validation interfaces

**Preserve:**

- Visual-config schema files
- `useJsonConfig` type definitions
- Active config file types

### **Phase 3C: Error Handling Unification**

**Target:** 95+ error pattern files

**Safe to Remove:**

1. Manual error response construction
2. Duplicate logger patterns
3. Inconsistent error formatting

**Preserve:**

- Visual-config error handling
- Admin-specific error patterns
- Authentication error flows

## 🚨 **Verification Required Before Removal**

### **Admin Controllers Check**

Before removing any admin domain services, verify they're not:

- Referenced by visual-config pages
- Used by `useJsonConfig` hook
- Part of new admin REST endpoints

### **Import Path Impact**

Before consolidating config interfaces:

- Check visual-config component imports
- Verify schema file references
- Ensure no breaking changes to UI

### **Error Handling Dependencies**

Before standardizing error patterns:

- Preserve visual-config error flows
- Maintain admin-specific responses
- Keep auth error handling intact

## 🎯 **Execution Strategy**

### **Phase 3A: User Service** (Risk: M)

1. Create centralized `UserService`
2. Replace non-admin getUser patterns
3. Test all user fetching flows
4. Preserve admin & visual-config usage

### **Phase 3B: Config Types** (Risk: L)

1. Create shared config interfaces
2. Migrate non-visual-config files
3. Preserve visual-config schemas
4. Update import paths carefully

### **Phase 3C: Error Utils** (Risk: L)

1. Create shared error utilities
2. Migrate standard error patterns
3. Preserve admin/auth error flows
4. Test visual-config error handling

**Estimated Impact:** 500KB code reduction, improved maintainability
**Risk Mitigation:** Incremental changes, preserve visual-config infrastructure

---

**📋 Awaiting approval for Phase 3A execution:** UserService consolidation with admin controller preservation
**🛡️ Visual-config system:** Fully protected throughout deduplication process
