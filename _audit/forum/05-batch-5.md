## Batch 5 – Integration & Hardening

### Cross-Layer Contract Enforcement

##### Problem
Backend controllers, DB schema, and frontend TypeScript models drift quickly; mismatched fields (`canHaveThreads`, `hotScore`, etc.) were found. Manual syncing is fragile.

##### Strengthening Actions
1. **Single Source of Types** – Use `drizzle-codegen` to emit `$schema.d.ts`, feed into `zod-to-ts`, and re-export via `forum-sdk` for both server and client.
2. **CI Contract Tests** – Add `schemaspec` Jest step: encode sample row → serialize → deserialize against API contract; fail PR on mismatch.
3. **OpenAPI Generation** – Leverage `express-zod-openapi`; serve docs at `/api/docs`.

---

### End-to-End Test Blueprint

1. **Playwright Scenarios**
   a. Visitor → zone → forum → thread (pagination).  
   b. Logged-in user: create thread, reply, like, tip, mark solution.  
   c. Admin locks forum → UI shows "Posting disabled".
2. **Seed Strategy** – Dedicated `e2e.db`; reset via `scripts/testing/reset-db.ts` before run.

---

### Configurability Upgrades

| Concern | Current State | Upgrade Proposal |
|---------|---------------|------------------|
| Zone/forum themes | Hard-coded Tailwind | DB-backed `ui_themes`, overridable in Admin UI |
| XP multipliers | Column on categories | Surface in Admin Panel; cache in Redis |
| Tipping flag | Boolean on categories | Respect in UI & validators |
| Prefix list | DB table | CRUD via Admin UI (color picker) |

All new settings flow through **Config Service** (`server/src/core/config.ts`), cached & published via WebSocket for live re-theming.

---

### Bundling / DX Enhancements

1. Treeshake Lucide icons (`lucide-react/Plus` imports or `vite-plugin-optimize-persist`).
2. Standardise React-Query cache keys in `forum-sdk`.
3. Storybook docs for ZoneCard, ThreadCard, PostCard.

---

### Shipping Checklist
- [ ] Duplicates removed / aliased.
- [ ] `forum-sdk` published locally.
- [ ] `npm run lint --workspace=server` passes (no `console.log`).
- [ ] Migrations patched to `IDENTITY`.
- [ ] Playwright suite green.
- [ ] Vite build size diff < 50 KB gzip.
- [ ] README updated.

---

### Coverage Map (Post-Batch 5)

| Area | Status | Notes |
|------|--------|-------|
| Forum (backend) | ✅ | Batches 1-5 cover controllers, routes, schema, migrations |
| Forum (frontend) | ✅ | Components, pages, hooks audited & optimisation plan |
| Shared utilities | ✅ | Prefix/XP helpers, types included |
| Docs / Guides | N/A | Out of scope | 