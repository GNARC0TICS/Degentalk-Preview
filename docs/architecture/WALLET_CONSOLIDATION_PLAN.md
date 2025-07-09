# 🏦 Wallet Domain Clean-Slate Consolidation Plan  
**Version 2.0 — Zero-Toggle Edition** 🚀  
_Status: **APPROVED FOR EXECUTION**_  
_Target Timeline: **21 days** (3-week aggressive rebuild)_

---

## 📑 Executive Summary
• **Approach** – Build a brand-new, canonical wallet domain in parallel using a temporary TypeScript path alias.  
• **Cut-over** – Switch imports in a single atomic commit, then delete all legacy wallet code.  
• **Risk Level** – Low (no live users, pre-launch).  
• **CI Impact** – Always-green compile; teammates keep shipping other features.

---

## 🎯 Guiding Principles
1. **Always-Green CI** – Repository compiles, lints & tests on every commit.  
2. **Atomic Migration** – One commit flips the switch; no hybrid runtime.  
3. **Zero Feature Flags** – No headers/proxies.  
4. **Clean Architecture** – Adapters → Service → Controller → Routes.  
5. **Complete Elimination** – Legacy wallet code physically removed.  
6. **Test-First Adapters** – ≥ 90 % branch coverage on external-SDK wrappers.

---

## 📅 Timeline at a Glance
| Week | Focus | Key Milestones |
|------|-------|----------------|
| **0** | Foundation & Safety | Feature branch + temporary `@new-wallet/*` path alias; CI green |
| **1** | New Core | Shared types + transformer; adapters; service; controller; routes (`/wallet-v2`); 80 % adapter tests |
| **2** | Import Migration | Codemod imports; client API swap; admin facade wired; integration tests green |
| **3** | Cut-over & Purge | Rename folder; delete legacy; update tsconfig; validation scripts pass; docs merged |

---

## 🛠️ Detailed Task Checklists

### Week 0 — Foundation & Safety _(Days 1-2)_
1. **Branch Setup**  
   ```bash
   git checkout -b feat/wallet-refactor
   git push -u origin feat/wallet-refactor
   ```
2. **TypeScript Path Alias**  
   Add to *root* `tsconfig.json`:
   ```jsonc
   "paths": {
     "@new-wallet/*": ["server/src/domains/_new-wallet/*"],
     "@shared/*": ["shared/*"],
     "@db": ["db/index.ts"]
   }
   ```
3. **CI Validation** – run `pnpm typecheck`, `pnpm lint`, `pnpm test`, all validation scripts.

---

### Week 1 — New Core Implementation _(Days 3-7)_
#### 1 · Shared Foundation
| File | Purpose |
|------|---------|
| `shared/types/wallet/wallet.types.ts` | `WalletBalance`, `DepositAddress`, `DgtTransaction`, etc. |
| `shared/types/wallet/index.ts` | Barrel export |
| `shared/transformers/wallet.transformer.ts` | `toPublicBalance`, `toAuthenticatedBalance`, … |

#### 2 · Adapters (100 % external SDK isolation)
```
server/src/domains/_new-wallet/adapters/
└── ccpayment.adapter.ts
└── stripe.adapter.ts
└── cache.adapter.ts
```
Unit-test goal: **≥ 90 % branch coverage** per adapter.

#### 3 · Service & Controller
*All business rules in `wallet.service.ts`; controllers stay thin.*

#### 4 · Routes
*Mount new router at* `app.use('/api/wallet-v2', newWalletRoutes);`

---

### Week 2 — Import Migration _(Days 8-14)_
1. **Codemod Imports**  
   `scripts/migration/wallet-import-codemod.ts` replaces:
   - `domains/wallet/wallet.service` → `@new-wallet/wallet.service`  
   - `types/wallet` → `@shared/types/wallet`
2. **Route Registration Update**  
   Replace `/api/wallet` mount with new router (drop *-v2* suffix).
3. **Client Migration**  
   Create `client/src/domains/wallet/` (hooks, components, services).  
   Update API base paths & import statements.
4. **Admin Facade**  
   Admin controllers now inject the new `WalletService`; remove direct DB calls.
5. **Compile & Integration Tests**  
   Ensure `npx tsc --noEmit` passes; run integration tests covering: balances, deposits, transfer, withdraw, purchase.

---

### Week 3 — Atomic Cut-Over & Cleanup _(Days 15-21)_
1. **Rename Folder**  
   ```bash
   git mv server/src/domains/_new-wallet server/src/domains/wallet
   ```
   Remove path alias from `tsconfig`.
2. **Legacy Purge**  
   Delete listed legacy files & folders (see Kill List below).
3. **Tsconfig & ESLint Update**  
   Add `archive/**`, `UIVERSE/**`, etc. to `exclude` arrays.
4. **Validation & Tests**  
   - `pnpm typecheck` → 0 errors  
   - `pnpm lint` → 0 wallet lint errors  
   - `pnpm test` → all tests green  
   - Custom scripts: transformer-gate, no-orphan-bak, external-SDK guard.
5. **Performance Smoke Test**  
   Balance endpoint < 500 ms; cache hit > 80 %.
6. **Docs & ADR**  
   - `server/src/domains/wallet/README.md`  
   - `docs/architecture/ADR-2025-wallet-domain-consolidation.md`
7. **Merge PR**  
   Obtain 2 reviewer approvals.  
   Tag release `wallet-refactor-phase1`.

---

## 🗑️ Comprehensive Kill List (Week 3)
### Server
```
server/src/routes/wallet*        
server/src/routes/payments*      
server/src/domains/payments/     
server/src/services/wallet*      
```
### Client
```
client/src/components/economy/wallet/      
client/src/features/wallet/                
client/src/components/sidebar/wallet-summary-widget.tsx
client/src/types/wallet.ts
```
*(Paths compile-excluded or physically removed.)*

---

## ✅ Acceptance Criteria
- **Code Quality** – 0 TS & ESLint errors in wallet domain; ≥ 90 % adapter coverage.  
- **Functionality** – All endpoints operational; admin + client fully integrated.  
- **Architecture** – Single wallet implementation; adapters only place with Stripe/CCPayment imports; transformer used on every response.  
- **CI** – Transformer-gate, no-orphan-bak, external-SDK guard all green.  
- **Docs** – README + ADR merged.

---

## 🚀 Immediate Next Steps
1. Create feature branch & add path alias.  
2. Scaffold **shared types + transformer**.  
3. Implement adapters with tests (focus CCPayment auth & retry logic).  
4. Draft `wallet.service.ts` skeleton and push *PR #1* (Foundation).  
5. Notify parallel agents to start tasks T-1 … T-10.

> _"Build boldly, but keep the build green."_  
> — Degentalk Architecture Board 