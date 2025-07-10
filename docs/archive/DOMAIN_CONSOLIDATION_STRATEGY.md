# Domain Consolidation Strategy

## Executive Summary

Based on comprehensive analysis of 29 server domains, 14 schema domains, scattered client organization, and mixed shared resources, we need systematic domain consolidation to achieve a clean, maintainable codebase.

## Current State Assessment

### **Critical Issues Identified**

1. **Server Domain Chaos**: 147 files in admin domain alone, inconsistent organization patterns
2. **Schema-Server Misalignment**: Missing schema domains for auth, notifications, engagement  
3. **Client Fragmentation**: Domain logic scattered across components/, hooks/, and incomplete features/
4. **Shared Logic Pollution**: Domain-specific business logic polluting shared/ directory

### **Domain Priority Matrix**

| Domain | Server Files | Schema Tables | Client Organization | Business Impact | Cleanup Priority |
|--------|--------------|---------------|-------------------|-----------------|------------------|
| **Admin** | 147 | 18 | Mixed | Critical | **P0 - CRITICAL** |
| **User/Auth** | 12 | 19 | Scattered | Critical | **P0 - CRITICAL** |
| **Forum** | 22 | 21 | Good | High | **P1 - HIGH** |
| **Economy/Wallet** | 32 | 32 | Mixed | High | **P1 - HIGH** |
| **Gamification** | 22 | 7 | Decent | Medium | **P2 - MEDIUM** |
| **Social** | 12 | 3 | Scattered | Medium | **P2 - MEDIUM** |
| **Messaging** | 5 | 8 | Missing | Low | **P3 - LOW** |

## Strategic Consolidation Plan

### **Phase 1: Foundation & Critical Domains (Week 1-2)**

#### **Step 1: Admin Domain Restructure**
**Current**: 147 files across 37 sub-domains with inconsistent organization  
**Target**: Clean, standardized structure with proper boundaries

```
server/src/domains/admin/
├── config/
│   ├── module-registry.ts (from shared/)
│   └── admin.config.ts (from shared/)
├── types/
│   ├── index.ts (new)
│   ├── analytics.types.ts
│   ├── settings.types.ts
│   └── user-management.types.ts
├── lib/
│   ├── permissions.ts
│   └── audit.ts
├── routes/
├── controllers/
├── services/
└── sub-domains/
    ├── analytics/
    ├── settings/
    ├── users/
    └── ... (standardized structure)
```

#### **Step 2: User/Auth Domain Consolidation**
**Current**: Auth scattered, user domain incomplete  
**Target**: Unified identity and authentication domain

```
server/src/domains/auth/
├── types/
│   ├── auth.types.ts
│   └── permissions.types.ts
├── lib/
│   ├── canUser.ts (from shared/)
│   └── auth-utils.ts
├── middleware/
├── services/
└── routes/

server/src/domains/user/
├── types/
│   ├── user.types.ts
│   ├── profile.types.ts
│   └── preferences.types.ts
├── lib/
├── services/
└── routes/
```

### **Phase 2: Core Business Domains (Week 3-4)**

#### **Step 3: Forum Domain Optimization**
**Current**: Good structure but needs types and cleanup  
**Target**: Complete, self-contained forum domain

```
server/src/domains/forum/
├── types/
│   ├── forum.types.ts
│   ├── thread.types.ts
│   └── post.types.ts
├── lib/
│   ├── forum-utils.ts (from shared/)
│   ├── prefix-engine.ts (from shared/)
│   └── xp-awards.ts (from shared/)
├── services/
├── controllers/
└── routes/
```

#### **Step 4: Economy/Wallet Unification**
**Current**: Split between economy and wallet domains  
**Target**: Unified financial domain with clear sub-domains

```
server/src/domains/economy/
├── types/
│   ├── transaction.types.ts
│   ├── wallet.types.ts
│   └── shop.types.ts
├── lib/
│   ├── clout-calculator.ts (from shared/)
│   ├── reward-calculator.ts (from shared/)
│   └── wallet-utils.ts (from shared/)
├── sub-domains/
│   ├── wallets/
│   ├── transactions/
│   ├── shop/
│   └── xp/
└── config/
    └── economy.config.ts (from shared/)
```

### **Phase 3: Client Domain Alignment (Week 5-6)**

#### **Step 5: Client Domain Reorganization**
**Current**: Scattered across components/, hooks/, mixed features/  
**Target**: Aligned with server domain structure

```
client/src/features/
├── admin/
│   ├── components/
│   ├── hooks/
│   ├── services/
│   └── types/
├── auth/
│   ├── components/ (from /components/auth/)
│   ├── hooks/ (from /hooks/use-auth.tsx)
│   └── services/
├── forum/
│   ├── components/ (from /components/forum/)
│   ├── hooks/
│   └── services/
├── economy/
│   ├── components/ (from /components/economy/)
│   ├── hooks/ (from /hooks/use-wallet.ts, useXP.ts)
│   └── services/
└── ...
```

### **Phase 4: Schema & Shared Cleanup (Week 7)**

#### **Step 6: Schema Domain Alignment**
**Current**: Missing schema domains, misaligned with server  
**Target**: 1:1 alignment between schema and server domains

```
db/schema/
├── auth/ (new)
├── notifications/ (extract from system/)
├── engagement/ (new)
└── ... (aligned with server domains)
```

#### **Step 7: Shared Resource Cleanup**
**Current**: Domain logic polluting shared/  
**Target**: Only truly cross-domain resources in shared/

```
shared/
├── types/ (keep - truly shared)
├── utils/ (keep - generic utilities)
├── validation/ (keep - common validation)
├── constants.ts (keep - platform constants)
└── enums/ (keep - shared enums)

# REMOVE from shared/ (move to domains):
# - lib/forum/ → server/src/domains/forum/lib/
# - lib/admin-module-registry.ts → server/src/domains/admin/lib/
# - config/admin.config.ts → server/src/domains/admin/config/
# - economy/ business logic → server/src/domains/economy/lib/
```

## Implementation Strategy

### **Daily Execution Plan**

#### **Week 1: Critical Foundation**
- **Day 1-2**: Admin domain restructure (remove 26 .bak files, organize sub-domains)
- **Day 3-4**: User/Auth domain consolidation (move shared auth logic)
- **Day 5**: Types cleanup and standardization

#### **Week 2: Core Business Logic**
- **Day 1-2**: Forum domain completion (move shared forum logic)
- **Day 3-4**: Economy/Wallet unification (consolidate financial logic)
- **Day 5**: Cross-domain dependency resolution

#### **Week 3-4: Client Alignment**
- **Day 1-2**: Features directory expansion (move scattered components)
- **Day 3-4**: Hooks consolidation (move to domain-specific locations)
- **Day 5**: Client-server type alignment

#### **Week 5: Schema & Final Cleanup**
- **Day 1-2**: Schema domain creation (auth, notifications, engagement)
- **Day 3-4**: Shared resource cleanup (move domain logic)
- **Day 5**: Validation and testing

## Success Metrics

### **Quantifiable Goals**
- **Server Domain Files**: Reduce from 390+ to <300 (eliminate duplication)
- **Admin Domain**: Reduce from 147 to <100 files (proper organization)
- **Client Features Coverage**: 100% of domains in features/ directory
- **Shared Logic**: Reduce domain-specific files in shared/ to 0
- **Type Coverage**: 100% of domains have dedicated types files

### **Quality Improvements**
- **Consistency**: Standard directory structure across all domains
- **Boundaries**: Clear separation between domain logic
- **Dependencies**: Minimal cross-domain coupling
- **Maintainability**: Easy to find and modify domain-specific code

## Risk Mitigation

### **Low-Risk Approach**
1. **One domain at a time**: Systematic, controlled changes
2. **Backup first**: Git branches for each phase
3. **Incremental validation**: Test after each domain cleanup
4. **Rollback ready**: Each phase can be reverted independently

### **Validation Strategy**
- **Build tests**: Ensure compilation after each phase
- **Type checking**: Verify type safety maintained
- **Linting**: Confirm no new violations introduced
- **Functional testing**: Smoke tests for each domain

This systematic approach will transform the current chaotic domain organization into a clean, maintainable, and scalable architecture while minimizing risk and ensuring continuous functionality.