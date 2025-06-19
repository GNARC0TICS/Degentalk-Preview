## Batch 5 – Integration & Hardening

### Cross-Layer Contract Enforcement

##### Problem

Backend controllers, DB schema, and frontend TypeScript models drift quickly; mismatched fields (`canHaveThreads`, `hotScore`, etc.) were found. Manual syncing is fragile.

##### Strengthening Actions

1.  - [ ] **Single Source of Types** – Use `drizzle-codegen` to emit `$schema.d.ts`, feed into `zod-to-ts`, and re-export via `forum-sdk` for both server and client.
2.  - [ ] **CI Contract Tests** – Add `schemaspec` Jest step: encode sample row → serialize → deserialize against API contract; fail PR on mismatch.
3.  - [ ] **OpenAPI Generation** – Leverage `express-zod-openapi`; serve docs at `/api/docs`.

---

### End-to-End Test Blueprint

1.  - [ ] **Playwright Scenarios**
    - [ ] Implement scenario: Visitor → zone → forum → thread (pagination).
    - [ ] Implement scenario: Logged-in user: create thread, reply, like, tip, mark solution.
    - [ ] Implement scenario: Admin locks forum → UI shows "Posting disabled".
2.  - [ ] **Seed Strategy** – Create dedicated `e2e.db`; implement reset via `scripts/testing/reset-db.ts` before run.

---

### Configurability Upgrades

| Concern           | Current State         | Upgrade Proposal                                                                          |
| ----------------- | --------------------- | ----------------------------------------------------------------------------------------- |
| Zone/forum themes | Hard-coded Tailwind   | - [ ] Implement DB-backed `ui_themes`. <br> - [ ] Allow override in Admin UI.             |
| XP multipliers    | Column on categories  | - [ ] Surface in Admin Panel. <br> - [ ] Cache in Redis.                                  |
| Tipping flag      | Boolean on categories | - [x] Respect in UI (front-end `useConfig` hook added). <br> - [ ] Respect in validators. |
| Prefix list       | DB table              | - [ ] Implement CRUD via Admin UI (including color picker).                               |

- [x] Front-end hook `useConfig()` returns **publicConfig** for easy access in components.
- [ ] All new settings flow through **Config Service** (`server/src/core/config.ts`).
- [ ] Cache settings.
- [ ] Publish settings via WebSocket for live re-theming.

---

### Bundling / DX Enhancements

1.  - [x] Treeshake Lucide icons (`lucide-react/Plus` imports or `vite-plugin-optimize-persist`).
2.  - [ ] Standardise React-Query cache keys in `forum-sdk`.
3.  - [ ] Create Storybook docs for ZoneCard, ThreadCard, PostCard.

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

| Area             | Status | Notes                                                     |
| ---------------- | ------ | --------------------------------------------------------- |
| Forum (backend)  | ✅     | Batches 1-5 cover controllers, routes, schema, migrations |
| Forum (frontend) | ✅     | Components, pages, hooks audited & optimisation plan      |
| Shared utilities | ✅     | Prefix/XP helpers, types included                         |
| Docs / Guides    | N/A    | Out of scope                                              |
