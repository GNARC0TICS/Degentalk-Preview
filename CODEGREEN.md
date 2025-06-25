# CODEGREEN – Parallel Fix Plan

> **Purpose**  
> Coordinate three agents working on branch `exp` without stepping on each other.  
> Each agent gets a non-overlapping responsibility set and should commit only within that scope.

---

## Commit Etiquette

1. Always `git pull --rebase` before starting a block of work.
2. Keep commits atomic & prefixed with your agent ID, e.g. `agent-1(alias): add vitest aliases`.
3. If you must touch a file owned by another agent, open a PR comment instead of committing.
4. Run `pnpm lint && pnpm test` before every push.

---

## Agent 1 – "Config & Exports Guru"

**Primary goal:** unblock the test runner by fixing path resolution and export mismatches.

### Task list

1. **Vitest alias patch**  
   └ `client/vitest.config.ts` – add `resolve.alias` mapping for `@shared/*` and `@/*`.
2. **Barrel alignment**  
   • Confirm `@/components/ui/index.ts` re-exports everything the app/tests import.  
   • Add missing exports or adjust imports.
3. **Component export fixes**  
   – `QuickReactions.tsx`, `CryptoEngagementBar.tsx`, any failing element-type tests.  
   – Ensure default vs named export consistency; update tests.
4. **Commit & push** with message prefix `agent-1(config)`.

> **DONE when** vitest no longer throws "type is invalid" for those components.

---

## Agent 2 – "Provider & Spec Doctor"

**Primary goal:** stabilise failing specs caused by missing context / outdated test logic.

### Task list

1. **Render helper**  
   └ Create `client/src/test/utils/renderWithProviders.tsx` that wraps:  
   • `QueryClientProvider` (tanstack/react-query)  
   • `MemoryRouter` (wouter)  
   • Any theme / context providers needed for components.
2. **Test setup**  
   – Ensure global stubs for `crypto.randomUUID`, existing `matchMedia` & `ResizeObserver` remain intact.
3. **Update specs**  
   – Refactor shoutbox, engagement bar, thread card, etc. to use `renderWithProviders`.
4. **Breakpoint tests**  
   – Replace `await import()` hacks with `vi.mock` for `useMediaQuery` & update expected `current` order.
5. **Commit & push** with prefix `agent-2(spec-fix)`.

> **DONE when** all component specs pass except admin-modules.

---

## Agent 3 – "Admin Module & CI Finisher"

**Primary goal:** close remaining test gaps, ensure lint passes, wire up CI.

### Task list

1. **Alias in tests**  
   – After Agent 1 alias patch, fix `src/__tests__/admin-modules.test.ts` import path if still failing.
2. **Async-await esbuild errors**  
   – Update `AdaptiveForumGrid.test.tsx`, `ResponsiveForumLayout.test.tsx` to use `vi.mock` instead of dynamic `await import()`.
3. **QueryClient provider in remaining specs** (if any)—reuse Agent 2 helper.
4. **Lint sweep**  
   – Run `pnpm lint`; fix new errors, leave warnings.
5. **GitHub Action**  
   – Add workflow `.github/workflows/ci.yml` that runs install, lint, test on pull-requests.
6. **Docs update**  
   – Append alias table & provider guidelines to `docs/admin-panel-audit-2025-06-17.md`.
7. **Commit & push** with prefix `agent-3(ci)`.

> **DONE when** `pnpm lint` and `pnpm test` both exit 0 locally and on CI.

---

### Final Merge Protocol

1. Agents ping team when their checklist is green.
2. Last agent to finish re-runs full suite, rebases if necessary, then opens PR `exp → main`.
3. Squash-merge with message **"feat: admin-modular baseline green"**.

Good luck – coordinate in chat, respect file ownership, keep the tree green! ✨
