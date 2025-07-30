# CODEBASE_RULES.md – Quick-Scan Rules for All Agents

> Read this *before* touching the code.  Every line is enforced by automated hooks.

---
## 0. One-Screen TL;DR  
(If you memorise nothing else, memorise this.)

✅ Use **repository pattern** – all DB queries live in `*.repository.ts`.  
✅ Cross-domain communication **only via EventBus**.  
✅ Use path aliases (`@/`, `@core/`, `@domains/`, `@shared/`) – no deep relative imports.  
✅ Return DTOs via transformer functions (`toPublicX`, `toAdminX`, …).  
✅ Validate input with Zod; validate IDs with `isValidId()`.

❌ Never call `pnpm db:push`.  
❌ No `console.*` – use `logger.*`.  
❌ No `@ts-ignore`, `@ts-nocheck`, or `as any` band-aids.  
❌ No direct DB access inside services.  
❌ No cross-domain internal imports (`../wallet/wallet.service`).  
❌ No new files without approval during lockdown phase.

---
## 1. Workspace & Path Aliases

| Workspace | Path Alias | Notes |
|-----------|------------|-------|
| client/   | `@/`       | React-only; **do not** use in server code |
| server/   | `@core/`, `@domains/`, `@middleware/`, `@utils/`, `@lib/` |
| shared/   | `@shared/` | Must include `.js` extension when importing within shared |
| db/       | `@db`, `@schema` |

Forbidden aliases: `@app/`, `@server/`, `@api/`.

---
## 2. Backend Domain Rules (`server/src/domains`)  
(Mandatory for repository & event-driven patterns)

```
[domain]/
├─ index.ts               // exported public API only
├─ [domain].service.ts    // business logic – NO database calls
├─ [domain].repository.ts // *all* database queries
├─ events.ts              // domain events enum
├─ handlers/              // EventBus listeners
└─ transformer.ts         // toPublic / toAdmin DTO builders
```

• **Repository Pattern:** Services must inject & call repositories.  
• **Boundaries:** Import other domains *only* via their index.ts; otherwise emit events.

---
## 3. Frontend Import Rules (client)

```
✅ import { Button } from '@/components/ui/button'
❌ import Button from '../components/ui/button'         // no deep relatives
```

Compound/slot/provider patterns are preferred; see `always_applied_workspace_rules` for examples.

---
## 4. TypeScript Conventions

• Branded IDs live in `@shared/types/ids`.  
  ```ts
  type ThreadId = Id<'Thread'>;
  if (isValidId(threadId)) { … }
  ```
• Hooks ban `any` except for approved CCPayment glue code.  
• Use `import type` for pure types to avoid ESM runtime errors.

---
## 5. Transformer Gate (server routes)

Every Express route must serialise data through a transformer:
```ts
router.get('/:threadId', async (req, res) => {
  const dbRow = await threadRepository.find(req.params.threadId);
  res.json(toPublicThread(dbRow)); // ✅
});
```
`res.json(rawDbRow)` is blocked by ESLint rule `degen/no-raw-response`.

---
## 6. Hooks & CI Guardrails (auto-enforced)

Pre-edit hooks run on every tool call:
- `enforce-repository-pattern`  
- `enforce-domain-boundaries`  
- `no-any-types`, `no-console`, `validate-imports`, `check-branded-ids`, …  

Post-edit hooks:
- `cleanup-debug-artifacts`, `final-cleanup-reminder`

SessionStart hooks:
- `cat CLAUDE.md` (primer)
- `cat CODEBASE_RULES.md` (this file)

Nightly CI (`pnpm lint && pnpm typecheck && pnpm test`) must be 0-error green.

---
## 7. Database & Migrations

• Use **Neon** connection string.  
• Generate SQL via Drizzle migrations; run with `pnpm db:migrate`.  
• Field rename: `threads.categoryId` → `threads.structureId` (legacy code fix).

---
## 8. Glossary & Naming

| Term   | Use | Deprecated |
|--------|-----|------------|
| forum  | ✅  | zone       |
| wallet | ✅  | purse      |

---
## 9. Quick Checklist Before Commit

- [ ] No direct DB in services  
- [ ] All new exports re-exported in domain `index.ts`  
- [ ] No console.* left  
- [ ] ESLint & tsc pass locally  
- [ ] If breaking public API, update snapshot & changelog

---
_End of rules._ 